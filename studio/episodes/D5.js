// D5《曲线下面的面积》复利类 · 黑板粉笔风
// 数学锚点：定积分 = 曲线下面积 = 无数个小矩形（黎曼和）之和；分得越细，越接近真实面积
(function (root) {
  const f = x => 0.3 + 0.35 * x + 0.08 * x * x + 0.05 * Math.sin(x * 4); // 示意的"每天收获"曲线，x ∈ [0, 3]，最大约 2.1

  const EP = {
    id: 'D5',
    title: '曲线下面的面积',
    theme: 'chalk',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 88, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'sum',
    beats: [
      { id: 'hook', min: 2.8, cap: ['你每天学的东西，', '最后{去哪了}？'], voice: '你每天学的东西，最后去哪了？', mood: 0.3 },
      { id: 'rule', min: 4.4, cap: ['数学里的积分：曲线下面的面积，', '是{无数个小长条}加起来的。'], voice: '数学里的积分，曲线下面的面积，是无数个小长条加起来的。', mood: 0.45 },
      { id: 'thin', min: 3.0, cap: ['分得越细，每一条越薄，', '薄到{几乎看不见}。'], voice: '分得越细，每一条越薄，薄到几乎看不见。', mood: 0.5, sfx: [{ at: 0.3, type: 'ticks', n: 6, gap: 0.2 }] },
      { id: 'sum', min: 3.0, cap: ['可加起来，', '就是{一整片面积}。'], voice: '可加起来，就是一整片面积。', mood: 0.8, sfx: [{ at: 0.3, type: 'riser', dur: 1.2 }, { at: 1.5, type: 'boom' }] },
      { id: 'flip', min: 3.4, cap: ['你的每一天也一样：', '单看一天，[几乎没区别]；'], voice: '你的每一天也一样，单看一天，几乎没区别。', mood: 0.55 },
      { id: 'flip2', min: 3.0, cap: ['高中三年加起来，', '就是{你的高考}。'], voice: '高中三年加起来，就是你的高考。', mood: 0.85 },
      { id: 'action', min: 3.0, cap: null, voice: '你看不见每一天，但它们全部算数。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '∫dx面积高一高二高三天积分曲线你看不见每一但它们全部算数0123456789',
  };

  const X0 = 170, X1 = 910, Y0 = 760, Y1 = 1400;
  const PX = x => X0 + (x / 3) * (X1 - X0), PY = y => Y1 - (y / 2.2) * (Y1 - Y0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    ctx.save(); ctx.globalAlpha = sceneA;
    // 积分符号
    const sA = E.seg(t, b('rule').s, b('rule').s + 0.5) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.4));
    if (sA > 0) { ctx.globalAlpha = sceneA * sA; ctx.fillStyle = th.gold; ctx.font = `700 90px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('∫ f(x) dx', 540, 620); ctx.globalAlpha = sceneA; }
    // 坐标轴
    E.chalkLine(ctx, [[X0, Y0 - 30], [X0, Y1]], th.fg, 4, 1, 1);
    E.chalkLine(ctx, [[X0, Y1], [X1 + 20, Y1]], th.fg, 4, 2, 1);
    // 黎曼和：长条数随时间变多
    const nBars = t < b('rule').s ? 0 : t < b('thin').s ? 6 : Math.round(E.lerp(6, 120, E.ease.in(E.seg(t, b('thin').s, b('thin').e))));
    const fillK = E.seg(t, b('sum').s + 0.2, b('sum').s + 1.0);
    if (nBars > 0) {
      const dx = 3 / nBars;
      for (let i = 0; i < nBars; i++) {
        const x = i * dx, h = f(x + dx / 2);
        const ap = E.seg(t, b('rule').s + 0.4 + i * 0.08, b('rule').s + 0.6 + i * 0.08);
        ctx.globalAlpha = sceneA * (nBars > 6 ? 1 : ap) * 0.6;
        ctx.fillStyle = fillK > 0 ? th.gold : th.blue;
        ctx.fillRect(PX(x) + (nBars > 40 ? 0 : 2), PY(h), PX(dx) - X0 - (nBars > 40 ? 0 : 4), Y1 - PY(h));
      }
    }
    // 曲线
    ctx.globalAlpha = sceneA; const pts = []; for (let i = 0; i <= 60; i++) { const x = (3 * i) / 60; pts.push([PX(x), PY(f(x))]); }
    E.chalkLine(ctx, pts, th.fg, 5, 7, E.ease.inOut(E.seg(t, 0.3, 1.6)));
    // 高一 / 高二 / 高三 分段
    const yA = E.seg(t, b('flip2').s + 0.1, b('flip2').s + 0.6);
    if (yA > 0) {
      ctx.globalAlpha = sceneA * yA; ctx.fillStyle = th.fg; ctx.font = `700 36px ${th.cap}`; ctx.textAlign = 'center';
      ['高一', '高二', '高三'].forEach((s, i) => { ctx.fillText(s, PX(i + 0.5), Y1 + 50); if (i) E.chalkLine(ctx, [[PX(i), Y1], [PX(i), PY(f(i)) - 10]], th.red, 3, 30 + i, 1); });
    }
    // 单独一天的薄条
    const fl = b('flip');
    const oA = E.seg(t, fl.s + 0.3, fl.s + 0.7) * (1 - E.seg(t, b('flip2').s, b('flip2').s + 0.3));
    if (oA > 0) {
      ctx.globalAlpha = sceneA * oA; const x = 1.4, dx = 3 / 120;
      ctx.fillStyle = th.red; ctx.fillRect(PX(x), PY(f(x)), Math.max(4, PX(dx) - X0), Y1 - PY(f(x)));
      ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('← 某一天', PX(x) + 16, PY(f(x)) - 30);
    }
    ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '你看不见每一天，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '但它们{全部算数}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
