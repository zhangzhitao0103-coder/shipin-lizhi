// L4《慌的时候，先把呼吸找回来》心态类 · 新中式水墨风（期中考前）
// 放松练习：吸气 4 秒、呼气 6 秒（呼气比吸气长），跟着圆圈做两轮。仅作放松引导，不涉及具体生理数值
(function (root) {
  const IN = 4, OUT = 6, CYCLE = IN + OUT, ROUNDS = 2;

  const EP = {
    id: 'L4',
    title: '慌的时候先把呼吸找回来',
    theme: 'ink',
    voice: { sid: 50, speed: 0.95 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'how',
    beats: [
      { id: 'hook', min: 3.4, cap: ['考试时突然脑子一片空白，', '手心{冒汗}？'], voice: '考试时，突然脑子一片空白，手心冒汗？', mood: 0.35 },
      { id: 'why', min: 4.0, cap: ['那是身体进入了{紧张模式}：', '心跳变快，呼吸变浅。'], voice: '那是身体进入了紧张模式，心跳变快，呼吸变浅。', mood: 0.4 },
      { id: 'how', min: 3.6, cap: ['试试这样呼吸：', '吸气 {4 秒}，呼气 {6 秒}。'], voice: '试试这样呼吸，吸气四秒，呼气六秒。', mood: 0.3 },
      { id: 'breathe', min: CYCLE * ROUNDS + 0.8, cap: null, voice: '跟着圆圈，慢慢吸气，再慢慢呼出来。', mood: 0.15 },
      { id: 'flip', min: 3.6, cap: ['慢慢地呼气，', '能帮身体{从紧张里退出来}。'], voice: '慢慢地呼气，能帮身体从紧张里退出来。', mood: 0.4 },
      { id: 'action', min: 3.0, cap: null, voice: '慌的时候，先把呼吸找回来。', mood: 0.6, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '吸气呼气秒跟着圆圈慢慢放松练习考前多练几次更有效第轮慌的时候先把找回来一二三四五六0123456789·',
  };

  const CX = 540, CY = 1080;
  // 墨圈（一笔"圆相"）：多层抖动描边，留一个缺口
  function enso(ctx, r, color, a, seed) {
    const rg = (() => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let pass = 0; pass < 5; pass++) {
      ctx.globalAlpha = a * (0.25 + 0.15 * rg()); ctx.lineWidth = 14 + 22 * rg();
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const ang = -Math.PI / 2 + 0.25 + (i / 120) * (Math.PI * 2 - 0.55), rr = r + (rg() - 0.5) * 6 + 8 * Math.sin(i / 9 + pass);
        const x = CX + rr * Math.cos(ang), y = CY + rr * Math.sin(ang);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const wy = b('why'), hw = b('how'), br = b('breathe'), fl = b('flip');
    // 开头：急促的心跳线
    const hA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, hw.s, hw.s + 0.5));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = th.red; ctx.lineWidth = 6; ctx.lineJoin = 'round';
      ctx.beginPath();
      const speed = 1 + E.seg(t, wy.s, wy.s + 1) * 0.8;
      for (let x = 100; x <= 980; x += 4) {
        const ph = ((x / 180) - t * 1.6 * speed) % 1, p = ph < 0 ? ph + 1 : ph;
        const y = 1080 - (p > 0.45 && p < 0.5 ? (p - 0.45) * 4800 : p >= 0.5 && p < 0.56 ? (0.56 - p) * 4000 - 60 : 0);
        x === 100 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
    }
    // 4 + 6 示意条
    const sA = E.seg(t, hw.s + 0.4, hw.s + 0.9) * (1 - E.seg(t, br.s, br.s + 0.4));
    if (sA > 0) {
      ctx.save(); ctx.globalAlpha = sA;
      const x0 = 140, w = 800, y = 1040;
      ctx.fillStyle = th.gold; ctx.fillRect(x0, y, w * IN / CYCLE - 6, 60);
      ctx.fillStyle = th.fg; ctx.fillRect(x0 + w * IN / CYCLE, y, w * OUT / CYCLE, 60);
      ctx.font = `700 44px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillStyle = th.gold; ctx.fillText('吸气 4 秒', x0 + (w * IN / CYCLE) / 2, y - 30);
      ctx.fillStyle = th.fg; ctx.fillText('呼气 6 秒', x0 + w * IN / CYCLE + (w * OUT / CYCLE) / 2, y - 30);
      ctx.restore();
    }
    // 跟着圆圈呼吸
    const bA = E.seg(t, br.s + 0.1, br.s + 0.6) * (1 - 0.8 * E.seg(t, fl.s + 0.2, fl.s + 0.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (bA > 0) {
      const lt = Math.max(0, t - br.s - 0.6), k = Math.min(ROUNDS * CYCLE - 0.001, lt), ph = k % CYCLE, round = Math.floor(k / CYCLE) + 1;
      const inhale = ph < IN, u = inhale ? ph / IN : (ph - IN) / OUT;
      const r = inhale ? E.lerp(150, 330, E.ease.inOutSine(u)) : E.lerp(330, 150, E.ease.inOutSine(u));
      // 墨晕
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, r * 1.1);
      g.addColorStop(0, 'rgba(63,107,74,0.18)'); g.addColorStop(1, 'rgba(63,107,74,0)');
      ctx.save(); ctx.globalAlpha = bA; ctx.fillStyle = g; ctx.fillRect(0, 600, 1080, 1000); ctx.restore();
      enso(ctx, r, th.fg, bA, 4242);
      const done = lt >= ROUNDS * CYCLE;
      const word = done ? '很好' : inhale ? '吸 气' : '呼 气';
      const sec = done ? '' : String(Math.floor(inhale ? ph : ph - IN) + 1);
      ctx.save(); ctx.globalAlpha = bA; ctx.textAlign = 'center';
      ctx.fillStyle = inhale && !done ? th.gold : th.fg; ctx.font = `400 96px ${th.num}`; ctx.fillText(word, CX, CY + 20);
      ctx.fillStyle = th.dim; ctx.font = `700 48px ${th.cap}`; ctx.fillText(sec, CX, CY + 100);
      ctx.font = `500 30px ${th.cap}`; ctx.fillText(done ? '' : '第 ' + round + ' / ' + ROUNDS + ' 轮', CX, 1560);
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, hw.s, hw.s + 0.5) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('放松练习，仅供参考；考前多练几次，用起来更顺手', 540, 1640);
    ctx.restore();
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '慌的时候，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{先把呼吸找回来}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.5 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
