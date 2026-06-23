# STATE.md — current repo state

Last updated: 2026-06-23.

## Current Shape

`pano-loop-lab` 現在是 Jovicheer 的背景環形世界 authoring tool。它仍是 browser-local panorama loop workbench，但輸出方向已收斂為 `world-ring` package，供 `jovicheer-world-stage` consume。

The old fixed sequence was:

```text
dawn-valley -> AXB -> dusk-ridge -> BXC -> moonlit-tidelands -> CXA
```

It is no longer the runtime source of truth, and the old demo image files have been removed from `public/panos`.

目前 preview/runtime 仍由 workbench state resolve：

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

## Geometry

Strict production geometry:

```text
Plate:            6144 x 1536
Work adapter:     6144 x 1536
Finished adapter: 6144 x 1536

m = 1024
left edge  = 1024
X zone     = 4096
right edge = 1024
```

The work adapter is generated deterministically:

```text
from plate right edge + blank X zone + to plate left edge
```

The X zone is intentionally unfinished and should stay visible until Photoshop output replaces it.

## Workbench

`/#adapter-workbench` currently supports:

- adding plates
- replacing plates
- deleting plates while keeping at least 2
- reordering plates
- strict plate dimension validation
- derived pair selection
- generated work adapter preview/download
- finished adapter upload/clear
- runtime fallback between finished and work adapter
- IndexedDB auto-save
- scene config export/import with geometry and image checks
- batch download for all generated work adapters
- finished adapter status inventory
- batch download / clear-all for finished adapters
- scene manifest export for external asset handoff
- world-ring package export for Jovicheer consumer
- small region / adapter metadata editor for the selected pair

State is local React state backed by IndexedDB. This keeps large `6144 x 1536` plate and finished-adapter data across page reloads and dev-server restarts in the same browser origin. Scene config export/import remains the explicit backup and cross-browser handoff path.

## World-ring Package

第一版 schema 已定義在：

```text
src/pano/worldRingPackage.ts
```

它包含：

```text
WorldRingPackage
Region
Adapter
WORLD_RING_GEOMETRY
validateWorldRingPackage
buildWorldRingPackageFromWorkbench
```

production sample manifest 已放在：

```text
public/panos/production/world-ring.json
```

這份 manifest 保留 `regions[]`、`adapters[]` 和 geometry，不把背景壓平成單張圖。Region metadata 目前可承載：

```text
stagingPreset
lightingPreset
particlePreset
ribbonPalette
cameraHints
```

Adapter metadata 目前可承載：

```text
transitionPreset
```

Workbench scene config 中，adapter metadata 存在 `state.adapterMetadata`，不跟 `finishedAdapters` 圖片物件綁死。清除 finished adapter 只會回到 work fallback，不會清掉 transition preset。

`pano-loop-lab` 只保存與匯出這些欄位；不在這裡 render Jovicheer 3D props、lighting、wind 或 particles。

## Asset State

The only checked-in runtime panorama assets should live under `public/panos/production/`. Browser uploads and scene config import remain useful for local experiments.

The first production source plate set is now checked into the repo for handoff/reference:

```text
generated/production-plates/raw/01-plate.png
generated/production-plates/raw/02-plate.png
generated/production-plates/raw/03-plate.png
generated/production-plates/raw/04-plate.png
```

All four source plates are exactly `6144 x 1536`. The contact sheet in `generated/production-plates/contact-sheet-current.png` is for visual review only.

Photoshop-filled full adapter outputs should be stored in:

```text
generated/production-plates/finished-adapters/
```

Those files must also be complete `6144 x 1536` adapter images, not cropped seam-only patches.

The Git-synced runtime preset is:

```text
public/panos/production/scene.json
public/panos/production/world-ring.json
public/panos/production/raw/
public/panos/production/finished-adapters/
```

給 `jovicheer-world-stage` 的明日交接文件：

```text
docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md
```

On a fresh browser/origin, the app loads this preset automatically before falling
back to built-in staging plates.

The first four-plate loop has been proven in the browser with Photoshop-finished adapters. One visible seam still needs manual repair before treating the scene as final art.

## Guardrail

Do not bring back legacy seam registries, GPT/HF sweep artifacts, or fixed A/B/C assumptions.

The next useful work is polish/content QA + consumer integration:

- repair the one visible Photoshop seam artifact
- keep `public/panos/production/world-ring.json` in sync with final production assets
- in `jovicheer-world-stage`, follow `docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md` and consume the package as region/adapter/boundary data
- keep working production sources under `generated/production-plates/`
- keep the Git-synced runtime preset under `public/panos/production/`
