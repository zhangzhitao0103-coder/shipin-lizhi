// J5《每个高手，都从摔倒开始》你也可以类 · 纸雕风（期中考后）
// 依据：Adolph 等（2012，Psychological Science）观察 12–19 个月的婴儿自由活动：平均每小时走 2368 步、摔倒 17 次；
// 论文标题即"每天数千步、摔倒几十次"
(function (root) {
  const STEPS = 2368, FALLS = 17, COLS = 56;
  const FALL_AT = (() => { const r = (() => { let s = 77; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })(); const set = new Set(); while (set.size < FALLS) set.add(Math.floor(60 + r() * (STEPS - 120))); return set; })();

  const EP = {
    id: 'J5',
    title: '每个高手都从摔倒开始',
    theme: 'paper',
    voice: { sid: 40 },
    capY: 370, capSize: 62,
    music: { style: 'bell', bpm: 92, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'data',
    beats: [
      { id: 'hook', min: 3.0, cap: ['你学走路的时候，', '{摔了多少次}？'], voice: '你学走路的时候，摔了多少次？', mood: 0.3 },
      { id: 'data', min: 5.0, cap: ['研究记录：刚学走路的宝宝，', '平均每小时走 {2368 步}，[摔倒 17 次]。'], voice: '研究记录，刚学走路的宝宝，平均每小时走两千三百六十八步，摔倒十七次。', mood: 0.55, sfx: [{ at: 0.6, type: 'ticks', n: 17, gap: 0.16 }] },
      { id: 'day', min: 3.0, cap: ['一天下来，', '要摔{几十次}。'], voice: '一天下来，要摔几十次。', mood: 0.6 },
      { id: 'never', min: 3.6, cap: ['可是没有一个宝宝，', '因为摔倒就[不学走路了]。'], voice: '可是没有一个宝宝，因为摔倒，就不学走路了。', mood: 0.7 },
      { id: 'flip', min: 3.4, cap: ['每个会走路的人，', '都是从{摔倒}开始的。'], voice: '每个会走路的人，都是从摔倒开始的。', mood: 0.8 },
      { id: 'you', min: 3.8, cap: ['做错的题、考砸的试，', '都是学走路时的{又一次摔倒}。'], voice: '做错的题，考砸的试，都是学走路时的又一次摔倒。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '摔倒了，就再站起来。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '步摔倒次每小时一天个月婴儿自由活动平均研究宝宝就再站起来示意小时0123456789·–（）',
  };

  const GX0 = 140, GY0 = 640, SX = 14.3, SY = 16.5;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const dt = b('data'), dy = b('day'), nv = b('never'), fl = b('flip'), yo = b('you');
    // 1) 点阵：2368 步 + 17 次摔倒
    const gA = E.seg(t, 0.3, 0.8) * (1 - E.seg(t, nv.s, nv.s + 0.5));
    if (gA > 0) {
      const fill = E.seg(t, dt.s + 0.5, dt.s + 3.4), shown = Math.floor(STEPS * fill);
      const shrink = E.ease.inOut(E.seg(t, dy.s + 0.2, dy.s + 1.0));
      ctx.save();
      // 一天里的多个"小时块"
      const tiles = shrink > 0 ? 4 : 1;
      for (let k = 0; k < tiles; k++) {
        const s = E.lerp(1, 0.42, shrink);
        const ox = E.lerp(0, k % 2 ? 470 : 70, shrink) + (k === 0 ? 0 : 0), oy = E.lerp(0, Math.floor(k / 2) * 380, shrink);
        const ta = k === 0 ? 1 : E.seg(t, dy.s + 0.8 + k * 0.25, dy.s + 1.2 + k * 0.25);
        if (ta <= 0) continue;
        ctx.save(); ctx.translate(GX0 + ox, GY0 + oy); ctx.scale(s, s); ctx.globalAlpha = gA * ta;
        for (let i = 0; i < STEPS; i++) {
          if (k === 0 && i >= shown) break;
          const x = (i % COLS) * SX, y = Math.floor(i / COLS) * SY;
          if (FALL_AT.has(i)) continue;
          ctx.fillStyle = 'rgba(61,139,131,0.55)'; ctx.fillRect(x, y, 8, 8);
        }
        FALL_AT.forEach(i => {
          if (k === 0 && i >= shown) return;
          const x = (i % COLS) * SX + 4, y = Math.floor(i / COLS) * SY + 4;
          ctx.fillStyle = th.gold; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
        });
        if (shrink > 0) { ctx.globalAlpha = gA * ta * shrink; ctx.fillStyle = th.fg; ctx.font = `700 64px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('第 ' + (k + 1) + ' 小时', 0, 770); }
        ctx.restore();
      }
      // 计数
      const fallsShown = [...FALL_AT].filter(i => i < shown).length;
      ctx.globalAlpha = gA * (1 - shrink) * E.seg(t, dt.s + 0.3, dt.s + 0.7); ctx.textAlign = 'left';
      ctx.fillStyle = th.teal; ctx.font = `700 54px ${th.num}`; ctx.fillText(E.fmt(shown) + ' 步', GX0, 1420);
      ctx.fillStyle = th.gold; ctx.textAlign = 'right'; ctx.fillText('摔倒 ' + fallsShown + ' 次', 940, 1420);
      ctx.fillStyle = th.dim; ctx.font = `400 24px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('每小时 · 1 格 = 1 步 · 橙点 = 摔倒', GX0, 1470);
      if (shrink > 0) { ctx.globalAlpha = gA * E.seg(t, dy.s + 1.8, dy.s + 2.2); ctx.fillStyle = th.dim; ctx.font = `700 60px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('……', 540, 1460); }
      ctx.restore();
    }
    // 2) 脚印：摔倒（橙色星）之后，脚印继续向前
    const pA = E.seg(t, nv.s + 0.3, nv.s + 0.8) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (pA > 0) {
      const walk = E.seg(t, nv.s + 0.5, yo.e - 0.5);
      const pts = []; for (let i = 0; i < 22; i++) { const u = i / 21; pts.push([150 + u * 780, 1380 - u * 640 + Math.sin(u * 9) * 60]); }
      const falls = [5, 11, 16];
      ctx.save();
      pts.forEach(([x, y], i) => {
        const a = E.seg(walk * 22, i, i + 0.6);
        if (a <= 0) return;
        ctx.globalAlpha = pA * a;
        if (falls.includes(i)) {
          ctx.fillStyle = th.gold; ctx.beginPath();
          for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, ang = (k / 10) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(x + r * Math.cos(ang), y + r * Math.sin(ang)); }
          ctx.fill(); return;
        }
        const side = i % 2 ? 1 : -1, [nx, ny] = pts[Math.min(21, i + 1)], ang = Math.atan2(ny - y, nx - x);
        ctx.save(); ctx.translate(x - Math.sin(ang) * side * 18, y + Math.cos(ang) * side * 18); ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = th.fg; ctx.shadowColor = 'rgba(80,50,30,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
        ctx.beginPath(); ctx.ellipse(0, 4, 12, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -20, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, dt.s, dt.s + 0.5) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Adolph 等（2012）：12–19 个月婴儿自由活动，平均每小时 2368 步、摔倒 17 次', 540, 1560);
    ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '摔倒了，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{就再站起来}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
