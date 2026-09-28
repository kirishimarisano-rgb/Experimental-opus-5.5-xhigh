import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { PNG } from 'pngjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const file = path.join(here, '../index.html');
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(file)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.route('https://cdn.jsdelivr.net/npm/three@*/**', r => { const u = new URL(r.request().url()); const f = path.join(here, 'node_modules/three', u.pathname.replace(/^\/npm\/three@[^/]+\//, '')); r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }); });
const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto(`http://localhost:${srv.address().port}/?t=14&cam=${process.env.CAM ?? 0}`); await p.waitForFunction('window.__ready===true'); await p.waitForTimeout(1000);
const variants = JSON.parse(process.argv[2]);   // { name: "js expression run before render" }
for (const [name, js] of Object.entries(variants)) {
  await p.evaluate(js + ';window.__dbg.render(14)'); await p.waitForTimeout(3500);
  fs.writeFileSync(path.join(process.env.OUT, name + '.png'), await p.screenshot());
}
await b.close(); srv.close();
