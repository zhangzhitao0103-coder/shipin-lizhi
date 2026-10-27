// M5《考前 10 分钟，把担心写下来》期末冲刺类 · 水彩风
// 依据：Ramirez & Beilock（2011，Science，芝加哥大学）：考前用 10 分钟写下对考试的担心，成绩更好；考试焦虑越高的学生提升越明显
// 担心会占用工作记忆。画面中"工作记忆"占用比例为示意
(function (root) {
  const WORRIES = ['万一考砸了', '最后一道大题', '时间不够', '被爸妈说', '排名掉了'];

  const EP = {
    id: 'M5',
    title: '考前10分钟把担心写下来',
    theme: 'watercolor',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'bell', bpm: 80, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'] },
    cover: 'exp',
    beats: [
      { id: 'hook', min: 3.4, cap: ['考试前，脑子里{全是担心}：', '万一考砸了怎么办？'], voice: '考试前，脑子里全是担心，万一考砸了怎么办？', mood: 0.35, sfx: [{ at: 0.6, type: 'ticks', n: 5, gap: 0.35 }] },
      { id: 'why', min: 4.4, cap: ['担心会{占用}你的工作记忆，', '就像手机后台开了[太多程序]。'], voice: '担心会占用你的工作记忆，就像手机后台，开了太多程序。', mood: 0.4 },
      { id: 'exp', min: 4.8, cap: ['芝加哥大学的研究：考前花 10 分钟，', '把担心{写在纸上}，考得更好。'], voice: '芝加哥大学的研究发现，考前花十分钟，把担心写在纸上，考得更好。', mood: 0.6, sfx: [{ at: 1.6, type: 'whoosh' }] },
      { id: 'most', min: 3.6, cap: ['越是焦虑的同学，', '{提升越明显}。'], voice: '越是焦虑的同学，提升越明显。', mood: 0.7 },
      { id: 'how', min: 4.6, cap: ['写什么都行："我怕最后一道大题"，', '"我怕考不好被说"——{写出来就行}。'], voice: '写什么都行。我怕最后一道大题，我怕考不好被说，写出来就行。', mood: 0.6 },
      { id: 'action', min: 3.0, cap: null, voice: '把担心写下来，把脑子留给考试。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: WORRIES.join('') + '工作记忆占用担心写下来我怕把脑子留给考试芝加哥大学研究比例为示意%0123456789',
  };

  const HX = 540, HY = 960, HR = 260;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const wy = b('why'), ex = b('exp'), mo = b('most'), hw = b('how');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save(); ctx.globalAlpha = sceneA;
    const out = E.ease.inOut(E.seg(t, ex.s + 1.2, ex.s + 3.2));     // 担心从脑袋移到纸上
    const headX = E.lerp(HX, 380, E.seg(t, ex.s + 0.2, ex.s + 1.0));
    // 头部轮廓（水彩）
    E.wash(ctx, headX, HY, HR, '120,170,220', 41, 0.9);
    ctx.strokeStyle = th.fg; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(headX, HY, HR * 0.78, 0, Math.PI * 2); ctx.stroke();
    // 纸
    const pA = E.seg(t, ex.s + 0.6, ex.s + 1.2);
    const PX = 760, PY = 820, PW = 250, PH = 380;
    if (pA > 0) {
      ctx.globalAlpha = sceneA * pA; ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(60,40,20,0.2)'; ctx.shadowBlur = 20; ctx.fillRect(PX, PY, PW, PH); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(47,127,184,0.25)'; ctx.lineWidth = 2; for (let y = PY + 60; y < PY + PH; y += 56) { ctx.beginPath(); ctx.moveTo(PX + 20, y); ctx.lineTo(PX + PW - 20, y); ctx.stroke(); }
      ctx.globalAlpha = sceneA;
    }
    // 担心气泡
    WORRIES.forEach((w, i) => {
      const a = E.seg(t, 0.5 + i * 0.35, 0.8 + i * 0.35);
      if (a <= 0) return;
      const ang = -2.4 + i * 1.2, r = 120 + (i % 2) * 50;
      const x0 = headX + Math.cos(ang) * r * 0.9 + Math.sin(t * 2 + i) * 6, y0 = HY + Math.sin(ang) * r * 0.8 + Math.cos(t * 1.7 + i) * 6;
      const k = E.clamp(out * 5 - i * 0.9), x1 = PX + PW / 2, y1 = PY + 50 + i * 56;
      const x = E.lerp(x0, x1, k), y = E.lerp(y0, y1, k);
      ctx.globalAlpha = sceneA * a;
      if (k < 0.95) { ctx.fillStyle = 'rgba(217,88,74,0.16)'; ctx.beginPath(); ctx.ellipse(x, y - 10, 110, 36, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = k > 0.95 ? th.fg : th.red; ctx.font = `700 ${k > 0.95 ? 28 : 32}px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(w, x, y);
    });
    // 工作记忆占用条
    const mA = E.seg(t, wy.s + 0.3, wy.s + 0.8);
    if (mA > 0) {
      const used = E.lerp(E.lerp(20, 85, E.ease.out(E.seg(t, wy.s + 0.4, wy.s + 1.6))), 25, out);
      ctx.globalAlpha = sceneA * mA; ctx.fillStyle = th.fg; ctx.font = `700 32px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('工作记忆 · 被担心占用', 140, 1340);
      ctx.fillStyle = 'rgba(44,58,71,0.12)'; ctx.fillRect(140, 1370, 800, 44);
      ctx.fillStyle = used > 50 ? th.red : th.gold; ctx.fillRect(140, 1370, 800 * used / 100, 44);
      ctx.font = `700 34px ${th.mono}`; ctx.textAlign = 'right'; ctx.fillText(Math.round(used) + '%', 940, 1460);
    }
    // 焦虑越高，提升越明显
    const gA = E.seg(t, mo.s + 0.3, mo.s + 0.8) * (1 - E.seg(t, hw.s, hw.s + 0.4));
    if (gA > 0) { ctx.globalAlpha = sceneA * gA; ctx.fillStyle = th.gold; ctx.font = `700 38px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('越焦虑 → 写下来帮助越大', 540, 1540); }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('Ramirez & Beilock（2011，Science）；工作记忆占用比例为示意', 540, 1650);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '把担心写下来，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{把脑子留给考试}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
