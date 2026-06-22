# STATE.md — current repo state

Last updated: 2026-06-22.

## Current Shape

`pano-loop-lab` is now a browser-local panorama loop workbench.

The old fixed sequence:

```text
dawn-valley -> AXB -> dusk-ridge -> BXC -> moonlit-tidelands -> CXA
```

is no longer the runtime source of truth.

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

State is local React state backed by `localStorage`. If browser storage quota is exceeded, the workbench asks the user to preserve the scene through config export.

## Guardrail

Do not bring back legacy seam registries, GPT/HF sweep artifacts, or fixed A/B/C assumptions.

The next useful work is packaging and cleanup:

- batch work adapter download
- cleanup of old `public/panos` assets after replacement plates exist
