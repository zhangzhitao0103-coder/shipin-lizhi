// J2《过山车在最低点，速度最快》你也可以类 · 水彩风（期中考后）
// 物理锚点：机械能守恒（忽略摩擦和空气阻力）v = √(2gh)：从 40 米高处由静止滑下，最低点速度 ≈ 28 m/s ≈ 100 km/h
(function (root) {
  const G = 9.8, H0 = 40;
  // 轨道：屏幕坐标 y(x)；y=700 对应 40 米，y=1400 对应 0 米
  const trackY = x => {
    if (x <= 220) return 700;
    if (x <= 560) return 700 + 350 * (1 - Math.cos(Math.PI * (x - 220) / 340));
    return 1400 - 210 * (1 - Math.cos(Math.PI * Math.min(1, (x - 560) / 420)));
  };
  const hOf = y => ((1400 - y) / 700) * H0;
  const vOf = h => Math.sqrt(Math.max(0, 2 * G * (H0 - h))) * 3.6;

  const EP = {
    id: 'J2',
    title: '过山车在最低点速度最快',
    theme: 'watercolor',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'F#m', 'G', 'A'] },
    cover: 'drop',
    beats: [
      { id: 'hook', min: 3.0, cap: ['过山车在哪里，', '{跑得最快}？'], voice: '过山车在哪里，跑得最快？', mood: 0.3 },
      { id: 'top', min: 3.0, cap: ['在最高点，', '它几乎{停了下来}。'], voice: '在最高点，它几乎停了下来。', mood: 0.35, sfx: [{ at: 0.5, type: 'tick' }, { at: 1.3, type: 'tick' }] },
      { id: 'drop', min: 4.0, cap: ['从 40 米高冲下来，', '到最低点，速度约 {100 公里/小时}。'], voice: '从四十米高冲下来，到了最低点，速度大约每小时一百公里。', mood: 1.0, sfx: [{ at: 0.2, type: 'riser', dur: 1.6 }, { at: 1.9, type: 'whoosh' }] },
      { id: 'why', min: 3.4, cap: ['高度没有消失，', '{全部变成了速度}。'], voice: '高度没有消失，全部变成了速度。', mood: 0.7 },
      { id: 'flip', min: 3.6, cap: ['如果你正处在低谷，', '那正是{速度最快}的时候。'], voice: '如果你正处在低谷，那正是速度最快的时候。', mood: 0.75 },
      { id: 'flip2', min: 3.8, cap: ['期中考的落差，', '会变成你{冲上去的速度}。'], voice: '期中考的落差，会变成你冲上去的速度。', mood: 0.9, sfx: [{ at: 0.4, type: 'whoosh' }] },
      { id: 'action', min: 3.0, cap: null, voice: '在最低点，加速冲上去。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '高度速度米公里小时势能动能低谷最低点最高点机械能守恒忽略摩擦和空气阻力由静止滑下示意在加冲上去0123456789.km/h√=',
  };

  function carX(t, TL, E) {
    const b = id => TL.b(id);
    if (t < b('top').s) return E.lerp(110, 196, E.seg(t, 0.3, b('top').s));
    if (t < b('drop').s) return E.lerp(196, 226, E.ease.out(E.seg(t, b('top').s, b('top').e)));
    if (t < b('flip2').s) return E.lerp(226, 560, E.ease.in(E.seg(t, b('drop').s + 0.2, b('drop').s + 1.9)));
    return E.lerp(560, 950, E.ease.out(E.seg(t, b('flip2').s + 0.3, b('flip2').s + 2.6)));
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 水彩底：轨道下的一片晕染
      E.wash(ctx, 540, 1250, 360, '120,170,220', 31, 0.8);
      E.wash(ctx, 560, 1420, 200, '240,170,130', 32, 0.7);
      // 支架
      ctx.strokeStyle = 'rgba(44,58,71,0.35)'; ctx.lineWidth = 3;
      for (let x = 120; x <= 960; x += 60) { ctx.beginPath(); ctx.moveTo(x, trackY(x) + 10); ctx.lineTo(x, 1440); ctx.stroke(); }
      ctx.fillStyle = 'rgba(44,58,71,0.5)'; ctx.fillRect(80, 1440, 920, 4);
      // 轨道（双轨）
      [0, 12].forEach(off => {
        ctx.strokeStyle = th.fg; ctx.lineWidth = off ? 3 : 6; ctx.beginPath();
        for (let x = 100; x <= 980; x += 5) { const y = trackY(x) + off; x === 100 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      });
      // 刻度：40 米 / 0 米
      ctx.fillStyle = th.dim; ctx.font = `500 26px ${th.cap}`; ctx.textAlign = 'left';
      ctx.fillText('40 米', 100, 676);
      ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(138,150,160,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(100, 700); ctx.lineTo(980, 700); ctx.stroke(); ctx.setLineDash([]);
      // 车
      const x = carX(t, TL, E), y = trackY(x), dx = 2, slope = Math.atan2(trackY(x + dx) - trackY(x - dx), 2 * dx);
      const h = hOf(y), v = vOf(h);
      // 速度线
      if (v > 40) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(slope); ctx.strokeStyle = th.gold; ctx.lineWidth = 3; ctx.globalAlpha = sceneA * Math.min(1, (v - 40) / 50);
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-60 - k * 14, -26 - k * 10); ctx.lineTo(-160 - k * 30, -26 - k * 10); ctx.stroke(); }
        ctx.restore();
      }
      ctx.save(); ctx.translate(x, y); ctx.rotate(slope);
      ctx.fillStyle = th.red; ctx.beginPath(); ctx.roundRect(-46, -50, 92, 42, 14); ctx.fill();
      ctx.fillStyle = th.fg; [-26, 26].forEach(wx => { ctx.beginPath(); ctx.arc(wx, -6, 9, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      // 读数
      E.hud(ctx, th, 120, 560, '高度', h.toFixed(0) + ' 米', { alpha: sceneA, color: th.fg, size: 52 });
      E.hud(ctx, th, 960, 560, '速度', Math.round(v) + ' km/h', { alpha: sceneA, color: v > 90 ? th.red : th.gold, size: 52, align: 'right' });
      // 能量条：势能 ↔ 动能
      const eA = E.seg(t, b('why').s + 0.2, b('why').s + 0.7);
      if (eA > 0) {
        ctx.globalAlpha = sceneA * eA;
        [['高度（势能）', h / H0, th.gold, 1500], ['速度（动能）', 1 - h / H0, th.red, 1560]].forEach(([lab, k, col, yy]) => {
          ctx.fillStyle = th.fg; ctx.font = `700 28px ${th.cap}`; ctx.textAlign = 'right'; ctx.fillText(lab, 330, yy + 22);
          ctx.fillStyle = 'rgba(44,58,71,0.12)'; ctx.fillRect(350, yy, 600, 30);
          ctx.fillStyle = col; ctx.fillRect(350, yy, 600 * k, 30);
        });
      }
      // 低谷标注
      const lA = E.seg(t, b('flip').s + 0.3, b('flip').s + 0.8) * (1 - E.seg(t, b('flip2').s + 0.3, b('flip2').s + 0.8));
      if (lA > 0) { ctx.globalAlpha = sceneA * lA; ctx.fillStyle = th.red; ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('低谷 = 最快', 560, 1250); }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('机械能守恒，忽略摩擦和空气阻力：v = √(2gh)，40 米由静止滑下约 100 km/h', 540, 1650);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '在最低点，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{加速冲上去}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.5 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
