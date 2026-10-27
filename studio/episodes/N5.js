// N5《寒假预习：先做题，再看书》寒假规划类 · 晨光风
// 依据：Richland、Kornell & Kao（2009）"预测试效应"：学习前先尝试回答相关问题，即使大多答错，之后的学习效果也更好
// 每节课先做 3 道题为建议
(function (root) {
  const EP = {
    id: 'N5',
    title: '寒假预习先做题再看书',
    theme: 'sunrise',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Em', 'F', 'G'] },
    cover: 'claim',
    beats: [
      { id: 'hook', min: 3.4, cap: ['寒假预习新课，', '先看书，还是{先做题}？'], voice: '寒假预习新课，先看书，还是先做题？', mood: 0.3 },
      { id: 'claim', min: 4.8, cap: ['研究发现：学之前{先试着做几道题}，', '哪怕[大多做错]，后面也学得更好。'], voice: '研究发现，学之前先试着做几道题，哪怕大多做错，后面也学得更好。', mood: 0.55, sfx: [{ at: 1.4, type: 'ticks', n: 3, gap: 0.4 }] },
      { id: 'why', min: 4.2, cap: ['因为做不出来的题，', '会让你带着{问题}去学。'], voice: '因为做不出来的题，会让你带着问题去学。', mood: 0.5 },
      { id: 'how', min: 4.6, cap: ['寒假预习：每节课{先做 3 道题}，', '做不出来，标个问号就行。'], voice: '寒假预习，每节课先做三道题，做不出来，标个问号就行。', mood: 0.65 },
      { id: 'sem', min: 4.0, cap: ['开学听讲时，', '你的问号会{一个一个被解开}。'], voice: '开学听讲时，你的问号，会一个一个被解开。', mood: 0.85, sfx: [{ at: 1.0, type: 'ding' }, { at: 1.7, type: 'ding' }, { at: 2.4, type: 'ding' }] },
      { id: 'action', min: 3.0, cap: null, voice: '寒假预习，先做题，再看书。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第题预习新课先做题再看书问号开学听讲预测试效应学习前尝试回答即使答错每节课道为建议寒假?✓',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const cl = b('claim'), wy = b('why'), hw = b('how'), sm = b('sem');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save();
    // 三张题卡：先做 → 打问号 → 开学被解开
    for (let i = 0; i < 3; i++) {
      const a = E.seg(t, cl.s + 1.4 + i * 0.4, cl.s + 1.8 + i * 0.4);
      if (a <= 0) continue;
      const x = 120 + i * 290, y = 620 + (i % 2) * 40;
      E.glassCard(ctx, x, y, 260, 360, sceneA * a, 28);
      ctx.globalAlpha = sceneA * a; ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('第 ' + (i + 1) + ' 题', x + 28, y + 56);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let l = 0; l < 3; l++) ctx.fillRect(x + 28, y + 90 + l * 34, 200 - l * 40, 12);
      const solved = E.seg(t, sm.s + 1.0 + i * 0.7, sm.s + 1.3 + i * 0.7);
      const marked = E.seg(t, hw.s + 1.6 + i * 0.3, hw.s + 1.9 + i * 0.3);
      ctx.textAlign = 'center';
      if (solved > 0) {
        ctx.globalAlpha = sceneA * solved; ctx.strokeStyle = th.gold; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = th.gold; ctx.shadowBlur = 24;
        ctx.beginPath(); ctx.moveTo(x + 80, y + 270); ctx.lineTo(x + 120, y + 310); ctx.lineTo(x + 190, y + 220); ctx.stroke(); ctx.shadowBlur = 0;
      } else if (marked > 0 || (t > cl.s + 2.6 && t < wy.e)) {
        const m = Math.max(marked, t < wy.e ? E.seg(t, cl.s + 2.6, cl.s + 3.0) : 0);
        ctx.globalAlpha = sceneA * m; ctx.fillStyle = th.red; ctx.font = `700 120px ${th.cap}`; ctx.fillText('?', x + 130, y + 310);
      }
      ctx.globalAlpha = sceneA;
    }
    // "带着问题去学"：问号连到书本
    const wA = sceneA * E.seg(t, wy.s + 0.4, wy.s + 0.9) * (1 - E.seg(t, hw.s, hw.s + 0.4));
    if (wA > 0) {
      ctx.globalAlpha = wA; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(250 + i * 290, 1020 + (i % 2) * 40); ctx.lineTo(540, 1250); ctx.stroke(); }
      ctx.setLineDash([]);
      E.glassCard(ctx, 380, 1250, 320, 170, wA, 24);
      ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('新课', 540, 1350);
    }
    // 开学：日期标签
    const sA = sceneA * E.seg(t, sm.s + 0.3, sm.s + 0.7);
    if (sA > 0) { ctx.globalAlpha = sA; ctx.fillStyle = th.goldHi; ctx.font = `700 48px ${th.cap}`; ctx.textAlign = 'center'; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.fillText('开学第一周', 540, 1200); ctx.shadowBlur = 0; }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Richland 等（2009）：预测试效应——先尝试作答，即使答错也能促进后续学习', 540, 1560);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '寒假预习，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{先做题，再看书}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.4, glow: 1.0 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
