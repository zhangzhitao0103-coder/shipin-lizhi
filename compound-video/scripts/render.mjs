// Renders src/index.html frame-by-frame with headless Chromium and encodes the MP4.
//   node scripts/render.mjs              -> output/compound_growth_30s_1080x1920.mp4
//   node scripts/render.mjs --preview    -> output/preview/*.png stills (quick check)
//   node scripts/render.mjs --stills 3.5,12,29.5
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_PATH || 'playwright'); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30, DUR = 30, W = 1080, H = 1920;
const OUT = path.join(ROOT, 'output', 'compound_growth_30s_1080x1920.mp4');
const MIX = path.join(ROOT, 'assets', 'mix.wav');

const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const preview = args.includes('--preview') || !!stillsArg;
const stills = stillsArg ? stillsArg.split(',').map(Number)
  : [0.6, 1.4, 2.4, 3.6, 4.6, 5.6, 7.0, 8.4, 9.6, 11.5, 13.5, 15.5, 16.4, 17.6, 19.5, 21.0, 22.4, 23.8, 25.2, 26.2, 27.0, 28.5, 29.9];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/src/index.html`;

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => { console.error('[page error]', e); process.exitCode = 1; });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => window.ready);

if (preview) {
  const dir = path.join(ROOT, 'output', 'preview');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of stills) {
    await page.evaluate((tt) => window.renderFrame(tt), t);
    await page.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`) });
  }
  console.log('stills written to', dir);
} else {
  if (!fs.existsSync(MIX)) throw new Error('assets/mix.wav missing – run scripts/mix.sh first');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-i', MIX,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-t', String(DUR), '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = FPS * DUR, t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate((tt) => window.renderFrame(tt), i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))));
  console.log('wrote', OUT);
}
await browser.close();
server.close();
