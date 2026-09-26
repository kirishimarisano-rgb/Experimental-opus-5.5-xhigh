"""Quick objective read-out of a screenshot for the self-review checklist.

    python3 tools/analyze.py iterations/round-1/round-1.png [more.png ...]

Numbers are computed on display-referred (sRGB) values in 0..1:
  * luma p5 / p50 / p95  -> tonal range (are there real darks and real highlights?)
  * contrast             -> p95 - p5
  * sat                  -> mean HSV saturation (colour richness)
  * warm / cool          -> share of pixels clearly warm (R > B) or cool (B > R)
  * bands                -> the frame split into horizontal thirds (sky / horizon / foreground):
                            mean luma, luma std-dev (detail/contrast inside the band) and saturation.
                            Atmospheric perspective shows up as the horizon band having lower
                            contrast and saturation than the foreground band.
"""
import sys

import numpy as np
from PIL import Image


def stats(path):
    img = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    mx, mn = img.max(axis=2), img.min(axis=2)
    sat = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0.0)
    p5, p50, p95 = np.percentile(luma, [5, 50, 95])
    warm = float(np.mean((r - b) > 0.04))
    cool = float(np.mean((b - r) > 0.04))
    h = img.shape[0]
    bands = []
    for name, sl in (("sky", slice(0, h // 3)), ("horizon", slice(h // 3, 2 * h // 3)), ("fore", slice(2 * h // 3, h))):
        bl, bs = luma[sl], sat[sl]
        bands.append(f"{name}: L={bl.mean():.2f} σ={bl.std():.3f} S={bs.mean():.2f}")
    print(f"{path}\n  luma p5={p5:.3f} p50={p50:.3f} p95={p95:.3f}  contrast={p95 - p5:.3f}  sat={sat.mean():.3f}  warm={warm:.2f} cool={cool:.2f}")
    print("  " + " | ".join(bands))


if __name__ == "__main__":
    for p in sys.argv[1:]:
        stats(p)
