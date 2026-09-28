// 用法: node shoot.mjs <outDir> [width height]
// 以 Playwright(Chromium) 對 index.html 拍 3 個固定鏡頭並量測效能。
// three.js 由 CDN URL 攔截到本機 node_modules（離線環境亦可重現）。
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.resolve(process.argv[2] ?? 'shots'); fs.mkdirSync(out, { recursive: true });
const W = +(process.argv[3] ?? 1280), H = +(process.argv[4] ?? 720);
const file = process.env.HTML ?? path.join(root, 'index.html');
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(file)); }).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
await ctx.route('https://cdn.jsdelivr.net/npm/three@*/**', r => {
  const u = new URL(r.request().url()); const rel = u.pathname.replace(/^\/npm\/three@[^/]+\//, '');
  const f = path.join(here, 'node_modules/three', rel);
  fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }) : r.fulfill({ status: 404 });
});
const errs = [];
if (process.env.DBG) for (const cam of [3, 4]) {
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/?t=14&cam=${cam}&dbg=1`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 180000 }); await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(out, `dbg${cam}.png`) }); await page.close();
}
for (const cam of [0, 1, 2]) {
  const page = await ctx.newPage();
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(`[cam${cam}] ${m.text()}`); });
  page.on('pageerror', e => errs.push(`[cam${cam}] ${e.message}`));
  await page.goto(`http://localhost:${port}/?t=14&cam=${cam}`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 180000 }); await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(out, `cam${cam + 1}.png`) });
  await page.close();
}
// 動態指標：同一鏡頭 t=14 與 t=14.6 兩張圖的差異（平均絕對差 0–255、變動像素比例）
const motion = {};
for (const cam of [0, 1, 2]) {
  const bufs = [];
  for (const t of [14, 14.6]) {
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${port}/?t=${t}&cam=${cam}`);
    await page.waitForFunction('window.__ready === true', null, { timeout: 180000 }); await page.waitForTimeout(4000);
    bufs.push(PNG.sync.read(await page.screenshot())); await page.close();
  }
  let sum = 0, ch = 0; const n = bufs[0].width * bufs[0].height;
  for (let i = 0; i < n; i++) { const d = (Math.abs(bufs[0].data[i*4]-bufs[1].data[i*4]) + Math.abs(bufs[0].data[i*4+1]-bufs[1].data[i*4+1]) + Math.abs(bufs[0].data[i*4+2]-bufs[1].data[i*4+2]))/3; sum += d; if (d > 6) ch++; }
  motion[`cam${cam+1}`] = { meanAbsDiff: +(sum/n).toFixed(2), changedPct: +(100*ch/n).toFixed(1) };
}
console.log('motion', JSON.stringify(motion));
// 效能：軟體渲染(SwiftShader)無法代表 GPU fps，改量「同解析度下每幀毫秒」做版本間相對比較，另記 draw calls / 三角形數
const page = await ctx.newPage();
await page.goto(`http://localhost:${port}/?fps=1&pr=0.5`);
await page.waitForFunction('typeof window.__bench === "function"');
await page.waitForTimeout(3000);
const st = await page.evaluate(() => window.__bench(6)); st.motion = motion;
fs.writeFileSync(path.join(out, 'perf.json'), JSON.stringify(st, null, 1));
console.log('perf', JSON.stringify(st)); if (errs.length) console.log('ERRORS\n' + [...new Set(errs)].join('\n'));
await browser.close(); srv.close();
