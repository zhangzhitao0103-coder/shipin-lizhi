// K7《夸孩子聪明，还是夸努力？》家长类 · 纸雕风
// 依据：Mueller & Dweck（1998，《人格与社会心理学杂志》）：被夸聪明的孩子更多选择容易的任务，遇到挫折后坚持更少、表现下降；
// 被夸努力的孩子更多选择有挑战的任务。画面中的人数比例为示意
(function (root) {
  const EP = {
    id: 'K7',
    title: '夸孩子聪明还是夸努力',
    theme: 'paper',
    voice: { sid: 30 },
    capY: 370, capSize: 62,
    music: { style: 'cinema', chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Em', 'F', 'G'] },
    cover: 'choose2',
    beats: [
      { id: 'hook', min: 2.8, cap: ['孩子考好了，', '你会{怎么夸}？'], voice: '孩子考好了，你会怎么夸？', mood: 0.3 },
      { id: 'study', min: 4.0, cap: ['心理学家德韦克做过一个实验：', '让孩子们先做同一套题。'], voice: '心理学家德韦克做过一个实验，让孩子们先做同一套题。', mood: 0.4 },
      { id: 'two', min: 4.0, cap: ['一组被夸：“你真聪明。”', '另一组被夸：“你真{努力}。”'], voice: '一组被夸，你真聪明。另一组被夸，你真努力。', mood: 0.45 },
      { id: 'choose1', min: 3.6, cap: ['再让他们选下一套题：', '被夸聪明的，更多选了[简单的]；'], voice: '再让他们选下一套题，被夸聪明的，更多选了简单的。', mood: 0.55, sfx: [{ at: 0.8, type: 'ticks', n: 5, gap: 0.12 }] },
      { id: 'choose2', min: 3.0, cap: ['被夸努力的，', '大多选了{更难的}。'], voice: '被夸努力的，大多选了更难的。', mood: 0.7, sfx: [{ at: 0.6, type: 'ding' }] },
      { id: 'fail', min: 3.4, cap: ['遇到难题之后，', '被夸聪明的孩子，[更容易放弃]。'], voice: '遇到难题之后，被夸聪明的孩子，更容易放弃。', mood: 0.5 },
      { id: 'flip', min: 4.0, cap: ['夸聪明，孩子会怕失去“聪明”；', '夸努力，孩子会{敢于挑战}。'], voice: '夸聪明，孩子会怕失去聪明这个标签。夸努力，孩子会敢于挑战。', mood: 0.8 },
      { id: 'action', min: 3.2, cap: null, voice: '少夸你真聪明，多夸你真努力。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '你真聪明努力简单难被夸的组放弃少多德韦克年人格与社会心理学杂志人数比例为示意',
  };

  // 每组 10 个孩子：被夸聪明组 7 人选简单（示意），被夸努力组 9 人选难
  const kid = (ctx, x, y, col, th, a = 1) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = 'rgba(80,50,30,0.22)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(x, y - 44, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - 22, y - 22, 44, 50, 14); ctx.fill(); ctx.restore();
  };

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const sceneA = E.seg(t, b('study').s - 0.2, b('study').s + 0.4) * (1 - 0.85 * E.seg(t, b('flip').s - 0.1, b('flip').s + 0.4));
    // 开头：一张满分卷
    const hA = E.seg(t, 0.1, 0.6) * (1 - E.seg(t, b('study').s - 0.2, b('study').s + 0.3));
    if (hA > 0) {
      ctx.save(); ctx.globalAlpha = hA; ctx.translate(540, 1000); ctx.rotate(-0.05);
      ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(80,50,30,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillRect(-220, -300, 440, 600); ctx.shadowBlur = 0;
      ctx.strokeStyle = th.faint; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-170, -160 + i * 56); ctx.lineTo(170, -160 + i * 56); ctx.stroke(); }
      ctx.fillStyle = th.red; ctx.font = `700 120px ${th.num}`; ctx.textAlign = 'center'; ctx.fillText('100', 60, -190);
      ctx.restore();
    }
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      const groups = [{ x: 290, label: '“你真聪明”', col: '#E9A47F', easy: 7 }, { x: 790, label: '“你真努力”', col: th.teal, easy: 1 }];
      const twoA = E.seg(t, b('two').s + 0.2, b('two').s + 0.8);
      groups.forEach((g, gi) => {
        // 夸奖气泡
        const ga = gi === 0 ? twoA : E.seg(t, b('two').s + 1.6, b('two').s + 2.2);
        if (ga > 0) {
          ctx.globalAlpha = sceneA * ga; ctx.fillStyle = '#FBF6F0'; ctx.shadowColor = 'rgba(80,50,30,0.2)'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.roundRect(g.x - 190, 640, 380, 100, 50); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = gi === 0 ? '#B8653F' : th.teal; ctx.font = `700 44px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(g.label, g.x, 706);
          ctx.globalAlpha = sceneA;
        }
        // 孩子：选题后走到"简单 / 难"两侧
        const ch = gi === 0 ? E.ease.inOut(E.seg(t, b('choose1').s + 0.6, b('choose1').s + 1.8)) : E.ease.inOut(E.seg(t, b('choose2').s + 0.2, b('choose2').s + 1.4));
        for (let i = 0; i < 10; i++) {
          const x0 = g.x - 160 + (i % 5) * 80, y0 = 860 + Math.floor(i / 5) * 120;
          const easy = i < g.easy;
          const x1 = g.x + (easy ? -110 : 110) + ((i % 3) - 1) * 46, y1 = 1180 + Math.floor(i / 3) * 96;
          const fa = t > b('fail').s && gi === 0 ? 1 - 0.6 * E.seg(t, b('fail').s + 0.5 + i * 0.08, b('fail').s + 0.9 + i * 0.08) : 1;
          kid(ctx, E.lerp(x0, x1, ch), E.lerp(y0, y1, ch), g.col, th, fa);
        }
        // 两个题堆
        const pa = E.seg(t, b('choose1').s + 0.2, b('choose1').s + 0.6);
        if (pa > 0) {
          ctx.globalAlpha = sceneA * pa; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(g.x - 170, 1100, 120, 40); ctx.fillStyle = th.dim; ctx.fillText('简单', g.x - 110, 1132);
          ctx.fillStyle = th.gold; ctx.fillRect(g.x + 50, 1100, 120, 40); ctx.fillStyle = '#FFFFFF'; ctx.fillText('难', g.x + 110, 1132);
          ctx.globalAlpha = sceneA;
        }
      });
      ctx.fillStyle = th.faint; ctx.fillRect(538, 820, 4, 720);
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('Mueller & Dweck，1998，《人格与社会心理学杂志》；人数比例为示意', 540, 1640);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '少夸“你真聪明”，', 540, 880, { theme: th, size: 84, tt: t - ac.s - 0.1 });
      E.rich(ctx, '多夸{“你真努力”}。', 540, 1030, { theme: th, size: 96, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
