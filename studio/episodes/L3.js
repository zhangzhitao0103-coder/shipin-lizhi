// L3《一次考砸，只是一个点》心态类 · 冷蓝电影风（期中考后）
// 模拟数据：真实水平 110 分，每次考试随机波动（标准差 10），共 12 次；第 9 次（期中）设定为 88 分
(function (root) {
  const MU = 110, SD = 10, NEX = 12, MID = 8;

  let S = null;
  function scores(E) {
    if (S) return S;
    // 挑一组平均分落在 108–112 的随机数，让平均线与"真实水平 110"一致
    for (let seed = 310; seed < 2000; seed++) {
      const r = E.rng(seed), out = [];
      for (let i = 0; i < NEX; i++) { const u = Math.max(1e-9, r()), v = r(); out.push(Math.round(MU + SD * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))); }
      out[MID] = 88;
      const avg = out.reduce((a, c) => a + c, 0) / NEX;
      if (avg >= 108 && avg <= 112 && Math.max(...out) <= 145) { S = out; return S; }
    }
    throw new Error('no seed');
  }

  const EP = {
    id: 'L3',
    title: '一次考砸只是一个点',
    theme: 'ice',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'G', 'D', 'C', 'G'] },
    cover: 'many',
    beats: [
      { id: 'hook', min: 3.0, cap: ['期中考砸了？', '先别急着{否定自己}。'], voice: '期中考砸了？先别急着否定自己。', mood: 0.3 },
      { id: 'point', min: 2.8, cap: ['一次考试，', '只是图上的{一个点}。'], voice: '一次考试，只是图上的一个点。', mood: 0.35, sfx: [{ at: 0.6, type: 'tick' }] },
      { id: 'noise', min: 3.6, cap: ['题目难易、状态、运气，', '都会让分数{上下波动}。'], voice: '题目难易，状态，运气，都会让分数上下波动。', mood: 0.45, sfx: [{ at: 0.4, type: 'ticks', n: 11, gap: 0.22 }] },
      { id: 'many', min: 3.6, cap: ['把很多次考试放在一起，', '{平均线}才更接近你的真实水平。'], voice: '把很多次考试放在一起，平均线才更接近你的真实水平。', mood: 0.7, sfx: [{ at: 0.6, type: 'ding' }] },
      { id: 'bad', min: 3.0, cap: ['这一次的低分，', '可能只是一次[正常波动]。'], voice: '这一次的低分，可能只是一次正常波动。', mood: 0.5 },
      { id: 'flip', min: 3.6, cap: ['真正要看的，', '是{错在哪}，而不是{考了几分}。'], voice: '真正要看的，是错在哪，而不是考了几分。', mood: 0.75 },
      { id: 'action', min: 2.8, cap: null, voice: '一次考砸，不是你的曲线。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第次考试期中分平均线模拟数据真实水平每次随机波动标准差共一砸不是你的曲线0123456789',
  };

  const X0 = 170, X1 = 920, Y0 = 760, Y1 = 1380;
  const PX = i => X0 + ((i + 0.5) / NEX) * (X1 - X0), PY = v => Y1 - ((v - 70) / 80) * (Y1 - Y0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sc = scores(E);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 0.6, b('flip').s + 1.2)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'right';
      [80, 100, 120, 140].forEach(v => { ctx.beginPath(); ctx.moveTo(X0, PY(v)); ctx.lineTo(X1, PY(v)); ctx.stroke(); ctx.fillText(String(v), X0 - 12, PY(v) + 8); });
      // 显示哪些点：开头只有期中那一个点，波动段逐个出现
      const showAll = E.seg(t, b('noise').s + 0.3, b('noise').s + 2.8);
      for (let i = 0; i < NEX; i++) {
        const order = i === MID ? 0 : (i < MID ? i + 1 : i);
        const a = i === MID ? E.seg(t, b('point').s + 0.4, b('point').s + 0.8) : E.clamp(showAll * NEX - order);
        if (a <= 0) continue;
        const isMid = i === MID, hl = isMid && t > b('bad').s;
        ctx.globalAlpha = sceneA * a;
        ctx.fillStyle = isMid ? th.red : th.goldHi; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = hl ? 30 + 10 * Math.sin(t * 6) : 14;
        ctx.beginPath(); ctx.arc(PX(i), PY(sc[i]), isMid ? 16 : 12, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText(String(sc[i]), PX(i), PY(sc[i]) - 26);
        if (isMid) { ctx.font = `700 28px "Noto Sans SC"`; ctx.fillText('期中', PX(i), PY(sc[i]) + 50); }
      }
      // 平均线 + 波动带
      const mA = E.seg(t, b('many').s + 0.3, b('many').s + 1.2);
      if (mA > 0) {
        const avg = sc.reduce((s, v) => s + v, 0) / NEX;
        ctx.globalAlpha = sceneA * mA * 0.25; ctx.fillStyle = th.gold; ctx.fillRect(X0, PY(avg + SD), (X1 - X0) * mA, PY(avg - SD) - PY(avg + SD));
        ctx.globalAlpha = sceneA * mA; ctx.strokeStyle = th.gold; ctx.lineWidth = 5; ctx.shadowColor = th.gold; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(X0, PY(avg)); ctx.lineTo(X0 + (X1 - X0) * mA, PY(avg)); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = th.goldHi; ctx.font = `700 34px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('平均 ' + avg.toFixed(0) + ' 分', X0 + 10, PY(avg) - 22);
      }
      ctx.globalAlpha = sceneA; ctx.fillStyle = th.dim; ctx.font = `500 24px "Noto Sans SC"`; ctx.textAlign = 'right'; ctx.fillText('考试次数 →', X1, Y1 + 50);
      ctx.globalAlpha = sceneA * 0.85; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('模拟数据：真实水平 110 分，每次随机波动，共 12 次', 540, 1520);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '一次考砸，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{不是你的曲线}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.6, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
