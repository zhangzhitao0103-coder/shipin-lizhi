// L1《期末前，压力不是越小越好》心态类 · 流光渐变风
// 依据：耶克斯-多德森定律（Yerkes & Dodson, 1908）——唤醒水平与表现呈倒 U 形关系；曲线为示意
(function (root) {
  const perf = x => Math.exp(-((x - 0.5) ** 2) / (2 * 0.17 * 0.17));

  const EP = {
    id: 'L1',
    title: '期末前压力不是越小越好',
    theme: 'glass',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['F', 'Am', 'Bb', 'C', 'F', 'Am', 'Bb', 'C', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'mid',
    beats: [
      { id: 'hook', min: 3.0, cap: ['期末前很紧张？', '先别急着{让自己放松}。'], voice: '期末前很紧张？先别急着让自己放松。', mood: 0.3 },
      { id: 'who', min: 4.2, cap: ['心理学家耶克斯和多德森发现：', '压力和表现，是一条{倒 U 形}曲线。'], voice: '心理学家耶克斯和多德森发现，压力和表现，是一条先升后降的曲线。', mood: 0.45 },
      { id: 'low', min: 2.8, cap: ['压力太小：', '{提不起劲}，容易马虎。'], voice: '压力太小，提不起劲，容易马虎。', mood: 0.35 },
      { id: 'high', min: 2.8, cap: ['压力太大：', '[脑子一片空白]。'], voice: '压力太大，脑子一片空白。', mood: 0.6, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'mid', min: 3.0, cap: ['刚刚好的紧张，', '表现{最好}。'], voice: '刚刚好的紧张，表现最好。', mood: 0.8, sfx: [{ at: 0.6, type: 'ding' }] },
      { id: 'flip', min: 3.8, cap: ['所以考前有点紧张，', '说明你在乎，也说明{状态正在来}。'], voice: '所以考前有点紧张，说明你在乎，也说明状态正在来。', mood: 0.6 },
      { id: 'tip', min: 4.4, cap: ['太紧张的时候：慢慢吸气、慢慢呼气，', '把注意力放回{下一道题}。'], voice: '太紧张的时候，慢慢吸气，慢慢呼气，把注意力放回下一道题。', mood: 0.4 },
      { id: 'action', min: 2.8, cap: null, voice: '把紧张，变成专注。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '表现压力紧张程度低高提不起劲脑子空白最佳状态吸气呼气耶克斯多德森定律年曲线为示意把变成专注倒U形',
  };

  const X0 = 170, X1 = 910, Y0 = 860, Y1 = 1380;
  const PX = x => X0 + x * (X1 - X0), PY = v => Y1 - v * (Y1 - Y0) * 0.9;

  function ballX(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('low').s) return 0.5;
    if (t < b('high').s) return E.lerp(0.5, 0.12, E.ease.inOut(E.seg(t, b('low').s, b('low').s + 0.8)));
    if (t < b('mid').s) return E.lerp(0.12, 0.88, E.ease.inOut(E.seg(t, b('high').s, b('high').s + 0.9)));
    return E.lerp(0.88, 0.5, E.ease.inOut(E.seg(t, b('mid').s, b('mid').s + 0.9)));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const cardA = E.seg(t, b('who').s - 0.2, b('who').s + 0.4) * (1 - E.seg(t, b('tip').s - 0.2, b('tip').s + 0.3));
    if (cardA > 0) {
      E.glassCard(ctx, 110, 760, 860, 760, cardA);
      ctx.save(); ctx.globalAlpha = cardA;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X0, Y0 - 30); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `500 26px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('表现', X0 + 12, Y0 - 20);
      ctx.textAlign = 'center'; ctx.fillText('低', PX(0.05), Y1 + 44); ctx.fillText('压力 · 紧张程度', PX(0.5), Y1 + 44); ctx.fillText('高', PX(0.95), Y1 + 44);
      const dEnd = E.ease.inOut(E.seg(t, b('who').s + 0.6, b('who').s + 2.4));
      ctx.beginPath(); for (let i = 0; i <= 100 * dEnd; i++) { const x = i / 100; i ? ctx.lineTo(PX(x), PY(perf(x))) : ctx.moveTo(PX(x), PY(perf(x))); }
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
      // 区间标签
      const zone = (x, txt, col, s) => { const a = E.seg(t, s, s + 0.4); if (a <= 0) return; ctx.globalAlpha = cardA * a; ctx.fillStyle = col; ctx.font = `700 34px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText(txt, PX(x), PY(perf(x)) - 40); ctx.globalAlpha = cardA; };
      zone(0.14, '提不起劲', th.dim, b('low').s + 0.6); zone(0.86, '脑子空白', th.red, b('high').s + 0.8); zone(0.5, '最佳状态', th.gold, b('mid').s + 0.8);
      // 小球
      if (t > b('low').s - 0.3) {
        const bx = ballX(t, TL, E), col = bx < 0.3 ? '#C9C2EE' : bx > 0.7 ? th.red : th.gold;
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(PX(bx), PY(perf(bx)), 18, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = cardA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('耶克斯-多德森定律（1908）；曲线为示意', 540, 1480);
      ctx.restore();
    }
    // 呼吸圈：吸气 4 秒、呼气 4 秒
    const tp = b('tip');
    const bA = E.seg(t, tp.s + 0.2, tp.s + 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (bA > 0) {
      const ph = ((t - tp.s) % 8) / 8, k = ph < 0.5 ? E.ease.inOutSine(ph * 2) : 1 - E.ease.inOutSine((ph - 0.5) * 2);
      const r = 140 + 120 * k;
      ctx.save(); ctx.globalAlpha = bA;
      const g = ctx.createRadialGradient(540, 1080, 10, 540, 1080, r); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(540, 1080, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = th.fg; ctx.font = `700 52px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText(ph < 0.5 ? '吸气' : '呼气', 540, 1098);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '把紧张，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '变成{专注}。', 540, 1030, { theme: th, size: 116, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
