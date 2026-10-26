// I7《新学期，其实只有 18 周》窗口期类 · 晨光风
// 估算：一学期约 18 周 × 每周 5 天课 = 90 天；期中约在第 9 周（开学到期中 8 周）。各地校历不同
(function (root) {
  const WEEKS = 18;

  const EP = {
    id: 'I7',
    title: '新学期其实只有18周',
    theme: 'sunrise',
    voice: { sid: 40 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 100, chords: ['A', 'E', 'F#m', 'D', 'A', 'E', 'D', 'E', 'A', 'F#m', 'D', 'E'] },
    cover: 'mid',
    beats: [
      { id: 'hook', min: 2.8, cap: ['新学期，', '其实只有 {18} 周。'], voice: '新学期，其实只有十八周。', mood: 0.35 },
      { id: 'grid', min: 3.0, cap: ['每周 5 天课，', '一共大约 {90} 天。'], voice: '每周五天课，一共大约九十天。', mood: 0.45, sfx: [{ at: 0.3, type: 'ticks', n: 6, gap: 0.12 }] },
      { id: 'mid', min: 2.8, cap: ['第 9 周，', '就是{期中考试}。'], voice: '第九周，就是期中考试。', mood: 0.6, sfx: [{ at: 0.3, type: 'ding' }] },
      { id: 'half', min: 2.8, cap: ['开学到期中，', '只有 {8} 周。'], voice: '开学到期中，只有八周。', mood: 0.6 },
      { id: 'late', min: 4.4, cap: ['第 1 周就进入状态，和第 4 周才进入，', '差了[整整 3 周]。'], voice: '第一周就进入状态，和第四周才进入，差了整整三周。', mood: 0.75, sfx: [{ at: 1.2, type: 'boom' }] },
      { id: 'flip', min: 3.2, cap: ['新学期最容易浪费的，', '就是{开头那几周}。'], voice: '新学期最容易浪费的，就是开头那几周。', mood: 0.6 },
      { id: 'action', min: 3.0, cap: null, voice: '新学期，从第一周开始算数。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第周期中期末考试开学天还没进入状态按一学期约估算各地校历不同从开始算数0123456789',
  };

  const C = 6, P = 150, S = 132, X0 = 540 - (C * P) / 2 + (P - S) / 2, Y0 = 700;
  const pos = i => ({ x: X0 + (i % C) * P, y: Y0 + Math.floor(i / C) * 210 });

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const gA = E.seg(t, 0.2, 0.8) * (1 - 0.82 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (gA > 0) {
      ctx.save();
      const lateK = E.seg(t, b('late').s + 0.6, b('late').s + 1.4);
      for (let i = 0; i < WEEKS; i++) {
        const p = pos(i), ap = E.ease.out(E.seg(t, 0.3 + i * 0.07, 0.6 + i * 0.07));
        const isMid = i === 8, isEnd = i === 17, beforeMid = i < 8;
        const lit = (t > b('half').s + 0.3 && beforeMid) || (t > b('mid').s && isMid) || isEnd;
        E.glassCard(ctx, p.x, p.y, S, 160, gA * ap, 20);
        ctx.globalAlpha = gA * ap;
        if (lit) { ctx.fillStyle = isMid ? th.red : isEnd ? 'rgba(255,123,107,0.6)' : 'rgba(255,209,102,0.35)'; ctx.beginPath(); ctx.roundRect(p.x, p.y, S, 160, 20); ctx.fill(); }
        if (lateK > 0 && i < 3) { ctx.globalAlpha = gA * ap * lateK; ctx.fillStyle = 'rgba(20,20,40,0.65)'; ctx.beginPath(); ctx.roundRect(p.x, p.y, S, 160, 20); ctx.fill(); ctx.globalAlpha = gA * ap; }
        ctx.fillStyle = th.fg; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('第 ' + (i + 1) + ' 周', p.x + S / 2, p.y + 50);
        // 每周 5 个小点 = 5 天课
        const dA = E.seg(t, b('grid').s + 0.2 + i * 0.05, b('grid').s + 0.5 + i * 0.05);
        for (let d = 0; d < 5; d++) { ctx.globalAlpha = gA * ap * (0.3 + 0.7 * dA); ctx.fillStyle = th.gold; ctx.beginPath(); ctx.arc(p.x + 22 + d * 22, p.y + 90, 7, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = gA * ap;
        if (isMid && t > b('mid').s) { ctx.fillStyle = '#FFFFFF'; ctx.font = `700 30px ${th.cap}`; ctx.fillText('期中', p.x + S / 2, p.y + 140); }
        if (isEnd) { ctx.fillStyle = '#FFFFFF'; ctx.font = `700 30px ${th.cap}`; ctx.fillText('期末', p.x + S / 2, p.y + 140); }
      }
      // 迟到 3 周的标注
      if (lateK > 0) {
        ctx.globalAlpha = gA * lateK; ctx.fillStyle = th.red; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left';
        ctx.fillText('↑ 前 3 周还没进入状态', pos(0).x, pos(0).y + 198);
      }
      // 天数计数
      ctx.globalAlpha = gA * E.seg(t, b('grid').s, b('grid').s + 0.4); ctx.textAlign = 'center'; ctx.fillStyle = th.goldHi; ctx.font = `700 64px ${th.num}`;
      ctx.shadowColor = th.gold; ctx.shadowBlur = 20;
      ctx.fillText(Math.round(90 * E.seg(t, b('grid').s + 0.2, b('grid').s + 1.4)) + ' 天课', 540, 1400); ctx.shadowBlur = 0;
      ctx.globalAlpha = gA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.fillText('按一学期约 18 周估算，各地校历不同', 540, 1480);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '新学期，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{从第一周}开始算数。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
