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
- IndexedDB auto-save
- scene config export/import with geometry and image checks
- batch download for all generated work adapters
- finished adapter status inventory
- batch download / clear-all for finished adapters
- scene manifest export for external asset handoff

State is local React state backed by IndexedDB. This keeps large `6144 x 1536` plate and finished-adapter data across page reloads and dev-server restarts in the same browser origin. Scene config export/import remains the explicit backup and cross-browser handoff path.

## Asset State

There are no runtime panorama assets checked into `public/panos` now. Production plates and finished adapters enter through browser upload or scene config import.

The first production source plate set is now checked into the repo for handoff/reference:

```text
generated/production-plates/raw/00-6144x1536.png
generated/production-plates/raw/01-6144x1536.png
generated/production-plates/raw/02-6144x1536.png
generated/production-plates/raw/03-6144x1536.png
```

All four source plates are exactly `6144 x 1536`. The contact sheet in `generated/production-plates/contact-sheet-current.png` is for visual review only.

Photoshop-filled full adapter outputs should be stored in:

```text
generated/production-plates/finished-adapters/
```

Those files must also be complete `6144 x 1536` adapter images, not cropped seam-only patches.

The first four-plate loop has been proven in the browser with Photoshop-finished adapters. One visible seam still needs manual repair before treating the scene as final art.

## Guardrail

Do not bring back legacy seam registries, GPT/HF sweep artifacts, or fixed A/B/C assumptions.

The next useful work is polish/content QA:

- repair the one visible Photoshop seam artifact
- export a workbench scene config once the finished adapters are final
- keep generated production sources under `generated/production-plates/`, not `public/panos`
