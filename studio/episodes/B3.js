// B3《一块骨牌，推倒一座大楼》迈出第一步类 · 包豪斯几何风
// 依据：Whitehead（1983，American Journal of Physics）演示：一块骨牌能推倒约大 1.5 倍的骨牌
// 理论推算：第 n 块高 5 mm × 1.5^(n−1)：第 10 块 ≈ 19 cm，第 20 块 ≈ 11 m，第 30 块 ≈ 639 m（上海中心大厦 632 m）
(function (root) {
  const H = i => 5 * Math.pow(1.5, i);            // 第 i+1 块的高度（毫米）
  const X = [0];                                  // 每块左边缘位置（毫米），间距 = 0.55 × 高度
  for (let i = 1; i < 32; i++) X.push(X[i - 1] + H(i - 1) * 0.2 + H(i - 1) * 0.55);
  const COLORS = ['#E63B2E', '#1F4E9C', '#F2B701', '#1B1B1B'];

  const EP = {
    id: 'B3',
    title: '一块骨牌推倒一座大楼',
    theme: 'bauhaus',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 104, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'] },
    cover: 'n30',
    beats: [
      { id: 'hook', min: 3.2, cap: ['一块 5 毫米的骨牌，', '能推倒{多大}的骨牌？'], voice: '一块五毫米的骨牌，能推倒多大的骨牌？', mood: 0.3 },
      { id: 'rule', min: 4.4, cap: ['物理实验发现：每一块骨牌，', '能推倒比它大 {1.5 倍} 的下一块。'], voice: '物理实验发现，每一块骨牌，能推倒比它大一点五倍的下一块。', mood: 0.45, sfx: [{ at: 2.0, type: 'tick' }] },
      { id: 'n10', min: 3.0, cap: ['第 10 块：{19 厘米}，', '跟一支铅笔差不多。'], voice: '第十块，十九厘米，跟一支铅笔差不多。', mood: 0.55, sfx: [{ at: 0.2, type: 'ticks', n: 9, gap: 0.12 }] },
      { id: 'n20', min: 3.0, cap: ['第 20 块：{11 米}，', '差不多四层楼高。'], voice: '第二十块，十一米，差不多四层楼高。', mood: 0.7, sfx: [{ at: 0.2, type: 'ticks', n: 10, gap: 0.1 }] },
      { id: 'n30', min: 3.8, cap: ['第 30 块：{639 米}，', '比上海中心大厦（632 米）还高。'], voice: '第三十块，六百三十九米，比上海中心大厦还高。', mood: 1.0, sfx: [{ at: 0.2, type: 'ticks', n: 10, gap: 0.09 }, { at: 1.3, type: 'boom' }] },
      { id: 'flip', min: 3.4, cap: ['第一块很小，', '但{必须有人推}。'], voice: '第一块很小，但必须有人推。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '今天，推倒你的第一块。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第块毫米厘米米铅笔四层楼上海中心大厦理论推算每块是前一块的倍示意今天推倒你的一0123456789.×≈',
  };

  function fmt(mm) {
    if (mm < 10) return mm.toFixed(0) + ' 毫米';
    if (mm < 1000) return (mm / 10).toFixed(0) + ' 厘米';
    return (mm / 1000).toFixed(0) + ' 米';
  }

  // 推倒进度：w = 已倒下的块数（连续值）
  function wave(t, TL, E) {
    const b = id => TL.b(id);
    const go = (a, z, s, d) => E.lerp(a, z, E.ease.inOut(E.seg(t, s, s + d)));
    if (t < b('rule').s + 1.6) return 0;
    if (t < b('n10').s) return go(0, 1, b('rule').s + 1.6, 1.0);
    if (t < b('n20').s) return go(1, 9, b('n10').s + 0.1, 1.4);
    if (t < b('n30').s) return go(9, 19, b('n20').s + 0.1, 1.4);
    return go(19, 29, b('n30').s + 0.1, 1.4);
  }

  const GY = 1420, FX = 760;  // 地面、焦点骨牌在屏幕上的位置

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const w = wave(t, TL, E);
    // 镜头：焦点块 f（连续），让它高约 520 像素；倒放期间焦点跟着推倒的位置走
    const f = Math.max(1, w + 0.6);
    const lo = Math.floor(f), fr = f - lo;
    const scale = 520 / (H(lo) * Math.pow(1.5, fr));
    const fxmm = E.lerp(X[lo], X[lo + 1], fr);
    const sx = mm => FX + (mm - fxmm) * scale;
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 参照物
      const refs = [['n10', 175, '铅笔 17.5 厘米'], ['n20', 12000, '四层楼 约 12 米'], ['n30', 632000, '上海中心 632 米']];
      refs.forEach(([id, hmm, label]) => {
        const bb = b(id), until = id === 'n30' ? 1e9 : bb.e;  // 上海中心一直留到结尾
        const a = E.seg(t, bb.s + 1.2, bb.s + 1.6) * (1 - E.seg(t, until, until + 0.3));
        if (a <= 0) return;
        const hp = hmm * scale, x = 230;
        ctx.globalAlpha = sceneA * Math.min(1, a); ctx.strokeStyle = th.fg; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
        if (id === 'n30') { ctx.beginPath(); ctx.moveTo(x - 60, GY); ctx.lineTo(x - 40, GY - hp * 0.9); ctx.lineTo(x - 6, GY - hp); ctx.lineTo(x + 40, GY - hp * 0.9); ctx.lineTo(x + 60, GY); ctx.stroke(); }
        else if (id === 'n20') { ctx.strokeRect(x - 70, GY - hp, 140, hp); for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 70, GY - hp * k / 4); ctx.lineTo(x + 70, GY - hp * k / 4); ctx.stroke(); } }
        else { ctx.strokeRect(x - 12, GY - hp, 24, hp); }
        ctx.setLineDash([]); ctx.fillStyle = th.fg; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(label, x, GY + 52);
      });
      ctx.globalAlpha = sceneA;
      // 地面
      ctx.fillStyle = th.fg; ctx.fillRect(60, GY, 960, 6);
      // 骨牌
      for (let i = 0; i < 31; i++) {
        const h = H(i) * scale, d = H(i) * 0.2 * scale;
        if (h < 1.5) continue;
        const x0 = sx(X[i]); if (x0 > 1300 || x0 + d < -400) continue;
        const gap = (X[i + 1] - X[i] - H(i) * 0.2) * scale;
        const maxA = Math.asin(Math.min(0.95, (gap + d * 0.2) / h));
        const ang = E.clamp(w - i) * maxA;
        ctx.save(); ctx.translate(x0 + d, GY); ctx.rotate(ang);
        ctx.fillStyle = COLORS[i % 4]; ctx.fillRect(-d, -h, d, h);
        ctx.restore();
      }
      // 1.5 倍标注
      const rA = E.seg(t, b('rule').s + 0.4, b('rule').s + 0.9) * (1 - E.seg(t, b('n10').s, b('n10').s + 0.3));
      if (rA > 0) {
        ctx.globalAlpha = sceneA * rA; ctx.fillStyle = th.red; ctx.font = `900 44px ${th.num}`; ctx.textAlign = 'center';
        const xa = sx(X[1]) + H(1) * 0.1 * scale, xb = sx(X[2]) + H(2) * 0.1 * scale;
        ctx.fillText('× 1.5', xa, GY - H(1) * scale - 30); ctx.fillText('× 1.5', xb, GY - H(2) * scale - 30);
      }
      // 读数
      const n = Math.min(30, Math.max(1, Math.round(w + 1)));
      E.hud(ctx, th, 120, 560, 'DOMINO 骨牌', '第 ' + n + ' 块', { alpha: sceneA, color: th.fg, size: 52 });
      E.hud(ctx, th, 960, 560, 'HEIGHT 高度', fmt(H(n - 1)), { alpha: sceneA, color: th.red, size: 52, align: 'right' });
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('理论推算：每块是前一块的 1.5 倍（Whitehead，1983）；骨牌比例为示意', 540, 1660);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '今天，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '推倒{你的第一块}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
