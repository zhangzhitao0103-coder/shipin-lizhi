const { chromium } = require('playwright');
const { spawn } = require('child_process');
const FPS = 30;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/video.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1500);
  const D = await p.evaluate(() => window.DURATION);
  const N = Math.round(D * FPS);
  const ff = spawn('ffmpeg', ['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
    '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),'video_noaudio.mp4'], { stdio: ['pipe','inherit','inherit'] });
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => render(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log('frame', i, '/', N);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
  console.log('done', D);
})();
