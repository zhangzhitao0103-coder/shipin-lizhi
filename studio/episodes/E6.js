// E6《学习时，手机放哪？》专注类 · 霓虹科技风
// 依据：Ward、Duke、Gneezy & Bos（2017，《消费者研究协会期刊》，德州大学奥斯汀分校等）：近 800 名参与者，
// 手机放在另一个房间的人工作记忆等测试表现最好，放桌上的最差，即使手机静音、屏幕朝下。柱状高度为示意
(function (root) {
  const EP = {
    id: 'E6',
    title: '学习时手机放哪',
    theme: 'neon',
    voice: { sid: 100 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 104, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'result',
    beats: [
      { id: 'hook', min: 3.0, cap: ['开学了，手机放哪？', '{静音扣在桌上}，行不行？'], voice: '开学了，手机放哪？静音扣在桌上，行不行？', mood: 0.35 },
      { id: 'study', min: 3.8, cap: ['德州大学的一项研究，', '让近 800 人做{专注力测试}。'], voice: '德州大学的一项研究，让近八百人做专注力测试。', mood: 0.45 },
      { id: 'three', min: 3.6, cap: ['手机放桌上、放包里、', '或者放在{另一个房间}。'], voice: '手机放桌上，放包里，或者放在另一个房间。', mood: 0.5, sfx: [{ at: 0.3, type: 'ticks', n: 3, gap: 0.8 }] },
      { id: 'result', min: 3.4, cap: ['手机在另一个房间的人，', '成绩{明显更好}。'], voice: '手机在另一个房间的人，成绩明显更好。', mood: 0.8, sfx: [{ at: 0.4, type: 'boom' }] },
      { id: 'note', min: 3.8, cap: ['就算静音、屏幕朝下，', '只要在眼前，就会[偷走注意力]。'], voice: '就算静音，屏幕朝下，只要在眼前，就会偷走注意力。', mood: 0.6 },
      { id: 'flip', min: 3.6, cap: ['你以为自己没看手机，', '大脑却在{一直忍着不去看}。'], voice: '你以为自己没看手机，大脑却在一直忍着不去看。', mood: 0.6 },
      { id: 'action', min: 3.0, cap: null, voice: '学习的时候，让手机离开房间。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '桌上包里另一个房间可用脑力消费者研究协会期刊德州大学奥斯汀分校等柱状高度为示意学习的时候让手机离开',
  };

  function phone(ctx, x, y, s, glow, th) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#0B0E1F'; ctx.strokeStyle = th.red; ctx.lineWidth = 4; ctx.shadowColor = th.red; ctx.shadowBlur = 20 * glow;
    ctx.beginPath(); ctx.roundRect(-36, -64, 72, 128, 14); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = th.red; ctx.globalAlpha *= 0.6; ctx.fillRect(-26, -50, 52, 96);
    ctx.restore();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, 0.1, 0.6) * (1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      const thA = E.seg(t, b('three').s, b('three').s + 0.4);
      const cols = [[240, '桌上', 0.45], [540, '包里', 0.62], [840, '另一个房间', 0.9]];
      if (t < b('three').s) {
        // 开头：书桌上扣着的手机
        ctx.fillStyle = 'rgba(46,242,255,0.15)'; ctx.fillRect(160, 1100, 760, 16);
        phone(ctx, 700, 1040, 1.1, 0.6 + 0.4 * Math.sin(t * 4), th);
        ctx.fillStyle = th.fg; ctx.fillRect(300, 1030, 220, 70); ctx.fillStyle = '#04050D'; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('作业', 410, 1078);
      } else {
        cols.forEach(([x, lab, cap], i) => {
          const a = thA * E.seg(t, b('three').s + i * 0.8, b('three').s + 0.4 + i * 0.8);
          ctx.globalAlpha = sceneA * a;
          // 场景图标
          if (i === 0) { ctx.fillStyle = 'rgba(46,242,255,0.2)'; ctx.fillRect(x - 110, 860, 220, 12); phone(ctx, x, 800, 0.7, 1, th); }
          if (i === 1) { ctx.strokeStyle = th.dim; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x - 80, 740, 160, 130, 24); ctx.stroke(); phone(ctx, x, 800, 0.45, 0.4, th); }
          if (i === 2) { ctx.strokeStyle = th.gold; ctx.lineWidth = 4; ctx.strokeRect(x - 70, 700, 140, 180); ctx.beginPath(); ctx.arc(x + 40, 790, 6, 0, Math.PI * 2); ctx.stroke(); }
          ctx.fillStyle = th.fg; ctx.font = `700 36px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(lab, x, 940);
          // 可用脑力柱
          const rk = E.ease.out(E.seg(t, b('result').s + 0.2 + i * 0.25, b('result').s + 0.9 + i * 0.25));
          const h = 420 * cap * rk;
          ctx.fillStyle = i === 2 ? th.gold : i === 1 ? '#5E7BC4' : th.red; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 24;
          ctx.fillRect(x - 60, 1440 - h, 120, h); ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = sceneA * E.seg(t, b('result').s + 0.2, b('result').s + 0.6);
        ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(140, 1442); ctx.lineTo(940, 1442); ctx.stroke();
        ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('可用脑力', 140, 1000);
      }
      ctx.globalAlpha = sceneA * 0.85 * E.seg(t, b('study').s, b('study').s + 0.5); ctx.fillStyle = th.dim; ctx.font = `400 20px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('Ward 等，2017，《消费者研究协会期刊》（德州大学奥斯汀分校等）；柱状高度为示意', 540, 1600);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '学习的时候，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
      E.rich(ctx, '让手机{离开房间}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
