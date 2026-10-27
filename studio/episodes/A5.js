// A5《高三还剩多少个周末》时间类 · 杂志排版风
// 日历计算：从 2026-10-31（周六）起，到 2027-06-07 高考前，共 32 个周末（最后一个是 6 月 5 日—6 日）
// 2027 年春节为 2 月 6 日（周六）；2 月 27 日距高考正好 100 天（同 I4）
(function (root) {
  const START = Date.UTC(2026, 9, 31), GAOKAO = Date.UTC(2027, 5, 7), DAY = 864e5;
  const SATS = [];
  for (let d = START; d < GAOKAO - DAY; d += 7 * DAY) { const x = new Date(d); SATS.push({ m: x.getUTCMonth() + 1, d: x.getUTCDate() }); }
  const N = SATS.length; // 32
  // 按月分行：10 月 31 日并入 11 月那一行
  const ROWS = [];
  SATS.forEach((s, i) => {
    const key = s.m === 10 ? 11 : s.m;
    let row = ROWS.find(r => r.key === key);
    if (!row) ROWS.push(row = { key, items: [] });
    row.items.push({ ...s, i });
  });
  const SPECIAL = { '2/6': '春节', '2/27': '百日', '6/5': '高考前' };

  const EP = {
    id: 'A5',
    title: '高三还剩多少个周末',
    theme: 'magazine',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'count',
    beats: [
      { id: 'hook', min: 3.0, cap: ['高三的你，', '离高考还剩{几个周末}？'], voice: '高三的你，离高考还剩几个周末？', mood: 0.3 },
      { id: 'count', min: 4.0, cap: ['从这个周末算到高考：', '只剩 [' + N + ' 个]。'], voice: '从这个周末算到高考，只剩三十二个。', mood: 0.55, sfx: [{ at: 0.4, type: 'ticks', n: 32, gap: 0.05 }] },
      { id: 'marks', min: 4.6, cap: ['其中一个是{春节}，一个是{百日倒计时}，', '最后一个，紧挨着高考。'], voice: '其中一个是春节，一个是高考倒计时一百天，最后一个，紧挨着高考。', mood: 0.6, sfx: [{ at: 0.6, type: 'tick' }, { at: 1.6, type: 'tick' }, { at: 3.0, type: 'ding' }] },
      { id: 'blink', min: 3.8, cap: ['周末一眨眼就过去，', N + ' 个，就是 [' + N + ' 次眨眼]。'], voice: '周末一眨眼就过去，三十二个，就是三十二次眨眼。', mood: 0.8, sfx: [{ at: 0.4, type: 'ticks', n: 32, gap: 0.075 }] },
      { id: 'flip', min: 3.4, cap: ['不是还有很久，', '是只剩 {' + N + ' 次}。'], voice: '不是还有很久，是只剩三十二次。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '用好这个周末，就是用好三十二分之一。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '月周末剩余个春节百日高考前按年日周六起算至分之一用好这0123456789/–（）',
  };

  const RY0 = 640, RH = 108, CX0 = 300, CW = 122, CG = 18, CH = 78;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const ct = b('count'), mk = b('marks'), bl = b('blink'), fl = b('flip');
    // 卡片出现、眨眼熄灭、重新点亮
    const shown = i => E.seg(t, ct.s + 0.4 + i * 0.05, ct.s + 0.6 + i * 0.05);
    const gone = i => E.seg(t, bl.s + 0.4 + i * 0.075, bl.s + 0.5 + i * 0.075) * (1 - E.seg(t, fl.s + 0.1 + i * 0.02, fl.s + 0.4 + i * 0.02));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 栏目标题
      ctx.fillStyle = th.fg; ctx.font = `900 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('WEEKENDS LEFT · 剩余周末', 120, 590);
      ctx.fillRect(120, 604, 840, 3);
      ROWS.forEach((row, ri) => {
        const y = RY0 + ri * RH;
        ctx.globalAlpha = sceneA * E.seg(t, ct.s + 0.2 + ri * 0.1, ct.s + 0.5 + ri * 0.1);
        ctx.fillStyle = th.dim; ctx.font = `700 34px ${th.num}`; ctx.textAlign = 'right';
        ctx.fillText(row.key === 11 ? '10–11 月' : row.key + ' 月', CX0 - 30, y + 52);
        row.items.forEach((s, k) => {
          const a = shown(s.i), g = gone(s.i), key = s.m + '/' + s.d, sp = SPECIAL[key];
          if (a <= 0) return;
          const x = CX0 + k * (CW + CG);
          const spA = sp ? E.seg(t, mk.s + 0.5 + (key === '2/27' ? 1.0 : key === '6/5' ? 2.4 : 0), mk.s + 0.9 + (key === '2/27' ? 1.0 : key === '6/5' ? 2.4 : 0)) : 0;
          ctx.globalAlpha = sceneA * a * (1 - 0.82 * g);
          ctx.fillStyle = spA > 0.5 ? th.red : th.fg;
          ctx.beginPath(); ctx.roundRect(x, y + (1 - a) * 20, CW, CH, 6); ctx.fill();
          ctx.fillStyle = th.bg; ctx.font = `700 32px ${th.num}`; ctx.textAlign = 'center';
          ctx.fillText(key, x + CW / 2, y + (sp && spA > 0 ? 36 : 50) + (1 - a) * 20);
          if (sp && spA > 0) { ctx.globalAlpha = sceneA * a * spA * (1 - 0.82 * g); ctx.font = `700 22px ${th.cap}`; ctx.fillText(sp, x + CW / 2, y + 66); }
        });
      });
      // 计数
      let left = 0; for (let i = 0; i < N; i++) left += shown(i) >= 1 ? 1 - (gone(i) > 0.5 ? 1 : 0) : 0;
      if (t > ct.s + 0.4) {
        ctx.globalAlpha = sceneA; ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('还剩', 120, 1590);
        ctx.fillStyle = left < 8 && t > bl.s ? th.red : th.fg; ctx.font = `700 120px ${th.num}`; ctx.fillText(String(left), 200, 1590);
        const nw = ctx.measureText(String(left)).width;
        ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.cap}`; ctx.fillText('个周末', 200 + nw + 16, 1590);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'right';
      ctx.fillText('按 2026 年 10 月 31 日（周六）起算，至 2027 年 6 月 7 日高考前', 960, 1660);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '用好这个周末，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '就是用好 {32 分之一}。', 540, 1030, { theme: th, size: 100, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
