// E4《边写作业边回消息，代价有多大？》专注类 · 蓝图工程风
// 依据：美国心理学会（APA）引用 Rubinstein, Meyer & Evans（2001）等研究：频繁切换任务，最多可损失约 40% 的有效时间。
// 示意：晚上 3 小时，按最多损失 40% 计，约 1.2 小时被切换吃掉
(function (root) {
  const EP = {
    id: 'E4',
    title: '边写作业边回消息代价有多大',
    theme: 'blueprint',
    voice: { sid: 90 },
    capY: 360, capSize: 62,
    music: { style: 'pulse', bpm: 100, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C', 'G', 'D'] },
    cover: 'calc',
    beats: [
      { id: 'hook', min: 3.0, cap: ['边写作业边回消息，', '是不是{效率更高}？'], voice: '边写作业边回消息，是不是效率更高？', mood: 0.35 },
      { id: 'study', min: 4.4, cap: ['美国心理学会引用的研究发现：', '来回切换任务，最多会损失 {40%} 的有效时间。'], voice: '美国心理学会引用的研究发现，来回切换任务，最多会损失百分之四十的有效时间。', mood: 0.5 },
      { id: 'why', min: 3.6, cap: ['每次切回来，大脑都要', '{重新找回刚才的思路}。'], voice: '每次切回来，大脑都要重新找回刚才的思路。', mood: 0.5, sfx: [{ at: 0.4, type: 'ticks', n: 6, gap: 0.25 }] },
      { id: 'calc', min: 3.8, cap: ['晚上学 3 小时，', '可能有 [1 个多小时] 被切换吃掉。'], voice: '晚上学三小时，可能有一个多小时，被切换吃掉。', mood: 0.8, sfx: [{ at: 0.5, type: 'boom' }] },
      { id: 'flip', min: 3.4, cap: ['作业写得慢，', '不一定是不会，可能是[太分心]。'], voice: '作业写得慢，不一定是不会，可能是太分心。', mood: 0.6 },
      { id: 'action', min: 3.0, cap: null, voice: '一次只做一件事，做完再看手机。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '专注切换数学英语物理消息有效时间小时分钟图号比例美国心理学会引用一次只做一件事做完再看手机0123456789%.',
  };

  const X0 = 150, X1 = 930, MIN = 180;
  const SX = m => X0 + (m / MIN) * (X1 - X0);

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, b('study').s - 0.2, b('study').s + 0.4) * (1 - 0.85 * E.seg(t, b('flip').s, b('flip').s + 0.4)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    // 开头：作业本 + 不断亮起的消息
    const hA = E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('study').s - 0.2, b('study').s + 0.3));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.strokeRect(260, 820, 360, 460);
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(290, 880 + i * 48); ctx.lineTo(590, 880 + i * 48); ctx.globalAlpha = hA * 0.4; ctx.stroke(); }
      ctx.globalAlpha = hA; ctx.strokeRect(680, 900, 150, 280);
      for (let k = 0; k < 3; k++) {
        const a = E.seg(t, 0.5 + k * 0.6, 0.8 + k * 0.6); if (a <= 0) continue;
        ctx.globalAlpha = hA * a; ctx.fillStyle = th.gold; ctx.beginPath(); ctx.roundRect(694, 930 + k * 70, 122, 52, 10); ctx.fill();
      }
      ctx.restore();
    }
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      const subj = [['数学', '#7FB6FF'], ['英语', '#9BE3C4'], ['物理', '#FFC97A']];
      // 第一条：专注
      const y1 = 820, y2 = 1120, hh = 90;
      const p1 = E.ease.inOut(E.seg(t, b('study').s + 0.6, b('study').s + 2.0));
      ctx.fillStyle = th.fg; ctx.font = `700 32px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('专注：一次做一件', X0, y1 - 24);
      subj.forEach(([n, c], i) => {
        const s0 = i * 60, s1 = s0 + 60, k = E.clamp(p1 * 3 - i);
        if (k <= 0) return;
        ctx.fillStyle = c; ctx.fillRect(SX(s0) + 2, y1, (SX(s1) - SX(s0) - 4) * k, hh);
        ctx.fillStyle = '#0B3463'; ctx.font = `700 30px "Noto Sans SC"`; ctx.textAlign = 'center'; if (k > 0.5) ctx.fillText(n, (SX(s0) + SX(s1)) / 2, y1 + 56);
      });
      // 第二条：来回切换（每 15 分钟切一次，每次切换损失 6 分钟，示意）
      const p2 = E.ease.inOut(E.seg(t, b('why').s + 0.2, b('why').s + 2.6));
      ctx.fillStyle = th.fg; ctx.font = `700 32px "Noto Sans SC"`; ctx.textAlign = 'left'; ctx.fillText('来回切换：写一会儿，回一下消息', X0, y2 - 24);
      let m = 0, lost = 0, k2 = 0;
      while (m < MIN) {
        const work = 9, sw = 6, idx = k2 % 3;
        const vis = E.clamp((p2 * MIN - m) / work);
        if (vis > 0) { ctx.fillStyle = subj[idx][1]; ctx.fillRect(SX(m) + 1, y2, (SX(m + work) - SX(m) - 2) * vis, hh); }
        const vis2 = E.clamp((p2 * MIN - m - work) / sw);
        if (vis2 > 0) { ctx.fillStyle = th.red; ctx.fillRect(SX(m + work) + 1, y2, (SX(m + work + sw) - SX(m + work) - 2) * vis2, hh); lost += sw * vis2; }
        m += work + sw; k2++;
      }
      ctx.fillStyle = th.red; ctx.font = `700 30px "Noto Sans SC"`; ctx.textAlign = 'right'; ctx.fillText('红色 = 切换成本', X1, y2 + hh + 46);
      // 刻度
      ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.mono}`; ctx.textAlign = 'center';
      [0, 60, 120, 180].forEach(v => ctx.fillText(v + ' min', SX(v), y2 + hh + 100));
      // 结果
      const cA = E.seg(t, b('calc').s + 0.3, b('calc').s + 0.8);
      if (cA > 0) {
        ctx.globalAlpha = sceneA * cA; ctx.textAlign = 'center';
        ctx.fillStyle = th.red; ctx.font = `700 96px ${th.mono}`; ctx.fillText('−' + (lost / 60).toFixed(1) + ' 小时', 540, 1500);
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 20px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('APA 引用 Rubinstein, Meyer & Evans（2001）等研究；切换示意按最多损失 40% 计', 540, 1600);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '一次只做一件事，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{做完再看手机}。', 540, 1030, { theme: th, size: 100, tt: t - ac.s - 0.6, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
