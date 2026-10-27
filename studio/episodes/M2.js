// M2《别按章节刷题，混着做》期末冲刺类 · 玻璃拟态风
// 依据：Rohrer & Taylor（2007，Instructional Science）：大学生学习 4 种立体的体积公式
// 练习时：分块练 89%，混着练 60%；一周后测验：分块练 20%，混着练 63%
(function (root) {
  const KINDS = ['#9FD8FF', '#FFE08A', '#FF8FA3', '#B9F2C9'];
  const BLOCKED = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  const MIXED = [2, 0, 3, 1, 0, 2, 3, 1, 2, 0, 1, 3];

  const EP = {
    id: 'M2',
    title: '别按章节刷题混着做',
    theme: 'glass',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'test',
    beats: [
      { id: 'hook', min: 3.4, cap: ['期末刷题，一章一章{按顺序刷}，', '是不是最稳？'], voice: '期末刷题，一章一章按顺序刷，是不是最稳？', mood: 0.3 },
      { id: 'exp', min: 4.8, cap: ['数学实验：学 4 种立体的体积公式，', '一组{按类型分块练}，一组{打乱混着练}。'], voice: '有一个数学实验，学四种立体的体积公式。一组按类型分块练，一组打乱了混着练。', mood: 0.4, sfx: [{ at: 1.6, type: 'ticks', n: 12, gap: 0.1 }] },
      { id: 'practice', min: 4.2, cap: ['练的时候：分块练的正确率 {89%}，', '混着练只有 [60%]。'], voice: '练的时候，分块练的正确率百分之八十九，混着练只有百分之六十。', mood: 0.5 },
      { id: 'test', min: 4.4, cap: ['一周后考试：', '分块练的只剩 [20%]，混着练的 {63%}。'], voice: '一周后考试，分块练的只剩百分之二十，混着练的百分之六十三。', mood: 0.95, sfx: [{ at: 0.4, type: 'riser', dur: 1.4 }, { at: 1.9, type: 'boom' }] },
      { id: 'why', min: 4.6, cap: ['分块练，不用判断"这是哪类题"；', '可考试时，[最难的恰恰是这一步]。'], voice: '分块练，不用判断这是哪类题。可考试时，最难的，恰恰是这一步。', mood: 0.6 },
      { id: 'flip', min: 3.6, cap: ['练的时候越顺，', '{不一定}学得越牢。'], voice: '练的时候越顺，不一定学得越牢。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '期末复习，把题混着做。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '分块练混着练练习时一周后测验正确率哪类题期末复习把题混着做ABCD体积公式',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ex = b('exp'), pr = b('practice'), ts = b('test'), wy = b('why');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save();
    // 两种练习顺序
    [['分块练', BLOCKED, 590], ['混着练', MIXED, 760]].forEach(([name, seq, y], g) => {
      const a = E.seg(t, ex.s + 1.0 + g * 0.6, ex.s + 1.4 + g * 0.6);
      if (a <= 0) return;
      E.glassCard(ctx, 100, y - 10, 880, 130, sceneA * a, 28);
      ctx.globalAlpha = sceneA * a; ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(name, 130, y + 70);
      seq.forEach((k, i) => {
        const ka = E.seg(t, ex.s + 1.6 + i * 0.1, ex.s + 1.8 + i * 0.1);
        ctx.globalAlpha = sceneA * a * ka; ctx.fillStyle = KINDS[k];
        ctx.beginPath(); ctx.roundRect(290 + i * 56, y + 30, 46, 60, 10); ctx.fill();
        ctx.fillStyle = '#1A1438'; ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('ABCD'[k], 313 + i * 56, y + 70);
      });
      // "判断题型"提示：混着练的每一题前都要先认出类型
      if (g === 1) {
        const wA = E.seg(t, wy.s + 0.4, wy.s + 0.9);
        if (wA > 0) { ctx.globalAlpha = sceneA * wA; ctx.fillStyle = th.goldHi; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('每一题先判断：这是哪类？', 290, y + 140); }
      }
    });
    // 练习时 / 一周后 柱状图
    const BY = 1520, BH = 480;
    [['练习时', 'practice', [89, 60]], ['一周后测验', 'test', [20, 63]]].forEach(([label, id, vals], k) => {
      const beat = b(id), a = E.seg(t, beat.s + 0.3, beat.s + 0.7);
      if (a <= 0) return;
      const x0 = 160 + k * 420;
      E.glassCard(ctx, x0 - 30, BY - BH - 110, 380, BH + 210, sceneA * a * 0.7, 28);
      ctx.globalAlpha = sceneA * a; ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(label, x0 + 160, BY - BH - 56);
      vals.forEach((v, g) => {
        const grow = E.ease.out(E.seg(t, beat.s + 0.5 + g * 0.3, beat.s + 1.6 + g * 0.3)), h = (BH * v / 100) * grow, x = x0 + 20 + g * 160;
        const col = g === 0 ? 'rgba(255,255,255,0.55)' : th.gold;
        ctx.fillStyle = col; if (k === 1 && g === 1) { ctx.shadowColor = th.gold; ctx.shadowBlur = 30; }
        ctx.beginPath(); ctx.roundRect(x, BY - h, 120, h, 10); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = k === 1 && g === 0 ? th.red : g ? th.goldHi : th.fg; ctx.font = `700 44px ${th.num}`; ctx.fillText(Math.round(v * grow) + '%', x + 60, BY - h - 14);
        ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.fillText(g ? '混着练' : '分块练', x + 60, BY + 46);
      });
    });
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Rohrer & Taylor（2007）：大学生练习 4 种立体体积题，练习时与一周后测验的正确率', 540, 1680);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '期末复习，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{把题混着做}。', 540, 1030, { theme: th, size: 112, tt: t - ac.s - 0.4, glow: 1.0 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
