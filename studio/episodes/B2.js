// B2《晚 30 天开始》迈出第一步类 · 信息图风
// 数学锚点：两人每天都进步 1%（复利），乙晚 30 天开始。甲/乙 = 1.01^30 ≈ 1.348，永远不变；绝对差距持续拉大
(function (root) {
  const A = d => Math.pow(1.01, d);
  const Bv = d => (d <= 30 ? 1 : Math.pow(1.01, d - 30));

  const EP = {
    id: 'B2',
    title: '晚30天开始',
    theme: 'info',
    capY: 360,
    capSize: 64,
    music: { style: 'pulse', bpm: 96, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Dm', 'F', 'C', 'G'] },
    cover: 'd365',
    beats: [
      { id: 'hook', min: 2.8, cap: ['晚 {30} 天开始，', '会差多少？'], voice: '晚三十天开始，会差多少？', mood: 0.3 },
      { id: 'setup', min: 2.8, cap: ['甲和乙，', '每天都进步 {1%}。'], voice: '甲和乙，每天都进步百分之一。', mood: 0.4 },
      { id: 'start', min: 3.6, cap: ['甲：今天就开始。', '乙：再等等，下个月吧。'], voice: '甲今天就开始。乙却说：再等等，下个月吧。', mood: 0.5 },
      { id: 'day30', min: 3.4, cap: ['第 {30} 天，乙终于开始了。', '这时，甲已经是 {1.35}。'], voice: '第三十天，乙终于开始了。这时，甲已经是一点三五。', mood: 0.5, sfx: [{ at: 0.2, type: 'ding' }] },
      { id: 'same', min: 3.2, cap: ['之后，两人一样努力，', '每天一样进步 {1%}。'], voice: '之后，两人一样努力，每天一样进步百分之一。', mood: 0.6 },
      { id: 'd100', min: 3.0, cap: ['第 {100} 天：', '甲 {2.70}，乙 2.01。'], voice: '第一百天，甲是二点七零，乙是二点零一。', mood: 0.6 },
      { id: 'd365', min: 3.6, cap: ['第 {365} 天：', '甲 {37.8}，乙 28.0。'], voice: '第三百六十五天，甲是三十七点八，乙是二十八。', mood: 0.85, sfx: [{ at: 0, type: 'riser', dur: 2.2 }, { at: 2.2, type: 'boom' }] },
      { id: 'gap', min: 3.6, cap: ['差距没有缩小，', '反而从 0.35，拉大到 [9.8]。'], voice: '差距没有缩小，反而从零点三五，拉大到九点八。', mood: 0.8, sfx: [{ at: 0.5, type: 'ticks', n: 3, gap: 0.45 }] },
      { id: 'ratio', min: 3.4, cap: ['因为无论过多久，', '甲永远是乙的 {1.35} 倍。'], voice: '因为无论过多久，甲永远是乙的一点三五倍。', mood: 0.6 },
      { id: 'excuse', min: 3.6, cap: null, voice: '等考完再说，等放假再开始，下学期再努力。', mood: 0.35, sfx: [{ at: 0.1, type: 'whoosh' }, { at: 2.4, type: 'ticks', n: 3, gap: 0.2 }] },
      { id: 'quote', min: 3.0, cap: ['不是谁更努力，', '是谁{先开始}。'], voice: '不是谁更努力，是谁先开始。', mood: 0.8, capY: 880, capSize: 76 },
      { id: 'action', min: 3.0, cap: null, voice: '第一天，就是今天。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '甲乙第天等待中开始能力值假设每进步按复利计算起点DAY0123456789.,%÷=≈n−+考完再说放假下学期努力就是今',
  };

  function dayAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('start').s) return 0;
    if (t < b('day30').s) return 30 * E.ease.inOut(E.seg(t, b('start').s + 0.3, b('start').e - 0.2));
    if (t < b('same').s) return 30;
    if (t < b('d100').s) return 30 + 70 * E.ease.inOut(E.seg(t, b('same').s + 0.2, b('same').e - 0.1));
    if (t < b('d365').s) return 100;
    return 100 + 265 * E.ease.inOut(E.seg(t, b('d365').s, b('d365').s + 2.2));
  }

  const PX0 = 150, PX1 = 940, PY0 = 660, PY1 = 1330;

  function niceStep(max) {
    const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * p) return m * p;
    return 10 * p;
  }

  function chart(ctx, th, t, TL, E, a) {
    const day = dayAt(t, TL, E);
    const xMax = Math.max(40, day / 0.9), yMax = Math.max(1.6, A(day) * 1.12);
    const X = d => PX0 + (d / xMax) * (PX1 - PX0), Y = v => PY1 - (v / yMax) * (PY1 - PY0);
    const draw = E.ease.inOut(E.seg(t, TL.b('setup').s, TL.b('setup').s + 0.8));
    ctx.save(); ctx.globalAlpha = a;
    // 网格与坐标
    ctx.strokeStyle = th.faint; ctx.lineWidth = 1.5; ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.mono}`;
    const ys = niceStep(yMax);
    for (let v = 0; v <= yMax; v += ys) {
      ctx.globalAlpha = a * draw; ctx.beginPath(); ctx.moveTo(PX0, Y(v)); ctx.lineTo(PX0 + (PX1 - PX0) * draw, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(v.toFixed(ys < 1 ? 1 : 0), PX0 - 16, Y(v) + 8);
    }
    const xs = niceStep(xMax);
    ctx.textAlign = 'center';
    for (let d = 0; d <= xMax; d += xs) ctx.fillText(String(Math.round(d)), X(d), PY1 + 40);
    ctx.font = `500 22px "Noto Sans SC"`; ctx.fillText('天数 →', PX1 - 30, PY1 + 80);
    ctx.textAlign = 'left'; ctx.fillText('能力值', PX0 - 60, PY0 - 30);
    ctx.globalAlpha = a * draw * 0.8; ctx.textAlign = 'center'; ctx.font = `400 22px "Noto Sans SC"`;
    ctx.fillText('假设：起点能力值 1.00，每天进步 1%，按复利计算', 540, PY1 + 130);
    // 乙开始的位置
    if (day >= 30) {
      ctx.globalAlpha = a * E.seg(t, TL.b('day30').s, TL.b('day30').s + 0.5);
      ctx.setLineDash([8, 8]); ctx.strokeStyle = th.dim; ctx.beginPath(); ctx.moveTo(X(30), PY1); ctx.lineTo(X(30), PY0 + 40); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.fg; ctx.font = `500 24px "Noto Sans SC"`; ctx.fillText('乙开始', X(30), PY0 + 20);
    }
    if (draw <= 0) { ctx.restore(); return { day }; }
    // 曲线
    const path = (fn, d0, d1) => { ctx.beginPath(); for (let d = d0; d <= d1 + 1e-6; d += Math.max(0.25, (d1 - d0) / 400)) { const x = X(d), y = Y(fn(d)); d === d0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } };
    ctx.globalAlpha = a;
    // 甲下方的渐变填充
    path(A, 0, day); ctx.lineTo(X(day), PY1); ctx.lineTo(X(0), PY1); ctx.closePath();
    const g = ctx.createLinearGradient(0, PY0, 0, PY1); g.addColorStop(0, 'rgba(245,184,61,0.28)'); g.addColorStop(1, 'rgba(245,184,61,0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 6; ctx.lineJoin = 'round';
    if (day > 30) { path(Bv, 30, day); ctx.strokeStyle = th.fg; ctx.stroke(); }
    ctx.setLineDash([10, 10]); path(Bv, 0, Math.min(day, 30)); ctx.strokeStyle = th.dim; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
    path(A, 0, day); ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowBlur = 0;
    // 端点
    const dot = (x, y, c, label, dx, dy = 10) => {
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = `700 28px "Noto Sans SC"`; ctx.textAlign = dx > 0 ? 'left' : 'right'; ctx.fillText(label, x + dx, y + dy);
    };
    const yA = Y(A(day)), yB = Y(Bv(day));
    const sep = Math.max(0, 44 - Math.abs(yA - yB));
    dot(X(day), yA, th.gold, '甲', -24, -26);
    if (day < 30) {
      ctx.globalAlpha = a * (0.55 + 0.45 * Math.sin(t * 6)); dot(X(day), yB, th.dim, '乙 · 等待中…', 24); ctx.globalAlpha = a;
    } else dot(X(day), yB + sep * 0, th.fg, '乙', -24);
    ctx.restore();
    return { day };
  }

  function valueRow(ctx, th, t, TL, E, a, day) {
    ctx.save(); ctx.globalAlpha = a;
    const card = (x, label, val, col, align) => {
      ctx.textAlign = align; ctx.fillStyle = col; ctx.font = `700 30px "Noto Sans SC"`; ctx.fillText(label, x, 520);
      ctx.font = `700 64px ${th.mono}`; ctx.shadowColor = col; ctx.shadowBlur = col === th.gold ? 20 : 0; ctx.fillText(val, x, 590); ctx.shadowBlur = 0;
    };
    card(150, '甲', A(day).toFixed(2), th.gold, 'left');
    card(940, '乙', Bv(day).toFixed(2), th.fg, 'right');
    ctx.textAlign = 'center'; ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.mono}`; ctx.letterSpacing = '4px'; ctx.fillText('DAY', 540, 520); ctx.letterSpacing = '0px';
    ctx.fillStyle = th.fg; ctx.font = `700 64px ${th.mono}`; ctx.fillText(String(Math.round(day)), 540, 590);
    ctx.restore();
  }

  function gapBars(ctx, th, t, TL, E, a) {
    const b = TL.b('gap');
    const data = [['第 30 天', A(30) - Bv(30)], ['第 100 天', A(100) - Bv(100)], ['第 365 天', A(365) - Bv(365)]];
    const base = 1300, k = 620 / data[2][1];
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.fillStyle = th.dim; ctx.font = `500 28px "Noto Sans SC"`; ctx.fillText('甲 − 乙 的差距', 540, 600);
    data.forEach(([lab, v], i) => {
      const p = E.ease.out(E.seg(t, b.s + 0.5 + i * 0.45, b.s + 1.1 + i * 0.45));
      const x = 260 + i * 280, h = Math.max(6, v * k) * p, w = 150;
      ctx.fillStyle = i === 2 ? th.red : 'rgba(229,72,77,0.55)';
      if (i === 2) { ctx.shadowColor = th.red; ctx.shadowBlur = 30 * p; }
      ctx.fillRect(x - w / 2, base - h, w, h); ctx.shadowBlur = 0;
      ctx.globalAlpha = a * p; ctx.fillStyle = i === 2 ? th.red : th.fg;
      ctx.font = `700 ${i === 2 ? 72 : 48}px ${th.mono}`; ctx.fillText((v * p).toFixed(v < 1 ? 2 : 1), x, base - h - 24);
      ctx.fillStyle = th.dim; ctx.font = `500 28px "Noto Sans SC"`; ctx.fillText(lab, x, base + 50);
      ctx.globalAlpha = a;
    });
    ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(120, base); ctx.lineTo(960, base); ctx.stroke();
    ctx.restore();
  }

  // 带上标的公式
  function formula(ctx, th, parts, y, size, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left';
    const sup = size * 0.55;
    let w = 0;
    for (const p of parts) {
      ctx.font = `700 ${size}px ${th.mono}`; w += ctx.measureText(p.t).width;
      if (p.s) { ctx.font = `700 ${sup}px ${th.mono}`; w += ctx.measureText(p.s).width + 4; }
    }
    let x = 540 - w / 2;
    for (const p of parts) {
      ctx.fillStyle = p.c || th.fg; if (p.c) { ctx.shadowColor = p.c; ctx.shadowBlur = 24; }
      ctx.font = `700 ${size}px ${th.mono}`; ctx.fillText(p.t, x, y); x += ctx.measureText(p.t).width;
      if (p.s) { ctx.font = `700 ${sup}px ${th.mono}`; ctx.fillText(p.s, x + 2, y - size * 0.45); x += ctx.measureText(p.s).width + 4; }
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.background(ctx, th, t, { glow: 'rgba(50,46,40,0.35)', dustCount: 18, dustColor: '255,255,255' });
    // 开头：大号"30"+ 30 个日历格
    const hk = b('hook');
    const hookA = 1 - E.seg(t, hk.e - 0.3, hk.e + 0.2);
    if (hookA > 0) {
      const p = E.seg(t, 0.2, 1.6);
      E.bigNumber(ctx, th, String(Math.round(30 * E.ease.out(p))), 540, 960, { size: 300, alpha: hookA * E.seg(t, 0, 0.3), font: `"Noto Sans SC"`, weight: 900 });
      ctx.save(); ctx.globalAlpha = hookA; ctx.fillStyle = th.fg; ctx.font = `700 60px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('天', 540, 1060); ctx.restore();
      for (let i = 0; i < 30; i++) {
        const x = 165 + (i % 10) * 78, y = 1180 + Math.floor(i / 10) * 78;
        const ap = E.seg(t, 0.2 + i * 0.045, 0.35 + i * 0.045);
        ctx.save(); ctx.globalAlpha = hookA * ap; ctx.fillStyle = 'rgba(229,72,77,0.85)'; ctx.fillRect(x, y, 60, 60);
        ctx.fillStyle = th.fg; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x + 30, y + 38); ctx.restore();
      }
    }
    // 折线图段落
    const chartA = E.seg(t, b('setup').s - 0.1, b('setup').s + 0.4) * (1 - E.seg(t, b('gap').s, b('gap').s + 0.5)) * 1;
    let day = dayAt(t, TL, E);
    if (chartA > 0) { chart(ctx, th, t, TL, E, chartA); valueRow(ctx, th, t, TL, E, chartA, day); }
    // 差距柱状图
    const gb = b('gap');
    const gapA = E.seg(t, gb.s + 0.2, gb.s + 0.6) * (1 - E.seg(t, b('ratio').s, b('ratio').s + 0.4));
    if (gapA > 0) gapBars(ctx, th, t, TL, E, gapA);
    // 比值公式
    const rb = b('ratio');
    const rA = E.seg(t, rb.s + 0.2, rb.s + 0.7) * (1 - E.seg(t, rb.e - 0.3, rb.e));
    if (rA > 0) {
      formula(ctx, th, [{ t: '1.01', s: 'n' }, { t: ' ÷ ' }, { t: '1.01', s: 'n−30' }], 860, 78, rA);
      formula(ctx, th, [{ t: '= 1.01', s: '30' }, { t: ' ≈ ' }, { t: '1.35', c: th.gold }], 1020, 96, rA * E.seg(t, rb.s + 0.9, rb.s + 1.4));
      ctx.save(); ctx.globalAlpha = rA * E.seg(t, rb.s + 1.4, rb.s + 1.9); ctx.fillStyle = th.dim; ctx.textAlign = 'center'; ctx.font = `500 30px "Noto Sans SC"`;
      ctx.fillText('n 是多少都一样：比值永远不变', 540, 1150); ctx.restore();
    }
    // 借口卡片
    const ex = b('excuse');
    const exA = 1 - E.seg(t, ex.e - 0.3, ex.e);
    if (t > ex.s && exA > 0) {
      ['“等考完再说”', '“等放假再开始”', '“下学期再努力”'].forEach((s, i) => {
        const p0 = ex.s + 0.15 + i * 0.6, ap = E.ease.out(E.seg(t, p0, p0 + 0.4));
        const strike = E.ease.inOut(E.seg(t, ex.s + 2.4 + i * 0.2, ex.s + 2.75 + i * 0.2));
        const y = 760 + i * 190, x = 540 + (1 - ap) * 120;
        ctx.save(); ctx.globalAlpha = exA * ap * (1 - 0.45 * strike);
        ctx.fillStyle = '#141414'; ctx.strokeStyle = '#2E2E2E'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x - 330, y - 70, 660, 130, 18); ctx.fill(); ctx.stroke();
        ctx.fillStyle = th.fg; ctx.font = `700 54px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText(s, x, y + 18);
        ctx.globalAlpha = exA * ap; ctx.strokeStyle = th.red; ctx.lineWidth = 7; ctx.lineCap = 'round';
        if (strike > 0) { ctx.beginPath(); ctx.moveTo(x - 290, y - 2); ctx.lineTo(x - 290 + 580 * strike, y - 2); ctx.stroke(); }
        ctx.restore();
      });
    }
    // 结尾：第 1 天，就是今天
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '第 {1} 天，', 540, 860, { theme: th, size: 92, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '就是{今天}。', 540, 1010, { theme: th, size: 120, tt: t - ac.s - 0.6, weight: 900, glow: 1.0, gold: th.goldHi });
      const p = E.seg(t, ac.s + 1.2, ac.s + 1.8);
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = 30 + 10 * Math.sin(t * 5);
      ctx.beginPath(); ctx.arc(540, 1130, 10, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
