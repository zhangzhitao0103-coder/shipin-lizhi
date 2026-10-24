// H2《从 70 到 100，比从 130 到 145 容易》短板类 · 杂志排版风
// 说明：试卷"基础 / 中档 / 难题"的分值结构为示意（90 / 40 / 20），按"先拿易得分"的顺序对应分数段；各省各科实际不同
(function (root) {
  const SEG = [['基础题', 90, '#1A1A1A'], ['中档题', 40, '#7D776C'], ['难题', 20, '#D7262E']];

  const EP = {
    id: 'H2',
    title: '补弱科最划算',
    theme: 'magazine',
    voice: { sid: 30 },
    capY: 380, capSize: 62,
    music: { style: 'cinema', chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'Em', 'C', 'D'] },
    cover: 'hook',
    beats: [
      { id: 'hook', min: 3.0, cap: ['同样是提分，', '哪个{更容易}？'], voice: '同样是提分，哪个更容易？', mood: 0.35 },
      { id: 'a', min: 4.0, cap: ['一张 150 分的卷子，', '大部分分数在{基础题和中档题}。'], voice: '一张一百五十分的卷子，大部分分数，在基础题和中档题。', mood: 0.45 },
      { id: 'b', min: 3.6, cap: ['考 70 分，丢的多是', '{会但不熟}的基础分、中档分。'], voice: '考七十分，丢的多是会但不熟的基础分、中档分。', mood: 0.5, sfx: [{ at: 0.6, type: 'tick' }] },
      { id: 'c', min: 3.4, cap: ['考 130 分，', '剩下的几乎都是{最难的题}。'], voice: '考一百三十分，剩下的几乎都是最难的题。', mood: 0.55, sfx: [{ at: 0.6, type: 'tick' }] },
      { id: 'd', min: 4.0, cap: ['所以，70 到 100，往往比', '130 到 145 {更快、更稳}。'], voice: '所以，七十到一百，往往比一百三十到一百四十五，更快，更稳。', mood: 0.7, sfx: [{ at: 0.2, type: 'ding' }] },
      { id: 'flip', min: 3.4, cap: ['很多同学只练自己的强科，', '因为{有成就感}。'], voice: '很多同学只练自己的强科，因为有成就感。', mood: 0.4 },
      { id: 'quote', min: 3.6, cap: ['可总分，', '是被{最短的那一科}决定的。'], voice: '可总分，是被最短的那一科决定的。', mood: 0.8, sfx: [{ at: 0.4, type: 'boom' }] },
      { id: 'action', min: 3.0, cap: null, voice: '先把最短的那块板，补上来。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'NO.H提分笔记70→100130145+3015基础题中档题难题示意试卷结构为，各省各科实际不同语数英物化生先把最短的那块板补上来分',
  };

  const BX0 = 140, BX1 = 940, BY = 1010, BH = 70;
  const SX = v => BX0 + (v / 150) * (BX1 - BX0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const red = th.red;
    // 刊头
    ctx.save(); ctx.globalAlpha = E.seg(t, 0, 0.6) * (1 - E.seg(t, b('action').s, b('action').s + 0.4));
    ctx.fillStyle = red; ctx.fillRect(120, 214, 840, 6); ctx.fillStyle = th.fg; ctx.fillRect(120, 226, 840, 1.5);
    ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('NO.H2', 120, 200);
    ctx.font = `900 26px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText('提分笔记', 960, 200);
    ctx.restore();

    // 开头两张卡片：+30 vs +15
    const cA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('a').s, b('a').s + 0.5)) + E.seg(t, b('d').s + 0.1, b('d').s + 0.6) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.4));
    if (cA > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, cA);
      const card = (y, from, to, gain, hard) => {
        ctx.fillStyle = th.fg; ctx.fillRect(120, y - 150, 840, 1.5);
        ctx.font = `700 128px ${th.num}`; ctx.textAlign = 'left'; ctx.fillStyle = th.fg;
        ctx.fillText(from + '→' + to, 120, y);
        ctx.font = `700 96px ${th.num}`; ctx.textAlign = 'right'; ctx.fillStyle = red; ctx.fillText('+' + gain, 960, y);
        ctx.font = `900 30px ${th.cap}`; ctx.fillStyle = th.dim; ctx.textAlign = 'left'; ctx.fillText(hard, 124, y + 56);
      };
      const showTag = t > b('d').s;
      card(820, 70, 100, 30, showTag ? '补基础、补中档：更快、更稳' : '');
      card(1180, 130, 145, 15, showTag ? '攻难题：更慢、更难' : '');
      ctx.restore();
    }

    // 试卷结构条
    const barA = E.seg(t, b('a').s + 0.3, b('a').s + 0.8) * (1 - E.seg(t, b('d').s - 0.1, b('d').s + 0.3));
    if (barA > 0) {
      ctx.save(); ctx.globalAlpha = barA;
      let acc = 0;
      SEG.forEach(([name, v, col], i) => {
        const p = E.ease.out(E.seg(t, b('a').s + 0.5 + i * 0.4, b('a').s + 1.0 + i * 0.4));
        ctx.fillStyle = col; ctx.fillRect(SX(acc), BY, (SX(acc + v) - SX(acc)) * p - 4, BH);
        ctx.globalAlpha = barA * p; ctx.fillStyle = th.fg; ctx.font = `900 32px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillText(name, (SX(acc) + SX(acc + v)) / 2, BY - 24);
        ctx.font = `700 28px ${th.mono}`; ctx.fillStyle = '#F2EEE5'; ctx.fillText(String(v), (SX(acc) + SX(acc + v)) / 2, BY + 46);
        ctx.globalAlpha = barA; acc += v;
      });
      ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'center'; [0, 70, 100, 130, 150].forEach(v => ctx.fillText(String(v), SX(v), BY + BH + 36));
      // 70→100、130→145 区间
      const range = (a, z, y, k, txt) => {
        if (k <= 0) return;
        ctx.globalAlpha = barA * k; ctx.strokeStyle = red; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(SX(a), y); ctx.lineTo(SX(a) + (SX(z) - SX(a)) * k, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(SX(a), y - 16); ctx.lineTo(SX(a), y + 16); ctx.stroke();
        if (k >= 1) { ctx.beginPath(); ctx.moveTo(SX(z), y - 16); ctx.lineTo(SX(z), y + 16); ctx.stroke(); }
        ctx.fillStyle = red; ctx.font = `900 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(txt, (SX(a) + SX(z)) / 2, y + 60);
        ctx.globalAlpha = barA;
      };
      range(70, 100, BY + 150, E.ease.out(E.seg(t, b('b').s + 0.4, b('b').s + 1.2)), '70 → 100：基础 + 中档');
      range(130, 145, BY + 280, E.ease.out(E.seg(t, b('c').s + 0.4, b('c').s + 1.2)), '130 → 145：难题');
      ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('试卷结构为示意，各省各科实际不同', 540, 1690);
      ctx.restore();
    }

    // 木桶
    const ka = E.seg(t, b('flip').s + 0.2, b('flip').s + 0.8) * (1 - 0.8 * E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    if (ka > 0) {
      ctx.save(); ctx.globalAlpha = ka;
      const subj = ['语', '数', '英', '物', '化', '生'], hts = [1, 0.58, 0.95, 0.9, 1, 0.92];
      const cx = 540, bot = 1450, w = 92, H0 = 600;
      const lvl = bot - H0 * 0.58 + 8;
      const wl = E.ease.out(E.seg(t, b('quote').s + 0.4, b('quote').s + 1.4));
      if (wl > 0) { ctx.fillStyle = 'rgba(215,38,46,0.16)'; ctx.fillRect(cx - 3 * w, bot - (bot - lvl) * wl, 6 * w, (bot - lvl) * wl); ctx.fillStyle = red; ctx.fillRect(cx - 3 * w - 20, lvl, 6 * w + 40, 3 * wl); }
      subj.forEach((s, i) => {
        const x = cx - 3 * w + i * w, h = H0 * hts[i];
        const p = E.ease.out(E.seg(t, b('flip').s + 0.3 + i * 0.1, b('flip').s + 0.8 + i * 0.1));
        ctx.strokeStyle = i === 1 && t > b('quote').s ? red : th.fg; ctx.lineWidth = 3;
        ctx.strokeRect(x + 4, bot - h * p, w - 8, h * p);
        ctx.fillStyle = i === 1 && t > b('quote').s ? red : th.fg; ctx.font = `900 40px ${th.cap}`; ctx.textAlign = 'center';
        ctx.globalAlpha = ka * p; ctx.fillText(s, x + w / 2, bot - h * p + 52); ctx.globalAlpha = ka;
      });
      ctx.strokeStyle = th.fg; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - 3 * w - 14, bot + 4); ctx.lineTo(cx + 3 * w + 14, bot + 4); ctx.stroke();
      ctx.restore();
    }

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先把最短的那块板，', 540, 880, { theme: th, size: 80, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '{补上来}。', 540, 1030, { theme: th, size: 120, tt: t - ac.s - 0.7, weight: 900 });
      const u = E.ease.out(E.seg(t, ac.s + 1.3, ac.s + 1.8));
      ctx.save(); ctx.fillStyle = th.red; ctx.fillRect(540 - 180 * u, 1062, 360 * u, 8); ctx.restore();
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
