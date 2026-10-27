// B5《惯性：不动的东西，会一直不动》迈出第一步类 · 像素游戏风
// 物理锚点：牛顿第一定律——物体不受外力（合外力为零）时，保持静止或匀速直线运动状态
(function (root) {
  const EP = {
    id: 'B5',
    title: '不动的东西会一直不动',
    theme: 'pixel',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 112, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'push',
    beats: [
      { id: 'hook', min: 3.4, cap: ['为什么"等我想学了再学"，', '那一天{总也不来}？'], voice: '为什么等我想学了再学，那一天，总也不来？', mood: 0.3, sfx: [{ at: 0.6, type: 'ticks', n: 20, gap: 0.12 }] },
      { id: 'law', min: 4.2, cap: ['牛顿第一定律：没有外力，', '静止的物体，会{一直静止}。'], voice: '牛顿第一定律，没有外力，静止的物体，会一直静止。', mood: 0.4 },
      { id: 'you', min: 3.6, cap: ['状态也有惯性：', '躺着的时候，只想[继续躺着]。'], voice: '状态也有惯性，躺着的时候，只想继续躺着。', mood: 0.35 },
      { id: 'push', min: 4.6, cap: ['打破它，需要一个{外力}：', '一个闹钟、一张计划表、一个同伴。'], voice: '打破它，需要一个外力。一个闹钟，一张计划表，一个同伴。', mood: 0.7, sfx: [{ at: 1.9, type: 'tick' }, { at: 2.7, type: 'tick' }, { at: 3.6, type: 'tick' }, { at: 4.2, type: 'boom' }] },
      { id: 'move', min: 3.6, cap: ['而一旦动起来，', '惯性也会帮你{一直动下去}。'], voice: '而一旦动起来，惯性也会帮你，一直动下去。', mood: 0.9 },
      { id: 'action', min: 3.0, cap: null, voice: '今天，给自己一个外力。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '状态静止运动中躺着第天合外力闹钟计划表同伴牛顿第一定律今天给自己一个IDLEMOVINGDAYSTATEFv=0123456789',
  };

  const GY = 1320;
  // 像素小人：站立 / 躺下 / 跑步
  function hero(g, x, y, pose, t, th) {
    g.fillStyle = th.gold;
    if (pose === 'lie') {
      g.fillStyle = '#4C3F8F'; g.fillRect(x - 120, y - 40, 240, 40);                  // 床
      g.fillStyle = th.gold; g.fillRect(x - 100, y - 72, 48, 40); g.fillRect(x - 52, y - 64, 136, 28);
      g.fillStyle = th.fg; g.font = `900 40px ${th.mono}`; g.textAlign = 'left'; g.fillText('Z', x + 70, y - 110 - (Math.floor(t * 2) % 2) * 16); g.fillText('z', x + 110, y - 150 - (Math.floor(t * 2 + 1) % 2) * 12);
      return;
    }
    const leg = pose === 'run' ? (Math.floor(t * 8) % 2 ? 16 : -16) : 0;
    g.fillRect(x - 24, y - 168, 48, 48);           // 头
    g.fillRect(x - 32, y - 112, 64, 64);           // 身体
    g.fillRect(x - 28 + leg, y - 48, 20, 48); g.fillRect(x + 8 - leg, y - 48, 20, 48);  // 腿
    g.fillStyle = th.bg; g.fillRect(x + 4, y - 152, 8, 8);                                  // 眼睛
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const hk = b('hook'), lw = b('law'), yo = b('you'), pu = b('push'), mv = b('move');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const moving = t > pu.s + 4.2;
    E.pixelate(ctx, th.pixel, g => {
      g.globalAlpha = sceneA;
      // 地面
      g.fillStyle = '#3A3466'; g.fillRect(0, GY, 1080, 16);
      for (let x = 0; x < 1080; x += 64) { g.fillStyle = '#2E2952'; g.fillRect(x - ((moving ? (t - pu.s - 4.2) * 400 : 0) % 64), GY + 16, 32, 16); }
      // 状态面板
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(120, 560, 840, 150);
      g.font = `900 34px ${th.mono}`; g.textAlign = 'left'; g.fillStyle = th.dim; g.fillText('STATE', 160, 620);
      g.fillStyle = moving ? th.green : th.red; g.font = `900 46px "Noto Sans SC"`;
      g.fillText(moving ? 'MOVING 运动中' : t > yo.s ? 'IDLE 躺着' : 'IDLE 静止', 160, 680);
      g.textAlign = 'right'; g.fillStyle = th.dim; g.font = `900 34px ${th.mono}`; g.fillText('v', 920, 620);
      g.fillStyle = moving ? th.green : th.fg; g.font = `900 46px ${th.mono}`; g.fillText(moving ? '→ → →' : '0', 920, 680);
      // 开头：天数飞快地过去，人一动不动
      if (t < lw.s + 0.3) {
        const day = 1 + Math.floor(E.seg(t, hk.s + 0.6, hk.e) * 29);
        g.globalAlpha = sceneA * (1 - E.seg(t, lw.s, lw.s + 0.3)); g.fillStyle = th.fg; g.font = `900 64px ${th.mono}`; g.textAlign = 'center';
        g.fillText('DAY ' + day, 540, 880); g.globalAlpha = sceneA;
      }
      // 合外力 = 0
      const fA = E.seg(t, lw.s + 0.4, lw.s + 0.8) * (1 - E.seg(t, yo.s, yo.s + 0.3));
      if (fA > 0) { g.globalAlpha = sceneA * fA; g.fillStyle = th.blue; g.font = `900 64px "Noto Sans SC"`; g.textAlign = 'center'; g.fillText('合外力 = 0', 540, 900); g.globalAlpha = sceneA; }
      // 主角
      const hx = 540, pose = moving ? 'run' : t > yo.s && t < pu.s + 4.2 ? 'lie' : 'stand';
      if (t < yo.s) { g.fillStyle = th.gold; g.fillRect(440, GY - 200, 200, 200); g.fillStyle = th.bg; g.font = `900 40px "Noto Sans SC"`; g.textAlign = 'center'; g.fillText('静止的', 540, GY - 110); g.fillText('物体', 540, GY - 60); }
      else hero(g, hx, GY, pose, t, th);
      // 三个外力
      const items = [['闹钟', th.red], ['计划表', th.blue], ['同伴', th.green]];
      items.forEach(([name, col], i) => {
        const a = E.seg(t, pu.s + 1.8 + i * 0.85, pu.s + 2.1 + i * 0.85) * (1 - E.seg(t, mv.s, mv.s + 0.4));
        if (a <= 0) return;
        const x = 200 + i * 340, y = 960;
        g.globalAlpha = sceneA * a; g.fillStyle = col; g.fillRect(x - 70, y - 70, 140, 140);
        g.fillStyle = th.bg; g.font = `900 36px "Noto Sans SC"`; g.textAlign = 'center'; g.fillText(name, x, y + 12);
        // 力的箭头
        const ar = E.seg(t, pu.s + 4.0, pu.s + 4.2);
        if (ar > 0) { g.fillStyle = col; g.fillRect(x - 8, y + 80, 16, 80 * ar); }
        g.globalAlpha = sceneA;
      });
      if (t > pu.s + 4.0 && t < mv.s + 0.4) { g.globalAlpha = sceneA * (1 - E.seg(t, mv.s, mv.s + 0.4)); g.fillStyle = th.goldHi; g.font = `900 80px ${th.mono}`; g.textAlign = 'center'; g.fillText('F!', 540, 1170); g.globalAlpha = sceneA; }
      // 动起来之后：速度线
      if (moving) { g.fillStyle = th.fg; for (let k = 0; k < 5; k++) { const yy = GY - 40 - k * 32; const off = ((t * 900 + k * 130) % 500); g.fillRect(380 - off * 0.5, yy, 80, 8); } }
    });
    ctx.save(); ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 22px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('牛顿第一定律：不受外力时，物体保持静止或匀速直线运动', 540, 1440); ctx.restore();
    const ac = b('action');
    if (t > ac.s) E.pixelate(ctx, th.pixel, g => {
      E.rich(g, '今天，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(g, '{给自己一个外力}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.4 });
    });
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
