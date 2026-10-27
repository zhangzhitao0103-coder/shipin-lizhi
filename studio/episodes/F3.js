// F3《给我一个支点》方法与借力类 · 孔版印刷（Riso）风 · 家长向
// 物理锚点：杠杆平衡条件 F₁L₁ = F₂L₂。示意：动力臂是阻力臂的 6 倍，10 公斤的力即可与 60 公斤的石头平衡
// "给我一个支点，我就能撬动地球"为相传的阿基米德名言
(function (root) {
  const EP = {
    id: 'F3',
    title: '给我一个支点',
    theme: 'riso',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'lever',
    beats: [
      { id: 'hook', min: 3.4, cap: ['一块 60 公斤的石头，', '你只能使出 {10 公斤} 的力。'], voice: '一块六十公斤的石头，你只能使出十公斤的力。', mood: 0.3 },
      { id: 'try', min: 2.8, cap: ['直接搬：', '[纹丝不动]。'], voice: '直接搬，纹丝不动。', mood: 0.35, sfx: [{ at: 0.6, type: 'tick' }, { at: 1.0, type: 'tick' }] },
      { id: 'lever', min: 4.6, cap: ['加一根杠杆，力臂是石头那边的 {6 倍}：', '{10 公斤}，就能撬起 60 公斤。'], voice: '加一根杠杆，力臂是石头那边的六倍，十公斤，就能撬起六十公斤。', mood: 0.7, sfx: [{ at: 2.4, type: 'whoosh' }, { at: 3.2, type: 'ding' }] },
      { id: 'quote', min: 3.8, cap: ['相传阿基米德说：', '“给我一个支点，我就能{撬动地球}。”'], voice: '相传阿基米德说，给我一个支点，我就能撬动地球。', mood: 0.8 },
      { id: 'flip', min: 4.2, cap: ['孩子的力气，不用逼着变大；', '{找对支点}，同样的努力，效果放大几倍。'], voice: '孩子的力气，不用逼着变大。找对支点，同样的努力，效果能放大好几倍。', mood: 0.6 },
      { id: 'who', min: 3.4, cap: ['一位好老师、一个好方法，', '就是孩子的{力臂}。'], voice: '一位好老师，一个好方法，就是孩子的力臂。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '帮孩子，找到那个支点。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '公斤力臂阻力动支点孩子好老师方法杠杆平衡条件示意图石头地球帮找到那个6010×=0123456789',
  };

  const BLUE = '#1D2B6B', PINK = '#FF3EA5', U = 110, PVX = 280, PVY = 1270, GY = PVY + 40;  // PVY = 支点顶（杠杆中线），GY = 地面
  // 双色错版：先印蓝，再叠粉（正片叠底、错开几个像素）
  function riso(ctx, fn, a = 1, dx = 5, dy = 3) {
    ctx.save(); ctx.globalAlpha = a; fn(BLUE, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.85; fn(PINK, dx, dy); ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const tr = b('try'), lv = b('lever'), qt = b('quote'), fl = b('flip'), wh = b('who');
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return drawEnd();
    ctx.save(); ctx.globalAlpha = sceneA;
    // 地面
    ctx.fillStyle = BLUE; ctx.fillRect(80, GY, 920, 5);
    const leverA = E.seg(t, lv.s + 0.2, lv.s + 0.8);
    // 杠杆角度：先是石头端着地（右端翘起），再压下右端把石头抬起
    const up = E.ease.inOut(E.seg(t, lv.s + 2.2, lv.s + 3.2));
    const L2 = U, L1 = 6 * U;
    // 正值 = 右端压下、左端（石头）抬起；两个端点分别刚好碰到地面
    const ang = E.lerp(-Math.asin((GY - PVY - 9) / L2), Math.asin((GY - PVY - 9) / L1), up);
    const sxL = PVX - Math.cos(ang) * L2, syL = PVY - Math.sin(ang) * L2;
    const sxR = PVX + Math.cos(ang) * L1, syR = PVY + Math.sin(ang) * L1;
    // 石头（引用时变成地球）
    const toEarth = E.seg(t, qt.s + 0.3, qt.s + 1.0) * (1 - E.seg(t, fl.s, fl.s + 0.5));
    const stoneX = E.lerp(250, sxL + 10, leverA), stoneY = E.lerp(GY - 72, syL - 9 - 70, leverA);
    const shake = t > tr.s && t < tr.e ? Math.sin(t * 60) * 3 * E.seg(t, tr.s + 0.4, tr.s + 0.6) : 0;
    riso(ctx, (c, dx, dy) => {
      ctx.fillStyle = c;
      if (toEarth > 0.5) { ctx.beginPath(); ctx.arc(stoneX + dx, stoneY + dy, 80, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.beginPath(); ctx.ellipse(stoneX + dx + shake, stoneY + dy, 96, 72, 0, 0, Math.PI * 2); ctx.fill(); }
    }, sceneA);
    ctx.fillStyle = th.bg; ctx.font = `900 34px ${th.cap}`; ctx.textAlign = 'center';
    ctx.fillText(toEarth > 0.5 ? '地球' : '60 公斤', stoneX + shake, stoneY + 12);
    // 小人：开头直接搬石头，后来站到杠杆右端
    const personX = E.lerp(420, sxR - 30, leverA), personY = E.lerp(GY, syR - 9, leverA);
    riso(ctx, (c, dx, dy) => {
      ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(personX + dx, personY - 150 + dy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(personX + dx, personY - 120 + dy); ctx.lineTo(personX + dx, personY - 50 + dy);
      ctx.lineTo(personX - 22 + dx, personY + dy); ctx.moveTo(personX + dx, personY - 50 + dy); ctx.lineTo(personX + 22 + dx, personY + dy);
      ctx.moveTo(personX + dx, personY - 100 + dy); ctx.lineTo(personX - 50 + dx, personY - (leverA > 0 ? 70 : 100) + dy); ctx.stroke();
    }, sceneA);
    ctx.fillStyle = BLUE; ctx.font = `900 30px ${th.cap}`; ctx.textAlign = 'center';
    const kidA = E.seg(t, fl.s + 0.4, fl.s + 0.9);
    ctx.globalAlpha = sceneA; ctx.fillText(kidA > 0.5 ? '孩子' : '10 公斤', personX, personY - 196);
    // 杠杆与支点
    if (leverA > 0) {
      ctx.globalAlpha = sceneA * leverA;
      riso(ctx, (c, dx, dy) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(PVX + dx, PVY + dy); ctx.lineTo(PVX - 44 + dx, GY + dy); ctx.lineTo(PVX + 44 + dx, GY + dy); ctx.closePath(); ctx.fill(); }, sceneA * leverA);
      ctx.save(); ctx.globalAlpha = sceneA * leverA; ctx.translate(PVX, PVY); ctx.rotate(ang); ctx.fillStyle = BLUE; ctx.fillRect(-L2 - 20, -9, L2 + L1 + 20, 18); ctx.restore();
      // 力臂标注
      const dA = E.seg(t, lv.s + 1.0, lv.s + 1.6);
      ctx.globalAlpha = sceneA * dA; ctx.strokeStyle = PINK; ctx.fillStyle = PINK; ctx.lineWidth = 4;
      const yy = GY + 70;
      [[PVX - L2, PVX, '× 1'], [PVX, PVX + L1, '× 6']].forEach(([a, z, s], k) => {
        ctx.beginPath(); ctx.moveTo(a, yy); ctx.lineTo(z, yy); ctx.moveTo(a, yy - 14); ctx.lineTo(a, yy + 14); ctx.moveTo(z, yy - 14); ctx.lineTo(z, yy + 14); ctx.stroke();
        ctx.font = `900 40px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText(s, (a + z) / 2, yy + 56);
      });
      const who = E.seg(t, wh.s + 0.2, wh.s + 0.7);
      if (who > 0) {
        ctx.globalAlpha = sceneA * who; ctx.fillStyle = BLUE; ctx.font = `900 40px ${th.cap}`;
        ctx.fillText('好老师', PVX + L1 * 0.3, yy + 120); ctx.fillText('好方法', PVX + L1 * 0.72, yy + 120);
      }
      // 公式
      const fA = E.seg(t, lv.s + 3.2, lv.s + 3.7) * (1 - E.seg(t, qt.s, qt.s + 0.3));
      if (fA > 0) { ctx.globalAlpha = sceneA * fA; ctx.fillStyle = BLUE; ctx.font = `700 64px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('10 × 6 = 60 × 1', 540, 760); }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'right';
    ctx.fillText('杠杆平衡条件：动力 × 动力臂 = 阻力 × 阻力臂；示意图', 960, 1660);
    ctx.restore();
    drawEnd();

    function drawEnd() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '帮孩子，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{找到那个支点}。', 540, 1030, { theme: th, size: 108, tt: t - ac.s - 0.4 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
