// C3《荷叶第 29 天》坚持类 · 新中式水墨风
// 数学锚点：荷叶每天翻倍、第 30 天铺满 → 第 d 天覆盖 2^(d-30)：第 29 天 50%，第 25 天 3.1%，第 20 天约 0.1%
(function (root) {
  const cov = d => Math.pow(2, d - 30);
  const PCX = 540, PCY = 1060, PR = 380;

  const EP = {
    id: 'C3',
    title: '荷叶第29天',
    theme: 'ink',
    voice: { sid: 30 },
    capY: 360, capSize: 66,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'Dm', 'F', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'a',
    beats: [
      { id: 'hook', min: 3.2, cap: ['池塘里的荷叶，', '每天{翻一倍}。'], voice: '池塘里的荷叶，每天翻一倍。', mood: 0.3, sfx: [{ at: 0.6, type: 'ticks', n: 3, gap: 0.7 }] },
      { id: 'rule', min: 3.0, cap: ['第 30 天，', '荷叶铺满了整个池塘。'], voice: '第三十天，荷叶铺满了整个池塘。', mood: 0.4, sfx: [{ at: 1.2, type: 'ding' }] },
      { id: 'q', min: 3.0, cap: ['那么，第几天，', '荷叶铺满了{一半}？'], voice: '那么，第几天，荷叶铺满了一半？', mood: 0.35 },
      { id: 'a', min: 2.8, cap: ['答案是：第 {29} 天。'], voice: '答案是，第二十九天。', mood: 0.6, sfx: [{ at: 0.1, type: 'boom' }] },
      { id: 'rewind', min: 4.6, cap: ['第 25 天，只有 {3%}；', '第 20 天，还不到 {0.1%}。'], voice: '第二十五天，只有百分之三。第二十天，还不到千分之一。', mood: 0.45, sfx: [{ at: 0.2, type: 'whoosh' }] },
      { id: 'look', min: 3.6, cap: ['前 25 天，', '池塘看起来，{几乎什么都没发生}。'], voice: '前二十五天，池塘看起来，几乎什么都没发生。', mood: 0.35 },
      { id: 'flip', min: 3.2, cap: ['大多数人，', '就是在第 25 天[放弃]的。'], voice: '大多数人，就是在第二十五天放弃的。', mood: 0.5 },
      { id: 'quote', min: 3.6, cap: ['你的积累也一样：', '前面越安静，后面{越快}。'], voice: '你的积累也一样，前面越安静，后面越快。', mood: 0.8 },
      { id: 'action', min: 3.4, cap: null, voice: '再等等，你的第二十九天，就要来了。', mood: 1.0, sfx: [{ at: 1.4, type: 'boom' }] },
    ],
    texts: '第天覆盖0123456789.%日坚持再等等你的就要来了荷叶铺满池塘放弃',
  };

  // 预生成荷叶：从一点向外长，按距离排序
  let LEAVES = null;
  function leaves(E) {
    if (LEAVES) return LEAVES;
    const r = E.rng(29), out = [];
    const seed = [PCX - 90, PCY - 40];
    for (let k = 0; k < 9000 && out.length < 420; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (PR - 30), x = PCX + Math.cos(a) * d, y = PCY + Math.sin(a) * d;
      const rad = 22 + r() * 46;
      if (Math.hypot(x - PCX, y - PCY) + rad * 0.6 > PR - 8) continue;
      if (out.some(L => Math.hypot(L.x - x, L.y - y) < (L.r + rad) * 0.6)) continue;
      out.push({ x, y, r: rad, rot: r() * 6.28, notch: r() * 6.28, shade: r() });
    }
    out.sort((A, B) => Math.hypot(A.x - seed[0], A.y - seed[1]) - Math.hypot(B.x - seed[0], B.y - seed[1]));
    let acc = 0; const total = PR * PR; // 按池塘面积归一：覆盖率 = 已长出的荷叶面积 / 池塘面积
    out.forEach(L => { L.c0 = acc / total; acc += L.r * L.r; L.c1 = acc / total; });
    LEAVES = out; return out;
  }

  function leaf(ctx, L, k, th) {
    if (k <= 0) return;
    const rr = L.r * Math.sqrt(k);
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot);
    const g = ctx.createRadialGradient(-rr * 0.2, -rr * 0.2, rr * 0.1, 0, 0, rr);
    g.addColorStop(0, `rgba(${110 + L.shade * 30},${150 + L.shade * 20},${105},0.92)`); g.addColorStop(1, 'rgba(48,82,52,0.95)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, rr, 0.18, Math.PI * 2 - 0.18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,40,30,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = 'rgba(220,235,200,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { const a = 0.4 + i * 0.7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * rr * 0.85, Math.sin(a) * rr * 0.85); ctx.stroke(); }
    ctx.restore();
  }

  function pond(ctx, th, t, a, E) {
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(PCX, PCY, 40, PCX, PCY, PR);
    g.addColorStop(0, 'rgba(120,130,125,0.10)'); g.addColorStop(1, 'rgba(60,70,65,0.22)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(PCX, PCY, PR, 0, Math.PI * 2); ctx.fill();
    // 毛笔圆：粗细变化的描边
    const r = E.rng(5);
    for (let i = 0; i < 120; i++) {
      const a0 = (i / 120) * Math.PI * 2 - 1.2, a1 = a0 + Math.PI * 2 / 110;
      const w = 4 + 7 * Math.pow(Math.sin(i / 120 * Math.PI), 1.5) + r() * 2;
      ctx.strokeStyle = `rgba(25,22,18,${0.75 + r() * 0.2})`; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(PCX, PCY, PR + (r() - 0.5) * 3, a0, a1); ctx.stroke();
    }
    ctx.restore();
  }

  function dayAt(t, TL, E) {
    const b = id => TL.b(id);
    const step = (from, to, s, e) => { const p = E.seg(t, s, e); const n = to - from; const k = p * n; const i = Math.floor(k); const f = E.ease.out(E.clamp((k - i) * 3)); return from + Math.min(n, i + f); };
    if (t < b('rule').s) return step(23, 27, b('hook').s + 0.4, b('hook').e);
    if (t < b('q').s) return step(27, 30, b('rule').s, b('rule').s + 1.4);
    if (t < b('a').s) return 30;
    if (t < b('rewind').s) return 30 - E.ease.inOut(E.seg(t, b('a').s, b('a').s + 0.8));
    if (t < b('look').s) { const p1 = E.ease.inOut(E.seg(t, b('rewind').s + 0.2, b('rewind').s + 1.4)), p2 = E.ease.inOut(E.seg(t, b('rewind').s + 2.4, b('rewind').s + 3.4)); return 29 - 4 * p1 - 5 * p2; }
    if (t < b('quote').s) return 20;
    return 20 + 10 * E.ease.inOut(E.seg(t, b('quote').s, b('quote').s + 1.8));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const L = leaves(E);
    const pondA = E.seg(t, 0, 0.8) * (1 - 0.97 * E.seg(t, b('look').s, b('look').s + 0.5) + 0.97 * E.seg(t, b('quote').s, b('quote').s + 0.5)) * (1 - 0.86 * E.seg(t, b('action').s, b('action').s + 0.5));
    const d = dayAt(t, TL, E), c = cov(d);
    if (pondA > 0) {
      pond(ctx, th, t, pondA, E);
      ctx.save(); ctx.globalAlpha = pondA;
      ctx.beginPath(); ctx.arc(PCX, PCY, PR - 4, 0, Math.PI * 2); ctx.clip();
      const target = c * 1.0;
      if (c > 0.85) { ctx.fillStyle = `rgba(70,105,72,${0.75 * E.seg(c, 0.85, 1)})`; ctx.fillRect(PCX - PR, PCY - PR, PR * 2, PR * 2); }
      for (const lf of L) { if (lf.c0 >= target) break; leaf(ctx, lf, E.clamp((target - lf.c0) / (lf.c1 - lf.c0)), th); }
      ctx.restore();
      // 天数与覆盖率
      ctx.save(); ctx.globalAlpha = pondA; ctx.textAlign = 'center'; ctx.fillStyle = th.fg; ctx.font = `400 60px ${th.num}`;
      const pct = c * 100;
      ctx.fillText(`第 ${Math.round(d)} 天`, 540, 1560);
      ctx.font = `700 40px ${th.cap}`; ctx.fillStyle = pct >= 50 ? th.gold : th.dim;
      ctx.fillText('覆盖 ' + (pct >= 10 ? pct.toFixed(0) : pct >= 1 ? pct.toFixed(1) : pct.toFixed(2)) + '%', 540, 1625);
      ctx.restore();
    }
    // 30 天柱状图：前 25 天几乎看不见
    const lk = b('look');
    const barA = E.seg(t, lk.s + 0.2, lk.s + 0.7) * (1 - E.seg(t, b('quote').s - 0.2, b('quote').s + 0.3));
    if (barA > 0) {
      const x0 = 120, x1 = 960, base = 1400, Hh = 620, w = (x1 - x0) / 30;
      ctx.save(); ctx.globalAlpha = barA;
      ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 10, base); ctx.lineTo(x1 + 10, base); ctx.stroke();
      for (let i = 1; i <= 30; i++) {
        const p = E.ease.out(E.seg(t, lk.s + 0.3 + i * 0.06, lk.s + 0.7 + i * 0.06));
        const h = Math.max(1.5, cov(i) * Hh) * p, x = x0 + (i - 1) * w + w * 0.15;
        ctx.fillStyle = i > 25 ? th.gold : 'rgba(30,28,25,0.7)'; ctx.fillRect(x, base - h, w * 0.7, h);
        if (i % 5 === 0 || i === 29) { ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(String(i), x + w * 0.35, base + 36); }
      }
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('每天的覆盖面积', x0, base - Hh - 30);
      // 第 25 天：放弃
      const fl = E.ease.out(E.seg(t, b('flip').s + 0.6, b('flip').s + 1.2));
      if (fl > 0) {
        const x = x0 + 24 * w + w * 0.5;
        ctx.strokeStyle = th.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(x, base - 20, 34, 60, 0, -1.2, -1.2 + Math.PI * 2 * fl); ctx.stroke();
        ctx.globalAlpha = barA * fl; ctx.fillStyle = th.red; ctx.font = `400 64px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('放弃', x - 10, base - 120);
      }
      ctx.restore();
    }
    // 结尾 + 红色印章
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '再等等，', 540, 860, { theme: th, size: 80, tt: t - ac.s - 0.1, font: th.num, weight: 400 });
      E.rich(ctx, '你的{第 29 天}就要来了。', 540, 1000, { theme: th, size: 84, tt: t - ac.s - 0.6, font: th.num, weight: 400 });
      const sp = E.seg(t, ac.s + 1.4, ac.s + 1.6);
      if (sp > 0) {
        const s = 1.6 - 0.6 * E.ease.out(sp);
        ctx.save(); ctx.translate(820, 1180); ctx.rotate(-0.08); ctx.scale(s, s); ctx.globalAlpha = sp * 0.92;
        ctx.fillStyle = th.red; ctx.beginPath(); ctx.roundRect(-62, -62, 124, 124, 10); ctx.fill();
        ctx.fillStyle = th.bg; ctx.font = `400 50px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('坚', 0, -6); ctx.fillText('持', 0, 46);
        ctx.restore();
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
