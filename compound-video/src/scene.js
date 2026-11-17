/* Compound growth – 30 s knowledge animation.
 * Every frame is a pure function of time t (seconds): window.renderFrame(t).
 * All numbers shown on screen are computed (Math.pow), never hard-coded.
 * Voice / subtitle timing comes from ../assets/timeline.json (written by scripts/tts.py).
 */
(() => {
  // ------------------------------------------------------------------ helpers
  const $ = (id) => document.getElementById(id);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => (!isFinite(a) ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const easeInOutSine = (k) => -(Math.cos(Math.PI * k) - 1) / 2;
  const easeOutBack = (k) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /** fade/rise envelope for a scene or element */
  function show(el, t, inStart, inDur = 0.45, outStart = Infinity, outDur = 0.35, rise = 28) {
    const kin = easeOut(seg(t, inStart, inStart + inDur));
    const kout = easeInOut(seg(t, outStart, outStart + outDur));
    const op = kin * (1 - kout);
    el.style.opacity = op.toFixed(4);
    const y = (1 - kin) * rise - kout * rise;
    el.style.transform = `translateY(${y.toFixed(2)}px)`;
    return op;
  }
  const drawX = (el, k) => { el.style.transform = `scaleX(${clamp(k).toFixed(4)})`; };

  // ------------------------------------------------------------------ the maths
  const DAYS = 365;
  const ONE = (n) => Math.pow(1, n);
  const UP = (d) => Math.pow(1.01, d);
  const DOWN = (d) => Math.pow(0.99, d);
  // display rules (rounding only – the value itself is always computed)
  const fmtOne = (v) => String(Math.round(v));
  const fmtUp = (v, d) => (d === 0 ? '1' : v < 10 ? v.toFixed(2) : v.toFixed(1));
  const fmtDown = (v, d) => (d === 0 ? '1' : v.toFixed(2));
  // "=" only when the shown number is exact, otherwise "≈"
  const opFor = (v, s) => (Math.abs(parseFloat(s) - v) < 1e-12 ? '=' : '≈');

  // ------------------------------------------------------------------ timeline
  let TL = null;
  const cue = (scene, i) => TL.cues.filter((c) => c.scene === scene)[i];

  // ------------------------------------------------------------------ title split into chars
  function splitChars(el, text) {
    el.innerHTML = '';
    return [...text].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      el.appendChild(s);
      return s;
    });
  }

  // ------------------------------------------------------------------ chart builder
  function makeChart(host, o) {
    const W = host.clientWidth, H = host.clientHeight;
    const L = 86, R = W - 30, T = 70, B = H - 70;
    const X = (d) => L + (d / DAYS) * (R - L);
    const Y = (v) => B - (v / o.ymax) * (B - T);
    const root = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);

    // "理论示意" tag
    const tg = svg('g', { transform: `translate(${R - 168},0)` }, root);
    svg('rect', { x: 0, y: 0, width: 168, height: 48, rx: 6, fill: 'none', stroke: o.color, 'stroke-width': 2 }, tg);
    const tt = svg('text', { x: 84, y: 34, 'text-anchor': 'middle', class: 'tag', fill: o.color }, tg);
    tt.textContent = '理论示意';

    // axis titles
    const yt = svg('text', { x: L - 14, y: T - 30, 'text-anchor': 'start', class: 'axis-label' }, root);
    yt.textContent = o.yTitle;

    // grid + y labels
    for (const v of o.yticks) {
      svg('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: '#D8D0C2', 'stroke-width': 1.5, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }, root);
      const lb = svg('text', { x: L - 18, y: Y(v) + 10, 'text-anchor': 'end', class: 'axis-num' }, root);
      lb.textContent = String(v);
    }
    // reference line at the starting value 1
    if (o.ref) {
      svg('line', { x1: L, x2: R, y1: Y(1), y2: Y(1), stroke: '#8E8579', 'stroke-width': 2, 'stroke-dasharray': '10 10' }, root);
      const rl = svg('text', { x: R, y: Y(1) + (o.refBelow ? 38 : -14), 'text-anchor': 'end', class: 'axis-label' }, root);
      rl.textContent = '起点 1';
    }
    // x axis (value 0)
    svg('line', { x1: L, x2: R, y1: B, y2: B, stroke: '#6F6558', 'stroke-width': 2.5 }, root);
    for (const d of [0, 100, 200, 300, 365]) {
      svg('line', { x1: X(d), x2: X(d), y1: B, y2: B + 10, stroke: '#6F6558', 'stroke-width': 2 }, root);
      if (d === 0 || d === 365) {
        const lb = svg('text', { x: X(d), y: B + 44, 'text-anchor': d === 0 ? 'start' : 'end', class: 'axis-num' }, root);
        lb.textContent = d === 0 ? '第 0 天' : '第 365 天';
      }
    }
    const xt = svg('text', { x: (L + R) / 2, y: B + 44, 'text-anchor': 'middle', class: 'axis-label' }, root);
    xt.textContent = '天数 d →';

    const area = svg('path', { fill: o.color, 'fill-opacity': 0.1, stroke: 'none' }, root);
    const path = svg('path', { fill: 'none', stroke: o.color, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, root);
    const halo = svg('circle', { r: 22, fill: o.color, 'fill-opacity': 0.18 }, root);
    const dot = svg('circle', { r: 11, fill: o.color, stroke: '#FBF8F1', 'stroke-width': 4 }, root);
    const label = svg('text', { class: 'head-label', fill: o.color }, root);

    let extra = null;
    if (o.note) {
      extra = svg('text', { x: R, y: Y(0.3), 'text-anchor': 'end', class: 'axis-label', fill: o.color, style: 'font-size:30px;font-weight:700' }, root);
      extra.textContent = o.note;
    }

    return {
      root, extra,
      /** draw curve for days 0..dEnd (dEnd may be fractional for the head) */
      update(dEnd, labelText, labelOpacity = 1) {
        const pts = [];
        const n = Math.floor(dEnd);
        for (let d = 0; d <= n; d++) pts.push([X(d), Y(o.f(d))]);
        if (dEnd > n) pts.push([X(dEnd), Y(o.f(dEnd))]);
        if (pts.length === 1) pts.push(pts[0]);
        const dstr = 'M' + pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L');
        path.setAttribute('d', dstr);
        const last = pts[pts.length - 1];
        area.setAttribute('d', dstr + `L${last[0].toFixed(2)},${B}L${X(0)},${B}Z`);
        dot.setAttribute('cx', last[0]); dot.setAttribute('cy', last[1]);
        halo.setAttribute('cx', last[0]); halo.setAttribute('cy', last[1]);
        // label placement: keep inside the plot
        const lx = Math.min(last[0] - 22, R - 10), ly = clamp(last[1] - 30, T + 40, B - 20);
        label.setAttribute('x', lx); label.setAttribute('y', ly);
        label.setAttribute('text-anchor', last[0] > (L + R) / 2 ? 'end' : 'start');
        if (last[0] <= (L + R) / 2) label.setAttribute('x', last[0] + 24);
        label.textContent = labelText;
        label.setAttribute('opacity', labelOpacity);
      },
    };
  }

  // ------------------------------------------------------------------ formula slot sizing (no jitter)
  function measure(el, strings) {
    const old = el.textContent;
    let w = 0;
    for (const s of strings) { el.textContent = s; w = Math.max(w, el.getBoundingClientRect().width); }
    el.textContent = old;
    return Math.ceil(w) + 2;
  }
  function fitFormula(id, expStrings, resStrings) {
    // Width of the widest state (all parts measured at natural size).
    const f = $(id), exp = f.querySelector('.sup'), res = f.querySelector('.res');
    const parts = [...f.children];
    const wExp = measure(exp, expStrings), wRes = measure(res, resStrings);
    let w = 0;
    for (const el of parts) {
      const cs = getComputedStyle(el);
      const m = parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
      w += m + (el === exp ? wExp : el === res ? wRes : el.getBoundingClientRect().width);
    }
    const scale = Math.min(1, 940 / w);
    f.dataset.scale = scale;
    f.style.paddingLeft = ((1080 - w * scale) / 2 / scale).toFixed(1) + 'px';
  }

  // ------------------------------------------------------------------ init
  let charts = {}, t1Chars, t2Chars;
  async function init() {
    TL = await (await fetch('../assets/timeline.json')).json();

    t1Chars = splitChars($('t1'), '每天一点点，');
    t2Chars = splitChars($('t2'), '差距被放大');

    // final values in the summary columns (computed)
    $('c1v').textContent = fmtOne(ONE(DAYS));
    $('c2v').textContent = fmtUp(UP(DAYS), DAYS);
    $('c3v').textContent = fmtDown(DOWN(DAYS), DAYS);

    // make sure every glyph that will ever appear is loaded before rendering
    const allText = document.body.innerText + TL.cues.map((c) => c.text).join('') +
      '0123456789.=≈天数起点理论示意倍→ dn—趋近于但不会等于约';
    const faces = ['500 40px "Noto Serif SC"', '700 40px "Noto Serif SC"', '900 40px "Noto Serif SC"',
      'italic 400 40px "Playfair Display"', 'italic 600 40px "Playfair Display"', 'italic 900 40px "Playfair Display"'];
    await Promise.all(faces.map((f) => document.fonts.load(f, allText)));
    await document.fonts.ready;

    // fixed-width slots for changing numbers
    const range = [...Array(DAYS + 1).keys()];
    fitFormula('f-one', ['n', '1', '2', '3', '10', '100', '365'], ['1']);
    fitFormula('f-up', ['d', ...range.map(String)], range.map((d) => fmtUp(UP(d), d)));
    fitFormula('f-down', ['d', ...range.map(String)], range.map((d) => fmtDown(DOWN(d), d)));

    // the scenes must be visible for layout measurement of the charts
    charts.one = makeChart($('one-chart'), { ymax: 2, yticks: [0, 1, 2], color: '#0E474C', f: ONE, ref: false, yTitle: '相对起点的倍数' });
    charts.up = makeChart($('up-chart'), { ymax: 40, yticks: [0, 10, 20, 30, 40], color: '#E07F1A', f: UP, ref: true, refBelow: false, yTitle: '相对起点的倍数' });
    charts.down = makeChart($('down-chart'), { ymax: 1, yticks: [0, 0.25, 0.5, 0.75, 1], color: '#BF1A20', f: DOWN, ref: true, refBelow: true, yTitle: '相对起点的倍数', note: '趋近于 0，但不会等于 0' });
    return true;
  }

  // ------------------------------------------------------------------ per-scene renderers
  function renderMast(t) {
    const k = easeOut(seg(t, 0.0, 0.6));
    $('mast').style.opacity = k;
    drawX(document.querySelector('.mast-rule'), easeInOut(seg(t, 0.05, 0.9)));
  }

  function renderIntro(t) {
    const sc = $('s-intro');
    const op = show(sc, t, -1, 0.01, 3.62, 0.38, 40);
    if (op <= 0) return;
    t1Chars.forEach((s, i) => {
      const k = easeOut(seg(t, 0.12 + i * 0.075, 0.12 + i * 0.075 + 0.5));
      s.style.opacity = k;
      s.style.transform = `translateY(${((1 - k) * 36).toFixed(2)}px)`;
    });
    // "差距被放大": arrives with the voice (≈1.65 s), then is literally amplified
    const t2s = cue('intro', 1).start - 0.15;
    t2Chars.forEach((s, i) => {
      const a = t2s + i * 0.07;
      const k = seg(t, a, a + 0.55);
      s.style.opacity = easeOut(seg(t, a, a + 0.25));
      s.style.transform = `scale(${lerp(0.55, 1, easeOutBack(k)).toFixed(4)})`;
    });
    const amp = easeInOut(seg(t, t2s + 0.75, t2s + 1.35));
    $('t2').style.transform = `scale(${lerp(1, 1.05, amp).toFixed(4)})`;
    $('t2').style.transformOrigin = 'left 60%';
    drawX($('t2u'), easeInOut(seg(t, t2s + 0.7, t2s + 1.3)) * 1.05);
    show($('t3'), t, t2s + 1.0, 0.5);
    show(document.querySelector('#s-intro .kicker'), t, t2s + 1.25, 0.5, Infinity, 0.3, 16);
    drawX(document.querySelector('#s-intro .kicker-line'), easeInOut(seg(t, t2s + 1.25, t2s + 1.75)));
  }

  function renderSectionHead(scene, t, t0) {
    show(document.querySelector(`#${scene} .sec`), t, t0, 0.45, Infinity, 0.3, 20);
    drawX(document.querySelector(`#${scene} .sec-rule`), easeInOut(seg(t, t0 + 0.05, t0 + 0.65)));
  }

  function formulaIn(id, t, t0) {
    const f = $(id), k = easeOut(seg(t, t0, t0 + 0.55));
    f.style.opacity = k;
    const s = parseFloat(f.dataset.scale || 1) * lerp(0.94, 1, k);
    f.style.transform = `scale(${s.toFixed(4)})`;
    f.style.transformOrigin = '0 50%';
    f.style.left = '0px';
  }
  function pop(el, t, tChange, amount = 0.22, dur = 0.3) {
    const k = seg(t, tChange, tChange + dur);
    const s = 1 + amount * (1 - easeOut(k)) * (k > 0 ? 1 : 0);
    el.style.transform = `scale(${s.toFixed(4)})`;
  }

  function renderOne(t) {
    const sc = $('s-one');
    const op = show(sc, t, 4.0, 0.35, 8.7, 0.35);
    if (op <= 0) return;
    renderSectionHead('s-one', t, 4.05);
    formulaIn('f-one', t, 4.3);
    // n steps through several values; the result is computed each time
    const steps = [[5.0, 1], [5.5, 2], [6.0, 3], [6.6, 10], [7.2, 100], [7.8, 365]];
    let cur = null, tc = 0, prevN = 0, prevT = 5.0;
    for (const [ts, n] of steps) if (t >= ts) { prevN = cur ?? 0; prevT = tc || ts; cur = n; tc = ts; }
    const exp = $('one-exp'), res = $('one-res');
    exp.textContent = cur === null ? 'n' : String(cur);
    res.textContent = fmtOne(ONE(cur === null ? 1 : cur));
    if (cur !== null) { pop(exp, t, tc, 0.25); pop(res, t, tc, 0.05, 0.35); }
    $('one-n').textContent = cur === null ? 'n 为任意天数' : `n = ${cur} 天`;
    show($('one-n'), t, 4.7, 0.4, Infinity, 0.3, 10);
    show($('one-cap'), t, cue('one', 1).start - 0.1, 0.5, Infinity, 0.3, 18);
    // flat chart, head glides to the current n
    show($('one-chart'), t, 4.85, 0.5, Infinity, 0.3, 20);
    const headN = cur === null ? 0 : lerp(prevN, cur, easeInOut(seg(t, tc, tc + 0.45)));
    charts.one.update(Math.max(0.0001, headN), cur === null ? '' : fmtOne(ONE(headN)), 1);
  }

  function counterScene(key, t, a) {
    // a: {scene, t0, countStart, countEnd, f, fmt, finalAt}
    const sc = $(a.scene);
    const op = show(sc, t, a.t0, 0.35, a.out, 0.35);
    if (op <= 0) return;
    renderSectionHead(a.scene, t, a.t0 + 0.05);
    formulaIn(a.formula, t, a.t0 + 0.3);
    const p = easeInOutSine(seg(t, a.countStart, a.countEnd));
    const counting = t >= a.countStart;
    const d = Math.round(p * DAYS);            // integer day shown in the exponent
    const dHead = p * DAYS;                    // smooth head for the curve
    const v = a.f(d);
    const s = a.fmt(v, d);
    $(`${key}-exp`).textContent = counting ? String(d) : 'd';
    $(`${key}-res`).textContent = s;
    $(`${key}-op`).textContent = opFor(v, s);
    $(`${key}-n`).textContent = counting ? `d = ${d} 天` : 'd 表示天数';
    show($(`${key}-n`), t, a.t0 + 0.6, 0.4, Infinity, 0.3, 10);
    // final emphasis
    pop($(`${key}-res`), t, a.countEnd, 0.08, 0.5);
    // chart
    show($(`${key}-chart`), t, a.t0 + 0.55, 0.5, Infinity, 0.3, 24);
    charts[key].update(Math.max(0.0001, dHead), counting ? s : '');
    if (charts[key].extra) charts[key].extra.setAttribute('opacity', easeOut(seg(t, a.countEnd + 0.1, a.countEnd + 0.6)));
  }

  function renderOutro(t) {
    const sc = $('s-outro');
    const op = show(sc, t, 23.0, 0.3);
    if (op <= 0) return;
    const c3 = cue('outro', 2), c4 = cue('outro', 3);
    const colsOut = c3.start - 0.55;
    ['c1', 'c2', 'c3'].forEach((id, i) => show($(id), t, 23.1 + i * 0.3, 0.5, Infinity, 0.3, 30));
    // gentle emphasis on the growth column while "来自每天做对一点" is spoken
    const hl = easeInOut(seg(t, cue('outro', 1).start - 0.1, cue('outro', 1).start + 0.4));
    $('c2v').style.transform = `scale(${lerp(1, 1.08, hl).toFixed(4)})`;
    const cols = $('cols');
    const kout = easeInOut(seg(t, colsOut, colsOut + 0.45));
    cols.style.opacity = 1 - kout;
    cols.style.transform = `translateY(${(-30 * kout).toFixed(2)}px)`;
    // ending lines, synced with the voice
    const end = $('end');
    end.style.opacity = t >= colsOut + 0.3 ? 1 : 0;
    drawX($('end-rule'), easeInOut(seg(t, c3.start - 0.2, c3.start + 0.35)));
    const e1 = easeOut(seg(t, c3.start - 0.08, c3.start + 0.55));
    $('end1').style.opacity = e1;
    $('end1').style.transform = `translateY(${((1 - e1) * 30).toFixed(2)}px) skewX(-7deg)`;
    const e2 = easeOut(seg(t, c4.start - 0.08, c4.start + 0.55));
    $('end2').style.opacity = e2;
    $('end2').style.transform = `translateY(${((1 - e2) * 30).toFixed(2)}px) skewX(-7deg)`;
    show($('disc'), t, c3.start + 0.5, 0.6, Infinity, 0.3, 12);
  }

  function renderSubs(t) {
    const cues = TL.cues;
    let txt = '', op = 0;
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i], next = cues[i + 1];
      const until = next ? Math.min(next.start - 0.02, c.end + 0.6) : c.end + 1.2;
      if (t >= c.start - 0.06 && t < until) {
        txt = c.text;
        op = Math.min(seg(t, c.start - 0.06, c.start + 0.1), 1 - seg(t, until - 0.12, until));
        // no fade between back-to-back phrases
        if (next && next.start - c.end < 0.4 && t > until - 0.12) op = 1;
        const prev = cues[i - 1];
        if (prev && c.start - prev.end < 0.4 && t < c.start + 0.1) op = 1;
        break;
      }
    }
    $('sub-text').textContent = txt;
    $('subs').style.opacity = op.toFixed(3);
  }

  // ------------------------------------------------------------------ main
  function renderFrame(t) {
    renderMast(t);
    renderIntro(t);
    renderOne(t);
    counterScene('up', t, {
      scene: 's-up', formula: 'f-up', t0: 9.0, out: 16.62,
      countStart: 10.0, countEnd: cue('up', 2).start + 1.6, f: UP, fmt: fmtUp,
    });
    counterScene('down', t, {
      scene: 's-down', formula: 'f-down', t0: 17.0, out: 22.65,
      countStart: 17.9, countEnd: cue('down', 1).start + 2.3, f: DOWN, fmt: fmtDown,
    });
    renderOutro(t);
    renderSubs(t);
  }

  window.renderFrame = renderFrame;
  window.ready = init().then(() => { renderFrame(0); return true; });
  window.__debug = { UP, DOWN, ONE, fmtUp, fmtDown, fmtOne };
})();
