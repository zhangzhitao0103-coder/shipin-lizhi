// I2《高一的地基》关键窗口期类 · 蓝图工程风 · 高一家长向
// 依据：人教 A 版（2019）高中数学：必修第一册含函数概念与性质、指数函数与对数函数、三角函数；
// 选择性必修第二册含数列、一元函数的导数及其应用。数列是特殊的函数，导数研究函数的变化
(function (root) {
  const BLOCKS = [
    // [名称, 行(0=地基), 列中心x, 宽, 年级]
    ['函数概念', 0, 230, 260, '高一'], ['指数与对数', 0, 540, 260, '高一'], ['三角函数', 0, 850, 260, '高一'],
    ['数列', 1, 360, 300, '高二'], ['导数', 1, 720, 300, '高二'],
    ['高考函数与导数大题', 2, 540, 620, '高三'],
  ];
  const EDGES = [[0, 3], [1, 3], [0, 4], [1, 4], [2, 4], [3, 5], [4, 5]];
  const ROWY = [1300, 1060, 820], BH = 130;

  const EP = {
    id: 'I2',
    title: '高一的地基',
    theme: 'blueprint',
    voice: { sid: 30 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'crack',
    beats: [
      { id: 'hook', min: 3.0, cap: ['高一，', '是用来{适应}的吗？'], voice: '高一，是用来适应的吗？', mood: 0.3 },
      { id: 'base', min: 4.2, cap: ['高一数学学的函数，', '是整个高中数学的{地基}。'], voice: '高一数学学的函数，是整个高中数学的地基。', mood: 0.45, sfx: [{ at: 0.8, type: 'tick' }, { at: 1.1, type: 'tick' }, { at: 1.4, type: 'tick' }] },
      { id: 'up', min: 4.8, cap: ['高二的数列，是特殊的函数；', '导数，研究的就是{函数怎么变化}。'], voice: '高二的数列，是特殊的函数。导数，研究的就是函数怎么变化。', mood: 0.55, sfx: [{ at: 0.6, type: 'tick' }, { at: 2.6, type: 'tick' }] },
      { id: 'exam', min: 3.8, cap: ['高考数学的大题里，', '几乎每年都有{函数与导数}。'], voice: '高考数学的大题里，几乎每年都有函数与导数。', mood: 0.7, sfx: [{ at: 0.6, type: 'ding' }] },
      { id: 'crack', min: 3.6, cap: ['地基缺一块，', '上面每一层，都[站不稳]。'], voice: '地基缺一块，上面每一层，都站不稳。', mood: 0.85, sfx: [{ at: 0.5, type: 'boom' }] },
      { id: 'flip', min: 3.4, cap: ['高一不是适应期，', '是{打地基}的时候。'], voice: '高一不是适应期，是打地基的时候。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '地基打牢，后面才盖得高。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '函数概念指数与对数三角数列导数高考函数与大题高一高二高三人教版教材目录必修第一册选择性第二地基打牢后面才盖得高FOUNDATION0123456789()',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const bs = b('base'), up = b('up'), ex = b('exam'), cr = b('crack'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 地面
      ctx.strokeStyle = th.dim; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(80, ROWY[0] + BH + 20); ctx.lineTo(1000, ROWY[0] + BH + 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('FOUNDATION · 地基', 80, ROWY[0] + BH + 56);
      const appear = i => {
        const row = BLOCKS[i][1];
        const s0 = row === 0 ? bs.s + 0.8 + i * 0.3 : row === 1 ? up.s + 0.6 + (i - 3) * 2.0 : ex.s + 0.6;
        return E.ease.outBack(E.seg(t, s0, s0 + 0.5));
      };
      const missing = E.seg(t, cr.s + 0.3, cr.s + 0.6) * (1 - E.seg(t, fl.s + 0.6, fl.s + 1.4));  // 抽掉"函数概念"，之后补回
      const wob = missing * Math.sin(t * 26) * 10;
      // 依赖连线
      EDGES.forEach(([a, z]) => {
        const k = Math.min(appear(a), appear(z)); if (k <= 0.01) return;
        const A = BLOCKS[a], Z = BLOCKS[z];
        const off = A[1] >= 1 ? wob : 0, offZ = wob;
        ctx.globalAlpha = sceneA * Math.min(1, k) * (a === 0 ? 1 - 0.7 * missing : 1);
        ctx.strokeStyle = th.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(A[2] + off, ROWY[A[1]]); ctx.lineTo(Z[2] + offZ, ROWY[Z[1]] + BH); ctx.stroke();
      });
      // 方块
      BLOCKS.forEach(([name, row, cx, w, grade], i) => {
        const a = appear(i); if (a <= 0.01) return;
        const isGone = i === 0 ? missing : 0;
        const dx = row >= 1 ? wob * (row === 2 ? 1.6 : 1) : 0, rot = row >= 1 ? missing * Math.sin(t * 26 + row) * 0.03 : 0;
        ctx.save(); ctx.globalAlpha = sceneA * Math.min(1, a) * (1 - 0.75 * isGone);
        ctx.translate(cx + dx, ROWY[row] + BH / 2 + (i === 0 ? isGone * 30 : 0)); ctx.rotate(rot); ctx.scale(a, a);
        ctx.fillStyle = row === 2 ? 'rgba(255,211,77,0.22)' : 'rgba(242,247,255,0.10)';
        ctx.strokeStyle = isGone > 0.5 ? th.red : row === 2 ? th.gold : th.fg; ctx.lineWidth = 4;
        if (isGone > 0.5) ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.rect(-w / 2, -BH / 2, w, BH); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = isGone > 0.5 ? th.red : row === 2 ? th.goldHi : th.fg; ctx.font = `700 ${row === 2 ? 40 : 38}px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillText(isGone > 0.5 ? '缺一块' : name, 0, 4);
        ctx.fillStyle = th.dim; ctx.font = `500 24px ${th.mono}`; ctx.fillText(grade, 0, 42);
        ctx.restore();
      });
      // 打地基：地基一行发光
      const gA = E.seg(t, fl.s + 1.0, fl.s + 1.6);
      if (gA > 0) {
        ctx.globalAlpha = sceneA * gA; ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 30;
        ctx.strokeRect(80, ROWY[0] - 16, 920, BH + 32); ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('依据人教 A 版（2019）高中数学教材：必修第一册、选择性必修第二册目录', 540, 1600);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '地基打牢，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{后面才盖得高}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
