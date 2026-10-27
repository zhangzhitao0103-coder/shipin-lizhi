// N2《寒假计划，写清"几点、在哪"》寒假规划类 · 冬日雪景风
// 依据：Gollwitzer & Brandstätter（1997）研究 1：大学生在圣诞假期前各定一个"难完成的计划"；
// 写下"什么时候、在哪里开始"的，假期结束时完成 62%；只写目标的完成 22%（执行意图）
(function (root) {
  const EP = {
    id: 'N2',
    title: '寒假计划写清几点在哪',
    theme: 'winter',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'Bm', 'C', 'D'] },
    cover: 'result',
    beats: [
      { id: 'hook', min: 3.4, cap: ['寒假计划写"每天背单词"，', '为什么[坚持不了几天]？'], voice: '寒假计划写每天背单词，为什么坚持不了几天？', mood: 0.3 },
      { id: 'exp', min: 4.6, cap: ['心理学家在圣诞假期前，', '让大学生各定一个{难完成的计划}。'], voice: '心理学家在圣诞假期前，让大学生各定一个难完成的计划。', mood: 0.4 },
      { id: 'result', min: 5.0, cap: ['只写了"要做"的：完成 [22%]；', '写清"{什么时候、在哪里}"的：完成 {62%}。'], voice: '只写了要做的，完成百分之二十二。写清什么时候、在哪里做的，完成百分之六十二。', mood: 0.85, sfx: [{ at: 0.6, type: 'ticks', n: 10, gap: 0.12 }, { at: 3.4, type: 'ding' }] },
      { id: 'why', min: 4.0, cap: ['"什么时候、在哪里"，', '会变成一个{自动提醒}。'], voice: '什么时候、在哪里，会变成一个自动提醒。', mood: 0.6 },
      { id: 'how', min: 4.8, cap: ['别写"每天背单词"，', '写"{早饭后，在书桌前，背 20 个}"。'], voice: '别写每天背单词，要写，早饭后，在书桌前，背二十个。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '把计划写成，几点，在哪，做什么。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '每天背单词早饭后在书桌前背个只写要做写清什么时候在哪里完成圣诞假期难计划几点做执行意图研究格人%0123456789',
  };

  function card(ctx, th, x, y, w, h, title, lines, a, hi) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.strokeStyle = hi ? th.gold : 'rgba(255,255,255,0.4)'; ctx.lineWidth = hi ? 4 : 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(title, x + 30, y + 48);
    lines.forEach((l, i) => { ctx.fillStyle = hi ? th.goldHi : th.fg; ctx.font = `700 40px ${th.cap}`; ctx.fillText(l, x + 30, y + 110 + i * 56); });
    ctx.restore();
  }
  // 100 格点阵，亮 n 格
  function waffle(ctx, th, x, y, n, col, a) {
    ctx.save(); ctx.globalAlpha = a;
    for (let i = 0; i < 100; i++) { const c = i % 10, r = Math.floor(i / 10); ctx.fillStyle = i < n ? col : 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x + c * 34, y + r * 34, 13, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ex = b('exp'), rs = b('result'), wy = b('why'), hw = b('how');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    // 两张计划卡片
    const cA = sceneA * E.seg(t, ex.s + 0.6, ex.s + 1.1);
    const specific = E.seg(t, hw.s + 1.0, hw.s + 1.5);
    if (cA > 0) {
      card(ctx, th, 90, 560, 430, 230, '计划 A', ['每天背单词'], cA, false);
      card(ctx, th, 560, 560, 430, 230, '计划 B', specific > 0 ? ['早饭后 · 书桌前', '背 20 个'] : ['几点？在哪？', '做多少？'], cA, true);
    }
    // 完成率点阵
    const rA = sceneA * E.seg(t, rs.s + 0.4, rs.s + 0.8) * (1 - 0.7 * E.seg(t, hw.s, hw.s + 0.4));
    if (rA > 0) {
      const k = E.seg(t, rs.s + 0.6, rs.s + 2.6);
      waffle(ctx, th, 140, 900, Math.round(22 * k), th.red, rA);
      waffle(ctx, th, 610, 900, Math.round(62 * k), th.gold, rA);
      ctx.save(); ctx.globalAlpha = rA; ctx.textAlign = 'center';
      ctx.fillStyle = th.red; ctx.font = `700 72px ${th.num}`; ctx.fillText(Math.round(22 * k) + '%', 293, 1340);
      ctx.fillStyle = th.goldHi; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.fillText(Math.round(62 * k) + '%', 763, 1340); ctx.shadowBlur = 0;
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.fillText('只写目标', 293, 1390); ctx.fillText('写清何时何地', 763, 1390);
      ctx.restore();
    }
    // 自动提醒：时间 → 地点 → 行动
    const wA = sceneA * E.seg(t, wy.s + 0.4, wy.s + 0.9) * (1 - E.seg(t, hw.s, hw.s + 0.4));
    if (wA > 0) {
      ctx.save(); ctx.globalAlpha = wA; ctx.fillStyle = th.goldHi; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('到了那个时间、那个地方 → 自动开始', 540, 1500); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Gollwitzer & Brandstätter（1997）研究 1：圣诞假期中"难完成计划"的完成率', 540, 1620); ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '写清楚：', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{几点、在哪、做什么}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.4, glow: 1.0 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
