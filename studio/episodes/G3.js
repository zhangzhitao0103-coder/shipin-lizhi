// G3《差距是按"平方"拉大的》差距与竞争类 · 信息图风
// 物理锚点：匀加速直线运动 s = ½at²。两人从静止同时出发、加速度相差 Δa，位移差 Δs = ½Δa·t²，与时间的平方成正比
// 示意：取 ½Δa = 1 步/月²，则第 1、2、3、10 个月的差距为 1、4、9、100 步
(function (root) {
  const A1 = 10, A2 = 12;                 // 两人的"加速度"（示意单位），½(A2−A1) = 1
  const s = (a, m) => 0.5 * a * m * m;

  const EP = {
    id: 'G3',
    title: '差距是按平方拉大的',
    theme: 'info',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 100, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'm10',
    beats: [
      { id: 'hook', min: 3.4, cap: ['两个人，起点一样，', '一个人的进步，每周{快一点点}。'], voice: '两个人，起点一样，一个人的进步，每周都快一点点。', mood: 0.3 },
      { id: 'phys', min: 4.2, cap: ['物理课学过：匀加速运动的位移，', '和时间的{平方}成正比。'], voice: '物理课学过，匀加速运动的位移，和时间的平方成正比。', mood: 0.45 },
      { id: 'm1', min: 2.8, cap: ['第 1 个月：', '只差 {1 步}。'], voice: '第一个月，只差一步。', mood: 0.5, sfx: [{ at: 0.4, type: 'tick' }] },
      { id: 'm3', min: 3.6, cap: ['第 2 个月：差 {4 步}；', '第 3 个月：差 {9 步}。'], voice: '第二个月，差四步。第三个月，差九步。', mood: 0.65, sfx: [{ at: 0.4, type: 'tick' }, { at: 1.8, type: 'tick' }] },
      { id: 'm10', min: 3.4, cap: ['第 10 个月：', '差 [100 步]。'], voice: '第十个月，差一百步。', mood: 1.0, sfx: [{ at: 0.3, type: 'ticks', n: 7, gap: 0.14 }, { at: 1.4, type: 'boom' }] },
      { id: 'flip', min: 3.6, cap: ['现在的一点点，', '到高考时，是[一大截]。'], voice: '现在的一点点，到高考时，是一大截。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '别小看，每周多出来的那一点。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第个月差步你他差距位移时间匀加速运动示意两人加速度相差恒定与平方成正比别小看每周多出来的那一点s=½at²0123456789',
  };

  // 当前月份（连续）
  function month(t, TL, E) {
    const b = id => TL.b(id);
    const go = (a, z, st, d) => E.lerp(a, z, E.ease.inOut(E.seg(t, st, st + d)));
    if (t < b('m1').s) return 0;
    if (t < b('m3').s) return go(0, 1, b('m1').s + 0.2, 1.0);
    if (t < b('m10').s) return t < b('m3').s + 1.5 ? go(1, 2, b('m3').s + 0.2, 1.0) : go(2, 3, b('m3').s + 1.6, 1.0);
    return go(3, 10, b('m10').s + 0.2, 1.4);
  }

  const TX0 = 150, TX1 = 930, CX0 = 170, CX1 = 920, CY0 = 1450, CY1 = 960;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      const m = month(t, TL, E);
      ctx.save(); ctx.globalAlpha = sceneA;
      // 跑道：镜头随领先者缩放
      const lead = Math.max(1, s(A2, m)), sc = (TX1 - TX0) / (lead * 1.08);
      const lanes = [['他', A1, th.dim, 600], ['你', A2, th.gold, 720]];
      lanes.forEach(([name, a, col, y]) => {
        ctx.fillStyle = th.faint; ctx.fillRect(TX0, y, TX1 - TX0, 4);
        const x = TX0 + s(a, m) * sc;
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = col === th.gold ? 24 : 0;
        ctx.beginPath(); ctx.arc(x, y + 2, 20, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText(name, TX0 - 20, y + 12);
      });
      // 差距括号
      if (m > 0.05) {
        const xa = TX0 + s(A1, m) * sc, xb = TX0 + s(A2, m) * sc;
        ctx.strokeStyle = th.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, 790); ctx.lineTo(xa, 810); ctx.lineTo(xb, 810); ctx.lineTo(xb, 790); ctx.stroke();
        ctx.fillStyle = th.red; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'center';
        ctx.fillText('差 ' + Math.round(m * m) + ' 步', Math.min(860, Math.max(220, (xa + xb) / 2)), 860);
      }
      // 公式
      const pA = E.seg(t, b('phys').s + 0.3, b('phys').s + 0.8) * (1 - E.seg(t, b('m1').s - 0.2, b('m1').s + 0.2));
      if (pA > 0) { ctx.globalAlpha = sceneA * pA; ctx.fillStyle = th.fg; ctx.font = `700 64px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('s = ½at²', 540, 940); ctx.globalAlpha = sceneA; }
      // 差距—时间曲线（抛物线）
      const cA = E.seg(t, b('m1').s, b('m1').s + 0.5);
      if (cA > 0) {
        ctx.globalAlpha = sceneA * cA;
        ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX0, CY1 - 40); ctx.lineTo(CX0, CY0); ctx.lineTo(CX1, CY0); ctx.stroke();
        ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('差距（步）', CX0, CY1 - 60);
        ctx.textAlign = 'right'; ctx.fillText('时间（月）', CX1, CY0 + 50);
        const gx = mm => CX0 + (mm / 10) * (CX1 - CX0), gy = g => CY0 - (g / 100) * (CY0 - CY1);
        for (let k = 1; k <= 10; k++) { ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText(String(k), gx(k), CY0 + 30); }
        ctx.strokeStyle = th.red; ctx.lineWidth = 5; ctx.beginPath();
        for (let i = 0; i <= 100; i++) { const mm = (m * i) / 100; i ? ctx.lineTo(gx(mm), gy(mm * mm)) : ctx.moveTo(gx(mm), gy(mm * mm)); }
        ctx.stroke();
        [1, 2, 3, 10].forEach(k => {
          if (m < k - 0.02) return;
          ctx.fillStyle = th.red; ctx.beginPath(); ctx.arc(gx(k), gy(k * k), 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = th.fg; ctx.font = `700 30px ${th.mono}`; ctx.textAlign = k === 10 ? 'right' : 'left';
          ctx.fillText(String(k * k), gx(k) + (k === 10 ? -18 : 14), gy(k * k) - 14);
        });
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('示意：两人加速度相差恒定时，差距与时间的平方成正比（s = ½at²）', 540, 1600);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别小看，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{每周多出来的那一点}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.4 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
