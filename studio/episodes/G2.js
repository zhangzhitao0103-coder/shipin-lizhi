// G2《寒假你进步了，名次为什么没变？》竞争类 · 黑板粉笔风
// 物理锚点：相对速度 v相对 = v你 − v他；速度相同则距离不变。引文：《爱丽丝镜中奇遇》红皇后
(function (root) {
  const EP = {
    id: 'G2',
    title: '寒假你进步了名次为什么没变',
    theme: 'chalk',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 100, chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D', 'G', 'C', 'D', 'G'] },
    cover: 'same',
    beats: [
      { id: 'hook', min: 3.0, cap: ['寒假你明明进步了，', '开学名次却{没变}？'], voice: '寒假你明明进步了，开学名次却没变？', mood: 0.35 },
      { id: 'frame', min: 2.8, cap: ['物理课学过：', '运动是{相对}的。'], voice: '物理课学过，运动是相对的。', mood: 0.4 },
      { id: 'same', min: 4.4, cap: ['你每天跑 5 公里，前面的人也跑 5 公里：', '你们的距离，[一点没变]。'], voice: '你每天跑五公里，前面的人也跑五公里，你们的距离，一点没变。', mood: 0.5 },
      { id: 'faster', min: 3.4, cap: ['只有比他{快一点}，', '距离才会缩短。'], voice: '只有比他快一点，距离才会缩短。', mood: 0.7, sfx: [{ at: 0.5, type: 'riser', dur: 2.0 }] },
      { id: 'queen', min: 4.4, cap: ['《爱丽丝镜中奇遇》里说：', '“你必须拼命奔跑，才能{留在原地}。”'], voice: '爱丽丝镜中奇遇里说，你必须拼命奔跑，才能留在原地。', mood: 0.6 },
      { id: 'flip', min: 3.6, cap: ['寒假，所有人都在跑；', '想往前，就得{跑得比他们快}。'], voice: '寒假，所有人都在跑。想往前，就得跑得比他们快。', mood: 0.8 },
      { id: 'action', min: 2.8, cap: null, voice: '不只要进步，还要进步得更快。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '你他前面的同学相距米v相对=−公里天每0123456789不只要进步还得更快',
  };

  const TRACK = 1150;
  function runner(ctx, x, col, t, label, th, E, seed) {
    const ph = t * 9 + seed, y = TRACK;
    E.chalkLine(ctx, [[x, y - 150], [x, y - 70]], col, 6, seed + 1, 1);
    E.chalkLine(ctx, [[x, y - 70], [x + Math.sin(ph) * 30, y]], col, 6, seed + 2, 1);
    E.chalkLine(ctx, [[x, y - 70], [x - Math.sin(ph) * 30, y]], col, 6, seed + 3, 1);
    E.chalkLine(ctx, [[x, y - 130], [x + Math.cos(ph) * 34, y - 90]], col, 5, seed + 4, 1);
    E.chalkLine(ctx, [[x, y - 130], [x - Math.cos(ph) * 34, y - 90]], col, 5, seed + 5, 1);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 175, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = col; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 56); ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.88 * E.seg(t, b('queen').s - 0.1, b('queen').s + 0.4) + 0.6 * E.seg(t, b('flip').s, b('flip').s + 0.5)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const fs = b('faster');
    // 距离：50 米，"更快"阶段缩到 20 米
    const gap = 50 - 30 * E.ease.inOut(E.seg(t, fs.s + 0.5, fs.e + 1.5));
    const run = t > b('same').s ? 1 : 0;
    const scroll = run * (t - b('same').s) * 160;
    ctx.save(); ctx.globalAlpha = sceneA;
    // 跑道与移动的刻度（表示两人都在向前跑）
    E.chalkLine(ctx, [[60, TRACK], [1020, TRACK]], th.fg, 4, 7, 1);
    ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'center';
    for (let k = -2; k < 14; k++) { const x = ((k * 100 - scroll) % 1400 + 1400) % 1400 - 100; ctx.fillRect(x, TRACK + 6, 3, 18); }
    const xHim = 760, xYou = xHim - gap * 8;
    runner(ctx, xYou, th.gold, run ? t : 0, '你', th, E, 10);
    runner(ctx, xHim, th.fg, run ? t : 0, '前面的同学', th, E, 30);
    // 距离标注
    E.chalkLine(ctx, [[xYou, TRACK - 260], [xHim, TRACK - 260]], th.red, 4, 41, 1);
    E.chalkLine(ctx, [[xYou, TRACK - 280], [xYou, TRACK - 240]], th.red, 4, 42, 1); E.chalkLine(ctx, [[xHim, TRACK - 280], [xHim, TRACK - 240]], th.red, 4, 43, 1);
    ctx.fillStyle = th.red; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('相距 ' + Math.round(gap) + ' 米', (xYou + xHim) / 2, TRACK - 290);
    // 相对速度公式
    const fa = E.seg(t, b('same').s + 0.6, b('same').s + 1.2);
    if (fa > 0) {
      const faster = t > fs.s + 0.4;
      ctx.globalAlpha = sceneA * fa; ctx.fillStyle = th.fg; ctx.font = `700 48px ${th.cap}`;
      ctx.fillText('v相对 = v你 − v他', 540, 660);
      ctx.fillStyle = faster ? th.gold : th.red; ctx.font = `700 56px ${th.cap}`;
      ctx.fillText(faster ? '6 − 5 = 1  →  追近' : '5 − 5 = 0  →  原地', 540, 750);
    }
    ctx.restore();
    // 红皇后
    const q = b('queen');
    const qA = E.seg(t, q.s + 0.3, q.s + 0.8) * (1 - E.seg(t, b('flip').s - 0.1, b('flip').s + 0.3));
    if (qA > 0) {
      ctx.save(); ctx.globalAlpha = qA;
      const cx = 540, cy = 980;
      E.chalkLine(ctx, [[cx - 90, cy + 40], [cx - 90, cy - 30], [cx - 45, cy + 5], [cx, cy - 50], [cx + 45, cy + 5], [cx + 90, cy - 30], [cx + 90, cy + 40], [cx - 90, cy + 40]], th.gold, 6, 61, E.seg(t, q.s + 0.3, q.s + 1.4));
      ctx.fillStyle = th.dim; ctx.font = `500 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('红皇后', cx, cy + 100);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '不只要进步，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '还要{进步得更快}。', 540, 1030, { theme: th, size: 100, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
