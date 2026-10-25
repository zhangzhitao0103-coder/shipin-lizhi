// L2《期末考的是稳定》心态类 · 信息图风
// 模拟：两人平均分都是 110，标准差分别为 5 和 15（正态分布），各模拟 1000 次考试。
// 理论值：考过 105 分的概率 P(Z ≥ −1) = 84%，P(Z ≥ −1/3) = 63%
(function (root) {
  const MU = 110, RUNS = 1000, BIN = 2.5, LO = 60, HI = 150, NB = (HI - LO) / BIN, PER = 10;

  function sample(sd, seed, E) {
    const r = E.rng(seed), out = [];
    for (let i = 0; i < RUNS; i++) {
      const u = Math.max(1e-9, r()), v = r();
      out.push(Math.min(HI - 0.01, Math.max(LO, MU + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))));
    }
    return out;
  }
  let S = null;
  function sims(E) { if (!S) S = { zhou: sample(5, 501, E), wu: sample(15, 502, E) }; return S; }

  const EP = {
    id: 'L2',
    title: '期末考的是稳定',
    theme: 'info',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 96, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'key',
    beats: [
      { id: 'hook', min: 3.0, cap: ['两个同学，', '平时平均分都是 {110}。'], voice: '两个同学，平时平均分都是一百一十分。', mood: 0.35 },
      { id: 'sim', min: 3.4, cap: ['把同一场考试，', '模拟考 {1000} 次。'], voice: '把同一场考试，模拟考一千次。', mood: 0.6, sfx: [{ at: 0.3, type: 'riser', dur: 2.4 }] },
      { id: 'a', min: 3.2, cap: ['小周：分数很稳，', '大多在 100 到 120 之间。'], voice: '小周，分数很稳，大多在一百到一百二十之间。', mood: 0.5 },
      { id: 'b', min: 3.0, cap: ['小吴：有时 135，', '有时只有 [85]。'], voice: '小吴，有时一百三十五，有时只有八十五。', mood: 0.55 },
      { id: 'key', min: 4.6, cap: ['只考一次的话，考过 105 分：', '小周 {84%}，小吴只有 [63%]。'], voice: '只考一次的话，考过一百零五分，小周的概率是百分之八十四，小吴只有百分之六十三。', mood: 0.85, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'flip', min: 3.4, cap: ['期末也好，高考也好，', '拼的不是{最高分}，是{下限}。'], voice: '期末也好，高考也好，拼的不是最高分，是下限。', mood: 0.6 },
      { id: 'tip', min: 3.2, cap: ['少丢会做的分，', '比多拿一道难题{更值}。'], voice: '少丢会做的分，比多拿一道难题更值。', mood: 0.7 },
      { id: 'action', min: 2.8, cap: null, voice: '稳住，就是最大的提分。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '小周小吴分每个点代表次考试模拟平均标准差与的正态分布各考过概率稳住就是最大提分0123456789%≥',
  };

  const X0 = 130, X1 = 950, CW = (X1 - X0) / NB, DOT = 10.5;
  const SX = v => X0 + ((v - LO) / (HI - LO)) * (X1 - X0);

  // 每 10 次考试画一个点；highlight 时低于 105 分的点标红
  function hist(ctx, th, data, base, t0, t, E, a, label, col, highlight) {
    const counts = new Array(NB).fill(0), order = [];
    data.forEach(v => { const k = Math.floor((v - LO) / BIN); order.push([k, counts[k]++]); });
    const shown = Math.floor(RUNS * E.seg(t, t0, t0 + 1.8));
    ctx.save(); ctx.globalAlpha = a;
    for (let j = 0; j < shown; j++) {
      const [k, h] = order[j]; if (h % PER !== PER - 1) continue;
      const lvl = Math.floor(h / PER), x = X0 + k * CW + CW / 2, y = base - 8 - lvl * (DOT + 2);
      ctx.fillStyle = highlight && LO + (k + 0.5) * BIN < 105 ? th.red : col;
      ctx.beginPath(); ctx.arc(x, y, DOT / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = th.faint; ctx.fillRect(X0, base, X1 - X0, 2);
    ctx.fillStyle = col; ctx.font = `700 36px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText(label, X0, base - 285);
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t, { glow: 'rgba(40,40,60,0.3)', dustCount: 12, dustColor: '255,255,255' });
    const s = sims(E);
    const chartA = E.seg(t, b('sim').s - 0.2, b('sim').s + 0.3) * (1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    // 开头：两个人与 110
    const hA = E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('sim').s - 0.2, b('sim').s + 0.3));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.textAlign = 'center';
      [[320, '小周', th.gold], [760, '小吴', th.fg]].forEach(([x, n, c]) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 880, 70, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#050505'; ctx.font = `900 48px "Noto Sans SC"`; ctx.fillText(n[1], x, 897);
        ctx.fillStyle = c; ctx.font = `700 40px "Noto Sans SC"`; ctx.fillText(n, x, 1010);
        ctx.font = `700 90px ${th.mono}`; ctx.fillText('110', x, 1140);
      });
      ctx.restore();
    }
    if (chartA > 0) {
      const highlight = t > b('key').s + 0.2;
      hist(ctx, th, s.zhou, 1060, b('sim').s + 0.2, t, E, chartA, '小周 · 标准差 5', th.gold, highlight);
      hist(ctx, th, s.wu, 1460, b('sim').s + 0.5, t, E, chartA, '小吴 · 标准差 15', th.fg, highlight);
      ctx.save(); ctx.globalAlpha = chartA;
      ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.mono}`; ctx.textAlign = 'center';
      [60, 85, 105, 110, 135, 150].forEach(v => ctx.fillText(String(v), SX(v), 1500));
      ctx.font = `500 22px "Noto Sans SC"`; ctx.textAlign = 'right'; ctx.fillText('每个点 = 10 次考试', X1, 640);
      if (highlight) {
        const k = E.seg(t, b('key').s + 0.2, b('key').s + 0.7);
        ctx.globalAlpha = chartA * k; ctx.strokeStyle = th.red; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(SX(105), 700); ctx.lineTo(SX(105), 1470); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = th.red; ctx.font = `700 30px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('105 分', SX(105), 690);
        ctx.font = `900 60px ${th.mono}`; ctx.textAlign = 'right';
        ctx.fillStyle = th.gold; ctx.fillText('84%', X1, 900); ctx.fillStyle = th.fg; ctx.fillText('63%', X1, 1300);
      }
      ctx.globalAlpha = chartA * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('模拟：平均 110 分，标准差 5 与 15 的正态分布，各 1000 次', 540, 1690);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '稳住，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '就是{最大的提分}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.5, weight: 900, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
