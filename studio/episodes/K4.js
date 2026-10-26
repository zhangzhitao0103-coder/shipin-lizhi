// K4《别把孩子的弹簧拉坏了》家长类 · 极简白
// 物理锚点：胡克定律 F = kx（弹性限度内）；超过弹性限度会发生塑性形变，撤去外力后不能恢复原长。曲线为示意
(function (root) {
  const LIM = 1; // 弹性限度对应的伸长量（示意单位）

  const EP = {
    id: 'K4',
    title: '别把孩子的弹簧拉坏了',
    theme: 'white',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'over',
    beats: [
      { id: 'hook', min: 3.0, cap: ['逼得越紧，', '孩子就越{能扛}吗？'], voice: '逼得越紧，孩子就越能扛吗？', mood: 0.3 },
      { id: 'law', min: 3.8, cap: ['物理课学过胡克定律：', '弹簧伸长多少，和拉力{成正比}。'], voice: '物理课学过胡克定律，弹簧伸长多少，和拉力成正比。', mood: 0.4 },
      { id: 'back', min: 3.0, cap: ['在弹性限度内，', '一松手，弹簧就{恢复原样}。'], voice: '在弹性限度内，一松手，弹簧就恢复原样。', mood: 0.45, sfx: [{ at: 1.2, type: 'whoosh' }] },
      { id: 'over', min: 3.8, cap: ['可一旦超过弹性限度——', '松手后，它[再也回不去了]。'], voice: '可一旦超过弹性限度，松手后，它再也回不去了。', mood: 0.8, sfx: [{ at: 1.0, type: 'riser', dur: 1.4 }, { at: 2.4, type: 'boom' }] },
      { id: 'flip', min: 3.8, cap: ['孩子也有自己的弹性限度：', '睡眠、情绪、兴趣，都会被{拉伤}。'], voice: '孩子也有自己的弹性限度，睡眠、情绪、兴趣，都会被拉伤。', mood: 0.55 },
      { id: 'tip', min: 3.2, cap: ['适度的压力是[动力]，', '过度的压力是{损伤}。'], voice: '适度的压力是动力，过度的压力是损伤。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '给压力，也要给孩子留弹性。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '拉力伸长量弹性限度原长塑性形变胡克定律F=kx在内曲线为示意给压力也要孩子留',
  };

  // 伸长量 x（示意单位）与是否已发生塑性形变
  function stretchAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('law').s + 0.4) return { x: 0, set: 0 };
    if (t < b('back').s) return { x: 0.8 * E.ease.inOut(E.seg(t, b('law').s + 0.4, b('law').e - 0.2)), set: 0 };
    if (t < b('over').s) return { x: 0.8 * (1 - E.ease.out(E.seg(t, b('back').s + 1.0, b('back').s + 1.6))), set: 0 };
    const ov = b('over');
    if (t < ov.s + 2.2) return { x: 1.8 * E.ease.inOut(E.seg(t, ov.s + 0.2, ov.s + 2.2)), set: 0 };
    return { x: E.lerp(1.8, 0.65, E.ease.out(E.seg(t, ov.s + 2.4, ov.s + 3.0))), set: 0.65 };
  }

  const WALL = 140, Y = 820, BASEL = 320;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.88 * E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    const st = stretchAt(t, TL, E), over = st.x > LIM || st.set > 0;
    ctx.save(); ctx.globalAlpha = sceneA;
    // 墙
    ctx.fillStyle = th.fg; ctx.fillRect(WALL - 20, Y - 120, 20, 240);
    for (let y = Y - 110; y < Y + 120; y += 24) { ctx.beginPath(); ctx.moveTo(WALL - 20, y); ctx.lineTo(WALL - 40, y + 16); ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.stroke(); }
    // 弹簧：超过限度后线圈间距不均、变红
    const len = BASEL + st.x * 180, coils = 16, end = WALL + len;
    ctx.strokeStyle = over ? th.red : th.fg; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(WALL, Y);
    for (let i = 1; i < coils * 2; i++) {
      let u = i / (coils * 2);
      if (st.set > 0) u = Math.pow(u, 1.35);
      ctx.lineTo(WALL + 20 + u * (len - 40), Y + (i % 2 ? -46 : 46));
    }
    ctx.lineTo(end, Y); ctx.stroke();
    // 拉手与拉力箭头
    ctx.fillStyle = th.fg; ctx.beginPath(); ctx.roundRect(end, Y - 40, 40, 80, 8); ctx.fill();
    const pulling = (t > b('law').s + 0.4 && t < b('back').s + 1.0) || (t > b('over').s && t < b('over').s + 2.4);
    if (pulling) {
      const F = Math.min(st.x, LIM) * 200 + Math.max(0, st.x - LIM) * 60;
      ctx.strokeStyle = th.gold; ctx.fillStyle = th.gold; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(end + 50, Y); ctx.lineTo(end + 70 + F * 0.5, Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(end + 90 + F * 0.5, Y); ctx.lineTo(end + 64 + F * 0.5, Y - 16); ctx.lineTo(end + 64 + F * 0.5, Y + 16); ctx.fill();
      ctx.font = `700 34px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('F', end + 70 + F * 0.25, Y - 30);
    }
    // 原长刻度
    ctx.strokeStyle = th.dim; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(WALL + BASEL, Y - 90); ctx.lineTo(WALL + BASEL, Y + 90); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('原长', WALL + BASEL, Y + 120);
    if (st.set > 0) { ctx.fillStyle = th.red; ctx.font = `700 34px ${th.cap}`; ctx.fillText('回不到原长了', WALL + BASEL + 140, Y - 110); }
    // F–x 图
    const gA = E.seg(t, b('law').s + 0.6, b('law').s + 1.2);
    if (gA > 0) {
      ctx.globalAlpha = sceneA * gA;
      const X0 = 170, X1 = 910, Y0 = 1060, Y1 = 1460, XS = v => X0 + (v / 2) * (X1 - X0);
      const Fof = x => (x <= LIM ? x : LIM + 0.35 * Math.log(1 + (x - LIM) * 3) / Math.log(4) * 1.0);
      const YS = f => Y1 - (f / 1.5) * (Y1 - Y0);
      ctx.strokeStyle = th.fg; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X0, Y0 - 20); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('拉力 F', X0 + 12, Y0 - 10); ctx.textAlign = 'right'; ctx.fillText('伸长量 x →', X1, Y1 + 40);
      // 弹性限度线
      ctx.setLineDash([8, 8]); ctx.strokeStyle = th.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(XS(LIM), Y0); ctx.lineTo(XS(LIM), Y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.red; ctx.textAlign = 'center'; ctx.font = `700 26px ${th.cap}`; ctx.fillText('弹性限度', XS(LIM), Y0 - 14);
      // 曲线画到当前最大伸长
      const xmax = t > b('over').s ? Math.max(0.8, Math.min(1.8, st.set > 0 ? 1.8 : st.x)) : 0.8 * E.seg(t, b('law').s + 0.4, b('law').e - 0.2);
      ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = (xmax * i) / 100; i ? ctx.lineTo(XS(x), YS(Fof(x))) : ctx.moveTo(XS(x), YS(0)); }
      ctx.strokeStyle = th.gold; ctx.lineWidth = 5; ctx.stroke();
      if (st.set > 0) { ctx.setLineDash([10, 8]); ctx.strokeStyle = th.red; ctx.beginPath(); ctx.moveTo(XS(1.8), YS(Fof(1.8))); ctx.lineTo(XS(0.65), YS(0)); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = th.dim; ctx.font = `400 21px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('胡克定律 F = kx（在弹性限度内）；曲线为示意', 540, 1560);
    }
    ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '给压力，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '也要给孩子{留弹性}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.5, weight: 900 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
