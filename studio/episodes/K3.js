// K3《同频，才能放大》家长类 · 纸雕风
// 物理锚点：受迫振动与共振——驱动力频率等于物体固有频率时，振幅最大（荡秋千：跟着节奏推，越荡越高）
(function (root) {
  const PX = 540, PY = 600, L = 440, W0 = Math.PI; // 秋千周期 2 秒

  const EP = {
    id: 'K3',
    title: '同频才能放大',
    theme: 'paper',
    voice: { sid: 50 },
    capY: 380, capSize: 62,
    music: { style: 'cinema', chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'right',
    beats: [
      { id: 'hook', min: 3.0, cap: ['推秋千，', '是不是{越用力，荡得越高}？'], voice: '推秋千，是不是越用力，荡得越高？', mood: 0.3 },
      { id: 'wrong', min: 3.4, cap: ['节奏不对的时候推，', '[越推越乱]。'], voice: '节奏不对的时候推，越推越乱。', mood: 0.4, sfx: [{ at: 0.5, type: 'tick' }, { at: 1.3, type: 'tick' }, { at: 1.8, type: 'tick' }] },
      { id: 'right', min: 4.0, cap: ['跟着秋千的节奏推，', '轻轻一下，就能{越荡越高}。'], voice: '跟着秋千的节奏推，轻轻一下，就能越荡越高。', mood: 0.7, sfx: [{ at: 0.5, type: 'ticks', n: 4, gap: 1.0 }] },
      { id: 'law', min: 4.2, cap: ['物理上，这叫{共振}：', '推的节奏，和秋千自己的节奏一致。'], voice: '物理上，这叫共振。推的节奏，和秋千自己的节奏一致。', mood: 0.6 },
      { id: 'flip', min: 3.4, cap: ['孩子也有自己的节奏：', '作息、状态、想法。'], voice: '孩子也有自己的节奏，作息、状态、想法。', mood: 0.5 },
      { id: 'tip', min: 3.2, cap: ['先找到孩子的节奏，', '支持才会{被放大}。'], voice: '先找到孩子的节奏，支持才会被放大。', mood: 0.8 },
      { id: 'action', min: 3.2, cap: null, voice: '不是推得更用力，是推得刚刚好。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '振幅推的频率秋千固有共振受迫振动不是更用力是刚刚好',
  };

  function angleAt(t, TL, E) {
    const b = id => TL.b(id);
    const rad = d => (d * Math.PI) / 180;
    if (t < b('wrong').s) return rad(5) * Math.sin(W0 * t);
    if (t < b('right').s) { const k = t - b('wrong').s; return rad(9) * Math.sin(W0 * t) * (0.6 + 0.4 * Math.sin(2.3 * k)) + rad(3) * Math.sin(5.1 * k); }
    const amp = 8 + 34 * E.ease.inOut(E.seg(t, b('right').s + 0.3, b('right').e + 0.5));
    return rad(amp) * Math.sin(W0 * t);
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.85 * E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    const a = angleAt(t, TL, E);
    ctx.save(); ctx.globalAlpha = sceneA;
    // 支架
    ctx.strokeStyle = '#8C6E5D'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(PX - 260, PY + 560); ctx.lineTo(PX - 200, PY - 20); ctx.lineTo(PX + 200, PY - 20); ctx.lineTo(PX + 260, PY + 560); ctx.stroke();
    // 秋千
    const sx = PX + Math.sin(a) * L, sy = PY + Math.cos(a) * L;
    ctx.strokeStyle = '#5A4638'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(PX - 40, PY - 14); ctx.lineTo(sx - 40, sy); ctx.moveTo(PX + 40, PY - 14); ctx.lineTo(sx + 40, sy); ctx.stroke();
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-a);
    ctx.shadowColor = 'rgba(80,50,30,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = th.gold; ctx.beginPath(); ctx.roundRect(-70, -10, 140, 22, 8); ctx.fill();
    ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(0, -96, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = th.teal; ctx.beginPath(); ctx.roundRect(-30, -66, 60, 60, 16); ctx.fill();
    ctx.restore();
    // 推的手：跟着节奏时，在秋千回到最左端时推
    const inRight = t > b('right').s + 0.3, inWrong = t > b('wrong').s && t < b('right').s;
    const phase = Math.sin(W0 * t);
    let push = 0;
    if (inRight && phase < -0.93) push = 1;
    if (inWrong) { const k = (t - b('wrong').s) % 0.9; if (k < 0.15) push = 1; }
    if (push) {
      ctx.fillStyle = inRight ? th.teal : th.red; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center';
      ctx.beginPath(); ctx.arc(sx - 110, sy - 40, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(inRight ? '推' : '推？', sx - 110, sy - 84);
    }
    ctx.restore();
    // 共振曲线
    const la = E.seg(t, b('law').s + 0.4, b('law').s + 1.0) * (1 - E.seg(t, b('flip').s + 0.2, b('flip').s + 0.7));
    if (la > 0) {
      ctx.save(); ctx.globalAlpha = la;
      ctx.fillStyle = 'rgba(251,246,240,0.92)'; ctx.shadowColor = 'rgba(80,50,30,0.2)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.roundRect(120, 1180, 840, 420, 24); ctx.fill(); ctx.shadowBlur = 0;
      const X0 = 190, X1 = 900, Y1 = 1530, Y0 = 1240;
      const amp = w => 1 / Math.sqrt((1 - w * w) ** 2 + (0.18 * w) ** 2);
      ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      const p = E.ease.inOut(E.seg(t, b('law').s + 0.6, b('law').s + 2.2));
      ctx.beginPath(); for (let i = 0; i <= 200 * p; i++) { const w = (i / 200) * 2; const y = Y1 - Math.min(1, amp(w) / 5.6) * (Y1 - Y0 - 20); const x = X0 + (i / 200) * (X1 - X0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = th.gold; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('振幅', X0 + 12, Y0 + 10);
      ctx.textAlign = 'right'; ctx.fillText('推的节奏（频率）→', X1, Y1 + 40);
      if (p > 0.55) { ctx.fillStyle = th.gold; ctx.textAlign = 'center'; ctx.font = `700 30px ${th.cap}`; ctx.fillText('节奏一致 · 振幅最大', (X0 + X1) / 2 + 60, Y0 + 40); }
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '不是推得更用力，', 540, 880, { theme: th, size: 80, tt: t - ac.s - 0.1 });
      E.rich(ctx, '是推得{刚刚好}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
