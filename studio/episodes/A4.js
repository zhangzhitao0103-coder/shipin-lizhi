// A4《每天刷 2 小时手机，三年是多少》时间类 · 玻璃拟态风
// 计算：2 小时 × 365 = 730 小时；× 1095 天（三年）= 2190 小时 ≈ 91.25 天；寒假按约 30 天计，三个寒假 ≈ 90 天
// 每天少刷 30 分钟：0.5 × 1095 = 547.5 小时 ≈ 22.8 天
(function (root) {
  const EP = {
    id: 'A4',
    title: '每天刷2小时手机三年是多少',
    theme: 'glass',
    voice: { sid: 30 },
    capY: 360, capSize: 62,
    music: { style: 'lofi', bpm: 78, chords: ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Bb', 'C', 'Fm', 'Db', 'Ab', 'Eb'] },
    cover: 'three',
    beats: [
      { id: 'hook', min: 3.0, cap: ['每天刷 2 小时手机，', '{好像也不多}？'], voice: '每天刷两个小时手机，好像也不多？', mood: 0.3 },
      { id: 'year', min: 3.4, cap: ['一年 365 天：', '就是 {730 小时}。'], voice: '一年三百六十五天，就是七百三十个小时。', mood: 0.45, sfx: [{ at: 0.4, type: 'ticks', n: 12, gap: 0.1 }] },
      { id: 'three', min: 4.2, cap: ['高中三年：{2190 小时}，', '相当于 [91 天] 不吃不睡。'], voice: '高中三年，两千一百九十个小时，相当于九十一天不吃不睡。', mood: 0.75, sfx: [{ at: 0.4, type: 'ticks', n: 18, gap: 0.08 }, { at: 2.4, type: 'boom' }] },
      { id: 'compare', min: 3.8, cap: ['91 天，', '比{三个寒假}加起来还多。'], voice: '九十一天，比三个寒假加起来还多。', mood: 0.8 },
      { id: 'turn', min: 4.4, cap: ['不用戒掉，每天少刷 {30 分钟}：', '三年就能多出 {547 小时}。'], voice: '不用戒掉，每天少刷三十分钟，三年就能多出五百四十七个小时。', mood: 0.6, sfx: [{ at: 1.8, type: 'ding' }] },
      { id: 'flip', min: 3.4, cap: ['手机不会偷走你的时间，', '是你{亲手交出去的}。'], voice: '手机不会偷走你的时间，是你亲手交出去的。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '今晚，先少刷半小时。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '屏幕使用时间小时天日均每年高中三年寒假约少刷分钟多出相当于不吃不睡今晚先半时按计算0123456789.×≈+−',
  };

  const PX = 290, PY = 560, PW = 500, PH = 960;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 0.1, b('flip').s + 0.5)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const yr = b('year'), tr = b('three'), cp = b('compare'), tn = b('turn');
    if (sceneA > 0) {
      // 手机
      E.glassCard(ctx, PX, PY, PW, PH, sceneA, 64);
      ctx.save(); ctx.globalAlpha = sceneA;
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.roundRect(PX + PW / 2 - 60, PY + 22, 120, 14, 7); ctx.fill();
      ctx.fillStyle = th.dim; ctx.font = `500 32px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('屏幕使用时间', PX + PW / 2, PY + 110);
      // 累计小时数
      let hrs = 2, unit = '小时 / 天';
      if (t > yr.s + 0.3) { hrs = Math.round(730 * E.ease.inOut(E.seg(t, yr.s + 0.3, yr.s + 1.6))); unit = '小时 / 年'; }
      if (t > tr.s + 0.3) { hrs = Math.round(E.lerp(730, 2190, E.ease.inOut(E.seg(t, tr.s + 0.3, tr.s + 1.8)))); unit = '小时 / 三年'; }
      const toDays = E.seg(t, tr.s + 2.2, tr.s + 2.7);
      ctx.fillStyle = toDays > 0.5 ? th.red : th.fg; ctx.font = `700 132px ${th.num}`; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 30 * th.glow;
      ctx.fillText(toDays > 0.5 ? '91' : E.fmt(hrs), PX + PW / 2, PY + 270); ctx.shadowBlur = 0;
      ctx.fillStyle = th.dim; ctx.font = `500 30px ${th.cap}`; ctx.fillText(toDays > 0.5 ? '天 · 不吃不睡' : unit, PX + PW / 2, PY + 325);
      // 每日条形：2 小时 / 24 小时
      const bx = PX + 50, bw = PW - 100, by = PY + 380;
      ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, 26, 13); ctx.fill();
      ctx.fillStyle = th.red; ctx.beginPath(); ctx.roundRect(bx, by, bw * (2 / 24), 26, 13); ctx.fill();
      ctx.fillStyle = th.dim; ctx.font = `400 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('每天 2 / 24 小时', bx, by + 62);
      // 91 天点阵（13 × 7）
      const dA = E.seg(t, tr.s + 2.2, tr.s + 3.0) * (1 - E.seg(t, cp.s + 0.1, cp.s + 0.5));
      if (dA > 0) {
        for (let i = 0; i < 91; i++) {
          const c = i % 13, r = Math.floor(i / 13), on = E.seg(t, tr.s + 2.2 + i * 0.012, tr.s + 2.4 + i * 0.012);
          ctx.globalAlpha = sceneA * dA * on; ctx.fillStyle = th.red;
          ctx.beginPath(); ctx.roundRect(bx + c * 31 + 4, by + 110 + r * 31, 24, 24, 6); ctx.fill();
        }
        ctx.globalAlpha = sceneA * dA; ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('1 格 = 1 天', bx, by + 360);
      }
      // 对比：91 天 vs 3 个寒假
      const cA = E.seg(t, cp.s + 0.3, cp.s + 0.8) * (1 - E.seg(t, tn.s, tn.s + 0.4));
      if (cA > 0) {
        const sc = bw / 95, y1 = by + 140, y2 = by + 260;
        ctx.globalAlpha = sceneA * cA; ctx.fillStyle = th.fg; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left';
        ctx.fillText('刷手机 91 天', bx, y1 - 14);
        ctx.fillStyle = th.red; ctx.beginPath(); ctx.roundRect(bx, y1, 91 * sc * E.ease.out(E.seg(t, cp.s + 0.4, cp.s + 1.2)), 44, 10); ctx.fill();
        ctx.fillStyle = th.fg; ctx.fillText('寒假 × 3 ≈ 90 天', bx, y2 - 14);
        for (let k = 0; k < 3; k++) {
          const g = E.ease.out(E.seg(t, cp.s + 0.8 + k * 0.3, cp.s + 1.2 + k * 0.3));
          ctx.fillStyle = k % 2 ? th.gold : '#9FD8FF'; ctx.globalAlpha = sceneA * cA * g;
          ctx.beginPath(); ctx.roundRect(bx + k * 30 * sc + 2, y2, 30 * sc - 4, 44, 10); ctx.fill();
        }
        ctx.globalAlpha = sceneA * cA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.cap}`; ctx.fillText('寒假按约 30 天计', bx, y2 + 84);
      }
      // 少刷 30 分钟
      const tA = E.seg(t, tn.s + 0.3, tn.s + 0.8);
      if (tA > 0) {
        ctx.globalAlpha = sceneA * tA; ctx.textAlign = 'center';
        ctx.fillStyle = th.fg; ctx.font = `500 32px ${th.cap}`; ctx.fillText('每天 − 30 分钟', PX + PW / 2, by + 170);
        const k = E.ease.out(E.seg(t, tn.s + 1.2, tn.s + 2.2));
        ctx.fillStyle = th.gold; ctx.font = `700 96px ${th.num}`; ctx.shadowColor = th.gold; ctx.shadowBlur = 30 * th.glow;
        ctx.fillText('+' + Math.round(547 * k), PX + PW / 2, by + 300); ctx.shadowBlur = 0;
        ctx.fillStyle = th.fg; ctx.font = `500 30px ${th.cap}`; ctx.fillText('小时 / 三年 ≈ 23 天', PX + PW / 2, by + 360);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('计算：2 小时 × 1095 天 = 2190 小时 ≈ 91 天；0.5 小时 × 1095 天 ≈ 547 小时', 540, 1640);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '今晚，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{先少刷半小时}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
