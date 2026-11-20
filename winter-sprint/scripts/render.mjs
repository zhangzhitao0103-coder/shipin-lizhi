// Frame-by-frame renderer (headless Chromium → ffmpeg).
//   node scripts/render.mjs --events            dump visual beats to assets/events.json (for the SFX track)
//   node scripts/render.mjs --stills 1.5,9,30   PNG stills → output/preview/
//   node scripts/render.mjs [--workers 3]       full video → output/winter_sprint_60s_1080x1920.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30, DUR = 60, W = 1080, H = 1920;
const OUT = path.join(ROOT, 'output', 'winter_sprint_60s_1080x1920.mp4');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/src/index.html`;
const browser = await chromium.launch();

async function openPage() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.error('[page error]', e.message); process.exitCode = 1; });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.ready);
  return page;
}

function ffmpeg(argsList) {
  const p = spawn('ffmpeg', argsList, { stdio: ['pipe', 'inherit', 'inherit'] });
  p.done = new Promise((r, j) => p.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))));
  return p;
}

if (args.includes('--events')) {
  const page = await openPage();
  const data = await page.evaluate(() => ({ events: window.EVENTS, times: window.TIMES }));
  fs.writeFileSync(path.join(ROOT, 'assets', 'events.json'), JSON.stringify(data, null, 1));
  console.log(`assets/events.json: ${data.events.length} events`);
} else if (opt('--stills')) {
  const page = await openPage();
  const dir = path.join(ROOT, 'output', 'preview');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of opt('--stills').split(',').map(Number)) {
    await page.evaluate((tt) => window.renderFrame(tt), t);
    await page.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`) });
  }
  console.log('stills →', dir);
} else {
  const MIX = path.join(ROOT, 'assets', 'mix.wav');
  if (!fs.existsSync(MIX)) throw new Error('assets/mix.wav missing – run scripts/mix.sh first');
  const workers = +opt('--workers', 3), total = FPS * DUR, per = Math.ceil(total / workers);
  const tmp = path.join(ROOT, 'frames'); fs.mkdirSync(tmp, { recursive: true });
  const t0 = Date.now(); let doneFrames = 0;
  const parts = await Promise.all([...Array(workers).keys()].map(async (w) => {
    const page = await openPage();
    const a = w * per, b = Math.min(total, a + per);
    const file = path.join(tmp, `part${w}.mp4`);
    const ff = ffmpeg(['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '60', file]);
    for (let i = a; i < b; i++) {
      await page.evaluate((tt) => window.renderFrame(tt), i / FPS);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (++doneFrames % 150 === 0) console.log(`${doneFrames}/${total} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await ff.done; await page.close();
    return file;
  }));
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const mux = ffmpeg(['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', MIX,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-t', String(DUR), '-movflags', '+faststart', OUT]);
  mux.stdin.end(); await mux.done;
  console.log('wrote', OUT, `in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
server.close();
