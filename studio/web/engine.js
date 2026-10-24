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
  E.themes = {
    cinema: {
      bg: '#070709', fg: '#EDE6D6', dim: '#7E786C', faint: '#2A2925',
      gold: '#F2B65A', goldHi: '#FFD892', red: '#E0604E',
      cap: '"Noto Serif SC"', capW: 700, num: '"Playfair Display", "Noto Serif SC"', mono: '"JetBrains Mono", "Noto Sans SC"',
    },
    info: {
      bg: '#050505', fg: '#F4F4F4', dim: '#8A8A8A', faint: '#262626',
      gold: '#F5B83D', goldHi: '#FFD36B', red: '#E5484D',
      cap: '"Noto Sans SC"', capW: 700, num: '"Noto Sans SC"', mono: '"JetBrains Mono", "Noto Sans SC"',
    },
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
        const glow = c.style === 'g' ? (o.glow ?? 0.5) : (o.glowAll || 0);
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
  E.vignette = function (ctx, k = 0.75) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
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
    ctx.shadowColor = col; ctx.shadowBlur = o.blur ?? 60;
    if (o.scale && o.scale !== 1) { ctx.translate(x, y); ctx.scale(o.scale, o.scale); ctx.fillText(text, 0, 0); }
    else ctx.fillText(text, x, y);
    ctx.restore();
  };

  // ---------- 片尾：有道领世 ----------
  const BRAND = { bg: '#F7F3E8', line: '#EFA43C', word: '#2F3234', tag: '#1D3C8F' };
  // 图标中心线（原截图放大 4 倍后的坐标系）
  function iconPath() {
    const p = new Path2D();
    p.moveTo(254, 248); p.lineTo(165, 248);
    p.arc(165, 165, 83, Math.PI / 2, (321.5 * Math.PI) / 180, false);
    p.lineTo(522, 479); p.lineTo(712, 95); p.lineTo(418, 178);
    return p;
  }
  function drawIcon(ctx, prog) {
    const p = iconPath(), L = 1700;
    ctx.save();
    ctx.translate(249.53, 901.63); ctx.scale(0.22275, 0.22275);
    ctx.lineWidth = 70; ctx.lineJoin = 'miter'; ctx.miterLimit = 12; ctx.lineCap = 'butt';
    const dash = () => { if (prog < 1) { ctx.setLineDash([L * prog, L]); } else ctx.setLineDash([]); };
    let g = ctx.createLinearGradient(120, 40, 520, 520);
    g.addColorStop(0, '#4C8EFF'); g.addColorStop(1, '#2B58E6');
    dash(); ctx.strokeStyle = g; ctx.stroke(p);
    ctx.save(); ctx.beginPath();
    ctx.moveTo(528, 660); ctx.lineTo(528, 420); ctx.lineTo(600, 185); ctx.lineTo(560, -40); ctx.lineTo(860, -40); ctx.lineTo(860, 660); ctx.closePath(); ctx.clip();
    g = ctx.createLinearGradient(520, 520, 740, 50);
    g.addColorStop(0, '#3A60F0'); g.addColorStop(0.3, '#7E86EE'); g.addColorStop(0.47, '#D6A3CF');
    g.addColorStop(0.64, '#F4A458'); g.addColorStop(1, '#F07510');
    dash(); ctx.strokeStyle = g; ctx.stroke(p); ctx.restore();
    ctx.save(); ctx.beginPath();
    ctx.moveTo(370, -40); ctx.lineTo(370, 270); ctx.lineTo(660, 200); ctx.lineTo(720, -40); ctx.closePath(); ctx.clip();
    g = ctx.createLinearGradient(410, 180, 700, 100);
    g.addColorStop(0, '#F8C84A'); g.addColorStop(0.55, '#F4A033'); g.addColorStop(1, 'rgba(240,120,18,0)');
    dash(); ctx.strokeStyle = g; ctx.stroke(p); ctx.restore();
    ctx.restore();
  }
  E.ENDCARD_DUR = 4.2;
  E.endcard = function (ctx, lt) {
    if (lt < 0) return;
    const R = 1300;
    const r = E.ease.inOut(E.seg(lt, 0, 0.75)) * R;
    ctx.save();
    ctx.fillStyle = BRAND.bg;
    if (r >= R) ctx.fillRect(0, 0, W, H); else { ctx.beginPath(); ctx.arc(W / 2, 960, r, 0, Math.PI * 2); ctx.fill(); }
    // 顶部橙色短线
    const lp = E.ease.out(E.seg(lt, 0.6, 1.2));
    if (lp > 0) { ctx.fillStyle = BRAND.line; ctx.fillRect(540 - 60 * lp, 818, 120 * lp, 3); }
    // 图标描边生长
    const ip = E.ease.inOut(E.seg(lt, 0.75, 1.75));
    if (ip > 0) drawIcon(ctx, ip);
    // 文字标：有道领世
    ctx.font = `500 100px "Noto Sans SC"`; ctx.textBaseline = 'middle';
    const word = '有道领世'; const ww = ctx.measureText(word).width; const k = 388 / ww;
    ctx.font = `500 ${(100 * k).toFixed(1)}px "Noto Sans SC"`;
    let x = 427.7;
    [...word].forEach((ch, i) => {
      const a = E.ease.out(E.seg(lt, 1.05 + i * 0.09, 1.55 + i * 0.09));
      const w = ctx.measureText(ch).width;
      if (a > 0) {
        ctx.globalAlpha = a; ctx.fillStyle = BRAND.word;
        ctx.fillText(ch, x - (1 - a) * 18, 968);
      }
      x += w;
    });
    ctx.globalAlpha = 1;
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
