// D3《3000 个单词，其实只要一年》复利类 · 手账笔记风
// 依据：普通高中英语课程标准：高中毕业累计掌握约 3000 词（含义务教育阶段）。计算：每天 10 个 → 300 天；一年剩 65 天复习
(function (root) {
  const EP = {
    id: 'D3',
    title: '3000个单词其实只要一年',
    theme: 'notebook',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 92, chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C'] },
    cover: 'split',
    beats: [
      { id: 'hook', min: 3.0, cap: ['高中要背 {3000} 个单词，', '是不是很吓人？'], voice: '高中要背三千个单词，是不是很吓人？', mood: 0.3 },
      { id: 'split', min: 3.6, cap: ['每天背 10 个，', '{300 天}就够了。'], voice: '每天背十个，三百天就够了。', mood: 0.55, sfx: [{ at: 0.4, type: 'riser', dur: 2.4 }] },
      { id: 'left', min: 3.0, cap: ['一年 365 天，', '还剩 {65 天}拿来复习。'], voice: '一年三百六十五天，还剩六十五天，拿来复习。', mood: 0.6, sfx: [{ at: 0.4, type: 'ding' }] },
      { id: 'small', min: 3.4, cap: ['一天 10 个，', '{一顿早饭的时间}就够了。'], voice: '一天十个，一顿早饭的时间就够了。', mood: 0.5 },
      { id: 'flip', min: 3.0, cap: ['难的不是 3000，', '是{每天的 10 个}。'], voice: '难的不是三千，是每天的十个。', mood: 0.75 },
      { id: 'action', min: 2.8, cap: null, voice: '今天的十个，背了吗？', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '个单词天背复习今的了吗课程标准高中阶段累计掌握约含义务教育阶段每0123456789',
  };

  const C = 20, P = 40, S = 32, X0 = 540 - (C * P) / 2 + 4, Y0 = 640;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    // 开头：大号 3000
    const hA = E.seg(t, 0.1, 0.5) * (1 - E.seg(t, b('split').s - 0.1, b('split').s + 0.4));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.textAlign = 'center';
      E.marker(ctx, 300, 900, 480, 90, th.marker, E.ease.out(E.seg(t, 0.5, 1.2)));
      ctx.fillStyle = th.fg; ctx.font = `700 220px ${th.cap}`; ctx.fillText('3000', 540, 990);
      ctx.font = `700 52px ${th.cap}`; ctx.fillText('个单词', 540, 1080); ctx.restore();
    }
    // 365 格日历：300 格背单词（蓝），65 格复习（红）
    const gA = E.seg(t, b('split').s, b('split').s + 0.4) * sceneA;
    if (gA > 0) {
      ctx.save();
      const fill = 300 * E.ease.inOut(E.seg(t, b('split').s + 0.3, b('split').s + 2.6));
      const rev = E.seg(t, b('left').s + 0.2, b('left').s + 1.2);
      for (let i = 0; i < 365; i++) {
        const x = X0 + (i % C) * P, y = Y0 + Math.floor(i / C) * P;
        ctx.globalAlpha = gA; ctx.strokeStyle = 'rgba(31,42,68,0.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, S, S);
        if (i < fill) { ctx.fillStyle = th.gold; ctx.globalAlpha = gA * 0.85 * E.clamp(fill - i); ctx.fillRect(x + 3, y + 3, S - 6, S - 6); }
        else if (i >= 300 && rev * 65 > i - 300) { ctx.fillStyle = th.red; ctx.globalAlpha = gA * 0.6; ctx.fillRect(x + 3, y + 3, S - 6, S - 6); }
      }
      ctx.globalAlpha = gA; ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'left';
      ctx.fillText('已背 ' + Math.round(Math.min(300, fill) * 10) + ' 个', X0, Y0 + 19 * P + 70);
      if (rev > 0) { ctx.textAlign = 'right'; ctx.fillStyle = th.red; ctx.fillText('复习 65 天', X0 + C * P - 8, Y0 + 19 * P + 70); }
      ctx.globalAlpha = gA * 0.85; ctx.fillStyle = th.dim; ctx.font = `500 21px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('课程标准：高中阶段累计掌握约 3000 词（含义务教育阶段）；一格 = 一天', 540, 1560);
      ctx.restore();
    }
    // 早饭小插画：碗 + 10 张单词卡
    const sb = b('small');
    const sA = E.seg(t, sb.s + 0.2, sb.s + 0.6) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.3));
    if (sA > 0) {
      ctx.save(); ctx.globalAlpha = sA; ctx.fillStyle = 'rgba(247,242,230,0.94)'; ctx.fillRect(120, 600, 840, 980);
      ctx.strokeStyle = th.fg; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(540, 1000, 140, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(380, 1000); ctx.lineTo(700, 1000); ctx.stroke();
      for (let i = 0; i < 10; i++) {
        const p = E.ease.out(E.seg(t, sb.s + 0.4 + i * 0.12, sb.s + 0.7 + i * 0.12)); if (p <= 0) continue;
        ctx.globalAlpha = sA * p; ctx.save(); ctx.translate(200 + (i % 5) * 170, 1250 + Math.floor(i / 5) * 120); ctx.rotate((i % 2 ? 1 : -1) * 0.05);
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = th.gold; ctx.lineWidth = 2; ctx.fillRect(-70, -40, 140, 80); ctx.strokeRect(-70, -40, 140, 80);
        ctx.fillStyle = th.gold; ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('word', 0, 8); ctx.restore();
      }
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '今天的 10 个，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.marker(ctx, 360, 970, 360, 74, th.marker, E.ease.out(E.seg(t, ac.s + 1.0, ac.s + 1.5)));
      E.rich(ctx, '{背了吗}？', 540, 1030, { theme: th, size: 110, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
