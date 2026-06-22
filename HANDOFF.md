# pano-loop-lab — Workbench Handoff

This repo has moved from a fixed A/B/C demo into a panorama loop staging tool.

## Goal

Build and preview a looping distant background from an ordered list of plates:

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

`/#adapter-workbench` is the control surface. The homepage reads the resolved workbench state.

## Geometry

The old `3136 / 523 / 2090` geometry is obsolete.

```text
Plate:            6144 x 1536
Work adapter:     6144 x 1536
Finished adapter: 6144 x 1536

m = 1024
left edge  = 1024
X zone     = 4096
right edge = 1024
```

Work adapter generation:

```text
from plate right 1024px + blank/manual X zone + to plate left 1024px
```

The X zone is a Photoshop work area. Do not hide it with runtime blending.

## Runtime Behavior

- Plate order derives all adjacent pairs.
- Each pair gets a generated work adapter.
- If a finished adapter is uploaded for a pair, runtime uses it.
- Otherwise runtime uses the generated work adapter fallback.

## Current Implementation Notes

- Workbench state is browser-local React state with IndexedDB auto-save.
- Default plates are generated SVG staging placeholders at the correct aspect.
- Work adapters are generated in-browser with canvas and exposed as PNG object URLs.
- Upload validation rejects images that are not exactly `6144 x 1536`.
- Scene config export/import is available from `/#adapter-workbench` for backup and moving scenes between browsers.
- Imported scene configs are schema, geometry, and image-dimension checked.
- All generated work adapters can be downloaded from the Scene file tools.
- Finished adapters have a round-trip inventory: counts, missing status, batch download, and clear-all.
- Scene manifest export lists plate order, pair order, suggested filenames, and finished/work status.
- Old demo files under `public/panos` have been removed; runtime now depends on built-in staging plates, uploads, and imported scene configs.
- The first production plate set is checked in under `generated/production-plates/raw/`.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Production Plate Set

The current production source plates are:

```text
generated/production-plates/raw/00-6144x1536.png
generated/production-plates/raw/01-6144x1536.png
generated/production-plates/raw/02-6144x1536.png
generated/production-plates/raw/03-6144x1536.png
```

All four are exactly `6144 x 1536`.

`generated/production-plates/contact-sheet-current.png` is only a review sheet. It is not a runtime plate.

Photoshop-filled full adapter images should be stored under:

```text
generated/production-plates/finished-adapters/
```

Use this folder for complete `6144 x 1536` finished adapters, not X-only crops.

## Next Likely Work

- Recheck the one visible Photoshop seam artifact in the browser loop.
- Export a scene config from the workbench after the final finished adapters are settled.
- Add a stricter QA checklist only if the Photoshop round-trip starts producing inconsistent outputs.
