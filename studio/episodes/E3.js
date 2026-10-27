// E3《钉子为什么能钉进墙》集中力量类 · 复古报纸风
// 物理锚点：压强 p = F / S（常见的初中物理图钉习题数据）：手对钉帽压力 20 N，钉帽面积 1 cm²，钉尖面积 0.05 mm²
// 钉帽处 2×10⁵ Pa，钉尖处 4×10⁸ Pa，相差 2000 倍（1 cm² = 100 mm² = 2000 × 0.05 mm²）
(function (root) {
  const EP = {
    id: 'E3',
    title: '图钉为什么能扎进墙',
    theme: 'newsprint',
    voice: { sid: 90 },
    capY: 380, capSize: 62,
    music: { style: 'pulse', bpm: 100, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'calc',
    beats: [
      { id: 'hook', min: 3.4, cap: ['同样 20 牛的力，', '手指按墙，墙{纹丝不动}；'], voice: '同样二十牛的力，手指按墙，墙纹丝不动。', mood: 0.3 },
      { id: 'pin', min: 3.0, cap: ['隔着一枚图钉按，', '钉尖就[扎进去了]。'], voice: '隔着一枚图钉按，钉尖就扎进去了。', mood: 0.6, sfx: [{ at: 0.9, type: 'boom' }] },
      { id: 'same', min: 3.8, cap: ['力一样大，区别只在{面积}：', '压强 = 压力 ÷ 面积。'], voice: '力一样大，区别只在面积。压强，等于压力除以面积。', mood: 0.45 },
      { id: 'calc', min: 4.8, cap: ['钉帽 1 平方厘米，钉尖只有 0.05 平方毫米：', '压强差了 {2000 倍}。'], voice: '钉帽一平方厘米，钉尖只有零点零五平方毫米，压强差了两千倍。', mood: 0.8, sfx: [{ at: 1.0, type: 'ticks', n: 20, gap: 0.06 }, { at: 3.2, type: 'ding' }] },
      { id: 'flip', min: 3.4, cap: ['你的力气不小，', '只是[摊得太开]。'], voice: '你的力气不小，只是摊得太开。', mood: 0.6 },
      { id: 'flip2', min: 3.4, cap: ['把力用在{一个点}上，', '才扎得进去。'], voice: '把力用在一个点上，才扎得进去。', mood: 0.85 },
      { id: 'action', min: 3.0, cap: null, voice: '力气，用在一个点上。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '牛力压强压力面积钉帽钉尖平方厘米毫米墙手指图钉倍初中物理课本例题数据用在一个点上=÷×²⁵⁸Pa0123456789.NcmS',
  };

  const WX = 760;  // 墙面 x

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const pn = b('pin'), sm = b('same'), cl = b('calc'), fl = b('flip'), f2 = b('flip2');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const sideA = sceneA * (1 - E.seg(t, cl.s, cl.s + 0.4)) + sceneA * E.seg(t, fl.s, fl.s + 0.4);
    if (sceneA <= 0) return end();
    ctx.save();
    // 场景 1：侧视图 —— 墙、手指、图钉
    if (sideA > 0) {
      ctx.globalAlpha = Math.min(1, sideA);
      ctx.fillStyle = th.fg; ctx.fillRect(WX, 620, 22, 860);
      ctx.strokeStyle = th.dim; ctx.lineWidth = 2; for (let y = 620; y < 1480; y += 30) { ctx.beginPath(); ctx.moveTo(WX + 22, y); ctx.lineTo(WX + 60, y + 30); ctx.stroke(); }
      ctx.fillStyle = th.fg; ctx.font = `900 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('墙', WX + 70, 660);
      const usePin = t > pn.s + 0.2, focus = t > f2.s;
      // 上：手指直接按墙
      const y1 = 820, y2 = 1220;
      const finger = (y, dx, alpha) => { ctx.globalAlpha = Math.min(1, sideA) * alpha; ctx.fillStyle = '#C9A98A'; ctx.beginPath(); ctx.roundRect(WX - 330 + dx, y - 45, 300, 90, 45); ctx.fill(); ctx.fillStyle = '#E8D3BE'; ctx.beginPath(); ctx.roundRect(WX - 90 + dx, y - 35, 52, 70, 22); ctx.fill(); };
      const press = 0.5 + 0.5 * Math.sin(t * 6);
      finger(y1, -4 + 6 * press * (t < pn.s ? 1 : 0.3), t > fl.s ? 0.35 : 1);
      ctx.globalAlpha = Math.min(1, sideA) * (t > fl.s ? 0.35 : 1); ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText('20 N →', WX - 340, y1 + 10);
      // 下：手指隔着图钉按
      if (usePin) {
        const k = E.ease.out(E.seg(t, pn.s + 0.2, pn.s + 0.9)), depth = 40 * k;
        ctx.globalAlpha = Math.min(1, sideA);
        ctx.fillStyle = th.red; ctx.fillRect(WX - 150 + depth, y2 - 70, 24, 140);                 // 钉帽
        ctx.fillStyle = th.fg; ctx.beginPath(); ctx.moveTo(WX - 126 + depth, y2 - 6); ctx.lineTo(WX + depth + 6, y2); ctx.lineTo(WX - 126 + depth, y2 + 6); ctx.fill();  // 钉身 + 尖
        finger(y2, -150 + depth, 1);
        ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText('20 N →', WX - 490 + depth, y2 + 10);
        if (k > 0.9) { ctx.fillStyle = th.red; ctx.font = `900 40px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('扎进去了', WX + 70, y2 + 14); }
      }
      // 公式
      const fA = E.seg(t, sm.s + 0.6, sm.s + 1.1);
      if (fA > 0) { ctx.globalAlpha = Math.min(1, sideA) * fA; ctx.fillStyle = th.fg; ctx.font = `700 76px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('p = F ÷ S', 360, 1020); }
      if (focus) { ctx.globalAlpha = Math.min(1, sideA) * E.seg(t, f2.s + 0.3, f2.s + 0.8); ctx.strokeStyle = th.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(WX + 6, y2, 40, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 场景 2：1 平方厘米 = 2000 个钉尖面积
    const gA = sceneA * E.seg(t, cl.s + 0.2, cl.s + 0.6) * (1 - E.seg(t, fl.s, fl.s + 0.4));
    if (gA > 0) {
      ctx.globalAlpha = gA;
      const COLS = 50, ROWS = 40, cw = 15, ch = 15, gx = 540 - (COLS * cw) / 2, gy = 680;
      const fill = E.seg(t, cl.s + 1.0, cl.s + 2.6);
      ctx.strokeStyle = th.fg; ctx.lineWidth = 4; ctx.strokeRect(gx, gy, COLS * cw, ROWS * ch);
      ctx.fillStyle = 'rgba(26,26,26,0.16)';
      const n = Math.floor(COLS * ROWS * fill);
      for (let i = 0; i < n; i++) ctx.fillRect(gx + (i % COLS) * cw + 1, gy + Math.floor(i / COLS) * ch + 1, cw - 2, ch - 2);
      ctx.fillStyle = th.red; ctx.fillRect(gx + 1, gy + 1, cw - 2, ch - 2);
      ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('↓ 钉尖 0.05 mm²（左上角这 1 格）', gx, gy - 18);
      ctx.fillStyle = th.fg; ctx.textAlign = 'center'; ctx.fillText('钉帽 1 cm² = ' + E.fmt(n < 2 ? 1 : n) + ' 个钉尖', 540, gy + ROWS * ch + 56);
      const rA = E.seg(t, cl.s + 2.8, cl.s + 3.3);
      if (rA > 0) {
        ctx.globalAlpha = gA * rA; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'left';
        ctx.fillStyle = th.dim; ctx.fillText('钉帽  2×10⁵ Pa', gx, gy + ROWS * ch + 130);
        ctx.fillStyle = th.red; ctx.fillText('钉尖  4×10⁸ Pa', gx, gy + ROWS * ch + 185);
        ctx.textAlign = 'right'; ctx.font = `700 80px ${th.num}`; ctx.fillText('× 2000', gx + COLS * cw, gy + ROWS * ch + 180);
      }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('数据取自常见的初中物理图钉习题：压力 20 N，钉帽 1 cm²，钉尖 0.05 mm²', 540, 1690);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '力气，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{用在一个点上}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
