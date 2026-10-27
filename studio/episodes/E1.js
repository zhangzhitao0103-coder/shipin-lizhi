// E1《同样的阳光，为什么能点燃纸？》专注类 · 暗金电影风
// 物理锚点：凸透镜会聚光线。示意：直径 10 cm 的放大镜把光聚成直径 2 mm 的光斑，面积比 (100/2)² = 2500（忽略损耗）
(function (root) {
  const EP = {
    id: 'E1',
    title: '同样的阳光为什么能点燃纸',
    theme: 'cinema',
    voice: { sid: 50 },
    capY: 360, capSize: 62,
    music: { style: 'cinema', chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E', 'Am', 'F', 'C', 'G'] },
    cover: 'burn',
    beats: [
      { id: 'hook', min: 3.2, cap: ['同样的阳光，晒在纸上，', '纸只是{有点热}。'], voice: '同样的阳光，晒在纸上，纸只是有点热。', mood: 0.3 },
      { id: 'lens', min: 3.0, cap: ['放一块放大镜，', '把光{聚到一个点}——'], voice: '放一块放大镜，把光聚到一个点。', mood: 0.6, sfx: [{ at: 0.3, type: 'riser', dur: 2.6 }] },
      { id: 'burn', min: 2.4, cap: ['纸，[烧起来了]。'], voice: '纸，烧起来了。', mood: 1.0, sfx: [{ at: 0.1, type: 'boom' }] },
      { id: 'why', min: 4.4, cap: ['阳光没变强，只是集中了：', '10 厘米的光聚到 2 毫米，亮了 {2500 倍}。'], voice: '阳光没变强，只是集中了。十厘米的光，聚到两毫米，亮了两千五百倍。', mood: 0.8 },
      { id: 'flip', min: 3.4, cap: ['精力也一样：', '分散在每一处，{哪里都不够热}。'], voice: '精力也一样，分散在每一处，哪里都不够热。', mood: 0.5 },
      { id: 'flip2', min: 3.0, cap: ['集中到一个点，', '才能{烧穿一道难关}。'], voice: '集中到一个点，才能烧穿一道难关。', mood: 0.85 },
      { id: 'action', min: 2.8, cap: null, voice: '把精力，聚成一个点。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '厘米毫米倍放大镜直径光斑面积比忽略损耗示意把精力聚成一个点0123456789',
  };

  const PAPER_Y = 1300, FX = 540, LENS_Y = 900;

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.background(ctx, th, t, { glow: 'rgba(90,60,20,0.3)' });
    const sceneA = E.seg(t, 0.1, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 0.2, b('flip').s + 0.7)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    const lensK = E.ease.inOut(E.seg(t, b('lens').s + 0.2, b('lens').s + 1.4));
    const heat = E.seg(t, b('lens').s + 1.2, b('burn').s + 0.3);
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 纸
      ctx.fillStyle = '#E9DFC8'; ctx.beginPath(); ctx.moveTo(220, PAPER_Y); ctx.lineTo(860, PAPER_Y); ctx.lineTo(940, PAPER_Y + 90); ctx.lineTo(140, PAPER_Y + 90); ctx.closePath(); ctx.fill();
      // 光线：没有透镜时平行照下，有透镜时会聚到焦点
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 13; i++) {
        const x0 = 300 + i * 40;
        const g = ctx.createLinearGradient(0, 520, 0, PAPER_Y); g.addColorStop(0, 'rgba(255,214,140,0.05)'); g.addColorStop(1, 'rgba(255,214,140,0.35)');
        ctx.strokeStyle = g; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x0, 520); ctx.lineTo(x0, LENS_Y);
        ctx.lineTo(E.lerp(x0, FX, lensK), PAPER_Y + 40); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      // 透镜
      if (lensK > 0) {
        ctx.globalAlpha = sceneA * lensK;
        const lg = ctx.createLinearGradient(290, 0, 790, 0); lg.addColorStop(0, 'rgba(200,230,255,0.15)'); lg.addColorStop(0.5, 'rgba(230,245,255,0.45)'); lg.addColorStop(1, 'rgba(200,230,255,0.15)');
        ctx.fillStyle = lg; ctx.strokeStyle = 'rgba(230,245,255,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(540, LENS_Y, 260, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#8C6E5D'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(800, LENS_Y); ctx.lineTo(960, LENS_Y - 60); ctx.stroke();
        ctx.globalAlpha = sceneA;
      }
      // 光斑：没透镜时一大片淡光，有透镜时一个亮点
      const spotR = E.lerp(260, 10, lensK);
      const sg = ctx.createRadialGradient(FX, PAPER_Y + 40, 0, FX, PAPER_Y + 40, spotR * 1.6);
      sg.addColorStop(0, `rgba(255,${Math.round(240 - 120 * heat)},${Math.round(180 - 160 * heat)},${(0.35 + 0.6 * lensK).toFixed(2)})`); sg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(FX, PAPER_Y + 40, spotR * 1.6, spotR * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      // 燃烧：焦痕 + 火苗 + 烟
      const burn = E.seg(t, b('burn').s, b('burn').s + 1.2);
      if (burn > 0) {
        ctx.fillStyle = 'rgba(40,20,10,0.8)'; ctx.beginPath(); ctx.ellipse(FX, PAPER_Y + 40, 40 * burn, 14 * burn, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 7; i++) {
          const x = FX - 30 + i * 10, h = (50 + 20 * Math.sin(t * 13 + i * 2)) * burn;
          const fg = ctx.createLinearGradient(0, PAPER_Y + 40, 0, PAPER_Y + 40 - h); fg.addColorStop(0, 'rgba(255,200,90,0.8)'); fg.addColorStop(1, 'rgba(255,90,30,0)');
          ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x - 8, PAPER_Y + 40); ctx.quadraticCurveTo(x, PAPER_Y + 40 - h, x + 8, PAPER_Y + 40); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 10; i++) { const ph = ((t * 0.4 + i / 10) % 1); ctx.fillStyle = `rgba(200,200,200,${(0.18 * (1 - ph) * burn).toFixed(3)})`; ctx.beginPath(); ctx.arc(FX + Math.sin(i * 3 + t) * 30 * ph, PAPER_Y - ph * 300, 16 + ph * 40, 0, Math.PI * 2); ctx.fill(); }
      }
      // 2500 倍
      const wA = E.seg(t, b('why').s + 0.4, b('why').s + 1.0) * (1 - E.seg(t, b('flip').s, b('flip').s + 0.4));
      if (wA > 0) {
        ctx.globalAlpha = sceneA * wA; ctx.fillStyle = 'rgba(7,7,9,0.7)'; ctx.fillRect(0, 560, 1080, 260);
        E.bigNumber(ctx, th, '× 2500', 540, 740, { size: 160, alpha: sceneA * wA });
      }
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('示意：放大镜直径 10 cm、光斑直径 2 mm，面积比 2500（忽略损耗）', 540, 1600);
      ctx.restore();
    }
    // 精力：分散的小光点 → 聚成一个亮点
    const fl = b('flip');
    const pA = E.seg(t, fl.s + 0.4, fl.s + 0.9) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (pA > 0) {
      const gather = E.ease.inOut(E.seg(t, b('flip2').s + 0.2, b('flip2').s + 1.6));
      const r = E.rng(17); ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 40; i++) {
        const x0 = 180 + r() * 720, y0 = 700 + r() * 760;
        const x = E.lerp(x0, 540, gather), y = E.lerp(y0, 1080, gather);
        ctx.globalAlpha = pA * (0.5 + 0.5 * gather); ctx.fillStyle = th.gold; ctx.beginPath(); ctx.arc(x, y, 10 + 6 * gather, 0, Math.PI * 2); ctx.fill();
      }
      if (gather > 0.9) { ctx.globalAlpha = pA * E.seg(gather, 0.9, 1); const g = ctx.createRadialGradient(540, 1080, 0, 540, 1080, 200); g.addColorStop(0, 'rgba(255,220,140,0.9)'); g.addColorStop(1, 'rgba(255,180,80,0)'); ctx.fillStyle = g; ctx.fillRect(340, 880, 400, 400); }
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '把精力，', 540, 880, { theme: th, size: 100, tt: t - ac.s - 0.1 });
      E.rich(ctx, '{聚成一个点}。', 540, 1030, { theme: th, size: 116, tt: t - ac.s - 0.5, glow: 1.0, gold: th.goldHi });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
