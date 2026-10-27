// M4《考场卡住了，先跳过》期末冲刺类 · 试卷风
// 按新高考数学 I 卷结构：单选 8×5 = 40、多选 3×6 = 18、填空 3×5 = 15、解答 5 题共 77（13/15/15/17/17），满分 150、120 分钟
// 平均每分钟 150 ÷ 120 = 1.25 分；卡 15 分钟 ≈ 18.75 分。"3 分钟"为经验建议
(function (root) {
  const SECTIONS = [['单选', [5, 5, 5, 5, 5, 5, 5, 5]], ['多选', [6, 6, 6]], ['填空', [5, 5, 5]], ['解答', [13, 15, 15, 17, 17]]];
  const STUCK = 5;  // 第 6 题（下标 5）

  const EP = {
    id: 'M4',
    title: '考场卡住了先跳过',
    theme: 'exampaper',
    voice: { sid: 90 },
    capY: 380, capSize: 62,
    music: { style: 'pulse', bpm: 104, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'stuck',
    beats: [
      { id: 'hook', min: 3.4, cap: ['考场上，一道选择题{卡住了}，', '你会死磕吗？'], voice: '考场上，一道选择题卡住了，你会死磕吗？', mood: 0.3 },
      { id: 'rate', min: 4.4, cap: ['数学卷 150 分、120 分钟：', '平均每分钟，值 {1.25 分}。'], voice: '数学卷一百五十分，一百二十分钟，平均每分钟，值一点二五分。', mood: 0.45 },
      { id: 'stuck', min: 4.6, cap: ['一道 5 分的题，你卡了 15 分钟：', '耗掉的时间，够拿 [将近 19 分]。'], voice: '一道五分的题，你卡了十五分钟，耗掉的时间，够拿将近十九分。', mood: 0.85, sfx: [{ at: 0.4, type: 'ticks', n: 15, gap: 0.14 }, { at: 2.8, type: 'boom' }] },
      { id: 'rule', min: 4.2, cap: ['所以考场规矩是：', '{卡住超过 3 分钟，做个记号，先跳过}。'], voice: '所以考场规矩是，卡住超过三分钟，做个记号，先跳过。', mood: 0.6, sfx: [{ at: 2.4, type: 'whoosh' }] },
      { id: 'back', min: 3.6, cap: ['做完会做的，', '再{回头}啃难题。'], voice: '做完会做的，再回头啃难题。', mood: 0.7, sfx: [{ at: 1.8, type: 'whoosh' }] },
      { id: 'flip', min: 3.6, cap: ['期末拼的不是最难那道题，', '是{会做的全拿到}。'], voice: '期末拼的不是最难那道题，是会做的全拿到。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '卡住了，先跳过。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '单选多选填空解答分钟每分值剩余时间卡住做记号跳过回头会做的全拿到新高考数学卷结构期末以学校为准经验建议约第题考场先过',
  };

  const X0 = 270, BW = 76, GAP = 10, Y0 = 620, RH = 120;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const rt = b('rate'), st = b('stuck'), ru = b('rule'), bk = b('back');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    // 作答进度：死磕阶段停在第 6 题；规矩阶段跳过，做到最后；回头阶段回到第 6 题
    const doneSkip = E.seg(t, ru.s + 2.4, ru.e);       // 跳过后依次完成
    const backK = E.seg(t, bk.s + 1.6, bk.s + 2.4);
    let q = 0;
    SECTIONS.forEach(([name, scores], r) => {
      const y = Y0 + r * RH;
      ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText(name, X0 - 24, y + 52);
      const w = r === 3 ? 130 : BW;
      scores.forEach((sc, k) => {
        const idx = q++, x = X0 + k * (w + GAP);
        const before = idx < STUCK && t > b('hook').s + 1.0, isStuck = idx === STUCK;
        const after = idx > STUCK && doneSkip * 13 > idx - STUCK - 1;
        ctx.strokeStyle = th.fg; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, 76);
        ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(String(idx + 1), x + 16, y + 24);
        ctx.fillStyle = th.fg; ctx.font = `700 26px ${th.num}`; ctx.fillText(sc + ' 分', x + w / 2 + 6, y + 58);
        if (isStuck && t > st.s && t < bk.s + 2.0) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 8);
          ctx.strokeStyle = th.red; ctx.lineWidth = 5; ctx.globalAlpha = sceneA * (t < ru.s ? 0.5 + 0.5 * pulse : 1); ctx.strokeRect(x - 4, y - 4, w + 8, 84); ctx.globalAlpha = sceneA;
          if (t > ru.s + 1.4) { ctx.fillStyle = th.red; ctx.font = `700 44px ${th.cap}`; ctx.fillText('?', x + w - 14, y + 30); }
        }
        // 红色对勾
        const ok = before || after || (isStuck && backK > 0.9);
        if (ok) { ctx.strokeStyle = th.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w - 34, y + 50); ctx.lineTo(x + w - 22, y + 64); ctx.lineTo(x + w - 4, y + 36); ctx.stroke(); }
      });
    });
    // 跳过与回头的箭头
    const sx = X0 + STUCK * (BW + GAP) + BW / 2;
    const jA = E.seg(t, ru.s + 2.2, ru.s + 2.6) * (1 - E.seg(t, bk.s, bk.s + 0.3));
    if (jA > 0) {
      ctx.globalAlpha = sceneA * jA; ctx.strokeStyle = th.blue; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx, Y0 - 10); ctx.quadraticCurveTo(sx + 43, Y0 - 70, sx + 86, Y0 - 10); ctx.stroke();
      ctx.fillStyle = th.blue; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('先跳过', sx + 43, Y0 - 70);
    }
    if (t > bk.s + 0.6) {
      ctx.globalAlpha = sceneA * E.seg(t, bk.s + 0.6, bk.s + 1.0); ctx.strokeStyle = th.blue; ctx.lineWidth = 5; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(X0 + 4 * 140 + 60, Y0 + 3 * RH + 90); ctx.quadraticCurveTo(1000, Y0 + 100, sx + 30, Y0 + 86); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.blue; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('最后回头', 900, Y0 + 300);
    }
    ctx.globalAlpha = sceneA;
    // 计时与换算
    const cY = 1240;
    const rA = E.seg(t, rt.s + 0.4, rt.s + 0.9);
    if (rA > 0) {
      ctx.globalAlpha = sceneA * rA; ctx.fillStyle = th.fg; ctx.textAlign = 'left';
      ctx.font = `700 46px ${th.num}`; ctx.fillText('150 分 ÷ 120 分钟 = 1.25 分 / 分钟', 140, cY);
    }
    const sA = E.seg(t, st.s + 0.3, st.s + 0.7);
    if (sA > 0) {
      const mins = Math.min(15, Math.floor(E.seg(t, st.s + 0.4, st.s + 2.6) * 15 + 0.001));
      ctx.globalAlpha = sceneA * sA; ctx.textAlign = 'left';
      ctx.fillStyle = th.red; ctx.font = `700 96px ${th.num}`; ctx.fillText('卡了 ' + mins + ' 分钟', 140, cY + 150);
      const lose = E.seg(t, st.s + 2.6, st.s + 3.0);
      if (lose > 0) { ctx.globalAlpha = sceneA * lose; ctx.fillStyle = th.fg; ctx.font = `700 52px ${th.num}`; ctx.fillText('= 约 19 分的时间', 140, cY + 240); ctx.fillStyle = th.dim; ctx.font = `500 30px ${th.cap}`; ctx.fillText('（为了一道 5 分的题）', 140, cY + 290); }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('按新高考数学 I 卷结构示意；期末试卷结构以学校为准；"3 分钟"为经验建议', 540, 1690);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '卡住了，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{先跳过}。', 540, 1040, { theme: th, size: 130, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
