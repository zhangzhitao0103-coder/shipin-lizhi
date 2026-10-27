// I5《播种的季节》关键窗口期类 · 新中式水墨风 · 家长向
// 依据：华北冬小麦农谚"白露早，寒露迟，秋分种麦正当时"；早播易旺长、冬季易受冻，晚播苗弱、分蘖少，影响来年产量
(function (root) {
  const TERMS = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'];
  const CX = 540, CY = 1060, R = 330;
  const ang = i => -Math.PI / 2 + (i / 24) * Math.PI * 2;

  const EP = {
    id: 'I5',
    title: '播种的季节',
    theme: 'ink',
    voice: { sid: 30 },
    capY: 370, capSize: 62,
    music: { style: 'bell', bpm: 84, chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'hook',
    beats: [
      { id: 'hook', min: 4.0, cap: ['老农都知道一句话：', '“白露早，寒露迟，{秋分种麦正当时}。”'], voice: '老农都知道一句话，白露早，寒露迟，秋分种麦正当时。', mood: 0.35 },
      { id: 'why', min: 4.6, cap: ['种早了，苗太旺，冬天容易冻伤；', '种晚了，苗太弱，[来年收成差]。'], voice: '种早了，苗太旺，冬天容易冻伤。种晚了，苗太弱，来年收成差。', mood: 0.45 },
      { id: 'each', min: 3.4, cap: ['什么时候做什么事，', '{错过了，就补不回来}。'], voice: '什么时候做什么事，错过了，就补不回来。', mood: 0.55 },
      { id: 'you', min: 4.8, cap: ['孩子的高中也有节气：', '高一{打基础}，高二{拉开差距}，高三冲刺。'], voice: '孩子的高中也有节气。高一打基础，高二拉开差距，高三冲刺。', mood: 0.65, sfx: [{ at: 1.8, type: 'ding' }, { at: 2.8, type: 'ding' }, { at: 3.9, type: 'ding' }] },
      { id: 'flip', min: 3.6, cap: ['该播种的时候，', '别等到[秋收]才着急。'], voice: '该播种的时候，别等到秋收才着急。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '每个阶段，都有它该做的事。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: TERMS.join('') + '早迟正当时种麦高一高二高三打基础拉开差距冲刺华北冬小麦农谚每个阶段都有它该做的事',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const hk = b('hook'), wy = b('why'), yo = b('you'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    const ringA = sceneA * (1 - E.seg(t, yo.s, yo.s + 0.6));
    ctx.save();
    if (ringA > 0) {
      // 墨色圆环
      const draw = E.ease.inOut(E.seg(t, 0.3, 1.8));
      ctx.globalAlpha = ringA * 0.85; ctx.strokeStyle = th.fg; ctx.lineCap = 'round';
      [[16, 0.35], [6, 0.8]].forEach(([w, a]) => { ctx.globalAlpha = ringA * a; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(CX, CY, R - 70, -Math.PI / 2, -Math.PI / 2 + draw * Math.PI * 2); ctx.stroke(); });
      TERMS.forEach((s, i) => {
        const a = E.seg(draw * 24, i, i + 1);
        if (a <= 0) return;
        const hi = i >= 14 && i <= 16 && t > hk.s + 1.6;
        ctx.globalAlpha = ringA * a * (hi || t < hk.s + 1.6 ? 1 : 0.45);
        ctx.fillStyle = i === 15 && hi ? th.gold : hi ? th.red : th.fg;
        ctx.font = `400 ${hi ? 40 : 30}px ${th.num}`; ctx.textAlign = 'center';
        const x = CX + R * Math.cos(ang(i)), y = CY + R * Math.sin(ang(i));
        ctx.fillText(s, x, y + 12);
      });
      // 麦苗：早播旺长、晚播弱小
      const wA = E.seg(t, wy.s + 0.3, wy.s + 0.8);
      if (wA > 0) {
        ctx.globalAlpha = ringA * wA;
        const sprout = (x, y, h, n, col) => { ctx.strokeStyle = col; ctx.lineWidth = 5; for (let k = 0; k < n; k++) { const dx = (k - (n - 1) / 2) * 12; ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.quadraticCurveTo(x + dx * 1.6, y - h * 0.6, x + dx * 2.4, y - h); ctx.stroke(); } };
        sprout(CX - 160, CY + 40, 150 * E.seg(t, wy.s + 0.3, wy.s + 1.3), 7, th.gold);
        sprout(CX, CY + 40, 90 * E.seg(t, wy.s + 0.3, wy.s + 1.3), 5, th.gold);
        sprout(CX + 160, CY + 40, 34 * E.seg(t, wy.s + 2.3, wy.s + 3.3), 2, th.gold);
        ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillStyle = th.red; ctx.fillText('白露种', CX - 160, CY + 90); ctx.fillText('太旺', CX - 160, CY + 128); ctx.fillStyle = th.gold; ctx.fillText('秋分种', CX, CY + 90); ctx.fillText('正好', CX, CY + 128); ctx.fillStyle = th.red; ctx.fillText('寒露种', CX + 160, CY + 90); ctx.fillText('太弱', CX + 160, CY + 128);
        if (t > wy.s + 1.0) {  // 早播的苗上落霜
          ctx.strokeStyle = '#7FA7C9'; ctx.lineWidth = 3;
          for (let k = 0; k < 6; k++) { const x = CX - 210 + k * 24, y = CY - 140 + ((t * 60 + k * 37) % 80); for (let m = 0; m < 3; m++) { const q = m * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x - 9 * Math.cos(q), y - 9 * Math.sin(q)); ctx.lineTo(x + 9 * Math.cos(q), y + 9 * Math.sin(q)); ctx.stroke(); } }
        }
      }
    }
    // 高中三年的"节气"
    const yA = sceneA * E.seg(t, yo.s + 0.3, yo.s + 0.9);
    if (yA > 0) {
      const segs = [['高一', '打基础', th.gold], ['高二', '拉开差距', th.red], ['高三', '冲刺', th.fg]];
      segs.forEach(([g, task, col], k) => {
        const a = E.ease.out(E.seg(t, yo.s + 1.6 + k * 1.0, yo.s + 2.1 + k * 1.0));
        const a0 = -Math.PI / 2 + (k / 3) * Math.PI * 2 + 0.06, a1 = a0 + (Math.PI * 2 / 3 - 0.12) * a;
        ctx.globalAlpha = yA; ctx.strokeStyle = col; ctx.lineWidth = 28; ctx.lineCap = 'round';
        if (a > 0) { ctx.beginPath(); ctx.arc(CX, CY, R - 40, a0, a1); ctx.stroke(); }
        const am = a0 + (Math.PI * 2 / 3 - 0.12) / 2, tx = CX + 150 * Math.cos(am), ty = CY + 150 * Math.sin(am) + 10;
        ctx.globalAlpha = yA * a; ctx.fillStyle = col; ctx.font = `400 64px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText(g, tx, ty);
        ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.fillText(task, tx, ty + 50);
      });
      // 现在：高一秋
      const nA = E.seg(t, fl.s + 0.3, fl.s + 0.8);
      if (nA > 0) {
        const am = -Math.PI / 2 + 0.5; ctx.globalAlpha = yA * nA; ctx.fillStyle = th.red;
        ctx.beginPath(); ctx.arc(CX + (R - 40) * Math.cos(am), CY + (R - 40) * Math.sin(am), 22 + 4 * Math.sin(t * 6), 0, Math.PI * 2); ctx.fill();
        ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('现在', CX + (R + 10) * Math.cos(am), CY + (R + 10) * Math.sin(am));
      }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('农谚说的是华北冬小麦播种期；各地农时不同', 540, 1640);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '每个阶段，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{都有它该做的事}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.5 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
