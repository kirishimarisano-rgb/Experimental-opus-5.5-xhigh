import { PNG } from 'pngjs'; import fs from 'fs';
for (const i of [1,2,3]) {
  const a = PNG.sync.read(fs.readFileSync(`../rounds/r01/cam${i}.png`)), b = PNG.sync.read(fs.readFileSync(`../rounds/r13/cam${i}.png`));
  const W = a.width, H = a.height, o = new PNG({ width: W*2 + 8, height: H }); o.data.fill(20);
  PNG.bitblt(a, o, 0, 0, W, H, 0, 0); PNG.bitblt(b, o, 0, 0, W, H, W + 8, 0);
  fs.writeFileSync(`../before_after/cam${i}_before_after.png`, PNG.sync.write(o));
}
