// D4《每天多做一道题》每天一点点类 · 极简白风
// 计算：1 道 × 365 = 365 道/年；× 1095 天（三年）= 1095 道；按一本练习册约 300 道题估算 ≈ 3.65 本。每道题约 5 分钟为示意
(function (root) {
  const DAYS = 1095, PER_BOOK = 300;

  const EP = {
    id: 'D4',
    title: '每天多做一道题',
    theme: 'white',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'lofi', bpm: 80, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'three',
    beats: [
      { id: 'hook', min: 3.0, cap: ['每天{多做一道题}，', '能有什么用？'], voice: '每天多做一道题，能有什么用？', mood: 0.3 },
      { id: 'day', min: 3.0, cap: ['一天：1 道，', '大概 {5 分钟}。'], voice: '一天，一道，大概五分钟。', mood: 0.35, sfx: [{ at: 0.5, type: 'tick' }] },
      { id: 'year', min: 3.0, cap: ['一年：{365 道}。'], voice: '一年，三百六十五道。', mood: 0.5, sfx: [{ at: 0.3, type: 'ticks', n: 16, gap: 0.08 }] },
      { id: 'three', min: 4.2, cap: ['高中三年：{1095 道}，', '差不多 [3 本多] 练习册。'], voice: '高中三年，一千零九十五道，差不多三本多练习册。', mood: 0.8, sfx: [{ at: 0.3, type: 'ticks', n: 20, gap: 0.07 }, { at: 2.4, type: 'ding' }] },
      { id: 'flip', min: 3.6, cap: ['一道题改变不了什么，', '{一千道}可以。'], voice: '一道题改变不了什么，一千道可以。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '从今天开始，每天多做一道。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '道题天年高一高二高三练习册本按约估算每格每天分钟多做一从今开始0123456789.×≈',
  };

  // 三年 = 3 个年块，每块 13 列 × 29 行（取前 365 格）
  const COLS = 13, CELL = 20, BW = COLS * CELL, GAP = 50, X0 = 540 - (3 * BW + 2 * GAP) / 2, Y0 = 640;
  const pos = i => { const yr = Math.floor(i / 365), k = i % 365; return { x: X0 + yr * (BW + GAP) + (k % COLS) * CELL, y: Y0 + Math.floor(k / COLS) * CELL }; };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const dy = b('day'), yr = b('year'), tr = b('three');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    let n = 0;
    if (t > dy.s + 0.4) n = 1;
    if (t > yr.s + 0.2) n = Math.round(E.lerp(1, 365, E.ease.inOut(E.seg(t, yr.s + 0.2, yr.s + 1.6))));
    if (t > tr.s + 0.2) n = Math.round(E.lerp(365, DAYS, E.ease.inOut(E.seg(t, tr.s + 0.2, tr.s + 1.8))));
    ctx.save(); ctx.globalAlpha = sceneA;
    ['高一', '高二', '高三'].forEach((s, k) => { ctx.fillStyle = n > k * 365 ? th.fg : th.faint; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(s, X0 + k * (BW + GAP), Y0 - 24); });
    for (let i = 0; i < DAYS; i++) {
      const p = pos(i), on = i < n;
      ctx.fillStyle = on ? (i === n - 1 && t < yr.s + 0.2 ? th.red : th.gold) : th.faint;
      ctx.fillRect(p.x + 2, p.y + 2, CELL - 4, CELL - 4);
    }
    // 第一格放大提示
    const oneA = E.seg(t, dy.s + 0.4, dy.s + 0.8) * (1 - E.seg(t, yr.s, yr.s + 0.3));
    if (oneA > 0) {
      const p = pos(0); ctx.globalAlpha = sceneA * oneA; ctx.strokeStyle = th.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x + CELL / 2, p.y + CELL / 2, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('← 今天这 1 道', p.x + 40, p.y + 22); ctx.globalAlpha = sceneA;
    }
    // 计数
    ctx.fillStyle = th.fg; ctx.font = `900 120px ${th.num}`; ctx.textAlign = 'left'; ctx.fillText(E.fmt(n), X0, 1400);
    const nw = ctx.measureText(E.fmt(n)).width; ctx.font = `700 40px ${th.cap}`; ctx.fillText('道', X0 + nw + 16, 1400);
    // 练习册
    const bA = E.seg(t, tr.s + 1.9, tr.s + 2.4);
    if (bA > 0) {
      const books = DAYS / PER_BOOK;
      for (let k = 0; k < 4; k++) {
        const fill = E.clamp(books - k), x = 560 + k * 110, y = 1280, w = 90, h = 130;
        const a = E.ease.out(E.seg(t, tr.s + 1.9 + k * 0.15, tr.s + 2.3 + k * 0.15));
        ctx.globalAlpha = sceneA * a; ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = th.gold; ctx.fillRect(x, y + h * (1 - fill), w, h * fill);
        ctx.fillStyle = fill > 0.5 ? '#FFFFFF' : th.fg; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('练习册', x + w / 2, y + h / 2 + 8);
      }
      ctx.globalAlpha = sceneA * bA; ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('≈ 3.65 本', 560, 1460);
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('估算：1 道 × 1095 天 = 1095 道；按一本练习册约 300 道题、每道约 5 分钟计', 540, 1640);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '每天，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{多做一道}。', 540, 1030, { theme: th, size: 112, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
