// J3《寒假是压弹簧的时候》信心类 · 霓虹科技风
// 物理锚点：弹性势能 E = ½kx²（弹性限度内）：压缩量变为 2 倍，能量变为 4 倍；3 倍 → 9 倍
(function (root) {
  const BASE = 1450, TOP0 = 950, UNIT = 100, CX = 430;

  const EP = {
    id: 'J3',
    title: '寒假是压弹簧的时候',
    theme: 'neon',
    voice: { sid: 100 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 104, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'x3',
    beats: [
      { id: 'hook', min: 3.0, cap: ['为什么有的人，', '一开学就{突飞猛进}？'], voice: '为什么有的人，一开学就突飞猛进？', mood: 0.35 },
      { id: 'spring', min: 3.4, cap: ['物理课学过：', '弹性势能 {E = ½kx²}。'], voice: '物理课学过，弹簧的弹性势能，跟压缩量的平方成正比。', mood: 0.4 },
      { id: 'x2', min: 2.8, cap: ['压缩 2 倍，', '能量是 {4 倍}。'], voice: '压缩两倍，能量是四倍。', mood: 0.55, sfx: [{ at: 0.3, type: 'ticks', n: 4, gap: 0.12 }] },
      { id: 'x3', min: 2.8, cap: ['压缩 3 倍，', '能量是 {9 倍}。'], voice: '压缩三倍，能量是九倍。', mood: 0.7, sfx: [{ at: 0.3, type: 'ticks', n: 9, gap: 0.08 }] },
      { id: 'release', min: 2.4, cap: ['松手的那一刻——'], voice: '松手的那一刻——', mood: 1.0, sfx: [{ at: 0.9, type: 'boom' }] },
      { id: 'flip', min: 2.8, cap: ['寒假，', '就是{压弹簧}的时候。'], voice: '寒假，就是压弹簧的时候。', mood: 0.6 },
      { id: 'hard', min: 4.0, cap: ['每多压一点，都会更累一点；', '但弹起来的时候，{加倍奉还}。'], voice: '每多压一点，都会更累一点，但弹起来的时候，加倍奉还。', mood: 0.8 },
      { id: 'action', min: 2.8, cap: null, voice: '这个寒假，把自己压紧一点。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'E=½kx²压缩倍能量你在弹性限度内寒假这个把自己压紧一点0123456789×',
  };

  function compAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('spring').s + 0.8) return 0;
    if (t < b('x2').s) return 1 * E.ease.inOut(E.seg(t, b('spring').s + 0.8, b('spring').e));
    if (t < b('x3').s) return 1 + E.ease.inOut(E.seg(t, b('x2').s, b('x2').s + 0.8));
    if (t < b('release').s + 0.8) return 2 + E.ease.inOut(E.seg(t, b('x3').s, b('x3').s + 0.8));
    return 3 * (1 - E.ease.out(E.seg(t, b('release').s + 0.8, b('release').s + 1.0)));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.8 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4) + 0.8 * E.seg(t, b('hard').s, b('hard').s + 0.5)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const x = compAt(t, TL, E), top = TOP0 + x * UNIT;
    ctx.save(); ctx.globalAlpha = sceneA;
    // 底座
    ctx.fillStyle = th.faint; ctx.fillRect(CX - 170, BASE, 340, 24);
    // 弹簧
    ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 18 + 10 * x; ctx.lineJoin = 'round';
    ctx.beginPath(); const turns = 14, L = BASE - top - 20;
    ctx.moveTo(CX, BASE);
    for (let i = 0; i <= turns * 2; i++) ctx.lineTo(CX + (i % 2 ? 80 : -80) * (i === 0 || i === turns * 2 ? 0 : 1), BASE - (i / (turns * 2)) * L);
    ctx.stroke(); ctx.shadowBlur = 0;
    // 压板 + 方块
    const rel = b('release');
    const fly = E.ease.in(E.seg(t, rel.s + 0.9, rel.s + 1.6));
    const by = top - 20 - fly * 1300;
    ctx.fillStyle = th.fg; ctx.fillRect(CX - 130, top - 20, 260, 20);
    ctx.fillStyle = th.red; ctx.shadowColor = th.red; ctx.shadowBlur = 30;
    ctx.fillRect(CX - 70, by - 120, 140, 120); ctx.shadowBlur = 0;
    ctx.fillStyle = '#04050D'; ctx.font = `900 56px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('你', CX, by - 40);
    if (fly > 0) { const g = ctx.createLinearGradient(0, by, 0, by + 400); g.addColorStop(0, 'rgba(255,61,139,0.5)'); g.addColorStop(1, 'rgba(255,61,139,0)'); ctx.fillStyle = g; ctx.fillRect(CX - 70, by, 140, 400); }
    // 压缩量标尺
    if (x > 0.02 && fly === 0) {
      ctx.strokeStyle = th.dim; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(CX - 200, TOP0 - 20); ctx.lineTo(CX + 200, TOP0 - 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText('x = ' + x.toFixed(1), CX - 190, (TOP0 - 20 + top - 20) / 2 + 12);
    }
    // 能量柱（∝ x²）
    const ex = 800, eb = 1450, k = 60;
    ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('能量 E', ex, 760);
    const E2v = x * x;
    ctx.fillStyle = th.red; ctx.shadowColor = th.red; ctx.shadowBlur = 20; ctx.fillRect(ex - 60, eb - E2v * k, 120, E2v * k); ctx.shadowBlur = 0;
    ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.strokeRect(ex - 60, eb - 9 * k, 120, 9 * k);
    [1, 4, 9].forEach(v => { ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('×' + v, ex + 74, eb - v * k + 8); ctx.fillRect(ex + 60, eb - v * k, 10, 2); });
    ctx.fillStyle = th.goldHi; ctx.font = `700 54px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('×' + (E2v < 0.05 ? 0 : E2v.toFixed(E2v % 1 ? 1 : 0)), ex, eb + 70);
    ctx.globalAlpha = sceneA * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.fillText('E = ½kx²，在弹性限度内', 540, 1680);
    ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '这个寒假，', 540, 880, { theme: th, size: 90, tt: t - ac.s - 0.1 });
      E.rich(ctx, '把自己{压紧一点}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
