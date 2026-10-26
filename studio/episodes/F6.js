// F6《新学期目标，拆小了才能完成》方法类 · 手账笔记风
// 依据：Bandura & Schunk（1981，《人格与社会心理学杂志》）：数学（减法）基础薄弱的儿童自学 7 次课、共 42 页材料；
// 设定"每次 6 页"近期小目标的一组进步最快、自我效能和兴趣最高。进度曲线为示意
(function (root) {
  const EP = {
    id: 'F6',
    title: '新学期目标拆小了才能完成',
    theme: 'notebook',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 90, chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'Em', 'C', 'D'] },
    cover: 'result',
    beats: [
      { id: 'hook', min: 3.0, cap: ['新学期立了个大目标？', '先看一个{实验}。'], voice: '新学期立了个大目标？先看一个实验。', mood: 0.3 },
      { id: 'study', min: 4.2, cap: ['心理学家班杜拉和申克，', '让一群孩子自学 42 页数学练习。'], voice: '心理学家班杜拉和申克，让一群孩子，自学四十二页数学练习。', mood: 0.4 },
      { id: 'a', min: 3.0, cap: ['一组的目标是：', '7 次课，做完 42 页。'], voice: '一组的目标是，七次课，做完四十二页。', mood: 0.45 },
      { id: 'bb', min: 3.0, cap: ['另一组的目标是：', '{每次只做 6 页}。'], voice: '另一组的目标是，每次只做六页。', mood: 0.5, sfx: [{ at: 0.5, type: 'ticks', n: 7, gap: 0.2 }] },
      { id: 'result', min: 3.8, cap: ['结果，每次 6 页的那组：', '进步更快，{也更有信心}。'], voice: '结果，每次六页的那组，进步更快，也更有信心。', mood: 0.8, sfx: [{ at: 0.3, type: 'ding' }] },
      { id: 'flip', min: 3.0, cap: ['目标太远，', '每天都像在[原地踏步]。'], voice: '目标太远，每天都像在原地踏步。', mood: 0.5 },
      { id: 'tip', min: 3.8, cap: ['把学期目标，拆成', '{每周、每天能完成的小步}。'], voice: '把学期目标，拆成每周、每天能完成的小步。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '大目标定方向，小目标给动力。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '页第次课一二三四五六七目标大小定方向给动力班杜拉申克年人格与社会心理学杂志进度曲线为示意✓',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ink = th.gold, red = th.red;
    // 开场：一叠 42 页练习纸
    const stA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('a').s - 0.1, b('a').s + 0.4));
    if (stA > 0) {
      ctx.save(); ctx.globalAlpha = stA;
      for (let i = 0; i < 14; i++) {
        const p = E.ease.out(E.seg(t, 0.3 + i * 0.12, 0.6 + i * 0.12)); if (p <= 0) continue;
        ctx.save(); ctx.translate(540 + (i % 2 ? 6 : -6), 1300 - i * 22 - (1 - p) * 60); ctx.rotate((i % 3 - 1) * 0.02);
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.fillRect(-200, -14, 400, 28); ctx.strokeRect(-200, -14, 400, 28); ctx.restore();
      }
      const n = Math.round(42 * E.seg(t, b('study').s + 0.8, b('study').s + 2.4));
      if (n > 0) { ctx.fillStyle = th.red; ctx.font = `700 110px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(n + ' 页', 540, 900); }
      ctx.restore();
    }
    const sceneA = E.seg(t, b('a').s - 0.2, b('a').s + 0.4) * (1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // 左：一座高山，顶上写 42 页
      const aA = E.seg(t, b('a').s + 0.2, b('a').s + 0.8);
      if (aA > 0) {
        ctx.globalAlpha = sceneA * aA; ctx.strokeStyle = th.fg; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(120, 1400); ctx.lineTo(300, 820); ctx.lineTo(480, 1400); ctx.stroke();
        ctx.fillStyle = red; ctx.font = `700 44px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('42 页', 300, 790);
        ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.fillText('一个大目标', 300, 1460);
      }
      // 右：7 级台阶，每级 6 页
      const bA = E.seg(t, b('bb').s + 0.2, b('bb').s + 0.8);
      if (bA > 0) {
        ctx.globalAlpha = sceneA * bA; ctx.strokeStyle = ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(580, 1400);
        for (let i = 0; i < 7; i++) { const x = 580 + i * 56, y = 1400 - i * 80; ctx.lineTo(x, y - 80); ctx.lineTo(x + 56, y - 80); }
        ctx.stroke();
        for (let i = 0; i < 7; i++) {
          const ck = E.seg(t, b('bb').s + 0.5 + i * 0.2, b('bb').s + 0.7 + i * 0.2);
          const x = 580 + i * 56 + 28, y = 1400 - (i + 1) * 80 - 18;
          ctx.globalAlpha = sceneA * bA; ctx.fillStyle = th.fg; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('6页', x, y);
          if (ck > 0) { ctx.globalAlpha = sceneA * ck; ctx.fillStyle = '#2E9E6A'; ctx.font = `700 34px ${th.cap}`; ctx.fillText('✓', x, y - 32); }
        }
        ctx.globalAlpha = sceneA * bA; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.fillText('7 个小目标', 776, 1460);
      }
      // 进度对比（示意）
      const rA = E.seg(t, b('result').s + 0.2, b('result').s + 0.7);
      if (rA > 0) {
        ctx.globalAlpha = sceneA * rA; ctx.fillStyle = 'rgba(247,242,230,0.94)'; ctx.fillRect(110, 600, 860, 180);
        const p = E.ease.inOut(E.seg(t, b('result').s + 0.4, b('result').s + 2.0));
        E.marker(ctx, 300, 630, 600 * p, 44, th.marker, 1);
        ctx.fillStyle = red; ctx.globalAlpha = sceneA * rA * 0.6; ctx.fillRect(300, 708, 380 * p, 44);
        ctx.globalAlpha = sceneA * rA; ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'right';
        ctx.fillText('每次 6 页', 280, 664); ctx.fillText('7 次 42 页', 280, 742);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `500 21px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('Bandura & Schunk，1981，《人格与社会心理学杂志》；进度对比为示意', 540, 1600);
      ctx.restore();
    }
    // 拆分：学期 → 周 → 天
    const tp = b('tip');
    const tA = E.seg(t, tp.s + 0.2, tp.s + 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (tA > 0) {
      ctx.save(); ctx.globalAlpha = tA;
      const rows = [['学期目标', 1, 760], ['每周', 4, 640], ['每天', 7, 520]];
      rows.forEach(([lab, n, w], r) => {
        const ap = E.seg(t, tp.s + 0.3 + r * 0.5, tp.s + 0.7 + r * 0.5); ctx.globalAlpha = tA * ap;
        ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(lab, 140, 860 + r * 170);
        for (let i = 0; i < n; i++) { const cw = w / n - 10; E.marker(ctx, 300 + i * (w / n), 820 + r * 170, cw, 60, r === 0 ? 'rgba(214,59,47,0.35)' : th.marker, 1); }
      });
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '大目标定方向，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{小目标}给动力。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
