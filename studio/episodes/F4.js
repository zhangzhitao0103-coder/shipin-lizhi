// F4《站在巨人的肩膀上》方法与借力类 · 羊皮纸手稿风
// 史实：1638 伽利略《两门新科学》（自由落体）；1687 牛顿《自然哲学的数学原理》（运动定律、万有引力）；1785 库仑定律；
// 1827 欧姆定律；1831 法拉第发现电磁感应；1865 麦克斯韦电磁场理论；1905 爱因斯坦解释光电效应。1638→1905 共 267 年
// 牛顿在 1676 年 2 月致胡克的信中写道："如果说我看得更远，那是因为我站在巨人的肩膀上。"
(function (root) {
  const EVENTS = [
    [1638, '伽利略', '自由落体'], [1687, '牛顿', '运动定律 · 万有引力'], [1785, '库仑', '库仑定律'],
    [1827, '欧姆', '欧姆定律'], [1831, '法拉第', '电磁感应'], [1865, '麦克斯韦', '电磁场理论'], [1905, '爱因斯坦', '光电效应'],
  ];

  const EP = {
    id: 'F4',
    title: '站在巨人的肩膀上',
    theme: 'parchment',
    voice: { sid: 58 },
    capY: 370, capSize: 62,
    music: { style: 'cinema', chords: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em', 'A', 'D', 'G', 'A', 'D'] },
    cover: 'line',
    beats: [
      { id: 'hook', min: 3.4, cap: ['高中物理三年学的公式，', '人类花了{多少年}才找到？'], voice: '高中物理三年学的公式，人类花了多少年才找到？', mood: 0.3 },
      { id: 'line', min: 6.4, cap: ['从伽利略到爱因斯坦：', '{将近 300 年}。'], voice: '从伽利略到爱因斯坦，将近三百年。一代又一代科学家，一点一点攒下来。', mood: 0.6, sfx: [{ at: 0.6, type: 'ticks', n: 7, gap: 0.7 }] },
      { id: 'quote', min: 4.8, cap: ['牛顿在信里写：“如果说我看得更远，', '是因为我站在{巨人的肩膀上}。”'], voice: '牛顿在信里写，如果说我看得更远，是因为我站在巨人的肩膀上。', mood: 0.75 },
      { id: 'flip', min: 3.8, cap: ['你不用从零摸索，', '前人已经把{路铺好了}。'], voice: '你不用从零摸索，前人已经把路铺好了。', mood: 0.6 },
      { id: 'flip2', min: 3.8, cap: ['好的老师，', '就是带你{爬上肩膀}的人。'], voice: '好的老师，就是带你爬上肩膀的人。', mood: 0.85 },
      { id: 'action', min: 3.0, cap: null, voice: '站上巨人的肩膀，看得更远。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '伽利略牛顿库仑欧姆法拉第麦克斯韦爱因斯坦自由落体运动定律万有引力电磁感应场理论光电效应年你站上巨人的肩膀看得更远致胡克信1676—0123456789',
  };

  const LX = 300, Y0 = 640, Y1 = 1480;
  const yOf = i => Y0 + (i / (EVENTS.length - 1)) * (Y1 - Y0);  // 等距排列（1827 与 1831 太近）

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const ln = b('line'), qt = b('quote'), fl = b('flip'), f2 = b('flip2');
    const sceneA = E.seg(t, 0.2, 0.6) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA <= 0) return end();
    ctx.save();
    // 时间轴
    const tlA = sceneA * (1 - E.seg(t, qt.s, qt.s + 0.4));
    const grow = E.ease.inOut(E.seg(t, ln.s + 0.3, ln.s + 5.2));
    if (tlA > 0) {
      ctx.globalAlpha = tlA; ctx.strokeStyle = th.fg; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(LX, Y0); ctx.lineTo(LX, E.lerp(Y0, Y1, grow)); ctx.stroke();
      EVENTS.forEach(([yr, who, what], i) => {
        const y = yOf(i), a = E.seg(t, ln.s + 0.6 + i * 0.7, ln.s + 1.0 + i * 0.7);
        if (a <= 0) return;
        ctx.globalAlpha = tlA * a;
        ctx.fillStyle = th.gold; ctx.beginPath(); ctx.arc(LX, y, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = th.fg; ctx.font = `700 40px ${th.num}`; ctx.textAlign = 'right'; ctx.fillText(String(yr), LX - 30, y + 14);
        ctx.font = `700 40px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(who, LX + 34, y + 2);
        ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.fillText(what, LX + 34, y + 40);
      });
      const sA = E.seg(t, ln.s + 5.4, ln.s + 5.9);
      if (sA > 0) {
        ctx.globalAlpha = tlA * sA; ctx.strokeStyle = th.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(900, Y0); ctx.lineTo(930, Y0); ctx.lineTo(930, Y1); ctx.lineTo(900, Y1); ctx.stroke();
        ctx.save(); ctx.translate(980, (Y0 + Y1) / 2); ctx.rotate(Math.PI / 2); ctx.fillStyle = th.gold; ctx.font = `700 44px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('267 年', 0, 0); ctx.restore();
      }
    }
    // 书信与"巨人的肩膀"：七级台阶，每一级是一位科学家
    const qA = sceneA * E.seg(t, qt.s + 0.3, qt.s + 0.8);
    if (qA > 0) {
      ctx.globalAlpha = qA;
      const sx = 160, sw = 110, base = 1460, sh = 90;
      EVENTS.forEach(([yr, who], i) => {
        const a = E.ease.out(E.seg(t, qt.s + 0.4 + i * 0.12, qt.s + 0.8 + i * 0.12));
        const x = sx + i * sw, h = sh * (i + 1) * a;
        ctx.fillStyle = i % 2 ? 'rgba(139,58,26,0.22)' : 'rgba(139,58,26,0.32)'; ctx.fillRect(x, base - h, sw - 6, h);
        ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.strokeRect(x, base - h, sw - 6, h);
        ctx.save(); ctx.translate(x + (sw - 6) / 2, base - 20); ctx.rotate(-Math.PI / 2); ctx.fillStyle = th.fg; ctx.font = `700 26px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(who, 0, 9); ctx.restore();
      });
      // 小人：先站在地面，"爬上肩膀"时登上最高一级
      const climb = E.ease.inOut(E.seg(t, f2.s + 0.4, f2.s + 2.4));
      const step = Math.min(6, Math.floor(climb * 7)), px = sx + step * sw + sw / 2 - 3, py = climb > 0 ? base - sh * (step + 1) : base;
      const hx = climb > 0 ? px : sx - 60, hy = py;
      ctx.fillStyle = th.red; ctx.beginPath(); ctx.arc(hx, hy - 70, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = th.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy - 52); ctx.lineTo(hx, hy - 22); ctx.lineTo(hx - 12, hy); ctx.moveTo(hx, hy - 22); ctx.lineTo(hx + 12, hy); ctx.stroke();
      ctx.fillStyle = th.red; ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('你', hx, hy - 100);
      // 远处的视野线
      if (climb > 0.95) {
        ctx.globalAlpha = qA * E.seg(t, f2.s + 2.4, f2.s + 2.9); ctx.setLineDash([10, 10]); ctx.strokeStyle = th.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(hx + 20, hy - 70); ctx.lineTo(1000, hy - 160); ctx.moveTo(hx + 20, hy - 70); ctx.lineTo(1000, hy + 10); ctx.stroke(); ctx.setLineDash([]);
      }
      // 书信落款
      const lA = E.seg(t, qt.s + 1.0, qt.s + 1.5) * (1 - E.seg(t, fl.s, fl.s + 0.4));
      if (lA > 0) { ctx.globalAlpha = qA * lA; ctx.fillStyle = th.dim; ctx.font = `italic 500 30px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText('—— 牛顿致胡克的信，1676 年', 540, 760); }
    }
    ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
    ctx.fillText('年份为各定律 / 发现的发表时间；1638—1905 年共 267 年', 540, 1640);
    ctx.restore();
    end();

    function end() {
      const ac = b('action');
      if (t > ac.s) {
        E.rich(ctx, '站上巨人的肩膀，', 540, 880, { theme: th, size: 92, tt: t - ac.s - 0.1 });
        E.rich(ctx, '{看得更远}。', 540, 1030, { theme: th, size: 116, tt: t - ac.s - 0.6 });
      }
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
