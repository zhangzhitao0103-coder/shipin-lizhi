// N3《寒假 30 天，按三段排》寒假规划类 · 软木板风
// 日历示例：2027 年 1 月 23 日放假至 2 月 21 日（共 30 天）；除夕 2 月 5 日，春节 2 月 6 日（第 15 天）
// 分段：年前 1/23—2/3（12 天）主攻弱科；春节前后 2/4—2/12（9 天）每天 1 小时；年后 2/13—2/21（9 天）预习 + 收心。分段为建议
(function (root) {
  const DAY = 864e5, MON = Date.UTC(2027, 0, 18), START = Date.UTC(2027, 0, 23), END = Date.UTC(2027, 1, 21);
  const P = [[Date.UTC(2027, 0, 23), Date.UTC(2027, 1, 3), '#BFDBFE', '年前 12 天', '主攻一门弱科'],
    [Date.UTC(2027, 1, 4), Date.UTC(2027, 1, 12), '#FECACA', '春节前后 9 天', '每天 1 小时，别断'],
    [Date.UTC(2027, 1, 13), Date.UTC(2027, 1, 21), '#BBF7D0', '年后 9 天', '预习新学期 + 收心']];
  const SPECIAL = { [Date.UTC(2027, 1, 5)]: '除夕', [Date.UTC(2027, 1, 6)]: '春节' };

  const EP = {
    id: 'N3',
    title: '寒假30天按三段排',
    theme: 'corkboard',
    voice: { sid: 40 },
    capY: 360, capSize: 60,
    music: { style: 'pulse', bpm: 96, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'p1',
    beats: [
      { id: 'hook', min: 3.6, cap: ['寒假 30 天，', '春节正好在{第 15 天}。'], voice: '寒假三十天，春节正好在第十五天。', mood: 0.35, sfx: [{ at: 0.6, type: 'ticks', n: 15, gap: 0.08 }] },
      { id: 'split', min: 3.6, cap: ['所以别按"30 天"排，', '按{三段}排。'], voice: '所以别按三十天排，按三段排。', mood: 0.45 },
      { id: 'p1', min: 4.0, cap: ['年前 12 天：{整块时间}最多，', '主攻一门弱科。'], voice: '年前十二天，整块的时间最多，主攻一门弱科。', mood: 0.6, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'p2', min: 4.0, cap: ['春节前后 9 天：走亲戚、过年，', '每天{一小时}，别断。'], voice: '春节前后九天，走亲戚，过年，每天一小时，别断。', mood: 0.5, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'p3', min: 4.0, cap: ['年后 9 天：{预习新学期}，', '把作息改回上学时间。'], voice: '年后九天，预习新学期，把作息改回上学时间。', mood: 0.7, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'flip', min: 3.6, cap: ['寒假最怕的，', '是年前没开始，年后[来不及]。'], voice: '寒假最怕的，是年前没开始，年后来不及。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '寒假分三段，年前先发力。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '一二三四五六日除夕春节年前后天主攻一门弱科每小时别断预习新学期收心以月日放假共为例各地时间不同寒假分三段先发力0123456789/',
  };

  const GX = 120, CW = 120, GY = 600, RH = 128;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const hk = b('hook'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    ctx.fillStyle = th.fg; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'center';
    '一二三四五六日'.split('').forEach((d, i) => ctx.fillText(d, GX + i * CW + CW / 2, GY - 16));
    const phaseOn = k => t > b('p' + (k + 1)).s + 0.3;
    for (let i = 0; i < 35; i++) {
      const d = MON + i * DAY, x = GX + (i % 7) * CW, y = GY + Math.floor(i / 7) * RH;
      const inside = d >= START && d <= END, n = Math.round((d - START) / DAY) + 1;
      const a = inside ? E.seg(t, hk.s + 0.4 + (n - 1) * 0.06, hk.s + 0.6 + (n - 1) * 0.06) : 0.35;
      if (a <= 0) continue;
      let col = '#FFFDF6';
      P.forEach(([s0, s1, c], k) => { if (d >= s0 && d <= s1 && phaseOn(k)) col = c; });
      const rot = ((i * 37) % 7 - 3) * 0.006;
      E.note(ctx, x + 8, y + 8, CW - 16, RH - 16, inside ? col : 'rgba(255,253,246,0.4)', rot, null, a);
      const dt = new Date(d);
      ctx.globalAlpha = sceneA * a; ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.num}`; ctx.textAlign = 'left';
      ctx.fillText((dt.getUTCMonth() + 1) + '/' + dt.getUTCDate(), x + 20, y + 48);
      if (SPECIAL[d]) { ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.fillText(SPECIAL[d], x + 20, y + 92); }
      if (inside && n === 15 && t > hk.s + 1.6) { ctx.strokeStyle = th.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x + CW / 2, y + RH / 2, CW / 2 + 4, RH / 2 - 2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = th.red; ctx.font = `700 24px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText('第 15 天', x + CW - 12, y + 112); }
      ctx.globalAlpha = sceneA;
    }
    // 三段便签
    P.forEach(([, , c, name, task], k) => {
      if (!phaseOn(k)) return;
      const a = E.seg(t, b('p' + (k + 1)).s + 0.3, b('p' + (k + 1)).s + 0.7);
      const x = 100 + k * 300, y = 1290;
      E.note(ctx, x, y, 280, 190, c, (k - 1) * 0.03, '#C2410C', a);
      ctx.globalAlpha = sceneA * a; ctx.fillStyle = th.fg; ctx.textAlign = 'center';
      ctx.font = `700 34px ${th.cap}`; ctx.fillText(name, x + 140, y + 90);
      ctx.font = `500 26px ${th.cap}`; ctx.fillText(task, x + 140, y + 138);
      ctx.globalAlpha = sceneA;
    });
    // 翻转：年前划掉 → 来不及
    const fA = E.seg(t, fl.s + 0.4, fl.s + 0.9);
    if (fA > 0) { ctx.globalAlpha = sceneA * fA; ctx.fillStyle = th.red; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('年前是最大的一整块时间', 540, 1550); }
    ctx.globalAlpha = sceneA * 0.9; ctx.fillStyle = th.fg; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('以 2027 年 1 月 23 日放假、共 30 天为例；春节 2 月 6 日；各地放假时间不同', 540, 1690);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.note(ctx, 110, 850, 860, 420, '#FFFDF6', -0.01, '#C2410C', E.seg(t, ac.s, ac.s + 0.3));
        E.rich(ctx, '寒假分三段，', 540, 1000, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{年前先发力}。', 540, 1150, { theme: th, size: 108, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
