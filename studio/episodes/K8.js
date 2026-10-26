// K8《孩子不听你说什么，看你做什么》家长类 · 暖色温情风
// 依据：班杜拉"波波玩偶"实验（Bandura, Ross & Ross, 1961）：看过成人攻击玩偶的儿童，会模仿同样的行为（观察学习）
(function (root) {
  const EP = {
    id: 'K8',
    title: '孩子看你做什么',
    theme: 'warm',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'E', 'F', 'C', 'G', 'C'] },
    cover: 'law',
    beats: [
      { id: 'hook', min: 3.0, cap: ['你在刷手机，', '却让孩子{专心学习}？'], voice: '你在刷手机，却让孩子专心学习？', mood: 0.3 },
      { id: 'study', min: 3.2, cap: ['1961 年，心理学家班杜拉', '做了一个著名的实验。'], voice: '一九六一年，心理学家班杜拉，做了一个著名的实验。', mood: 0.4 },
      { id: 'adult', min: 3.6, cap: ['孩子们看着一个大人，', '对着一个充气玩偶[又打又踢]。'], voice: '孩子们看着一个大人，对着一个充气玩偶，又打又踢。', mood: 0.5, sfx: [{ at: 1.0, type: 'tick' }, { at: 1.6, type: 'tick' }] },
      { id: 'copy', min: 3.8, cap: ['轮到孩子们自己玩时，', '他们[学着大人的样子]，也去打玩偶。'], voice: '轮到孩子们自己玩的时候，他们学着大人的样子，也去打玩偶。', mood: 0.6, sfx: [{ at: 1.2, type: 'tick' }, { at: 1.8, type: 'tick' }] },
      { id: 'law', min: 3.6, cap: ['孩子学到的，不是大人{说了什么}，', '是大人{做了什么}。'], voice: '孩子学到的，不是大人说了什么，是大人做了什么。', mood: 0.8, sfx: [{ at: 0.3, type: 'ding' }] },
      { id: 'flip', min: 3.0, cap: ['想让孩子放下手机，', '先放下{自己的手机}。'], voice: '想让孩子放下手机，先放下自己的手机。', mood: 0.6 },
      { id: 'tip', min: 3.8, cap: ['孩子学习的时候，你在旁边看书，', '比说十句“快去学”{更管用}。'], voice: '孩子学习的时候，你在旁边看书，比说十句快去学，更管用。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '最好的教育，是做给孩子看。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '班杜拉波波玩偶实验年最好的教育是做给孩子看快去学',
  };

  const FLOOR = 1300;
  function person(ctx, x, h, col, armA) {
    const s = h / 260;
    ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col;
    ctx.beginPath(); ctx.arc(x, FLOOR - h - 34 * s, 34 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x - 34 * s, FLOOR - h, 68 * s, h - 70 * s, 24 * s); ctx.fill();
    ctx.lineWidth = 16 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 14 * s, FLOOR - 72 * s); ctx.lineTo(x - 18 * s, FLOOR); ctx.moveTo(x + 14 * s, FLOOR - 72 * s); ctx.lineTo(x + 18 * s, FLOOR); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, FLOOR - h + 40 * s); ctx.lineTo(x + Math.cos(armA) * 100 * s, FLOOR - h + 40 * s + Math.sin(armA) * 100 * s); ctx.stroke();
    ctx.restore();
  }
  function bobo(ctx, x, tilt, th) {
    ctx.save(); ctx.translate(x, FLOOR); ctx.rotate(tilt);
    ctx.fillStyle = '#FFD9A0'; ctx.beginPath(); ctx.ellipse(0, -90, 62, 90, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF8A7A'; ctx.beginPath(); ctx.arc(0, -200, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E1426'; ctx.beginPath(); ctx.arc(-14, -206, 5, 0, Math.PI * 2); ctx.arc(14, -206, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const labA = E.seg(t, b('study').s, b('study').s + 0.5) * (1 - E.seg(t, b('law').s + 0.6, b('law').s + 1.2));
    const homeA = (E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('study').s - 0.2, b('study').s + 0.3))) + E.seg(t, b('law').s + 0.8, b('law').s + 1.4) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.4) * 0.85);
    // 实验场景
    if (labA > 0) {
      ctx.save(); ctx.globalAlpha = labA;
      ctx.strokeStyle = 'rgba(255,226,184,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(120, FLOOR); ctx.lineTo(960, FLOOR); ctx.stroke();
      const ad = b('adult'), cp = b('copy');
      const hitA = t > ad.s && t < cp.s ? Math.max(0, Math.sin((t - ad.s) * 6)) : 0;
      const hitC = t > cp.s ? Math.max(0, Math.sin((t - cp.s) * 6)) : 0;
      bobo(ctx, 600, -0.35 * (hitA + hitC) * (t < b('law').s ? 1 : 0), th);
      const adultIn = t < cp.s ? 1 : 1 - E.seg(t, cp.s, cp.s + 0.5);
      if (adultIn > 0) { ctx.globalAlpha = labA * adultIn; person(ctx, 440, 300, '#FFB27A', -0.2 + 0.5 * hitA); }
      // 旁观的孩子 → 轮到孩子
      const kx = E.lerp(840, 440, E.ease.inOut(E.seg(t, cp.s + 0.2, cp.s + 1.0)));
      ctx.globalAlpha = labA; person(ctx, kx, 200, '#FFE2B8', t > cp.s + 1.0 ? -0.2 + 0.5 * hitC : Math.PI * 0.75);
      ctx.restore();
    }
    // 家里：手机 → 书本
    if (homeA > 0) {
      const book = t > b('flip').s + 0.6;
      const k = E.ease.inOut(E.seg(t, b('flip').s + 0.6, b('flip').s + 1.4));
      ctx.save(); ctx.globalAlpha = Math.min(1, homeA);
      ctx.fillStyle = 'rgba(255,226,184,0.16)'; ctx.fillRect(160, 1120, 760, 24);
      person(ctx, 360, 290, '#FFB27A', 0.4); person(ctx, 720, 210, '#FFE2B8', 0.4);
      const item = (x, y, isBook) => {
        if (isBook) { ctx.fillStyle = '#FFF1D6'; ctx.fillRect(x - 46, y - 30, 92, 60); ctx.strokeStyle = '#C0613F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, y + 30); ctx.stroke(); }
        else { ctx.fillStyle = '#9FD6FF'; ctx.shadowColor = '#9FD6FF'; ctx.shadowBlur = 30; ctx.fillRect(x - 22, y - 38, 44, 76); ctx.shadowBlur = 0; }
      };
      ctx.globalAlpha = Math.min(1, homeA) * (book ? k : 1); item(440, 1040, book); item(780, 1110, book);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '最好的教育，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '是{做给孩子看}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
