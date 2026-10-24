// G1《1 分，能压倒多少人？》竞争类 · 信息图风
// 模拟：30 万考生，分数 ~ 正态分布（平均 450，标准差 100）。每 1 分人数 = N·φ(z)/σ：450 分附近 ≈ 1197 人，600 分附近 ≈ 389 人；450→460 共约 1.19 万人
(function (root) {
  const N = 300000, MU = 450, SD = 100;
  const perPoint = x => (N / (SD * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - MU) ** 2) / (2 * SD * SD));
  const binCount = x0 => { let s = 0; for (let x = x0; x < x0 + 10; x++) s += perPoint(x + 0.5); return s; };
  const PER_DOT = 250;
  const BINS = []; for (let x = 150; x < 750; x += 10) BINS.push({ x, n: binCount(x) });

  const EP = {
    id: 'G1',
    title: '1分能压倒多少人',
    theme: 'info',
    voice: { sid: 58 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 100, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'mid',
    beats: [
      { id: 'hook', min: 2.8, cap: ['高考 1 分，', '能压倒{多少人}？'], voice: '高考一分，能压倒多少人？', mood: 0.35 },
      { id: 'setup', min: 4.0, cap: ['假设一个省有 30 万考生，', '分数呈{正态分布}。'], voice: '假设一个省有三十万考生，分数呈正态分布。', mood: 0.5, sfx: [{ at: 0.4, type: 'riser', dur: 2.2 }] },
      { id: 'mid', min: 3.4, cap: ['在 450 分附近，', '1 分就是 {1200} 人。'], voice: '在四百五十分附近，一分就是一千二百人。', mood: 0.7, sfx: [{ at: 0.2, type: 'boom' }] },
      { id: 'high', min: 3.2, cap: ['到了 600 分，', '1 分也还有 {390} 人。'], voice: '到了六百分，一分也还有三百九十人。', mood: 0.6, sfx: [{ at: 0.2, type: 'tick' }] },
      { id: 'crowd', min: 2.8, cap: ['越是中间的分数，', '人越{挤}。'], voice: '越是中间的分数，人越挤。', mood: 0.6 },
      { id: 'flip', min: 3.4, cap: ['你差的那 10 分，', '前面可能站着 [上万人]。'], voice: '你差的那十分，前面可能站着上万人。', mood: 0.85, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'quote', min: 3.6, cap: ['每 1 分，', '都是{一整个操场的人}。'], voice: '每一分，都是一整个操场的人。', mood: 0.8 },
      { id: 'action', min: 2.8, cap: null, voice: '别丢掉，任何一分。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '分人数每点代表模拟数据：万考生平均标准差实际请以各省一分一段表为准约≈别丢掉任何0123456789,.',
  };

  const X0 = 140, X1 = 940, BASE = 1360, PITCH_Y = 11.5;
  const colW = (X1 - X0) / BINS.length;
  const BX = x => X0 + ((x - 150) / 600) * (X1 - X0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t, { glow: 'rgba(60,30,30,0.3)', dustCount: 14, dustColor: '255,255,255' });
    const chartA = E.seg(t, b('setup').s - 0.2, b('setup').s + 0.3) * (1 - E.seg(t, b('quote').s - 0.2, b('quote').s + 0.3));

    // 开头大号"1 分"
    const hA = E.seg(t, 0.1, 0.5) * (1 - E.seg(t, b('setup').s - 0.2, b('setup').s + 0.3));
    if (hA > 0) {
      E.bigNumber(ctx, th, '1', 470, 1080, { size: 360, alpha: hA, font: `"Noto Sans SC"`, weight: 900 });
      ctx.save(); ctx.globalAlpha = hA; ctx.fillStyle = th.fg; ctx.font = `900 120px "Noto Sans SC"`; ctx.fillText('分', 600, 1070); ctx.restore();
    }

    if (chartA > 0) {
      ctx.save(); ctx.globalAlpha = chartA;
      const sb = b('setup');
      const hiMid = E.seg(t, b('mid').s + 0.2, b('mid').s + 0.6) * (1 - E.seg(t, b('high').s, b('high').s + 0.3));
      const hiHigh = E.seg(t, b('high').s + 0.2, b('high').s + 0.6) * (1 - E.seg(t, b('crowd').s, b('crowd').s + 0.3));
      const hiFlip = E.seg(t, b('flip').s + 0.2, b('flip').s + 0.6);
      BINS.forEach((bin, i) => {
        const dots = Math.round(bin.n / PER_DOT);
        const fall = E.seg(t, sb.s + 0.4 + Math.abs(i - 30) * 0.03, sb.s + 1.4 + Math.abs(i - 30) * 0.03);
        const shown = Math.round(dots * E.ease.out(fall));
        const isMid = bin.x === 450, isHigh = bin.x === 600;
        const red = (isMid && (hiMid > 0 || hiFlip > 0)) || (isHigh && hiHigh > 0);
        for (let k = 0; k < shown; k++) {
          ctx.fillStyle = red ? th.red : (Math.abs(bin.x + 5 - MU) < 60 && t > b('crowd').s + 0.3 && t < b('flip').s ? th.gold : '#5E5E5E');
          ctx.beginPath(); ctx.arc(X0 + i * colW + colW / 2, BASE - 6 - k * PITCH_Y, 4.6, 0, Math.PI * 2); ctx.fill();
        }
      });
      // 坐标
      ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, BASE + 4); ctx.lineTo(X1, BASE + 4); ctx.stroke();
      ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.mono}`; ctx.textAlign = 'center';
      [150, 300, 450, 600, 750].forEach(v => ctx.fillText(String(v), BX(v), BASE + 40));
      ctx.font = `500 22px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('每个点 = ' + PER_DOT + ' 人', X0, 760);
      ctx.textAlign = 'right'; ctx.fillText('分数 →', X1, BASE + 80);
      // 标注
      const label = (x, n, a, txt) => {
        if (a <= 0) return;
        const top = BASE - (n / PER_DOT) * PITCH_Y - 40;
        ctx.globalAlpha = chartA * a; ctx.strokeStyle = th.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top - 60); ctx.stroke();
        ctx.fillStyle = th.red; ctx.font = `900 54px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText(txt, Math.min(Math.max(x, 240), 840), top - 76);
        ctx.globalAlpha = chartA;
      };
      label(BX(455), binCount(450), hiMid, '每 1 分 ≈ ' + Math.round(perPoint(450) / 10) * 10 + ' 人');
      label(BX(605), binCount(600), hiHigh, '每 1 分 ≈ ' + Math.round(perPoint(600) / 10) * 10 + ' 人');
      if (hiFlip > 0) {
        let s = 0; for (let x = 450; x < 460; x++) s += perPoint(x + 0.5);
        label(BX(455), binCount(450), hiFlip, '10 分 ≈ ' + (s / 10000).toFixed(1) + ' 万人');
      }
      ctx.globalAlpha = chartA * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('模拟数据：30 万考生，平均 450 分，标准差 100；实际请以各省一分一段表为准', 540, 1690);
      ctx.restore();
    }

    // 操场：1200 人
    const q = b('quote');
    const qa = E.seg(t, q.s + 0.1, q.s + 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.4) * 0.8);
    if (qa > 0) {
      ctx.save(); ctx.globalAlpha = qa;
      ctx.strokeStyle = 'rgba(229,72,77,0.55)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(150, 720, 780, 760, 300); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(190, 760, 700, 680, 260); ctx.stroke();
      const cols = 40, rows = 30, n = Math.round(perPoint(450));
      for (let i = 0; i < Math.min(n, cols * rows); i++) {
        const p = E.seg(t, q.s + 0.3 + (i / n) * 1.6, q.s + 0.45 + (i / n) * 1.6); if (p <= 0) continue;
        ctx.fillStyle = th.fg; ctx.globalAlpha = qa * p * 0.85;
        ctx.beginPath(); ctx.arc(306 + (i % cols) * 12, 920 + Math.floor(i / cols) * 12.5, 3.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = qa * E.seg(t, q.s + 1.8, q.s + 2.3); ctx.fillStyle = th.red; ctx.font = `900 64px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('≈ 1200 人', 540, 1560);
      ctx.restore();
    }

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别丢掉，', 540, 880, { theme: th, size: 90, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '任何{1 分}。', 540, 1030, { theme: th, size: 120, tt: t - ac.s - 0.5, weight: 900, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
