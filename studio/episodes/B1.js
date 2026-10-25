// B1《寒假第一天就停下？》迈出第一步类 · 蓝图工程风
// 物理锚点：最大静摩擦力略大于滑动摩擦力（课本"摩擦力随拉力变化"图像）。数值 50 N / 30 N 为示意
(function (root) {
  const FMAX = 50, FK = 30;

  const EP = {
    id: 'B1',
    title: '寒假第一天就停下',
    theme: 'blueprint',
    voice: { sid: 90 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 96, chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'Em', 'C', 'D'] },
    cover: 'max',
    beats: [
      { id: 'hook', min: 3.0, cap: ['寒假第一天，', '你打算{先休息一下}？'], voice: '寒假第一天，你打算先休息一下？', mood: 0.3 },
      { id: 'push', min: 3.6, cap: ['推一个静止的箱子：', '推力从 0 开始，慢慢加大——'], voice: '推一个静止的箱子，推力从零开始，慢慢加大。', mood: 0.45, sfx: [{ at: 0.3, type: 'riser', dur: 3.0 }] },
      { id: 'max', min: 3.0, cap: ['加到 {50 N}，', '箱子才终于动了。'], voice: '加到五十牛，箱子才终于动了。', mood: 0.8, sfx: [{ at: 0.4, type: 'boom' }] },
      { id: 'moving', min: 3.4, cap: ['动起来以后，', '只要 {30 N} 就能让它继续走。'], voice: '动起来以后，只要三十牛，就能让它继续走。', mood: 0.6 },
      { id: 'why', min: 3.2, cap: ['因为：最大静摩擦力，', '比滑动摩擦力{更大}。'], voice: '因为，最大静摩擦力，比滑动摩擦力更大。', mood: 0.5 },
      { id: 'flip', min: 3.0, cap: ['学习也一样：', '停下来再启动，[最费力]。'], voice: '学习也一样，停下来再启动，最费力。', mood: 0.55 },
      { id: 'tip', min: 3.6, cap: ['寒假每天哪怕只学 {1 小时}，', '也别让自己{完全停下来}。'], voice: '寒假每天哪怕只学一小时，也别让自己完全停下来。', mood: 0.75 },
      { id: 'action', min: 2.8, cap: null, voice: '别停，动着最省力。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '推力摩擦力静滑动最大时间示意数值略大于NFf=箱子图号比例别停动着最省力0123456789',
  };

  // 推力 F 与摩擦力 f、箱子位移
  function stateAt(t, TL, E) {
    const b = id => TL.b(id);
    const p0 = b('push').s, m0 = b('max').s, v0 = b('moving').s;
    let F = 0, f = 0, x = 0, slip = false;
    if (t >= p0 && t < m0) { F = 45 * E.seg(t, p0 + 0.3, b('push').e); f = F; }
    else if (t >= m0 && t < m0 + 0.5) { F = 45 + 5 * E.seg(t, m0, m0 + 0.5); f = F; }
    else if (t >= m0 + 0.5) { slip = true; F = E.lerp(FMAX, FK, E.ease.out(E.seg(t, m0 + 0.5, m0 + 0.9))); f = FK; x = (t - (m0 + 0.5)) * 60; }
    return { F, f, x: Math.min(x, 300), slip };
  }

  const GX0 = 190, GX1 = 900, GY0 = 1050, GY1 = 1440;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4)) * (1 - E.seg(t, b('tip').s - 0.1, b('tip').s + 0.3));
    const st = stateAt(t, TL, E);
    ctx.save(); ctx.globalAlpha = sceneA;
    // 地面与箱子
    const floor = 880, bx = 380 + st.x, bw = 180, bh = 140;
    ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(120, floor); ctx.lineTo(960, floor); ctx.stroke();
    for (let x = 130; x < 960; x += 30) { ctx.beginPath(); ctx.moveTo(x, floor); ctx.lineTo(x - 16, floor + 16); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(bx, floor - bh, bw, bh); ctx.strokeRect(bx, floor - bh, bw, bh);
    ctx.beginPath(); ctx.moveTo(bx, floor - bh); ctx.lineTo(bx + bw, floor); ctx.moveTo(bx + bw, floor - bh); ctx.lineTo(bx, floor); ctx.globalAlpha = sceneA * 0.3; ctx.stroke(); ctx.globalAlpha = sceneA;
    // 推力箭头
    if (st.F > 0.5) {
      const L = st.F * 4.2, y = floor - bh / 2;
      ctx.strokeStyle = th.gold; ctx.fillStyle = th.gold; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(bx - L - 10, y); ctx.lineTo(bx - 34, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 8, y); ctx.lineTo(bx - 40, y - 18); ctx.lineTo(bx - 40, y + 18); ctx.fill();
      ctx.font = `700 40px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText('F = ' + Math.round(st.F) + ' N', bx - 20, y - 40);
      // 摩擦力（地面上，反向）
      const Lf = st.f * 4.2;
      ctx.strokeStyle = th.red; ctx.fillStyle = th.red; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(bx + bw / 2, floor + 40); ctx.lineTo(bx + bw / 2 - Lf, floor + 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw / 2 - Lf - 10, floor + 40); ctx.lineTo(bx + bw / 2 - Lf + 20, floor + 26); ctx.lineTo(bx + bw / 2 - Lf + 20, floor + 54); ctx.fill();
      ctx.font = `700 30px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('f = ' + Math.round(st.f) + ' N', bx + bw / 2 + 12, floor + 52);
      ctx.fillStyle = th.dim; ctx.font = `500 26px "Noto Sans SC"`; ctx.fillText(st.slip ? '滑动摩擦' : '静摩擦', bx + bw / 2 + 12, floor + 92);
    }
    // 摩擦力 - 时间图
    const gA = E.seg(t, b('push').s + 0.2, b('push').s + 0.7);
    if (gA > 0) {
      ctx.globalAlpha = sceneA * gA; ctx.strokeStyle = th.fg; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY0 - 20); ctx.lineTo(GX0, GY1); ctx.lineTo(GX1, GY1); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 26px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('摩擦力 f', GX0 + 12, GY0 - 10); ctx.textAlign = 'right'; ctx.fillText('时间 →', GX1, GY1 + 44);
      const Y = v => GY1 - (v / 60) * (GY1 - GY0);
      ctx.setLineDash([8, 8]); ctx.strokeStyle = th.dim; ctx.lineWidth = 1.5;
      [FK, FMAX].forEach(v => { ctx.beginPath(); ctx.moveTo(GX0, Y(v)); ctx.lineTo(GX1, Y(v)); ctx.stroke(); ctx.fillStyle = th.dim; ctx.textAlign = 'right'; ctx.font = `500 22px ${th.mono}`; ctx.fillText(v + ' N', GX0 - 10, Y(v) + 8); });
      ctx.setLineDash([]);
      // 曲线：按"真实时间"画到当前
      const t0 = b('push').s + 0.3, t1 = b('why').e, X = tt => GX0 + ((tt - t0) / (t1 - t0)) * (GX1 - GX0);
      ctx.beginPath(); let first = true;
      for (let tt = t0; tt <= Math.min(t, t1); tt += 0.04) { const s = stateAt(tt, TL, E); const x = X(tt), y = Y(s.f); first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
      ctx.strokeStyle = th.goldHi; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 16; ctx.stroke(); ctx.shadowBlur = 0;
      const wy = E.seg(t, b('why').s + 0.3, b('why').s + 0.8);
      if (wy > 0) {
        ctx.globalAlpha = sceneA * wy; ctx.fillStyle = th.red; ctx.font = `700 32px "Noto Sans SC"`; ctx.textAlign = 'center';
        const px = X(b('max').s + 0.5);
        ctx.fillText('最大静摩擦力', px, Y(FMAX) - 26); ctx.fillStyle = th.goldHi; ctx.fillText('滑动摩擦力', (px + GX1) / 2 + 40, Y(FK) - 22);
      }
      ctx.globalAlpha = sceneA * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('数值为示意：最大静摩擦力略大于滑动摩擦力', 540, 1560);
    }
    ctx.restore();
    // 小贴士：每天 1 小时
    const tp = b('tip');
    const tA = E.seg(t, tp.s + 0.2, tp.s + 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (tA > 0) {
      ctx.save(); ctx.globalAlpha = tA;
      for (let i = 0; i < 23; i++) {
        const p = E.seg(t, tp.s + 0.4 + i * 0.06, tp.s + 0.6 + i * 0.06);
        const x = 150 + (i % 8) * 100, y = 860 + Math.floor(i / 8) * 120;
        ctx.globalAlpha = tA * (0.25 + 0.75 * p); ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.strokeRect(x, y, 80, 80);
        ctx.fillStyle = th.gold; ctx.fillRect(x + 8, y + 80 - 64 * p - 8, 64, 64 * p);
      }
      ctx.globalAlpha = tA; ctx.fillStyle = th.fg; ctx.font = `700 36px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('23 天 × 1 小时 = 一直在动', 540, 1280);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别停，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{动着}最省力。', 540, 1030, { theme: th, size: 110, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
