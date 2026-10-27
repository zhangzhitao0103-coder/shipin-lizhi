// K5《帮对，比帮多更重要》家长专属类 · 暖色温情风
// 物理锚点：力的合成（平行四边形定则）。两个 10 的力：同向合力 20；夹角 90° 合力 √200 ≈ 14.1，方向偏 45°；反向合力 0
(function (root) {
  const OX = 540, OY = 1380, U = 28, F = 10;

  const EP = {
    id: 'K5',
    title: '帮对比帮多更重要',
    theme: 'warm',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Gm', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'side',
    beats: [
      { id: 'hook', min: 3.4, cap: ['你在帮孩子使劲，', '孩子为什么{越走越慢}？'], voice: '你在帮孩子使劲，孩子为什么越走越慢？', mood: 0.3 },
      { id: 'same', min: 4.0, cap: ['力是有方向的：', '方向一致，{10 + 10 = 20}。'], voice: '力是有方向的。方向一致，十加十，等于二十。', mood: 0.6, sfx: [{ at: 2.4, type: 'ding' }] },
      { id: 'side', min: 4.4, cap: ['方向偏了 90°：', '合力只剩 [14]，还被[带偏了方向]。'], voice: '方向偏了九十度，合力只剩十四，还被带偏了方向。', mood: 0.5 },
      { id: 'opp', min: 3.8, cap: ['方向相反：', '10 − 10 = [0]，原地不动。'], voice: '方向相反，十减十，等于零，原地不动。', mood: 0.35, sfx: [{ at: 2.0, type: 'boom' }] },
      { id: 'flip', min: 4.4, cap: ['帮孩子，先问{孩子想往哪走}，', '再顺着这个方向使劲。'], voice: '帮孩子，先问孩子想往哪走，再顺着这个方向使劲。', mood: 0.75, sfx: [{ at: 2.6, type: 'ding' }] },
      { id: 'action', min: 3.0, cap: null, voice: '帮对，比帮多更重要。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '孩子家长合力目标方向力的合成平行四边形定则约示意帮对比帮多更重要°√=+−0123456789.',
  };

  function arrow(ctx, x0, y0, x1, y1, col, w, label, la) {
    const len = Math.hypot(x1 - x0, y1 - y0); if (len < 4) return;
    const a = Math.atan2(y1 - y0, x1 - x0), hs = Math.min(30, len * 0.4);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hs * 0.6, y1 - Math.sin(a) * hs * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hs * Math.cos(a - 0.4), y1 - hs * Math.sin(a - 0.4)); ctx.lineTo(x1 - hs * Math.cos(a + 0.4), y1 - hs * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    if (label) { ctx.font = `700 34px "LXGW WenKai"`; ctx.textAlign = 'center'; ctx.fillText(label, x1 + Math.cos(la) * 56, y1 + Math.sin(la) * 56 + 12); }
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sm = b('same'), sd = b('side'), op = b('opp'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    // 家长的力与孩子方向的夹角（度）
    let deg = 0;
    if (t > sd.s) deg = 90 * E.ease.inOut(E.seg(t, sd.s + 0.2, sd.s + 1.2));
    if (t > op.s) deg = E.lerp(90, 180, E.ease.inOut(E.seg(t, op.s + 0.2, op.s + 1.2)));
    if (t > fl.s) deg = E.lerp(180, 0, E.ease.inOut(E.seg(t, fl.s + 1.4, fl.s + 2.6)));
    const parentA = t > sm.s + 0.3 ? E.seg(t, sm.s + 0.3, sm.s + 0.8) : 0;
    const th0 = -Math.PI / 2, tp = th0 + (deg * Math.PI) / 180;
    const cx = Math.cos(th0) * F, cy = Math.sin(th0) * F, px = Math.cos(tp) * F * parentA, py = Math.sin(tp) * F * parentA;
    const rx = cx + px, ry = cy + py, R = Math.hypot(rx, ry);
    ctx.save(); ctx.globalAlpha = sceneA;
    // 目标
    ctx.fillStyle = th.gold; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('目标 ↑', OX, 640);
    ctx.setLineDash([6, 12]); ctx.strokeStyle = th.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(OX, 670); ctx.lineTo(OX, OY); ctx.stroke(); ctx.setLineDash([]);
    // 平行四边形
    if (parentA > 0 && deg > 5 && deg < 175) {
      ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,244,232,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(OX + cx * U, OY + cy * U); ctx.lineTo(OX + rx * U, OY + ry * U); ctx.lineTo(OX + px * U, OY + py * U); ctx.stroke(); ctx.setLineDash([]);
    }
    // 合力
    if (parentA > 0.5) arrow(ctx, OX, OY, OX + rx * U, OY + ry * U, th.goldHi, 14, '合力', Math.atan2(ry, rx) - 0.5);
    // 孩子、家长
    arrow(ctx, OX, OY, OX + cx * U, OY + cy * U, th.gold, 9, parentA > 0.5 && deg < 5 ? '' : '孩子', Math.PI);
    if (parentA > 0) { ctx.globalAlpha = sceneA * parentA; arrow(ctx, OX, OY, OX + px * U, OY + py * U, th.red, 9, deg < 5 ? '' : '家长', tp + 0.3); ctx.globalAlpha = sceneA; }
    if (parentA > 0.5 && deg < 5) { ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('孩子 + 家长', OX + 40, OY + cy * U * 0.5); }
    // 人
    ctx.fillStyle = th.fg; ctx.beginPath(); ctx.arc(OX, OY + 50, 22, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(OX - 20, OY + 76, 40, 60);
    // 读数
    const dev = Math.abs((Math.atan2(rx, -ry) * 180) / Math.PI);
    E.hud(ctx, th, 120, 560, '合力', R < 0.3 ? '0' : R.toFixed(R % 1 > 0.05 && R % 1 < 0.95 ? 1 : 0), { alpha: sceneA, color: R > 19 ? th.goldHi : R < 1 ? th.red : th.gold, size: 64, glow: R > 19 });
    E.hud(ctx, th, 960, 560, '夹角', Math.round(deg) + '°', { alpha: sceneA * (parentA > 0 ? 1 : 0), color: th.fg, size: 64, align: 'right' });
    if (R > 0.5 && dev > 2) { ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('偏离目标 ' + Math.round(dev) + '°', OX + 260, 1500); }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('力的合成（平行四边形定则）：两个 10 的力，夹角 0° 合力 20，90° 约 14.1，180° 为 0', 540, 1640);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '帮对，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{比帮多更重要}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4, glow: 1.0 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
