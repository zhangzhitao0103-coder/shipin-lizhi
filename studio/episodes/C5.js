// C5《养成一个习惯，要多少天？》坚持类 · 杂志排版风
// 数据：Lally 等（2010，《欧洲社会心理学杂志》）：习惯达到"自动化"平均 66 天，范围 18–254 天。
// 自动化曲线为示意：y = 1 − e^(−d/22)，第 66 天约 95%
(function (root) {
  const auto = d => 1 - Math.exp(-d / 22);

  const EP = {
    id: 'C5',
    title: '养成一个习惯要多少天',
    theme: 'magazine',
    voice: { sid: 40 },
    capY: 380, capSize: 62,
    music: { style: 'cinema', chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'F', 'G', 'C'] },
    cover: 'study',
    beats: [
      { id: 'hook', min: 3.0, cap: ['都说 21 天，', '就能{养成一个习惯}？'], voice: '都说二十一天，就能养成一个习惯？', mood: 0.3 },
      { id: 'study', min: 3.6, cap: ['伦敦大学学院的一项研究发现：', '平均要 {66} 天。'], voice: '伦敦大学学院的一项研究发现，平均要六十六天。', mood: 0.6, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'range', min: 3.0, cap: ['快的 18 天，', '慢的要 [254] 天。'], voice: '快的十八天，慢的要二百五十四天。', mood: 0.5 },
      { id: 'curve', min: 3.8, cap: ['习惯是慢慢{变自动}的：', '前面最难，后面越来越轻松。'], voice: '习惯是慢慢变自动的，前面最难，后面越来越轻松。', mood: 0.5 },
      { id: 'winter', min: 3.0, cap: ['一个寒假 30 天，', '还不到平均值的{一半}。'], voice: '一个寒假三十天，还不到平均值的一半。', mood: 0.55 },
      { id: 'plan', min: 3.8, cap: ['放假前 36 天开始，', '加上寒假 30 天，正好 {66} 天。'], voice: '放假前三十六天开始，加上寒假三十天，正好六十六天。', mood: 0.75, sfx: [{ at: 0.4, type: 'ticks', n: 6, gap: 0.12 }] },
      { id: 'quote', min: 3.4, cap: ['第 21 天觉得难，很正常：', '你只是{还没到}。'], voice: '第二十一天觉得难，很正常，你只是还没到。', mood: 0.8, capY: 880, capSize: 72 },
      { id: 'action', min: 3.2, cap: null, voice: '现在开始，寒假结束时，它就是你的了。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'NO.C习惯笔记天平均快慢自动化程度放假前寒假等欧洲社会心理学杂志范围曲线为示意现在开始结束时它就是你的了0123456789–%',
  };

  const X0 = 150, X1 = 930, Y0 = 980, Y1 = 1400;
  const DX = d => X0 + (d / 120) * (X1 - X0), DY = v => Y1 - v * (Y1 - Y0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const red = th.red;
    const endA = 1 - E.seg(t, b('quote').s - 0.2, b('quote').s + 0.3);
    // 刊头
    ctx.save(); ctx.globalAlpha = E.seg(t, 0, 0.6) * endA;
    ctx.fillStyle = red; ctx.fillRect(120, 214, 840, 6); ctx.fillStyle = th.fg; ctx.fillRect(120, 226, 840, 1.5);
    ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('NO.C5', 120, 200);
    ctx.font = `900 26px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText('习惯笔记', 960, 200);
    ctx.restore();

    // 21 被划掉 → 66
    const nA = E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('curve').s - 0.2, b('curve').s + 0.3));
    if (nA > 0) {
      ctx.save(); ctx.globalAlpha = nA; ctx.textAlign = 'center';
      const sw = E.seg(t, b('study').s, b('study').s + 0.6);
      ctx.font = `700 ${E.lerp(300, 150, sw)}px ${th.num}`; ctx.fillStyle = sw > 0 ? th.dim : th.fg;
      const x21 = E.lerp(540, 300, sw), y21 = E.lerp(980, 820, sw);
      ctx.fillText('21', x21, y21);
      if (sw > 0) { ctx.strokeStyle = red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x21 - 110, y21 - 50); ctx.lineTo(x21 - 110 + 220 * E.ease.out(E.seg(t, b('study').s + 0.3, b('study').s + 0.8)), y21 - 50); ctx.stroke(); }
      const a66 = E.ease.out(E.seg(t, b('study').s + 0.6, b('study').s + 1.2));
      if (a66 > 0) { ctx.globalAlpha = nA * a66; ctx.fillStyle = red; ctx.font = `700 320px ${th.num}`; ctx.fillText('66', 680, 1060); ctx.font = `900 54px ${th.cap}`; ctx.fillStyle = th.fg; ctx.fillText('天（平均）', 680, 1140); }
      // 范围条
      const ra = E.seg(t, b('range').s + 0.2, b('range').s + 0.7);
      if (ra > 0) {
        const rx = v => 150 + (v / 254) * 780, y = 1320;
        ctx.globalAlpha = nA * ra; ctx.strokeStyle = th.fg; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(rx(18), y); ctx.lineTo(rx(18) + (rx(254) - rx(18)) * E.ease.out(ra), y); ctx.stroke();
        [[18, '18 天'], [66, '66'], [254, '254 天']].forEach(([v, s]) => { ctx.fillStyle = v === 66 ? red : th.fg; ctx.beginPath(); ctx.arc(rx(v), y, v === 66 ? 14 : 10, 0, Math.PI * 2); ctx.fill(); ctx.font = `700 32px ${th.mono}`; ctx.fillText(s, rx(v), y + 56); });
      }
      ctx.restore();
    }
    // 自动化曲线 + 天数条
    const cA = E.seg(t, b('curve').s + 0.1, b('curve').s + 0.6) * endA;
    if (cA > 0) {
      ctx.save(); ctx.globalAlpha = cA;
      ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, Y0 - 20); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('自动化程度', X0 + 12, Y0 - 30); ctx.textAlign = 'right'; ctx.fillText('天数 →', X1, Y1 + 80);
      ctx.textAlign = 'center'; ctx.font = `500 24px ${th.mono}`; [0, 21, 66, 120].forEach(d => ctx.fillText(String(d), DX(d), Y1 + 38));
      const dEnd = 120 * E.ease.inOut(E.seg(t, b('curve').s + 0.3, b('curve').s + 2.4));
      ctx.beginPath(); for (let d = 0; d <= dEnd; d += 1) { const x = DX(d), y = DY(auto(d)); d ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = th.fg; ctx.lineWidth = 5; ctx.stroke();
      [[21, th.dim], [66, red]].forEach(([d, c]) => { if (dEnd < d) return; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(DX(d), DY(auto(d)), 10, 0, Math.PI * 2); ctx.fill(); ctx.font = `700 30px ${th.mono}`; ctx.fillText(Math.round(auto(d) * 100) + '%', DX(d), DY(auto(d)) - 24); });
      // 寒假 30 天 / 放假前 36 天
      const wA = E.seg(t, b('winter').s + 0.2, b('winter').s + 0.6), pA = E.seg(t, b('plan').s + 0.2, b('plan').s + 0.8);
      const bandY = 860;
      if (wA > 0) { ctx.globalAlpha = cA * wA; ctx.fillStyle = 'rgba(17,17,17,0.85)'; const xa = pA > 0 ? DX(36) : DX(0); ctx.fillRect(xa, bandY, DX(30) - DX(0), 54); ctx.fillStyle = th.bg; ctx.font = `900 30px ${th.cap}`; ctx.fillText('寒假 30 天', xa + (DX(30) - DX(0)) / 2, bandY + 38); }
      if (pA > 0) { ctx.globalAlpha = cA * pA; ctx.fillStyle = red; ctx.fillRect(DX(0), bandY, (DX(36) - DX(0)) * E.ease.out(pA), 54); ctx.fillStyle = th.bg; ctx.font = `900 28px ${th.cap}`; ctx.fillText('放假前 36 天', DX(18), bandY + 38); }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, b('study').s, b('study').s + 0.6) * endA; ctx.fillStyle = th.dim; ctx.font = `500 21px ${th.cap}`; ctx.textAlign = 'center';
    ctx.fillText('Lally 等，2010，《欧洲社会心理学杂志》：平均 66 天，范围 18–254 天；曲线为示意', 540, 1690); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '现在开始，', 540, 860, { theme: th, size: 84, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '寒假结束时，{它就是你的了}。', 540, 1000, { theme: th, size: 76, tt: t - ac.s - 0.5, weight: 900 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
