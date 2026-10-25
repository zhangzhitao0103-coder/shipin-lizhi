// E2《寒假别想全科都补》专注类 · 暗金电影风
// 真实运行的渗流实验：40×40 网格，光只传给上下左右相邻的亮格。
// 4 张网格各 15%（共 960 格）全部不通；同样 960 格放进 1 张（60%）贯通。正方形网格临界点约 59.27%
(function (root) {
  const N = 40, CELLS = N * N, PER = Math.round(CELLS * 0.15), ALL = PER * 4;

  function makeGrid(count, seed, E) {
    const r = E.rng(seed), idx = Array.from({ length: CELLS }, (_, i) => i);
    for (let i = CELLS - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const lit = new Uint8Array(CELLS); for (let i = 0; i < count; i++) lit[idx[i]] = 1;
    // 从顶行广度优先扩散
    const dist = new Int32Array(CELLS).fill(-1), par = new Int32Array(CELLS).fill(-1), q = [];
    for (let x = 0; x < N; x++) if (lit[x]) { dist[x] = 0; q.push(x); }
    for (let h = 0; h < q.length; h++) {
      const c = q[h], x = c % N, y = (c / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const n = ny * N + nx; if (lit[n] && dist[n] < 0) { dist[n] = dist[c] + 1; par[n] = c; q.push(n); }
      }
    }
    let end = -1; for (let x = 0; x < N; x++) { const c = (N - 1) * N + x; if (dist[c] >= 0 && (end < 0 || dist[c] < dist[end])) end = c; }
    const path = []; for (let c = end; c >= 0; c = par[c]) path.push(c);
    const maxD = Math.max(0, ...dist);
    return { lit, dist, end, path: path.reverse(), maxD, percolates: end >= 0 };
  }

  let G = null;
  function grids(E) {
    if (G) return G;
    const small = [11, 12, 13, 14].map(s => makeGrid(PER, s, E));
    let big = null; for (let s = 100; s < 400 && !(big && big.percolates); s++) big = makeGrid(ALL, s, E);
    G = { small, big, demo: makeGrid(Math.round(CELLS * 0.5), 7, E) }; return G;
  }

  const EP = {
    id: 'E2',
    title: '寒假别想全科都补',
    theme: 'cinema',
    voice: { sid: 58 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'pass',
    beats: [
      { id: 'hook', min: 3.4, cap: ['寒假想把 4 科都补一补？', '先看一个{实验}。'], voice: '寒假想把四科都补一补？先看一个实验。', mood: 0.3 },
      { id: 'rule', min: 4.0, cap: ['一张网格，每格要么亮，要么暗；', '光只能传给{相邻}的亮格。'], voice: '一张网格，每格要么亮，要么暗。光只能传给相邻的亮格。', mood: 0.35 },
      { id: 'goal', min: 3.0, cap: ['从最上面点燃，', '光能不能走到{最底下}？'], voice: '从最上面点燃，光能不能走到最底下？', mood: 0.4 },
      { id: 'four', min: 4.2, cap: ['把同样多的亮格，分给 4 张网格：', '每张只有 15%。'], voice: '把同样多的亮格，分给四张网格，每张只有百分之十五。', mood: 0.5, sfx: [{ at: 1.6, type: 'ticks', n: 4, gap: 0.3 }] },
      { id: 'fail', min: 2.6, cap: ['4 张，[一张都不通]。'], voice: '四张，一张都不通。', mood: 0.3 },
      { id: 'one', min: 3.4, cap: ['全部放进 1 张：', '亮到 {60%}——'], voice: '全部放进一张，亮到百分之六十——', mood: 0.7, sfx: [{ at: 0.6, type: 'riser', dur: 2.6 }] },
      { id: 'pass', min: 2.8, cap: ['{通了}。'], voice: '通了。', mood: 1.0, sfx: [{ at: 0.1, type: 'boom' }] },
      { id: 'why', min: 3.8, cap: ['物理学算过，临界点约在 {59.27%}：', '低于它，几乎不可能贯通。'], voice: '物理学算过，临界点大约在百分之五十九点二七，低于它，几乎不可能贯通。', mood: 0.6 },
      { id: 'flip', min: 3.8, cap: ['精力也一样：', '分给每一科，每一科都{差一口气}。'], voice: '精力也一样，分给每一科，每一科都差一口气。', mood: 0.55 },
      { id: 'action', min: 3.0, cap: null, voice: '这个寒假，先打穿一科。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '点亮通了YESNO张网格每格临界点约0123456789.%亮格这个寒假先打穿一科语数英物',
  };

  function drawGrid(ctx, th, g, x0, y0, size, t0, t, E, reveal, a) {
    const p = size / N, s = p * 0.84;
    const front = reveal * (g.maxD + 1);
    ctx.save(); ctx.globalAlpha = a;
    for (let c = 0; c < CELLS; c++) {
      const x = x0 + (c % N) * p, y = y0 + ((c / N) | 0) * p;
      const lit = g.lit[c], d = g.dist[c];
      if (lit && d >= 0 && d < front) { ctx.fillStyle = th.gold; }
      else if (lit) ctx.fillStyle = '#5B574F';
      else ctx.fillStyle = '#1C1B19';
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.background(ctx, th, t);
    const gr = grids(E);
    const endDim = 1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4);

    // 规则演示用大网格（开头 + 1 张 60%）
    const bigA = (E.seg(t, b('rule').s, b('rule').s + 0.6) * (1 - E.seg(t, b('four').s - 0.2, b('four').s + 0.3)) + E.seg(t, b('one').s, b('one').s + 0.5)) * endDim * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (bigA > 0) {
      const inOne = t > b('one').s - 0.1;
      // 开头用一张 50% 的示例网格讲规则
      const demo = inOne ? gr.big : gr.demo;
      const reveal = inOne ? E.ease.inOut(E.seg(t, b('one').e - 0.6, b('pass').s + 0.9)) : E.ease.inOut(E.seg(t, b('goal').s + 0.8, b('goal').e));
      drawGrid(ctx, th, demo, 140, 620, 800, 0, t, E, reveal, bigA);
      if (inOne && reveal >= 1) {
        // 贯通路径
        const pa = E.seg(t, b('pass').s + 0.9, b('pass').s + 1.4);
        ctx.save(); ctx.globalAlpha = bigA * pa; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 6; ctx.shadowColor = th.goldHi; ctx.shadowBlur = 24; ctx.lineJoin = 'round';
        ctx.beginPath(); gr.big.path.forEach((c, i) => { const x = 140 + (c % N) * 20 + 8.4, y = 620 + ((c / N) | 0) * 20 + 8.4; i ? ctx.lineTo(x, y) : ctx.moveTo(x, 620); if (i === gr.big.path.length - 1) ctx.lineTo(x, 1420); }); ctx.stroke(); ctx.restore();
      }
      // 读数
      ctx.save(); ctx.globalAlpha = bigA;
      const lit = inOne ? ALL / CELLS : 0.5, ok = inOne && reveal >= 1;
      E.hud(ctx, th, 140, 1480, 'CELLS LIT 点亮', (lit * 100).toFixed(1) + '%', { alpha: bigA, size: 50 });
      E.hud(ctx, th, 940, 1480, 'PERCOLATES 通了', ok ? 'YES' : 'NO', { alpha: bigA, size: 50, align: 'right', color: ok ? th.goldHi : th.dim, glow: ok });
      ctx.restore();
    }
    // 4 张 15%
    const fourA = E.seg(t, b('four').s, b('four').s + 0.5) * (1 - E.seg(t, b('one').s - 0.2, b('one').s + 0.3));
    if (fourA > 0) {
      const pos = [[130, 640], [570, 640], [130, 1100], [570, 1100]], subj = ['语文', '数学', '英语', '物理'];
      gr.small.forEach((g, i) => {
        const a = fourA * E.seg(t, b('four').s + 0.2 + i * 0.3, b('four').s + 0.6 + i * 0.3);
        const rv = E.ease.inOut(E.seg(t, b('four').s + 1.6 + i * 0.3, b('four').s + 2.6 + i * 0.3));
        drawGrid(ctx, th, g, pos[i][0], pos[i][1], 380, 0, t, E, rv, a);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(subj[i] + ' · 15%', pos[i][0], pos[i][1] - 18);
        const no = E.seg(t, b('fail').s + i * 0.15, b('fail').s + 0.3 + i * 0.15);
        if (no > 0) { ctx.globalAlpha = a * no; ctx.fillStyle = th.red; ctx.textAlign = 'right'; ctx.fillText('不通', pos[i][0] + 380, pos[i][1] - 18); }
        ctx.restore();
      });
    }
    // 59.27%
    const wb = b('why');
    const wA = E.seg(t, wb.s + 0.2, wb.s + 0.6) * (1 - E.seg(t, b('flip').s - 0.1, b('flip').s + 0.3));
    if (wA > 0) {
      ctx.save(); ctx.globalAlpha = wA; ctx.fillStyle = 'rgba(7,7,9,0.72)'; ctx.fillRect(0, 880, 1080, 300); ctx.restore();
      E.bigNumber(ctx, th, '59.27%', 540, 1090, { size: 200, alpha: wA });
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '这个寒假，', 540, 880, { theme: th, size: 90, tt: t - ac.s - 0.1 });
      E.rich(ctx, '先{打穿一科}。', 540, 1030, { theme: th, size: 116, tt: t - ac.s - 0.5, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
