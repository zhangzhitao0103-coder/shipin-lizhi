// 视频号封面（3:4，1080×1440）批量导出：node tools/cover34.js [ID ...]，默认全部
// 取与竖版封面相同的时刻，去掉字幕，裁画面中段 y=260..1700，叠统一模板
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'out', '视频号封面');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(ROOT, 'episodes')).filter(f => /^[A-Z]\d+\.js$/.test(f)).map(f => f.slice(0, -3));
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  for (const id of ids) {
    const ep = require(path.join(ROOT, 'episodes', id + '.js'));
    const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', id, 'timeline.json'), 'utf8'));
    const cb = tl.beats[ep.cover] || tl.beats[tl.order[0]], ct = cb.s + Math.min(1.8, cb.d * 0.7);
    const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(ROOT, 'web', 'index.html'));
    await page.evaluate(([u, t]) => window.__setup(u, t), ['file://' + path.join(ROOT, 'episodes', id + '.js'), tl]);
    await page.evaluate(([t, y]) => window.__cover34(t, y), [ct, ep.cover34Y ?? 260]);
    fs.writeFileSync(path.join(OUT, `${id}_${ep.title}_视频号封面.jpg`), await page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1440 } }));
    await page.close(); console.log('ok', id);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
