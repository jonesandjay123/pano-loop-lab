# WORLD_RING_PACKAGE.md

這份文件描述 `pano-loop-lab` 匯出的第一版 Jovicheer background ring package。

## 目的

`world-ring` package 不是一張扁平背景圖。它保留 region / adapter / boundary 的可計算結構，讓 `jovicheer-world-stage` 可以知道：

- camera 目前在哪個 region core
- camera 正在靠近哪個 adapter boundary
- foreground props、lighting、particles、ribbon palette 應該跟哪個 region 或 transition preset 對齊
- loop wrap 時最後一個 region 如何回到第一個 region

`pano-loop-lab` 只負責 authoring 和 export。`jovicheer-world-stage` 負責 runtime sampling 和 2.5D / 3D 呈現。

## 固定幾何

```text
plateWidth:       6144
plateHeight:      1536
adapterWidth:     6144
adapterHeight:    1536
edgeWidth:        1024
xWidth:           4096
```

adapter 是完整 `[from edge][X zone][to edge]` 圖：

```text
left 1024px:  from region 的右邊緣
mid 4096px:   Photoshop 手修 transition 區
right 1024px: to region 的左邊緣
```

## Schema

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

實作位置：

```text
src/pano/worldRingPackage.ts
```

目前包含：

- `WorldRingPackage` / `Region` / `Adapter` 型別
- `WORLD_RING_GEOMETRY`
- `validateWorldRingPackage`
- `stringifyWorldRingPackage`
- `buildWorldRingPackageFromWorkbench`

## Production sample

目前 repo 內已有 production manifest：

```text
public/panos/production/world-ring.json
```

asset paths 是相對於 `world-ring.json` 所在資料夾：

```text
raw/01-plate.png
finished-adapters/01-to-02-finished.png
```

之後若要包成 zip，可以保持同一個 schema，只把資料夾整理成：

```text
world-ring-package/
  manifest.json
  plates/
  adapters/
```

## Jovicheer 最小 consume slice

明天 `jovicheer-world-stage` 的第一個垂直切片建議：

1. fetch 或 import `world-ring.json`。
2. 驗證 `version === 1` 與 production geometry。
3. 把 `regions[]` + `adapters[]` flatten 成：

```text
region 0 core
adapter 0→1 boundary band
region 1 core
adapter 1→2 boundary band
...
adapter last→0 boundary band
```

4. 先只渲染遠景背景，不碰 ritual。
5. 發布 telemetry：

```text
__worldX
__activeRegionId
__activeBoundary
__regionT
__boundaryT
```

6. 用 `stagingPreset` / `transitionPreset` 先放 debug markers，再接真正 props、lighting、particles。

## 邊界

不要把 AdapterWorkbench UI 搬進 `jovicheer-world-stage`。不要讓 `pano-loop-lab` 加 3D runtime。兩邊共享 schema 和純函式概念，不共享 Photoshop workbench 操作面板。
