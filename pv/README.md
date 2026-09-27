# Sango — Opus 5.5 experimental（即時渲染同人 PV / Real-time fan PV）

> **非官方同人作品，與 Anthropic 無關。**
> **Unofficial fan work. Not affiliated with, endorsed by, or connected to Anthropic.**

---

## 中文

### 簡介
一支 **48 秒、用 WebGL2 即時渲染**的網頁 PV。畫面是程式每一幀算出來的，不是影片檔，也不是字卡。

主角 **Sango（珊瑚）** 是一隻自創的珊瑚色小生物：水滴形的身體、一圈會傾斜的光環、一條緞帶尾巴，全部由粒子組成。

**故事線**
1. **誕生**：光塵螺旋凝聚成 Sango。
2. **學會看見**：光環變成一顆虹膜，每一拍對焦一次。
3. **學會建造**：格子吸附成一座每拍長高一層的城市。
4. **擴張到很大的尺度**：城市捲成行星，行星變成星系，星系再連成宇宙網。
5. **回到小小的自己**：一切坍縮成一點後炸開，Sango 帶著一整個星系回來。
6. **標題**：粒子拼出標題 logo。

**技術重點**
- **單一粒子系統**：所有場景都是同一批粒子（桌機約 4.6 萬顆，手機約 2 萬顆）的不同目標形狀，在 vertex shader 裡用 curl noise 形變過去。場景之間沒有淡入淡出。
- **粒子拼字**：先用 Canvas 把字畫出來，再取樣像素當成粒子的目標位置。
- **後製**：bloom 光暈、色差（在鼓點上脈衝）、底片顆粒、暗角，以及用粒子大小和柔邊模擬的景深。
- **音樂**：用 Web Audio API 即時合成的原創曲，D 大調、**BPM 120**，24 小節（96 拍）。
- **同步**：畫面和音樂共用同一個主時鐘（`AudioContext.currentTime`），重點變化都對齊節拍，包括第 18 小節第 4 拍那一拍的全靜音停頓。
- **單一檔案**：`index.html` 不需要任何外部資源，離線也能播放。
- **效能**：手機會自動降低粒子數和渲染解析度，執行中如果偵測到掉幀也會再降解析度。
- **無障礙**：支援 `prefers-reduced-motion`，閃光和色差減半、手持晃動關閉。
- **相容性**：瀏覽器不支援 WebGL2 時，會顯示一個說明畫面，不會白屏。

### 本地預覽
```bash
cd pv
python3 -m http.server 8000
# 開啟 http://localhost:8000/ ，點「▶ Play」（瀏覽器會擋自動播放，所以需要點一下）
```

**除錯參數**
- `?t=24.5`：靜止渲染第 24.5 秒的畫面，不播音樂。
- `&q=high`：強制桌機畫質。
- `&q=low`：強制手機畫質。
- `&rm`：預覽 reduced-motion 版本。

### 開啟 GitHub Pages
1. 把這個資料夾 push 到 GitHub。
2. 進入 repo 的 **Settings → Pages**。
3. **Source** 選 **Deploy from a branch**，分支選 `main`（或你的預設分支），資料夾選 `/ (root)`，按 **Save**。
4. 等一兩分鐘，就能從 `https://<你的帳號>.github.io/<repo 名稱>/pv/` 觀看。

### 非官方聲明
本作品是粉絲自製的非官方同人創作，與 Anthropic 沒有任何關聯，也沒有獲得 Anthropic 的授權或背書。作品中沒有使用 Anthropic 的標誌（包括星芒標誌）、官方素材或音檔。「Opus」「Claude」等名稱的權利屬於各自的權利人。

---

## English

### About
A **48-second web PV rendered live with WebGL2**. Every frame is computed in real time; there is no video file and no slide deck.

The protagonist, **Sango** ("coral"), is an original coral-coloured creature made of particles: a droplet body, a tilting halo ring and a ribbon tail.

**Story arc**
1. **Birth**: drifting dust spirals together into Sango.
2. **Learning to see**: the halo becomes an iris that snaps into focus on the beat.
3. **Learning to build**: a grid snaps into a city that grows one storey per beat.
4. **Scaling up**: the city curls into a planet, the planet becomes a galaxy, and galaxies join into a cosmic web.
5. **Back to small**: everything collapses to a point, then bursts, and Sango returns with a galaxy inside.
6. **Title**: particles assemble the title logo.

**Technical notes**
- **One particle system**: every scene is a set of target shapes for the same particles (about 46k on desktop, about 20k on mobile). They morph between shapes in the vertex shader with curl-noise turbulence, so there are no crossfades.
- **Particle text**: words are rasterised on a canvas, and the sampled pixels become particle targets.
- **Post-processing**: bloom, beat-pulsed chromatic aberration, film grain, vignette, and depth of field faked through point size and softness.
- **Music**: an original piece synthesised live with the Web Audio API, in D major at **120 BPM**, 24 bars (96 beats).
- **Sync**: picture and music share one master clock (`AudioContext.currentTime`), so key changes land on the beat. This includes the one-beat silent pause at bar 18, beat 4.
- **Single file**: `index.html` loads nothing external and works offline.
- **Performance**: mobile devices get fewer particles and a lower render resolution. Resolution also drops automatically if frames start to lag.
- **Accessibility**: supports `prefers-reduced-motion` (flash and aberration halved, handheld sway off).
- **Compatibility**: browsers without WebGL2 get a short explanation screen instead of a blank page.

### Local preview
```bash
cd pv
python3 -m http.server 8000
# open http://localhost:8000/ and click "▶ Play" (browsers block autoplay, so a click is required)
```

**Debug parameters**
- `?t=24.5`: renders the frame at 24.5 s, silently.
- `&q=high`: forces desktop quality.
- `&q=low`: forces mobile quality.
- `&rm`: previews the reduced-motion version.

### Enabling GitHub Pages
1. Push this folder to GitHub.
2. Go to the repo's **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**. Pick `main` (or your default branch) and the `/ (root)` folder, then click **Save**.
4. After a minute or two, the PV is live at `https://<your-username>.github.io/<repo-name>/pv/`.

### Disclaimer
This is an unofficial, non-commercial fan work. It is not affiliated with, endorsed by, or connected to Anthropic in any way. It uses no Anthropic logos (including the starburst mark), official assets or audio. "Opus", "Claude" and related names belong to their respective owners.
