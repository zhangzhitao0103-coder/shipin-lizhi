// J1《截距是起点，斜率是成长》信心类 · 黑板粉笔风
// 数学锚点：一次函数 y = kx + b。小林 y = 0.5x + 110，小陈 y = 2x + 80：第 20 周相交（都是 120 分），第 30 周小陈 140、小林 125（示例数据）
(function (root) {
  const LIN = x => 0.5 * x + 110, CHEN = x => 2 * x + 80;

  const EP = {
    id: 'J1',
    title: '截距是起点斜率是成长',
    theme: 'chalk',
    voice: { sid: 90 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 92, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'F', 'G', 'C'] },
    cover: 'cross',
    beats: [
      { id: 'hook', min: 3.4, cap: ['数学课上的一次函数，', '藏着一个{道理}。'], voice: '数学课上的一次函数，藏着一个道理。', mood: 0.35 },
      { id: 'b', min: 2.8, cap: ['{b} 是截距：', '你现在的起点。'], voice: '截距，是你现在的起点。', mood: 0.4 },
      { id: 'k', min: 3.0, cap: ['{k} 是斜率：', '你每一周成长的速度。'], voice: '斜率，是你每一周成长的速度。', mood: 0.45 },
      { id: 'two', min: 5.0, cap: ['小林：起点 110 分，每周 +0.5；', '小陈：起点 80 分，每周 {+2}。'], voice: '小林起点一百一十分，每周进步零点五分。小陈起点八十分，每周进步两分。', mood: 0.5 },
      { id: 'run', min: 2.8, cap: ['一开始，', '小林领先 {30} 分。'], voice: '一开始，小林领先三十分。', mood: 0.5 },
      { id: 'cross', min: 3.0, cap: ['第 {20} 周，', '两条线相交了。'], voice: '第二十周，两条线相交了。', mood: 0.75, sfx: [{ at: 1.2, type: 'ding' }] },
      { id: 'after', min: 3.0, cap: ['第 30 周，', '小陈反超 {15} 分。'], voice: '第三十周，小陈反超十五分。', mood: 0.85, sfx: [{ at: 0.4, type: 'riser', dur: 1.2 }, { at: 1.6, type: 'boom' }] },
      { id: 'quote', min: 3.2, cap: ['起点决定现在，', '{斜率}决定未来。'], voice: '起点决定现在，斜率决定未来。', mood: 0.85, capY: 880, capSize: 80 },
      { id: 'action', min: 3.0, cap: null, voice: '别盯着起点，去改变你的斜率。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'y=kx+b截距斜率起点成长速度小林小陈分周第相交反超0123456789.+示例数据别盯着去改变你的',
  };

  const X0 = 170, X1 = 920, Y0 = 760, Y1 = 1400;
  const PX = w => X0 + (w / 32) * (X1 - X0), PY = s => Y1 - ((s - 60) / 100) * (Y1 - Y0);

  function weekAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('two').s + 0.4) return 0;
    if (t < b('run').s) return 3 * E.seg(t, b('two').s + 0.4, b('two').e);
    if (t < b('cross').s) return 3 + 7 * E.ease.inOut(E.seg(t, b('run').s, b('run').e));
    if (t < b('after').s) return 10 + 10 * E.ease.inOut(E.seg(t, b('cross').s, b('cross').s + 1.2));
    return 20 + 10 * E.ease.inOut(E.seg(t, b('after').s, b('after').s + 1.4));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const yel = th.gold, pink = th.red, blue = th.blue;
    const endDim = 1 - 0.96 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.4);

    // 公式 y = kx + b
    const fA = E.seg(t, 0.3, 0.9) * endDim;
    if (fA > 0) {
      ctx.save(); ctx.globalAlpha = fA; ctx.textAlign = 'center'; ctx.font = `700 110px ${th.cap}`;
      const parts = [['y = ', th.fg], ['k', t > b('k').s ? pink : th.fg], ['x + ', th.fg], ['b', t > b('b').s ? pink : th.fg]];
      const ws = parts.map(([s]) => ctx.measureText(s).width), tot = ws.reduce((a, c) => a + c, 0);
      let x = 540 - tot / 2; ctx.textAlign = 'left';
      parts.forEach(([s, c], i) => { const a = E.seg(t, 0.3 + i * 0.25, 0.6 + i * 0.25); ctx.globalAlpha = fA * a; ctx.fillStyle = c; ctx.fillText(s, x, 620); x += ws[i]; });
      // 注释
      ctx.font = `700 34px ${th.cap}`;
      const bA = E.seg(t, b('b').s + 0.3, b('b').s + 0.8), kA = E.seg(t, b('k').s + 0.3, b('k').s + 0.8);
      ctx.globalAlpha = fA * bA; ctx.fillStyle = pink; ctx.textAlign = 'center'; ctx.fillText('起点', 540 + tot / 2 - ws[3] / 2, 690);
      ctx.globalAlpha = fA * kA; ctx.fillText('速度', 540 - tot / 2 + ws[0] + ws[1] / 2, 690);
      ctx.restore();
    }

    // 坐标系
    const ax = E.ease.inOut(E.seg(t, b('b').s, b('b').s + 1.0));
    if (ax > 0) {
      ctx.save(); ctx.globalAlpha = endDim;
      E.chalkLine(ctx, [[X0, Y0 - 30], [X0, Y1]], th.fg, 4, 11, ax);
      E.chalkLine(ctx, [[X0, Y1], [X1 + 20, Y1]], th.fg, 4, 12, ax);
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'right';
      ctx.globalAlpha = endDim * ax;
      [80, 110, 140].forEach(s => ctx.fillText(String(s), X0 - 14, PY(s) + 9));
      ctx.textAlign = 'center'; [0, 10, 20, 30].forEach(w => ctx.fillText(String(w), PX(w), Y1 + 40));
      ctx.fillText('周 →', X1, Y1 + 80); ctx.textAlign = 'left'; ctx.fillText('分数', X0 - 60, Y0 - 50);
      ctx.restore();
    }
    // 斜率三角
    const kA2 = E.seg(t, b('k').s + 0.6, b('k').s + 1.2) * (1 - E.seg(t, b('two').s, b('two').s + 0.4));
    if (kA2 > 0) {
      ctx.save(); ctx.globalAlpha = kA2 * endDim;
      E.chalkLine(ctx, [[PX(6), PY(92)], [PX(16), PY(92)], [PX(16), PY(112)]], pink, 4, 21, 1);
      E.chalkLine(ctx, [[PX(6), PY(92)], [PX(16), PY(112)]], blue, 5, 22, 1);
      ctx.fillStyle = pink; ctx.font = `700 30px ${th.cap}`; ctx.fillText('每周涨多少', PX(17), PY(103));
      ctx.restore();
    }
    // 两条线
    const wk = weekAt(t, TL, E);
    if (wk > 0) {
      ctx.save(); ctx.globalAlpha = endDim;
      const pts = fn => { const p = []; for (let i = 0; i <= 30; i++) { const w = (wk * i) / 30; p.push([PX(w), PY(fn(w))]); } return p; };
      E.chalkLine(ctx, pts(LIN), th.fg, 6, 31, 1); E.chalkLine(ctx, pts(CHEN), yel, 6, 32, 1);
      const tag = (fn, c, name, dy) => { ctx.fillStyle = c; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(`${name} ${fn(wk).toFixed(wk % 1 ? 1 : 0)}`, PX(wk) + 16, PY(fn(wk)) + dy); };
      const close = Math.abs(LIN(wk) - CHEN(wk)) < 8;
      tag(LIN, th.fg, '小林', close ? -24 : 10); tag(CHEN, yel, '小陈', close ? 40 : 10);
      // 领先 30 分
      const g = E.seg(t, b('run').s + 0.2, b('run').s + 0.6) * (1 - E.seg(t, b('cross').s, b('cross').s + 0.3));
      if (g > 0) { ctx.globalAlpha = endDim * g; E.chalkLine(ctx, [[PX(0) + 20, PY(110)], [PX(0) + 20, PY(80)]], pink, 4, 41, 1); ctx.fillStyle = pink; ctx.font = `700 32px ${th.cap}`; ctx.fillText('差 30 分', PX(0) + 34, PY(95) + 10); ctx.globalAlpha = endDim; }
      // 交点
      const c = E.seg(t, b('cross').s + 1.1, b('cross').s + 1.6);
      if (c > 0) {
        ctx.globalAlpha = endDim * c; ctx.strokeStyle = pink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(PX(20), PY(120), 26, 0, Math.PI * 2 * c); ctx.stroke();
        ctx.fillStyle = pink; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('第 20 周 · 都是 120 分', PX(20), PY(120) + 74);
        ctx.globalAlpha = endDim;
      }
      // 反超 15 分
      const r = E.seg(t, b('after').s + 1.5, b('after').s + 2.0);
      if (r > 0) { ctx.globalAlpha = endDim * r; E.chalkLine(ctx, [[PX(30) - 16, PY(140)], [PX(30) - 16, PY(125)]], pink, 4, 51, 1); ctx.fillStyle = pink; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText('反超 15 分', PX(30) - 30, PY(132) + 10); }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.8 * E.seg(t, b('two').s, b('two').s + 0.6) * endDim; ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('示例数据', 540, 1690); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别盯着起点，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '去改变你的{斜率}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
