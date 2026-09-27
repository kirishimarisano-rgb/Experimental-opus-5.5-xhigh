// Headless screenshots of station/index.html for the art-review rounds.
//
//   node station/tools/shoot.mjs --out station/screenshots/round1 \
//        --shots hero,gate,core,follow,planet,deep,map,sango --w 1920 --h 1080 --q high
//
// Each shot loads index.html?shot=<name>&t=<unix s>&freeze=1&ui=<0|1>, waits for
// window.__ready, then saves <out>/<name>.png. The container has no GPU, so the
// page runs on SwiftShader (software WebGL2): slow, but pixel-correct.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const page = path.resolve(here, '..', 'index.html');

const opts = { out: path.resolve(here, '..', 'screenshots'), shots: 'hero', w: 1920, h: 1080, q: 'high', t: '1790000000', ui: '0', extra: '', timeout: '900', mobile: '0' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
mkdirSync(opts.out, { recursive: true });

const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await playwright.chromium.launch({
  executablePath: existsSync(exe) ? exe : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});

// Shots are separated by ';' (or ',' when no shot carries params).
// "label:shot@key=value&key=value" names the file and adds per-shot params.
const list = opts.shots.includes('@') || opts.shots.includes(';') ? opts.shots.split(';') : opts.shots.split(',');
for (const entry of list.filter(Boolean)) {
  const [head, more = ''] = entry.split('@');
  const [label, shot] = head.includes(':') ? head.split(':') : [head, head];
  const mobile = opts.mobile === '1';
  const ctx = await browser.newContext({
    viewport: { width: +opts.w, height: +opts.h }, deviceScaleFactor: 1,
    hasTouch: mobile, isMobile: mobile,
  });
  const tab = await ctx.newPage();
  tab.on('console', (m) => { const s = m.text(); if (!/GPU stall|swiftshader|Automatic fallback/i.test(s)) console.log(`  [${shot}:${m.type()}]`, s); });
  tab.on('pageerror', (e) => console.log(`  [${shot}:pageerror]`, e.message));
  const url = `${pathToFileURL(page).href}?shot=${shot}&t=${opts.t}&freeze=1&q=${opts.q}&ui=${opts.ui}${opts.extra}${more ? '&' + more : ''}`;
  const t0 = Date.now();
  await tab.goto(url);
  await tab.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: +opts.timeout * 1000, polling: 500 });
  const err = await tab.evaluate(() => window.__error);
  if (err) console.log(`  [${shot}] error:`, err);
  const file = path.join(opts.out, `${label}.png`);
  await tab.screenshot({ path: file });
  const stats = await tab.evaluate(() => window.__stats || null);
  console.log(`${label}: ${file} (${((Date.now() - t0) / 1000).toFixed(1)} s)`, stats ? JSON.stringify(stats) : '');
  await ctx.close();
}
await browser.close();
