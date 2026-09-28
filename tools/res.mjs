import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { PNG } from 'pngjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const file = process.env.HTML;
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(file)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [w,h] of [[640,360],[800,450],[1000,562],[1280,720]]) {
const ctx = await b.newContext({ viewport: { width: w, height: h } });
await ctx.route('https://cdn.jsdelivr.net/npm/three@*/**', r => { const u = new URL(r.request().url()); const f = path.join(here, 'node_modules/three', u.pathname.replace(/^\/npm\/three@[^/]+\//, '')); r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }); });
const p = await ctx.newPage();
await p.goto(`http://localhost:${srv.address().port}/?t=14&cam=1`); await p.waitForFunction('window.__ready===true'); await p.waitForTimeout(3000);
const buf = await p.screenshot(); fs.writeFileSync(process.env.OUT+'/res'+w+'.png', buf); const png = PNG.sync.read(buf); let c = 0; for (let i = 0; i < png.data.length; i += 4) if (png.data[i] > 235 && png.data[i+1] > 225 && png.data[i+2] > 200) c++;
console.log(w, h, 'whitish', c, 'frac', (c/(w*h)).toFixed(5), await p.evaluate('window.__dbg.renderer.getPixelRatio()')); await ctx.close(); }
await b.close(); srv.close();
