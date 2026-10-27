// A6《时间是唯一不能充值的东西》时间类 · 孔版印刷（Riso）风
// 无具体数据：电量、钱可以补回，时间只朝一个方向走（进度条为示意）
(function (root) {
  const EP = {
    id: 'A6',
    title: '时间是唯一不能充值的东西',
    theme: 'riso',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'lofi', bpm: 76, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'time',
    beats: [
      { id: 'hook', min: 3.6, cap: ['手机没电了，可以{充}；', '钱花完了，可以{再挣}。'], voice: '手机没电了，可以充。钱花完了，可以再挣。', mood: 0.35, sfx: [{ at: 0.9, type: 'ding' }, { at: 2.4, type: 'ding' }] },
      { id: 'time', min: 3.0, cap: ['时间用完了呢？', '[没有充值入口]。'], voice: '时间用完了呢？没有充值入口。', mood: 0.5, sfx: [{ at: 1.5, type: 'boom' }] },
      { id: 'once', min: 4.0, cap: ['考砸一次，还能再考；', '但高中三年，[只能过一次]。'], voice: '考砸一次，还能再考。但高中三年，只能过一次。', mood: 0.6 },
      { id: 'bar', min: 4.0, cap: ['它像一根进度条：', '只会{往一个方向}走。'], voice: '它像一根进度条，只会往一个方向走。', mood: 0.7, sfx: [{ at: 0.4, type: 'ticks', n: 18, gap: 0.15 }] },
      { id: 'flip', min: 3.4, cap: ['你可以重考一次试，', '但{不能重过一年}。'], voice: '你可以重考一次试，但不能重过一年。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '时间不能充值，今天就用好它。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '电量钱包时间充值已满不可用高一高二高三进度后退今天就用好它不能示意+¥✕%0123456789',
  };

  const BLUE = '#1D2B6B', PINK = '#FF3EA5';
  function riso(ctx, fn, a = 1, dx = 5, dy = 3) { ctx.save(); ctx.globalAlpha = a; fn(BLUE, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.85; fn(PINK, dx, dy); ctx.restore(); }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const hk = b('hook'), tm = b('time'), on = b('once'), br = b('bar'), fl = b('flip');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save();
    // 三张卡片：电量、钱包、时间
    const cardsA = sceneA * (1 - E.seg(t, on.s, on.s + 0.4));
    if (cardsA > 0) {
      const cards = [['电量', 200], ['钱包', 540], ['时间', 880]];
      cards.forEach(([name, cx], i) => {
        const a = E.seg(t, 0.3 + i * 0.4, 0.7 + i * 0.4) * (i === 2 ? E.seg(t, tm.s - 0.4, tm.s) : 1);
        if (a <= 0) return;
        ctx.globalAlpha = cardsA * a;
        ctx.strokeStyle = BLUE; ctx.lineWidth = 5; ctx.strokeRect(cx - 140, 700, 280, 420);
        ctx.fillStyle = BLUE; ctx.font = `900 40px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(name, cx, 770);
        if (i === 0) {   // 电池：充满
          const k = E.ease.inOut(E.seg(t, hk.s + 0.5, hk.s + 1.6));
          ctx.strokeRect(cx - 60, 820, 120, 200); ctx.fillRect(cx - 24, 806, 48, 14);
          riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.fillRect(cx - 52 + dx, 1012 - 184 * (0.1 + 0.9 * k) + dy, 104, 184 * (0.1 + 0.9 * k)); }, cardsA * a);
          ctx.fillStyle = BLUE; ctx.font = `900 34px ${th.cap}`; ctx.fillText(k > 0.95 ? '已充满' : '+ 充电', cx, 1080);
        } else if (i === 1) {   // 钱：一摞硬币长回来
          const k = E.ease.out(E.seg(t, hk.s + 2.0, hk.s + 3.0)), n = Math.round(2 + 6 * k);
          for (let m = 0; m < n; m++) riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(cx + dx, 1010 - m * 24 + dy, 70, 18, 0, 0, Math.PI * 2); ctx.fill(); }, cardsA * a);
          ctx.fillStyle = BLUE; ctx.font = `900 34px ${th.cap}`; ctx.fillText(k > 0.95 ? '赚回来了' : '+ 再挣', cx, 1080);
        } else {   // 沙漏：只往下漏，充值按钮不可用
          const k = E.seg(t, tm.s, tm.e + 4);
          ctx.strokeStyle = BLUE; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 60, 810); ctx.lineTo(cx + 60, 810); ctx.lineTo(cx, 910); ctx.lineTo(cx + 60, 1010); ctx.lineTo(cx - 60, 1010); ctx.lineTo(cx, 910); ctx.closePath(); ctx.stroke();
          riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.beginPath(); const top = 0.85 - 0.6 * k; ctx.moveTo(cx - 60 * top + dx, 910 - 100 * top + dy); ctx.lineTo(cx + 60 * top + dx, 910 - 100 * top + dy); ctx.lineTo(cx + dx, 910 + dy); ctx.fill(); ctx.beginPath(); const bot = 0.15 + 0.6 * k; ctx.moveTo(cx - 60 * bot + dx, 1010 + dy); ctx.lineTo(cx + 60 * bot + dx, 1010 + dy); ctx.lineTo(cx + dx, 1010 - 100 * bot + dy); ctx.fill(); }, cardsA * a);
          const bA = E.seg(t, tm.s + 1.2, tm.s + 1.6);
          ctx.globalAlpha = cardsA * a; ctx.strokeStyle = th.dim; ctx.lineWidth = 3; ctx.strokeRect(cx - 80, 1048, 160, 50);
          ctx.fillStyle = th.dim; ctx.font = `900 30px ${th.cap}`; ctx.fillText('充值', cx, 1084);
          if (bA > 0) { ctx.globalAlpha = cardsA * a * bA; ctx.strokeStyle = th.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx - 60, 1040); ctx.lineTo(cx + 60, 1106); ctx.moveTo(cx + 60, 1040); ctx.lineTo(cx - 60, 1106); ctx.stroke(); ctx.fillStyle = th.red; ctx.fillText('不可用', cx, 1160); }
        }
      });
    }
    // 进度条：高中三年
    const pA = sceneA * E.seg(t, on.s + 0.3, on.s + 0.8);
    if (pA > 0) {
      ctx.globalAlpha = pA;
      const x0 = 140, w = 800, y = 960, h = 70;
      const k = t < br.s ? 0.08 : E.lerp(0.08, 1, E.ease.inOut(E.seg(t, br.s + 0.4, br.s + 3.2)));
      ctx.strokeStyle = BLUE; ctx.lineWidth = 5; ctx.strokeRect(x0, y, w, h);
      riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.fillRect(x0 + 8 + dx, y + 8 + dy, (w - 16) * k, h - 16); }, pA);
      ['高一', '高二', '高三'].forEach((s, i) => { ctx.fillStyle = BLUE; ctx.font = `900 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(s, x0 + w * (i + 0.5) / 3, y + h + 52); if (i) ctx.fillRect(x0 + (w * i) / 3 - 2, y - 14, 4, h + 28); });
      ctx.fillStyle = BLUE; ctx.font = `700 64px ${th.num}`; ctx.textAlign = 'right'; ctx.fillText(Math.round(k * 100) + '%', x0 + w, y - 40);
      // 后退按钮（不可用）
      const rA = E.seg(t, fl.s + 0.2, fl.s + 0.6);
      if (rA > 0) {
        ctx.globalAlpha = pA * rA; ctx.strokeStyle = th.dim; ctx.lineWidth = 4; ctx.strokeRect(x0, y + 160, 260, 80);
        ctx.fillStyle = th.dim; ctx.font = `900 36px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('后退', x0 + 150, y + 214); ctx.beginPath(); ctx.moveTo(x0 + 50, y + 200); ctx.lineTo(x0 + 80, y + 182); ctx.lineTo(x0 + 80, y + 218); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = th.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0 + 10, y + 170); ctx.lineTo(x0 + 250, y + 230); ctx.stroke();
      }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'right';
    ctx.fillText('示意图', 960, 1660);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '时间不能充值，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{今天就用好它}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.6 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
