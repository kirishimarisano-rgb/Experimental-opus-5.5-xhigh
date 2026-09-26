# 雨宮駅・春雨：three.js 雨天車站場景

雨天、起霧的日本春季小車站，以新海誠式的光影為目標。整個場景是單一 HTML 檔：three.js r186 透過 import map 從 jsDelivr 載入，所有貼圖都在瀏覽器中程序化生成，沒有任何外部素材。

![最終畫面](iterations/final-1920x1080.png)

## 開啟方式

- 直接開啟 `index.html`（需要網路載入 three.js）；或
- 在專案根目錄啟動任一靜態伺服器，例如 `npx serve .`，再開啟 `http://localhost:3000`。

| 操作 | 作用 |
|---|---|
| 拖曳 | 在限制角度內環顧 |
| `Space` | 暫停或繼續時間（雨、花瓣、平交道號誌） |
| `H` | 顯示或隱藏標題與提示（右上角提示的最後一行是實際使用的 GPU、幀率與渲染倍率） |

| URL 參數 | 作用 |
|---|---|
| `?q=low` / `med` / `high` / `ultra` | 畫質預設，影響解析度、MSAA、陰影、霧的步數、粒子數。預設為桌機 high、窄螢幕 low；不指定時，即時模式會依幀率自動降低解析度。`ultra` 給效能強的獨立顯示卡：高 DPI 螢幕用原生解析度（最多 2×）、4096 陰影、更細的霧與反射 |
| `?t=14.2` | 固定時間 |
| `?shot` | 固定為單幀、關閉攝影機晃動，供截圖使用 |
| `?cam=station` / `roof` / `houses` / `track` / `sakura` / `street` / `bikes` | 特寫機位，用來檢查建模細節（預設 `main`） |
| `?cam=x,y,z,tx,ty,tz` | 把鏡頭放在任意位置 (x, y, z)，看向 (tx, ty, tz)，焦點自動設在目標點 |
| `?debug=nofog` / `nofx` / `norays` / `nobloom` / `nodof` / `noao` / `ao` | 逐項關閉效果，或只顯示 SSAO，用於診斷 |

## 使用第二張（較好的）顯示卡

程式已經向瀏覽器要求高效能 GPU（`powerPreference: 'high-performance'`），但這只是提示，真正決定用哪張卡的是作業系統與顯示卡驅動。筆電尤其常把瀏覽器放在內建顯示卡上。

**先確認現在用的是哪張卡**：開啟場景後看右上角提示的最後一行（被隱藏時按 `H`），會顯示 GPU 名稱與幀率；若是 Intel 或 AMD 內建顯示卡，後面會標「內建顯示卡？」。也可以在 Chrome／Edge 網址列輸入 `chrome://gpu`（Edge 為 `edge://gpu`），查看 `GL_RENDERER`。

**Windows 10／11（最通用）**

