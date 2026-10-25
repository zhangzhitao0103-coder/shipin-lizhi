// G5《你玩的寒假，别人在超车》竞争类 · 像素游戏风
// 示例：寒假 30 天去掉春节 7 天，剩 23 天；每天学 4 小时 = 92 小时（示例数据）
(function (root) {
  const LX = 270, RX = 810, TY = 900, BY = 1260, R = (RX - LX) / 2, CX = (LX + RX) / 2;
  const STR = BY - TY, ARC = Math.PI * R, LAP = 2 * STR + 2 * ARC;

  const EP = {
    id: 'G5',
    title: '弯道超车',
    theme: 'pixel',
    voice: { sid: 100 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 120, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'pass',
    beats: [
      { id: 'hook', min: 3.0, cap: ['赛车比赛，', '差距在哪里{拉开}？'], voice: '赛车比赛，真正拉开差距的地方，在哪里？', mood: 0.4, sfx: [{ at: 0.5, type: 'ticks', n: 3, gap: 0.5 }] },
      { id: 'straight', min: 3.0, cap: ['直道上，', '大家速度{都差不多}。'], voice: '直道上，大家速度都差不多。', mood: 0.6 },
      { id: 'curve', min: 3.2, cap: ['到了{弯道}，', '有人减速，有人不减。'], voice: '到了弯道，有人减速，有人不减。', mood: 0.7, sfx: [{ at: 0.4, type: 'whoosh' }] },
      { id: 'pass', min: 3.0, cap: ['一个弯道，', '就能{甩开一大截}。'], voice: '一个弯道，就能甩开一大截。', mood: 0.9, sfx: [{ at: 0.3, type: 'boom' }] },
      { id: 'flip', min: 2.8, cap: ['寒假，', '就是高中的{弯道}。'], voice: '寒假，就是高中的弯道。', mood: 0.6, sfx: [{ at: 0.4, type: 'ding' }] },
      { id: 'calc', min: 4.2, cap: ['别人每天学 4 小时，23 天就是 {92} 小时；', '你在休息，差距就是 [92] 小时。'], voice: '别人每天学四小时，二十三天就是九十二小时。你在休息，差距就是九十二小时。', mood: 0.7, sfx: [{ at: 0.4, type: 'ticks', n: 8, gap: 0.12 }] },
      { id: 'quote', min: 3.2, cap: ['开学的时候，', '名次已经{换了位置}。'], voice: '开学的时候，名次已经换了位置。', mood: 0.8 },
      { id: 'action', min: 2.8, cap: null, voice: '弯道，就是用来超车的。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '寒假上学期下学期弯道直道甲乙小时学习示例数据每天差距开学名次换了位置就是用来超车的0123456789+−LAPGO!',
  };

  // 赛道中心线上的位置：s=0 在左侧直道底部，逆时针向上
  function trackPos(s, lane) {
    s = ((s % LAP) + LAP) % LAP;
    let x, y, a;
    if (s < STR) { x = LX; y = BY - s; a = -Math.PI / 2; }
    else if (s < STR + ARC) { const u = (s - STR) / R; x = CX - Math.cos(u) * R; y = TY - Math.sin(u) * R; a = -Math.PI / 2 + u; }
    else if (s < 2 * STR + ARC) { x = RX; y = TY + (s - STR - ARC); a = Math.PI / 2; }
    else { const u = (s - 2 * STR - ARC) / R; x = CX + Math.cos(u) * R; y = BY + Math.sin(u) * R; a = Math.PI / 2 + u; }
    const nx = Math.cos(a - Math.PI / 2), ny = Math.sin(a - Math.PI / 2);
    return { x: x + nx * lane, y: y + ny * lane, a };
  }

  function carS(t, TL, E, who) {
    const b = id => TL.b(id);
    const A = who === 'A';
    if (t < b('straight').s) return 0;
    if (t < b('curve').s) return STR * E.seg(t, b('straight').s, b('straight').e);
    if (t < b('pass').s) return STR + (A ? ARC : ARC * 0.28) * E.seg(t, b('curve').s, b('curve').e);
    if (t < b('flip').s) return STR + (A ? ARC + STR * 0.9 * E.ease.out(E.seg(t, b('pass').s, b('pass').e)) : ARC * 0.28 + ARC * 0.22 * E.seg(t, b('pass').s, b('pass').e));
    return A ? STR + ARC + STR * 0.9 : STR + ARC * 0.5;
  }

  function car(g, p, col, th) {
    g.save(); g.translate(p.x, p.y); g.rotate(p.a + Math.PI / 2);
    g.fillStyle = '#111'; g.fillRect(-26, -30, 10, 18); g.fillRect(16, -30, 10, 18); g.fillRect(-26, 14, 10, 18); g.fillRect(16, 14, 10, 18);
    g.fillStyle = col; g.fillRect(-18, -38, 36, 76);
    g.fillStyle = '#BDE7FF'; g.fillRect(-12, -24, 24, 16);
    g.fillStyle = '#FFFFFF'; g.fillRect(-4, -38, 8, 76);
    g.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.6) * (1 - 0.85 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.4));
    const flipK = E.seg(t, b('flip').s + 0.2, b('flip').s + 0.8);
    E.pixelate(ctx, 4, g => {
      g.globalAlpha = sceneA;
      // 赛道
      g.lineWidth = 120; g.strokeStyle = '#3A3466'; g.beginPath();
      g.moveTo(LX, BY); g.lineTo(LX, TY); g.arc(CX, TY, R, Math.PI, 0); g.lineTo(RX, BY); g.arc(CX, BY, R, 0, Math.PI); g.closePath(); g.stroke();
      // 弯道高亮（寒假）
      if (flipK > 0) { g.globalAlpha = sceneA * flipK; g.strokeStyle = th.gold; g.lineWidth = 120; g.beginPath(); g.arc(CX, TY, R, Math.PI, 0); g.stroke(); g.globalAlpha = sceneA; }
      g.lineWidth = 6; g.setLineDash([24, 24]); g.strokeStyle = '#8E86B5'; g.beginPath();
      g.moveTo(LX, BY); g.lineTo(LX, TY); g.arc(CX, TY, R, Math.PI, 0); g.lineTo(RX, BY); g.arc(CX, BY, R, 0, Math.PI); g.closePath(); g.stroke(); g.setLineDash([]);
      // 起跑线
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#FFF' : '#111'; g.fillRect(LX - 60 + i * 20, BY - 10, 20, 20); }
      // 车
      const sA = carS(t, TL, E, 'A'), sB = carS(t, TL, E, 'B');
      car(g, trackPos(sB, 28), th.red, th); car(g, trackPos(sA, -28), th.gold, th);
      // 标签
      g.font = `900 52px "Noto Sans SC"`; g.textAlign = 'center';
      if (flipK > 0) {
        g.globalAlpha = sceneA * flipK; g.fillStyle = th.goldHi; g.fillText('寒假', CX, TY - R + 150);
        g.fillStyle = th.dim; g.font = `900 40px "Noto Sans SC"`; g.fillText('上学期', LX + 130, (TY + BY) / 2 + 14); g.fillText('下学期', RX - 130, (TY + BY) / 2 + 14);
        g.globalAlpha = sceneA;
      }
      g.font = `900 36px "Noto Sans SC"`;
      const pa = trackPos(sA, -28), pb = trackPos(sB, 28);
      g.fillStyle = th.gold; g.fillText('甲', pa.x + (pa.x < CX ? -70 : 70), pa.y + 12);
      g.fillStyle = th.red; g.fillText('乙', pb.x + (pb.x < CX ? -70 : 70), pb.y + 12);
      // 开头倒计时
      const hk = b('hook');
      if (t < b('straight').s + 0.3) {
        const n = 3 - Math.floor(E.seg(t, hk.s + 0.5, hk.e) * 3);
        g.globalAlpha = sceneA * (1 - E.seg(t, b('straight').s, b('straight').s + 0.3)); g.fillStyle = th.goldHi; g.font = `900 160px ${th.mono}`;
        g.fillText(t > hk.e - 0.1 ? 'GO!' : String(Math.max(1, n)), CX, (TY + BY) / 2 + 56);
      }
      // 学习时长计数
      const cb = b('calc');
      const ca = E.seg(t, cb.s + 0.2, cb.s + 0.6) * (1 - E.seg(t, b('quote').s, b('quote').s + 0.4));
      if (ca > 0) {
        g.globalAlpha = ca; const h = Math.round(92 * E.ease.inOut(E.seg(t, cb.s + 0.3, cb.s + 2.0)));
        g.fillStyle = 'rgba(23,20,43,0.85)'; g.fillRect(150, 1460, 780, 200);
        g.strokeStyle = th.fg; g.lineWidth = 6; g.strokeRect(150, 1460, 780, 200);
        g.font = `900 44px "Noto Sans SC"`; g.textAlign = 'left'; g.fillStyle = th.gold; g.fillText('甲  学习', 190, 1540); g.fillStyle = th.red; g.fillText('乙  学习', 190, 1620);
        g.textAlign = 'right'; g.font = `700 56px ${th.mono}`; g.fillStyle = th.gold; g.fillText(h + 'h', 890, 1544); g.fillStyle = th.red; g.fillText('0h', 890, 1624);
      }
    });
    ctx.save(); ctx.globalAlpha = 0.8 * E.seg(t, b('calc').s, b('calc').s + 0.5) * (1 - E.seg(t, b('action').s, b('action').s + 0.3)); ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('示例：寒假 30 天去掉春节 7 天，每天学 4 小时', 540, 1700); ctx.restore();

    const ac = b('action');
    if (t > ac.s) E.pixelate(ctx, 4, g => {
      E.rich(g, '弯道，', 540, 880, { theme: th, size: 104, tt: t - ac.s - 0.1, weight: 900 });
      E.rich(g, '就是用来{超车}的。', 540, 1040, { theme: th, size: 104, tt: t - ac.s - 0.5, weight: 900 });
    });
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
