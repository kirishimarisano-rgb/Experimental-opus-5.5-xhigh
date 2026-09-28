// node crop.mjs in.png out.png x y w h scale
import { PNG } from 'pngjs'; import fs from 'fs';
const [inp, out, x, y, w, h, sc] = process.argv.slice(2); const [X,Y,W,H,S] = [x,y,w,h,sc].map(Number);
const src = PNG.sync.read(fs.readFileSync(inp)); const dst = new PNG({ width: W*S, height: H*S });
for (let j = 0; j < H*S; j++) for (let i = 0; i < W*S; i++) { const si = ((Y + (j/S|0))*src.width + X + (i/S|0))*4, di = (j*W*S+i)*4; for (let k = 0; k < 4; k++) dst.data[di+k] = src.data[si+k]; }
fs.writeFileSync(out, PNG.sync.write(dst));
