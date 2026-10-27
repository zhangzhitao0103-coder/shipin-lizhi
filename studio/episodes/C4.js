// C4《差一点，就飞不出地球》坚持类 · 深空风
// 物理锚点：第一宇宙速度约 7.9 km/s（近地圆轨道、忽略空气阻力）。"牛顿大炮"：低于它会落回地面，达到它就绕地飞行。
// 弹道为数值积分（GM = 1，地球半径 = 1，发射高度 1.05，速度按第一宇宙速度的比例）
(function (root) {
  const R0 = 1.05;
  function traj(k) {
    let x = 0, y = R0, vx = k * Math.sqrt(1 / R0), vy = 0; const dt = 0.004, pts = [[x, y]];
    let ang = 0, prev = Math.atan2(x, y);
    for (let i = 0; i < 20000; i++) {
      const r3 = Math.pow(x * x + y * y, 1.5); vx -= (x / r3) * dt * 0.5; vy -= (y / r3) * dt * 0.5;
      x += vx * dt; y += vy * dt;
      const r3b = Math.pow(x * x + y * y, 1.5); vx -= (x / r3b) * dt * 0.5; vy -= (y / r3b) * dt * 0.5;
      const a = Math.atan2(x, y); let da = a - prev; if (da < -Math.PI) da += 2 * Math.PI; ang += da; prev = a;
      if (i % 6 === 0) pts.push([x, y]);
      if (x * x + y * y < 1) { pts.push([x, y]); return { pts, lands: true }; }
      if (ang > 2 * Math.PI) return { pts, lands: false };
    }
    return { pts, lands: false };
  }
  let T = null;
  const trajs = () => T || (T = { slow: traj(0.4), faster: traj(0.987), orbit: traj(1.0) });

  const EP = {
    id: 'C4',
    title: '差一点就飞不出地球',
    theme: 'space',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'F', 'C', 'Bb', 'C'] },
    cover: 'orbit',
    beats: [
      { id: 'hook', min: 3.4, cap: ['从山顶水平打出一颗炮弹，', '要多快，才{不会掉下来}？'], voice: '从山顶水平打出一颗炮弹，要多快，才不会掉下来？', mood: 0.35 },
      { id: 'slow', min: 3.0, cap: ['3 公里每秒：', '飞一段，就[掉回地面]。'], voice: '三公里每秒，飞一段，就掉回地面。', mood: 0.45, sfx: [{ at: 0.3, type: 'whoosh' }, { at: 1.5, type: 'boom' }] },
      { id: 'faster', min: 3.8, cap: ['7.8 公里每秒：飞了大半圈，', '还是[掉回地面]。'], voice: '七点八公里每秒，飞了大半圈，还是掉回地面。', mood: 0.6, sfx: [{ at: 0.3, type: 'whoosh' }, { at: 3.0, type: 'boom' }] },
      { id: 'orbit', min: 3.8, cap: ['7.9 公里每秒：它开始{绕着地球转}，', '再也不掉下来。'], voice: '七点九公里每秒，它开始绕着地球转，再也不掉下来。', mood: 0.9, sfx: [{ at: 0.3, type: 'riser', dur: 2.0 }, { at: 2.3, type: 'ding' }] },
      { id: 'close', min: 3.2, cap: ['7.8 和 7.9，只差{一点点}，', '却是两种结局。'], voice: '七点八和七点九，只差一点点，却是两种结局。', mood: 0.7 },
      { id: 'flip', min: 2.8, cap: ['差一点点和做到了，', '是{两个世界}。'], voice: '差一点点和做到了，是两个世界。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '再加一把劲，就能进入轨道。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '公里每秒第一宇宙速度约近地圆轨道忽略空气阻力图为示意牛顿大炮再加一把劲就能进入轨道km/s0123456789.',
  };

  const CX = 540, CY = 1250, RP = 380;
  const P = ([x, y]) => [CX + x * RP, CY - y * RP];

  function drawPath(ctx, tr, prog, col, a, glowBall) {
    const n = Math.max(2, Math.floor(tr.pts.length * prog));
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash([2, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); for (let i = 0; i < n; i++) { const [px, py] = P(tr.pts[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.setLineDash([]);
    if (glowBall) { const [bx, by] = P(tr.pts[n - 1]); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const tr = trajs();
    const sceneA = E.seg(t, 0.1, 0.8) * (1 - 0.8 * E.seg(t, b('action').s - 0.1, b('action').s + 0.4));
    ctx.save(); ctx.globalAlpha = sceneA;
    // 地球
    const g = ctx.createRadialGradient(CX - 120, CY - 140, 40, CX, CY, RP);
    g.addColorStop(0, '#3E8EDE'); g.addColorStop(0.7, '#1B4F8F'); g.addColorStop(1, '#0D2747');
    ctx.fillStyle = g; ctx.shadowColor = '#3E8EDE'; ctx.shadowBlur = 50; ctx.beginPath(); ctx.arc(CX, CY, RP, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(80,170,110,0.55)'; ctx.beginPath(); ctx.ellipse(CX - 90, CY - 60, 120, 70, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(CX + 120, CY + 110, 90, 60, -0.3, 0, Math.PI * 2); ctx.fill();
    // 山与大炮
    const [mx, my] = P([0, 1]);
    ctx.fillStyle = '#6B5B4B'; ctx.beginPath(); ctx.moveTo(mx - 50, my + 6); ctx.lineTo(mx, my - 20); ctx.lineTo(mx + 50, my + 6); ctx.fill();
    ctx.fillStyle = th.fg; ctx.fillRect(mx - 8, my - 26, 34, 10);
    ctx.restore();
    // 三条弹道
    const sl = b('slow'), fa = b('faster'), ob = b('orbit');
    if (t > sl.s) drawPath(ctx, tr.slow, E.seg(t, sl.s + 0.3, sl.s + 1.5), th.red, sceneA * (t > fa.s ? 0.4 : 1), t < fa.s);
    if (t > fa.s) drawPath(ctx, tr.faster, E.seg(t, fa.s + 0.3, fa.s + 3.0), '#FFB86B', sceneA * (t > ob.s ? 0.5 : 1), t < ob.s);
    if (t > ob.s) {
      const loops = (t - ob.s - 0.3) / 2.2;
      const prog = loops < 1 ? E.clamp(loops) : 1;
      drawPath(ctx, tr.orbit, prog, th.gold, sceneA, false);
      const i = Math.floor((loops % 1 + 1) % 1 * (tr.orbit.pts.length - 1));
      const [bx, by] = P(tr.orbit.pts[loops < 1 ? Math.floor(prog * (tr.orbit.pts.length - 1)) : i]);
      ctx.save(); ctx.globalAlpha = sceneA; ctx.fillStyle = th.goldHi; ctx.shadowColor = th.gold; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // 速度读数
    const v = t < sl.s ? null : t < fa.s ? 3.0 : t < ob.s ? 7.8 : 7.9;
    if (v) E.hud(ctx, th, 140, 640, '速度 SPEED', v.toFixed(1) + ' km/s', { alpha: sceneA, color: v >= 7.9 ? th.goldHi : th.red, glow: v >= 7.9 });
    const cl = b('close');
    if (t > cl.s && t < b('action').s) {
      const a = E.seg(t, cl.s + 0.2, cl.s + 0.6);
      ctx.save(); ctx.globalAlpha = sceneA * a; ctx.textAlign = 'right'; ctx.font = `700 54px ${th.mono}`;
      ctx.fillStyle = '#FFB86B'; ctx.fillText('7.8 → 落地', 940, 640); ctx.fillStyle = th.goldHi; ctx.fillText('7.9 → 绕地', 940, 720); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = sceneA * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 20px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('第一宇宙速度约 7.9 km/s（近地圆轨道、忽略空气阻力）；"牛顿大炮"示意图', 540, 1700); ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '再加一把劲，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{就能进入轨道}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
