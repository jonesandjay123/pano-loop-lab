# pano-loop-lab 交接

這個 repo 現在是 Jovicheer 的背景環形世界 authoring tool。它負責 plate 排序、work adapter 產出、Photoshop finished adapter 驗證、loop 預覽，以及匯出 `world-ring` package 給 `jovicheer-world-stage` 使用。

它不是 Jovicheer runtime，也不承載 3D props、wind、particles 或 camera ritual。那些行為應該留在 `jovicheer-world-stage`，由那邊讀取同一套 world-ring schema 後自行映射。

## 目前流水線

```text
plates[]
→ derived adjacent pairs
→ generated work adapters
→ Photoshop finished adapters
→ finished / work fallback loop preview
→ world-ring package export
```

目前 production loop 已實測成功：

```text
plate-01 -> adapter 01→02 -> plate-02 -> adapter 02→03
-> plate-03 -> adapter 03→04 -> plate-04 -> adapter 04→01
```

## 固定幾何

舊的 `3136 / 523 / 2090` 規格已淘汰。production geometry 固定為：

```text
Plate:            6144 x 1536
Work adapter:     6144 x 1536
Finished adapter: 6144 x 1536

edgeWidth:        1024
xWidth:           4096
ratio:            1 : 4 : 1
```

work adapter 是完整 `[from right edge][X zone][to left edge]` 圖：

```text
from plate 最右 1024px
+ 中間 4096px Photoshop 工作區
+ to plate 最左 1024px
```

X zone 是手修工作區。不要用 runtime blend 或遮罩把未完成 adapter 藏起來。

## Runtime / preview 行為

- plate order 推導所有 adjacent pairs，包含最後一張回到第一張。
- 每個 pair 都會有 generated work adapter。
- pair 有 finished adapter 時，preview/runtime 使用 finished。
- pair 沒有 finished adapter 時，preview/runtime 使用 work fallback。
- 首頁讀取 resolved workbench state；新瀏覽器沒有 IndexedDB state 時會載入 `public/panos/production/scene.json`。

## World-ring package

Jovicheer consumer 需要的是可計算的 region / adapter / boundary，不是一張壓扁的大背景圖。

第一版 schema 定義在：

```text
src/pano/worldRingPackage.ts
```

production sample manifest 在：

```text
public/panos/production/world-ring.json
```

核心形狀：

```ts
type WorldRingPackage = {
  id: string;
  version: 1;
  geometry: {
    plateWidth: 6144;
    plateHeight: 1536;
    adapterWidth: 6144;
    adapterHeight: 1536;
    edgeWidth: 1024;
    xWidth: 4096;
  };
  regions: Region[];
  adapters: Adapter[];
};
```

`Region` 可以承載 `stagingPreset`、`lightingPreset`、`particlePreset`、`ribbonPalette`、`cameraHints`。`Adapter` 可以承載 `transitionPreset`。

`/#adapter-workbench` 右側有小型 metadata editor，可以直接編輯 selected pair 的 from/to region metadata，以及該 adapter 的 `transitionPreset`。這些資料會存進 scene config，並在匯出 world-ring 時寫進 manifest。

Scene config 裡 region metadata 存在各 plate 上；adapter metadata 獨立存在 `state.adapterMetadata`，不跟 finished adapter 圖片綁死。清除或替換 finished adapter 不會清掉 `transitionPreset`。

`pano-loop-lab` 只保存與匯出這些 metadata；不在這裡 render Jovicheer 的 3D props。

## Production assets

source plates：

```text
generated/production-plates/raw/01-plate.png
generated/production-plates/raw/02-plate.png
generated/production-plates/raw/03-plate.png
generated/production-plates/raw/04-plate.png
```

Git-synced runtime preset：

```text
public/panos/production/scene.json
public/panos/production/world-ring.json
public/panos/production/raw/
public/panos/production/finished-adapters/
```

給 `jovicheer-world-stage` 的明日交接檔在：

```text
docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md
```

Photoshop-filled full adapter 工作檔應放在：

```text
generated/production-plates/finished-adapters/
```

這些檔案必須是完整 `6144 x 1536` adapter，不是 X-only crop。

## Commands

```bash
npm run dev
npm run build
npm run preview
```

每輪完成前要跑：

```bash
npm run build
```

## Guardrails

- 不要改 `jovicheer-world-stage`，除非使用者明確要求。
- 不要把 AdapterWorkbench UI 搬到 Jovicheer runtime。
- 不要在 `pano-loop-lab` 加 Three.js、canvas runtime renderer、GSAP、backend service 或新 library。
- 不要 reintroduce legacy seams、candidate registries、GPT/HF sweeps、固定 A/B/C assumptions。
- 不要把 world package 壓平成一張巨大背景圖。

## 下一步

- 修目前 Photoshop 成品裡那條可見 seam artifact。
- 在 `jovicheer-world-stage` 讀取 `public/panos/production/world-ring.json`，先做背景 ring + telemetry 的最小垂直切片。
- `jovicheer-world-stage` 依照 `docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md` 做第一個 consume slice。
