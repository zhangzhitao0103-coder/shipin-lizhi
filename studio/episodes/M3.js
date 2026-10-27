// M3《期末最后 4 周，怎么排》期末冲刺类 · 手账笔记风
// 复习安排为建议（非研究数据）：每周一个重点——回归课本 → 专题补弱 → 限时套卷 → 查漏 + 调作息
(function (root) {
  const WEEKS = [['第 1 周', '回归课本', '错题本从头翻一遍'], ['第 2 周', '专题补弱', '只盯最弱的一两个模块'], ['第 3 周', '限时套卷', '按考试时间做整套题'], ['第 4 周', '查漏 + 调作息', '不开新坑，按考试时间起床']];

  const EP = {
    id: 'M3',
    title: '期末最后4周怎么排',
    theme: 'notebook',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'lofi', bpm: 82, chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'w3',
    beats: [
      { id: 'hook', min: 3.2, cap: ['离期末还有 4 周，', '{怎么排}最有效？'], voice: '离期末还有四周，怎么排最有效？', mood: 0.3 },
      { id: 'w1', min: 3.6, cap: ['第 1 周：{回归课本}，', '把错题本从头翻一遍。'], voice: '第一周，回归课本，把错题本从头翻一遍。', mood: 0.45, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'w2', min: 3.6, cap: ['第 2 周：{专题补弱}，', '只盯最弱的一两个模块。'], voice: '第二周，专题补弱，只盯最弱的一两个模块。', mood: 0.55, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'w3', min: 3.6, cap: ['第 3 周：{限时套卷}，', '按考试时间做整套题。'], voice: '第三周，限时套卷，按考试时间做整套题。', mood: 0.7, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'w4', min: 4.0, cap: ['第 4 周：{查漏 + 调作息}，', '不开新坑，按考试时间起床。'], voice: '第四周，查漏补缺，调作息。不开新坑，按考试时间起床。', mood: 0.8, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'flip', min: 3.4, cap: ['冲刺不是拼命，', '是{每周只盯一件事}。'], voice: '冲刺不是拼命，是每周只盯一件事。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '把四周写进日历，今天就开始。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: WEEKS.flat().join('') + '一二三四五六日周期末考试复习安排为建议可按学校时间调整四周写进日历今天就开始',
  };

  const X0 = 150, CW = 110, RH = 220, Y0 = 600;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    // 星期表头
    ctx.fillStyle = th.dim; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'center';
    '一二三四五六日'.split('').forEach((d, i) => ctx.fillText(d, X0 + i * CW + CW / 2, Y0 - 20));
    WEEKS.forEach(([wk, focus, detail], r) => {
      const beat = b('w' + (r + 1)), on = t > beat.s, y = Y0 + r * RH;
      // 每天的格子
      for (let d = 0; d < 7; d++) {
        const x = X0 + d * CW, fill = E.seg(t, beat.s + 0.3 + d * 0.12, beat.s + 0.5 + d * 0.12);
        ctx.strokeStyle = 'rgba(31,42,68,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, CW - 12, 90);
        if (fill > 0) { ctx.globalAlpha = sceneA * fill; ctx.fillStyle = ['rgba(35,80,200,0.18)', 'rgba(214,59,47,0.16)', 'rgba(255,214,64,0.35)', 'rgba(60,160,110,0.2)'][r]; ctx.fillRect(x + 6, y + 6, CW - 12, 90); ctx.globalAlpha = sceneA; }
        // 第 4 周最后一天：考试
        if (r === 3 && d === 6 && on) { ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.fillText('考', x + CW / 2, y + 62); }
      }
      // 本周重点
      const la = E.seg(t, beat.s + 0.2, beat.s + 0.6);
      if (la > 0) {
        ctx.globalAlpha = sceneA * la;
        ctx.font = `700 40px ${th.cap}`; const mw = ctx.measureText(wk + '：' + focus).width + 24;
        E.marker(ctx, X0, y + 112, mw, 48, th.marker, E.seg(t, beat.s + 0.3, beat.s + 0.9));
        ctx.fillStyle = th.fg; ctx.textAlign = 'left'; ctx.fillText(wk + '：' + focus, X0 + 6, y + 150);
        ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.fillText(detail, X0 + 6, y + 196);
        ctx.globalAlpha = sceneA;
      }
      // 打勾：过了这一周
      const next = r < 3 ? b('w' + (r + 2)) : b('flip');
      const ck = E.seg(t, next.s + 0.1, next.s + 0.5);
      if (ck > 0) { ctx.strokeStyle = th.gold; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(910, y + 140); ctx.lineTo(910 + 20 * Math.min(1, ck * 2), y + 140 + 20 * Math.min(1, ck * 2)); if (ck > 0.5) ctx.lineTo(930 + 40 * (ck - 0.5) * 2, y + 160 - 50 * (ck - 0.5) * 2); ctx.stroke(); }
    });
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('复习安排为建议，可按学校的期末时间调整', 540, 1680);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '四周，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{今天就开始}。', 540, 1030, { theme: th, size: 112, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
