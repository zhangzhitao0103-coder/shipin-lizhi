// K2《寒假在家，为什么越催越顶？》家长类 · 暖色温情风
// 物理锚点：牛顿第三定律——作用力与反作用力大小相等、方向相反、作用在两个物体上；冰面互推两人都会后退（课本例题）
(function (root) {
  const EP = {
    id: 'K2',
    title: '寒假在家为什么越催越顶',
    theme: 'warm',
    voice: { sid: 50 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'F', 'C', 'Bb', 'C'] },
    cover: 'flip',
    beats: [
      { id: 'hook', min: 3.0, cap: ['寒假在家，', '为什么{越催，孩子越顶}？'], voice: '寒假在家，为什么越催，孩子越顶？', mood: 0.3 },
      { id: 'law', min: 4.0, cap: ['物理课本里写着：作用力与反作用力，', '{大小相等、方向相反}。'], voice: '物理课本里写着，作用力与反作用力，大小相等，方向相反。', mood: 0.4 },
      { id: 'ice', min: 3.2, cap: ['冰面上两个人互推，', '[两个人都会后退]。'], voice: '冰面上两个人互推，两个人都会后退。', mood: 0.5, sfx: [{ at: 0.6, type: 'whoosh' }] },
      { id: 'more', min: 3.0, cap: ['推得越用力，', '{两个人退得越远}。'], voice: '推得越用力，两个人后退得越远。', mood: 0.65, sfx: [{ at: 0.6, type: 'boom' }] },
      { id: 'flip', min: 3.6, cap: ['你用多大的力催，', '孩子就会用多大的力{顶回来}。'], voice: '你用多大的力催，孩子就会用多大的力顶回来。', mood: 0.6 },
      { id: 'turn', min: 4.0, cap: ['不如换个方向：', '{站到孩子身边}，一起往前推。'], voice: '不如换个方向，站到孩子身边，一起往前推。', mood: 0.85, sfx: [{ at: 1.2, type: 'ding' }] },
      { id: 'action', min: 3.0, cap: null, voice: '少一点对抗，多一点同向。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '家长孩子作用力反作用力FF′目标冰面少一点对抗多同向+',
  };

  const ICE = 1200;
  function person(ctx, x, h, col, facing, label, th) {
    const y = ICE;
    ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col;
    ctx.beginPath(); ctx.arc(x, y - h - 38, 34 * (h / 260), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x - 34 * (h / 260), y - h, 68 * (h / 260), h - 70, 26); ctx.fill();
    ctx.lineWidth = 16 * (h / 260); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 14, y - 74); ctx.lineTo(x - 22, y - 4); ctx.moveTo(x + 14, y - 74); ctx.lineTo(x + 22, y - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - h + 40); ctx.lineTo(x + facing * 90 * (h / 260), y - h + 70); ctx.stroke();
    ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 60);
    ctx.restore();
  }
  function arrow(ctx, x0, y, x1, col, label, th) {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 8;
    const d = Math.sign(x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 - d * 24, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 - d * 30, y - 18); ctx.lineTo(x1 - d * 30, y + 18); ctx.fill();
    ctx.font = `700 40px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText(label, (x0 + x1) / 2, y - 26);
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    ctx.save(); ctx.globalAlpha = sceneA;
    // 冰面
    const g = ctx.createLinearGradient(0, ICE, 0, ICE + 160); g.addColorStop(0, 'rgba(210,235,255,0.28)'); g.addColorStop(1, 'rgba(210,235,255,0)');
    ctx.fillStyle = g; ctx.fillRect(80, ICE, 920, 160); ctx.strokeStyle = 'rgba(230,245,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(80, ICE); ctx.lineTo(1000, ICE); ctx.stroke();
    ctx.restore();

    const turnK = E.ease.inOut(E.seg(t, b('turn').s + 0.2, b('turn').s + 1.2));
    // 互推：质量 60 kg 与 45 kg，后退距离与质量成反比
    let sep1 = 0;
    if (t > b('ice').s) sep1 = 150 * E.ease.out(E.seg(t, b('ice').s + 0.6, b('ice').e));
    let sep2 = 0;
    if (t > b('more').s) sep2 = 300 * E.ease.out(E.seg(t, b('more').s + 0.6, b('more').e));
    const sep = t > b('more').s ? sep2 : sep1;
    const reset = t > b('more').s && t < b('more').s + 0.6 ? 1 - E.seg(t, b('more').s, b('more').s + 0.4) : 1;
    const s = sep * reset;
    let px = 450 - s * (45 / 105) * 2, cx = 630 + s * (60 / 105) * 2;
    // 换方向：两人站到同一侧，一起推"目标"
    const boxX = 640 + 120 * E.ease.out(E.seg(t, b('turn').s + 1.2, b('turn').e));
    if (turnK > 0) { px = E.lerp(px, boxX - 300, turnK); cx = E.lerp(cx, boxX - 150, turnK); }
    ctx.save(); ctx.globalAlpha = sceneA * E.seg(t, 0.2, 0.9);
    person(ctx, px, 280, '#FFB27A', turnK > 0.5 ? 1 : 1, '家长', th);
    person(ctx, cx, 230, '#FFD9A0', turnK > 0.5 ? 1 : -1, '孩子', th);
    // 力的箭头
    const la = E.seg(t, b('law').s + 0.5, b('law').s + 1.0) * (1 - E.seg(t, b('turn').s, b('turn').s + 0.4));
    if (la > 0) {
      const mag = t > b('more').s ? 200 : 130;
      ctx.globalAlpha = sceneA * la;
      arrow(ctx, cx - 10, ICE - 200, cx - 10 + mag, th.gold, 'F', th);
      arrow(ctx, px + 10, ICE - 230, px + 10 - mag, th.red, 'F′', th);
    }
    // 一起推：目标箱子
    if (turnK > 0) {
      ctx.globalAlpha = sceneA * turnK;
      ctx.fillStyle = 'rgba(255,226,184,0.18)'; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(boxX, ICE - 200, 220, 200, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = th.goldHi; ctx.font = `700 48px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('目标', boxX + 110, ICE - 86);
      const ap = E.seg(t, b('turn').s + 1.0, b('turn').s + 1.5);
      ctx.globalAlpha = sceneA * ap; arrow(ctx, boxX - 20, ICE - 300, boxX + 200, th.gold, 'F + F', th);
    }
    ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '少一点对抗，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '多一点{同向}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
