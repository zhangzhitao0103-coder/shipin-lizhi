// B4《化学反应为什么需要"点火"》迈出第一步类 · 黑板粉笔风
// 化学锚点：氢气与氧气混合，常温下几乎不反应，点燃即发生爆鸣（必修课程实验）；反应物须先越过能垒（活化能）
// 催化剂降低活化能，不改变反应前后的能量差。曲线为示意
(function (root) {
  const R = 0.52, P = 0.16;  // 反应物、生成物能量（相对值）
  const curve = (x, peak) => {
    const base = R + (P - R) * (x < 0.3 ? 0 : x > 0.7 ? 1 : (1 - Math.cos(Math.PI * (x - 0.3) / 0.4)) / 2);
    return base + (peak - (R + P) / 2) * Math.exp(-Math.pow((x - 0.5) / 0.1, 2));
  };
  const PEAK = 0.95, PEAK_CAT = 0.66;

  const EP = {
    id: 'B4',
    title: '化学反应为什么需要点火',
    theme: 'chalk',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'cat',
    beats: [
      { id: 'hook', min: 3.4, cap: ['氢气和氧气混在一起，', '常温下{几乎不反应}。'], voice: '氢气和氧气混在一起，常温下，几乎不反应。', mood: 0.3 },
      { id: 'spark', min: 2.6, cap: ['可一个火花，', '它就[爆鸣]了。'], voice: '可一个火花，它就爆鸣了。', mood: 0.9, sfx: [{ at: 0.5, type: 'boom' }] },
      { id: 'curve', min: 4.4, cap: ['因为反应前，要先翻过一座山：', '化学上叫{活化能}。'], voice: '因为反应前，要先翻过一座山，化学上叫活化能。', mood: 0.45 },
      { id: 'stuck', min: 3.6, cap: ['翻不过去，', '就一直[停在原地]。'], voice: '翻不过去，就一直停在原地。', mood: 0.4 },
      { id: 'cat', min: 4.4, cap: ['催化剂不改变终点，', '只是把这座山{变矮了}。'], voice: '催化剂不改变终点，只是把这座山，变矮了。', mood: 0.75, sfx: [{ at: 1.6, type: 'whoosh' }, { at: 2.8, type: 'ding' }] },
      { id: 'flip', min: 4.0, cap: ['学习也一样：开始总有一道坎，', '好方法，就是你的{催化剂}。'], voice: '学习也一样，开始总有一道坎。好方法，就是你的催化剂。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '先跨过那道坎，后面会越来越顺。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '+能量反应进程反应物生成物活化能催化剂开始的坎好方法示意图降低不改变前后差点火爆鸣先跨过那道后面越来顺H₂O₂2',
  };

  const X0 = 170, X1 = 920, YB = 1450, YT = 700;
  const PX = x => X0 + x * (X1 - X0), PY = e => YB - e * (YB - YT);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sp = b('spark'), cv = b('curve'), st = b('stuck'), ct = b('cat'), fl = b('flip');
    // 开头：分子漂浮 → 火花爆鸣
    const mA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, cv.s - 0.1, cv.s + 0.4));
    if (mA > 0) {
      const boom = E.seg(t, sp.s + 0.5, sp.s + 0.9);
      const r = E.rng(9); ctx.save();
      for (let i = 0; i < 14; i++) {
        const isH = i % 3 !== 0, x0 = 220 + r() * 640, y0 = 720 + r() * 640, ph = r() * 6.28;
        const out = boom * (220 + r() * 200), ang = Math.atan2(y0 - 1040, x0 - 540);
        const x = x0 + Math.sin(t * 0.8 + ph) * 26 + Math.cos(ang) * out, y = y0 + Math.cos(t * 0.6 + ph) * 22 + Math.sin(ang) * out;
        ctx.globalAlpha = mA * (1 - boom);
        const col = isH ? th.fg : th.blue, rr = isH ? 18 : 26;
        E.chalkLine(ctx, Array.from({ length: 25 }, (_, k) => [x - rr * 0.55 + rr * Math.cos(k / 24 * 6.283), y + rr * Math.sin(k / 24 * 6.283)]), col, 3, i * 3 + 1, 1);
        E.chalkLine(ctx, Array.from({ length: 25 }, (_, k) => [x + rr * 0.55 + rr * Math.cos(k / 24 * 6.283), y + rr * Math.sin(k / 24 * 6.283)]), col, 3, i * 3 + 2, 1);
        ctx.fillStyle = col; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(isH ? 'H₂' : 'O₂', x, y + rr + 34);
      }
      // 火花
      const fA = E.seg(t, sp.s + 0.2, sp.s + 0.5) * (1 - E.seg(t, sp.s + 0.9, sp.s + 1.8));
      if (fA > 0) {
        ctx.globalAlpha = mA * fA; ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(540, 1040, 0, 540, 1040, 160 + 500 * boom);
        g.addColorStop(0, 'rgba(255,240,180,0.95)'); g.addColorStop(0.3, 'rgba(255,170,90,0.5)'); g.addColorStop(1, 'rgba(255,120,60,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 500, 1080, 1100);
        ctx.globalCompositeOperation = 'source-over';
      }
      // 爆鸣之后：生成水
      const wA = E.seg(t, sp.s + 1.0, sp.s + 1.5);
      if (wA > 0) { ctx.globalAlpha = mA * wA; ctx.fillStyle = th.fg; ctx.font = `700 76px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('2H₂ + O₂ → 2H₂O', 540, 1060); }
      ctx.restore();
    }
    // 能量曲线
    const sceneA = E.seg(t, cv.s + 0.2, cv.s + 0.7) * (1 - 0.88 * E.seg(t, fl.s + 1.6, fl.s + 2.2)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      E.chalkLine(ctx, [[X0, YT - 40], [X0, YB]], th.fg, 4, 1, 1);
      E.chalkLine(ctx, [[X0, YB], [X1 + 30, YB]], th.fg, 4, 2, 1);
      ctx.fillStyle = th.dim; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('能量', X0 - 10, YT - 60);
      ctx.textAlign = 'right'; ctx.fillText('反应进程 →', X1 + 30, YB + 50);
      const pts = []; for (let i = 0; i <= 80; i++) { const x = i / 80; pts.push([PX(x), PY(curve(x, PEAK))]); }
      E.chalkLine(ctx, pts, th.fg, 6, 7, E.ease.inOut(E.seg(t, cv.s + 0.3, cv.s + 1.8)));
      const lA = E.seg(t, cv.s + 1.6, cv.s + 2.0);
      ctx.globalAlpha = sceneA * lA; ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('反应物', PX(0.12), PY(R) + 56); ctx.fillText('生成物', PX(0.88), PY(P) - 34);
      // 活化能标注
      const eA = E.seg(t, cv.s + 2.2, cv.s + 2.7);
      if (eA > 0) {
        ctx.globalAlpha = sceneA * eA;
        E.chalkLine(ctx, [[PX(0.2), PY(R)], [PX(0.58), PY(R)]], th.dim, 2, 11, 1);
        E.chalkLine(ctx, [[PX(0.56), PY(R) - 8], [PX(0.56), PY(PEAK) + 14]], th.gold, 4, 12, 1);
        E.chalkLine(ctx, [[PX(0.56) - 14, PY(PEAK) + 34], [PX(0.56), PY(PEAK) + 12], [PX(0.56) + 14, PY(PEAK) + 34]], th.gold, 4, 13, 1);
        ctx.fillStyle = th.gold; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('活化能', PX(0.6), PY((R + PEAK) / 2) + 10);
      }
      // 催化剂：更矮的虚线山
      const cA = E.seg(t, ct.s + 0.8, ct.s + 1.6);
      if (cA > 0) {
        ctx.globalAlpha = sceneA * cA; ctx.setLineDash([16, 12]);
        const cp = []; for (let i = 0; i <= 80; i++) { const x = i / 80; cp.push([PX(x), PY(curve(x, PEAK_CAT))]); }
        E.chalkLine(ctx, cp, th.gold, 5, 21, E.ease.inOut(cA)); ctx.setLineDash([]);
        ctx.fillStyle = th.gold; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText(t > fl.s + 0.6 ? '好方法' : '加催化剂', PX(0.3), PY(PEAK_CAT) - 10);
      }
      // 小球
      let bx = 0.13;
      if (t > st.s) bx = 0.13 + 0.27 * Math.pow(Math.sin(Math.PI * E.seg(t, st.s + 0.3, st.e) * 2), 2) * (1 - E.seg(t, st.e - 0.1, st.e));
      if (t > ct.s + 1.8) bx = 0.13 + 0.77 * E.ease.inOut(E.seg(t, ct.s + 1.8, ct.s + 3.2));
      const useCat = t > ct.s + 1.8, by = curve(bx, useCat ? PEAK_CAT : PEAK);
      const ballA = E.seg(t, cv.s + 1.6, cv.s + 2.0);
      ctx.globalAlpha = sceneA * ballA; ctx.fillStyle = th.red; ctx.shadowColor = th.red; ctx.shadowBlur = 20 * th.glow + 6;
      ctx.beginPath(); ctx.arc(PX(bx), PY(by) - 22, 20, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      // 翻转标注
      const fA = E.seg(t, fl.s + 0.4, fl.s + 0.9);
      if (fA > 0) {
        ctx.globalAlpha = sceneA * fA; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center';
        ctx.fillStyle = th.red; ctx.fillText('开始的坎', PX(0.5), PY(PEAK) - 30);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('示意图：催化剂降低活化能，不改变反应前后的能量差', 540, 1600);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先跨过那道坎，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '后面{越来越顺}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
