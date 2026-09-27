# Opus 5.5 experimental — Fan PV

> **非官方同人作品，與 Anthropic 無關。**
> **Unofficial fan work. Not affiliated with, endorsed by, or connected to Anthropic.**

---

## 中文

### 簡介
一支 36 秒的網頁 PV（宣傳影片）。剪輯沿用動畫／手遊 PV 的結構：冷開場 → 登場 → 能力蒙太奇 → 蓄力 → 高潮 → 標題卡 → 收尾一句，畫面則是安靜的編輯感風格。

- **配色**：暖奶油底 `#FAF9F5`、近黑文字 `#141413`，唯一的強調色是黏土珊瑚 `#D97757`。
- **主角**：自創符號「栞（Shiori）」，一頁折了角的紙，中心有一個珊瑚色的點。它會經歷 *誕生 → 展開 → 發光*。
- **音樂**：用 Web Audio API 即時合成的原創曲，D 大調、**BPM 120**，沒有任何外部音檔。
- **同步**：畫面和音樂共用同一個主時鐘（`AudioContext.currentTime`），每個剪接點都落在節拍上。總長 18 小節 × 2 秒 = 36 秒。
- **單一檔案**：`index.html` 內含所有 CSS、JS 和補間引擎，不需要任何外部資源，也可以離線播放。
- **無障礙**：支援 `prefers-reduced-motion`，會改成較溫和的淡入版本。畫面固定 16:9，在手機和桌機上都會自動縮放。

### 本地預覽
瀏覽器會擋自動播放，所以開場有一個「▶ Play」畫面，點擊後才開始播放。

```bash
cd pv
python3 -m http.server 8000
# 開啟 http://localhost:8000/
```

直接雙擊 `index.html` 也能播放。

**除錯參數**
- `?t=24.5`：靜止顯示第 24.5 秒的畫面，不播音樂，方便截圖檢查。
- 加上 `&rm`：預覽 reduced-motion 版本。

### 開啟 GitHub Pages
1. 把這個資料夾 push 到 GitHub。
2. 進入 repo 的 **Settings → Pages**。
3. **Source** 選 **Deploy from a branch**，Branch 選 `main`（或你的預設分支），資料夾選 `/ (root)`，按 **Save**。
4. 等一兩分鐘，就能從 `https://<你的帳號>.github.io/<repo 名稱>/pv/` 觀看。

### 非官方聲明
本作品是粉絲自製的非官方同人創作，與 Anthropic 沒有任何關聯，也沒有獲得 Anthropic 的授權或背書。作品中沒有使用任何官方標誌、素材或音檔。「Opus」「Claude」等名稱的權利屬於各自的權利人。

---

## English

### About
A 36-second web PV (promo video). The edit follows the classic anime / mobile-game PV structure: cold open → entrance → ability montage → build-up → climax → title card → closing line. The visuals use a quiet, editorial style.

- **Palette**: warm cream `#FAF9F5`, near-black ink `#141413`, and clay coral `#D97757` as the single accent.
- **Protagonist**: an original symbol, "Shiori", a dog-eared page with a coral seed at its centre. It is *born → unfolds → shines*.
- **Music**: an original piece synthesised live with the Web Audio API, in D major at **120 BPM**. No audio files are used.
- **Sync**: picture and sound run on one master clock (`AudioContext.currentTime`), so every cut lands on the beat. 18 bars × 2 s = 36 s.
- **Single file**: `index.html` contains all the CSS, JS and a small tween engine. It loads nothing external and works offline.
- **Accessibility**: supports `prefers-reduced-motion` with a gentler, fade-only version. The frame is a fixed 16:9 that scales on phones and desktops.

### Local preview
Browsers block autoplay, so the PV opens on a "▶ Play" screen and starts on click.

```bash
cd pv
python3 -m http.server 8000
# open http://localhost:8000/
```

Opening `index.html` directly also works.

**Debug parameters**
- `?t=24.5`: renders the frame at 24.5 s, silently, for inspection.
- Add `&rm` to preview the reduced-motion version.

### Enabling GitHub Pages
1. Push this folder to GitHub.
2. Go to the repo's **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**. Pick `main` (or your default branch) and the `/ (root)` folder, then click **Save**.
4. After a minute or two, the PV is live at `https://<your-username>.github.io/<repo-name>/pv/`.

### Disclaimer
This is an unofficial, non-commercial fan work. It is not affiliated with, endorsed by, or connected to Anthropic in any way. It uses no official logos, assets or audio. "Opus", "Claude" and related names belong to their respective owners.
