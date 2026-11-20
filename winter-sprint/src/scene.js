/* 潜心奋战冬三月，夯基提能胜百天 — 60 s motivational video.
 * Every frame is a pure function of time t: window.renderFrame(t).
 * All beats are keyed to the voiceover timeline (../assets/timeline.json).
 * window.EVENTS (impacts, whooshes, cracks…) is exported for the sound-effect track.
 */
(() => {
  // ---------------------------------------------------------------- config
  const CFG = { gaokao: '2027-06-07', today: '2026-11-20' };   // change `today` to the publish date
  const DAYS = Math.round((Date.parse(CFG.gaokao) - Date.parse(CFG.today)) / 864e5);
  const W = 1080, H = 1920, DUR = 60;

  // ---------------------------------------------------------------- helpers
  const $ = (id) => document.getElementById(id);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => (!isFinite(a) ? 0 : clamp((t - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eOut = (k) => 1 - Math.pow(1 - k, 3);
  const eOut5 = (k) => 1 - Math.pow(1 - k, 5);
  const eIn = (k) => k * k * k;
  const eIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const eBack = (k) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const hexMix = (a, b, k) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`;
  };
  function rng(seed) { // mulberry32
    return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const han = (s) => [...s].filter((c) => c >= '一' && c <= '鿿').length;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };

  // ---------------------------------------------------------------- timeline
  let TL, S = {};
  const cues = (sid) => TL.cues.filter((c) => c.sid === sid);
  const cue = (sid, k) => cues(sid)[k].start;
  /** time at which han-character #ci of sentence sid is spoken (linear inside its subtitle phrase) */
  function wt(sid, ci) {
    let acc = 0;
    for (const c of cues(sid)) { const n = han(c.text); if (ci < acc + n) return c.start + (c.end - c.start) * ((ci - acc) / n); acc += n; }
    return S[sid].end;
  }

  // ---------------------------------------------------------------- element animation primitives
  /** heavy "slam": falls from big scale onto the screen, lands with a small settle */
  function slam(el, t, t0, o = {}) {
    const from = o.from ?? 2.6, dur = o.dur ?? 0.2, blur = o.blur ?? 16, base = o.base ?? '';
    if (t < t0) { el.style.opacity = 0; return; }
    const k = seg(t, t0, t0 + dur), d = t - t0 - dur;
    let s = lerp(from, 1, eIn(k));
    if (d > 0) s = 1 + 0.07 * Math.exp(-d * 10) * Math.cos(d * 32);
    el.style.opacity = Math.min(1, k * 2.5);
    el.style.transform = `${base} scale(${s.toFixed(4)}) rotate(${((o.rot ?? 0) * (1 - k)).toFixed(2)}deg)`;
    el.style.filter = k < 1 ? `blur(${((1 - k) * blur).toFixed(1)}px)` : '';
  }
  /** rise / slide in */
  function rise(el, t, t0, o = {}) {
    const dur = o.dur ?? 0.4, dx = o.dx ?? 0, dy = o.dy ?? 40, base = o.base ?? '';
    const k = eOut5(seg(t, t0, t0 + dur));
    el.style.opacity = t < t0 ? 0 : k;
    el.style.transform = `${base} translate(${((1 - k) * dx).toFixed(1)}px,${((1 - k) * dy).toFixed(1)}px)`;
  }
  function fadeOut(el, t, t0, dur = 0.25) {
    const k = seg(t, t0, t0 + dur);
    if (k > 0) el.style.opacity = (parseFloat(el.style.opacity || 1) * (1 - k)).toFixed(3);
  }
  function sweep(el, t, t0, dur = 0.9) {
    const k = eIO(seg(t, t0, t0 + dur));
    el.style.backgroundPosition = `${(100 - k * 100).toFixed(1)}% 0`;
  }
  /** shot visibility window with a "push-through" exit */
  function shot(el, t, a, b) {
    const kin = seg(t, a - 0.1, a + 0.1), kout = seg(t, b - 0.08, b + 0.16);
    const op = kin * (1 - kout);
    el.style.opacity = op.toFixed(3);
    el.style.visibility = op <= 0 ? 'hidden' : 'visible';
    const s = 1 + 0.14 * eIn(kout);
    el.style.transform = `scale(${s.toFixed(4)})`;
    el.style.filter = kout > 0 ? `blur(${(kout * 12).toFixed(1)}px)` : '';
    return op > 0;
  }

  // ---------------------------------------------------------------- events (shared with audio)
  const EV = [];
  const ev = (t, k, x = 540, y = 960, extra = {}) => EV.push({ t: +t.toFixed(3), k, x, y, ...extra });
  const SHAKE = { big: 30, impact: 16, stamp: 18, crack: 20, hit: 7, boom: 10 };
  const RING = { big: 1, impact: 1, stamp: 1, hit: 0 };

  // ---------------------------------------------------------------- canvases
  let bg, bgx, fx, fxx;
  const snow = [], embers = [];
  function initParticles() {
    const r = rng(7);
    for (let i = 0; i < 260; i++) snow.push({ x: r() * W, y: r() * H, z: 0.3 + r() * 0.7, ph: r() * 6.28, sw: 10 + r() * 40 });
    const r2 = rng(11);
    for (let i = 0; i < 120; i++) embers.push({ x: r2() * W, y: r2() * H, z: 0.3 + r2() * 0.7, ph: r2() * 6.28 });
  }

  // look of the world over time
  let T = {};   // shot boundaries, filled in init
  function warmth(t) {
    if (t < T.I) return 0;
    if (t < T.J) return lerp(0, 0.42, eIO(seg(t, T.I, T.J)));
    if (t < T.crack) return lerp(0.42, 0.04, eOut(seg(t, T.J, T.J + 0.6)));
    if (t < T.K) return lerp(0.04, 0.62, eOut(seg(t, T.crack, T.crack + 0.5)));
    return lerp(0.62, 1, eIO(seg(t, T.K - 0.2, T.K + 1.6)));
  }
  function snowAmt(t) {
    if (t < T.I) return 1;
    if (t < T.J) return lerp(1, 0.35, seg(t, T.I, T.J));
    if (t < T.crack) return 0.75;
    return 0;
  }

  function drawBG(t) {
    const w = warmth(t);
    const g = bgx.createLinearGradient(0, 0, 0, H);
    // night → dawn → sunrise
    const top = w < 0.5 ? hexMix('#02060F', '#1A1238', w * 2) : hexMix('#1A1238', '#3A1A3E', (w - 0.5) * 2);
    const mid = w < 0.5 ? hexMix('#081530', '#3A2150', w * 2) : hexMix('#3A2150', '#B5402F', (w - 0.5) * 2);
    const bot = w < 0.5 ? hexMix('#10264A', '#7A3550', w * 2) : hexMix('#7A3550', '#F59A2E', (w - 0.5) * 2);
    g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot);
    bgx.fillStyle = g; bgx.fillRect(0, 0, W, H);

    // sun + god rays
    if (w > 0.45) {
      const k = seg(w, 0.45, 1);
      const sy = lerp(2400, 2030, eOut(k)), sr = 330;
      bgx.save();
      bgx.globalCompositeOperation = 'lighter';
      const halo = bgx.createRadialGradient(540, sy, 0, 540, sy, 1300);
      halo.addColorStop(0, `rgba(255,214,140,${0.5 * k})`); halo.addColorStop(0.35, `rgba(255,150,70,${0.18 * k})`); halo.addColorStop(1, 'rgba(255,120,60,0)');
      bgx.fillStyle = halo; bgx.fillRect(0, 0, W, H);
      bgx.translate(540, sy);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + t * 0.05;
        bgx.rotate(0); bgx.beginPath(); bgx.moveTo(0, 0);
        bgx.arc(0, 0, 2400, a, a + 0.07); bgx.closePath();
        bgx.fillStyle = `rgba(255,220,160,${0.05 * k})`; bgx.fill();
      }
      const disc = bgx.createRadialGradient(0, 0, 0, 0, 0, sr);
      disc.addColorStop(0, `rgba(255,248,225,${k})`); disc.addColorStop(0.7, `rgba(255,214,120,${0.9 * k})`); disc.addColorStop(1, 'rgba(255,170,80,0)');
      bgx.fillStyle = disc; bgx.beginPath(); bgx.arc(0, 0, sr, 0, 6.29); bgx.fill();
      bgx.restore();
    }

    // frost on the edges while it is winter
    const frost = (1 - seg(w, 0, 0.5)) * 0.9;
    if (frost > 0.01) {
      const fr = bgx.createRadialGradient(540, 960, 700, 540, 960, 1250);
      fr.addColorStop(0, 'rgba(160,210,255,0)'); fr.addColorStop(1, `rgba(170,215,255,${0.22 * frost})`);
      bgx.fillStyle = fr; bgx.fillRect(0, 0, W, H);
    }

    // snow (analytic, deterministic)
    const amt = snowAmt(t);
    if (amt > 0) {
      for (let i = 0; i < snow.length * amt; i++) {
        const f = snow[i];
        const y = (f.y + t * (60 + 200 * f.z)) % (H + 40) - 20;
        const x = ((f.x + Math.sin(t * 0.8 + f.ph) * f.sw + t * 18 * f.z) % (W + 40) + W + 40) % (W + 40) - 20;
        const r = 1.2 + 4.2 * f.z * f.z;
        bgx.fillStyle = `rgba(235,245,255,${0.25 + 0.6 * f.z})`;
        bgx.beginPath(); bgx.arc(x, y, r, 0, 6.29); bgx.fill();
      }
    }
    // embers rising after the ice breaks
    const ea = t > T.crack ? seg(t, T.crack, T.crack + 0.8) : 0;
    if (ea > 0) {
      bgx.save(); bgx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        const y = ((e.y - (t - T.crack) * (80 + 260 * e.z)) % (H + 40) + H + 40) % (H + 40) - 20;
        const x = e.x + Math.sin(t * 1.3 + e.ph) * 30;
        const r = 1.5 + 4 * e.z;
        bgx.fillStyle = `rgba(255,${Math.round(150 + 80 * e.z)},90,${ea * (0.35 + 0.5 * e.z)})`;
        bgx.beginPath(); bgx.arc(x, y, r, 0, 6.29); bgx.fill();
      }
      bgx.restore();
    }
  }

  // ---------------------------------------------------------------- FX layer: rings, sparks, shards, flash, shake
  function drawFX(t) {
    fxx.clearRect(0, 0, W, H);
    let sx = 0, sy = 0, rot = 0, flash = 0;
    EV.forEach((e, i) => {
      const d = t - e.t;
      if (d < 0 || d > 1.6) return;
      const A = SHAKE[e.k] || 0;
      if (A && d < 0.6) {
        const f = A * Math.exp(-d * 9);
        sx += f * Math.sin(d * 71 + i * 1.7); sy += f * Math.cos(d * 63 + i * 2.3); rot += f * 0.012 * Math.sin(d * 47 + i);
      }
      if (e.k === 'big') flash += 0.55 * Math.exp(-d * 9);
      if (e.k === 'impact') flash += 0.16 * Math.exp(-d * 12);
      if (e.k === 'flash') flash += 0.9 * Math.exp(-d * 6);
      const warm = e.t > T.crack - 0.05;
      if (RING[e.k] && d < 0.7) {   // shockwave ring
        const k = d / 0.7, r = 60 + eOut(k) * (e.k === 'big' ? 1300 : 800);
        fxx.strokeStyle = warm ? `rgba(255,214,140,${(1 - k) * 0.85})` : `rgba(190,230,255,${(1 - k) * 0.8})`;
        fxx.lineWidth = 18 * (1 - k) + 1; fxx.beginPath(); fxx.arc(e.x, e.y, r, 0, 6.29); fxx.stroke();
      }
      if ((e.k === 'big' || e.k === 'burst') && d < 1.2) {   // sparks
        const r = rng(1000 + i), n = e.k === 'big' ? 90 : 60;
        fxx.save(); fxx.globalCompositeOperation = 'lighter'; fxx.lineCap = 'round';
        for (let j = 0; j < n; j++) {
          const a = r() * 6.283, v = 700 + r() * 1700, life = 0.6 + r() * 0.6;
          if (d > life) continue;
          const drag = (1 - Math.exp(-d * 3)) / 3;
          const x = e.x + Math.cos(a) * v * drag, y = e.y + Math.sin(a) * v * drag + 500 * d * d;
          const x2 = e.x + Math.cos(a) * v * Math.max(0, drag - 0.02), y2 = e.y + Math.sin(a) * v * Math.max(0, drag - 0.02) + 500 * d * d;
          const al = 1 - d / life;
          fxx.strokeStyle = warm ? `rgba(255,${190 + Math.round(r() * 60)},110,${al})` : `rgba(200,235,255,${al})`;
          fxx.lineWidth = 2 + r() * 4; fxx.beginPath(); fxx.moveTo(x2, y2); fxx.lineTo(x, y); fxx.stroke();
        }
        fxx.restore();
      }
      if (e.k === 'shatter' && d < 1.3) {   // ice shards
        const r = rng(77);
        for (let j = 0; j < 46; j++) {
          const a = r() * 6.283, v = 500 + r() * 1500, sz = 30 + r() * 90, sp = (r() - 0.5) * 14;
          const dist = v * (1 - Math.exp(-d * 2.2)) / 2.2;
          const x = e.x + Math.cos(a) * (dist + 60 * r()), y = e.y + Math.sin(a) * (dist + 60 * r()) + 700 * d * d;
          fxx.save(); fxx.translate(x, y); fxx.rotate(sp * d + a);
          fxx.globalAlpha = Math.max(0, 1 - d / 1.3);
          fxx.fillStyle = 'rgba(210,235,255,.55)'; fxx.strokeStyle = 'rgba(255,255,255,.9)'; fxx.lineWidth = 2;
          fxx.beginPath(); fxx.moveTo(0, -sz); fxx.lineTo(sz * 0.45, sz * 0.4); fxx.lineTo(-sz * 0.5, sz * 0.25); fxx.closePath();
          fxx.fill(); fxx.stroke(); fxx.restore();
        }
      }
    });
    $('world').style.transform = `translate(${sx.toFixed(2)}px,${sy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
    $('flash').style.opacity = Math.min(0.85, flash).toFixed(3);
  }

  // ---------------------------------------------------------------- builders for SVG scenes
  let route = {}, gsc = {}, crack = [], knight = {};
  function buildRoute() {
    const s = $('c-route');
    const xs = [150, 420, 690, 950], y = 210;
    const names = ['一轮', '二轮', '三轮', '高考'], sub = ['开学—2/3月', '3—4月', '5月', '6月7日'];
    route.path = svg('path', { d: `M60 ${y} L1020 ${y}`, stroke: '#8FD3FF', 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none', 'stroke-dasharray': 960, 'stroke-dashoffset': 960 }, s);
    route.hot = svg('path', { d: `M${xs[0]} ${y} L${xs[0] + 210} ${y}`, stroke: '#FF4A3A', 'stroke-width': 16, 'stroke-linecap': 'round', fill: 'none', opacity: 0 }, s);
    route.nodes = xs.map((x, i) => {
      const g = svg('g', { transform: `translate(${x},${y})`, opacity: 0 }, s);
      svg('circle', { r: i === 3 ? 46 : 34, fill: i === 3 ? '#F5B83D' : '#0B1426', stroke: i === 3 ? '#FFE6A8' : '#8FD3FF', 'stroke-width': 9 }, g);
      const tx = svg('text', { y: 108, 'text-anchor': 'middle', 'font-size': 58, 'font-weight': 900, fill: i === 0 ? '#fff' : '#BFE3FF' }, g); tx.textContent = names[i];
      const t2 = svg('text', { y: 160, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 500, fill: '#7F9CC0' }, g); t2.textContent = sub[i];
      return g;
    });
  }
  function buildBook() {
    const r = $('d-rays');
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      svg('path', { d: `M0 0 L${Math.cos(a - 0.06) * 600} ${Math.sin(a - 0.06) * 600} L${Math.cos(a + 0.06) * 600} ${Math.sin(a + 0.06) * 600} Z`, fill: 'url(#rayg)' }, r);
    }
    const defs = svg('defs', {}, r);
    const rg = svg('radialGradient', { id: 'rayg', cx: 0, cy: 0, r: 600, gradientUnits: 'userSpaceOnUse' }, defs);
    svg('stop', { offset: 0, 'stop-color': '#FFE6A8', 'stop-opacity': 0.9 }, rg);
    svg('stop', { offset: 1, 'stop-color': '#FFE6A8', 'stop-opacity': 0 }, rg);
  }
  function buildBuilding() {
    const s = $('g-svg');
    const defs = svg('defs', {}, s);
    const glow = svg('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    svg('feGaussianBlur', { stdDeviation: 6, result: 'b' }, glow);
    const m = svg('feMerge', {}, glow); svg('feMergeNode', { in: 'b' }, m); svg('feMergeNode', { in: 'SourceGraphic' }, m);
    svg('line', { x1: 80, x2: 1000, y1: 962, y2: 962, stroke: '#8FD3FF', 'stroke-width': 4, opacity: 0.6 }, s);
    gsc.bricks = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 6; col++) {
      const x = 240 + col * 100 + (row % 2 ? 50 : 0) - (row % 2 && col === 5 ? 50 : 0), y = 920 - row * 40;
      const w = row % 2 && (col === 5) ? 50 : 96;
      gsc.bricks.push(svg('rect', { x, y, width: w, height: 36, rx: 4, fill: row % 2 ? '#5FA8E8' : '#8FD3FF', stroke: '#0B1426', 'stroke-width': 3, opacity: 0 }, s));
      if (row % 2 && col === 0) gsc.bricks.push(svg('rect', { x: 240, y, width: 46, height: 36, rx: 4, fill: '#5FA8E8', stroke: '#0B1426', 'stroke-width': 3, opacity: 0 }, s));
    }
    gsc.bLabel = svg('text', { x: 540, y: 1040, 'text-anchor': 'middle', 'font-size': 50, 'font-weight': 900, fill: '#8FD3FF', opacity: 0 }, s);
    gsc.bLabel.textContent = '一轮 = 地基';
    gsc.bldg = svg('g', { opacity: 0 }, s);
    svg('rect', { x: 330, y: 240, width: 420, height: 600, fill: '#16284A', stroke: '#8FD3FF', 'stroke-width': 5 }, gsc.bldg);
    gsc.win = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++)
      gsc.win.push(svg('rect', { x: 370 + c * 92, y: 280 + r * 78, width: 60, height: 44, rx: 4, fill: '#FFE6A8', opacity: 0.85 }, gsc.bldg));
    const lt = svg('text', { x: 540, y: 220, 'text-anchor': 'middle', 'font-size': 50, 'font-weight': 900, fill: '#FFE6A8' }, gsc.bldg); lt.textContent = '二轮 = 高楼';
    const cr = 'M560 962 L540 930 L566 900 L530 872 L552 842 L510 790 L560 730 L520 660 L590 590 L548 520 L610 450 L570 380 L640 300 L600 240';
    gsc.crack = svg('path', { d: cr, fill: 'none', stroke: '#FF4A3A', 'stroke-width': 9, 'stroke-linejoin': 'round', filter: 'url(#glow)', opacity: 0 }, s);
    gsc.crackLen = 1000;
    gsc.crack.setAttribute('stroke-dasharray', gsc.crackLen);
    gsc.scan = svg('g', { opacity: 0 }, s);
    svg('rect', { x: 250, y: -6, width: 580, height: 12, rx: 6, fill: '#7FFFE0', filter: 'url(#glow)' }, gsc.scan);
    svg('rect', { x: 250, y: -90, width: 580, height: 90, fill: 'url(#scang)' }, gsc.scan);
    const sg = svg('linearGradient', { id: 'scang', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svg('stop', { offset: 0, 'stop-color': '#7FFFE0', 'stop-opacity': 0 }, sg); svg('stop', { offset: 1, 'stop-color': '#7FFFE0', 'stop-opacity': 0.35 }, sg);
    const tg = svg('g', { transform: 'translate(40,-34)' }, gsc.scan);
    svg('rect', { x: 0, y: 0, width: 200, height: 68, rx: 12, fill: '#7FFFE0' }, tg);
    const tt = svg('text', { x: 100, y: 48, 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 900, fill: '#05162B' }, tg); tt.textContent = '一模 · 联考';
  }
  function buildCrack() {
    const s = $('j-crack'), r = rng(23);
    const cx = 540, cy = 960;
    for (let i = 0; i < 16; i++) {
      let a = (i / 16) * 6.283 + r() * 0.3, x = cx, y = cy, d = `M${cx} ${cy}`, len = 0;
      const steps = 7 + Math.floor(r() * 4);
      for (let k = 0; k < steps; k++) {
        a += (r() - 0.5) * 0.7; const L = 60 + r() * 140;
        x += Math.cos(a) * L; y += Math.sin(a) * L; len += L; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      const p = svg('path', { d, fill: 'none', stroke: '#F2FAFF', 'stroke-width': 3 + r() * 5, 'stroke-linejoin': 'round', 'stroke-dasharray': len, 'stroke-dashoffset': len, opacity: 0.95 }, s);
      crack.push({ p, len });
    }
  }
  function buildKnight() {
    const s = $('j-knight');
    const [x0, y0, w, h] = KNIGHT.vb;
    s.setAttribute('viewBox', `${x0 - 60} ${y0 - 60} ${w + 120} ${h + 120}`);
    const defs = svg('defs', {}, s);
    const lg = svg('linearGradient', { id: 'kg', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    svg('stop', { offset: 0, 'stop-color': '#1B2338' }, lg); svg('stop', { offset: 1, 'stop-color': '#020306' }, lg);
    const f = svg('filter', { id: 'kglow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
    svg('feGaussianBlur', { stdDeviation: 22, result: 'b' }, f);
    const m = svg('feMerge', {}, f); svg('feMergeNode', { in: 'b' }, m); svg('feMergeNode', { in: 'SourceGraphic' }, m);
    const g = svg('g', { transform: 'scale(1,-1)' }, s);
    knight.rim = svg('path', { d: KNIGHT.d, fill: 'none', stroke: '#FFD36B', 'stroke-width': 34, filter: 'url(#kglow)', opacity: 0 }, g);
    knight.body = svg('path', { d: KNIGHT.d, fill: 'url(#kg)', stroke: '#8FD3FF', 'stroke-width': 10, 'stroke-opacity': 0.5 }, g);
  }
  function splitChars(el, text) {
    el.innerHTML = '';
    return [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch; el.appendChild(s); return s; });
  }

  // ---------------------------------------------------------------- init
  let kL1, kL2;
  async function init() {
    TL = await (await fetch('../assets/timeline.json')).json();
    TL.sentences.forEach((s) => (S[s.id] = s));
    bg = $('bg'); bgx = bg.getContext('2d'); fx = $('fx'); fxx = fx.getContext('2d');
    initParticles();
    for (const id of ['a-n', 'tb-days', 'k-days']) $(id).textContent = String(DAYS);
    $('a-h').textContent = (DAYS * 24).toLocaleString('en-US');
    $('a-m').textContent = (DAYS * 1440).toLocaleString('en-US');
    $('e-title').textContent = '七八成分数';
    kL1 = splitChars($('k-l1'), '潜心奋战冬三月');
    kL2 = splitChars($('k-l2'), '夯基提能胜百天');
    kL2.forEach((sp) => sp.classList.add('gold-fill'));   // gradient per character so hidden ones stay hidden
    buildRoute(); buildBook(); buildBuilding(); buildCrack(); buildKnight();

    // shot boundaries (all derived from the voice timeline)
    T.A = 0;
    T.B = S.s2.start - 0.1;
    T.C = S.s3.start - 0.12;
    T.D = S.s4.start - 0.12;
    T.E = S.s5.start - 0.12;
    T.F = S.s6.start - 0.12;
    T.G = S.s7.start - 0.32;
    T.H = S.s9.start - 0.12;
    T.I = S.s10.start - 0.28;
    T.J = S.s14.start - 0.2;
    T.crack = S.s15.start;
    T.K = S.s16.start - 0.2;
    T.end = S.s16.end + 0.08;
    buildEvents();

    const allText = document.body.innerText + TL.cues.map((c) => c.text).join('') + '0123456789,:·→=+%一二三四五六七八九十';
    await Promise.all(['500 40px "Noto Sans SC"', '700 40px "Noto Sans SC"', '900 40px "Noto Sans SC"',
      '40px "Anton"', '40px "Ma Shan Zheng"'].map((f) => document.fonts.load(f, allText)));
    await document.fonts.ready;
    window.EVENTS = EV.slice().sort((a, b) => a.t - b.t);
    window.TIMES = T;
    return true;
  }

  function buildEvents() {
    // A
    ev(0.12, 'tick'); ev(0.62, 'tick'); ev(0.3, 'heart');
    T.num = cue('s1', 1) - 0.03;
    ev(T.num - 0.75, 'riser', 540, 960, { dur: 0.75 });
    ev(T.num, 'big', 540, 900);
    ev(T.num + 0.28, 'hit', 860, 900);
    ev(T.B - 0.12, 'whoosh');
    // B
    T.tiles = S.s2.start;
    [0, 0.17, 0.34].forEach((d, i) => ev(T.tiles + d, 'flip', 270 + i * 310, 640));
    T.win = cue('s2', 1) - 0.12;
    ev(T.win, 'whoosh');
    T.spr = wt('s2', 7) - 0.05;
    ev(T.spr, 'impact', 770, 960);
    T.eq = cue('s2', 2);
    T.all = wt('s2', 14) - 0.06;
    ev(T.all, 'big', 620, 1290);
    // C
    T.cTitle = S.s3.start - 0.05; ev(T.cTitle, 'hit', 540, 340);
    ev(S.s3.start + 0.05, 'whoosh');
    T.pin = cue('s3', 1); ev(T.pin + 0.22, 'hit', 360, 850);
    T.stamp = wt('s3', 8) - 0.05; ev(T.stamp, 'stamp', 540, 1250);
    // D
    T.dTitle = S.s4.start; ev(T.dTitle, 'impact', 540, 360);
    T.w1 = wt('s4', 4) + 0.12; T.w2 = wt('s4', 6) - 0.04; T.w3 = wt('s4', 8) - 0.04;
    ev(T.w1, 'hit', 540, 610); ev(T.w2, 'hit', 540, 850); ev(T.w3, 'impact', 540, 1090);
    // E
    T.eTitle = S.s5.start; ev(T.eTitle, 'impact', 540, 340);
    T.bars = S.s5.start + 0.35; ev(T.bars, 'whoosh');
    T.brk = cue('s5', 1); ev(T.brk, 'hit', 444, 990);
    T.pct = T.brk + 0.75; ev(T.pct, 'big', 540, 620);
    // F
    T.paper = S.s6.start - 0.05; ev(T.paper, 'whoosh');
    T.fStamp = wt('s6', 2) - 0.05; ev(T.fStamp, 'stamp', 780, 520);
    T.rows = [0, 1, 2, 3].map((i) => cue('s6', 1) + 0.06 + i * 0.36);
    T.rows.forEach((tt) => ev(tt, 'tick'));
    T.fPre = cue('s6', 2) - 0.05;
    T.fBig = wt('s6', 14) - 0.06; ev(T.fBig, 'big', 540, 1020);
    // G
    T.bricks = T.G + 0.02; ev(T.bricks + 0.35, 'hit', 540, 1380);
    T.bldg = T.G + 0.3; ev(T.bldg, 'whoosh');
    T.gT1 = S.s7.start;
    T.crack1 = wt('s7', 2) - 0.05; ev(T.crack1, 'crack', 540, 1360);
    T.gT2 = cue('s7', 1) - 0.03; ev(T.gT2, 'impact', 700, 340);
    T.crack2 = T.gT2 + 0.05; ev(T.crack2 + 0.2, 'crack', 580, 1000);
    T.scan = S.s8.start + 0.02; ev(T.scan, 'scan', 540, 960, { dur: 1.1 });
    T.gT3 = cue('s8', 1) - 0.03; ev(T.gT3, 'impact', 540, 340);
    // H
    T.slab = S.s9.start - 0.02; ev(T.slab + 0.16, 'impact', 540, 1410);
    T.down = wt('s9', 2) - 0.05;
    T.up = wt('s9', 7) - 0.12; ev(T.up - 0.05, 'whoosh'); ev(T.up + 0.12, 'big', 540, 520);
    // I
    T.iTitle = T.I + 0.05; ev(T.iTitle, 'impact', 540, 340);
    T.rowIn = ['s10', 's11', 's12', 's13'].map((s) => S[s].start - 0.1);
    T.rowA = ['s10', 's11', 's12', 's13'].map((s) => cue(s, 1) - 0.03);
    T.rowB = ['s10', 's11', 's12', 's13'].map((s) => cue(s, 2) - 0.03);
    T.rowIn.forEach((tt, i) => { ev(tt, 'whoosh'); ev(tt + 0.14, 'hit', 300, 560 + i * 250); });
    T.rowA.forEach((tt) => ev(tt, 'tick'));
    T.rowB.forEach((tt, i) => ev(tt, i === 3 ? 'impact' : 'tick', 680, 640 + i * 250));
    ev(S.s13.end - 0.6, 'riser', 540, 960, { dur: T.J - S.s13.end + 0.75 });
    // J
    ev(T.J + 0.12, 'boom');
    T.js1 = S.s14.start; T.js2 = cue('s14', 1); T.js3 = cue('s14', 2) - 0.04; ev(T.js3, 'impact', 540, 500);
    [T.J + 0.4, T.J + 1.25, T.J + 2.1, T.J + 2.9].forEach((tt) => ev(tt, 'heart'));
    ev(T.crack - 0.85, 'riser', 540, 960, { dur: 0.85 });
    ev(T.crack, 'crack', 540, 960); ev(T.crack + 0.02, 'shatter', 540, 960); ev(T.crack + 0.02, 'big', 540, 430);
    T.jb2 = cue('s15', 1) - 0.04; ev(T.jb2, 'impact', 540, 1450); ev(T.jb2 + 0.02, 'burst', 540, 1450);
    // K
    T.kChars = [...Array(7).keys()].map((i) => wt('s16', i) - 0.04);
    T.kChars.forEach((tt) => ev(tt, 'brush'));
    T.kL2 = cue('s16', 1) - 0.04; ev(T.kL2, 'big', 540, 860);
    ev(T.end, 'impact', 540, 1240); ev(T.end + 0.02, 'burst', 540, 1240); ev(T.end + 0.3, 'shine');
  }

  // ---------------------------------------------------------------- shots
  function shotA(t) {
    if (!shot($('A'), t, -1, T.B)) return;
    rise($('a-pre'), t, 0.45, { dy: 0, dur: 0.5 });
    $('a-pre').style.letterSpacing = `${lerp(0.7, 0.32, eOut(seg(t, 0.45, 1.0))).toFixed(3)}em`;
    slam($('a-n'), t, T.num - 0.2, { from: 4, dur: 0.2, blur: 22 });
    rise($('a-day'), t, T.num + 0.2, { dx: 120, dy: 0, dur: 0.3 });
    rise($('a-tick'), t, T.num + 0.45, { dy: 30 });
    // the clock keeps running down
    const run = Math.max(0, t - (T.num + 0.45));
    const mins = Math.max(0, DAYS * 1440 - Math.floor(run * run * 52000 + run * 9000));
    $('a-m').textContent = mins.toLocaleString('en-US');
    $('a-h').textContent = Math.floor(mins / 60).toLocaleString('en-US');
  }

  function shotB(t) {
    if (!shot($('B'), t, T.B, T.C)) return;
    [$('b-t1'), $('b-t2'), $('b-t3')].forEach((el, i) => {
      const t0 = T.tiles + i * 0.17;
      const k = eOut5(seg(t, t0, t0 + 0.32));
      el.style.opacity = t < t0 ? 0 : 1;
      el.style.transform = `translateY(${((1 - k) * -700).toFixed(1)}px) rotate(${((1 - k) * (i - 1) * 25).toFixed(2)}deg)`;
    });
    // tiles condense into the winter bar
    const kc = eIO(seg(t, T.win, T.win + 0.35));
    $('b-tiles').style.transform = `translateY(${(kc * 120).toFixed(1)}px) scale(${lerp(1, 0.78, kc).toFixed(3)})`;
    const kb = eOut5(seg(t, T.win, T.win + 0.4));
    $('b-bar').style.opacity = t < T.win ? 0 : 1;
    $('b-win').style.transform = `scaleX(${kb.toFixed(4)})`;
    const ks = eOut5(seg(t, T.spr - 0.12, T.spr + 0.05));
    $('b-spr').style.transform = `scaleX(${ks.toFixed(4)})`;
    $('b-spr').style.opacity = t < T.spr - 0.12 ? 0 : 1;
    rise($('b-labels'), t, T.spr + 0.1, { dy: 20 });
    rise($('b-eq'), t, T.eq, { dy: 0, dur: 0.25 });
    slam($('b-all'), t, T.all - 0.2, { from: 3.4, dur: 0.2, blur: 20, rot: -8 });
    // bar glows once it becomes "everything"
    const glow = t > T.all ? 0.25 + 0.35 * Math.exp(-(t - T.all) * 3) : 0.25;
    $('b-bar').style.boxShadow = `0 0 ${(40 + glow * 80).toFixed(0)}px rgba(255,120,80,${glow.toFixed(3)})`;
  }

  function shotC(t) {
    if (!shot($('C'), t, T.C, T.D)) return;
    slam($('c-title'), t, T.cTitle - 0.18, { from: 2, dur: 0.18 });
    const kp = eIO(seg(t, S.s3.start + 0.05, S.s3.start + 0.75));
    route.path.setAttribute('stroke-dashoffset', (960 * (1 - kp)).toFixed(1));
    route.nodes.forEach((g, i) => {
      const t0 = S.s3.start + 0.15 + i * 0.15, k = seg(t, t0, t0 + 0.3);
      g.setAttribute('opacity', k.toFixed(3));
      const xs = [150, 420, 690, 950];
      g.setAttribute('transform', `translate(${xs[i]},210) scale(${(t < t0 ? 0 : eBack(k)).toFixed(3)})`);
    });
    // pin drops onto the late part of 一轮
    const pin = $('c-pin'), kd = seg(t, T.pin, T.pin + 0.25);
    const py = 640 + 210 - 250, px = 360 - 150;
    const bounce = t > T.pin + 0.25 ? -18 * Math.exp(-(t - T.pin - 0.25) * 8) * Math.abs(Math.sin((t - T.pin - 0.25) * 18)) : 0;
    css(pin, { opacity: t < T.pin ? 0 : 1, transform: `translate(${px}px,${(py - (1 - eIn(kd)) * 700 + bounce).toFixed(1)}px)` });
    route.hot.setAttribute('opacity', (seg(t, T.pin + 0.2, T.pin + 0.5) * (0.6 + 0.4 * Math.sin(t * 12))).toFixed(3));
    slam($('c-stamp'), t, T.stamp - 0.16, { from: 2.4, dur: 0.16, blur: 8, rot: 18, base: 'translateX(-50%) rotate(-10deg)' });
  }

  function shotD(t) {
    if (!shot($('D'), t, T.D, T.E)) return;
    slam($('d-title'), t, T.dTitle - 0.2, { from: 3, dur: 0.2 });
    slam($('d-w1'), t, T.w1 - 0.16, { from: 2.2, dur: 0.16 });
    slam($('d-w2'), t, T.w2 - 0.16, { from: 2.2, dur: 0.16 });
    slam($('d-w3'), t, T.w3 - 0.18, { from: 2.6, dur: 0.18 });
    sweep($('d-w3'), t, T.w3 + 0.2, 1.0);
    rise($('d-book'), t, T.D + 0.1, { dy: 120, dur: 0.6 });
    $('d-rays').style.opacity = (0.55 * seg(t, T.w3 - 0.1, T.w3 + 0.3) + 0.2 * seg(t, T.D, T.D + 0.5)).toFixed(3);
    $('d-rays').style.transform = `rotate(${(t * 12).toFixed(2)}deg) scale(${lerp(0.7, 1.15, seg(t, T.D, T.E)).toFixed(3)})`;
  }

  function shotE(t) {
    if (!shot($('E'), t, T.E, T.F)) return;
    slam($('e-title'), t, T.eTitle - 0.18, { from: 2.4, dur: 0.18 });
    ['e-s1', 'e-s2', 'e-s3'].forEach((id, i) => {
      const t0 = T.bars + i * 0.22, k = eOut5(seg(t, t0, t0 + 0.35));
      css($(id), { transform: `scaleX(${k.toFixed(4)})`, opacity: t < t0 ? 0 : 1 });
      if (i === 2) $(id).style.opacity = t < t0 ? 0 : lerp(1, 0.45, seg(t, T.brk, T.brk + 0.3));
    });
    const kb = eBack(seg(t, T.brk, T.brk + 0.3));
    css($('e-bracket'), { opacity: t < T.brk ? 0 : 1, transform: `scaleY(${kb.toFixed(3)})` });
    // percentage counts 0 → 80 (= 30 + 50) and lands
    const kc = eOut(seg(t, T.brk, T.pct));
    $('e-n').textContent = String(Math.round((30 + 50) * kc));
    rise($('e-pct'), t, T.brk, { dy: 0, dur: 0.2 });
    const d = t - T.pct;
    $('e-pct').style.transform = d > 0 ? `scale(${(1 + 0.18 * Math.exp(-d * 8) * Math.cos(d * 30)).toFixed(4)})` : 'scale(0.92)';
    rise($('e-note'), t, T.pct + 0.25, { dy: 20 });
  }

  function shotF(t) {
    if (!shot($('F'), t, T.F, T.G)) return;
    const kp = eOut5(seg(t, T.paper, T.paper + 0.45));
    const kback = eIO(seg(t, T.fPre - 0.05, T.fPre + 0.3));
    css($('f-paper'), {
      opacity: t < T.paper ? 0 : lerp(1, 0.18, kback),
      transform: `translateY(${((1 - kp) * 900).toFixed(1)}px) rotate(${lerp(-12, -3, kp).toFixed(2)}deg) scale(${lerp(1, 0.86, kback).toFixed(3)})`,
    });
    slam($('f-stamp'), t, T.fStamp - 0.16, { from: 2.4, dur: 0.16, blur: 8, rot: -20, base: 'rotate(12deg)' });
    fadeOut($('f-stamp'), t, T.fPre - 0.05, 0.3);
    ['f-r1', 'f-r2', 'f-r3', 'f-r4'].forEach((id, i) => {
      const el = $(id), t0 = T.rows[i];
      rise(el, t, t0, { dx: -60, dy: 0, dur: 0.25 });
      const b = el.querySelector('b'), d = t - t0 - 0.12;
      b.style.display = 'inline-block';
      b.style.transform = d > 0 ? `scale(${(1 + 0.6 * Math.exp(-d * 9)).toFixed(3)})` : 'scale(0)';
    });
    rise($('f-pre'), t, T.fPre, { dy: 30, dur: 0.3 });
    slam($('f-big'), t, T.fBig - 0.2, { from: 3.2, dur: 0.2, blur: 18 });
    sweep($('f-big'), t, T.fBig + 0.25, 0.9);
  }

  function shotG(t) {
    if (!shot($('G'), t, T.G, T.H)) return;
    gsc.bricks.forEach((b, i) => {
      const t0 = T.bricks + i * 0.016, k = eOut(seg(t, t0, t0 + 0.2));
      b.setAttribute('opacity', t < t0 ? 0 : 1);
      b.setAttribute('transform', `translate(0,${((1 - k) * -500).toFixed(1)})`);
    });
    gsc.bLabel.setAttribute('opacity', seg(t, T.bricks + 0.35, T.bricks + 0.6).toFixed(3));
    const kb = eOut5(seg(t, T.bldg, T.bldg + 0.4));
    // building shakes once the crack climbs into it
    const shake = t > T.crack2 + 0.2 ? 6 * Math.exp(-(t - T.crack2 - 0.2) * 1.5) * Math.sin(t * 40) : 0;
    gsc.bldg.setAttribute('opacity', t < T.bldg ? 0 : 1);
    gsc.bldg.setAttribute('transform', `translate(540,840) rotate(${(shake * 0.35).toFixed(3)}) scale(1,${kb.toFixed(4)}) translate(-540,-840)`);
    // windows flicker red as the flaw is amplified
    const alarm = seg(t, T.crack2 + 0.2, T.crack2 + 0.5) * (1 - seg(t, T.scan + 0.9, T.scan + 1.2));
    gsc.win.forEach((w, i) => {
      const on = alarm > 0 && Math.sin(t * 22 + i * 1.3) > 0;
      w.setAttribute('fill', on ? '#FF4A3A' : '#FFE6A8');
    });
    // crack: foundation first, then up through the building
    const L = gsc.crackLen, k1 = seg(t, T.crack1, T.crack1 + 0.18) * 0.13, k2 = eOut(seg(t, T.crack2, T.crack2 + 0.55)) * 0.87;
    gsc.crack.setAttribute('opacity', t < T.crack1 ? 0 : 1);
    gsc.crack.setAttribute('stroke-dashoffset', (L * (1 - k1 - k2)).toFixed(1));
    // scanner of 一模/联考
    const ks = eIO(seg(t, T.scan, T.scan + 1.1));
    gsc.scan.setAttribute('opacity', (seg(t, T.scan, T.scan + 0.1) * (1 - seg(t, T.scan + 1.1, T.scan + 1.35))).toFixed(3));
    gsc.scan.setAttribute('transform', `translate(0,${lerp(230, 975, ks).toFixed(1)})`);
    // titles
    const g1 = $('g-title');
    rise($('g-t1'), t, T.gT1, { dy: 0, dur: 0.2 });
    slam($('g-arrow'), t, T.gT2 - 0.14, { from: 1.8, dur: 0.14 });
    slam($('g-t2'), t, T.gT2 - 0.16, { from: 2.6, dur: 0.16 });
    g1.style.opacity = (1 - seg(t, T.scan, T.scan + 0.25)).toFixed(3);
    slam($('g-title2'), t, T.gT3 - 0.18, { from: 2.4, dur: 0.18 });
    sweep($('g-title2').querySelector('span'), t, T.gT3 + 0.3, 0.9);
  }

  function shotH(t) {
    if (!shot($('H'), t, T.H, T.I)) return;
    const km = eOut(seg(t, T.H, T.H + 0.35));
    $('h-mid').style.transform = `scaleX(${km.toFixed(3)})`;
    $('h-bot').style.opacity = seg(t, T.slab, T.slab + 0.3).toFixed(3);
    $('h-top').style.opacity = seg(t, T.up, T.up + 0.3).toFixed(3);
    const ks = seg(t, T.slab, T.slab + 0.16);
    const settle = t > T.slab + 0.16 ? 10 * Math.exp(-(t - T.slab - 0.16) * 9) * Math.cos((t - T.slab) * 30) : 0;
    css($('h-slab'), { opacity: t < T.slab ? 0 : 1, transform: `translateY(${((1 - eIn(ks)) * -1300 + settle).toFixed(1)}px)` });
    slam($('h-down'), t, T.down - 0.16, { from: 2, dur: 0.16 });
    const ka = eOut5(seg(t, T.up - 0.05, T.up + 0.3));
    css($('h-arrow'), { opacity: t < T.up - 0.05 ? 0 : 1, transform: `translateY(${((1 - ka) * 900).toFixed(1)}px)` });
    slam($('h-up'), t, T.up + 0.02, { from: 0.3, dur: 0.18, blur: 10 });
  }

  function shotI(t) {
    if (!shot($('I'), t, T.I, T.J)) return;
    slam($('i-title'), t, T.iTitle - 0.18, { from: 2.4, dur: 0.18 });
    let active = -1;
    T.rowIn.forEach((tt, i) => { if (t >= tt) active = i; });
    ['i-r1', 'i-r2', 'i-r3', 'i-r4'].forEach((id, i) => {
      const row = $(id), t0 = T.rowIn[i];
      const k = eOut5(seg(t, t0, t0 + 0.32));
      const dim = i < active ? 0.42 : 1;
      css(row, { opacity: t < t0 ? 0 : (k * dim).toFixed(3), transform: `translateX(${((1 - k) * 700).toFixed(1)}px)` });
      const mon = row.querySelector('.mon');
      const d = t - t0 - 0.14;
      mon.style.transform = d > 0 ? `scale(${(1 + 0.35 * Math.exp(-d * 9) * Math.cos(d * 26)).toFixed(3)})` : 'scale(1.6)';
      row.querySelector('.dot').style.background = i <= active ? (i === active ? '#FF4A3A' : '#8FD3FF') : '#0B1426';
      const a = $(`${id}a`), b = $(`${id}b`);
      rise(a, t, T.rowA[i], { dx: 40, dy: 0, dur: 0.25 });
      if (i === 3) slam(b, t, T.rowB[i] - 0.14, { from: 1.8, dur: 0.14 });
      else rise(b, t, T.rowB[i], { dx: 40, dy: 0, dur: 0.25 });
      if (t < T.rowA[i]) a.style.opacity = 0;
    });
    const fillTo = active < 0 ? 0 : 115 + active * 250;
    const prev = active <= 0 ? 0 : 115 + (active - 1) * 250;
    const kf = active < 0 ? 0 : eOut(seg(t, T.rowIn[active], T.rowIn[active] + 0.4));
    $('i-fill').style.height = `${lerp(prev, fillTo, kf).toFixed(1)}px`;
  }

  function shotJ(t) {
    if (!shot($('J'), t, T.J, T.K)) return;
    $('j-board').style.opacity = (0.9 * seg(t, T.J, T.J + 0.8)).toFixed(3);
    // the dark horse rises out of the fog
    const kk = eOut(seg(t, T.J, T.crack));
    css($('j-knight'), { opacity: (0.25 + 0.75 * kk).toFixed(3), transform: `translateY(${((1 - kk) * 260).toFixed(1)}px) scale(${lerp(0.9, 1, kk).toFixed(3)})` });
    const rim = seg(t, T.crack, T.crack + 0.4) * (0.75 + 0.25 * Math.sin(t * 6));
    knight.rim.setAttribute('opacity', (rim + 0.1 * seg(t, T.J, T.crack)).toFixed(3));
    // ranking … only explains the past
    rise($('j-s1'), t, T.js1, { dy: 20, dur: 0.3 });
    rise($('j-s2'), t, T.js2, { dy: 20, dur: 0.35 });
    const kdis = seg(t, T.js3 - 0.3, T.js3 + 0.15);   // the past dissolves
    if (kdis > 0) css($('j-s2'), { opacity: (1 - kdis).toFixed(3), filter: `blur(${(kdis * 14).toFixed(1)}px)`, transform: `translateY(${(-kdis * 120).toFixed(1)}px) scale(${(1 + kdis * 0.3).toFixed(3)})` });
    else $('j-s2').style.filter = '';
    slam($('j-s3'), t, T.js3 - 0.18, { from: 2.6, dur: 0.18 });
    fadeOut($('j-s1'), t, T.crack - 0.25, 0.2);
    fadeOut($('j-s3'), t, T.crack - 0.2, 0.2);
    // the ice breaks
    crack.forEach((c, i) => {
      const t0 = T.crack - 0.04 + (i % 4) * 0.02, k = eOut(seg(t, t0, t0 + 0.22));
      c.p.setAttribute('stroke-dashoffset', (c.len * (1 - k)).toFixed(1));
    });
    $('j-crack').style.opacity = (1 - seg(t, T.crack + 0.35, T.crack + 0.8)).toFixed(3);
    slam($('j-b1'), t, T.crack - 0.02, { from: 3.2, dur: 0.2, blur: 20, rot: -6 });
    slam($('j-b2'), t, T.jb2 - 0.18, { from: 2.8, dur: 0.18, blur: 16 });
  }

  function shotK(t) {
    if (!shot($('K'), t, T.K, DUR + 1)) return;
    // brush-written, character by character
    kL1.forEach((s, i) => {
      const t0 = T.kChars[i], k = seg(t, t0, t0 + 0.32);
      const p = lerp(-40, 140, eOut(k));
      s.style.webkitMaskImage = `linear-gradient(120deg,#000 ${p - 30}%,rgba(0,0,0,0) ${p}%)`;
      s.style.maskImage = s.style.webkitMaskImage;
      s.style.opacity = t < t0 ? 0 : 1;
      s.style.transform = `scale(${lerp(1.25, 1, eOut(k)).toFixed(3)})`;
    });
    kL2.forEach((s, i) => slam(s, t, T.kL2 - 0.18 + i * 0.025, { from: 2.8, dur: 0.18, blur: 14 }));
    const up = eIO(seg(t, T.end - 0.1, T.end + 0.4));
    $('k-l1').style.marginTop = `${(-up * 60).toFixed(1)}px`;
    $('k-l2').style.marginTop = `${(-up * 60).toFixed(1)}px`;
    rise($('k-end'), t, T.end + 0.05, { dy: 40, dur: 0.45 });
    slam($('k-cd'), t, T.end - 0.12, { from: 2.4, dur: 0.16 });
  }

  function topbar(t) {
    const k = seg(t, T.B, T.B + 0.3) * (1 - seg(t, T.K - 0.3, T.K));
    css($('topbar'), { opacity: k.toFixed(3), transform: `translateX(-50%) translateY(${((1 - seg(t, T.B, T.B + 0.3)) * -30).toFixed(1)}px)` });
    const pulse = 1 + 0.08 * Math.exp(-((t % 1) * 6));
    $('tb-days').style.display = 'inline-block';
    $('tb-days').style.transform = `scale(${pulse.toFixed(3)})`;
  }

  function subs(t) {
    let txt = '', op = 0;
    const cs = TL.cues;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i], n = cs[i + 1];
      const until = n ? Math.min(n.start - 0.02, c.end + 0.5) : c.end + 0.8;
      if (t >= c.start - 0.05 && t < until) {
        txt = c.text;
        const contIn = i > 0 && c.start - cs[i - 1].end < 0.45;
        const contOut = n && n.start - c.end < 0.45;
        op = Math.min(contIn ? 1 : seg(t, c.start - 0.05, c.start + 0.08), contOut ? 1 : 1 - seg(t, until - 0.1, until));
        break;
      }
    }
    $('sub').textContent = txt;
    $('subs').style.opacity = op.toFixed(3);
  }

  function renderFrame(t) {
    drawBG(t);
    shotA(t); shotB(t); shotC(t); shotD(t); shotE(t); shotF(t); shotG(t); shotH(t); shotI(t); shotJ(t); shotK(t);
    drawFX(t);
    topbar(t);
    subs(t);
    $('vignette').style.opacity = (1 - 0.5 * warmth(t)).toFixed(3);
  }

  window.renderFrame = renderFrame;
  window.ready = init().then(() => { renderFrame(0); return true; });
})();
