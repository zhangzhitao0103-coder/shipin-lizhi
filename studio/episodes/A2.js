// A2《你的高中，只有 156 个格子》时间类 · 暗金电影风
// 锚点：人生 80 年 × 52 周 = 4160 格；高中 3 年 = 156 格，占 3.75%
(function (root) {
  const COLS = 52, ROWS = 80, HS0 = 15;
  const P = 14, CS = 10.5, GX = 540 - (COLS * P) / 2, GY = 560;
  const BP = 56, BC = 46, BX = 540 - (13 * BP) / 2, BY = 640, BGAP = 80;

  const EP = {
    id: 'A2',
    title: '你的高中只有156个格子',
    theme: 'cinema',
    capY: 360,
    capSize: 66,
    music: { style: 'cinema', chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'G'] },
    cover: 'n156',
    beats: [
      { id: 'hook', min: 3.6, cap: ['如果人生有 {80} 年，', '每一周，画一个格子——'], voice: '如果人生有八十年，每一周，画一个格子。', mood: 0.3 },
      { id: 'total', min: 2.4, cap: ['一共 {4160} 格。'], voice: '一共四千一百六十格。', mood: 0.35 },
      { id: 'hs', min: 2.6, cap: ['高中三年，', '是这么多：'], voice: '高中三年，是这么多。', mood: 0.45, sfx: [{ at: 0.6, type: 'ding' }] },
      { id: 'n156', min: 3.2, cap: ['{156} 格。', '不到人生的 {4%}。'], voice: '一百五十六格。不到人生的百分之四。', mood: 0.6, sfx: [{ at: 0.1, type: 'whoosh' }] },
      { id: 'pass', min: 3.2, cap: ['每过一周，', '就有一格，{再也回不来}。'], voice: '每过一周，就有一格，再也回不来。', mood: 0.5, sfx: [{ at: 0.3, type: 'train', dur: 'beat', r0: 3, r1: 14 }] },
      { id: 'wait', min: 3.4, cap: ['它不会因为你还没准备好，', '就停下来等你。'], voice: '它不会因为你还没准备好，就停下来等你。', mood: 0.6, sfx: [{ at: 0, type: 'train', dur: 'beat', r0: 14, r1: 3 }] },
      { id: 'turn', min: 3.6, cap: ['但在它过去之前，', '{你能决定它亮成什么样}。'], voice: '但在它过去之前，你能决定，它亮成什么样。', mood: 0.85, sfx: [{ at: 0.2, type: 'riser', dur: 1.3 }, { at: 1.5, type: 'boom' }] },
      { id: 'action', min: 3.0, cap: null, voice: '让每一格，都亮着过去。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '岁高一二三已过去周剩余格0123456789,让每都亮着',
  };

  const gpos = k => ({ x: GX + (k % COLS) * P, y: GY + Math.floor(k / COLS) * P });
  const bpos = j => { const g = Math.floor(j / 52), i = j % 52; return { x: BX + (i % 13) * BP, y: BY + g * (4 * BP + BGAP) + Math.floor(i / 13) * BP }; };

  function spentAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('pass').s) return 0;
    if (t < b('wait').s) return 52 * E.ease.in(E.seg(t, b('pass').s + 0.3, b('pass').e));
    if (t < b('turn').s) return 52 + 88 * E.ease.out(E.seg(t, b('wait').s, b('wait').e - 0.2));
    return 140 * (1 - E.ease.inOut(E.seg(t, b('turn').s + 0.1, b('turn').s + 1.3)));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.background(ctx, th, t, { cy: 1000 });
    const hk = b('hook');
    const rowsShown = ROWS * E.ease.inOut(E.seg(t, 0.3, hk.e - 0.2));
    const hsK = E.ease.inOut(E.seg(t, b('hs').s + 0.4, b('hs').s + 1.2));
    const morph = E.ease.inOut(E.seg(t, b('n156').s + 0.1, b('n156').s + 1.4));
    const othersA = 1 - E.seg(t, b('n156').s, b('n156').s + 0.8);
    const spent = spentAt(t, TL, E);
    const glowWave = E.seg(t, b('turn').s + 1.3, b('turn').s + 2.6);
    const endDim = 1 - 0.82 * E.seg(t, b('action').s - 0.1, b('action').s + 0.5);

    // 人生网格（4160 格）
    if (othersA > 0) {
      ctx.save();
      for (let k = 0; k < COLS * ROWS; k++) {
        const row = Math.floor(k / COLS);
        if (row >= HS0 && row < HS0 + 3) continue;
        const ra = E.clamp(rowsShown - row);
        if (ra <= 0) break;
        const p = gpos(k);
        ctx.globalAlpha = ra * othersA * (1 - 0.8 * hsK);
        ctx.fillStyle = '#5A564E';
        ctx.fillRect(p.x, p.y, CS, CS);
      }
      ctx.globalAlpha = othersA * E.seg(t, 1.0, 2.0); ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'right';
      ctx.fillText('0 岁', GX - 14, GY + 9);
      ctx.fillText('80 岁', GX - 14, GY + (ROWS - 1) * P + 9);
      ctx.globalAlpha = othersA * hsK; ctx.fillStyle = th.gold;
      ctx.fillText('15 岁', GX - 14, GY + HS0 * P + 9); ctx.fillText('18 岁', GX - 14, GY + (HS0 + 3) * P + 9);
      ctx.restore();
    }
    // 4160 计数
    const tb = b('total');
    if (t > tb.s - 0.2 && t < b('hs').s + 0.5) {
      const a = E.seg(t, tb.s - 0.2, tb.s + 0.3) * (1 - E.seg(t, b('hs').s, b('hs').s + 0.5));
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'right'; ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.mono}`;
      ctx.fillText('80 × 52 = ' + E.fmt(4160), GX + COLS * P, GY - 24); ctx.restore();
    }

    // 高中 156 格
    ctx.save();
    for (let j = 0; j < 156; j++) {
      const k = HS0 * COLS + j, row = Math.floor(k / COLS);
      const ra = E.clamp(rowsShown - row);
      if (ra <= 0) continue;
      const a0 = gpos(k), b0 = bpos(j);
      const stag = E.ease.inOut(E.clamp(morph * 1.25 - (j / 156) * 0.25));
      const x = E.lerp(a0.x, b0.x, stag), y = E.lerp(a0.y, b0.y, stag), s = E.lerp(CS, BC, stag);
      const isSpent = j < Math.floor(spent);
      const cur = j === Math.floor(spent) && spent > 0 && spent < 156;
      let col = hsK > 0 ? th.gold : '#5A564E';
      if (hsK > 0 && hsK < 1) col = `rgba(242,182,90,${0.25 + 0.75 * hsK})`;
      ctx.globalAlpha = ra * endDim;
      if (isSpent) { ctx.fillStyle = '#2B2925'; ctx.fillRect(x, y, s, s); ctx.strokeStyle = '#3B3832'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2); continue; }
      const wave = glowWave > 0 ? E.clamp(glowWave * 1.6 - (j / 156) * 0.6) : 0;
      ctx.fillStyle = wave > 0 ? th.goldHi : col;
      if (hsK >= 1) { ctx.shadowColor = th.gold; ctx.shadowBlur = 6 + 22 * wave + (cur ? 26 : 0); }
      ctx.fillRect(x, y, s, s);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    // 高一 / 高二 / 高三 标签
    if (morph > 0) {
      ctx.save(); ctx.globalAlpha = E.seg(morph, 0.7, 1) * endDim; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left';
      ['高一', '高二', '高三'].forEach((s, g) => ctx.fillText(s, BX, BY + g * (4 * BP + BGAP) - 22));
      ctx.textAlign = 'right'; ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`;
      ['52 周', '52 周', '52 周'].forEach((s, g) => ctx.fillText(s, BX + 13 * BP - (BP - BC), BY + g * (4 * BP + BGAP) - 24));
      ctx.restore();
    }
    // 已过去 / 剩余
    if (t > b('pass').s && t < b('turn').s + 1.4) {
      const a = E.seg(t, b('pass').s, b('pass').s + 0.4) * (1 - E.seg(t, b('turn').s + 0.9, b('turn').s + 1.4));
      ctx.save(); ctx.globalAlpha = a; ctx.font = `700 40px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillStyle = th.dim;
      ctx.fillText('已过去 ' + Math.floor(spent) + ' 周', BX, 1560);
      ctx.textAlign = 'right'; ctx.fillStyle = th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = 16;
      ctx.fillText('剩余 ' + (156 - Math.floor(spent)) + ' 周', BX + 13 * BP - (BP - BC), 1560); ctx.restore();
    }
    // 结尾
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '让每一格，', 540, 900, { theme: th, size: 88, tt: t - ac.s - 0.1, glowAll: 0.2 });
      E.rich(ctx, '都{亮着}过去。', 540, 1040, { theme: th, size: 104, tt: t - ac.s - 0.6, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
