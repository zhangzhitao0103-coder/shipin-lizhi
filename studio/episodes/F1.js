// F1《你背过的东西，一天后只剩 34%》方法类 · 手账笔记风
// 数据：艾宾浩斯 1885 年记忆实验（节省率）：20 分钟 58.2%、1 小时 44.2%、9 小时 35.8%、1 天 33.7%、2 天 27.8%、6 天 25.4%、31 天 21.1%；复习曲线为示意
(function (root) {
  const PTS = [['刚学完', 100], ['20分钟', 58.2], ['1小时', 44.2], ['9小时', 35.8], ['1天', 33.7], ['2天', 27.8], ['6天', 25.4], ['31天', 21.1]];

  const EP = {
    id: 'F1',
    title: '遗忘曲线',
    theme: 'notebook',
    voice: { sid: 50 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 88, chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C'] },
    cover: 'day',
    beats: [
      { id: 'hook', min: 3.2, cap: ['今天背的 100 个单词，', '明天还剩{几个}？'], voice: '今天背的一百个单词，明天还剩几个？', mood: 0.35 },
      { id: 'who', min: 3.8, cap: ['1885 年，心理学家艾宾浩斯', '用自己做了一个实验。'], voice: '一八八五年，心理学家艾宾浩斯，用自己做了一个实验。', mood: 0.4 },
      { id: 'curve', min: 4.0, cap: ['20 分钟后，剩 {58%}；', '1 小时后，剩 {44%}。'], voice: '二十分钟后，剩百分之五十八。一小时后，剩百分之四十四。', mood: 0.5 },
      { id: 'day', min: 4.0, cap: ['1 天后，只剩 [34%]；', '1 个月后，只剩 [21%]。'], voice: '一天后，只剩百分之三十四。一个月后，只剩百分之二十一。', mood: 0.6, sfx: [{ at: 0.4, type: 'tick' }, { at: 2.2, type: 'tick' }] },
      { id: 'flip', min: 3.2, cap: ['不是你记性差，', '是遗忘本来就{这么快}。'], voice: '不是你记性差，是遗忘本来就这么快。', mood: 0.4 },
      { id: 'review', min: 3.2, cap: ['但如果在快忘的时候，', '{复习一次}——'], voice: '但如果在快忘的时候，复习一次——', mood: 0.65, sfx: [{ at: 0.8, type: 'ding' }] },
      { id: 'again', min: 3.4, cap: ['第二次，忘得更慢；', '第三次，{更慢}。'], voice: '第二次，忘得更慢。第三次，更慢。', mood: 0.75, sfx: [{ at: 1.4, type: 'ding' }] },
      { id: 'quote', min: 2.6, cap: ['会学，', '更要{会复习}。'], voice: '会学，更要会复习。', mood: 0.8, capY: 900, capSize: 82 },
      { id: 'action', min: 3.2, cap: null, voice: '在对的时间复习，记忆才会留下来。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '刚学完20分钟1小时9天2631%记住的比例艾宾浩斯1885年示意复习数据：记忆实验（节省率）；曲线为在对时间才会留下来第一次二三个单词',
  };

  const X0 = 170, X1 = 930, Y0 = 980, Y1 = 1460;
  const PX = i => X0 + (i / (PTS.length - 1)) * (X1 - X0);
  const PY = v => Y1 - (v / 100) * (Y1 - Y0);

  // 按数据点逐段画出（upto 可为小数，表示画到两点之间）
  function curvePath(ctx, upto) {
    ctx.beginPath(); ctx.moveTo(PX(0), PY(PTS[0][1]));
    for (let i = 1; i < PTS.length; i++) {
      const k = Math.min(1, upto - (i - 1)); if (k <= 0) break;
      ctx.lineTo(PX(i - 1) + (PX(i) - PX(i - 1)) * k, PY(PTS[i - 1][1] + (PTS[i][1] - PTS[i - 1][1]) * k));
    }
  }
  // 复习后的示意曲线：回到 100%，衰减更慢
  function reviewCurve(ctx, i0, i1, floor, k) {
    ctx.beginPath(); ctx.moveTo(PX(i0), PY(PTS[i0][1])); ctx.lineTo(PX(i0), PY(100));
    const steps = 40;
    for (let s = 1; s <= steps * k; s++) { const u = s / steps; const v = floor + (100 - floor) * Math.exp(-u * 2.2); ctx.lineTo(PX(i0) + (PX(i1) - PX(i0)) * u, PY(v)); }
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ink = th.gold, redPen = th.red;
    const endDim = 1 - 0.85 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.4);

    // 开头：手写的"100"
    const hk = b('hook');
    const hA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('who').s, b('who').s + 0.5));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA;
      E.marker(ctx, 360, 880, 360, 90, th.marker, E.ease.out(E.seg(t, 0.6, 1.3)));
      ctx.fillStyle = th.fg; ctx.font = `700 230px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('100', 540, 960);
      ctx.font = `700 52px ${th.cap}`; ctx.fillText('个单词', 540, 1060);
      ctx.font = `700 120px ${th.cap}`; ctx.fillStyle = redPen; ctx.globalAlpha = hA * E.seg(t, hk.s + 1.6, hk.s + 2.0); ctx.fillText('?', 760, 860);
      ctx.restore();
    }

    // 图表
    const ca = E.seg(t, b('who').s + 0.3, b('who').s + 0.9) * endDim;
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha = ca; ctx.lineCap = 'round';
      ctx.strokeStyle = th.fg; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(X0, Y0 - 40); ctx.lineTo(X0, Y1); ctx.lineTo(X1 + 30, Y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0 - 10, Y0 - 28); ctx.lineTo(X0, Y0 - 44); ctx.lineTo(X0 + 10, Y0 - 28); ctx.stroke();
      ctx.font = `700 26px ${th.cap}`; ctx.fillStyle = th.fg; ctx.textAlign = 'left'; ctx.fillText('记住的比例', X0 + 70, Y0 - 50);
      ctx.font = `500 22px ${th.cap}`; ctx.fillStyle = th.dim; ctx.textAlign = 'right';
      [0, 50, 100].forEach(v => ctx.fillText(v + '%', X0 - 12, PY(v) + 8));
      ctx.textAlign = 'center';
      PTS.forEach(([lab], i) => { ctx.save(); ctx.translate(PX(i), Y1 + 34); ctx.rotate(i ? -0.35 : 0); ctx.fillText(lab, 0, 0); ctx.restore(); });
      // 艾宾浩斯便利贴
      ctx.save(); ctx.translate(800, 860); ctx.rotate(0.06); ctx.globalAlpha = ca * E.seg(t, b('who').s + 1.2, b('who').s + 1.7) * (1 - E.seg(t, b('review').s, b('review').s + 0.4));
      ctx.fillStyle = '#FFE58A'; ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; ctx.fillRect(-120, -60, 240, 120); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.cap}`; ctx.fillText('艾宾浩斯', 0, -8); ctx.font = `500 26px ${th.cap}`; ctx.fillText('1885 年', 0, 34); ctx.restore();
      // 遗忘曲线（蓝色墨水）
      const upto = t < b('curve').s ? 0 : t < b('day').s ? 2 * E.ease.inOut(E.seg(t, b('curve').s + 0.2, b('curve').s + 2.6)) : 2 + 5 * E.ease.inOut(E.seg(t, b('day').s + 0.1, b('day').s + 2.6));
      if (upto > 0 || t > b('who').s + 1) {
        curvePath(ctx, Math.max(0.001, upto)); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
        PTS.forEach(([, v], i) => {
          if (i > upto + 0.001) return;
          if (i === 0) { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(PX(0), PY(v), 8, 0, Math.PI * 2); ctx.fill(); return; }
          const hl = (i === 4 || i === 7);
          if (hl) E.marker(ctx, PX(i) - 10, PY(v) - 74, 110, 46, th.marker, E.ease.out(E.seg(t, b('day').s + (i === 4 ? 0.8 : 2.4), b('day').s + (i === 4 ? 1.3 : 2.9))));
          ctx.fillStyle = hl ? redPen : ink; ctx.beginPath(); ctx.arc(PX(i), PY(v), 8, 0, Math.PI * 2); ctx.fill();
          ctx.font = `700 ${hl ? 36 : 28}px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(Math.round(v) + '%', PX(i) - 4, PY(v) - 40);
        });
      }
      // 复习（示意）
      const r1 = E.ease.inOut(E.seg(t, b('review').s + 0.8, b('review').s + 2.2));
      const r2 = E.ease.inOut(E.seg(t, b('again').s + 1.4, b('again').s + 2.8));
      ctx.strokeStyle = '#2E9E6A'; ctx.lineWidth = 5;
      if (r1 > 0) { reviewCurve(ctx, 4, 6, 62, r1); ctx.stroke(); }
      if (r2 > 0) { reviewCurve(ctx, 6, 7, 84, r2); ctx.stroke(); }
      if (r1 > 0) {
        ctx.fillStyle = '#2E9E6A'; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillText('复习', PX(4), PY(100) - 18); if (r2 > 0) ctx.fillText('再复习', PX(6), PY(100) - 18);
        ctx.save(); ctx.translate(280, 860); ctx.rotate(-0.07); ctx.globalAlpha = ca * E.seg(r1, 0, 0.3);
        ctx.fillStyle = '#BFF0D2'; ctx.fillRect(-90, -40, 180, 80); ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.cap}`; ctx.fillText('示意', 0, 12); ctx.restore();
      }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, b('who').s, b('who').s + 0.8) * endDim; ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'center';
    ctx.fillText('数据：艾宾浩斯 1885 年记忆实验（节省率）；复习曲线为示意', 540, 1680); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '在对的时间复习，', 540, 880, { theme: th, size: 84, tt: t - ac.s - 0.1 });
      E.marker(ctx, 330, 960, 440, 70, th.marker, E.ease.out(E.seg(t, ac.s + 1.2, ac.s + 1.8)));
      E.rich(ctx, '记忆才会{留下来}。', 540, 1020, { theme: th, size: 96, tt: t - ac.s - 0.7 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
