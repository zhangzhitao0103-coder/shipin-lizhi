// 用法：node tools/build.js C1 [--preview 1.2,5,9.5] [--skip-tts] [--skip-frames] [--workers 3]
// 环境变量：PY（带 sherpa-onnx 的 python）、MODELS（语音模型目录）
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const id = args[0];
const opt = name => { const i = args.indexOf('--' + name); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const PY = process.env.PY || 'python3';
const MODELS = process.env.MODELS || '';
const FPS = 30;
const ENDCARD = 4.2;

const ep = require(path.join(ROOT, 'episodes', id + '.js'));
const B = path.join(ROOT, 'build', id);
fs.mkdirSync(B, { recursive: true });
const run = (cmd, a, env = {}) => execFileSync(cmd, a, { stdio: 'inherit', env: { ...process.env, ...env } });

// 1. AI 配音：每个节拍一段
if (!opt('skip-tts')) {
  fs.writeFileSync(path.join(B, 'beats.json'), JSON.stringify(ep.beats.map(b => ({ id: b.id, voice: b.voice || '', sid: b.sid, speed: b.speed, prompt: b.prompt })), null, 1));
  // 每集可在脚本里指定音色：voice: { sid, speed }；环境变量优先
  const v = ep.voice || {};
  run(PY, ['-I', path.join(ROOT, 'tools', 'tts.py'), MODELS, B], {
    VOICE_SID: process.env.VOICE_SID || String(v.sid ?? 58), VOICE_SPEED: process.env.VOICE_SPEED || String(v.speed ?? 1.05),
    VOICE_ENGINE: process.env.VOICE_ENGINE || v.engine || 'kokoro', VOICE_PROMPT: process.env.VOICE_PROMPT || v.prompt || 'male' });
}
const vdur = JSON.parse(fs.readFileSync(path.join(B, 'voice', 'durations.json'), 'utf8'));

// 2. 时间轴：节拍时长 = max(最短时长, 配音时长 + 前后留白)
// 剧集可设 tempo（如 1.5）：画面按"设计时长"绘制，再按实际时长等比压缩播放（动画、字幕、音效位置一起加快）
const TEMPO = ep.tempo || 1;
const VOICE_DELAY = TEMPO > 1 ? 0.1 : 0.2, TAIL = TEMPO > 1 ? 0.22 : 0.42;
let t = 0, td = 0;
const beats = {}, design = {}, order = [], sfx = [], voice = [];
for (const b of ep.beats) {
  const vd = vdur[b.id] || 0;
  const d = Math.max((b.min || 2) / TEMPO, vd ? vd + VOICE_DELAY + TAIL + (b.pad || 0) : 0);   // pad：配音后额外留白（秒）
  const dd = TEMPO > 1 ? Math.max(b.min || 2, d * TEMPO) : d;
  beats[b.id] = { s: +t.toFixed(3), e: +(t + d).toFixed(3), d: +d.toFixed(3) };
  design[b.id] = { s: +td.toFixed(3), e: +(td + dd).toFixed(3), d: +dd.toFixed(3) };
  order.push(b.id);
  if (vd) voice.push({ id: b.id, at: +(t + VOICE_DELAY).toFixed(3) });
  // 音效位置：at 为设计时间（随 tempo 压缩）；atFrac 为占本节拍的比例（与配音同步）
  for (const s of b.sfx || []) sfx.push({ ...s, at: +(t + (s.atFrac != null ? s.atFrac * d : s.at * (d / dd))).toFixed(3), beat: b.id });
  t += d; td += dd;
}
// 音效时长：'beat' = 到本节拍结束；'until:xxx' = 到指定节拍结束
for (const s of sfx) {
  if (s.dur === 'beat') s.dur = +(beats[s.beat].e - s.at).toFixed(3);
  else if (typeof s.dur === 'string' && s.dur.startsWith('until:')) s.dur = +(beats[s.dur.slice(6)].e - s.at).toFixed(3);
}
const endcard = { s: +t.toFixed(3), d: ENDCARD };
sfx.push({ type: 'brand', at: +(t + 0.75).toFixed(3) });
const total = +(t + ENDCARD).toFixed(3);
const timeline = {
  id, title: ep.title, fps: FPS, total, beats, order, endcard, sfx, voice,
  ...(TEMPO > 1 ? { design: { beats: design, endcard: { s: +td.toFixed(3), d: ENDCARD } } } : {}),
  music: { ...ep.music, sections: order.map(k => { const d = ep.beats.find(x => x.id === k); return { id: k, s: beats[k].s, e: beats[k].e, mood: d.mood ?? 0.5, gain: d.musicGain ?? 1, hush: d.hush || 0 }; }) },
};
fs.writeFileSync(path.join(B, 'timeline.json'), JSON.stringify(timeline, null, 1));
console.log(`[${id}] 总时长 ${total.toFixed(1)}s，节拍 ${order.length} 个`);

async function render(times, outName) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const workers = Number(opt('workers') || 3);
  const pages = [];
  for (let k = 0; k < Math.min(workers, times.length); k++) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.error('pageerror', e.message));
    page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
    await page.goto('file://' + path.join(ROOT, 'web', 'index.html'));
    const r = await page.evaluate(([u, tl]) => window.__setup(u, tl), ['file://' + path.join(ROOT, 'episodes', id + '.js'), timeline]);
    if (k === 0) console.log('fonts loaded:', r.fonts);
    pages.push(page);
  }
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async page => {
    while (next < times.length) {
      const i = next++; const [tt, f] = times[i];
      await page.evaluate(([a, b]) => window.__render(a, b), [tt, f]);
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      fs.writeFileSync(outName(i, tt), buf);
      if (++done % 150 === 0) console.log(`  ${done}/${times.length} 帧  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
  await browser.close();
}

(async () => {
  const pv = opt('preview');
  if (pv) {
    const ts = (pv === true ? ep.beats.map(b => beats[b.id].s + beats[b.id].d * 0.7) : String(pv).split(',').map(Number));
    fs.mkdirSync(path.join(B, 'preview'), { recursive: true });
    await render(ts.map((x, i) => [x, i]), (i, tt) => path.join(B, 'preview', `p${String(i).padStart(2, '0')}_${tt.toFixed(2)}.jpg`));
    console.log('预览帧已输出到', path.join(B, 'preview'));
    return;
  }
  const FR = path.join(B, 'frames');
  if (!opt('skip-frames')) {
    fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
    const n = Math.round(total * FPS);
    await render(Array.from({ length: n }, (_, f) => [f / FPS, f]), i => path.join(FR, `${String(i).padStart(5, '0')}.jpg`));
    run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(FR, '%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(B, 'video.mp4')]);
  }
  // 3. 音乐 + 音效 + 配音混音
  run(PY, ['-I', path.join(ROOT, 'tools', 'audio.py'), B]);
  const OUT = path.join(ROOT, 'out'); fs.mkdirSync(OUT, { recursive: true });
  const name = `${id}_${ep.title}`;
  for (const [mix, suffix] of [['mix_silent.wav', '无配音'], ['mix_voice.wav', 'AI配音']]) {
    run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(B, 'video.mp4'), '-i', path.join(B, mix),
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(OUT, `${name}_${suffix}.mp4`)]);
  }
  // 封面：取指定节拍的中段画面
  const cb = beats[ep.cover] || beats[order[0]];
  const cf = Math.round((cb.s + Math.min(1.8, cb.d * 0.7)) * FPS);
  fs.copyFileSync(path.join(FR, `${String(cf).padStart(5, '0')}.jpg`), path.join(OUT, `${name}_封面.jpg`));
  // 逐帧图片约占 300 MB/条，成片和封面导出后即删除（--keep-frames 可保留）
  if (!opt('keep-frames')) fs.rmSync(FR, { recursive: true, force: true });
  console.log('完成：', path.join(OUT, name + '_*.mp4'));
})().catch(e => { console.error(e); process.exit(1); });
