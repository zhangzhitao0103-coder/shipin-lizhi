// C2《成绩不涨，不代表你没进步》坚持类 · 冷蓝电影风
// 物理锚点（每克，1 个标准大气压）：冰比热容约 2.1 J/(g·℃)，-10→0℃ 需 21 J；熔化热 334 J/g（约 16 倍），期间温度保持 0℃；水比热容 4.18 J/(g·℃)
(function (root) {
  const C_ICE = 2.1, LF = 334, C_W = 4.18;
  const E1 = 10 * C_ICE, E2 = E1 + LF, EMAX = E2 + 10 * C_W;
  const tempOf = e => (e <= E1 ? -10 + e / C_ICE : e <= E2 ? 0 : (e - E2) / C_W);

  const EP = {
    id: 'C2',
    title: '成绩不涨不代表你没进步',
    theme: 'ice',
    voice: { sid: 90 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'F#', 'Bm', 'G', 'D', 'A'] },
    cover: 'number',
    beats: [
      { id: 'hook', min: 3.0, cap: ['一块 -10℃ 的冰，', '放在火上加热。'], voice: '一块零下十度的冰，放在火上加热。', mood: 0.3 },
      { id: 'heat', min: 3.4, cap: ['-10℃，-5℃，0℃……', '温度，涨得很快。'], voice: '零下十度，零下五度，零度，温度涨得很快。', mood: 0.45 },
      { id: 'stuck', min: 3.0, cap: ['到了 {0℃}，', '温度计突然{不动了}。'], voice: '到了零度，温度计突然不动了。', mood: 0.3, sfx: [{ at: 0.3, type: 'tick' }] },
      { id: 'keep', min: 3.8, cap: ['火一直在烧，热量一直在进，', '温度却一直是 0℃。'], voice: '火一直在烧，热量一直在进，温度却一直是零度。', mood: 0.4 },
      { id: 'where', min: 2.0, cap: ['热量去哪了？'], voice: '热量去哪了？', mood: 0.3 },
      { id: 'answer', min: 3.0, cap: ['全部用来，', '把冰变成{水}。'], voice: '全部用来，把冰变成水。', mood: 0.6, sfx: [{ at: 0.2, type: 'whoosh' }] },
      { id: 'number', min: 3.8, cap: ['这一步需要 {334} 焦耳，', '是前面升温的 {16} 倍。'], voice: '这一步需要三百三十四焦耳，是前面升温的十六倍。', mood: 0.9, sfx: [{ at: 0.1, type: 'boom' }, { at: 1.4, type: 'ticks', n: 6, gap: 0.12 }] },
      { id: 'flip', min: 3.6, cap: ['你的成绩停在原地的时候，', '也许正是在{融化}。'], voice: '你的成绩停在原地的时候，也许正是在融化。', mood: 0.5 },
      { id: 'quote', min: 4.0, cap: ['平台期不是停滞，', '平台之后，温度会{再次上升}。'], voice: '平台期不是停滞。平台之后，温度会再次上升。', mood: 0.85, sfx: [{ at: 0.6, type: 'riser', dur: 1.6 }] },
      { id: 'action', min: 3.0, cap: null, voice: '再烧一会儿，冰就化了。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '吸收的热量温度平台期冰水每1克个标准大气压比热容约熔化热JgC℃()/·；，0123456789.-−+×倍再烧一会儿就化了',
  };

  function energyAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('heat').s) return 0;
    if (t < b('stuck').s) return E1 * E.ease.inOutSine(E.seg(t, b('heat').s + 0.2, b('heat').e - 0.1));
    if (t < b('quote').s) {
      const s = b('stuck').s, e = b('answer').e;
      return E1 + LF * E.ease.inOutSine(E.seg(t, s, e));
    }
    return E2 + 10 * C_W * E.ease.inOut(E.seg(t, b('quote').s + 1.4, b('quote').e));
  }

  const CX0 = 170, CX1 = 930, CY0 = 960, CY1 = 1420;
  const X = e => CX0 + (e / (EMAX * 1.04)) * (CX1 - CX0);
  const Y = T => CY1 - ((T + 12) / 24) * (CY1 - CY0);

  function iceCube(ctx, th, t, melt, a) {
    const cx = 540, cy = 700, s = 200 * Math.pow(1 - melt, 0.6);
    ctx.save(); ctx.globalAlpha = a;
    // 水洼
    const pw = 60 + 220 * melt;
    const g = ctx.createRadialGradient(cx, cy + 92, 4, cx, cy + 92, pw);
    g.addColorStop(0, 'rgba(127,216,255,0.45)'); g.addColorStop(1, 'rgba(127,216,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 92, pw, 18 + 10 * melt, 0, 0, Math.PI * 2); ctx.fill();
    if (s > 4) {
      const y = cy + 90 - s;
      ctx.translate(cx, y + s / 2);
      const top = [[-s / 2, -s / 2], [0, -s / 2 - s * 0.22], [s / 2, -s / 2], [0, -s / 2 + s * 0.22]];
      ctx.fillStyle = 'rgba(180,230,255,0.22)'; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 2.5; ctx.shadowColor = th.gold; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(-s / 2, -s / 2); ctx.lineTo(0, -s / 2 + s * 0.22); ctx.lineTo(s / 2, -s / 2); ctx.lineTo(s / 2, s / 2 - s * 0.1); ctx.lineTo(0, s / 2 + s * 0.12); ctx.lineTo(-s / 2, s / 2 - s * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); top.forEach(([x, y2], i) => (i ? ctx.lineTo(x, y2) : ctx.moveTo(x, y2))); ctx.closePath(); ctx.fillStyle = 'rgba(214,243,255,0.35)'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s / 2 + s * 0.22); ctx.lineTo(0, s / 2 + s * 0.12); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-s * 0.32, -s * 0.1); ctx.lineTo(-s * 0.18, s * 0.12); ctx.moveTo(s * 0.2, -s * 0.05); ctx.lineTo(s * 0.3, s * 0.18); ctx.stroke();
    }
    ctx.restore();
    // 火焰
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const x = cx - 120 + i * 30, y0 = cy + 150, h = 22 + 7 * Math.sin(t * 11 + i * 2.1) + 4 * Math.sin(t * 17 + i);
      const gg = ctx.createLinearGradient(0, y0, 0, y0 - h); gg.addColorStop(0, 'rgba(110,160,255,0.6)'); gg.addColorStop(0.4, 'rgba(255,190,100,0.5)'); gg.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(x - 6, y0); ctx.quadraticCurveTo(x - 7, y0 - h * 0.5, x, y0 - h); ctx.quadraticCurveTo(x + 7, y0 - h * 0.5, x + 6, y0); ctx.fill();
    }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const e = energyAt(t, TL, E), T = tempOf(e), melt = E.clamp((e - E1) / LF);
    const sceneA = E.seg(t, 0.1, 0.9) * (1 - 0.8 * E.seg(t, b('action').s - 0.1, b('action').s + 0.5));
    iceCube(ctx, th, t, melt, sceneA);

    // 加热曲线
    ctx.save(); ctx.globalAlpha = sceneA;
    ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'right';
    [-10, 0, 10].forEach(v => { ctx.beginPath(); ctx.moveTo(CX0, Y(v)); ctx.lineTo(CX1, Y(v)); ctx.stroke(); ctx.fillText((v > 0 ? '+' : '') + v + '℃', CX0 - 12, Y(v) + 8); });
    ctx.strokeStyle = th.dim; ctx.beginPath(); ctx.moveTo(CX0, CY0 - 10); ctx.lineTo(CX0, CY1); ctx.lineTo(CX1, CY1); ctx.stroke();
    ctx.textAlign = 'right'; ctx.font = `500 24px "Noto Sans SC"`; ctx.fillText('吸收的热量 →', CX1, CY1 + 44);
    ctx.textAlign = 'left'; ctx.fillText('温度', CX0 - 60, CY0 - 30);
    // 平台期色带
    const pb = E.seg(t, b('stuck').s + 0.6, b('stuck').s + 1.4);
    if (pb > 0) {
      ctx.globalAlpha = sceneA * pb * 0.9;
      const g = ctx.createLinearGradient(0, Y(0) - 40, 0, Y(0) + 40); g.addColorStop(0, 'rgba(127,216,255,0)'); g.addColorStop(0.5, 'rgba(127,216,255,0.16)'); g.addColorStop(1, 'rgba(127,216,255,0)');
      ctx.fillStyle = g; ctx.fillRect(X(E1), Y(0) - 40, X(E2) - X(E1), 80);
      ctx.fillStyle = th.goldHi; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText(t > b('flip').s + 0.6 ? '你的平台期' : '平台期', (X(E1) + X(E2)) / 2, Y(0) - 56);
      ctx.globalAlpha = sceneA;
    }
    // 曲线
    ctx.beginPath(); const n = 160;
    for (let i = 0; i <= n; i++) { const ee = (e * i) / n; const x = X(ee), y = Y(tempOf(ee)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.stroke();
    ctx.fillStyle = th.goldHi; ctx.beginPath(); ctx.arc(X(e), Y(T), 11, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    // 334 J 与 21 J 的对比
    const nb = b('number');
    const na = E.seg(t, nb.s + 0.2, nb.s + 0.7) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.5));
    if (na > 0) {
      ctx.globalAlpha = sceneA * na; ctx.strokeStyle = th.fg; ctx.lineWidth = 2;
      const yb = Y(0) + 70;
      const br = (x0, x1, label) => { ctx.beginPath(); ctx.moveTo(x0, yb - 10); ctx.lineTo(x0, yb); ctx.lineTo(x1, yb); ctx.lineTo(x1, yb - 10); ctx.stroke(); ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText(label, (x0 + x1) / 2, yb + 40); };
      br(X(0), X(E1), '21 J'); br(X(E1), X(E2), '334 J');
      for (let i = 0; i < 16; i++) {
        const p = E.seg(t, nb.s + 1.4 + i * 0.07, nb.s + 1.55 + i * 0.07); if (p <= 0) continue;
        ctx.globalAlpha = sceneA * na * p * 0.55; ctx.fillStyle = th.gold;
        const w = X(E1) - X(0); ctx.fillRect(X(E1) + i * w + 2, yb + 62, w - 4, 16);
      }
      ctx.globalAlpha = sceneA * na * E.seg(t, nb.s + 2.6, nb.s + 3.0); ctx.fillStyle = th.goldHi; ctx.font = `700 40px ${th.mono}`; ctx.textAlign = 'left';
      ctx.fillText('×16', X(E2) + 14, yb + 82);
    }
    ctx.restore();

    // 读数
    const ha = sceneA * E.seg(t, 0.5, 1.2);
    const frozen = t > b('stuck').s && t < b('quote').s + 1.4;
    E.hud(ctx, th, 170, 1530, '温度 TEMP', (T < 0 ? '−' : '') + Math.abs(T).toFixed(1) + '℃', { alpha: ha, color: frozen ? th.goldHi : th.gold, glow: frozen && Math.sin(t * 6) > 0 });
    E.hud(ctx, th, 930, 1530, '热量 HEAT', Math.round(e) + ' J', { alpha: ha, align: 'right' });
    ctx.save(); ctx.globalAlpha = ha * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('每 1 克冰、1 个标准大气压；冰比热容约 2.1 J/(g·℃)，熔化热约 334 J/g', 540, 1690); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '再烧一会儿，', 540, 900, { theme: th, size: 84, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{冰就化了}。', 540, 1040, { theme: th, size: 110, tt: t - ac.s - 0.7, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
