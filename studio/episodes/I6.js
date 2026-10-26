// I6《开学前，先把生物钟拨回来》窗口期类 · 晨光风
// 示例：寒假 1:30 睡、9:30 起；上学 22:30 睡、6:30 起，相差 3 小时。按倒时差经验，每天约能调整 1 小时（因人而异），至少提前 3 天开始
(function (root) {
  const EP = {
    id: 'I6',
    title: '开学前先把生物钟拨回来',
    theme: 'sunrise',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 92, chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'Bm', 'G', 'A'] },
    cover: 'plan',
    beats: [
      { id: 'hook', min: 3.0, cap: ['寒假天天熬夜，', '开学第一天{起不来}？'], voice: '寒假天天熬夜，开学第一天起不来？', mood: 0.3 },
      { id: 'gap', min: 5.0, cap: ['寒假：凌晨 1:30 睡，上午 9:30 起；', '上学：晚上 10:30 睡，早上 6:30 起。'], voice: '寒假，凌晨一点半睡，上午九点半起。上学，晚上十点半睡，早上六点半起。', mood: 0.4 },
      { id: 'diff', min: 2.6, cap: ['生物钟，差了整整 [3 小时]。'], voice: '生物钟，差了整整三个小时。', mood: 0.6, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'rule', min: 3.4, cap: ['倒时差的经验是：', '身体一天大约只能调 {1 小时}。'], voice: '倒时差的经验是，身体一天大约只能调一个小时。', mood: 0.45 },
      { id: 'plan', min: 4.4, cap: ['所以，至少提前 {3 天}开始：', '每天早睡早起 1 小时。'], voice: '所以，至少提前三天开始，每天早睡早起一小时。', mood: 0.7, sfx: [{ at: 0.6, type: 'ticks', n: 3, gap: 1.0 }] },
      { id: 'flip', min: 3.4, cap: ['开学第一周的状态，', '是在开学{前一周}定下的。'], voice: '开学第一周的状态，是在开学前一周定下的。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '先把生物钟，拨回开学模式。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '寒假上学睡起开学前天第一二三倒数调整幅度为经验值因人而异0123456789:—生物钟拨回模式',
  };

  const ang = h => -Math.PI / 2 + (h / 24) * Math.PI * 2;
  function dial(ctx, th, cx, cy, R, sleep, wake, col, label, a) {
    ctx.save(); ctx.globalAlpha = a;
    E2.glassCard(ctx, cx - R - 40, cy - R - 40, 2 * R + 80, 2 * R + 80, a, R + 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 30; ctx.shadowColor = col; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(cx, cy, R, ang(sleep), ang(wake < sleep ? wake + 24 : wake)); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'center';
    [0, 6, 12, 18].forEach(h => ctx.fillText(String(h), cx + Math.cos(ang(h)) * (R - 46), cy + Math.sin(ang(h)) * (R - 46) + 8));
    const fmt = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return hh + ':' + String(mm).padStart(2, '0'); };
    ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.cap}`; ctx.fillText(label, cx, cy - 10);
    ctx.font = `500 26px ${th.mono}`; ctx.fillText(fmt(sleep) + ' — ' + fmt(wake), cx, cy + 34);
    ctx.restore();
  }
  let E2 = null;

  EP.draw = function (ctx, t, TL, th, E) {
    E2 = E;
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    // 两个表盘：寒假 vs 上学
    const g = b('gap');
    const twoA = E.seg(t, g.s + 0.2, g.s + 0.8) * (1 - E.seg(t, b('plan').s - 0.2, b('plan').s + 0.3));
    if (twoA > 0) {
      dial(ctx, th, 290, 900, 190, 1.5, 9.5, th.red, '寒假', twoA);
      dial(ctx, th, 790, 900, 190, 22.5, 6.5, th.gold, '上学', twoA * E.seg(t, g.s + 2.4, g.s + 3.0));
      const dA = E.seg(t, b('diff').s + 0.2, b('diff').s + 0.6);
      if (dA > 0) E.bigNumber(ctx, th, '−3 小时', 540, 1320, { size: 120, alpha: twoA * dA, color: th.red, top: '#FFC2B8' });
      const rA = E.seg(t, b('rule').s + 0.2, b('rule').s + 0.6);
      if (rA > 0) { ctx.save(); ctx.globalAlpha = twoA * rA; ctx.fillStyle = th.fg; ctx.font = `700 52px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('每天约 1 小时', 540, 1460); ctx.restore(); }
    }
    // 三天计划：一个表盘逐日前移
    const pl = b('plan');
    const pA = E.seg(t, pl.s, pl.s + 0.5) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    if (pA > 0) {
      const steps = Math.min(3, Math.max(0, (t - pl.s - 0.6) / 1.0));
      const k = Math.floor(steps) + E.ease.inOut(steps % 1);
      const sleep = 1.5 - Math.min(3, k), wake = 9.5 - Math.min(3, k);
      dial(ctx, th, 540, 960, 230, sleep, wake, E.lerp(0, 1, k / 3) > 0.99 ? th.gold : '#FFB27A', k >= 3 ? '开学模式' : '调整中', pA);
      ctx.save(); ctx.globalAlpha = pA;
      ['开学前 3 天', '前 2 天', '前 1 天'].forEach((s, i) => {
        const on = k >= i + 0.5;
        E.glassCard(ctx, 150 + i * 270, 1340, 240, 110, pA * (on ? 1 : 0.5), 24);
        ctx.fillStyle = on ? th.gold : th.dim; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(s, 270 + i * 270, 1385);
        ctx.font = `500 26px ${th.mono}`; ctx.fillText('提前 ' + (i + 1) + ' 小时', 270 + i * 270, 1428);
      });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, b('rule').s, b('rule').s + 0.5) * (1 - E.seg(t, b('action').s, b('action').s + 0.3)); ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('作息为示例；每天约调整 1 小时为倒时差经验值，因人而异', 540, 1580); ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先把生物钟，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '拨回{开学模式}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
