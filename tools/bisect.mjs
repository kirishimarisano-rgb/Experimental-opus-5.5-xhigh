import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const file = path.join(here, '../index.html');
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(file)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.route('https://cdn.jsdelivr.net/npm/three@*/**', r => { const u = new URL(r.request().url()); const f = path.join(here, 'node_modules/three', u.pathname.replace(/^\/npm\/three@[^/]+\//, '')); r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }); });
const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto(`http://localhost:${srv.address().port}/?t=14&cam=1`); await p.waitForFunction('window.__ready===true'); await p.waitForTimeout(2500);
const bright = async () => { const png = PNG.sync.read(await p.screenshot()); let s = 0; for (let i = 0; i < png.data.length; i += 4) s += png.data[i]; return (s / (png.data.length/4)).toFixed(1); };
console.log('baseline', await bright());
const n = await p.evaluate(() => { const out = []; window.__dbg.scene.children.forEach((c, i) => out.push(i + ':' + c.type + ':' + (c.count ?? c.children?.length ?? ''))); return out; });
console.log(n.join(' | '));
for (let i = 0; i < n.length; i++) {
  await p.evaluate((i) => { const c = window.__dbg.scene.children[i]; c.__v = c.visible; c.visible = false; window.__dbg.render(14); }, i);
  await p.waitForTimeout(2500); console.log('hide', n[i], await bright());
  await p.evaluate((i) => { window.__dbg.scene.children[i].visible = true; }, i);
}
await b.close(); srv.close();
