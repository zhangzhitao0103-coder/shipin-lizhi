// A1《高考还剩 226 天》时间类 · 霓虹科技风
// 计算：2026-10-24 → 2027-06-07 共 226 天；按作息估算每天自主时间 6 小时 → 1356 小时 ≈ 56.5 天；每天刷 1 小时手机 = 226 小时 ≈ 9.4 天
(function (root) {
  const DAYS = 226, FREE = 6, FREE_DAYS = (DAYS * FREE) / 24, PHONE_DAYS = DAYS / 24;
  const SEGS = [['睡觉', 7, '#5B4BFF'], ['上课', 8, '#2E7BFF'], ['吃饭·洗漱·通勤', 3, '#55607E'], ['属于你', 6, '#2EF2FF']];

  const EP = {
    id: 'A1',
    title: '高考还剩226天',
    theme: 'neon',
    voice: { sid: 58 },
    capY: 360, capSize: 64,
    music: { style: 'pulse', bpm: 100, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B', 'Em', 'C'] },
    cover: 'mult',
    beats: [
      { id: 'hook', min: 3.2, cap: ['距离 2027 高考，', '还有 {226} 天。'], voice: '距离二零二七年高考，还有二百二十六天。', mood: 0.4, sfx: [{ at: 0.2, type: 'ticks', n: 8, gap: 0.08 }] },
      { id: 'q', min: 3.4, cap: ['听起来很多？', '算一算，一天有几小时{属于你}。'], voice: '听起来很多？算一算，一天到底有几个小时属于你。', mood: 0.4 },
      { id: 'ring', min: 4.4, cap: ['睡觉 7 小时，上课 8 小时，', '吃饭、洗漱、通勤 3 小时。'], voice: '睡觉七小时，上课八小时，吃饭、洗漱、通勤三小时。', mood: 0.5, sfx: [{ at: 0.3, type: 'ticks', n: 3, gap: 0.9 }] },
      { id: 'left', min: 2.6, cap: ['剩下的，只有 {6} 小时。'], voice: '剩下的，只有六个小时。', mood: 0.55, sfx: [{ at: 0.2, type: 'ding' }] },
      { id: 'mult', min: 4.4, cap: ['226 天 × 6 小时 = 1356 小时，', '折合 {56} 天。'], voice: '二百二十六天乘六小时，是一千三百五十六小时，折合五十六天。', mood: 0.8, sfx: [{ at: 0, type: 'riser', dur: 2.0 }, { at: 2.0, type: 'boom' }] },
      { id: 'phone', min: 3.2, cap: ['如果每天再刷 1 小时手机，', '又少 [9] 天。'], voice: '如果每天再刷一小时手机，又少九天。', mood: 0.7 },
      { id: 'flip', min: 3.4, cap: ['倒计时上的数字很大，', '真正属于你的，{很少}。'], voice: '倒计时上的数字很大，真正属于你的，很少。', mood: 0.5, capY: 860, capSize: 70 },
      { id: 'action', min: 3.2, cap: null, voice: '从今天起，把每一小时，都过成自己的。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: 'DAYSLEFT距高考截至2026.10.24按年月日作息为估算可实际调整睡觉上课吃饭洗漱通勤属于你小时天×=≈折合手机从今起把每一都过成自己的h',
  };

  function flicker(t, seed) { const v = Math.sin(t * 37 + seed) * Math.sin(t * 13.7 + seed * 2); return v > 0.93 ? 0.4 : 1; }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const cyan = th.gold, pink = th.red;

    // 倒计时大数字：开头居中，之后缩到顶部
    const up = E.ease.inOut(E.seg(t, b('q').s, b('q').s + 0.8));
    const cdA = 1 - E.seg(t, b('mult').s - 0.2, b('mult').s + 0.3);
    if (cdA > 0) {
      const n = Math.round(E.lerp(300, DAYS, E.ease.outExpo(E.seg(t, 0.15, 1.3))));
      const y = E.lerp(1000, 600, up), sz = E.lerp(330, 120, up);
      ctx.save(); ctx.globalAlpha = cdA * E.seg(t, 0, 0.3) * flicker(t, 1); ctx.textAlign = 'center';
      ctx.font = `700 ${sz}px ${th.mono}`; ctx.fillStyle = th.goldHi; ctx.shadowColor = cyan; ctx.shadowBlur = 50;
      ctx.fillText(String(n), 540, y); ctx.shadowBlur = 0;
      ctx.font = `500 ${E.lerp(30, 22, up)}px ${th.mono}`; ctx.fillStyle = th.dim; ctx.letterSpacing = '6px';
      ctx.fillText('DAYS LEFT · 距 2027 高考', 540, y - sz * 0.82); ctx.letterSpacing = '0px';
      ctx.globalAlpha = cdA * (1 - up); ctx.font = `400 26px "Noto Sans SC"`; ctx.fillText('截至 2026.10.24', 540, y + 70);
      ctx.restore();
    }

    // 24 小时环
    const ringA = E.seg(t, b('q').s + 0.6, b('q').s + 1.3) * (1 - E.seg(t, b('mult').s, b('mult').s + 0.5));
    if (ringA > 0) {
      const cx = 540, cy = 1080, R = 270, wR = 54;
      ctx.save(); ctx.globalAlpha = ringA;
      ctx.strokeStyle = th.faint; ctx.lineWidth = wR; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = th.dim; ctx.lineWidth = 2;
      for (let h = 0; h < 24; h++) { const a = -Math.PI / 2 + (h / 24) * Math.PI * 2, r1 = R + wR / 2 + 8, r2 = r1 + (h % 6 ? 8 : 18); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke(); }
      let acc = 0;
      SEGS.forEach(([name, hrs, col], i) => {
        const st = i < 3 ? b('ring').s + 0.3 + i * 0.9 : b('left').s + 0.1;
        const p = E.ease.inOut(E.seg(t, st, st + 0.7));
        const a0 = -Math.PI / 2 + (acc / 24) * Math.PI * 2, a1 = a0 + (hrs / 24) * Math.PI * 2 * p;
        if (p > 0) {
          ctx.strokeStyle = col; ctx.lineWidth = wR - 6; ctx.lineCap = 'butt';
          if (i === 3) { ctx.shadowColor = col; ctx.shadowBlur = 30 + 12 * Math.sin(t * 5); }
          ctx.beginPath(); ctx.arc(cx, cy, R, a0 + 0.012, a1 - 0.012); ctx.stroke(); ctx.shadowBlur = 0;
          const am = (a0 + a0 + (hrs / 24) * Math.PI * 2) / 2, lr = R + wR + 70;
          ctx.globalAlpha = ringA * E.seg(p, 0.6, 1); ctx.fillStyle = i === 3 ? th.goldHi : th.fg; ctx.textAlign = 'center';
          ctx.font = `700 ${i === 3 ? 36 : 31}px "Noto Sans SC"`; ctx.fillText(name, cx + Math.cos(am) * lr, cy + Math.sin(am) * lr);
          ctx.font = `700 ${i === 3 ? 34 : 26}px ${th.mono}`; ctx.fillStyle = col === '#55607E' ? th.dim : col; ctx.fillText(hrs + 'h', cx + Math.cos(am) * lr, cy + Math.sin(am) * lr + 38);
          ctx.globalAlpha = ringA;
        }
        acc += hrs;
      });
      // 中心数字：剩余小时
      const used = SEGS.slice(0, 3).reduce((s, [, h], i) => s + h * E.ease.inOut(E.seg(t, b('ring').s + 0.3 + i * 0.9, b('ring').s + 1.0 + i * 0.9)), 0);
      ctx.textAlign = 'center'; ctx.font = `700 120px ${th.mono}`; ctx.fillStyle = t > b('left').s ? th.goldHi : th.fg;
      if (t > b('left').s) { ctx.shadowColor = cyan; ctx.shadowBlur = 40; }
      const num = String(Math.round(24 - used)); const nw = ctx.measureText(num).width;
      ctx.fillText(num, cx - 14, cy + 40); ctx.shadowBlur = 0;
      ctx.font = `500 44px ${th.mono}`; ctx.textAlign = 'left'; ctx.fillText('h', cx - 14 + nw / 2 + 6, cy + 40);
      ctx.restore();
    }

    // 226 个天格 → 只有 56.5 天属于你；手机再吃掉 9.4 天
    const gridA = E.seg(t, b('mult').s + 0.2, b('mult').s + 0.8) * (1 - 0.75 * E.seg(t, b('flip').s, b('flip').s + 0.6)) * (1 - E.seg(t, b('action').s - 0.2, b('action').s + 0.4) * 0.6);
    if (gridA > 0) {
      const C = 15, P = 50, S = 42, x0 = 540 - (C * P) / 2 + 4, y0 = 640;
      const fill = FREE_DAYS * E.ease.inOut(E.seg(t, b('mult').s + 0.9, b('mult').s + 2.1));
      const phone = PHONE_DAYS * E.ease.inOut(E.seg(t, b('phone').s + 1.4, b('phone').s + 2.4));
      ctx.save(); ctx.globalAlpha = gridA;
      for (let i = 0; i < DAYS; i++) {
        const x = x0 + (i % C) * P, y = y0 + Math.floor(i / C) * P;
        const ap = E.seg(t, b('mult').s + 0.2 + i * 0.0025, b('mult').s + 0.5 + i * 0.0025);
        ctx.globalAlpha = gridA * ap;
        ctx.strokeStyle = 'rgba(110,127,163,0.45)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, S, S);
        const f = E.clamp(fill - i);
        if (f > 0) {
          const isPhone = i >= FREE_DAYS - phone - 0.001 && phone > 0;
          ctx.fillStyle = isPhone ? pink : cyan; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
          ctx.globalAlpha = gridA * ap * (isPhone ? 0.9 : 0.85);
          ctx.fillRect(x + 3, y + 3, (S - 5) * f, S - 5); ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = gridA; ctx.textAlign = 'left'; ctx.font = `700 34px "Noto Sans SC"`; ctx.fillStyle = th.fg;
      ctx.fillText('226 天', x0, y0 - 30);
      ctx.textAlign = 'right'; ctx.fillStyle = cyan; ctx.shadowColor = cyan; ctx.shadowBlur = 16;
      const showDays = phone > 0 ? (FREE_DAYS - phone) : fill;
      ctx.fillText('属于你：' + Math.floor(showDays + 1e-6) + ' 天', x0 + C * P - 8, y0 - 30);
      if (phone > 0.5) { ctx.fillStyle = pink; ctx.shadowColor = pink; ctx.fillText('手机：−' + phone.toFixed(1) + ' 天', x0 + C * P - 8, y0 + 16 * P + 50); }
      ctx.restore();
    }

    ctx.save(); ctx.globalAlpha = 0.75 * E.seg(t, 0.5, 1.2) * (1 - E.seg(t, b('action').s, b('action').s + 0.4)); ctx.fillStyle = th.dim; ctx.textAlign = 'center'; ctx.font = `400 22px "Noto Sans SC"`;
    ctx.fillText('按 2027 年 6 月 7 日高考、截至 2026 年 10 月 24 日计算；作息为估算，可按实际调整', 540, 1700); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '从今天起，把每一小时，', 540, 900, { theme: th, size: 74, tt: t - ac.s - 0.1 });
      E.rich(ctx, '都过成{自己的}。', 540, 1040, { theme: th, size: 100, tt: t - ac.s - 0.8, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
