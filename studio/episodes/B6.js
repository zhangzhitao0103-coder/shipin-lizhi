// B6《0 乘以任何数，都是 0》迈出第一步类 · 终端代码风
// 数学锚点：任何数 × 0 = 0。示意：结果 = 计划 × 行动
(function (root) {
  const EP = {
    id: 'B6',
    title: '0乘以任何数都是0',
    theme: 'terminal',
    voice: { sid: 58 },
    capY: 360, capSize: 60,
    music: { style: 'pulse', bpm: 104, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'calc',
    beats: [
      { id: 'hook', min: 3.6, cap: ['计划做得再完美，', '{不动手}，结果是多少？'], voice: '计划做得再完美，不动手，结果是多少？', mood: 0.3, sfx: [{ at: 0.5, type: 'ticks', n: 16, gap: 0.08 }] },
      { id: 'calc', min: 4.4, cap: ['计划 100 分 × 行动 0', '= [0]。'], voice: '计划一百分，乘以行动零，等于零。', mood: 0.5, sfx: [{ at: 0.4, type: 'ticks', n: 24, gap: 0.05 }, { at: 2.8, type: 'boom' }] },
      { id: 'calc2', min: 4.2, cap: ['计划 60 分 × 行动 1', '= {60}。'], voice: '计划六十分，乘以行动一，等于六十。', mood: 0.7, sfx: [{ at: 0.4, type: 'ticks', n: 24, gap: 0.05 }, { at: 2.8, type: 'ding' }] },
      { id: 'why', min: 4.0, cap: ['乘法里只要有一个 0，', '前面再大，都[没用]。'], voice: '乘法里只要有一个零，前面再大，都没用。', mood: 0.6, sfx: [{ at: 0.4, type: 'ticks', n: 18, gap: 0.05 }] },
      { id: 'flip', min: 3.6, cap: ['不完美的开始，', '好过{完美的等待}。'], voice: '不完美的开始，好过完美的等待。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '先动起来，再慢慢变好。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '计划目标数学每天刷题小时周末整理错题行动结果完美的开始等待先动起来再慢慢变好示意分catplanactionresultstart()=×*>$#.txt0123456789',
  };

  const X0 = 90, LH = 62;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const hk = b('hook'), c1 = b('calc'), c2 = b('calc2'), wy = b('why'), fl = b('flip');
    const sceneA = E.seg(t, 0.1, 0.4) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    // [起始时间, 文本, 颜色, 是否为输出]
    const L = [
      [hk.s + 0.4, '$ cat 计划.txt', th.fg],
      [hk.s + 1.2, '  目标：数学 120+', th.dim, 1], [hk.s + 1.5, '  每天刷题 2 小时', th.dim, 1], [hk.s + 1.8, '  周末整理错题', th.dim, 1],
      [c1.s + 0.3, '> plan = 100', th.fg], [c1.s + 1.0, '> action = 0', th.fg], [c1.s + 1.8, '> plan * action', th.fg], [c1.s + 2.7, '0', th.red, 2],
      [c2.s + 0.3, '> plan = 60', th.fg], [c2.s + 1.0, '> action = 1', th.fg], [c2.s + 1.8, '> plan * action', th.fg], [c2.s + 2.7, '60', th.goldHi, 2],
      [wy.s + 0.3, '> 9999 * 0', th.fg], [wy.s + 1.1, '0', th.red, 1],
      [fl.s + 0.3, '> start()', th.goldHi],
    ];
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA; ctx.textAlign = 'left';
      const rows = L.filter(l => t >= l[0]);
      let y = 470;
      rows.forEach((l, i) => {
        const [t0, txt, col, out] = l;
        const big = out === 2;
        const k = out ? txt.length : Math.min(txt.length, Math.floor((t - t0) * 22));
        ctx.fillStyle = col; ctx.font = `${big ? 700 : 500} ${big ? 120 : 44}px ${th.mono}`;
        if (big || col !== th.dim) { ctx.shadowColor = col; ctx.shadowBlur = big ? 30 : 8; }
        const yy = y + (big ? 110 : LH);
        ctx.fillText(txt.slice(0, k), X0 + (big ? 30 : 0), yy); ctx.shadowBlur = 0;
        // 光标
        const isLast = i === rows.length - 1;
        if (isLast && !big && Math.floor(t * 2.5) % 2 === 0) { const w = ctx.measureText(txt.slice(0, k)).width; ctx.fillStyle = th.fg; ctx.fillRect(X0 + w + 8, yy - 40, 24, 46); }
        y = yy + (big ? 30 : 0);
      });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 22px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('示意：结果 = 计划 × 行动', 540, 1680); ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先动起来，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1, font: '"Noto Sans SC"' });
      E.rich(ctx, '{再慢慢变好}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.5, glow: 1.0, gold: th.goldHi, font: '"Noto Sans SC"' });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
