// N4《寒假在家，试试番茄钟》寒假规划类 · 孔版印刷（Riso）风
// 方法：番茄工作法（Francesco Cirillo）：专注 25 分钟 + 休息 5 分钟为一个番茄，中途被打断则该番茄作废重来
// 计算：8 个番茄 × 25 分钟 = 200 分钟 = 3 小时 20 分；30 天 × 8 = 240 个。数量为示意
(function (root) {
  const EP = {
    id: 'N4',
    title: '寒假在家试试番茄钟',
    theme: 'riso',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'lofi', bpm: 80, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'day',
    beats: [
      { id: 'hook', min: 3.4, cap: ['寒假在家坐了一天，', '真正学进去的{有多少}？'], voice: '寒假在家坐了一天，真正学进去的，有多少？', mood: 0.3 },
      { id: 'tomato', min: 4.4, cap: ['试试"番茄钟"：专心 {25 分钟}，', '休息 {5 分钟}，算一个番茄。'], voice: '试试番茄钟，专心二十五分钟，休息五分钟，算一个番茄。', mood: 0.45, sfx: [{ at: 2.6, type: 'ding' }] },
      { id: 'rule', min: 4.2, cap: ['番茄进行中，手机{放远}；', '被打断，这个番茄就[从头再来]。'], voice: '番茄进行中，手机放远。被打断了，这个番茄就从头再来。', mood: 0.5, sfx: [{ at: 2.2, type: 'boom' }] },
      { id: 'day', min: 4.2, cap: ['一天 8 个番茄：', '{3 小时 20 分钟}的专注。'], voice: '一天八个番茄，就是三小时二十分钟的专注。', mood: 0.7, sfx: [{ at: 0.4, type: 'ticks', n: 8, gap: 0.22 }] },
      { id: 'month', min: 4.0, cap: ['寒假 30 天：', '就是 {240 个番茄}。'], voice: '寒假三十天，就是二百四十个番茄。', mood: 0.85, sfx: [{ at: 0.4, type: 'ticks', n: 24, gap: 0.06 }] },
      { id: 'flip', min: 3.6, cap: ['学习不看坐了多久，', '看{专心了多久}。'], voice: '学习不看坐了多久，看专心了多久。', mood: 0.75 },
      { id: 'action', min: 3.0, cap: null, voice: '今天，先完成第一个番茄。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '专心休息分钟番茄个小时天作废重来手机放远番茄工作法数量为示意今天先完成第一0123456789:',
  };

  const BLUE = '#1D2B6B', PINK = '#FF3EA5', RED = '#FF6A2B';
  function riso(ctx, fn, a = 1, dx = 5, dy = 3) { ctx.save(); ctx.globalAlpha = a; fn(BLUE, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.85; fn(PINK, dx, dy); ctx.restore(); }
  function tomato(ctx, x, y, r, a, full = true) {
    riso(ctx, (c, dx, dy) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      if (full) ctx.fill(); else { ctx.lineWidth = Math.max(2, r * 0.18); ctx.strokeStyle = c; ctx.stroke(); }
      ctx.fillRect(x - r * 0.12 + dx, y - r * 1.25 + dy, r * 0.24, r * 0.4);
    }, a);
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const tm = b('tomato'), ru = b('rule'), dy = b('day'), mo = b('month');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s + 1.2, b('flip').s + 1.8)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save();
    // 大番茄计时器（tomato / rule 两拍）
    const clockA = sceneA * E.seg(t, tm.s + 0.2, tm.s + 0.6) * (1 - E.seg(t, dy.s, dy.s + 0.4));
    if (clockA > 0) {
      const CX = 540, CY = 1000, R = 260;
      // 计时：tomato 拍中 25:00 → 0；rule 拍中走到一半被打断，归零重来
      let left = 25 - 25 * E.seg(t, tm.s + 0.6, tm.s + 2.6);
      if (t > tm.s + 2.6 && t < ru.s) left = 5 - 5 * E.seg(t, tm.s + 2.8, ru.s);   // 休息 5 分钟
      const brk = t > ru.s + 2.2;
      if (t >= ru.s) left = brk ? 25 : 25 - 12 * E.seg(t, ru.s + 0.2, ru.s + 2.2);
      const resting = t > tm.s + 2.6 && t < ru.s;
      tomato(ctx, CX, CY, R, clockA);
      ctx.save(); ctx.globalAlpha = clockA; ctx.strokeStyle = th.bg; ctx.lineWidth = 22; ctx.lineCap = 'round';
      const total = resting ? 5 : 25; ctx.beginPath(); ctx.arc(CX, CY, R - 50, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * left) / total); ctx.stroke();
      ctx.fillStyle = th.bg; ctx.font = `700 110px ${th.mono}`; ctx.textAlign = 'center';
      const mm = Math.floor(left), ss = Math.floor((left - mm) * 60);
      ctx.fillText(String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), CX, CY + 36);
      ctx.font = `900 40px ${th.cap}`; ctx.fillText(resting ? '休息' : brk ? '被打断 · 从头再来' : '专心', CX, CY + 110);
      ctx.restore();
      // 手机
      const pA = E.seg(t, ru.s + 0.3, ru.s + 0.7);
      if (pA > 0) {
        const near = t > ru.s + 1.6, px = 900 + (near && t < ru.s + 2.4 ? Math.sin(t * 60) * 8 : 0);  // 手机响了：抖动
        riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(px - 50 + dx, 1290 + dy, 100, 180, 16); ctx.fill(); }, clockA * pA);
        ctx.save(); ctx.globalAlpha = clockA * pA; ctx.fillStyle = th.bg; ctx.font = `900 26px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(near ? '叮！' : '放远', px, 1390); ctx.restore();
      }
    }
    // 一天 8 个番茄
    const dA = sceneA * E.seg(t, dy.s + 0.3, dy.s + 0.7) * (1 - E.seg(t, mo.s, mo.s + 0.4));
    if (dA > 0) {
      for (let i = 0; i < 8; i++) {
        const a = E.seg(t, dy.s + 0.4 + i * 0.22, dy.s + 0.6 + i * 0.22);
        tomato(ctx, 210 + (i % 4) * 220, 820 + Math.floor(i / 4) * 260, 80, dA * a);
      }
      ctx.save(); ctx.globalAlpha = dA * E.seg(t, dy.s + 2.4, dy.s + 2.8); ctx.fillStyle = BLUE; ctx.font = `700 64px ${th.num}`; ctx.textAlign = 'center';
      ctx.fillText('8 × 25 分钟 = 3 小时 20 分', 540, 1400); ctx.restore();
    }
    // 寒假 30 天 × 8
    const mA = sceneA * E.seg(t, mo.s + 0.3, mo.s + 0.7);
    if (mA > 0) {
      const n = Math.round(240 * E.seg(t, mo.s + 0.4, mo.s + 2.0));
      for (let i = 0; i < n; i++) {
        const c = i % 15, r = Math.floor(i / 15);
        tomato(ctx, 150 + c * 56, 640 + r * 52, 18, mA, true);
      }
      ctx.save(); ctx.globalAlpha = mA; ctx.fillStyle = BLUE; ctx.font = `700 64px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText(n + ' 个番茄', 540, 1540); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'right';
    ctx.fillText('番茄工作法（Cirillo）：25 分钟专注 + 5 分钟休息；数量为示意', 960, 1660); ctx.restore();
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '今天，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{先完成第一个番茄}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
