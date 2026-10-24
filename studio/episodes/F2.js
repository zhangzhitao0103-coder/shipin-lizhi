// F2《努力是一个向量》方法类 · 蓝图工程风
// 数学锚点：有效分量 = |F|·cosθ。cos30° ≈ 0.87，cos60° = 0.5，cos90° = 0
(function (root) {
  const OX = 220, OY = 1180, LEN = 540;
  const rad = d => (d * Math.PI) / 180;

  const EP = {
    id: 'F2',
    title: '努力是一个向量',
    theme: 'blueprint',
    voice: { sid: 100 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 96, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'a60',
    beats: [
      { id: 'hook', min: 3.2, cap: ['同样努力 100 分，', '为什么结果{差这么多}？'], voice: '同样努力一百分，为什么结果差这么多？', mood: 0.35 },
      { id: 'vec', min: 3.6, cap: ['物理课学过：', '力是{向量}，有大小，也有方向。'], voice: '物理课学过，力是向量，有大小，也有方向。', mood: 0.4 },
      { id: 'proj', min: 3.6, cap: ['真正推你向前的，', '只有{目标方向上的分量}。'], voice: '真正推你向前的，只有目标方向上的分量。', mood: 0.5 },
      { id: 'a30', min: 2.8, cap: ['方向偏 30°，', '只剩 {87%}。'], voice: '方向偏三十度，只剩百分之八十七。', mood: 0.55, sfx: [{ at: 0.3, type: 'tick' }] },
      { id: 'a60', min: 2.6, cap: ['偏 60°，', '只剩 [一半]。'], voice: '偏六十度，只剩一半。', mood: 0.65, sfx: [{ at: 0.3, type: 'tick' }] },
      { id: 'a90', min: 3.0, cap: ['偏 90°，', '再努力，也是 [0]。'], voice: '偏九十度，再努力，也是零。', mood: 0.8, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'flip', min: 3.8, cap: ['刷错了题型、背了不考的知识点……', '努力就{偏了方向}。'], voice: '刷错了题型，背了不考的知识点，努力就偏了方向。', mood: 0.45 },
      { id: 'quote', min: 3.4, cap: ['方向对了，', '同样的努力，{全部算数}。'], voice: '方向对了，同样的努力，全部算数。', mood: 0.85, sfx: [{ at: 0.4, type: 'ding' }] },
      { id: 'action', min: 3.0, cap: null, voice: '先找准方向，再全力以赴。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '目标方向努力有效分量大小方向FθcosF·=×0123456789.°%|先找准再全力以赴图号比例',
  };

  function angleAt(t, TL, E) {
    const b = id => TL.b(id);
    const go = (from, to, s) => E.lerp(from, to, E.ease.inOut(E.seg(t, s, s + 0.9)));
    if (t < b('proj').s) return 0;
    if (t < b('a30').s) return go(0, 20, b('proj').s + 1.0);
    if (t < b('a60').s) return go(20, 30, b('a30').s);
    if (t < b('a90').s) return go(30, 60, b('a60').s);
    if (t < b('flip').s) return go(60, 90, b('a90').s);
    if (t < b('quote').s) return go(90, 50, b('flip').s) + Math.sin(t * 2.2) * 8 * E.seg(t, b('flip').s + 1, b('flip').s + 1.6);
    return go(50, 0, b('quote').s);
  }

  function arrow(ctx, x0, y0, x1, y1, col, w, head = 26) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.4) * head, y1 - Math.sin(a - 0.4) * head); ctx.lineTo(x1 - Math.cos(a + 0.4) * head, y1 - Math.sin(a + 0.4) * head); ctx.closePath(); ctx.fill();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.8) * (1 - 0.82 * E.seg(t, b('action').s - 0.1, b('action').s + 0.5));
    ctx.save(); ctx.globalAlpha = sceneA;
    // 图纸标题栏
    ctx.strokeStyle = th.dim; ctx.lineWidth = 1.5; ctx.strokeRect(120, 1500, 840, 120);
    ctx.beginPath(); ctx.moveTo(620, 1500); ctx.lineTo(620, 1620); ctx.moveTo(620, 1560); ctx.lineTo(960, 1560); ctx.stroke();
    ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'left';
    ctx.fillText('图号  F2', 640, 1540); ctx.fillText('比例  1 : 1', 640, 1600);
    ctx.font = `500 26px "Noto Sans SC"`; ctx.fillText('有效分量 = |F| · cosθ', 140, 1570);

    // 目标方向轴
    const axA = E.seg(t, 0.3, 1.0);
    ctx.globalAlpha = sceneA * axA; arrow(ctx, OX - 60, OY, 960, OY, th.gold, 4, 30);
    ctx.fillStyle = th.gold; ctx.font = `700 32px "Noto Sans SC"`; ctx.textAlign = 'right'; ctx.fillText('目标方向', 960, OY + 56);
    ctx.globalAlpha = sceneA;

    // 开头：三个方向不同、大小相同的箭头
    const hk = b('hook');
    const hA = E.seg(t, hk.s + 0.4, hk.s + 1.0) * (1 - E.seg(t, b('vec').s, b('vec').s + 0.5));
    if (hA > 0) {
      [0, 45, 80].forEach((d, i) => {
        const L = LEN * 0.85, x1 = OX + Math.cos(rad(d)) * L, y1 = OY - Math.sin(rad(d)) * L;
        ctx.globalAlpha = sceneA * hA * (0.5 + 0.5 * (i === 0)); arrow(ctx, OX, OY, x1, y1, th.fg, 4);
        ctx.fillStyle = th.goldHi; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'center';
        ctx.fillText(String(Math.round(100 * Math.cos(rad(d)))), OX + Math.cos(rad(d)) * L, OY + 100 + i * 0);
        ctx.setLineDash([8, 8]); ctx.strokeStyle = th.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, OY); ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.globalAlpha = sceneA;
    }

    // 主向量
    if (t > b('vec').s) {
      const th0 = angleAt(t, TL, E), grow = E.ease.out(E.seg(t, b('vec').s + 0.2, b('vec').s + 1.0));
      const L = LEN * grow, x1 = OX + Math.cos(rad(th0)) * L, y1 = OY - Math.sin(rad(th0)) * L;
      const comp = Math.cos(rad(th0));
      // 投影
      const pA = E.seg(t, b('proj').s + 0.6, b('proj').s + 1.2);
      if (pA > 0) {
        ctx.globalAlpha = sceneA * pA; ctx.setLineDash([10, 8]); ctx.strokeStyle = th.dim; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, OY); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = comp < 0.55 ? th.red : th.goldHi; ctx.lineWidth = 14; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX + LEN * comp, OY); ctx.stroke(); ctx.shadowBlur = 0;
        // 尺寸标注
        ctx.strokeStyle = th.fg; ctx.lineWidth = 1.5; const dy = OY + 120;
        ctx.beginPath(); ctx.moveTo(OX, dy - 14); ctx.lineTo(OX, dy + 14); ctx.moveTo(OX + LEN * comp, dy - 14); ctx.lineTo(OX + LEN * comp, dy + 14); ctx.moveTo(OX, dy); ctx.lineTo(OX + LEN * comp, dy); ctx.stroke();
        ctx.fillStyle = comp < 0.55 ? th.red : th.goldHi; ctx.font = `700 64px ${th.mono}`; ctx.textAlign = 'center';
        ctx.fillText(Math.round(100 * comp) + '%', OX + Math.max(80, LEN * comp / 2), dy + 76);
      }
      ctx.globalAlpha = sceneA;
      arrow(ctx, OX, OY, x1, y1, th.fg, 6, 32);
      ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.mono}`; ctx.textAlign = 'left';
      ctx.fillText('F = 100', x1 + 20 * Math.sin(rad(th0)) + 10, y1 - 20);
      // 角度弧
      if (th0 > 1) {
        ctx.strokeStyle = th.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(OX, OY, 120, -rad(th0), 0); ctx.stroke();
        ctx.fillStyle = th.gold; ctx.font = `700 34px ${th.mono}`; ctx.fillText('θ = ' + Math.round(th0) + '°', OX + 140 * Math.cos(rad(th0 / 2)) + 8, OY - 140 * Math.sin(rad(th0 / 2)) + 4);
      }
      // 计算式
      ctx.globalAlpha = sceneA * E.seg(t, b('proj').s + 1.0, b('proj').s + 1.5);
      ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'center';
      ctx.fillText(`100 × cos${Math.round(th0)}° = ${Math.round(100 * comp)}`, 540, 540);
    }
    ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '先找准方向，', 540, 880, { theme: th, size: 86, tt: t - ac.s - 0.1 });
      E.rich(ctx, '再{全力以赴}。', 540, 1020, { theme: th, size: 110, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
