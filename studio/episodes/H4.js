// H4《串联电路里的"最弱一环"》短板类 · 霓虹科技风
// 物理锚点：串联电路中电流只有一条路径，任一处断路，整个电路中都没有电流
// 升学类比：部分高校专业对单科成绩有要求（如外语类专业对英语成绩），以招生章程为准
(function (root) {
  const X0 = 150, X1 = 930, YT = 720, YB = 1380;
  const PERIM = 2 * (X1 - X0) + 2 * (YB - YT);
  // 周长参数 s → 坐标（从左上角顺时针）
  function at(s) {
    s = ((s % PERIM) + PERIM) % PERIM; const w = X1 - X0, h = YB - YT;
    if (s < w) return [X0 + s, YT]; s -= w;
    if (s < h) return [X1, YT + s]; s -= h;
    if (s < w) return [X1 - s, YB]; s -= w;
    return [X0, YB - s];
  }
  const BULBS = [['语', 300, YT], ['数', 540, YT], ['英', 780, YT], ['物', 780, YB], ['化', 540, YB], ['生', 300, YB]];

  const EP = {
    id: 'H4',
    title: '串联电路里的最弱一环',
    theme: 'neon',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 108, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'series',
    beats: [
      { id: 'hook', min: 3.2, cap: ['一串彩灯，', '为什么坏一个，[全都不亮]？'], voice: '一串彩灯，为什么坏一个，全都不亮？', mood: 0.3 },
      { id: 'series', min: 4.2, cap: ['串联电路只有{一条路}：', '电流要依次经过每一个灯。'], voice: '串联电路只有一条路，电流要依次经过每一个灯。', mood: 0.6 },
      { id: 'brk', min: 3.0, cap: ['一处断开，', '整条电路[都断了]。'], voice: '一处断开，整条电路都断了。', mood: 0.4, sfx: [{ at: 0.5, type: 'boom' }] },
      { id: 'you', min: 5.0, cap: ['升学也有"串联"：有的专业', '对{单科成绩}有要求，一科不够，[进不去]。'], voice: '升学也有串联的地方，有的专业对单科成绩有要求，一科不够，总分再高也进不去。', mood: 0.5 },
      { id: 'flip', min: 4.4, cap: ['所以弱科不只是"拖一点分"，', '它可能是{断开的那一处}。'], voice: '所以弱科不只是拖一点分，它可能是断开的那一处。', mood: 0.7, sfx: [{ at: 3.4, type: 'ding' }] },
      { id: 'action', min: 3.0, cap: null, voice: '先把断开的那一处，接上。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '语数英物化生电流断开路串联电路单科成绩要求以招生章程为准部分高校专业接上先把那一处ONOFFIA0123456789',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const bk = b('brk'), yo = b('you'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    const open = E.seg(t, bk.s + 0.3, bk.s + 0.6) * (1 - E.seg(t, fl.s + 3.2, fl.s + 3.6));  // 数学处断开，最后接上
    const on = open < 0.5;
    ctx.save(); ctx.globalAlpha = sceneA;
    // 导线
    ctx.strokeStyle = on ? th.gold : th.faint; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = on ? 18 : 0;
    ctx.beginPath(); ctx.rect(X0, YT, X1 - X0, YB - YT); ctx.stroke(); ctx.shadowBlur = 0;
    // 断口（数学灯左边）
    if (open > 0) {
      ctx.fillStyle = th.bg; ctx.fillRect(440, YT - 12, 50, 24);
      ctx.save(); ctx.translate(440, YT); ctx.rotate(-0.6 * open); ctx.strokeStyle = th.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(50, 0); ctx.stroke(); ctx.restore();
      ctx.fillStyle = th.red; ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'center'; ctx.fillText('断开', 465, YT - 70);
    }
    // 电源
    ctx.fillStyle = th.bg; ctx.fillRect(X0 - 40, 1010, 80, 60);
    ctx.fillStyle = th.fg; ctx.fillRect(X0 - 40, 1020, 80, 8); ctx.fillRect(X0 - 22, 1050, 44, 8);
    ctx.font = `700 26px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('电源', X0 + 20, 1050);
    // 灯泡
    BULBS.forEach(([name, x, y], i) => {
      const a = E.seg(t, 0.3 + i * 0.12, 0.6 + i * 0.12), lit = on && t > 0.8;
      ctx.globalAlpha = sceneA * a;
      if (lit) { const g = ctx.createRadialGradient(x, y, 0, x, y, 110); g.addColorStop(0, 'rgba(46,242,255,0.55)'); g.addColorStop(1, 'rgba(46,242,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 110, y - 110, 220, 220); }
      ctx.fillStyle = th.bg; ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = lit ? th.goldHi : th.dim; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = lit ? th.goldHi : th.dim; ctx.font = `700 44px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText(name, x, y + 15);
      const weak = i === 1 && E.seg(t, fl.s + 0.4, fl.s + 0.8) > 0 && t < fl.s + 3.2;
      if (weak) { ctx.strokeStyle = th.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 64 + 4 * Math.sin(t * 8), 0, Math.PI * 2); ctx.stroke(); }
    });
    // 电流：顺时针流动的光点
    ctx.globalAlpha = sceneA;
    if (on && t > 0.8) {
      const v = 380, k = t * v;
      for (let i = 0; i < 28; i++) { const [x, y] = at(k + i * (PERIM / 28)); ctx.fillStyle = th.goldHi; ctx.shadowColor = th.gold; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); }
      ctx.shadowBlur = 0;
    }
    // 读数
    E.hud(ctx, th, 120, 560, '电流 I', on && t > 0.8 ? 'ON' : 'OFF', { alpha: sceneA, color: on && t > 0.8 ? th.gold : th.red, glow: on, size: 52 });
    const uA = E.seg(t, yo.s + 0.3, yo.s + 0.8) * (1 - E.seg(t, fl.s, fl.s + 0.4));
    if (uA > 0) { ctx.globalAlpha = sceneA * uA; ctx.fillStyle = th.fg; ctx.font = `700 40px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.fillText('总分再高，也进不去', 540, 1060); }
    if (t > fl.s + 3.2) { ctx.globalAlpha = sceneA * E.seg(t, fl.s + 3.3, fl.s + 3.7); ctx.fillStyle = th.goldHi; ctx.font = `700 52px "Noto Sans SC"`; ctx.textAlign = 'center'; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.fillText('接上了', 540, 1070); ctx.shadowBlur = 0; }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('串联电路任一处断路，整个电路无电流；单科要求以各高校招生章程为准', 540, 1640);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '先把断开的那一处，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{接上}。', 540, 1040, { theme: th, size: 140, tt: t - ac.s - 0.7, glow: 1.0 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
