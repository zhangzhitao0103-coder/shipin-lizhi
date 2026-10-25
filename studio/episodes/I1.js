// I1《一个寒假，其实有多少小时？》窗口期类 · 冬日雪景风
// 估算：寒假 30 天 = 720 小时；春节约 7 天不学，剩 23 天 × 每天 6 小时 = 138 小时。
// 一学期数学课：每周 6 节 × 45 分钟 × 18 周 = 81 小时；138 ÷ 81 ≈ 1.7
(function (root) {
  const DAYS = 30, CNY = [16, 22], STUDY = 6, FREE = DAYS - (CNY[1] - CNY[0] + 1), HRS = FREE * STUDY, MATH = (6 * 45 * 18) / 60;

  const EP = {
    id: 'I1',
    title: '一个寒假其实有多少小时',
    theme: 'winter',
    voice: { sid: 30 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Em', 'F', 'G'] },
    cover: 'ratio',
    beats: [
      { id: 'hook', min: 2.8, cap: ['30 天的寒假，', '到底有{多少时间}？'], voice: '三十天的寒假，到底有多少时间？', mood: 0.3 },
      { id: 'total', min: 3.0, cap: ['30 天 × 24 小时，', '一共 {720} 小时。'], voice: '三十天乘二十四小时，一共七百二十小时。', mood: 0.4, sfx: [{ at: 0.4, type: 'ticks', n: 6, gap: 0.1 }] },
      { id: 'minus', min: 3.4, cap: ['去掉春节走亲访友的 7 天，', '还剩 {23} 天。'], voice: '去掉春节走亲访友的七天，还剩二十三天。', mood: 0.45, sfx: [{ at: 0.8, type: 'whoosh' }] },
      { id: 'per', min: 3.2, cap: ['每天认真学 6 小时，', '就是 {138} 小时。'], voice: '每天认真学六小时，就是一百三十八小时。', mood: 0.6, sfx: [{ at: 0.3, type: 'riser', dur: 1.6 }, { at: 1.9, type: 'ding' }] },
      { id: 'compare', min: 3.6, cap: ['一个学期的数学课，', '加起来大约只有 81 小时。'], voice: '一个学期的数学课，加起来大约只有八十一小时。', mood: 0.6 },
      { id: 'ratio', min: 3.0, cap: ['一个寒假，相当于', '{1.7} 个学期的数学课。'], voice: '一个寒假，相当于一点七个学期的数学课。', mood: 0.9, sfx: [{ at: 0.2, type: 'boom' }] },
      { id: 'flip', min: 3.6, cap: ['这么多时间，', '用来[补觉刷剧]，还是用来{超车}？'], voice: '这么多时间，用来补觉刷剧，还是用来超车？', mood: 0.5 },
      { id: 'action', min: 3.2, cap: null, voice: '寒假不长，但足够拉开一个学期。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '寒假天小时春节走亲访友剩一学期数学课约以计不学每周节分钟估算补觉刷剧超车长但足够拉开个相当于0123456789.×=≈',
  };

  const C = 6, P = 135, S = 116, X0 = 540 - (C * P) / 2 + (P - S) / 2, Y0 = 690;
  const cell = i => ({ x: X0 + (i % C) * P, y: Y0 + Math.floor(i / C) * P });
  const isCNY = i => i >= CNY[0] && i <= CNY[1];

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const gold = th.gold, red = th.red;
    const calA = E.seg(t, b('total').s - 0.3, b('total').s + 0.3) * (1 - E.seg(t, b('compare').s - 0.2, b('compare').s + 0.3));

    // 开头：大号 30
    const hA = E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('total').s - 0.3, b('total').s + 0.2));
    if (hA > 0) {
      E.bigNumber(ctx, th, '30', 540, 1080, { size: 380, alpha: hA, color: '#FFFFFF', top: '#FFFFFF', blur: 30 });
      ctx.save(); ctx.globalAlpha = hA; ctx.fillStyle = th.dim; ctx.font = `700 54px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('天 · 寒假', 540, 1190); ctx.restore();
    }
    // 日历
    if (calA > 0) {
      const cnyK = E.ease.out(E.seg(t, b('minus').s + 0.7, b('minus').s + 1.4));
      const fillK = E.seg(t, b('per').s + 0.3, b('per').s + 1.9);
      ctx.save();
      let k = 0;
      for (let i = 0; i < DAYS; i++) {
        const p = cell(i), ap = E.ease.out(E.seg(t, b('total').s - 0.2 + i * 0.03, b('total').s + 0.2 + i * 0.03));
        ctx.globalAlpha = calA * ap;
        const cn = isCNY(i);
        ctx.fillStyle = cn ? `rgba(255,106,92,${0.15 + 0.55 * cnyK})` : 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = cn && cnyK > 0 ? red : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, S, S, 14); ctx.fill(); ctx.stroke();
        ctx.fillStyle = th.fg; ctx.font = `500 26px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText(String(i + 1), p.x + 12, p.y + 34);
        if (cn && cnyK > 0) { ctx.globalAlpha = calA * ap * cnyK; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE9B8'; ctx.fillText('春', p.x + S / 2, p.y + 84); }
        // 学习时长：6 根小柱
        if (!cn) {
          const f = E.clamp(fillK * FREE - k); k++;
          for (let h = 0; h < STUDY; h++) {
            const hk = E.clamp(f * STUDY - h); if (hk <= 0) continue;
            ctx.globalAlpha = calA * ap * hk; ctx.fillStyle = gold;
            ctx.fillRect(p.x + 14 + h * 15, p.y + S - 16 - 44 * hk, 11, 44 * hk);
          }
        }
      }
      // 计数
      ctx.globalAlpha = calA; ctx.textAlign = 'center';
      const showHrs = t < b('per').s ? 720 : Math.round(HRS * E.ease.inOut(fillK));
      ctx.font = `700 70px ${th.num}`; ctx.fillStyle = t < b('per').s ? th.fg : gold; ctx.shadowColor = gold; ctx.shadowBlur = t < b('per').s ? 0 : 20;
      ctx.fillText(showHrs + (t < b('per').s ? ' 小时' : ' 小时可学'), 540, Y0 + 5 * P + 90);
      ctx.restore();
    }
    // 对比条
    const cmA = E.seg(t, b('compare').s + 0.1, b('compare').s + 0.6) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.4));
    if (cmA > 0) {
      ctx.save(); ctx.globalAlpha = cmA;
      const x0 = 160, wMax = 760, k = wMax / HRS;
      const bar = (y, v, lab, col, s0) => {
        const p = E.ease.out(E.seg(t, s0, s0 + 0.9));
        ctx.fillStyle = th.fg; ctx.font = `700 36px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(lab, x0, y - 24);
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = col === gold ? 24 : 0;
        ctx.beginPath(); ctx.roundRect(x0, y, Math.max(8, v * k * p), 70, 12); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = col === gold ? '#2A1C00' : '#0B1C36'; ctx.font = `700 40px ${th.mono}`; ctx.fillText(Math.round(v * p) + ' h', x0 + 20, y + 50);
      };
      bar(860, HRS, '寒假（23 天 × 6 小时）', gold, b('compare').s - 0.2);
      bar(1080, MATH, '一学期数学课（估算）', '#DCE8FA', b('compare').s + 0.6);
      const rA = E.seg(t, b('ratio').s + 0.1, b('ratio').s + 0.6);
      if (rA > 0) E.bigNumber(ctx, th, '× 1.7', 540, 1420, { size: 150, alpha: cmA * rA });
      ctx.restore();
    }
    // 两个选择
    const fl = b('flip');
    const fA = E.seg(t, fl.s + 0.3, fl.s + 0.8) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (fA > 0) {
      ctx.save();
      const card = (x, txt, col, s0) => { const a = fA * E.seg(t, s0, s0 + 0.4); E.glassCard(ctx, x - 190, 860, 380, 300, a, 28); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = `700 64px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(txt, x, 1032); };
      card(300, '补觉刷剧', th.dim, fl.s + 0.4); card(780, '超车', gold, fl.s + 1.6);
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, b('minus').s, b('minus').s + 0.5) * (1 - E.seg(t, b('action').s, b('action').s + 0.4)); ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('以寒假 30 天计，春节约 7 天不学，每天学 6 小时；', 540, 1640);
    ctx.fillText('数学课按每周 6 节 × 45 分钟 × 18 周估算', 540, 1672); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '寒假不长，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '但足够{拉开一个学期}。', 540, 1030, { theme: th, size: 92, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
