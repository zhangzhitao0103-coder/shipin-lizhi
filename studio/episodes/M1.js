// M1《期末复习：多做题，还是多看书》期末冲刺类 · 信息图风
// 依据：Roediger & Karpicke（2006，Psychological Science）：学生学习短文，读 4 遍（SSSS）vs 读 1 遍 + 自测 3 遍（STTT）
// 5 分钟后回忆：83% vs 71%；1 周后：40% vs 61%（读 3 遍 + 测 1 遍为 78% / 56%，画面未展示）
(function (root) {
  const EP = {
    id: 'M1',
    title: '期末复习多做题还是多看书',
    theme: 'info',
    voice: { sid: 58 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 100, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'week',
    beats: [
      { id: 'hook', min: 3.4, cap: ['期末复习，', '把书{再看一遍}，还是{做一遍题}？'], voice: '期末复习，把书再看一遍，还是做一遍题？', mood: 0.3 },
      { id: 'exp', min: 4.8, cap: ['心理学家做过实验：同一篇文章，', '一组{读 4 遍}，一组{读 1 遍、自测 3 遍}。'], voice: '心理学家做过实验，同一篇文章，一组读四遍，一组读一遍，再自己测三遍。', mood: 0.4 },
      { id: 'now', min: 4.0, cap: ['5 分钟后考：', '读 4 遍的赢了，83% 比 71%。'], voice: '五分钟后考，读四遍的赢了，百分之八十三，比百分之七十一。', mood: 0.5, sfx: [{ at: 0.6, type: 'tick' }] },
      { id: 'week', min: 4.6, cap: ['一周后再考：', '读 4 遍的只剩 [40%]，自测的还有 {61%}。'], voice: '一周后再考，读四遍的只剩百分之四十，自测的还有百分之六十一。', mood: 0.9, sfx: [{ at: 0.6, type: 'riser', dur: 1.4 }, { at: 2.1, type: 'boom' }] },
      { id: 'why', min: 4.4, cap: ['反复读，只是{"觉得"}记住了；', '自己想出来，才是{真的}记住了。'], voice: '反复读，只是觉得记住了。自己想出来，才是真的记住了。', mood: 0.6 },
      { id: 'flip', min: 3.6, cap: ['期末前最后几周，', '少看一遍书，{多做一遍题}。'], voice: '期末前最后几周，少看一遍书，多做一遍题。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '合上书，先考考自己。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '读测读4遍读1遍自测3遍分钟后周后回忆比例实验短文合上书先考考自己学习',
  };

  const GROUPS = [['读 4 遍', ['读', '读', '读', '读'], 83, 40], ['读 1 遍 + 自测 3 遍', ['读', '测', '测', '测'], 71, 61]];

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ex = b('exp'), nw = b('now'), wk = b('week'), wy = b('why');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    const cols = [th.dim, th.gold];
    // 两组的学习方式
    GROUPS.forEach(([name, seq], g) => {
      const y = 600 + g * 150, a = E.seg(t, ex.s + 0.8 + g * 1.2, ex.s + 1.2 + g * 1.2);
      if (a <= 0) return;
      ctx.globalAlpha = sceneA * a;
      ctx.fillStyle = cols[g]; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(name, 140, y);
      seq.forEach((s, k) => {
        const ka = E.seg(t, ex.s + 1.0 + g * 1.2 + k * 0.15, ex.s + 1.3 + g * 1.2 + k * 0.15);
        ctx.globalAlpha = sceneA * ka; ctx.fillStyle = s === '测' ? th.gold : '#3A3A3A';
        ctx.beginPath(); ctx.roundRect(140 + k * 120, y + 24, 104, 64, 12); ctx.fill();
        ctx.fillStyle = s === '测' ? '#111' : th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(s, 192 + k * 120, y + 68);
      });
    });
    // 柱状图：5 分钟后 / 1 周后
    const bars = [['5 分钟后', 2, nw], ['1 周后', 3, wk]];
    const BY = 1500, BH = 520;
    bars.forEach(([label, idx, beat], k) => {
      const a = E.seg(t, beat.s + 0.3, beat.s + 0.7);
      if (a <= 0) return;
      const x0 = 170 + k * 400;
      ctx.globalAlpha = sceneA * a;
      ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(label, x0 + 160, BY + 50);
      GROUPS.forEach((gr, g) => {
        const v = gr[idx], grow = E.ease.out(E.seg(t, beat.s + 0.5 + g * 0.3, beat.s + 1.6 + g * 0.3));
        const h = (BH * v / 100) * grow, x = x0 + g * 170;
        ctx.fillStyle = cols[g]; if (k === 1 && g === 1) { ctx.shadowColor = th.gold; ctx.shadowBlur = 24; }
        ctx.fillRect(x, BY - h, 140, h); ctx.shadowBlur = 0;
        ctx.fillStyle = k === 1 && g === 0 ? th.red : cols[g]; ctx.font = `700 46px ${th.num}`; ctx.fillText(Math.round(v * grow) + '%', x + 70, BY - h - 16);
      });
      ctx.fillStyle = th.faint; ctx.fillRect(x0 - 10, BY, 340, 3);
    });
    // 翻转标注
    const fA = E.seg(t, wy.s + 0.4, wy.s + 0.9);
    if (fA > 0) { ctx.globalAlpha = sceneA * fA; ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('短期赢了，长期输了', 330, BY + 100); ctx.fillStyle = th.gold; ctx.fillText('越往后越占优', 740, BY + 100); }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Roediger & Karpicke（2006）：学习短文后的回忆比例', 540, 1680);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '合上书，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{先考考自己}。', 540, 1030, { theme: th, size: 112, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
