import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const file = path.join(here, '../index.html');
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(file)); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 640, height: 360 } });
await ctx.route('https://cdn.jsdelivr.net/npm/three@*/**', r => { const u = new URL(r.request().url()); const f = path.join(here, 'node_modules/three', u.pathname.replace(/^\/npm\/three@[^/]+\//, '')); r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }); });
const p = await ctx.newPage(); p.on('console', m => console.log(m.text().slice(0,300)));
await p.goto(`http://localhost:${srv.address().port}/?t=14&cam=1`); await p.waitForFunction('window.__ready===true');
console.log(await p.evaluate(process.argv[2])); await b.close(); srv.close();
