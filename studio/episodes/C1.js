// C1《99℃ 和 100℃》坚持类 · 暗金电影风
// 物理锚点（每克水、1 个标准大气压）：比热容约 4.18 J/(g·℃)，0→100℃ 需 418 J；汽化热 2257 J/g，是前者的 5.4 倍
(function (root) {
  const C = 4.18, HEAT = 418, VAP = 2257, TOTAL = HEAT + VAP;

  const EP = {
    id: 'C1',
    title: '99℃和100℃',
    theme: 'cinema',
    capY: 380,
    capSize: 66,
    music: { style: 'cinema', key: 'D', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Gm', 'Bb', 'A', 'Dm', 'Bb', 'F', 'C', 'Bb', 'F'] },
    cover: 'reveal',
    beats: [
      { id: 'hook', min: 3.4, cap: ['烧开一壶水，', '最难的，是{哪一步}？'], voice: '烧开一壶水，最难的，是哪一步？', mood: 0.25 },
      { id: 'rule', min: 3.6, cap: ['1 克水，每升高 {1℃}，', '需要约 {4.18} 焦耳的热量。'], voice: '一克水，每升高一度，大约需要四点一八焦耳。', mood: 0.3, sfx: [{ at: 1.6, type: 'tick' }] },
      { id: 'heat', min: 4.2, cap: ['30℃，60℃，90℃……', '温度，一路在涨。'], voice: '三十度，六十度，九十度，温度一路在涨。', mood: 0.45 },
      { id: 'hundred', min: 3.6, cap: ['到 {100℃}，一共 {418} 焦耳。', '水，开了。'], voice: '到一百度，一共四百一十八焦耳。水开了。', mood: 0.55, sfx: [{ at: 0.3, type: 'ding' }, { at: 0, type: 'boil', dur: 'until:stuck' }] },
      { id: 'but', min: 2.6, cap: ['但它，还没有变成{蒸汽}。'], voice: '但是，它还没有变成蒸汽。', mood: 0.15 },
      { id: 'need', min: 3.0, cap: ['要让它全部变成蒸汽，', '还需要——'], voice: '要让它全部变成蒸汽，还需要——', mood: 0.5, sfx: [{ at: 0.2, type: 'riser', dur: 'beat' }] },
      { id: 'reveal', min: 2.8, cap: null, voice: '两千二百五十七焦耳。', mood: 0.95, sfx: [{ at: 0, type: 'boom' }] },
      { id: 'ratio', min: 3.6, cap: ['是前面所有加热的——'], voice: '是前面所有加热的，五点四倍。', mood: 0.8, sfx: [{ at: 1.0, type: 'ticks', n: 6, gap: 0.16 }] },
      { id: 'stuck', min: 4.6, cap: ['而这期间，温度计一直停在 {100℃}，', '一动不动。'], voice: '而这期间，温度计一直停在一百度，一动不动。', mood: 0.6 },
      { id: 'flip', min: 3.4, cap: ['你刷的题，背的单词，熬的夜——'], voice: '你刷的题，背的单词，熬的夜。', mood: 0.4, sfx: [{ at: 0.1, type: 'whoosh' }] },
      { id: 'flip2', min: 3.6, cap: ['分数，也常常像这支温度计：', '{停着不动}。'], voice: '分数，也常常像这支温度计，停着不动。', mood: 0.35 },
      { id: 'not', min: 3.8, cap: ['不是你没进步。', '是能量，正在变成{质变}。'], voice: '不是你没进步，是努力正在变成质变。', mood: 0.75 },
      { id: 'quote', min: 3.8, cap: ['最后一步，', '需要的力气{最多}，也{最看不见}。'], voice: '最后一步，需要的力气最多，也最看不见。', mood: 0.85, capY: 860 },
      { id: 'action', min: 3.4, cap: null, voice: '别在一百度的时候，关火。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '温度TEMP能量ENERGY每1克水·个标准大气压加热汽化0→100℃JkK0123456789.,倍别在的时候关火分数',
  };

  // ---- 物理状态：温度、已吸收能量、坐标轴比例 ----
  function state(t, TL, E) {
    const b = id => TL.b(id);
    let T = 0, En = 0;
    if (t >= b('rule').s) T = E.ease.inOut(E.seg(t, b('rule').s + 1.4, b('rule').s + 2.2));
    if (t >= b('heat').s) T = 1 + 98 * E.ease.inOutSine(E.seg(t, b('heat').s, b('heat').e - 0.2));
    if (t >= b('hundred').s) T = 99 + E.ease.out(E.seg(t, b('hundred').s, b('hundred').s + 0.5));
    En = C * T;
    if (t >= b('hundred').s) En = HEAT * (T / 100);
    let vap = 0; // 已汽化吸收的能量
    if (t >= b('stuck').s) vap = VAP * E.ease.inOutSine(E.seg(t, b('stuck').s + 0.2, b('stuck').e));
    if (t >= b('stuck').e) vap = VAP;
    En += vap;
    const scale = E.lerp(HEAT, TOTAL, E.ease.inOut(E.seg(t, b('need').s + 0.3, b('need').s + 1.6)));
    return { T, En, vap, scale };
  }

  const BX = 540, RIM = 760, BOT = 1250, BW = 420;

  function beaker(ctx, th, a, draw) {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = th.gold; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    const l = BX - BW / 2, r = BX + BW / 2;
    const p = new Path2D();
    p.moveTo(l - 14, RIM); p.lineTo(l, RIM + 14); p.lineTo(l, BOT - 24); p.quadraticCurveTo(l, BOT, l + 24, BOT);
    p.lineTo(r - 24, BOT); p.quadraticCurveTo(r, BOT, r, BOT - 24); p.lineTo(r, RIM + 14); p.lineTo(r + 14, RIM);
    if (draw < 1) ctx.setLineDash([1600 * draw, 1600]);
    ctx.shadowColor = th.gold; ctx.shadowBlur = 12; ctx.stroke(p);
    ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.globalAlpha = a * 0.55 * draw;
    for (let i = 1; i <= 6; i++) { const y = BOT - i * 70; ctx.beginPath(); ctx.moveTo(l, y); ctx.lineTo(l + (i % 2 ? 26 : 44), y); ctx.stroke(); }
    ctx.restore();
  }

  function water(ctx, th, t, T, level, a) {
    const l = BX - BW / 2 + 3, r = BX + BW / 2 - 3, k = T / 100;
    const c = [Math.round(E2.lerp(90, 250, k)), Math.round(E2.lerp(150, 196, k)), Math.round(E2.lerp(200, 120, k))];
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, level, 0, BOT);
    g.addColorStop(0, `rgba(${c},0.26)`); g.addColorStop(1, `rgba(${c},0.07)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(l, level);
    for (let x = l; x <= r; x += 12) ctx.lineTo(x, level + Math.sin(x * 0.03 + t * (2 + k * 4)) * (1.5 + k * 3));
    ctx.lineTo(r, BOT - 22); ctx.quadraticCurveTo(r, BOT - 3, r - 22, BOT - 3); ctx.lineTo(l + 22, BOT - 3); ctx.quadraticCurveTo(l, BOT - 3, l, BOT - 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(255,216,146,${0.35 + 0.4 * k})`; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = l; x <= r; x += 12) { const y = level + Math.sin(x * 0.03 + t * (2 + k * 4)) * (1.5 + k * 3); x === l ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  }

  function bubbles(ctx, th, t, T, level, a) {
    const k = E2.clamp((T - 70) / 30); if (k <= 0) return;
    const r = E2.rng(9); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 1.6;
    for (let i = 0; i < 46; i++) {
      const x0 = BX - BW / 2 + 30 + r() * (BW - 60), rate = 0.5 + r() * 0.9, off = r(), sz = 3 + r() * 7;
      if (i / 46 > k) continue;
      const ph = (t * rate + off) % 1; const y = BOT - 10 - ph * (BOT - 10 - level);
      if (y < level + 4) continue;
      ctx.globalAlpha = a * (0.3 + 0.6 * ph);
      ctx.beginPath(); ctx.arc(x0 + Math.sin(t * 3 + i) * 4, y, sz * (0.5 + ph * 0.6), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function steam(ctx, th, t, level, amt, a) {
    if (amt <= 0) return;
    const r = E2.rng(31); ctx.save();
    for (let i = 0; i < 70; i++) {
      const x0 = BX - BW / 2 + 40 + r() * (BW - 80), rate = 0.18 + r() * 0.25, off = r(), sz = 18 + r() * 40;
      if (i / 70 > amt) continue;
      const ph = (t * rate + off) % 1; const y = level - ph * 520; const x = x0 + Math.sin(t * 0.8 + i) * 30 * ph;
      const al = a * 0.13 * Math.sin(ph * Math.PI);
      const g = ctx.createRadialGradient(x, y, 0, x, y, sz * (0.6 + ph));
      g.addColorStop(0, `rgba(255,226,170,${al.toFixed(3)})`); g.addColorStop(1, 'rgba(255,226,170,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, sz * (0.6 + ph), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function flame(ctx, th, t, power, a) {
    if (power <= 0 || a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    const y0 = BOT + 78;
    const base = ctx.createRadialGradient(BX, y0, 10, BX, y0, 220);
    base.addColorStop(0, `rgba(255,170,70,${0.22 * power})`); base.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = base; ctx.fillRect(BX - 240, y0 - 120, 480, 200);
    for (let i = 0; i < 11; i++) {
      const x = BX - 150 + i * 30;
      const h = (26 + 8 * Math.sin(t * 11 + i * 2.1) + 5 * Math.sin(t * 17 + i)) * power;
      const g = ctx.createLinearGradient(0, y0, 0, y0 - h);
      g.addColorStop(0, 'rgba(120,160,255,0.55)'); g.addColorStop(0.35, 'rgba(255,190,90,0.55)'); g.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(x - 7, y0); ctx.quadraticCurveTo(x - 8, y0 - h * 0.5, x + Math.sin(t * 7 + i) * 3, y0 - h);
      ctx.quadraticCurveTo(x + 8, y0 - h * 0.5, x + 7, y0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function thermometer(ctx, th, T, a, label, frozenPulse) {
    const x = 880, top = 760, bot = 1215;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = th.dim; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x - 11, bot); ctx.lineTo(x - 11, top); ctx.arc(x, top, 11, Math.PI, 0); ctx.lineTo(x + 11, bot); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, bot + 22, 26, 0, Math.PI * 2); ctx.stroke();
    const lv = E2.lerp(bot, top + 12, T / 100);
    ctx.fillStyle = th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = 10 + frozenPulse * 25;
    ctx.beginPath(); ctx.arc(x, bot + 22, 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 6, lv, 12, bot - lv + 10);
    ctx.shadowBlur = 0; ctx.fillStyle = th.dim; ctx.font = `500 20px ${th.mono}`; ctx.textAlign = 'left';
    [0, 50, 100].forEach(v => { const y = E2.lerp(bot, top + 12, v / 100); ctx.fillRect(x + 14, y - 1, 12, 2); ctx.fillText(String(v), x + 32, y + 7); });
    ctx.textAlign = 'center'; ctx.font = `700 26px ${th.cap}`; ctx.fillStyle = th.fg; ctx.fillText(label, x, top - 34);
    ctx.restore();
  }

  function energyBar(ctx, th, st, a, t, TL) {
    const x0 = 140, w = 800, y = 1420, h = 24;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = th.faint; ctx.lineWidth = 2; ctx.strokeRect(x0, y, w, h);
    const s1 = Math.min(st.En, HEAT) / st.scale * w;
    ctx.fillStyle = th.gold; ctx.shadowColor = th.gold; ctx.shadowBlur = 12; ctx.fillRect(x0, y, s1, h);
    const w1 = HEAT / st.scale * w;
    // 汽化段：虚线目标框 → 实心填充
    const ns = TL.b('need').s;
    if (t > ns + 0.8) {
      const da = E2.seg(t, ns + 0.8, ns + 1.6);
      ctx.shadowBlur = 0; ctx.globalAlpha = a * da; ctx.setLineDash([10, 8]); ctx.strokeStyle = th.goldHi; ctx.lineWidth = 2;
      ctx.strokeRect(x0 + w1 + 2, y - 4, w - w1 - 2, h + 8); ctx.setLineDash([]);
    }
    // 5.4 倍：把加热段复制排满
    const rb = TL.b('ratio');
    if (t > rb.s + 0.9 && t < TL.b('stuck').s + 0.6) {
      const out = 1 - E2.seg(t, TL.b('stuck').s, TL.b('stuck').s + 0.6);
      for (let i = 0; i < 6; i++) {
        const ap = E2.ease.out(E2.seg(t, rb.s + 1.0 + i * 0.16, rb.s + 1.25 + i * 0.16));
        if (ap <= 0) continue;
        const ww = i < 5 ? w1 : w1 * (VAP / HEAT - 5);
        ctx.globalAlpha = a * ap * out * 0.75; ctx.fillStyle = th.gold;
        ctx.fillRect(x0 + w1 * (i + 1) + 3, y + 3, ww - 6, h - 6);
        ctx.globalAlpha = a * ap * out; ctx.fillStyle = th.fg; ctx.font = `700 22px ${th.mono}`; ctx.textAlign = 'center';
        if (i < 5) ctx.fillText('×' + (i + 1), x0 + w1 * (i + 1.5), y + h + 34);
      }
    }
    if (st.vap > 0) {
      ctx.globalAlpha = a; ctx.fillStyle = th.goldHi; ctx.shadowColor = th.goldHi; ctx.shadowBlur = 16;
      ctx.fillRect(x0 + w1, y, st.vap / st.scale * w, h);
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = a; ctx.fillStyle = th.dim; ctx.font = `500 22px ${th.cap}`; ctx.textAlign = 'left';
    ctx.fillText('加热 0→100℃ · 418 J', x0, y - 18);
    if (t > ns + 1.2) { ctx.globalAlpha = a * E2.seg(t, ns + 1.2, ns + 1.8); ctx.textAlign = 'right'; ctx.fillStyle = th.goldHi; ctx.fillText('汽化 · 2,257 J', x0 + w, y - 18); }
    ctx.restore();
  }

  let E2 = null;
  EP.draw = function (ctx, t, TL, th, E) {
    E2 = E;
    const b = id => TL.b(id);
    E.background(ctx, th, t);
    const st = state(t, TL, E);
    // 场景整体亮度：翻转段压暗、金句段几乎隐去
    let sa = E.ease.out(E.seg(t, 0.1, 1.0));
    sa *= 1 - 0.75 * E.seg(t, b('flip').s, b('flip').s + 0.6) + 0.45 * E.seg(t, b('flip2').s, b('flip2').s + 0.6) + 0.3 * E.seg(t, b('not').s, b('not').s + 0.6);
    sa *= 1 - 0.85 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.6);
    const revealDim = E.seg(t, b('reveal').s - 0.1, b('reveal').s + 0.3) * (1 - E.seg(t, b('ratio').s + 0.4, b('ratio').s + 1.0));
    const sceneA = sa * (1 - 0.7 * revealDim);
    const level = E.lerp(905, 1225, st.vap / VAP);
    const steamAmt = st.vap > 0 ? (st.vap < VAP ? 1 : 0.35) : (t > b('hundred').s ? 0.12 : 0);
    const steamBoost = t > b('not').s ? 1 : steamAmt;

    flame(ctx, th, t, t > b('heat').s - 0.5 ? (t > b('action').s ? 1.4 : 1) : E.seg(t, b('rule').s + 1.0, b('rule').s + 1.6) * 0.6, Math.max(sceneA, t > b('action').s ? E.seg(t, b('action').s, b('action').s + 0.8) : 0));
    water(ctx, th, t, st.T, level, sceneA);
    bubbles(ctx, th, t, st.T, level, sceneA);
    beaker(ctx, th, sceneA, E.ease.inOut(E.seg(t, 0.1, 1.6)));
    steam(ctx, th, t, level, steamBoost, sceneA * (t > b('not').s ? 1.8 : 1));
    const frozen = t > b('stuck').s && t < b('not').s ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
    const scoreK = E.seg(t, b('flip2').s, b('flip2').s + 0.6);
    thermometer(ctx, th, st.T, sceneA, scoreK > 0.5 ? '分数' : '温度', frozen);

    // HUD
    const ha = sceneA * E.seg(t, 0.6, 1.4);
    E.hud(ctx, th, 140, 1530, scoreK > 0.5 ? '分数 SCORE' : '温度 TEMP', st.T.toFixed(1) + '℃', { alpha: ha, glow: frozen > 0, color: frozen > 0 ? th.goldHi : th.gold });
    E.hud(ctx, th, 940, 1530, '能量 ENERGY', E.fmt(Math.round(st.En)) + ' J', { alpha: ha, align: 'right' });
    ctx.save(); ctx.globalAlpha = ha * 0.8; ctx.fillStyle = th.dim; ctx.font = `400 22px ${th.cap}`; ctx.textAlign = 'center';
    ctx.fillText('每 1 克水 · 1 个标准大气压', 540, 1680); ctx.restore();
    energyBar(ctx, th, st, sceneA * E.seg(t, 0.8, 1.6), t, TL);

    // 揭晓：2,257 J
    const rv = b('reveal');
    if (t > rv.s - 0.05 && t < b('ratio').s + 1.0) {
      const a = E.seg(t, rv.s, rv.s + 0.25) * (1 - E.seg(t, b('ratio').s + 0.4, b('ratio').s + 1.0));
      const n = Math.round(VAP * E.ease.outExpo(E.seg(t, rv.s, rv.s + 1.4)));
      E.bigNumber(ctx, th, E.fmt(n), 540, 1040, { size: 230, alpha: a, scale: 1 + 0.04 * (1 - E.seg(t, rv.s, rv.s + 0.6)) });
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = th.fg; ctx.font = `700 64px ${th.cap}`; ctx.fillText('焦耳', 540, 1150); ctx.restore();
    }
    // 5.4 倍
    const ra = b('ratio');
    if (t > ra.s + 0.3 && t < b('stuck').s + 0.5) {
      const a = E.seg(t, ra.s + 1.0, ra.s + 1.5) * (1 - E.seg(t, b('stuck').s, b('stuck').s + 0.5));
      E.bigNumber(ctx, th, '5.4 倍', 540, 640, { size: 150, alpha: a, font: `"Playfair Display", "Noto Serif SC"` });
    }
    // 翻转：三个词飘进烧杯
    const fl = b('flip');
    if (t > fl.s && t < b('flip2').s + 0.8) {
      const words = ['刷的题', '背的单词', '熬的夜'];
      words.forEach((w, i) => {
        const p0 = fl.s + 0.3 + i * 0.6;
        const ap = E.seg(t, p0, p0 + 0.4); const fall = E.ease.in(E.seg(t, p0 + 1.0, p0 + 2.0));
        const x = 300 + i * 240, y = E.lerp(640, 1000, fall);
        ctx.save(); ctx.globalAlpha = ap * (1 - fall); ctx.textAlign = 'center'; ctx.font = `700 44px ${th.cap}`;
        ctx.fillStyle = th.goldHi; ctx.shadowColor = th.gold; ctx.shadowBlur = 20; ctx.fillText(w, x, y); ctx.restore();
      });
    }
    // 最后一句：别在 100℃ 的时候，关火。
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '别在 {100℃} 的时候，', 540, 880, { theme: th, size: 82, tt: t - ac.s - 0.1, glow: 0.9 });
      E.rich(ctx, '{关火}。', 540, 1010, { theme: th, size: 110, tt: t - ac.s - 0.75, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
