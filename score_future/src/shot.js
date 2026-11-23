const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: +process.argv[3] || 1 });
  await p.goto('file://' + __dirname + '/poster.html');
  await p.waitForTimeout(2500);
  const fam = await p.evaluate(() => document.fonts.check('900 40px "Noto Sans SC"'));
  console.log('noto loaded:', fam);
  const h = await p.evaluate(() => { const t=document.querySelector('.table').getBoundingClientRect(); return t.bottom; });
  console.log('table bottom', h);
  await p.screenshot({ path: process.argv[2] });
  await b.close();
})();
