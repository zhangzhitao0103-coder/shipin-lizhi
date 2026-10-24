// D1《1.01 和 0.99》复利类 · 极简白
// 计算：1.01^30=1.35，0.99^30=0.74；1.01^100=2.70，0.99^100=0.37；1.01^365=37.78，0.99^365=0.0255；两者相差约 1481 倍
(function (root) {
  const up = d => Math.pow(1.01, d), dn = d => Math.pow(0.99, d);

  const EP = {
    id: 'D1',
    title: '1.01和0.99',
    theme: 'white',
    voice: { sid: 40 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 92, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'd365',
    beats: [
      { id: 'hook', min: 3.0, cap: ['1.01 和 0.99，', '只差 {0.02}。'], voice: '一点零一和零点九九，只差零点零二。', mood: 0.3 },
      { id: 'rule', min: 4.0, cap: ['每天多努力一点：{× 1.01}', '每天少努力一点：[× 0.99]'], voice: '每天多努力一点，乘一点零一。每天少努力一点，乘零点九九。', mood: 0.4 },
      { id: 'd30', min: 3.0, cap: ['30 天后：', '{1.35} 和 [0.74]。'], voice: '三十天后，一点三五，和零点七四。', mood: 0.5 },
      { id: 'd100', min: 3.0, cap: ['100 天后：', '{2.70} 和 [0.37]。'], voice: '一百天后，二点七零，和零点三七。', mood: 0.6 },
      { id: 'd365', min: 3.6, cap: ['一年后：', '{37.8} 和 [0.03]。'], voice: '一年后，三十七点八，和零点零三。', mood: 0.85, sfx: [{ at: 0, type: 'riser', dur: 1.8 }, { at: 1.8, type: 'boom' }] },
      { id: 'ratio', min: 3.0, cap: ['相差，', '近 {1500} 倍。'], voice: '相差，将近一千五百倍。', mood: 0.8 },
      { id: 'flip', min: 4.0, cap: ['每天多做一道题、多背五个单词，', '看起来{没什么区别}。'], voice: '每天多做一道题，多背五个单词，看起来没什么区别。', mood: 0.45 },
      { id: 'quote', min: 3.0, cap: ['可时间，', '会把这一点点{放大}。'], voice: '可时间，会把这一点点放大。', mood: 0.8, capY: 880, capSize: 76 },
      { id: 'action', min: 3.2, cap: null, voice: '今天，你是一点零一，还是零点九九？', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第天对数坐标每多少努力一点×.0123456789倍今你是还',
  };

  function dayAt(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('d30').s) return 0;
    if (t < b('d100').s) return 30 * E.ease.inOut(E.seg(t, b('d30').s, b('d30').s + 1.4));
    if (t < b('d365').s) return 30 + 70 * E.ease.inOut(E.seg(t, b('d100').s, b('d100').s + 1.4));
    return 100 + 265 * E.ease.inOut(E.seg(t, b('d365').s, b('d365').s + 1.8));
  }

  const X0 = 170, X1 = 900, Y0 = 980, Y1 = 1460;
  const LY = v => Y1 - ((Math.log10(v) + 2) / 4) * (Y1 - Y0); // 0.01 ~ 100，对数坐标
  const LX = d => X0 + (d / 365) * (X1 - X0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const d = dayAt(t, TL, E);
    const blue = th.gold, red = th.red;
    const endA = 1 - E.seg(t, b('quote').s - 0.2, b('quote').s + 0.3);

    // 两个大数字
    const topA = E.seg(t, 0.1, 0.6) * endA;
    if (topA > 0) {
      ctx.save(); ctx.globalAlpha = topA; ctx.textAlign = 'center';
      const vUp = d > 0 ? up(d) : 1.01, vDn = d > 0 ? dn(d) : 0.99;
      ctx.font = `900 150px ${th.num}`;
      ctx.fillStyle = blue; ctx.fillText(d > 0 ? vUp.toFixed(vUp >= 10 ? 1 : 2) : '1.01', 300, 720);
      ctx.fillStyle = red; ctx.fillText(d > 0 ? vDn.toFixed(2) : '0.99', 780, 720);
      ctx.font = `500 28px ${th.cap}`; ctx.fillStyle = th.dim;
      const ra = E.seg(t, b('rule').s + 0.3, b('rule').s + 0.9);
      ctx.globalAlpha = topA * ra;
      ctx.fillText('每天 × 1.01', 300, 780); ctx.fillText('每天 × 0.99', 780, 780);
      ctx.globalAlpha = topA; ctx.fillStyle = th.faint; ctx.fillRect(539, 600, 2, 200);
      ctx.restore();
    }

    // 对数坐标图
    const ca = E.seg(t, b('d30').s - 0.4, b('d30').s + 0.2) * endA;
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha = ca;
      ctx.font = `400 22px ${th.mono}`; ctx.textAlign = 'right';
      [0.01, 0.1, 1, 10, 100].forEach(v => {
        ctx.strokeStyle = v === 1 ? th.dim : th.faint; ctx.lineWidth = v === 1 ? 2 : 1.5;
        ctx.beginPath(); ctx.moveTo(X0, LY(v)); ctx.lineTo(X1, LY(v)); ctx.stroke();
        ctx.fillStyle = th.dim; ctx.fillText(String(v), X0 - 14, LY(v) + 8);
      });
      ctx.textAlign = 'center'; [0, 100, 200, 300, 365].forEach(v => ctx.fillText(String(v), LX(v), Y1 + 40));
      ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('对数坐标', X0, Y0 - 30);
      ctx.textAlign = 'right'; ctx.fillText('天数 →', X1, Y1 + 80);
      const line = (fn, col) => {
        ctx.beginPath(); for (let i = 0; i <= 100; i++) { const dd = (d * i) / 100; const x = LX(dd), y = LY(fn(dd)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(LX(d), LY(fn(d)), 9, 0, Math.PI * 2); ctx.fill();
      };
      line(up, blue); line(dn, red);
      ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'left';
      ctx.fillStyle = blue; ctx.fillText(up(d).toFixed(2), LX(d) + 16, LY(up(d)) + 8);
      ctx.fillStyle = red; ctx.fillText(dn(d).toFixed(d > 200 ? 3 : 2), LX(d) + 16, LY(dn(d)) + 8);
      ctx.font = `700 30px ${th.cap}`; ctx.fillStyle = th.fg; ctx.textAlign = 'right';
      ctx.fillText('第 ' + Math.round(d) + ' 天', X1, Y0 - 30);
      // 相差倍数
      const rb = b('ratio');
      const rA = E.seg(t, rb.s + 0.2, rb.s + 0.7) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.4));
      if (rA > 0) {
        ctx.globalAlpha = ca * rA; ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(LX(365) - 30, LY(up(365))); ctx.lineTo(LX(365) - 30, LY(dn(365))); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = th.fg; ctx.font = `900 64px ${th.num}`; ctx.textAlign = 'right';
        ctx.textAlign = 'left'; ctx.fillText('相差 ' + Math.round(up(365) / dn(365)) + ' 倍', X0 + 24, LY(0.01) - 24);
      }
      ctx.restore();
    }

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '今天，', 540, 860, { theme: th, size: 80, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(ctx, '你是 {1.01} 还是 [0.99]？', 540, 1000, { theme: th, size: 92, tt: t - ac.s - 0.5, weight: 900 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
