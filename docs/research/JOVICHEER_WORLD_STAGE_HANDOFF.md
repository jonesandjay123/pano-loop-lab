# JOVICHEER_WORLD_STAGE_HANDOFF.md

這份檔案是給明天接手 `jovicheer-world-stage` 的 Codex 看。今天不要修改 `jovicheer-world-stage`；這裡只記錄 consume 方向。

## 交接物

`pano-loop-lab` 已經在 `main` 提供第一份 production world-ring manifest：

```text
public/panos/production/world-ring.json
```

它描述目前四區 closed loop：

```text
plate-01 -> adapter 01→02 -> plate-02 -> adapter 02→03
-> plate-03 -> adapter 03→04 -> plate-04 -> adapter 04→01
```

包含：

```text
4 regions
4 adapters
6144 x 1536 plate / adapter geometry
edgeWidth 1024
xWidth 4096
region metadata
adapter transitionPreset metadata
```

## Asset path 規則

`world-ring.json` 裡的 asset paths 是相對於 manifest 所在目錄：

```text
raw/01-plate.png
finished-adapters/01-to-02-finished.png
```

consumer 可以用 manifest URL 做 base resolve：

```ts
new URL(region.plate, manifestUrl).toString()
new URL(adapter.image, manifestUrl).toString()
```

## 最小 consume slice

第一個垂直切片請保持非常小：

1. 在 `jovicheer-world-stage` 加一份 static loader 或直接 fetch 這份 manifest。
2. 驗證：

```text
version === 1
geometry.plateWidth === 6144
geometry.plateHeight === 1536
geometry.adapterWidth === 6144
geometry.adapterHeight === 1536
geometry.edgeWidth === 1024
geometry.xWidth === 4096
regions.length >= 2
adapters 包含每一組 adjacent pair，包含 last -> first
```

3. flatten 成 render sequence：

```text
region[0].plate
adapter region[0] -> region[1]
region[1].plate
adapter region[1] -> region[2]
...
adapter last -> first
```

4. 先只做背景 traverse，不接 wish ritual。
5. 發布 debug telemetry：

```text
__worldX
__activeRegionId
__activeBoundary
__regionT
__boundaryT
```

6. 用 metadata 先掛 debug markers：

```text
region.stagingPreset
region.lightingPreset
region.particlePreset
region.ribbonPalette
adapter.transitionPreset
```

## 建議 runtime mapping

可以把 ring 視為交替的 core / boundary band：

```text
region core width:    自訂 world units
adapter band width:   自訂 world units
```

不要把 `edgeWidth` / `xWidth` 直接當 Three world units。它們是 asset geometry，主要用來理解 adapter 圖像的 source-edge / X-zone / target-edge 結構。world-stage 可以選自己的 world unit 寬度，只要 boundary sampling 保留 region/adapter 身份即可。

## 不要做

- 不要把 `AdapterWorkbench` UI 複製進 `jovicheer-world-stage`。
- 不要讓 `jovicheer-world-stage` 負責 Photoshop round-trip。
- 不要把 package 壓平成一張巨大背景圖。
- 不要在第一切片就接 foreground props、wind、particles、ritual。
- 不要改 `pano-loop-lab` 的 package schema，除非 consumer 真的需要新欄位。

## 第一個驗收點

開啟 world mode 後，能水平 traverse 完整四區 ring，wrap 回第一區，並在 console / Playwright 讀到：

```text
__activeRegionId
__activeBoundary
__regionT
__boundaryT
```

當這個通過，再把 `stagingPreset` / `transitionPreset` 接到 Jovicheer props、lighting、particles。
