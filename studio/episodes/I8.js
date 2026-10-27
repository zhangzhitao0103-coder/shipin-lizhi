// I8《期中之后，还有 9 周》窗口期类 · 晨光风
// 估算：一学期约 18 周，期中在第 9 周，之后还有 9 周。错题三分类（不会 / 粗心 / 没时间）为复盘方法
(function (root) {
  const EP = {
    id: 'I8',
    title: '期中之后还有9周',
    theme: 'sunrise',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 96, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'left',
    beats: [
      { id: 'hook', min: 3.0, cap: ['期中考完了，', '这学期{还剩多少时间}？'], voice: '期中考完了，这学期还剩多少时间？', mood: 0.3 },
      { id: 'left', min: 3.6, cap: ['18 周的学期，期中在第 9 周：', '后面还有 {9 周}。'], voice: '十八周的学期，期中在第九周，后面还有九周。', mood: 0.5, sfx: [{ at: 0.6, type: 'ticks', n: 9, gap: 0.12 }] },
      { id: 'half', min: 3.0, cap: ['正好是{一半}：', '这学期的成绩，还有一半没写完。'], voice: '正好是一半。这学期的成绩，还有一半没写完。', mood: 0.6 },
      { id: 'review', min: 4.2, cap: ['先花一个周末，把期中的错题分成三类：', '{不会的、粗心的、没时间的}。'], voice: '先花一个周末，把期中的错题分成三类，不会的，粗心的，没时间的。', mood: 0.6, sfx: [{ at: 1.4, type: 'ticks', n: 3, gap: 0.5 }] },
      { id: 'plan', min: 4.2, cap: ['不会的，补知识；粗心的，练习惯；', '没时间的，{练速度}。'], voice: '不会的，补知识。粗心的，练习惯。没时间的，练速度。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '期中是半场，下半场才定输赢。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第周期中期末错题不会粗心没时间补知识练习惯速度按一学期约估算是半场下才定输赢0123456789',
  };

  const C = 6, P = 150, S = 132, X0 = 540 - (C * P) / 2 + (P - S) / 2, Y0 = 680;
  const pos = i => ({ x: X0 + (i % C) * P, y: Y0 + Math.floor(i / C) * 180 });

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const gA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('review').s - 0.1, b('review').s + 0.4));
    if (gA > 0) {
      ctx.save();
      const leftK = E.seg(t, b('left').s + 0.6, b('left').s + 1.8);
      for (let i = 0; i < 18; i++) {
        const p = pos(i), past = i < 9;
        E.glassCard(ctx, p.x, p.y, S, 140, gA * (past ? 0.55 : 1), 20);
        ctx.globalAlpha = gA * (past ? 0.5 : 1);
        if (!past && leftK * 9 > i - 9) { ctx.fillStyle = 'rgba(255,209,102,0.45)'; ctx.beginPath(); ctx.roundRect(p.x, p.y, S, 140, 20); ctx.fill(); }
        if (i === 8) { ctx.fillStyle = th.red; ctx.beginPath(); ctx.roundRect(p.x, p.y, S, 140, 20); ctx.fill(); }
        ctx.fillStyle = th.fg; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('第 ' + (i + 1) + ' 周', p.x + S / 2, p.y + 62);
        if (i === 8 || i === 17) { ctx.font = `700 30px ${th.cap}`; ctx.fillText(i === 8 ? '期中' : '期末', p.x + S / 2, p.y + 108); }
      }
      const hA = E.seg(t, b('half').s + 0.2, b('half').s + 0.6);
      if (hA > 0) { ctx.globalAlpha = gA * hA; ctx.fillStyle = th.goldHi; ctx.font = `700 64px ${th.num}`; ctx.textAlign = 'center'; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.fillText('还剩 9 周 · 一半', 540, 1340); ctx.shadowBlur = 0; }
      ctx.globalAlpha = gA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('按一学期约 18 周估算，各地校历不同', 540, 1420);
      ctx.restore();
    }
    // 错题三分类
    const rv = b('review');
    const rA = E.seg(t, rv.s + 0.2, rv.s + 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (rA > 0) {
      ctx.save();
      const cats = [['不会的', '补知识', th.red], ['粗心的', '练习惯', th.gold], ['没时间的', '练速度', '#9FD6FF']];
      cats.forEach(([a, z, col], i) => {
        const ap = E.ease.out(E.seg(t, rv.s + 1.2 + i * 0.5, rv.s + 1.6 + i * 0.5));
        const y = 700 + i * 260;
        E.glassCard(ctx, 140, y, 800, 210, rA * ap, 28);
        ctx.globalAlpha = rA * ap; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(230, y + 105, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = th.fg; ctx.font = `700 56px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(a, 300, y + 125);
        const pk = E.seg(t, b('plan').s + 0.3 + i * 0.8, b('plan').s + 0.7 + i * 0.8);
        if (pk > 0) { ctx.globalAlpha = rA * ap * pk; ctx.fillStyle = col; ctx.font = `700 52px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText('→ ' + z, 900, y + 125); }
      });
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '期中是半场，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{下半场}才定输赢。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
