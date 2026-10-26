// K6《孩子每天该睡几个小时？》家长类 · 流光渐变风
// 依据：教育部办公厅《关于进一步加强中小学生睡眠管理工作的通知》（2021）：高中生每天睡眠时间应达到 8 小时；
// 睡眠期间大脑进行记忆巩固。示例：每天只睡 6 小时，一周少睡 14 小时
(function (root) {
  const EP = {
    id: 'K6',
    title: '孩子每天该睡几个小时',
    theme: 'glass',
    voice: { sid: 40 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C'] },
    cover: 'debt',
    beats: [
      { id: 'hook', min: 2.8, cap: ['孩子每天睡几个小时，', '你{知道吗}？'], voice: '孩子每天睡几个小时，你知道吗？', mood: 0.3 },
      { id: 'rule', min: 3.6, cap: ['教育部要求：', '高中生每天睡眠应达到 {8 小时}。'], voice: '教育部要求，高中生每天睡眠应达到八小时。', mood: 0.4, sfx: [{ at: 0.4, type: 'ding' }] },
      { id: 'six', min: 2.6, cap: ['如果每天只睡 [6 小时]——'], voice: '如果每天只睡六个小时——', mood: 0.5 },
      { id: 'debt', min: 3.8, cap: ['一周就欠下 [14 小时]，', '相当于少睡了{将近两个晚上}。'], voice: '一周就欠下十四个小时，相当于少睡了将近两个晚上。', mood: 0.75, sfx: [{ at: 0.3, type: 'ticks', n: 7, gap: 0.22 }] },
      { id: 'brain', min: 3.8, cap: ['睡觉的时候，大脑并没有休息：', '它在{整理白天学过的东西}。'], voice: '睡觉的时候，大脑并没有休息，它在整理白天学过的东西。', mood: 0.6 },
      { id: 'flip', min: 3.6, cap: ['熬夜多学的那一小时，', '可能正在[挤掉]白天学会的内容。'], voice: '熬夜多学的那一小时，可能正在挤掉白天学会的内容。', mood: 0.6 },
      { id: 'tip', min: 3.4, cap: ['比起盯着孩子学到几点，', '不如{守住孩子的睡眠}。'], voice: '比起盯着孩子学到几点，不如守住孩子的睡眠。', mood: 0.8 },
      { id: 'action', min: 3.0, cap: null, voice: '睡够了，学进去的才留得住。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '睡眠小时一二三四五六日周欠下教育部办公厅关于进一步加强中小学生管理工作的通知年记忆整理够了学进去才留得住0123456789',
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    // 月亮
    ctx.save(); ctx.globalAlpha = E.seg(t, 0, 1) * 0.9; ctx.fillStyle = '#FFF4D6'; ctx.shadowColor = '#FFF4D6'; ctx.shadowBlur = 40;
    ctx.beginPath(); ctx.arc(860, 560, 46, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(880, 548, 40, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    // 24 小时环：8 小时 vs 6 小时
    const rb = b('rule');
    const ringA = E.seg(t, rb.s + 0.2, rb.s + 0.8) * (1 - E.seg(t, b('debt').s, b('debt').s + 0.4));
    if (ringA > 0) {
      const cx = 540, cy = 1060, R = 260;
      E.glassCard(ctx, cx - 380, cy - 380, 760, 760, ringA, 380);
      ctx.save(); ctx.globalAlpha = ringA;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 60; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const six = t > b('six').s;
      const hrs = six ? E.lerp(8, 6, E.ease.inOut(E.seg(t, b('six').s + 0.2, b('six').s + 1.0))) : 8 * E.ease.inOut(E.seg(t, rb.s + 0.4, rb.s + 1.4));
      const a0 = -Math.PI / 2 - (2 / 24) * Math.PI * 2; // 22:00 起
      ctx.strokeStyle = six ? th.red : th.gold; ctx.lineWidth = 56; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0 + (six ? (2 / 24) * Math.PI * 2 * E.seg(t, b('six').s + 0.2, b('six').s + 1.0) : 0), a0 + (hrs / 24) * Math.PI * 2 + (six ? (2 / 24) * Math.PI * 2 * E.seg(t, b('six').s + 0.2, b('six').s + 1.0) : 0)); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = th.fg; ctx.font = `700 120px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText(hrs.toFixed(0), cx, cy + 30);
      ctx.font = `500 36px ${th.cap}`; ctx.fillText('小时睡眠', cx, cy + 90);
      ctx.restore();
    }
    // 睡眠债：一周 7 天
    const db = b('debt');
    const dA = E.seg(t, db.s + 0.1, db.s + 0.5) * (1 - E.seg(t, b('brain').s, b('brain').s + 0.4));
    if (dA > 0) {
      ctx.save(); ctx.globalAlpha = dA;
      const days = ['一', '二', '三', '四', '五', '六', '日'];
      days.forEach((d, i) => {
        const x = 150 + i * 116, p = E.ease.out(E.seg(t, db.s + 0.3 + i * 0.22, db.s + 0.6 + i * 0.22));
        E.glassCard(ctx, x, 820, 96, 400, dA, 18);
        ctx.globalAlpha = dA; ctx.fillStyle = th.gold; ctx.fillRect(x + 12, 1210 - 6 * 44, 72, 6 * 44 - 8);
        ctx.fillStyle = th.red; ctx.globalAlpha = dA * p; ctx.fillRect(x + 12, 1210 - 8 * 44, 72, 2 * 44 - 6);
        ctx.globalAlpha = dA; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(d, x + 48, 1270);
      });
      const tot = Math.round(14 * E.seg(t, db.s + 0.3, db.s + 1.9));
      ctx.fillStyle = th.red; ctx.font = `700 90px ${th.num}`; ctx.fillText('−' + tot + ' 小时', 540, 1420);
      ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.fillText('红色 = 每晚少睡的 2 小时', 540, 1480);
      ctx.restore();
    }
    // 记忆整理：散乱的点排成整齐的方阵
    const bb = b('brain');
    const mA = E.seg(t, bb.s + 0.1, bb.s + 0.5) * (1 - E.seg(t, b('tip').s, b('tip').s + 0.4));
    if (mA > 0) {
      const r = E.rng(66), sortK = E.ease.inOut(E.seg(t, bb.s + 0.8, bb.s + 2.8));
      const flipK = E.seg(t, b('flip').s + 0.6, b('flip').s + 1.6);
      ctx.save(); ctx.globalAlpha = mA;
      E.glassCard(ctx, 160, 760, 760, 760, mA, 40);
      for (let i = 0; i < 100; i++) {
        const x0 = 200 + r() * 680, y0 = 800 + r() * 680, gx = 260 + (i % 10) * 62, gy = 860 + Math.floor(i / 10) * 62;
        const lost = i >= 70 && flipK > (i - 70) / 30;
        ctx.globalAlpha = mA * (lost ? 0.15 : 1);
        ctx.fillStyle = lost ? th.red : th.gold; ctx.beginPath(); ctx.arc(E.lerp(x0, gx, sortK), E.lerp(y0, gy, sortK), 14, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.85 * E.seg(t, rb.s, rb.s + 0.6) * (1 - E.seg(t, b('action').s, b('action').s + 0.3)); ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('教育部办公厅《关于进一步加强中小学生睡眠管理工作的通知》（2021）', 540, 1640); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '睡够了，', 540, 880, { theme: th, size: 96, tt: t - ac.s - 0.1 });
      E.rich(ctx, '学进去的{才留得住}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.5, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
