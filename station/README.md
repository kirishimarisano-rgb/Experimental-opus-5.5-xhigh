# OPUS 軌道總站 · Opus Orbital Terminal

> **非官方同人作品 · Unofficial fan work** — Opus 5.5 experimental
> 完全原創的即時渲染太空港：單一 HTML 檔、原生 WebGL2、沒有任何外部函式庫或圖檔。
> An original real-time space port in a single HTML file: raw WebGL2, no libraries, no image assets.

[中文](#中文) · [English](#english)

---

## 中文

### 簡介

一座繞行星運行的軌道總站，存在理由是站中央的「EXP 實驗算力中心」。四條路線都在服務它：

| 路線 | 運送 | 樣子 |
|---|---|---|
| **C 貨運線**（琥珀） | 貨物 | 長、重、慢：機頭加 12 節平車，貨櫃各有顏色 |
| **P 客運線**（天青） | 旅客 | 短、快、準點：4 節車廂，車窗透出暖光 |
| **D 數據線**（紫晶） | AI 資料 | 沒有實體列車，是從深空湧入、沿光纖流進核心的光脈衝 |
| **X 通訊線**（翡翠） | 星際訊息 | 站上 90 m 天線朝深空發射的光束 |

站內是實體高架軌道，一直延伸到東側朝向深空的出站閘門（三道同軸光環）。列車出閘後脫離軌道自由航行；進站列車則從虛空飛入閘門，被軌道接住。行星 Cantus 在西側下方佔滿半邊天，另一側是星雲與銀河帶。散熱冠的 60 片鰭片發出暗紅的黑體輻射光，亮度隨算力負載變化。

時刻表以 **UTC 真實時間**運行：任何人在同一秒打開，看到的是同一班車停在同一個位置。

站內某處藏著 **Sango**。靠近才看得到。

### 操作方式

| 動作 | 桌機 | 觸控 |
|---|---|---|
| 旋轉視角 | 左鍵拖曳（放手有慣性） | 單指拖曳 |
| 縮放 | 滾輪 | 雙指捏合 |
| 平移 | 右鍵或 Shift＋拖曳、WASD、Q/E 升降 | 雙指拖曳 |
| 飛到某處 | 雙擊結構 | 點兩下 |
| 跟隨列車 | 點看板上的列車或 3D 裡的列車；再點一次或 Esc 返回 | 同左 |
| 算力中心 | 點核心：看負載、拖曳滑桿調高（最高 130% 超頻），鰭片跟著變亮 | 同左 |
| 路線圖模式 | L 或工具列按鈕：站體退成剪影，只留四條發光路線 | 工具列按鈕 |
| 音效 | M 或喇叭按鈕（預設靜音） | 喇叭按鈕 |
| 其他 | R 回預設視角 · H 隱藏介面 · ? 說明 · F 幀率 | 工具列 |

畫質可在工具列切換高／低。觸控裝置預設低畫質；桌機若前幾秒明顯跑不動，會自動降一次。

### 本地預覽

檔案沒有任何外部相依，直接用瀏覽器開啟 `station/index.html` 即可。
若想用本地伺服器：

```bash
cd <repo>
python3 -m http.server 8000
# 開啟 http://localhost:8000/station/
```

需要支援 WebGL2 與浮點渲染目標（`EXT_color_buffer_float`）的瀏覽器：新版 Chrome、Edge、Firefox、Safari 都可以。不支援時會顯示說明頁，不會白屏。

### GitHub Pages 設定

1. 把含有 `station/` 的 branch 合併到要發布的 branch（例如 `main`）。
2. GitHub repo → **Settings → Pages**。
3. **Source** 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
4. 約一分鐘後開啟 `https://<使用者名稱>.github.io/<repo 名稱>/station/`。

### URL 參數（方便分享視角與截圖）

| 參數 | 作用 |
|---|---|
| `?q=high` / `?q=low` | 指定畫質 |
| `?t=1790000000` | 指定站內時間（Unix 秒）；加 `&freeze=1` 停在那一刻 |
| `?shot=hero\|gate\|core\|deep\|planet\|map\|follow\|sango` | 預設機位 |
| `?follow=C` / `?follow=P` | 開啟時就跟隨一班列車 |
| `?map=1` | 開啟路線圖模式 |
| `?load=1.2` | 固定算力負載（0–1.3） |
| `?ui=0` | 隱藏介面 |
| `?fps=1` | 顯示幀率 |

### 技術摘要

- **單一檔案**：HTML＋CSS＋一段 JavaScript。所有幾何、材質、文字標牌、音效都在執行時產生。
- **HDR 管線**：RGBA16F 渲染目標，高畫質 4× MSAA；13-tap 降採樣＋tent 升採樣的 bloom 鏈；鏡頭光暈；AgX tone mapping；冷暗部／暖亮部調色、暗角、極淡顆粒；低畫質改用 FXAA。
- **行星**：背景 pass 中以光線–球體求交，Rayleigh＋Mie 單次散射；扭曲 fbm 生成大陸、海洋、極冠、帶狀雲層與氣旋；海面太陽反光；夜側沿海城市燈。
- **深空**：星場、銀河帶（含塵埃帶）、發射星雲、一個遠方星系，啟動時烘焙進 HDR cubemap；亮星用點精靈，會被行星遮住。
- **光照**：GGX 太陽光＋4096² PCF 陰影；以「星空＋行星」烘焙的環境 cubemap 做反射與行星反照；散熱冠被視為環形光源照亮周圍結構。
- **Instancing**：桁架、鰭片、貨櫃、艙段、儲槽、列車車廂、無人機全部 instanced；燈號、脈衝、光束、推進焰用 instanced 光點／光條。
- **路線圖筆觸**：每條線另有一條面向鏡頭、帶最小像素寬度的光帶，任何距離都讀得出路線圖。
- **時刻表**：每條線是一條連續路徑（深空接近→站內→離站），速度曲線以前後向加速度限制求出；列車狀態只是時間的函數。
- **音效**：Web Audio 即時合成——隨負載變化的低頻嗡鳴、FM 鐘聲進出站提示、閘門呼嘯、數據批次的細碎音、發射時的上掃回聲，依距離衰減並左右聲像。

### 效能說明

目標是桌機 60fps、手機可流暢操作。開發用的雲端容器沒有 GPU，截圖以 SwiftShader 軟體渲染取得，所以**無法在這裡量測真實幀率**；效能以 draw call 與三角形數控管（主畫面約 30 個 draw call、靜態網格約 15 萬三角形、instanced 約 1 萬個實例）。請在自己的裝置上用 `?fps=1` 確認。

### 美術審查截圖

見文末「Review rounds · 美術審查」：第一輪批評、第二輪修改清單與兩輪對照。

### 非官方聲明

本作品為非官方同人創作，與 Anthropic 無關，亦未獲其背書。站體、列車與行星皆為原創設計，不模仿任何現有遊戲或動畫中的太空站；Sango 是同系列 PV 的原創角色。

---

## English

### About

An orbital terminal circling a planet. Its reason to exist is the **EXP Experimental Core** at the centre, and four lines serve it:

| Line | Carries | Looks like |
|---|---|---|
| **C Cargo** (amber) | freight | long, heavy, slow: a locomotive and 12 flatcars of coloured containers |
| **P Passenger** (sky cyan) | people | short, fast, punctual: four cars with warm lit windows |
| **D Data** (violet) | AI data | no train at all: light pulses streaming in from deep space and down fibres into the core |
| **X Comms** (jade) | interstellar messages | a beam fired into deep space by the station's 90 m dish |

Inside the station the tracks are real elevated guideways running out to the departure gates (three coaxial light rings each), all facing deep space. Departing trains leave the rails at the gate and fly free; arriving trains drop out of the void into the gate and are caught by the track. The planet Cantus fills the western sky below; nebula and Milky Way lie on the other side. The 60 radiator fins glow a dark black-body red that rises with compute load.

The timetable runs on **real UTC time**: everyone who opens the page in the same second sees the same train in the same place.

**Sango** is hidden somewhere in the station. You only see it up close.

### Controls

| Action | Desktop | Touch |
|---|---|---|
| Orbit | left-drag (with inertia) | one-finger drag |
| Zoom | wheel | pinch |
| Pan | right-drag or Shift+drag, WASD, Q/E | two-finger drag |
| Fly to | double-click a structure | double-tap |
| Follow a train | click it on the board or in 3D; click again or Esc to return | same |
| Compute core | click the core: load, slider up to 130% overclock, fins brighten | same |
| Route-map mode | L or toolbar: the station fades to a silhouette, four glowing lines remain | toolbar |
| Sound | M or speaker button (muted by default) | speaker button |
| Misc | R reset · H hide UI · ? help · F frame rate | toolbar |

Quality can be switched between high and low in the toolbar. Touch devices start on low; on desktop it steps down once if the first seconds run too slowly.

### Local preview

There are no external dependencies, so opening `station/index.html` directly works. Or serve the repo:

```bash
cd <repo>
python3 -m http.server 8000
# open http://localhost:8000/station/
```

Requires WebGL2 with floating-point render targets (`EXT_color_buffer_float`): any recent Chrome, Edge, Firefox or Safari. Unsupported browsers get an explanation page, never a blank screen.

### GitHub Pages

1. Merge the branch containing `station/` into the branch you publish (e.g. `main`).
2. Repository → **Settings → Pages**.
3. **Source: Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
4. After about a minute open `https://<user>.github.io/<repo>/station/`.

### URL parameters

`?q=high|low` · `?t=<unix seconds>` (+ `&freeze=1`) · `?shot=hero|gate|core|deep|planet|map|follow|sango` · `?follow=C|P` · `?map=1` · `?load=0..1.3` · `?ui=0` · `?fps=1`

### Technical notes

- **One file**: HTML, CSS and one script. Geometry, materials, signage text and sound are generated at runtime.
- **HDR pipeline**: RGBA16F target with 4× MSAA on high; 13-tap down / tent up bloom chain; lens flare; AgX tone mapping; cool-shadow/warm-highlight grade, vignette, faint grain; FXAA on low.
- **Planet**: ray–sphere in the background pass with Rayleigh + Mie single scattering; warped-fbm continents, oceans, ice caps, zonal clouds with a cyclone, sun glint, coastal city lights on the night side.
- **Deep space**: stars, Milky Way with dust lanes, an emission nebula and a distant galaxy baked into an HDR cubemap at start-up; bright stars as point sprites occluded by the planet.
- **Lighting**: GGX sun with a 4096² PCF shadow map; reflections and planet-shine from a baked sky + planet environment cube; the radiator crown lights nearby structure as a ring light.
- **Instancing** for trusses, fins, containers, modules, tanks, train cars and drones; instanced glow sprites and streaks for beacons, pulses, the beam and plumes.
- **Route-map strokes**: every line also has a camera-facing ribbon with a minimum pixel width, so the map reads from any distance.
- **Timetable**: each line is one continuous route (approach → station → departure) with a velocity profile from forward/backward acceleration passes; a train's state is purely a function of time.
- **Audio**: Web Audio synthesis — load-driven hum, FM chimes for arrivals and departures, gate whooshes, data sparkles, transmission sweeps with echo, all panned and attenuated by distance.

### Performance

The target is 60 fps on desktop and smooth interaction on phones. The cloud container this was built in has no GPU, so the screenshots come from SwiftShader and **real frame rates could not be measured here**. Cost is kept in check by budget instead: about 30 draw calls, ~150k static triangles and ~10k instances. Check on your own device with `?fps=1`.

### Disclaimer

This is an unofficial fan work. It is not affiliated with or endorsed by Anthropic. The station, trains and planet are original designs and do not imitate any space station from existing games or anime. Sango is the original character from the companion PV.

---

## Review rounds · 美術審查

截圖以 Playwright＋SwiftShader 產生（`node station/tools/shoot.mjs`），站內時間固定（第一輪 `t=1790000012`，第二輪 `t=1790000030`，閘門與跟車兩張另指定時刻）。遠景、深空側、路線圖三個機位在第二輪重新構圖，見修改清單第 6、7、12 項；其餘機位兩輪相同。
Screenshots are rendered headlessly with Playwright + SwiftShader (`node station/tools/shoot.mjs`) at a frozen station time (round 1 `t=1790000012`, round 2 `t=1790000030`; the gate and follow shots pick their own moments). The hero, deep-side and route-map cameras were re-framed in round 2 (changes 6, 7 and 12); the other cameras are identical in both rounds.

### 第一輪批評 · Round-1 critique

以「截任何一個角度都能當桌布」為標準，第一輪的問題分成三類：

**太假 Fake**
1. **X 光束有一根黑棍**：光束一端在鏡頭後方時，裁切後的長條在螢幕上被拉到極長，數值失真成負的加法光，畫面出現黑色芯。（06、07、03）
2. **散熱冠像紅色紙傘**：整片鰭片均勻發光，受光面又被太陽照成粉紅，看起來是上漆的塑膠。（03、04）
3. **行星看不到晨昏線**：太陽在東北東，行星幾乎全亮；邊緣一大片米色雲霧，海陸像模糊色塊。（01、02、06）
4. **金色隔熱毯在閃爍**：法線噪聲頻率太高，遠看像亮片。（05）
5. **客運大廳像米色貨箱**：玻璃讀起來是磁磚，屋頂是幾個白盒子。（01、03）

**太空 Empty**
6. **主視角像線框模型**：全是細桁架與圓環，沒有大面積的量體，右半邊只有幾條灰色格線。（01）
7. **深空側朝空無一物的方向拍**：閘門孤零零浮在黑暗裡。（07）
8. **背光的天線碟像一個黑洞**。（01、06）

**太像 demo**
9. **核心像條紋煙囪**：28 層一模一樣的白色光帶。（03、04）
10. **閘門光環像 LED 呼拉圈**：整圈滿亮，加上 bloom 更像玩具。（02、07）
11. **點光源 bloom 成方塊**：信標與進場燈亮度過高，在 bloom 的低解析度層變成方形光斑。（02）
12. **路線圖模式被白色光束搶戲**，地圖也偏向一側。（08）
13. **手機版**：左上角聲明文字被切掉，低畫質太糊。（10）

### 第二輪修改 · What changed in round 2

| # | 修改 Change |
|---|---|
| 1 | 光條改為在鏡頭前方一段距離裁切；片段著色器絕不寫入負值或 NaN；最終合成也擋掉 NaN。Streaks are clipped against a plane in front of the camera; the shader never writes negative or NaN light. |
| 2 | 鰭片改為深色陽極金屬＋淺色邊框；熱量集中在根部與徑向熱管，往外迅速變冷（尖端幾乎不亮）。Dark anodised blades with a lighter frame; heat sits at the root and in radial heat pipes and falls off to cold tips. |
| 3 | 太陽改到西南方低角度：行星夜側落在站體後方，出現晨昏線、成簇的沿海城市燈與夜側邊緣一條淡淡的氣輝；雲量變少、雲色去米黃，極冠縮小。Low south-west sun: the night side sits behind the station with the terminator, clustered coastal city lights and a faint airglow line; fewer, less beige clouds. |
| 4 | 隔熱毯皺褶改為低頻、小幅度，材質更粗糙，不再閃爍。Calmer, lower-frequency foil crinkle. |
| 5 | 大廳改為深色玻璃，每 11 m 一道樓板，窗後亮區依區域明暗不一；屋頂設備改為深色。Dark glazing with floor slabs and uneven occupancy; dark roof plant. |
| 6 | 主視角拉近並轉向閘門區；南北各加一組太陽能翼提供大面積量體；拆掉一組造成格線感的連結桁架；每座閘門外加一串「兔子燈」進場燈，把視線帶向深空。Tighter hero camera; two solar wings add large surfaces; one grid-like tie truss removed; approach "rabbit" lights run from each gate into deep space. |
| 7 | 深空側改為從閘門外往回看：前景是閘門，後方是整座站與行星。The deep-space shot now looks back from beyond the gates. |
| 8 | 天線碟面加上淡淡的翡翠色饋源光，充能與發射時變亮；碟緣加一圈維修燈。Faint jade feed glow on the dish that swells while charging, plus rim service lights. |
| 9 | 晶圓層的光改為逐層、隨負載跳動的活動量，加上沿圓周掃過的熱點，顏色依活動量從紫到白。Per-layer compute activity that ticks with load, with hot spots sweeping round. |
| 10 | 閘門平時只剩暗暗的內緣與兩顆沿環奔跑的追逐燈，只有列車或光束通過時才整圈亮起。Idle rings are dim with two running chase lights; they flare only when a train or the beam passes. |
| 11 | bloom 第一層輸入上限降低；信標、進場燈亮度調低。Lower clamp on the first bloom level; dimmer beacons. |
| 12 | 路線圖模式時光束與站內燈號一起變暗；地圖重新置中並完整入鏡。Beam and station lights dim in map mode; the map is re-framed. |
| 13 | 手機只顯示短版聲明；低畫質渲染倍率 0.7 → 0.85。Short credit on phones; low-quality render scale 0.7 → 0.85. |

### 對照 · Before / after

| | 第一輪 Round 1 | 第二輪 Round 2 |
|---|---|---|
| 遠景 Hero | ![](screenshots/round1/01-hero.jpg) | ![](screenshots/round2/01-hero.jpg) |
| 閘門特寫 Gate | ![](screenshots/round1/02-gate.jpg) | ![](screenshots/round2/02-gate.jpg) |
| 算力中心 45% | ![](screenshots/round1/03-core-45.jpg) | ![](screenshots/round2/03-core-45.jpg) |
| 算力中心 130% | ![](screenshots/round1/04-core-130.jpg) | ![](screenshots/round2/04-core-130.jpg) |
| 跟車 Follow | ![](screenshots/round1/05-follow.jpg) | ![](screenshots/round2/05-follow.jpg) |
| 行星側 Planet side | ![](screenshots/round1/06-planet.jpg) | ![](screenshots/round2/06-planet.jpg) |
| 深空側 Deep side | ![](screenshots/round1/07-deep.jpg) | ![](screenshots/round2/07-deep.jpg) |
| 路線圖 Route map | ![](screenshots/round1/08-map.jpg) | ![](screenshots/round2/08-map.jpg) |
| Sango | ![](screenshots/round1/09-sango.jpg) | ![](screenshots/round2/09-sango.jpg) |
| 手機 Mobile | ![](screenshots/round1/10-mobile.jpg) | ![](screenshots/round2/10-mobile.jpg) |

第二輪另附一張 X 線發射中的遠景：[01b-hero-beam.jpg](screenshots/round2/01b-hero-beam.jpg)。
Round 2 also includes the hero view during a transmission: [01b-hero-beam.jpg](screenshots/round2/01b-hero-beam.jpg).

重拍截圖 · Re-render: `node station/tools/shoot.mjs --out station/screenshots/round2 --w 1920 --h 1080 --t 1790000030 --shots "01-hero:hero;02-gate:gate@t=1790000047"`
