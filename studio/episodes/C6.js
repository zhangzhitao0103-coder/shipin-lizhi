// C6《学霸也在 58% 停留过》坚持到临界点类 · 冷蓝电影风（长版）
// 真实运行的渗流模拟：40×40 网格按随机顺序逐格点亮（种子 15），点亮到第 949 格（59.31%）时第一次上下贯通。
// 曲线：每种网格各模拟 200 次，统计"点亮比例 ≤ p 时已贯通"的比例；网格越大曲线越陡，无限大网格的临界点约 59.27%
(function (root) {
  const N = 40, CELLS = N * N, SEED = 15;

  function rngOf(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function order(n, seed) {
    const C = n * n, r = rngOf(seed), idx = new Int32Array(C); for (let i = 0; i < C; i++) idx[i] = i;
    for (let i = C - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    return idx;
  }
  // 逐格点亮，返回第一次上下贯通时点亮的格数
  function kstar(n, idx) {
    const C = n * n, p = new Int32Array(C + 2), lit = new Uint8Array(C);
    for (let i = 0; i < C + 2; i++) p[i] = i;
    const f = x => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }, u = (a, b) => { p[f(a)] = f(b); };
    for (let k = 0; k < C; k++) {
      const c = idx[k], x = c % n, y = (c / n) | 0; lit[c] = 1;
      if (y === 0) u(c, C); if (y === n - 1) u(c, C + 1);
      if (x > 0 && lit[c - 1]) u(c, c - 1); if (x < n - 1 && lit[c + 1]) u(c, c + 1);
      if (y > 0 && lit[c - n]) u(c, c - n); if (y < n - 1 && lit[c + n]) u(c, c + n);
      if (f(C) === f(C + 1)) return k + 1;
    }
    return C;
  }
  let S = null;
  function sim() {
    if (S) return S;
    const idx = order(N, SEED), K = kstar(N, idx);
    const rank = new Int32Array(CELLS); idx.forEach((c, k) => { rank[c] = k; });
    // 贯通那一刻：从顶行广度优先扩散，记录距离和最短路径
    const dist = new Int32Array(CELLS).fill(-1), par = new Int32Array(CELLS).fill(-1), q = [];
    for (let x = 0; x < N; x++) if (rank[x] < K) { dist[x] = 0; q.push(x); }
    for (let h = 0; h < q.length; h++) {
      const c = q[h], x = c % N, y = (c / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const n = ny * N + nx; if (rank[n] < K && dist[n] < 0) { dist[n] = dist[c] + 1; par[n] = c; q.push(n); }
      }
    }
    let end = -1; for (let x = 0; x < N; x++) { const c = (N - 1) * N + x; if (dist[c] >= 0 && (end < 0 || dist[c] < dist[end])) end = c; }
    const onPath = new Uint8Array(CELLS); for (let c = end; c >= 0; c = par[c]) onPath[c] = 1;
    const maxD = Math.max(...dist);
    // 贯通概率曲线
    const curve = n => { const ks = []; for (let s = 1; s <= 200; s++) ks.push(kstar(n, order(n, 1000 + s)) / (n * n)); return p => ks.filter(k => k <= p).length / ks.length; };
    S = { K, rank, dist, onPath, maxD, small: curve(40), big: curve(200) };
    return S;
  }

  const EP = {
    id: 'C6',
    title: '学霸也在58%停留过',
    theme: 'ice',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am'] },
    cover: 'pass',
    beats: [
      { id: 'hook', min: 3.6, cap: ['你有没有过这种感觉：', '{一直在学}，成绩却[一动不动]？'], voice: '你有没有过这种感觉，一直在学，成绩却一动不动？', mood: 0.3 },
      { id: 'grid', min: 4.0, cap: ['把你学会的每个知识点，', '看成网格里一个{亮起来的格子}。'], voice: '把你学会的每个知识点，看成网格里一个亮起来的格子。', mood: 0.35 },
      { id: 'rule', min: 4.2, cap: ['亮格连成一条从上到下的路，', '才算{真正打通}。'], voice: '亮格连成一条从上到下的路，才算真正打通。', mood: 0.4 },
      { id: 'f30', min: 3.0, cap: ['亮了 30%：', '[一条路都没有]。'], voice: '亮了百分之三十，一条路都没有。', mood: 0.45, sfx: [{ at: 0.3, type: 'ticks', n: 14, gap: 0.12 }] },
      { id: 'f50', min: 3.0, cap: ['亮了 50%：', '还是[不通]。'], voice: '亮了一半，还是不通。', mood: 0.5, sfx: [{ at: 0.3, type: 'ticks', n: 10, gap: 0.12 }] },
      { id: 'f58', min: 3.8, cap: ['亮了 58%：一大片都亮着，', '就是[连不起来]。'], voice: '亮了百分之五十八，一大片都亮着，就是连不起来。', mood: 0.55, sfx: [{ at: 0.3, type: 'ticks', n: 6, gap: 0.14 }] },
      { id: 'f59', min: 3.4, cap: ['再多亮{几格}——'], voice: '再多亮几格。', mood: 0.75, sfx: [{ at: 0.3, type: 'ticks', n: 21, gap: 0.12 }, { at: 0.3, type: 'riser', dur: 2.6 }] },
      { id: 'pass', min: 3.0, cap: ['{通了}。'], voice: '通了。', mood: 1.0, sfx: [{ at: 0.1, type: 'boom' }] },
      { id: 'why', min: 4.6, cap: ['物理学里这叫"渗流"：', '正方形网格的临界点，约是 {59.27%}。'], voice: '物理学里，这叫渗流。正方形网格的临界点，大约是百分之五十九点二七。', mood: 0.6 },
      { id: 'curve', min: 5.0, cap: ['网格越大，越像一道{悬崖}：', '58% 时很难通，60% 时{大多都通了}。'], voice: '网格越大，越像一道悬崖。百分之五十八时很难通，百分之六十时，大多都通了。', mood: 0.7 },
      { id: 'flip', min: 4.0, cap: ['你现在的"没进步"，', '可能只是停在了 {58%}。'], voice: '你现在的没进步，可能只是停在了百分之五十八。', mood: 0.6 },
      { id: 'flip2', min: 3.8, cap: ['学霸也在 58% 停留过，', '区别是，{他们没走}。'], voice: '学霸也在百分之五十八停留过，区别是，他们没走。', mood: 0.8 },
      { id: 'action', min: 3.2, cap: null, voice: '在百分之五十八的时候，别走。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '点亮已贯通未第格网格越大越陡贯通概率比例真实渗流模拟随机顺序无限大正方形临界点约次在的时候别走上下0123456789.%×—',
  };

  const GX = 140, GY = 620, P = 20;

  function litCount(t, TL, E, K) {
    const b = id => TL.b(id);
    const go = (a, z, st, d, ease = E.ease.inOut) => Math.round(E.lerp(a, z, ease(E.seg(t, st, st + d))));
    const c30 = Math.round(CELLS * 0.3), c50 = Math.round(CELLS * 0.5), c58 = Math.round(CELLS * 0.58);
    if (t < b('f30').s) return 0;
    if (t < b('f50').s) return go(0, c30, b('f30').s + 0.2, 1.6);
    if (t < b('f58').s) return go(c30, c50, b('f50').s + 0.2, 1.2);
    if (t < b('f59').s) return go(c50, c58, b('f58').s + 0.2, 0.8);
    if (t < b('pass').s) return go(c58, K - 1, b('f59').s + 0.3, 2.5, E.ease.linear);
    return K;  // 最后一格在"通了"那一刻亮起
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const s = sim();
    const ps = b('pass'), cv = b('curve'), fl = b('flip'), f2 = b('flip2');
    // 网格
    const gA = E.seg(t, b('grid').s, b('grid').s + 0.6) * (1 - E.seg(t, cv.s - 0.1, cv.s + 0.4));
    if (gA > 0) {
      const n = litCount(t, TL, E, s.K), front = E.seg(t, ps.s, ps.s + 1.4) * (s.maxD + 1);
      ctx.save(); ctx.globalAlpha = gA;
      for (let c = 0; c < CELLS; c++) {
        const x = GX + (c % N) * P, y = GY + ((c / N) | 0) * P;
        const lit = s.rank[c] < n, flow = s.dist[c] >= 0 && s.dist[c] < front && t > ps.s;
        if (flow) { ctx.fillStyle = s.onPath[c] && t > ps.s + 1.2 ? th.goldHi : th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = s.onPath[c] ? 14 : 0; }
        else if (lit) { const fresh = s.rank[c] >= n - 1 && t > b('f59').s; ctx.fillStyle = fresh ? '#FFFFFF' : 'rgba(150,190,220,0.55)'; ctx.shadowBlur = 0; }
        else { ctx.fillStyle = 'rgba(40,70,100,0.25)'; ctx.shadowBlur = 0; }
        ctx.fillRect(x + 2, y + 2, P - 4, P - 4);
      }
      ctx.shadowBlur = 0;
      // 上下标记
      const rA = E.seg(t, b('rule').s + 0.2, b('rule').s + 0.7);
      if (rA > 0) {
        ctx.globalAlpha = gA * rA; ctx.fillStyle = th.gold; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillText('上 ↓', GX + N * P / 2, GY - 16); ctx.fillText('下', GX + N * P / 2, GY + N * P + 40);
      }
      // 读数
      ctx.globalAlpha = gA;
      const pct = (n / CELLS) * 100, passed = t > ps.s;
      E.hud(ctx, th, GX, 1530, '点亮比例', pct.toFixed(n >= Math.round(CELLS * 0.58) ? 2 : 0) + '%', { alpha: gA, color: passed ? th.goldHi : th.fg, glow: passed, size: 64 });
      E.hud(ctx, th, GX + N * P, 1530, '上下贯通', passed ? 'YES' : 'NO', { alpha: gA, color: passed ? th.goldHi : th.red, glow: passed, size: 64, align: 'right' });
      ctx.restore();
    }
    // 贯通概率曲线
    const cA = E.seg(t, cv.s + 0.2, cv.s + 0.8) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (cA > 0) {
      const X0 = 170, X1 = 930, Y0 = 1350, Y1 = 760, p0 = 0.5, p1 = 0.7;
      const px = p => X0 + ((p - p0) / (p1 - p0)) * (X1 - X0), py = v => Y0 - v * (Y0 - Y1);
      ctx.save(); ctx.globalAlpha = cA;
      ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, Y1 - 30); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('贯通概率', X0, Y1 - 50);
      ctx.textAlign = 'center';
      [0.5, 0.55, 0.6, 0.65, 0.7].forEach(p => ctx.fillText(Math.round(p * 100) + '%', px(p), Y0 + 40));
      ctx.textAlign = 'right'; ['0', '50%', '100%'].forEach((l, i) => ctx.fillText(l, X0 - 12, py(i / 2) + 8));
      // 临界线
      ctx.setLineDash([10, 8]); ctx.strokeStyle = th.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px(0.5927), Y1 - 20); ctx.lineTo(px(0.5927), Y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.gold; ctx.font = `700 28px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('59.27%', px(0.5927) + 10, Y1 - 4);
      const prog = E.ease.inOut(E.seg(t, cv.s + 0.4, cv.s + 2.0));
      [[s.small, 'rgba(150,190,220,0.8)', 3, '40×40'], [s.big, th.goldHi, 5, '200×200']].forEach(([fn, col, w, lab], k) => {
        const kp = E.seg(prog, k * 0.3, 0.7 + k * 0.3);
        if (kp <= 0) return;
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
        const steps = 80; for (let i = 0; i <= steps * kp; i++) { const p = p0 + (p1 - p0) * i / steps; i ? ctx.lineTo(px(p), py(fn(p))) : ctx.moveTo(px(p), py(fn(p))); }
        ctx.stroke();
        ctx.fillStyle = col; ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'right';
        if (kp > 0.9) ctx.fillText(lab + ' 网格', X1, py(1) + 40 + k * 40);
      });
      // 58% → 60% 的点
      const dot = (p, col, label) => { const v = s.big(p); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(px(p), py(v), 14, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.font = `700 30px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText(label, px(p) - 28, py(v) + 10); };
      const d1 = E.seg(t, cv.s + 2.6, cv.s + 3.0), d2 = E.seg(t, cv.s + 3.4, cv.s + 3.8);
      if (d1 > 0) { ctx.globalAlpha = cA * d1; dot(0.58, th.red, '58%：' + Math.round(s.big(0.58) * 100) + '%'); }
      if (d2 > 0) { ctx.globalAlpha = cA * d2; dot(0.60, th.goldHi, '60%：' + Math.round(s.big(0.60) * 100) + '%'); }
      // 翻转：箭头从 58% 指向 60%
      const aA = E.seg(t, f2.s + 0.6, f2.s + 1.2);
      if (aA > 0) {
        ctx.globalAlpha = cA * aA; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 4;
        const xa = px(0.58), ya = py(s.big(0.58)), xb = px(0.6), yb = py(s.big(0.6)), k = E.ease.out(aA);
        ctx.beginPath(); ctx.moveTo(xa + 16, ya - 10); ctx.lineTo(E.lerp(xa + 16, xb - 16, k), E.lerp(ya - 10, yb + 10, k)); ctx.stroke();
      }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = cA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('每条曲线为 200 次真实模拟；无限大正方形网格的临界点约 59.27%', 540, 1470); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, b('grid').s, b('grid').s + 0.5) * (1 - E.seg(t, cv.s - 0.1, cv.s + 0.3)); ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('真实渗流模拟：40×40 网格按随机顺序点亮；把知识点比作格子是类比', 540, 1680); ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '在 58% 的时候，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{别走}。', 540, 1050, { theme: th, size: 140, tt: t - ac.s - 0.7, glow: 1.2, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
