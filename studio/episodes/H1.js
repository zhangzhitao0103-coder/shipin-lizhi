// H1《你的总分，被哪一科拖住了？》短板类 · 复古报纸风
// 示例成绩（新高考 3+1+2，满分 750）：语 120、数 75、英 125、物 80、化 82、生 85，共 567；
// 数学 75→105 总分 +30；其余 5 科要凑同样 30 分，每科得提 6 分
(function (root) {
  const SUB = [['语文', 120, 150], ['数学', 75, 150], ['英语', 125, 150], ['物理', 80, 100], ['化学', 82, 100], ['生物', 85, 100]];

  const EP = {
    id: 'H1',
    title: '你的总分被哪一科拖住了',
    theme: 'newsprint',
    voice: { sid: 50 },
    capY: 380, capSize: 62,
    music: { style: 'cinema', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'calc',
    beats: [
      { id: 'hook', min: 3.2, cap: ['同样多花一个月，', '补哪一科，{总分涨得最多}？'], voice: '同样多花一个月，补哪一科，总分涨得最多？', mood: 0.35 },
      { id: 'show', min: 4.4, cap: ['语文 120，英语 125，物化生都在 80 分上下，', '数学只有 [75]。'], voice: '语文一百二十，英语一百二十五，物化生都在八十分上下，数学只有七十五。', mood: 0.45 },
      { id: 'barrel', min: 3.4, cap: ['就像一只木桶：', '能装多少水，看{最短的那块板}。'], voice: '就像一只木桶，能装多少水，看最短的那块板。', mood: 0.5 },
      { id: 'calc', min: 3.2, cap: ['数学从 75 补到 105：', '总分直接 {+30}。'], voice: '数学从七十五补到一百零五，总分直接加三十。', mood: 0.8, sfx: [{ at: 0.4, type: 'riser', dur: 1.4 }, { at: 1.8, type: 'boom' }] },
      { id: 'compare', min: 3.6, cap: ['而其他科想凑出同样的 30 分，', '得每科都[挤出 6 分]。'], voice: '而其他科想凑出同样的三十分，得每科都挤出六分。', mood: 0.6, sfx: [{ at: 0.6, type: 'ticks', n: 5, gap: 0.2 }] },
      { id: 'flip', min: 2.8, cap: ['补弱科，', '是{性价比最高}的提分。'], voice: '补弱科，是性价比最高的提分。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '先找到你的短板，再对症去补。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '语文数学英语物理化学生物总分满分示例成绩新高考模式先找到你的短板再对症去补高中周报0123456789+',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const red = th.red;
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    const calcK = E.ease.inOut(E.seg(t, b('calc').s + 0.3, b('calc').s + 1.5));
    const total = SUB.reduce((s, x) => s + x[1], 0) + 30 * calcK;
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 总分大标题
      ctx.textAlign = 'left'; ctx.fillStyle = th.dim; ctx.font = `700 28px ${th.cap}`; ctx.fillText('总分', 120, 560);
      ctx.fillStyle = th.fg; ctx.font = `900 130px ${th.num}`; ctx.fillText(String(Math.round(total)), 120, 690);
      ctx.font = `500 30px ${th.cap}`; ctx.fillStyle = th.dim; ctx.fillText('/ 750', 450, 690);
      if (calcK > 0) { ctx.fillStyle = red; ctx.font = `900 80px ${th.num}`; ctx.textAlign = 'right'; ctx.globalAlpha = sceneA * calcK; ctx.fillText('+30', 960, 680); ctx.globalAlpha = sceneA; }
      // 木桶式竖条：按得分率画高度
      const barrel = E.seg(t, b('barrel').s + 0.2, b('barrel').s + 0.8);
      const base = 1500, Hmax = 620, w = 120, x0 = 540 - 3 * (w + 16) + 8;
      SUB.forEach(([n, v, full], i) => {
        const ap = E.ease.out(E.seg(t, b('show').s + 0.2 + i * 0.25, b('show').s + 0.7 + i * 0.25));
        const vv = i === 1 ? v + 30 * calcK : v;
        const cmpK = E.seg(t, b('compare').s + 0.6 + (i > 1 ? i - 1 : i) * 0.2, b('compare').s + 0.9 + (i > 1 ? i - 1 : i) * 0.2);
        const h = (vv / full) * Hmax * ap, x = x0 + i * (w + 16);
        ctx.fillStyle = i === 1 ? red : th.fg; ctx.globalAlpha = sceneA * (i === 1 ? 1 : 0.85);
        ctx.fillRect(x, base - h, w, h);
        // 木桶的箍
        if (barrel > 0) { ctx.globalAlpha = sceneA * barrel * 0.5; ctx.fillStyle = th.bg; ctx.fillRect(x, base - h * 0.3, w, 6); ctx.fillRect(x, base - h * 0.7, w, 6); }
        ctx.globalAlpha = sceneA; ctx.fillStyle = th.fg; ctx.font = `900 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(n, x + w / 2, base + 46);
        ctx.font = `700 30px ${th.mono}`; ctx.fillStyle = i === 1 ? red : th.fg; ctx.fillText(String(Math.round(vv)), x + w / 2, base - h - 16);
        if (cmpK > 0 && i !== 1) { ctx.globalAlpha = sceneA * cmpK; ctx.fillStyle = red; ctx.font = `700 28px ${th.mono}`; ctx.fillText('+6?', x + w / 2, base - h - 56); ctx.globalAlpha = sceneA; }
      });
      // 水位线：最短的板
      if (barrel > 0) {
        const lvl = base - (Math.min(...SUB.map(([, v, f], i) => (i === 1 ? v + 30 * calcK : v) / f))) * Hmax;
        ctx.globalAlpha = sceneA * barrel; ctx.fillStyle = 'rgba(181,18,27,0.12)'; ctx.fillRect(x0 - 10, lvl, 6 * (w + 16) + 4, base - lvl);
        ctx.strokeStyle = red; ctx.lineWidth = 3; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(x0 - 20, lvl); ctx.lineTo(x0 + 6 * (w + 16) + 4, lvl); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `500 21px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('示例成绩；新高考 3+1+2 模式，满分 750；柱高为得分率', 540, 1680);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先找到你的短板，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{再对症去补}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
