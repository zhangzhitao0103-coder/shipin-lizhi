// F5《AI 是靠犯错学会的》方法类 · 霓虹科技风（期中考后）
// 原理：梯度下降——计算误差，沿误差下降最快的方向（负梯度）小步调整参数，反复迭代。误差曲线为示意
(function (root) {
  const L = x => 0.12 * (x - 6.5) ** 2 + 0.25 * Math.sin(1.6 * x) + 0.6;     // 示意的误差曲线，x ∈ [0, 10]
  const dL = x => 0.24 * (x - 6.5) + 0.4 * Math.cos(1.6 * x);
  const STEPS = (() => { const s = [0.8]; for (let i = 0; i < 40; i++) s.push(s[s.length - 1] - 0.45 * dL(s[s.length - 1])); return s; })();

  const EP = {
    id: 'F5',
    title: 'AI是靠犯错学会的',
    theme: 'neon',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 108, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'repeat',
    beats: [
      { id: 'hook', min: 2.6, cap: ['AI 是怎么{学会}的？'], voice: '人工智能，是怎么学会的？', mood: 0.35 },
      { id: 'guess', min: 3.2, cap: ['先随便猜一个答案，', '算出{错了多少}。'], voice: '先随便猜一个答案，算出错了多少。', mood: 0.45, sfx: [{ at: 0.5, type: 'tick' }] },
      { id: 'grad', min: 3.8, cap: ['再顺着“错误变小最快”的方向，', '{改一点点}。'], voice: '再顺着错误变小最快的方向，改一点点。', mood: 0.55, sfx: [{ at: 1.0, type: 'tick' }, { at: 2.0, type: 'tick' }] },
      { id: 'repeat', min: 3.4, cap: ['重复成千上万次，', '误差一路{往下走}。'], voice: '重复成千上万次，误差一路往下走。', mood: 0.8, sfx: [{ at: 0.3, type: 'ticks', n: 12, gap: 0.12 }] },
      { id: 'flip', min: 3.6, cap: ['AI 不是靠不犯错学会的，', '是靠{认真看每一次错}。'], voice: '人工智能不是靠不犯错学会的，是靠认真看每一次错。', mood: 0.7 },
      { id: 'you', min: 3.6, cap: ['期中考的每一道错题，', '都在告诉你：{该往哪改}。'], voice: '期中考的每一道错题，都在告诉你，该往哪改。', mood: 0.8 },
      { id: 'action', min: 2.8, cap: null, voice: '别怕错，怕的是不看错。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'AI误差第次调整梯度下降机器学习最常用的训练方法图为示意别怕错的是不看0123456789.',
  };

  const X0 = 150, X1 = 930, Y0 = 760, Y1 = 1380;
  const PX = x => X0 + (x / 10) * (X1 - X0), PY = y => Y1 - (y / 6) * (Y1 - Y0);

  function stepAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('grad').s + 0.6) return 0;
    if (t < b('repeat').s) return 3 * E.seg(t, b('grad').s + 0.6, b('grad').e);
    return 3 + 37 * E.ease.out(E.seg(t, b('repeat').s, b('repeat').e));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, b('guess').s - 0.2, b('guess').s + 0.4) * (1 - 0.85 * E.seg(t, b('you').s - 0.1, b('you').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    // 开头：芯片
    const hA = E.seg(t, 0.1, 0.5) * (1 - E.seg(t, b('guess').s - 0.2, b('guess').s + 0.3));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 30;
      ctx.strokeRect(390, 850, 300, 300); ctx.shadowBlur = 0;
      for (let i = 0; i < 5; i++) { const o = 880 + i * 60; [[390, o, 340, o], [690, o, 740, o], [390 + (o - 850), 850, 390 + (o - 850), 800], [390 + (o - 850), 1150, 390 + (o - 850), 1200]].forEach(([a, c, d, e]) => { ctx.beginPath(); ctx.moveTo(a, c); ctx.lineTo(d, e); ctx.stroke(); }); }
      ctx.fillStyle = th.goldHi; ctx.font = `700 110px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('AI', 540, 1040); ctx.restore();
    }
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 误差曲线
      ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = i / 20; i ? ctx.lineTo(PX(x), PY(L(x))) : ctx.moveTo(PX(x), PY(L(x))); }
      ctx.strokeStyle = th.gold; ctx.lineWidth = 5; ctx.shadowColor = th.gold; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = th.dim; ctx.font = `500 26px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('误差', X0, Y0 - 20);
      // 走过的步子
      const s = stepAt(t, TL, E), k = Math.floor(s), f = s - k;
      for (let i = 0; i < Math.min(k, 39); i++) {
        ctx.strokeStyle = th.red; ctx.lineWidth = 3; ctx.globalAlpha = sceneA * 0.7;
        ctx.beginPath(); ctx.moveTo(PX(STEPS[i]), PY(L(STEPS[i]))); ctx.lineTo(PX(STEPS[i + 1]), PY(L(STEPS[i + 1]))); ctx.stroke();
      }
      const x = k < 40 ? E.lerp(STEPS[k], STEPS[Math.min(40, k + 1)], E.ease.inOut(f)) : STEPS[40];
      ctx.globalAlpha = sceneA; ctx.fillStyle = th.red; ctx.shadowColor = th.red; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(PX(x), PY(L(x)) - 18, 18, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      // 梯度箭头（只在前几步）
      if (t > b('grad').s + 0.3 && t < b('repeat').s + 0.5) {
        const dir = -Math.sign(dL(x));
        ctx.strokeStyle = th.fg; ctx.fillStyle = th.fg; ctx.lineWidth = 4;
        const ax = PX(x), ay = PY(L(x)) - 70;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + dir * 90, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + dir * 110, ay); ctx.lineTo(ax + dir * 86, ay - 14); ctx.lineTo(ax + dir * 86, ay + 14); ctx.fill();
      }
      // 读数
      E.hud(ctx, th, 150, 1470, '误差 LOSS', L(x).toFixed(2), { alpha: sceneA, color: th.red });
      E.hud(ctx, th, 930, 1470, '调整次数', String(Math.round(s * 250)), { alpha: sceneA, align: 'right' });
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('梯度下降：机器学习最常用的训练方法；误差曲线为示意', 540, 1640);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别怕错，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '怕的是{不看错}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
