# STATE.md — current repo state

Last updated: 2026-06-22.

## Current Shape

`pano-loop-lab` is now a browser-local panorama loop workbench.

The old fixed sequence was:

```text
dawn-valley -> AXB -> dusk-ridge -> BXC -> moonlit-tidelands -> CXA
```

It is no longer the runtime source of truth, and the old demo image files have been removed from `public/panos`.

The current runtime is resolved from workbench state:

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
- localStorage auto-save
- scene config export/import with geometry and image checks
- batch download for all generated work adapters
- finished adapter status inventory
- batch download / clear-all for finished adapters
- scene manifest export for external asset handoff

State is local React state backed by `localStorage`. If browser storage quota is exceeded, the workbench asks the user to preserve the scene through config export.

## Asset State

There are no runtime panorama assets checked into `public/panos` now. Production plates and finished adapters enter through browser upload or scene config import.

## Guardrail

Do not bring back legacy seam registries, GPT/HF sweep artifacts, or fixed A/B/C assumptions.

The next useful work is production content:

- generate or import the first real `6144 x 1536` plate set
- run the Photoshop adapter round-trip on that set
