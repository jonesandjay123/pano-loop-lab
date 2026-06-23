# pano-loop-lab

`pano-loop-lab` 是 Jovicheer 的背景環形世界 authoring tool，不是通用開源套件，也不是 `jovicheer-world-stage` runtime。

它負責把一組遠景 plates 做成可橫向循環的背景 ring：

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

目前已實測成功：

```text
plates[]
→ work adapters
→ Photoshop finished adapters
→ upload finished
→ 4-region closed loop
```

## Repo 定位

`pano-loop-lab` 做：

- plate 上傳、替換、排序
- 嚴格尺寸驗證
- 自動推導 adjacent pairs
- 自動產生 work adapter
- 接收 Photoshop 手修後的 finished adapter
- finished / work fallback loop preview
- 編輯 region / adapter metadata
- 匯出 scene config 作為備份
- 匯出 world-ring package 給 `jovicheer-world-stage`

`pano-loop-lab` 不做：

- Jovicheer 3D props renderer
- wind / particles / lighting runtime
- camera ritual
- runtime seam 猜測或 blend 遮醜
- 把整個世界壓平成一張巨大背景圖

## 固定 production geometry

這一版不再沿用舊的 `3136 / 523 / 2090` demo 規格。

```text
Plate:            6144 x 1536
Work adapter:     6144 x 1536
Finished adapter: 6144 x 1536

edgeWidth:        1024
xWidth:           4096
ratio:            1 : 4 : 1
```

work adapter 的組成：

```text
from plate 最右 1024px
+ 中間 4096px Photoshop 工作區
+ to plate 最左 1024px
```

finished adapter 也是完整 `6144 x 1536` 圖，不是只輸出中間 X zone。X zone 是手修底稿，未完成時應該誠實顯示，不用 runtime blend 藏起來。

## World-ring package

`jovicheer-world-stage` 之後會 consume 同一套 world-ring schema。它需要知道：

- 目前有哪些 regions
- 每個 region 的 plate asset 是哪一張
- adjacent regions 之間用哪張 adapter
- 目前靠近哪個 boundary
- region / adapter 對應哪些 staging、lighting、particles、ribbon、camera hints

第一版 schema 在：

```text
src/pano/worldRingPackage.ts
```

production manifest 在：

```text
public/panos/production/world-ring.json
```

目前核心結構：

```ts
type WorldRingPackage = {
  id: string;
  version: 1;
  geometry: {
    plateWidth: number;
    plateHeight: number;
    adapterWidth: number;
    adapterHeight: number;
    edgeWidth: number;
    xWidth: number;
  };
  regions: Region[];
  adapters: Adapter[];
};

type Region = {
  id: string;
  label: string;
  plate: string;
  stagingPreset?: string;
  lightingPreset?: string;
  particlePreset?: string;
  ribbonPalette?: string;
  cameraHints?: {
    anchorX?: number;
    preferredLookY?: number;
  };
};

type Adapter = {
  from: string;
  to: string;
  image: string;
  transitionPreset?: string;
};
```

`pano-loop-lab` 只保存、驗證、匯出這些 metadata。它不負責把 presets 真的渲染成 Jovicheer foreground。

工具台右側的 `World metadata` 區可以編輯 selected pair 的 from/to region metadata，以及該 pair 的 `transitionPreset`。scene config 會保存這些欄位；adapter metadata 存在 `state.adapterMetadata`，不依賴 finished adapter 圖片是否存在。

明天給 `jovicheer-world-stage` Codex 的直接交接檔：

```text
docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md
```

## 使用

```bash
npm install
npm run dev
npm run build
```

首頁預覽：

```text
http://localhost:5173/
```

工具台：

```text
http://localhost:5173/#adapter-workbench
```

工具台會自動保存到瀏覽器 IndexedDB。重整頁面或重啟 dev server 後，只要是同一個 browser origin，就會還原目前場景。

「匯出 config」是完整備份，包含圖片資料。「匯出 world-ring」是給 Jovicheer consumer 的 manifest JSON；第一版不打 zip，asset path 會先明確寫在 JSON 裡。

## Production preset

第一組 production source plates：

```text
generated/production-plates/raw/
```

Git 同步用 runtime preset：

```text
public/panos/production/scene.json
public/panos/production/world-ring.json
public/panos/production/raw/
public/panos/production/finished-adapters/
```

新機器 `git pull` 後，如果瀏覽器沒有本機 IndexedDB 場景，app 會自動載入 `public/panos/production/scene.json`。`world-ring.json` 是明天給 `jovicheer-world-stage` consume 的起點。

## 下一步

- 修目前 Photoshop finished adapter 裡的一條可見 seam artifact。
- 讓 `jovicheer-world-stage` 讀 `world-ring.json`，先做 background ring + telemetry。
- 讓 `jovicheer-world-stage` 依照 `docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md` 讀 `world-ring.json`，先做 background ring + telemetry。