1. 開啟 **設定 → 系統 → 顯示器 → 圖形**（Windows 10 為「圖形設定」）。
2. 在應用程式清單找到 Chrome 或 Edge；沒有的話按「瀏覽」加入 `chrome.exe`（通常在 `C:\Program Files\Google\Chrome\Application\`）。
3. 點該程式 →「選項」，GPU 喜好設定選 **高效能**。較新的 Windows 11 也可以在這裡直接指定某一張 GPU。
4. **完全關閉瀏覽器**（包括背景執行的程序）再重新開啟，設定才會生效。

**NVIDIA 顯示卡**：NVIDIA 控制面板 → 管理 3D 設定 → 程式設定 → 加入瀏覽器 → 慣用的圖形處理器選「高效能 NVIDIA 處理器」。

**AMD 顯示卡**：AMD Software → 設定 → 圖形，把瀏覽器設為高效能。

**其他注意事項**

- 筆電要**插上電源**，並把電源模式設為「最佳效能」；省電模式常會強制使用內建顯示卡。
- 桌機若裝了兩張卡，**螢幕要接在較好的那張卡的輸出孔**。接在主機板上的輸出孔會走內建顯示卡。
- macOS：雙 GPU 的 Intel MacBook Pro 會依 `powerPreference` 自動切到獨立顯示卡；也可以在「電池」設定關閉「自動切換圖形卡」。
- Linux：Mesa 驅動可用 `DRI_PRIME=1 google-chrome`；NVIDIA PRIME 則用 `__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia google-chrome`。

切到獨立顯示卡後，可以試 `?q=ultra`。

## 需求對照

| 需求 | 實作 |
|---|---|
| three.js 最新版、import map | `three@0.186.1`，`three` 與 `three/addons/` 都映射到 jsDelivr |
| EffectComposer + UnrealBloomPass | 以 `EffectComposer` 串接自訂 pass。Bloom 的大半徑 mip 染暖色，燈光周圍呈現底片 halation |
| SSAO | `SSAOPass` 子類別，32 個 kernel、半徑 0.55 m；天空、Alpha 花卡、電線、粒子排除在法線 pass 之外 |
| 濕地面反射 | 兩個平面鏡射（月台面、地面／道路），用 oblique near-plane 裁切。反射依粗糙度取 mip 並加上垂直拉長取樣，再乘上 Fresnel。水窪遮罩、雙層雨滴漣漪法線、屋簷下較乾 |
| 體積霧 | ① 覆寫所有材質的 fog chunk，改為指數高度霧並依太陽方向染色，主畫面、鏡射、粒子共用同一套大氣。② 體積霧 pass：3D 噪聲霧團與向下捲動的雨幕以 raymarch 計算；14 盞燈的散射對每盞燈做 equi-angular sampling，以 HG 相函數計算。③ 螢幕空間光芒 |
| 雨滴與櫻花粒子 | 約 2.6 萬條 instanced 雨絲、屋簷滴水、濺水花冠、近鏡頭失焦雨；三組旋轉翻滾的花瓣（Points）；約 5200 片依水窪分佈的落花。粒子都與場景深度做軟遮擋，並被燈光照亮 |
| 軟陰影 | `PCFShadowMap` 搭配 `shadow.radius`。r186 已移除 `PCFSoftShadowMap`，PCF 本身改用 Vogel disk 軟取樣。投影光源為方向光與 3 盞 SpotLight |
| （額外）景深 | 薄透鏡 CoC，半解析度 scatter-as-gather 散景；飄落花瓣在粒子 shader 裡用同一個 CoC 失焦 |

## 建模

全部程序化生成、沒有外部模型：

- **車站**：H 型鋼上屋與波浪浪板屋頂、立體販賣機與回收箱、條板長椅、時鐘與時刻表、駐輪場與ママチャリ、郵便ポスト、靠在長椅邊的ビニール傘。
- **軌道**：倒角枕木與扣件、有可動ブラケット與礙子的架線。
- **街道**：緊鄰道路的瓦屋頂民家（窗框、雨戶、陽台、空調、天線、有窗簾與室內的亮燈窗戶），圍牆、門柱、桶裝瓦斯、輕型車與側溝蓋板。
- **電線桿**：日本式コンクリート柱，有高壓橫擔、カットアウト、變壓器、低壓ラック、通訊電纜與接續箱、巻き看板與住所表示。
- **植物**：由一朵朵五瓣花組成花穗的櫻花、菜の花、多層杉林、葉叢灌木與草叢。

混凝土、磚牆、外牆與金屬另有世界座標的風化（斑駁、雨漬、牆腳藻類、雨天濕潤）。場景約 140 萬個三角形；靜態物件依材質合併，重複物件用 instancing。

## 為什麼還是會有點假？再往上的方向

第 9–12 輪處理的是「一眼就看得出是 CG」的地方：紙片般的櫻花、過於簡單的電線桿、空曠的街道、太乾淨的表面、均勻發光的窗戶、完全清晰的鏡頭，以及缺少生活痕跡。剩下的差距主要來自方法本身的上限：

1. **程序化的幾何與貼圖**：所有東西都是用程式從基本形狀與 canvas 畫出來的。真實世界的表面細節（柏油、樹皮、生鏽）很難用規則描述。最有效的一步是換成**實物掃描的 PBR 貼圖與模型**（例如 Poly Haven 的 CC0 素材、Quixel Megascans）。代價是要額外下載素材，不再是「零外部素材的單一檔案」。
2. **植物**：一棵成熟的櫻花樹有數萬朵以上的花；這裡整排樹加起來約 3.2 萬張花卡，近看仍然有卡片感。更進一步需要 SpeedTree 之類的專用工具，或每朵花都是幾何的 instancing（需要更強的 GPU）。
3. **光照**：即時光柵化沒有真正的全域光照（光線在牆與地面之間的反彈）。陰天的真實感很大一部分來自這種柔和的反彈光。可行的方向是預先烘焙光照貼圖，或離線用路徑追蹤（例如 three-gpu-pathtracer）渲染靜止畫面。
4. **風格**：新海誠的畫面本身是「比照片更漂亮」的誇張寫實，飽和的天空與光芒是刻意的。如果目標是照片寫實，可以降低光芒與 bloom、降低櫻花飽和度、改用更平淡的陰天色調。

如果要做到接近照片的程度，實際上會改用 Unreal Engine 5（Lumen 全域光照、Nanite、Megascans）或 Blender Cycles。three.js 單一 HTML 的強項是在瀏覽器裡即時、可互動，並且完全由程式生成。

## 迭代過程

共十二輪（1–5 輪光影與構圖，6–8 輪建模精細化，9–12 輪真實感），每輪都有 Playwright 截圖、自我檢查（電影感光影、大氣透視、色彩層次）、量化數據與修改說明：
**[`iterations/README.md`](iterations/README.md)**

## 目錄

```
index.html                 最終場景（單一檔案）
iterations/
  README.md                每輪截圖、問題、修改說明與數據
  contact-sheet.jpg        十二輪對照
  modelling-closeups.jpg   建模特寫：Round 5 對 Round 8
  realism-closeups.jpg     真實感特寫：修改前對 Round 12
  final-1920x1080.png      最終 1080p 截圖
  round-N/index.html       第 N 輪的 HTML 快照
  round-N/round-N.png      第 N 輪截圖（1600×900，t = 14.2）
tools/
  shoot.mjs                Playwright 截圖（把 CDN 請求導向本地 node_modules）
  analyze.py               截圖的亮度、飽和度、冷暖統計
```

## 重現截圖

```bash
cd tools && npm install                 # three@0.186.1 + playwright（另需 Chromium：npx playwright install chromium）
node shoot.mjs index.html iterations/final-1920x1080.png --w 1920 --h 1080 --t 14.2
python3 analyze.py ../iterations/final-1920x1080.png   # 需要 pillow、numpy
```

`shoot.mjs` 使用 SwiftShader 軟體 WebGL2，1080p 一張約需 2–3 分鐘。場景是為實體 GPU 上的即時播放設計的，但本環境只能軟體渲染，實際 GPU 幀率未經實測。場景每幀要畫陰影、兩個平面反射、SSAO 法線與主畫面，約 140 萬個三角形，在內建顯示卡上可能會卡；請先照上面的方法切到獨立顯示卡，或改用 `?q=med`、`?q=low`。
