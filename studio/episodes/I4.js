// I4《最后 100 天》窗口期类 · 暗金电影风
// 计算：2027-02-27 至 2027-06-07 正好 100 天；按每天学习 12 小时估算 1200 小时，平均到 6 科每科 200 小时
(function (root) {
  const EP = {
    id: 'I4',
    title: '最后100天',
    theme: 'cinema',
    voice: { sid: 58 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', 'Eb', 'Bb'] },
    cover: 'hours',
    beats: [
      { id: 'hook', min: 3.4, cap: ['2027 年 2 月 27 日，', '距离高考正好 {100} 天。'], voice: '二零二七年二月二十七日，距离高考，正好一百天。', mood: 0.4, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'cells', min: 3.4, cap: ['100 天，100 个格子。', '每过一天，就少 {1%}。'], voice: '一百天，一百个格子。每过一天，就少百分之一。', mood: 0.5, sfx: [{ at: 0.6, type: 'ticks', n: 10, gap: 0.12 }] },
      { id: 'hours', min: 3.2, cap: ['每天学 12 小时，', '100 天就是 {1200} 小时。'], voice: '每天学十二小时，一百天就是一千二百小时。', mood: 0.7 },
      { id: 'subj', min: 3.2, cap: ['平均到 6 科，', '每科还有 {200} 小时。'], voice: '平均到六科，每科还有两百小时。', mood: 0.7, sfx: [{ at: 0.4, type: 'ticks', n: 6, gap: 0.15 }] },
      { id: 'flip', min: 3.6, cap: ['最后 100 天，', '不是倒数的[终点]，是冲刺的{起点}。'], voice: '最后一百天，不是倒数的终点，是冲刺的起点。', mood: 0.8 },
      { id: 'quote', min: 3.2, cap: ['把这 100 天，', '过成 {100 次进步}。'], voice: '把这一百天，过成一百次进步。', mood: 0.9, capY: 880, capSize: 80 },
      { id: 'action', min: 3.0, cap: null, voice: '最后一百天，每一天都算数。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '语数英物化生小时天每科按每天学习估算最后一都算0123456789.-',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.background(ctx, th, t, { glow: 'rgba(90,40,20,0.35)' });
    const endDim = 1 - 0.85 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.4);
    // 大号 100
    const hk = b('hook');
    const hA = E.seg(t, 0.1, 0.5) * (1 - E.seg(t, b('cells').s - 0.2, b('cells').s + 0.3));
    if (hA > 0) {
      E.bigNumber(ctx, th, '100', 540, 1120, { size: 360, alpha: hA, scale: 1 + 0.05 * (1 - E.seg(t, hk.s + 0.3, hk.s + 1.0)) });
      ctx.save(); ctx.globalAlpha = hA; ctx.fillStyle = th.dim; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('2027.2.27 → 2027.6.7', 540, 1220); ctx.restore();
    }
    // 10×10 格子
    const cb = b('cells');
    const gA = E.seg(t, cb.s - 0.2, cb.s + 0.3) * (1 - E.seg(t, b('subj').s - 0.1, b('subj').s + 0.3)) * endDim;
    if (gA > 0) {
      ctx.save();
      const P = 72, S = 60, x0 = 540 - 5 * P + 6, y0 = 640;
      const off = Math.floor(4 * E.seg(t, cb.s + 1.4, cb.e));
      for (let i = 0; i < 100; i++) {
        const ap = E.seg(t, cb.s - 0.1 + i * 0.008, cb.s + 0.2 + i * 0.008);
        const gone = i < off;
        ctx.globalAlpha = gA * ap; ctx.fillStyle = gone ? '#2A2925' : th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = gone ? 0 : 10;
        ctx.fillRect(x0 + (i % 10) * P, y0 + Math.floor(i / 10) * P, S, S);
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = gA; ctx.fillStyle = th.fg; ctx.font = `700 54px ${th.num}`; ctx.textAlign = 'center';
      const hrs = Math.round(1200 * E.ease.inOut(E.seg(t, b('hours').s + 0.2, b('hours').s + 1.6)));
      ctx.fillText(t > b('hours').s ? hrs + ' 小时' : (100 - off) + ' 天', 540, 1450);
      ctx.restore();
    }
    // 6 科 × 200 小时
    const sb = b('subj');
    const sA = E.seg(t, sb.s, sb.s + 0.4) * (1 - E.seg(t, b('flip').s + 0.4, b('flip').s + 0.9)) * endDim;
    if (sA > 0) {
      ctx.save(); ctx.globalAlpha = sA;
      ['语', '数', '英', '物', '化', '生'].forEach((s, i) => {
        const p = E.ease.out(E.seg(t, sb.s + 0.3 + i * 0.15, sb.s + 0.8 + i * 0.15));
        const x = 170 + i * 150, h = 520 * p;
        ctx.fillStyle = th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = 16; ctx.fillRect(x - 40, 1340 - h, 80, h); ctx.shadowBlur = 0;
        ctx.fillStyle = th.fg; ctx.font = `700 44px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(s, x, 1400);
        ctx.font = `700 30px ${th.mono}`; ctx.fillText(Math.round(200 * p) + 'h', x, 1320 - h);
      });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.8 * E.seg(t, b('hours').s, b('hours').s + 0.5) * endDim; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('按每天学习 12 小时估算', 540, 1600); ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '最后 100 天，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{每一天都算数}。', 540, 1030, { theme: th, size: 110, tt: t - ac.s - 0.6, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
