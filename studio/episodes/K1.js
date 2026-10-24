// K1《孩子还能在家吃几顿晚饭？》家长类 · 暖色温情风
// 估算（走读）：上学期间每周在家晚饭 5 顿 × 每年约 40 周 + 寒暑假约 12 周 × 7 顿 = 284 顿/年，高中 3 年约 852 顿；
// 大学每年在家约 60 天 → 4 年约 240 顿；工作后每年约 10 天 → 10 年约 100 顿。之后 14 年合计约 340 顿
(function (root) {
  const HS = 852, UNI = 240, WORK = 100;

  const EP = {
    id: 'K1',
    title: '孩子还能在家吃几顿晚饭',
    theme: 'warm',
    voice: { sid: 50 },
    capY: 360, capSize: 64,
    music: { style: 'cinema', chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'] },
    cover: 'compare',
    beats: [
      { id: 'hook', min: 3.4, cap: ['孩子上高中后，', '你们还能一起吃{几顿晚饭}？'], voice: '孩子上高中后，你们还能一起吃几顿晚饭？', mood: 0.3 },
      { id: 'calc', min: 3.6, cap: ['上学的日子，每周 5 顿；', '寒暑假，每天都在家。'], voice: '上学的日子，每周五顿。寒暑假，每天都在家。', mood: 0.35 },
      { id: 'total', min: 3.0, cap: ['高中三年，', '大约 {850} 顿。'], voice: '高中三年，大约八百五十顿。', mood: 0.5, sfx: [{ at: 0.2, type: 'ding' }] },
      { id: 'college', min: 3.0, cap: ['上了大学，', '一年大概只有 {60} 顿。'], voice: '上了大学，一年大概只有六十顿。', mood: 0.45 },
      { id: 'work', min: 3.4, cap: ['工作以后，', '可能一年只剩{春节那几天}。'], voice: '工作以后，可能一年只剩春节那几天。', mood: 0.4 },
      { id: 'compare', min: 4.0, cap: ['高中这三年的晚饭，', '比之后十几年加起来{还多}。'], voice: '高中这三年的晚饭，比之后十几年加起来还多。', mood: 0.8, sfx: [{ at: 0.4, type: 'boom' }] },
      { id: 'flip', min: 3.2, cap: ['所以这段时间，', '别只剩下[催]和[吵]。'], voice: '所以这段时间，别只剩下催和吵。', mood: 0.45 },
      { id: 'quote', min: 3.8, cap: ['陪孩子把高中走好，', '是这段日子{最好的样子}。'], voice: '陪孩子把高中走好，是这段日子最好的样子。', mood: 0.8, capY: 880, capSize: 74 },
      { id: 'action', min: 3.2, cap: null, voice: '今晚的饭桌上，多聊聊，少催催。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '一二三四五六日上学寒暑假在家高中年大学工作后之顿约0123456789合计估算走读期间每周晚饭天今的桌多聊少催',
  };

  // 点阵位置：先是大方阵，之后收缩成"三段对比"
  const gridPos = (i) => ({ x: 540 - 15 * 24 + (i % 30) * 24 + 12, y: 640 + Math.floor(i / 30) * 24 });
  const blockPos = (i, y0) => ({ x: 540 - 20 * 18 + (i % 40) * 18 + 9, y: y0 + Math.floor(i / 40) * 18 });

  function dot(ctx, x, y, r, a, col) {
    if (a <= 0) return;
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const warm = th.gold;
    const endDim = (1 - 0.7 * E.seg(t, b('flip').s, b('flip').s + 0.5)) * (1 - 0.8 * E.seg(t, b('quote').s - 0.2, b('quote').s + 0.4));

    // 开场：吊灯与饭桌
    const lampA = E.seg(t, 0.1, 0.8) * (1 - E.seg(t, b('calc').s, b('calc').s + 0.5));
    if (lampA > 0) {
      ctx.save(); ctx.globalAlpha = lampA;
      ctx.strokeStyle = 'rgba(255,226,184,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(540, 480); ctx.lineTo(540, 760); ctx.stroke();
      const cone = ctx.createLinearGradient(0, 800, 0, 1300); cone.addColorStop(0, 'rgba(255,200,130,0.35)'); cone.addColorStop(1, 'rgba(255,200,130,0)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(470, 810); ctx.lineTo(610, 810); ctx.lineTo(860, 1300); ctx.lineTo(220, 1300); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFD9A0'; ctx.beginPath(); ctx.moveTo(540, 760); ctx.lineTo(620, 815); ctx.lineTo(460, 815); ctx.closePath(); ctx.fill();
      ctx.shadowColor = '#FFC27A'; ctx.shadowBlur = 40; ctx.fillStyle = '#FFF1D6'; ctx.beginPath(); ctx.arc(540, 822, 12, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,226,184,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(200, 1300); ctx.lineTo(880, 1300); ctx.stroke();
      [400, 540, 680].forEach((x, i) => { ctx.globalAlpha = lampA * E.seg(t, 0.5 + i * 0.25, 0.9 + i * 0.25); ctx.strokeStyle = th.goldHi; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, 1262, 36, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 44, 1262); ctx.lineTo(x + 44, 1262); ctx.stroke(); });
      ctx.restore();
    }
    // 一周的 7 个座位
    const cb = b('calc');
    const wA = E.seg(t, cb.s + 0.2, cb.s + 0.6) * (1 - E.seg(t, b('total').s - 0.1, b('total').s + 0.3));
    if (wA > 0) {
      ctx.save();
      const days = ['一', '二', '三', '四', '五', '六', '日'];
      [['上学周', [1, 1, 1, 1, 1, 0, 0]], ['假期周', [1, 1, 1, 1, 1, 1, 1]]].forEach(([lab, on], r) => {
        const y = 820 + r * 260, rA = E.seg(t, cb.s + 0.3 + r * 1.6, cb.s + 0.8 + r * 1.6);
        ctx.globalAlpha = wA * rA; ctx.fillStyle = th.fg; ctx.font = `700 36px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(lab, 150, y - 70);
        days.forEach((d, i) => {
          const x = 220 + i * 110;
          ctx.globalAlpha = wA * rA; ctx.strokeStyle = 'rgba(255,226,184,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.stroke();
          if (on[i]) { ctx.shadowColor = warm; ctx.shadowBlur = 30; dot(ctx, x, y, 28, wA * rA, warm); ctx.shadowBlur = 0; }
          ctx.globalAlpha = wA * rA; ctx.fillStyle = th.dim; ctx.font = `500 28px ${th.cap}`; ctx.textAlign = 'center'; ctx.fillText(d, x, y + 84);
        });
      });
      ctx.restore();
    }

    // 852 顿：方阵 → 对比块
    const tb = b('total');
    if (t > tb.s - 0.1) {
      const morph = E.ease.inOut(E.seg(t, b('college').s, b('college').s + 1.0));
      ctx.save(); ctx.shadowColor = warm; ctx.shadowBlur = 8;
      for (let i = 0; i < HS; i++) {
        const ap = E.seg(t, tb.s + (i / HS) * 1.6, tb.s + (i / HS) * 1.6 + 0.2);
        const g = gridPos(i), k = blockPos(i, 640);
        dot(ctx, E.lerp(g.x, k.x, morph), E.lerp(g.y, k.y, morph), E.lerp(8, 6.5, morph), ap * endDim, warm);
      }
      ctx.shadowBlur = 0; ctx.restore();
      const cnt = Math.round(HS * E.seg(t, tb.s, tb.s + 1.8));
      ctx.save(); ctx.globalAlpha = endDim * (1 - morph); ctx.fillStyle = th.goldHi; ctx.font = `700 64px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText(cnt + ' 顿', 540, 1400); ctx.restore();
      if (morph > 0) {
        ctx.save(); ctx.globalAlpha = endDim * morph; ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left';
        ctx.fillText('高中 3 年', 180, 615); ctx.textAlign = 'right'; ctx.fillStyle = th.goldHi; ctx.fillText('约 852 顿', 900, 615); ctx.restore();
      }
    }
    // 大学 4 年
    const ub = b('college');
    if (t > ub.s + 0.8) {
      ctx.save();
      for (let i = 0; i < UNI; i++) { const p = blockPos(i, 1110), ap = E.seg(t, ub.s + 0.8 + (i / UNI) * 0.9, ub.s + 1.0 + (i / UNI) * 0.9); dot(ctx, p.x, p.y, 6.5, ap * endDim * 0.8, '#FFB27A'); }
      ctx.globalAlpha = endDim * E.seg(t, ub.s + 0.8, ub.s + 1.2); ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('大学 4 年', 180, 1085);
      ctx.textAlign = 'right'; ctx.fillText('约 240 顿', 900, 1085); ctx.restore();
    }
    // 工作后 10 年
    const kb = b('work');
    if (t > kb.s + 0.3) {
      ctx.save();
      for (let i = 0; i < WORK; i++) { const p = blockPos(i, 1290), ap = E.seg(t, kb.s + 0.3 + (i / WORK) * 0.6, kb.s + 0.5 + (i / WORK) * 0.6); dot(ctx, p.x, p.y, 6.5, ap * endDim * 0.7, '#FF9A7A'); }
      ctx.globalAlpha = endDim * E.seg(t, kb.s + 0.3, kb.s + 0.7); ctx.fillStyle = th.fg; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText('工作后 10 年', 180, 1265);
      ctx.textAlign = 'right'; ctx.fillText('约 100 顿', 900, 1265); ctx.restore();
    }
    // 对比
    const cp = b('compare');
    const cA = E.seg(t, cp.s + 0.3, cp.s + 0.8) * endDim;
    if (cA > 0) {
      ctx.save(); ctx.globalAlpha = cA; ctx.strokeStyle = th.goldHi; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(930, 1100); ctx.lineTo(950, 1100); ctx.lineTo(950, 1340); ctx.lineTo(930, 1340); ctx.stroke();
      ctx.fillStyle = th.goldHi; ctx.font = `700 34px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('之后 14 年合计 ≈ 340 顿', 540, 1440);
      ctx.font = `700 46px ${th.cap}`; ctx.fillStyle = warm; ctx.fillText('高中 3 年 ≈ 852 顿', 540, 1520);
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.8 * E.seg(t, b('calc').s, b('calc').s + 0.6) * endDim; ctx.fillStyle = th.dim; ctx.font = `500 21px ${th.cap}`; ctx.textAlign = 'center';
    ctx.fillText('估算（走读）：上学期间每周在家晚饭 5 顿、每年假期约 12 周；', 540, 1676);
    ctx.fillText('大学每年在家约 60 天；工作后每年约 10 天', 540, 1708); ctx.restore();

    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '今晚的饭桌上，', 540, 880, { theme: th, size: 84, tt: t - ac.s - 0.1 });
      E.rich(ctx, '多聊聊，{少催催}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.7, glow: 1.0 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
