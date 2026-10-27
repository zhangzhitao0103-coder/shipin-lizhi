// N1《寒假计划为什么总完不成》寒假规划类 · 软木板风
// 依据：Buehler、Griffin & Ross（1994）"计划谬误"：37 名心理学专业学生估计毕业论文平均 33.9 天完成，实际平均 55.5 天；
// 按自己预估时间完成的约 30%（37 人中约 11 人）。画面中按时完成者的位置为示意
(function (root) {
  const N = 37, ONTIME = 11;

  const EP = {
    id: 'N1',
    title: '寒假计划为什么总完不成',
    theme: 'corkboard',
    voice: { sid: 30 },
    capY: 360, capSize: 60,
    music: { style: 'lofi', bpm: 78, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'real',
    beats: [
      { id: 'hook', min: 3.4, cap: ['寒假计划写得满满的，', '为什么{总是完不成}？'], voice: '寒假计划写得满满的，为什么总是完不成？', mood: 0.3 },
      { id: 'exp', min: 4.4, cap: ['心理学家问 37 个大学生：', '你的毕业论文，{多少天}能写完？'], voice: '心理学家问了三十七个大学生，你的毕业论文，多少天能写完？', mood: 0.4, sfx: [{ at: 1.0, type: 'ticks', n: 12, gap: 0.08 }] },
      { id: 'guess', min: 3.2, cap: ['他们平均估计：', '{34 天}。'], voice: '他们平均估计，三十四天。', mood: 0.45, sfx: [{ at: 0.6, type: 'tick' }] },
      { id: 'real', min: 3.4, cap: ['实际平均用了：', '[56 天]。'], voice: '实际平均用了，五十六天。', mood: 0.7, sfx: [{ at: 0.4, type: 'riser', dur: 1.2 }, { at: 1.6, type: 'boom' }] },
      { id: 'ontime', min: 3.4, cap: ['按自己说的时间完成的，', '只有 [三成]。'], voice: '按自己说的时间完成的，只有三成。', mood: 0.6 },
      { id: 'flip', min: 3.8, cap: ['不是你不努力，', '是每个人都会{低估时间}。'], voice: '不是你不努力，是每个人都会低估时间。', mood: 0.55 },
      { id: 'how', min: 4.2, cap: ['做寒假计划：先估时间，', '再{多留一半以上}的余量。'], voice: '做寒假计划，先估时间，再多留一半以上的余量。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '计划留余量，才能真的完成。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '预计实际天按时完成名学生毕业论文计划谬误留余量才能真完成每格一人约示意寒假',
  };

  const DX = 120, DW = 840;  // 天数轴

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ex = b('exp'), gs = b('guess'), rl = b('real'), ot = b('ontime'), hw = b('how');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    // 37 个学生（小卡片头像）
    const sA = E.seg(t, ex.s + 0.8, ex.s + 1.4);
    if (sA > 0) {
      const ot1 = E.seg(t, ot.s + 0.3, ot.s + 1.2);
      for (let i = 0; i < N; i++) {
        const c = i % 13, r = Math.floor(i / 13), x = 150 + c * 62, y = 590 + r * 72;
        const a = E.seg(t, ex.s + 0.8 + i * 0.03, ex.s + 1.0 + i * 0.03);
        const ok = (i * 7) % N < ONTIME;   // 7 与 37 互质：打散后恰好 11 人
        ctx.globalAlpha = sceneA * a * (ot1 > 0 && !ok ? 1 - 0.6 * ot1 : 1);
        ctx.fillStyle = ok && ot1 > 0 ? '#15803D' : th.fg;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 14, y + 18, 28, 26);
      }
      ctx.globalAlpha = sceneA * sA; ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left';
      ctx.fillText(t > ot.s + 0.8 ? '按时完成：37 人中约 11 人' : '37 名学生', 150, 830);
    }
    // 预计 vs 实际
    const day = d => DX + (d / 60) * DW;
    const gA = E.seg(t, gs.s + 0.2, gs.s + 0.6);
    if (gA > 0) {
      const yy = 1000;
      ctx.globalAlpha = sceneA * gA; ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(DX, yy + 210); ctx.lineTo(DX + DW, yy + 210); ctx.stroke();
      ctx.fillStyle = th.fg; ctx.font = `500 24px ${th.mono}`; ctx.textAlign = 'center';
      for (let d = 0; d <= 60; d += 10) { ctx.fillRect(day(d) - 1, yy + 204, 2, 12); ctx.fillText(String(d), day(d), yy + 246); }
      ctx.textAlign = 'right'; ctx.fillText('天', DX + DW, yy + 280);
      const g = E.ease.out(E.seg(t, gs.s + 0.3, gs.s + 1.2));
      E.note(ctx, DX, yy, (day(33.9) - DX) * g, 80, '#FDE68A', -0.01, null);
      ctx.globalAlpha = sceneA * gA; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('预计 34 天', DX + 20, yy + 52);
      const rA = E.seg(t, rl.s + 0.2, rl.s + 0.5);
      if (rA > 0) {
        const k = E.ease.out(E.seg(t, rl.s + 0.3, rl.s + 1.5));
        E.note(ctx, DX, yy + 100, (day(55.5) - DX) * k, 80, '#FBCFE8', 0.008, null, rA);
        ctx.globalAlpha = sceneA * rA; ctx.fillStyle = th.red; ctx.font = `700 34px ${th.cap}`; ctx.fillText('实际 56 天', DX + 20, yy + 152);
        if (k > 0.95) { ctx.fillStyle = th.red; ctx.font = `700 40px ${th.num}`; ctx.textAlign = 'right'; ctx.fillText('多用 6 成', DX + DW, yy + 54); }
      }
    }
    // 留余量
    const hA = E.seg(t, hw.s + 0.4, hw.s + 0.9);
    if (hA > 0) {
      E.note(ctx, 300, 1360, 480, 150, '#BBF7D0', -0.02, '#15803D', hA);
      ctx.globalAlpha = sceneA * hA; ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('估 10 天 → 排 15 天', 540, 1458);
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.fg; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Buehler、Griffin & Ross（1994）：37 名学生估计与实际完成毕业论文的天数', 540, 1680);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.note(ctx, 110, 850, 860, 420, '#FFFDF6', 0.01, '#C2410C', E.seg(t, ac.s, ac.s + 0.3));
        E.rich(ctx, '计划留余量，', 540, 1000, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{才能真完成}。', 540, 1150, { theme: th, size: 108, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
