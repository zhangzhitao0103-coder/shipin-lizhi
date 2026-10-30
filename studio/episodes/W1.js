// W1《潜心奋战冬三月，夯基提能胜百天》致 2027 届高三 · 旗舰片
// 不含具体日期与天数，整个冬季都可发布。情绪曲线：冷 → 压 → 静（女声、几乎无乐）→ 燃（停一拍后鼓点砸下）→ 暖
// 画面主线：雪夜里唯一亮着的窗 → 冬三月 → 知识塔 → 路线图 → 雪下扎根的种子 → 冰裂 → 四张卡片 → 日出破土 → 百日冲刺 → 毛笔金句
(function (root) {
  const M = 58, F = 50;  // 1 号男声沉稳、4 号女声温柔
  const EP = {
    id: 'W1',
    title: '潜心奋战冬三月',
    theme: 'winter',
    voice: { sid: M },
    capY: 360, capSize: 62,
    music: { style: 'epic', bpm: 112, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C', 'A', 'D', 'G', 'D', 'A', 'D'] },
    cover: 'motto2',
    beats: [
      { id: 'cold', min: 2.8, cap: ['冬天来了。'], voice: '冬天来了。', speed: 0.9, mood: 0.2, sfx: [{ at: 0, type: 'wind', dur: 'until:diff' }] },
      { id: 'diff', min: 3.6, cap: ['高三的冬天，', '和别人的{不一样}。'], voice: '高三的冬天，和别人的不一样。', speed: 0.95, mood: 0.3 },
      { id: 'three', min: 3.6, cap: ['冬天的这三个月，', '是{一轮复习的攻坚期}。'], voice: '冬天的这三个月，是一轮复习的攻坚期。', speed: 1.0, mood: 0.5, sfx: [{ at: 0.4, type: 'taiko', vel: 0.5 }, { at: 0.75, type: 'taiko', vel: 0.5 }, { at: 1.1, type: 'taiko', vel: 0.7 }] },
      { id: 'build', min: 3.8, cap: ['夯实基础，全面复习，', '把知识{搭成体系}。'], voice: '夯实基础，全面复习，把知识搭成体系。', speed: 1.0, mood: 0.6, sfx: [{ at: 0.4, type: 'ticks', n: 9, gap: 0.22 }] },
      { id: 'map', min: 4.4, cap: ['二轮复习、一模、重要联考，', '都{站在它的肩膀上}。'], voice: '二轮复习，一模，重要联考，都站在它的肩膀上。', speed: 1.0, mood: 0.68, sfx: [{ at: 0.6, type: 'whoosh' }] },
      { id: 'loose', min: 4.0, cap: ['可是冬天，天最冷，夜最长，', '也[最容易松]。'], voice: '可是冬天，天最冷，夜最长，也最容易松。', speed: 0.95, mood: 0.4, sfx: [{ at: 0.2, type: 'wind', dur: 'beat' }] },
      { id: 'doubt', min: 4.4, cap: ['也许你会累，会怀疑：', '我这么努力，{真的有用吗}？'], voice: '也许你会累，会怀疑，我这么努力，真的有用吗？', sid: F, speed: 0.9, mood: 0.12, musicGain: 0.7 },
      { id: 'seed', min: 4.4, cap: ['其实每一个冬天，', '种子都在土里，{悄悄扎根}。'], voice: '其实每一个冬天，种子都在土里，悄悄扎根。', sid: F, speed: 0.9, mood: 0.2, musicGain: 0.8, hush: 0.7 },
      { id: 'break', min: 2.8, cap: ['冬天，{不会白过}。'], capY: 960, capSize: 96, voice: '冬天，不会白过。', speed: 0.95, mood: 1.0, sfx: [{ at: 0, type: 'crack' }, { at: 0.05, type: 'taiko', vel: 1.2 }, { at: 0.05, type: 'boom' }] },
      { id: 'plan', min: 2.8, cap: ['{做好规划}：', '每一天，都有清单。'], voice: '做好规划，每一天都有清单。', speed: 1.1, mood: 0.85, sfx: [{ at: 0.05, type: 'taiko', vel: 1.0 }] },
      { id: 'method', min: 2.8, cap: ['{掌握方法}：', '错题，变成得分。'], voice: '掌握方法，错题变成得分。', speed: 1.1, mood: 0.9, sfx: [{ at: 0.05, type: 'taiko', vel: 1.0 }] },
      { id: 'teacher', min: 2.8, cap: ['{选对老师}：', '少走弯路，直击考点。'], voice: '选对老师，少走弯路，直击考点。', speed: 1.1, mood: 0.95, sfx: [{ at: 0.05, type: 'taiko', vel: 1.0 }] },
      { id: 'persist', min: 2.8, cap: ['{咬住坚持}：', '一天一天，攒成实力。'], voice: '咬住坚持，一天一天，攒成实力。', speed: 1.1, mood: 1.0, sfx: [{ at: 0.05, type: 'taiko', vel: 1.1 }] },
      { id: 'thaw', min: 2.6, cap: ['当冬天过去——'], voice: '当冬天过去。', speed: 1.0, mood: 0.75, sfx: [{ at: 0.1, type: 'riser', dur: 'beat' }] },
      { id: 'spring', min: 4.0, cap: ['春天来时，你会站在{更高的起点}，', '迎接百日冲刺。'], voice: '春天来时，你会站在更高的起点，迎接百日冲刺。', speed: 1.05, mood: 0.9, sfx: [{ at: 0.05, type: 'boom' }, { at: 1.6, type: 'swell' }] },
      { id: 'motto1', min: 3.4, cap: null, voice: '潜心，奋战，冬三月。', speed: 0.92, mood: 1.0, sfx: [{ at: 0.25, type: 'taiko', vel: 1.1 }, { at: 0.89, type: 'taiko', vel: 0.9 }, { at: 1.53, type: 'taiko', vel: 0.9 }, { at: 2.17, type: 'taiko', vel: 1.2 }] },
      { id: 'motto2', min: 3.6, cap: null, voice: '夯基，提能，胜百天！', speed: 0.92, mood: 1.0, sfx: [{ at: 0.25, type: 'taiko', vel: 1.1 }, { at: 0.89, type: 'taiko', vel: 0.9 }, { at: 1.53, type: 'taiko', vel: 0.9 }, { at: 2.17, type: 'taiko', vel: 1.3 }, { at: 2.9, type: 'boom' }] },
      { id: 'dream', min: 3.6, cap: null, voice: '二零二七，愿你圆梦理想大学。', speed: 1.0, mood: 0.6, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '冬三月一轮复习攻坚期夯实基础全面复习搭建体系二轮一模联考百日冲刺高考白昼做好规划掌握方法选对老师咬住坚持分数示意潜心奋战夯基提能胜百天圆梦理想大学愿你2027',
  };

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, k) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`; };
  const MOTTO = ['潜心奋战冬三月', '夯基提能胜百天'];
  const LIT = { c: 2, r: 3 }, WX0 = 175, WY0 = 720, WW = 120, WH = 128, WG = 30;
  const winPos = (c, r) => ({ x: WX0 + c * (WW + WG), y: WY0 + r * (WH + WG) });

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    const W = 1080, H = 1920;
    const thaw = b('thaw'), spring = b('spring'), m1 = b('motto1'), m2 = b('motto2'), dream = b('dream');
    const warm = E.ease.inOut(E.seg(t, thaw.s, spring.s + 1.2));
    const ink = E.seg(t, m1.s - 0.2, m1.s + 0.4) * (1 - E.seg(t, dream.s - 0.1, dream.s + 0.6));
    const dark = 0.35 * E.seg(t, b('loose').s, b('loose').s + 1.0) * (1 - E.seg(t, b('break').s, b('break').s + 0.2));

    // ---------- 背景：夜 → 晨 ----------
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix('#03070F', '#1B1F4B', warm)); g.addColorStop(0.55, mix('#0A1A33', '#9C4F78', warm)); g.addColorStop(1, mix('#163A66', '#FFC77A', warm));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 太阳
    if (warm > 0) {
      const sy = E.lerp(2050, 1480, E.ease.out(E.seg(t, thaw.s, spring.s + 1.5)));
      const sg = ctx.createRadialGradient(540, sy, 20, 540, sy, 760); sg.addColorStop(0, `rgba(255,236,170,${0.95 * warm})`); sg.addColorStop(0.25, `rgba(255,190,110,${0.5 * warm})`); sg.addColorStop(1, 'rgba(255,170,100,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(255,240,200,${warm})`; ctx.beginPath(); ctx.arc(540, sy, 120, 0, Math.PI * 2); ctx.fill();
    }
    if (dark > 0) { ctx.fillStyle = `rgba(0,0,8,${dark})`; ctx.fillRect(0, 0, W, H); }
    // 雪 → 上升的光点
    const snowA = 1 - warm;
    if (snowA > 0) E.snow(ctx, t, Math.round(90 + 80 * E.seg(t, b('loose').s, b('doubt').e)), 0.75 * snowA);
    if (warm > 0) { ctx.save(); ctx.globalAlpha = warm; E.dust(ctx, t * 3, '255,225,160', 70); ctx.restore(); }

    // ---------- 场景 1：雪夜里唯一亮着的窗（cold / diff / doubt） ----------
    const bA = E.seg(t, 0.1, 0.8) * (1 - E.seg(t, b('three').s - 0.1, b('three').s + 0.4)) + E.seg(t, b('doubt').s, b('doubt').s + 0.5) * (1 - E.seg(t, b('seed').s, b('seed').s + 0.5));
    if (bA > 0) {
      const inDoubt = t > b('three').s;
      const z = inDoubt ? 2.6 : 1 + 1.6 * E.ease.inOut(E.seg(t, b('diff').s + 0.3, b('diff').e - 0.2));
      const lp = winPos(LIT.c, LIT.r), cx = lp.x + WW / 2, cy = lp.y + WH / 2;
      ctx.save(); ctx.globalAlpha = Math.min(1, bA);
      ctx.translate(540, 1080); ctx.scale(z, z); ctx.translate(-E.lerp(540, cx, (z - 1) / 1.6), -E.lerp(1080, cy, (z - 1) / 1.6));
      ctx.fillStyle = '#081221'; ctx.fillRect(130, 660, 820, 1400);
      ctx.fillStyle = 'rgba(220,235,255,0.85)'; ctx.fillRect(120, 650, 840, 14);   // 屋檐积雪
      for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) {
        const p = winPos(c, r), lit = c === LIT.c && r === LIT.r;
        if (lit) {
          const flick = inDoubt ? 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.1) : 1;
          const wg = ctx.createRadialGradient(p.x + WW / 2, p.y + WH / 2, 5, p.x + WW / 2, p.y + WH / 2, 200);
          wg.addColorStop(0, `rgba(255,200,110,${0.55 * flick})`); wg.addColorStop(1, 'rgba(255,200,110,0)');
          ctx.fillStyle = wg; ctx.fillRect(p.x - 200, p.y - 200, WW + 400, WH + 400);
          ctx.fillStyle = `rgba(255,214,140,${flick})`; ctx.fillRect(p.x, p.y, WW, WH);
          // 窗内：台灯、书堆、伏案的身影
          ctx.fillStyle = '#5A3A1E'; ctx.fillRect(p.x + 6, p.y + 92, WW - 12, 8);
          ctx.fillStyle = '#3B4A6B'; ctx.fillRect(p.x + 72, p.y + 70, 34, 8); ctx.fillStyle = '#8B3A3A'; ctx.fillRect(p.x + 74, p.y + 62, 30, 8); ctx.fillStyle = '#2F5A3A'; ctx.fillRect(p.x + 70, p.y + 54, 36, 8);
          ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x + 20, p.y + 92); ctx.lineTo(p.x + 28, p.y + 50); ctx.lineTo(p.x + 46, p.y + 40); ctx.stroke();
          ctx.fillStyle = '#2A2A2A'; ctx.beginPath(); ctx.moveTo(p.x + 38, p.y + 34); ctx.lineTo(p.x + 58, p.y + 34); ctx.lineTo(p.x + 54, p.y + 48); ctx.lineTo(p.x + 42, p.y + 48); ctx.fill();
          ctx.fillStyle = '#1C1C24'; ctx.beginPath(); ctx.arc(p.x + 52, p.y + 78, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(p.x + 40, p.y + 84, 26, 10);
          ctx.strokeStyle = '#3A2A1A'; ctx.lineWidth = 4; ctx.strokeRect(p.x, p.y, WW, WH); ctx.beginPath(); ctx.moveTo(p.x + WW / 2, p.y); ctx.lineTo(p.x + WW / 2, p.y + WH); ctx.stroke();
        } else {
          ctx.fillStyle = (c * 7 + r * 3) % 11 === 0 ? '#1B2C48' : '#101D33'; ctx.fillRect(p.x, p.y, WW, WH);
          ctx.fillStyle = 'rgba(220,235,255,0.5)'; ctx.fillRect(p.x - 4, p.y + WH, WW + 8, 5);  // 窗台积雪
        }
      }
      ctx.restore();
    }

    // ---------- 场景 2："冬三月"三块冰牌（three） ----------
    const tA = E.seg(t, b('three').s + 0.2, b('three').s + 0.5) * (1 - E.seg(t, b('build').s, b('build').s + 0.4));
    if (tA > 0) {
      ctx.save();
      [...'冬三月'].forEach((ch, i) => {
        const land = E.ease.outBack(E.seg(t, b('three').s + 0.25 + i * 0.35, b('three').s + 0.55 + i * 0.35));
        const x = 220 + i * 320, y = E.lerp(520, 1000, land);
        ctx.globalAlpha = tA * E.seg(land, 0, 0.3);
        const ig = ctx.createLinearGradient(x - 130, y - 150, x + 130, y + 150); ig.addColorStop(0, 'rgba(200,235,255,0.55)'); ig.addColorStop(1, 'rgba(110,170,230,0.25)');
        ctx.fillStyle = ig; ctx.strokeStyle = 'rgba(235,248,255,0.9)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(x - 130, y - 150, 260, 300, 26); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = '#9FDBFF'; ctx.shadowBlur = 30; ctx.font = `400 200px "Ma Shan Zheng"`; ctx.textAlign = 'center'; ctx.fillText(ch, x, y + 72); ctx.shadowBlur = 0;
      });
      ctx.restore();
    }

    // ---------- 场景 3：知识塔（build） ----------
    const kA = E.seg(t, b('build').s + 0.1, b('build').s + 0.5) * (1 - E.seg(t, b('map').s, b('map').s + 0.4));
    if (kA > 0) {
      const tiers = [['夯实基础', 4], ['全面复习', 3], ['搭建体系', 2]];
      ctx.save();
      tiers.forEach(([name, n], r) => {
        const y = 1420 - r * 210, bw = 230, x0 = 540 - (n * bw) / 2;
        for (let k = 0; k < n; k++) {
          const a = E.ease.outBack(E.seg(t, b('build').s + 0.3 + r * 0.9 + k * 0.12, b('build').s + 0.55 + r * 0.9 + k * 0.12));
          if (a <= 0) continue;
          ctx.globalAlpha = kA * Math.min(1, a);
          const yy = y - (1 - a) * 160;
          ctx.fillStyle = r === 2 ? 'rgba(255,210,122,0.35)' : 'rgba(160,210,255,0.22)'; ctx.strokeStyle = r === 2 ? th.gold : 'rgba(220,240,255,0.8)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.roundRect(x0 + k * bw + 6, yy, bw - 12, 180, 18); ctx.fill(); ctx.stroke();
        }
        const la = E.seg(t, b('build').s + 0.5 + r * 0.9, b('build').s + 0.9 + r * 0.9);
        ctx.globalAlpha = kA * la; ctx.fillStyle = r === 2 ? th.goldHi : th.fg; ctx.font = `700 56px ${th.cap}`; ctx.textAlign = 'center'; ctx.shadowColor = '#000'; ctx.shadowBlur = 12; ctx.fillText(name, 540, y + 110); ctx.shadowBlur = 0;
      });
      ctx.restore();
    }

    // ---------- 场景 4：路线图（map） ----------
    const mA = E.seg(t, b('map').s + 0.1, b('map').s + 0.5) * (1 - E.seg(t, b('loose').s, b('loose').s + 0.4));
    if (mA > 0) {
      const nodes = ['冬三月', '二轮复习', '一模 · 联考', '百日冲刺', '高考'];
      ctx.save(); ctx.globalAlpha = mA;
      const ny = i => 1480 - i * 210, X = 330;
      const up = E.seg(t, b('map').s + 0.4, b('map').s + 2.8) * 4;
      ctx.strokeStyle = 'rgba(255,210,122,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X, ny(0)); ctx.lineTo(X, E.lerp(ny(0), ny(4), up / 4)); ctx.stroke();
      nodes.forEach((s, i) => {
        const a = E.seg(up, i - 0.2, i + 0.2), base = i === 0;
        ctx.globalAlpha = mA * (base ? 1 : a);
        ctx.fillStyle = base ? '#BFE6FF' : th.gold; ctx.shadowColor = base ? '#9FDBFF' : th.gold; ctx.shadowBlur = base ? 40 : 16;
        ctx.beginPath(); ctx.arc(X, ny(i), base ? 34 : 20, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = base ? '#FFFFFF' : th.fg; ctx.font = `700 ${base ? 64 : 48}px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(s, X + 70, ny(i) + (base ? 22 : 17));
      });
      // "肩膀"：从冬三月托起所有节点的光
      const sh = E.seg(t, b('map').s + 2.6, b('map').s + 3.2);
      if (sh > 0) { ctx.globalAlpha = mA * sh; const gg = ctx.createLinearGradient(0, ny(0), 0, ny(4)); gg.addColorStop(0, 'rgba(159,219,255,0.35)'); gg.addColorStop(1, 'rgba(159,219,255,0)'); ctx.fillStyle = gg; ctx.fillRect(X - 60, ny(4), 120, ny(0) - ny(4)); }
      ctx.restore();
    }

    // ---------- 场景 5：白昼最短（loose） ----------
    const lA = E.seg(t, b('loose').s + 0.2, b('loose').s + 0.6) * (1 - E.seg(t, b('doubt').s, b('doubt').s + 0.4));
    if (lA > 0) {
      const k = E.ease.inOut(E.seg(t, b('loose').s + 0.4, b('loose').e - 0.4));
      ctx.save(); ctx.globalAlpha = lA;
      ctx.fillStyle = th.fg; ctx.font = `700 56px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('白昼', 140, 920);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(140, 960, 800, 90);
      ctx.fillStyle = th.gold; ctx.fillRect(140, 960, 800 * E.lerp(0.6, 0.3, k), 90);
      ctx.fillStyle = th.fg; ctx.fillText('黑夜', 140, 1200);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(140, 1240, 800, 90);
      ctx.fillStyle = '#4A6EA8'; ctx.fillRect(140, 1240, 800 * E.lerp(0.4, 0.7, k), 90);
      // 月亮
      ctx.fillStyle = 'rgba(235,242,255,0.9)'; ctx.beginPath(); ctx.arc(860, 640, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#060E1C'; ctx.beginPath(); ctx.arc(884, 624, 54, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ---------- 场景 6：雪下的土地（seed；thaw / spring 时破土发芽） ----------
    const gA = E.seg(t, b('seed').s + 0.1, b('seed').s + 0.6) * (1 - E.seg(t, b('break').s, b('break').s + 0.15)) + E.seg(t, thaw.s + 0.2, thaw.s + 0.8) * (1 - E.seg(t, m1.s - 0.2, m1.s + 0.3));
    if (gA > 0) {
      const GY = 1150, sx = 540, sy = 1360;
      ctx.save(); ctx.globalAlpha = Math.min(1, gA);
      const sg = ctx.createLinearGradient(0, GY, 0, H); sg.addColorStop(0, mix('#4A3424', '#5B3E26', warm)); sg.addColorStop(1, '#1E140C'); ctx.fillStyle = sg; ctx.fillRect(0, GY, W, H - GY);
      // 积雪层（化雪时变薄）
      const snowH = 70 * (1 - warm);
      if (snowH > 1) { ctx.fillStyle = 'rgba(240,248,255,0.95)'; ctx.beginPath(); ctx.moveTo(0, GY); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, GY - snowH + 8 * Math.sin(x / 70)); ctx.lineTo(W, GY); ctx.fill(); }
      // 根
      const rootK = E.seg(t, b('seed').s + 0.6, b('seed').e) + (t > b('seed').e ? 1 : 0);
      const rr = E.rng(73); ctx.strokeStyle = 'rgba(255,230,190,0.75)'; ctx.lineCap = 'round';
      for (let k = 0; k < 7; k++) {
        const ang = Math.PI / 2 + (rr() - 0.5) * 1.6, len = (120 + rr() * 200) * Math.min(1, rootK), bend = (rr() - 0.5) * 120;
        ctx.lineWidth = 6 - k * 0.5; ctx.beginPath(); ctx.moveTo(sx, sy + 16);
        ctx.quadraticCurveTo(sx + bend, sy + 16 + len * 0.5, sx + Math.cos(ang) * len, sy + 16 + Math.sin(ang) * len); ctx.stroke();
      }
      // 种子
      ctx.fillStyle = '#C8A26A'; ctx.beginPath(); ctx.ellipse(sx, sy, 34, 22, -0.3, 0, Math.PI * 2); ctx.fill();
      // 嫩芽
      const sprout = E.ease.out(E.seg(t, thaw.s + 0.4, spring.s + 1.8));
      if (sprout > 0) {
        const top = sy - 30 - (sy - GY + 120) * sprout;
        ctx.strokeStyle = '#6FCF7A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(sx, sy - 16); ctx.quadraticCurveTo(sx - 30, (sy + top) / 2, sx, top); ctx.stroke();
        if (sprout > 0.6) {
          const lf = E.seg(sprout, 0.6, 1);
          ctx.fillStyle = '#7FDB86';
          ctx.beginPath(); ctx.ellipse(sx - 60 * lf, top + 10, 64 * lf, 26 * lf, -0.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(sx + 60 * lf, top + 4, 64 * lf, 26 * lf, 0.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }

    // ---------- 场景 7：冰裂（break） ----------
    const br = b('break');
    if (t > br.s && t < b('plan').s + 0.6) {
      const k = E.ease.out(E.seg(t, br.s, br.s + 0.35)), fade = 1 - E.seg(t, b('plan').s, b('plan').s + 0.6);
      ctx.save();
      const flash = 1 - E.seg(t, br.s, br.s + 0.5); if (flash > 0) { ctx.fillStyle = `rgba(230,245,255,${0.7 * flash})`; ctx.fillRect(0, 0, W, H); }
      const rr = E.rng(99); ctx.strokeStyle = `rgba(230,245,255,${0.9 * fade})`; ctx.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        let x = 540, y = 1000, a = (i / 9) * Math.PI * 2 + rr() * 0.5; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 8; s++) { a += (rr() - 0.5) * 0.9; const L = (60 + rr() * 90) * k; x += Math.cos(a) * L; y += Math.sin(a) * L; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---------- 场景 8：四张卡片 + 分数阶梯（plan / method / teacher / persist） ----------
    const cards = [['plan', '做好规划', '每天一张清单'], ['method', '掌握方法', '错题变得分'], ['teacher', '选对老师', '少走弯路'], ['persist', '咬住坚持', '一天天攒实力']];
    const cA = E.seg(t, b('plan').s, b('plan').s + 0.2) * (1 - E.seg(t, thaw.s + 0.2, thaw.s + 0.8));
    if (cA > 0) {
      ctx.save();
      cards.forEach(([id, title, sub], i) => {
        const bt = b(id), k = E.seg(t, bt.s, bt.s + 0.25);
        if (k <= 0) return;
        const x = 90 + (i % 2) * 460, y = 600 + Math.floor(i / 2) * 400, s = E.lerp(1.5, 1, E.ease.out(k)), cur = t >= bt.s && t < bt.e;
        ctx.save(); ctx.globalAlpha = cA * k; ctx.translate(x + 210, y + 175); ctx.scale(s, s);
        ctx.fillStyle = cur ? 'rgba(255,210,122,0.22)' : 'rgba(255,255,255,0.08)'; ctx.strokeStyle = cur ? th.gold : 'rgba(255,255,255,0.35)'; ctx.lineWidth = cur ? 5 : 2;
        ctx.beginPath(); ctx.roundRect(-210, -175, 420, 350, 30); ctx.fill(); ctx.stroke();
        ctx.fillStyle = cur ? th.goldHi : th.fg; ctx.font = `400 92px "Ma Shan Zheng"`; ctx.textAlign = 'center'; ctx.fillText(title, 0, 10);
        ctx.fillStyle = th.dim; ctx.font = `500 34px ${th.cap}`; ctx.fillText(sub, 0, 100);
        ctx.restore();
      });
      // 分数阶梯（示意）
      const steps = cards.reduce((n, [id]) => n + E.ease.out(E.seg(t, b(id).s + 0.1, b(id).s + 0.7)), 0);
      ctx.globalAlpha = cA; ctx.strokeStyle = th.gold; ctx.lineWidth = 6; ctx.shadowColor = th.gold; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(120, 1640);
      for (let i = 0; i < 4; i++) { const k = E.clamp(steps - i); if (k <= 0) break; const x0 = 120 + i * 200, y0 = 1640 - i * 50; ctx.lineTo(x0 + 200 * Math.min(1, k * 2), y0); if (k > 0.5) ctx.lineTo(x0 + 200, y0 - 50 * (k - 0.5) * 2); }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = th.dim; ctx.font = `400 22px "Noto Sans SC"`; ctx.textAlign = 'right'; ctx.fillText('分数曲线为示意', 960, 1700);
      ctx.restore();
    }

    // ---------- 场景 9：百日冲刺（spring） ----------
    const sA = E.seg(t, spring.s + 0.3, spring.s + 0.9) * (1 - E.seg(t, m1.s - 0.2, m1.s + 0.3));
    if (sA > 0) {
      ctx.save(); ctx.globalAlpha = sA;
      ctx.translate(540, 760); const rot = t * 0.15;
      for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = 'rgba(255,230,160,0.10)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(900, -60 + Math.sin(rot + i) * 10); ctx.lineTo(900, 60); ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = sA; ctx.textAlign = 'center';
      ctx.font = `400 170px "Ma Shan Zheng"`; ctx.fillStyle = '#FFF4D6'; ctx.shadowColor = '#FFB547'; ctx.shadowBlur = 50; ctx.fillText('百日冲刺', 540, 820); ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ---------- 场景 10：毛笔金句（motto1 / motto2） ----------
    if (ink > 0) {
      ctx.save(); ctx.globalAlpha = ink;
      const ig = ctx.createRadialGradient(540, 980, 100, 540, 980, 1200); ig.addColorStop(0, '#2A0E0E'); ig.addColorStop(1, '#080404'); ctx.fillStyle = ig; ctx.fillRect(0, 0, W, H);
      E.dust(ctx, t * 2, '255,200,120', 60);
      ctx.restore();
      [m1, m2].forEach((bt, line) => {
        const y = line ? 1170 : 860;
        [...MOTTO[line]].forEach((ch, i) => {
          const t0 = bt.s + 0.25 + Math.floor(i / 2) * 0.64 + (i % 2) * 0.16, k = E.seg(t, t0, t0 + 0.28);
          if (k <= 0) return;
          const x = 540 + (i - 3) * 138, s = E.lerp(1.8, 1, E.ease.out(k));
          ctx.save(); ctx.globalAlpha = ink * k;
          const blot = ctx.createRadialGradient(x, y - 50, 10, x, y - 50, 110); blot.addColorStop(0, 'rgba(200,16,46,0.45)'); blot.addColorStop(1, 'rgba(200,16,46,0)');
          ctx.fillStyle = blot; ctx.fillRect(x - 120, y - 170, 240, 240);
          ctx.translate(x, y - 50); ctx.scale(s, s);
          const gg = ctx.createLinearGradient(0, -80, 0, 60); gg.addColorStop(0, '#FFF1C2'); gg.addColorStop(1, '#E8A93A');
          ctx.fillStyle = gg; ctx.shadowColor = '#FFB547'; ctx.shadowBlur = 30; ctx.font = `400 150px "Ma Shan Zheng"`; ctx.textAlign = 'center'; ctx.fillText(ch, 0, 54);
          ctx.restore();
        });
      });
      // 红色印章
      const st = E.seg(t, m2.s + 2.8, m2.s + 3.0);
      if (st > 0) {
        const s = E.lerp(2.2, 1, E.ease.out(st));
        ctx.save(); ctx.globalAlpha = ink * st; ctx.translate(880, 1400); ctx.scale(s, s); ctx.rotate(-0.08);
        ctx.fillStyle = '#C8102E'; ctx.fillRect(-80, -80, 160, 160);
        ctx.fillStyle = '#FFF1E6'; ctx.font = `400 64px "Ma Shan Zheng"`; ctx.textAlign = 'center'; ctx.fillText('圆', -34, -6); ctx.fillText('梦', 34, -6); ctx.fillText('必', -34, 62); ctx.fillText('胜', 34, 62);
        ctx.restore();
      }
    }

    // ---------- 场景 11：结尾（dream） ----------
    if (t > dream.s) {
      E.rich(ctx, '2027，', 540, 860, { theme: th, size: 120, tt: t - dream.s - 0.2, font: '"Playfair Display", "Noto Serif SC"', color: '#FFFFFF', glowAll: 0.4 });
      E.rich(ctx, '愿你{圆梦理想大学}。', 540, 1030, { theme: th, size: 96, tt: t - dream.s - 0.7, glow: 1.0, gold: '#FFE7A3' });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
