// 渲染引擎：所有画面都是时间 t 的纯函数，便于逐帧、并行渲染
(function (root) {
  const W = 1080, H = 1920;
  const E = { W, H };

  // ---------- 数学工具 ----------
  E.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  E.lerp = (a, b, t) => a + (b - a) * t;
  E.seg = (t, a, b) => E.clamp((t - a) / (b - a));
  E.ease = {
    linear: x => x,
    in: x => x * x * x,
    out: x => 1 - Math.pow(1 - x, 3),
    inOut: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outExpo: x => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
    outBack: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  E.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  E.fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---------- 主题 ----------
  // 主题：配色、字体、背景画法。gold=强调色（{xx}），red=警示色（[xx]），glow=发光强度倍数，light=浅色底
  const SANS = '"Noto Sans SC"', SERIF = '"Noto Serif SC"', MONO = '"JetBrains Mono", "Noto Sans SC"', KAI = '"LXGW WenKai"', BRUSH = '"Ma Shan Zheng"';
  E.themes = {
    cinema: { bg: '#070709', fg: '#EDE6D6', dim: '#7E786C', faint: '#2A2925', gold: '#F2B65A', goldHi: '#FFD892', red: '#E0604E',
      cap: SERIF, capW: 700, num: '"Playfair Display", "Noto Serif SC"', mono: MONO, vignette: 0.7, grain: 0.05 },
    info: { bg: '#050505', fg: '#F4F4F4', dim: '#8A8A8A', faint: '#262626', gold: '#F5B83D', goldHi: '#FFD36B', red: '#E5484D',
      cap: SANS, capW: 700, num: SANS, mono: MONO, vignette: 0.5, grain: 0.03 },
    neon: { bg: '#04050D', fg: '#E8F4FF', dim: '#6E7FA3', faint: '#1A2140', gold: '#2EF2FF', goldHi: '#B8FCFF', red: '#FF3D8B',
      cap: SANS, capW: 700, num: '"JetBrains Mono", "Noto Sans SC"', mono: MONO, vignette: 0.55, grain: 0.04, glow: 1.3 },
    ink: { bg: '#F0E9DA', fg: '#1E1C19', dim: '#7A7266', faint: '#D8CFBD', gold: '#3F6B4A', goldHi: '#2F5A3A', red: '#B3322A',
      cap: KAI, capW: 700, num: BRUSH, mono: KAI, vignette: 0.22, vigColor: '70,50,25', grain: 0.06, glow: 0, light: true },
    ice: { bg: '#030B14', fg: '#E6F3FA', dim: '#6F8A9C', faint: '#14283A', gold: '#7FD8FF', goldHi: '#D6F3FF', red: '#FF7A6B',
      cap: SERIF, capW: 700, num: '"Playfair Display", "Noto Serif SC"', mono: MONO, vignette: 0.7, grain: 0.05 },
    white: { bg: '#F8F8F5', fg: '#141414', dim: '#8C8C88', faint: '#E3E3DE', gold: '#1F5BFF', goldHi: '#1F5BFF', red: '#E0452F',
      cap: SANS, capW: 700, num: SANS, mono: MONO, vignette: 0, grain: 0.025, glow: 0, light: true },
    notebook: { bg: '#F7F2E6', fg: '#1F2A44', dim: '#8B8574', faint: '#D9D2C0', gold: '#2350C8', goldHi: '#2350C8', red: '#D63B2F',
      cap: KAI, capW: 700, num: KAI, mono: MONO, vignette: 0.15, vigColor: '90,70,30', grain: 0.04, glow: 0, light: true, marker: 'rgba(255,214,64,0.55)' },
    blueprint: { bg: '#0B3463', fg: '#F2F7FF', dim: '#8FB0D8', faint: '#2A5A8E', gold: '#FFD34D', goldHi: '#FFE89A', red: '#FF6B5B',
      cap: SANS, capW: 700, num: MONO, mono: MONO, vignette: 0.45, grain: 0.03, glow: 0.4 },
    magazine: { bg: '#F2EEE5', fg: '#111111', dim: '#7D776C', faint: '#D6D0C3', gold: '#D7262E', goldHi: '#D7262E', red: '#D7262E',
      cap: SERIF, capW: 900, num: '"Playfair Display", "Noto Serif SC"', mono: MONO, vignette: 0.1, vigColor: '60,40,20', grain: 0.04, glow: 0, light: true },
    chalk: { bg: '#1D2A23', fg: '#ECECE4', dim: '#9AA79D', faint: '#34463B', gold: '#F4D35E', goldHi: '#FBE7A1', red: '#F49A9A',
      cap: KAI, capW: 700, num: KAI, mono: KAI, vignette: 0.55, grain: 0.07, glow: 0.15, blue: '#9CCBF2' },
    warm: { bg: '#1E1426', fg: '#FFF4E8', dim: '#C9A896', faint: '#4A3040', gold: '#FFC27A', goldHi: '#FFE2B8', red: '#FF8A7A',
      cap: KAI, capW: 700, num: KAI, mono: MONO, vignette: 0.5, grain: 0.05, glow: 0.8 },
    winter: { bg: '#0B1C36', fg: '#F4F8FF', dim: '#9DB3D1', faint: '#2A4468', gold: '#FFD27A', goldHi: '#FFE9B8', red: '#FF6A5C',
      cap: SERIF, capW: 700, num: '"Playfair Display", "Noto Serif SC"', mono: MONO, vignette: 0.45, grain: 0.04, glow: 0.7 },
    pixel: { bg: '#17142B', fg: '#F7F3FF', dim: '#8E86B5', faint: '#2E2952', gold: '#FFD23F', goldHi: '#FFF09A', red: '#FF4D6D', green: '#3DDC97', blue: '#4CC9F0',
      cap: SANS, capW: 900, num: MONO, mono: MONO, vignette: 0.35, grain: 0, glow: 0, pixel: 4 },
    glass: { bg: '#1A1438', fg: '#FFFFFF', dim: '#C9C2EE', faint: 'rgba(255,255,255,0.18)', gold: '#FFE08A', goldHi: '#FFF2C7', red: '#FF8FA3',
      cap: SANS, capW: 700, num: SANS, mono: MONO, vignette: 0.3, grain: 0.03, glow: 0.5 },
  };

  // ---------- 富文本：{金色} [红色] ----------
  E.parseRich = function (text) {
    const out = []; let style = 'n';
    for (const ch of text) {
      if (ch === '{') { style = 'g'; continue; }
      if (ch === '[') { style = 'r'; continue; }
      if (ch === '}' || ch === ']') { style = 'n'; continue; }
      out.push({ ch, style });
    }
    return out;
  };
  E.plain = text => text.replace(/[{}\[\]]/g, '');

  // 逐字浮现的文字。tt=出现后经过的秒数（null 表示直接完整显示）
  E.rich = function (ctx, text, x, y, o) {
    const th = o.theme;
    const size = o.size || 60;
    const font = `${o.weight || th.capW} ${size}px ${o.font || th.cap}`;
    const ls = o.ls || 0, stagger = o.stagger ?? 0.045, fade = o.fade ?? 0.38;
    const chars = E.parseRich(text);
    ctx.save();
    ctx.font = font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const adv = chars.map(c => ctx.measureText(c.ch).width + ls);
    const total = adv.reduce((a, b) => a + b, 0) - ls;
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    const alpha = o.alpha ?? 1;
    chars.forEach((c, i) => {
      const a = o.tt == null ? 1 : E.ease.out(E.clamp((o.tt - (o.delay || 0) - i * stagger) / fade));
      if (a > 0.001 && alpha > 0.001) {
        const col = c.style === 'g' ? (o.gold || th.gold) : c.style === 'r' ? (o.red || th.red) : (o.color || th.fg);
        ctx.globalAlpha = alpha * a;
        ctx.fillStyle = col;
        if (a < 0.999) ctx.filter = `blur(${((1 - a) * 7).toFixed(2)}px)`;
        const glow = (c.style === 'g' ? (o.glow ?? 0.5) : (o.glowAll || 0)) * (th.glow ?? 1);
        if (glow > 0) { ctx.shadowColor = col; ctx.shadowBlur = size * 0.45 * glow; }
        ctx.fillText(c.ch, cx, y + (1 - a) * size * 0.22);
        ctx.shadowBlur = 0; ctx.filter = 'none';
      }
      cx += adv[i];
    });
    ctx.restore();
    return { width: total, chars: chars.length };
  };

  // 多行字幕：整体逐字打出，结束前淡出
  E.caption = function (ctx, lines, o) {
    let size = o.size || 62;
    // 超宽自动缩字号，避开左右两侧的平台按钮区
    ctx.save(); ctx.font = `${o.weight || o.theme.capW} ${size}px ${o.font || o.theme.cap}`;
    const widest = Math.max(...lines.map(l => ctx.measureText(E.plain(l)).width)); ctx.restore();
    const maxW = o.maxW || 920;
    if (widest > maxW) size = Math.floor((size * maxW) / widest);
    const lh = o.lh || size * 1.55;
    let delay = 0;
    const y0 = o.y - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const r = E.rich(ctx, ln, o.x ?? W / 2, y0 + i * lh, { ...o, size, delay, alpha: o.alpha });
      delay += r.chars * (o.stagger ?? 0.045) + 0.12;
    });
  };

  // ---------- 背景、颗粒、暗角 ----------
  let grainCanvases = null;
  function makeGrain() {
    grainCanvases = [];
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = 540; c.height = 960;
      const g = c.getContext('2d'); const img = g.createImageData(540, 960); const r = E.rng(1000 + k);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(r() * 255);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0); grainCanvases.push(c);
    }
  }
  E.grain = function (ctx, frame, strength = 0.045) {
    if (!grainCanvases) makeGrain();
    ctx.save(); ctx.globalAlpha = strength; ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(grainCanvases[frame % 4], 0, 0, W, H); ctx.restore();
  };
  E.vignette = function (ctx, k = 0.75, rgb = '0,0,0') {
    if (k <= 0) return;
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  // 纸张纹理（浅色主题共用）
  let paperCanvas = null;
  function paper() {
    if (paperCanvas) return paperCanvas;
    const c = document.createElement('canvas'); c.width = 540; c.height = 960;
    const g = c.getContext('2d'); const img = g.createImageData(540, 960); const r = E.rng(4242);
    for (let i = 0; i < img.data.length; i += 4) { const v = 200 + Math.floor(r() * 55); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    g.globalAlpha = 0.08; g.strokeStyle = '#5a4a30';
    for (let i = 0; i < 260; i++) { const x = r() * 540, y = r() * 960, l = 6 + r() * 26, a = r() * Math.PI; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    paperCanvas = c; return c;
  }
  let scanCanvas = null;
  function scanlines() {
    if (scanCanvas) return scanCanvas;
    const c = document.createElement('canvas'); c.width = 4; c.height = 4; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 0, 4, 1); scanCanvas = c; return c;
  }
  const painters = {
    neon(ctx, th, t) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      let g = ctx.createRadialGradient(540, 300, 20, 540, 300, 900); g.addColorStop(0, 'rgba(255,61,139,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createRadialGradient(540, 1500, 20, 540, 1500, 900); g.addColorStop(0, 'rgba(46,242,255,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // 透视网格地面
      const vy = 1260; ctx.save(); ctx.strokeStyle = 'rgba(46,242,255,0.22)'; ctx.lineWidth = 1.5;
      for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(540, vy); ctx.lineTo(540 + i * 180, H); ctx.stroke(); }
      for (let k = 0; k < 14; k++) { const f = ((k + (t * 0.6) % 1) / 14); const y = vy + Math.pow(f, 2.2) * (H - vy); ctx.globalAlpha = f; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.fillStyle = ctx.createPattern(scanlines(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
      E.dust(ctx, t, '120,240,255', 30);
    },
    ink(ctx, th, t) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.28; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper(), 0, 0, W, H); ctx.restore();
      const r = E.rng(808);
      for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H, rr = 200 + r() * 360; const g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(60,55,45,0.06)'); g.addColorStop(1, 'rgba(60,55,45,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    },
    ice(ctx, th, t) { E.background(ctx, th, t, { glow: 'rgba(70,150,215,0.30)', dustColor: '200,235,255', dustCount: 50 }); },
    white(ctx, th) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(540, 900, 300, 540, 900, 1400); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.035)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },
    notebook(ctx, th) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.22; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper(), 0, 0, W, H); ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(70,120,200,0.16)'; ctx.lineWidth = 1.5;
      for (let x = 27; x < W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 27; y < H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(214,59,47,0.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(96, 0); ctx.lineTo(96, H); ctx.stroke(); ctx.restore();
    },
    blueprint(ctx, th) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(540, 960, 100, 540, 960, 1200); g.addColorStop(0, 'rgba(40,110,190,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.strokeStyle = 'rgba(200,225,255,0.07)'; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 27) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 27) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(200,225,255,0.16)'; ctx.lineWidth = 1.5;
      for (let x = 0; x <= W; x += 135) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 135) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
    },
    magazine(ctx, th) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.2; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper(), 0, 0, W, H); ctx.restore();
    },
    chalk(ctx, th, t) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      const r = E.rng(515);
      for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, rr = 120 + r() * 320; const g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, `rgba(230,240,230,${(0.025 + r() * 0.035).toFixed(3)})`); g.addColorStop(1, 'rgba(230,240,230,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      ctx.save(); ctx.strokeStyle = '#6B4A2E'; ctx.lineWidth = 26; ctx.strokeRect(13, 13, W - 26, H - 26);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4; ctx.strokeRect(28, 28, W - 56, H - 56); ctx.restore();
    },
    warm(ctx, th, t) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1C1226'); g.addColorStop(0.5, '#3B1E31'); g.addColorStop(0.82, '#7A3638'); g.addColorStop(1, '#C0613F');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const r = E.rng(321);
      for (let i = 0; i < 18; i++) {
        const x = r() * W, y0 = r() * H, rr = 30 + r() * 90, sp = 4 + r() * 8, ph = r() * 6.28;
        const y = ((y0 - sp * t) % H + H) % H; const a = 0.05 + 0.05 * Math.sin(t * 0.8 + ph);
        const gg = ctx.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(255,190,120,${a.toFixed(3)})`); gg.addColorStop(1, 'rgba(255,190,120,0)');
        ctx.fillStyle = gg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
    },
    winter(ctx, th, t) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#081629'); g.addColorStop(0.55, '#16345C'); g.addColorStop(1, '#4C77A8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // 远处雪丘
      ctx.save();
      ctx.fillStyle = 'rgba(214,230,250,0.10)'; ctx.beginPath(); ctx.moveTo(0, 1720);
      for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 1700 - 40 * Math.sin(x / 210 + 1));
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.fillStyle = 'rgba(235,243,255,0.18)'; ctx.beginPath(); ctx.moveTo(0, 1800);
      for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 1790 - 30 * Math.sin(x / 160 + 3));
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.restore();
      E.snow(ctx, t);
    },
    pixel(ctx, th, t) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.035)';
      for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 2);
      const r = E.rng(64);
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(r() * W / 8) * 8, y = Math.floor(r() * H / 8) * 8, tw = Math.sin(t * 3 + i) > 0.6 ? 1 : 0.35;
        ctx.fillStyle = `rgba(255,255,255,${(0.25 * tw).toFixed(2)})`; ctx.fillRect(x, y, 8, 8);
      }
      ctx.restore();
    },
    glass(ctx, th, t) {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      const blobs = [['#7B5CFF', 300, 500, 520], ['#FF6FB1', 820, 760, 460], ['#3FC1FF', 420, 1350, 560], ['#FFB86B', 900, 1650, 380]];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      blobs.forEach(([c, x, y, r], i) => {
        const xx = x + Math.sin(t * 0.25 + i * 1.7) * 90, yy = y + Math.cos(t * 0.2 + i) * 110;
        const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r);
        g.addColorStop(0, c + '88'); g.addColorStop(1, c + '00');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      ctx.restore();
    },
  };
  // 飘雪：确定性的雪花
  E.snow = function (ctx, t, n = 90, alpha = 0.8) {
    const r = E.rng(1225); ctx.save();
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 30 + r() * 70, sz = 1.5 + r() * 4, ph = r() * 6.28;
      const y = (y0 + sp * t) % H, x = x0 + Math.sin(t * 0.7 + ph) * 26;
      ctx.globalAlpha = alpha * (0.35 + 0.65 * (sz / 5.5));
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };
  // 毛玻璃卡片
  E.glassCard = function (ctx, x, y, w, h, a = 1, r = 36) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(20,10,60,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.stroke();
    ctx.restore();
  };
  // 像素化：先在 1/px 分辨率的画布上画，再无平滑放大
  const pixCanvases = {};
  E.pixelate = function (ctx, px, fn) {
    const k = px;
    let c = pixCanvases[k];
    if (!c) { c = document.createElement('canvas'); c.width = Math.ceil(W / k); c.height = Math.ceil(H / k); pixCanvases[k] = c; }
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
    g.setTransform(1 / k, 0, 0, 1 / k, 0, 0); g.imageSmoothingEnabled = false;
    fn(g);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, W, H); ctx.restore();
  };
  // 统一入口：按主题名画背景
  E.paint = function (ctx, th, t, o = {}) {
    const p = painters[th.name];
    if (p) p(ctx, th, t, o); else E.background(ctx, th, t, o);
  };
  Object.keys(E.themes).forEach(k => { E.themes[k].name = k; });

  // 粉笔线：多次抖动描边
  E.chalkLine = function (ctx, pts, color, width, seed = 1, prog = 1) {
    const r = E.rng(seed); ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    for (let pass = 0; pass < 3; pass++) {
      ctx.globalAlpha = 0.45 + 0.25 * r(); ctx.lineWidth = width * (0.6 + 0.5 * r());
      ctx.beginPath(); let acc = 0;
      for (let i = 0; i < pts.length; i++) {
        if (i > 0) { if (acc >= total * prog) break; const f = Math.min(1, (total * prog - acc) / seg[i - 1]); acc += seg[i - 1];
          const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
          ctx.lineTo(x + (r() - 0.5) * 2.2, y + (r() - 0.5) * 2.2);
        } else ctx.moveTo(pts[0][0] + (r() - 0.5) * 2, pts[0][1] + (r() - 0.5) * 2);
      }
      ctx.stroke();
    }
    ctx.restore();
  };
  // 手账荧光笔
  E.marker = function (ctx, x, y, w, h, color, prog = 1) {
    if (prog <= 0) return;
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y + 4); ctx.lineTo(x + w * prog, y); ctx.lineTo(x + w * prog - 6, y + h); ctx.lineTo(x + 4, y + h - 3); ctx.closePath(); ctx.fill(); ctx.restore();
  };

  E.background = function (ctx, th, t, o = {}) {
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, o.cy || H * 0.52, 50, W / 2, o.cy || H * 0.52, H * 0.6);
    glow.addColorStop(0, o.glow || 'rgba(60,48,30,0.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    if (o.dust !== false) E.dust(ctx, t, o.dustColor || '255,214,150', o.dustCount || 46);
  };
  E.dust = function (ctx, t, rgb, n) {
    const r = E.rng(77);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 8 + r() * 22, sz = 0.8 + r() * 2.2, ph = r() * 6.28, dr = (r() - 0.5) * 14;
      const y = ((y0 - sp * t) % H + H) % H, x = x0 + Math.sin(t * 0.4 + ph) * dr;
      const a = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.3 + ph));
      ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  // ---------- 小组件 ----------
  E.hud = function (ctx, th, x, y, label, value, o = {}) {
    ctx.save();
    ctx.textAlign = o.align || 'left'; ctx.globalAlpha = o.alpha ?? 1;
    ctx.font = `500 25px ${th.mono}`; ctx.fillStyle = o.labelColor || th.dim;
    ctx.letterSpacing = '4px'; ctx.fillText(label, x, y); ctx.letterSpacing = '0px';
    ctx.font = `700 ${o.size || 58}px ${th.mono}`; ctx.fillStyle = o.color || th.gold;
    if (o.glow) { ctx.shadowColor = o.color || th.gold; ctx.shadowBlur = 24; }
    ctx.fillText(value, x, y + (o.size || 58) + 14);
    ctx.restore();
  };
  E.bigNumber = function (ctx, th, text, x, y, o = {}) {
    ctx.save();
    ctx.textAlign = 'center'; ctx.globalAlpha = o.alpha ?? 1;
    ctx.font = `${o.weight || 700} ${o.size || 220}px ${o.font || th.num}`;
    const col = o.color || th.gold;
    const grd = ctx.createLinearGradient(0, y - (o.size || 220) * 0.8, 0, y);
    grd.addColorStop(0, o.top || th.goldHi); grd.addColorStop(1, col);
    ctx.fillStyle = o.flat ? col : grd;
    ctx.shadowColor = col; ctx.shadowBlur = (o.blur ?? 60) * (th.glow ?? 1);
    if (o.scale && o.scale !== 1) { ctx.translate(x, y); ctx.scale(o.scale, o.scale); ctx.fillText(text, 0, 0); }
    else ctx.fillText(text, x, y);
    ctx.restore();
  };

  // ---------- 片尾：有道领世（官方 logo：web/assets/logo_youdao_lingshi.png，533×108 透明底） ----------
  const BRAND = { bg: '#F7F3E8', line: '#EFA43C', tag: '#1D3C8F' };
  const LOGO = { S: 1.08, L: 253.8, T: 904.6, icon: [0, 162], chars: [[164, 254], [256, 345], [345, 438], [439, 527]] };
  let logoImg = null, iconCanvas = null;
  E.loadAssets = async function (base = '') {
    logoImg = new Image(); logoImg.src = base + 'assets/logo_youdao_lingshi.png'; await logoImg.decode();
  };
  // 图标中心线（用作描边生长的遮罩），坐标映射到官方 logo 的图标区域
  function iconPath() {
    const p = new Path2D();
    p.moveTo(254, 248); p.lineTo(165, 248);
    p.arc(165, 165, 83, Math.PI / 2, (321.5 * Math.PI) / 180, false);
    p.lineTo(522, 479); p.lineTo(712, 95); p.lineTo(418, 178);
    return p;
  }
  function drawIcon(ctx, prog) {
    const { S, L, T, icon } = LOGO, w = icon[1] * S, h = 108 * S;
    if (prog >= 1) { ctx.drawImage(logoImg, 0, 0, icon[1], 108, L, T, w, h); return; }
    if (!iconCanvas) { iconCanvas = document.createElement('canvas'); iconCanvas.width = Math.ceil(w); iconCanvas.height = Math.ceil(h); }
    const g = iconCanvas.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, iconCanvas.width, iconCanvas.height);
    g.setTransform(S * 0.2088, 0, 0, S * 0.2047, S * (7 - 47 * 0.2088), S * (3 - 42 * 0.2047));
    g.lineWidth = 118; g.lineJoin = 'miter'; g.miterLimit = 12; g.lineCap = 'butt';
    g.setLineDash([1700 * prog, 1700]); g.strokeStyle = '#000'; g.stroke(iconPath());
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in';
    g.imageSmoothingQuality = 'high'; g.drawImage(logoImg, 0, 0, icon[1], 108, 0, 0, w, h);
    ctx.drawImage(iconCanvas, L, T);
  }
  E.ENDCARD_DUR = 4.2;
  E.endcard = function (ctx, lt) {
    if (lt < 0) return;
    const R = 1300;
    const r = E.ease.inOut(E.seg(lt, 0, 0.75)) * R;
    ctx.save();
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = BRAND.bg;
    if (r >= R) ctx.fillRect(0, 0, W, H); else { ctx.beginPath(); ctx.arc(W / 2, 960, r, 0, Math.PI * 2); ctx.fill(); }
    // 顶部橙色短线
    const lp = E.ease.out(E.seg(lt, 0.6, 1.2));
    if (lp > 0) { ctx.fillStyle = BRAND.line; ctx.fillRect(540 - 60 * lp, 818, 120 * lp, 3); }
    // 图标描边生长
    const ip = E.ease.inOut(E.seg(lt, 0.75, 1.75));
    if (ip > 0) drawIcon(ctx, ip);
    // 文字标：有道领世，逐字滑入
    LOGO.chars.forEach(([a, b], i) => {
      const al = E.ease.out(E.seg(lt, 1.05 + i * 0.09, 1.55 + i * 0.09));
      if (al <= 0) return;
      ctx.globalAlpha = al;
      ctx.drawImage(logoImg, a, 0, b - a, 108, LOGO.L + a * LOGO.S - (1 - al) * 18, LOGO.T, (b - a) * LOGO.S, 108 * LOGO.S);
    });
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'middle';
    // 标语：字距由宽到窄收拢
    const tp = E.ease.out(E.seg(lt, 1.7, 2.6));
    if (tp > 0) {
      const tag = '高效学习 从有道领世开始';
      ctx.font = `400 47px "Noto Sans SC"`;
      const base = [...tag].map(c => (c === ' ' ? 26 : ctx.measureText(c).width));
      const sumBase = base.reduce((a, b) => a + b, 0);
      const lsFinal = (682 - sumBase) / (tag.length - 1);
      const ls = lsFinal + (1 - tp) * 14;
      let tx = 540 - (sumBase + ls * (tag.length - 1)) / 2;
      ctx.globalAlpha = tp; ctx.fillStyle = BRAND.tag;
      [...tag].forEach((c, i) => { if (c !== ' ') ctx.fillText(c, tx, 1131); tx += base[i] + ls; });
    }
    ctx.restore();
  };

  root.E = E;
})(typeof window !== 'undefined' ? window : globalThis);
