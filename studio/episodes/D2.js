// D2《把纸对折 42 次》复利类 · 纸雕风
// 计算：0.1 mm × 2^n：10 次 ≈ 10.2 cm，20 次 ≈ 105 m，30 次 ≈ 107 km（超过 100 km 的太空边界），42 次 ≈ 44 万 km（地月平均距离约 38.4 万 km）
(function (root) {
  const th0 = n => 0.1 * Math.pow(2, n); // 毫米
  function fmt(mm) {
    if (mm < 10) return mm.toFixed(1) + ' 毫米';
    if (mm < 1000) return (mm / 10).toFixed(1) + ' 厘米';
    if (mm < 1e6) return (mm / 1000).toFixed(0) + ' 米';
    if (mm < 1e10) return (mm / 1e6).toFixed(0) + ' 公里';
    return (mm / 1e10).toFixed(1) + ' 万公里';
  }
  const MARKS = [[10, '一本书'], [20, '30 多层楼'], [30, '太空边界'], [42, '月球']];

  const EP = {
    id: 'D2',
    title: '把纸对折42次',
    theme: 'paper',
    voice: { sid: 40 },
    capY: 370, capSize: 62,
    music: { style: 'cinema', chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G'] },
    cover: 'f42',
    beats: [
      { id: 'hook', min: 3.4, cap: ['一张 0.1 毫米的纸，', '对折 42 次，{有多厚}？'], voice: '一张零点一毫米的纸，对折四十二次，有多厚？', mood: 0.3 },
      { id: 'f10', min: 2.8, cap: ['对折 10 次：', '大约 {10 厘米}，一本书那么厚。'], voice: '对折十次，大约十厘米，一本书那么厚。', mood: 0.4, sfx: [{ at: 0.3, type: 'ticks', n: 10, gap: 0.08 }] },
      { id: 'f20', min: 3.0, cap: ['20 次：大约 {105 米}，', '有 30 多层楼高。'], voice: '二十次，大约一百零五米，有三十多层楼高。', mood: 0.55, sfx: [{ at: 0.3, type: 'ticks', n: 10, gap: 0.06 }] },
      { id: 'f30', min: 3.2, cap: ['30 次：{107 公里}，', '超过了 100 公里的太空边界。'], voice: '三十次，一百零七公里，超过了一百公里的太空边界。', mood: 0.7, sfx: [{ at: 0.3, type: 'ticks', n: 10, gap: 0.05 }] },
      { id: 'f42', min: 3.6, cap: ['42 次：{44 万公里}，', '超过了地球到月球的距离。'], voice: '四十二次，四十四万公里，超过了地球到月球的距离。', mood: 1.0, sfx: [{ at: 0.3, type: 'riser', dur: 1.2 }, { at: 1.5, type: 'boom' }] },
      { id: 'flip', min: 4.0, cap: ['每一次，都只是{翻一倍}；', '前面看不出什么，最后一下就到了月球。'], voice: '每一次，都只是翻一倍。前面看不出什么，最后一下，就到了月球。', mood: 0.7 },
      { id: 'action', min: 3.0, cap: null, voice: '每天进步一点点，时间会帮你翻倍。', mood: 1.0, sfx: [{ at: 0.1, type: 'swell' }] },
    ],
    texts: '第次毫米厘米米公里万一本书多层楼太空边界月球假设能一直对折纸厚地月平均距离约每天进步点时间会帮你翻倍0123456789.',
  };

  function foldsAt(t, TL, E) {
    const b = id => TL.b(id);
    const seg = (a, z, s) => a + (z - a) * E.ease.inOut(E.seg(t, s, s + 1.0));
    if (t < b('f10').s) return 0;
    if (t < b('f20').s) return seg(0, 10, b('f10').s);
    if (t < b('f30').s) return seg(10, 20, b('f20').s);
    if (t < b('f42').s) return seg(20, 30, b('f30').s);
    return seg(30, 42, b('f42').s);
  }

  EP.draw = function (ctx, t, TL, th, E) {
    const b = id => TL.b(id);
    E.paint(ctx, th, t);
    const n = foldsAt(t, TL, E), N = Math.floor(n + 1e-6);
    const sceneA = E.seg(t, 0.2, 0.7) * (1 - 0.85 * E.seg(t, b('flip').s + 1.0, b('flip').s + 1.6)) * (1 - E.seg(t, b('action').s - 0.1, b('action').s + 0.3));
    if (sceneA > 0) {
      ctx.save(); ctx.globalAlpha = sceneA;
      // 左：纸片叠层（显示前 6 层的叠加感）
      const layers = Math.min(18, 1 + N);
      for (let i = 0; i < layers; i++) {
        ctx.save(); ctx.translate(330, 1180 - i * 14); ctx.rotate((i % 2 ? 1 : -1) * 0.02);
        ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FBF4EA'; ctx.shadowColor = 'rgba(80,50,30,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
        ctx.fillRect(-170, -10, 340, 20); ctx.restore();
      }
      ctx.fillStyle = th.fg; ctx.font = `700 46px ${th.cap}`; ctx.textAlign = 'center';
      ctx.fillText('对折 ' + N + ' 次', 330, 1310);
      ctx.fillStyle = th.gold; ctx.font = `700 58px ${th.cap}`; ctx.fillText(fmt(th0(n)), 330, 1390);
      // 右：对数刻度的高度梯子
      const RX = 800, YB = 1460, YT = 620;
      const ly = k => YB - (k / 42) * (YB - YT);
      ctx.strokeStyle = th.dim; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(RX, YB); ctx.lineTo(RX, YT); ctx.stroke();
      MARKS.forEach(([k, lab]) => {
        const reached = n >= k - 0.01;
        ctx.fillStyle = reached ? th.gold : th.dim; ctx.beginPath(); ctx.arc(RX, ly(k), reached ? 14 : 9, 0, Math.PI * 2); ctx.fill();
        ctx.font = `700 30px ${th.cap}`; ctx.textAlign = 'left'; ctx.fillText(lab, RX + 30, ly(k) + 10);
        ctx.font = `500 22px ${th.cap}`; ctx.fillStyle = th.dim; ctx.fillText(k + ' 次', RX + 30, ly(k) + 42);
      });
      // 月亮
      ctx.fillStyle = '#F4E3C3'; ctx.shadowColor = '#F4E3C3'; ctx.shadowBlur = n >= 41.9 ? 30 : 0; ctx.beginPath(); ctx.arc(RX - 90, ly(42), 40, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      // 当前位置指针
      ctx.fillStyle = th.teal; ctx.beginPath(); ctx.moveTo(RX - 22, ly(n)); ctx.lineTo(RX - 50, ly(n) - 16); ctx.lineTo(RX - 50, ly(n) + 16); ctx.fill();
      ctx.globalAlpha = sceneA * 0.85; ctx.fillStyle = th.dim; ctx.font = `400 21px "Noto Sans SC"`; ctx.textAlign = 'center';
      ctx.fillText('假设能一直对折，纸厚 0.1 毫米；地月平均距离约 38.4 万公里；刻度按对折次数', 540, 1560);
      ctx.restore();
    }
    const ac = b('action');
    if (t > ac.s) {
      E.rich(ctx, '每天进步一点点，', 540, 880, { theme: th, size: 88, tt: t - ac.s - 0.1 });
      E.rich(ctx, '时间会帮你{翻倍}。', 540, 1030, { theme: th, size: 104, tt: t - ac.s - 0.6 });
    }
  };

  if (typeof module !== 'undefined') module.exports = EP; else (root.EPISODES = root.EPISODES || {})[EP.id] = EP;
})(typeof window !== 'undefined' ? window : globalThis);
