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

- Workbench state is browser-local React state with `localStorage` auto-save.
- Default plates are generated SVG staging placeholders at the correct aspect.
- Work adapters are generated in-browser with canvas and exposed as PNG object URLs.
- Upload validation rejects images that are not exactly `6144 x 1536`.
- Scene config export/import is available from `/#adapter-workbench`.
- Imported scene configs are schema, geometry, and image-dimension checked.
- All generated work adapters can be downloaded from the Scene file tools.
- Finished adapters have a round-trip inventory: counts, missing status, batch download, and clear-all.
- Scene manifest export lists plate order, pair order, suggested filenames, and finished/work status.
- Old demo files under `public/panos` have been removed; runtime now depends on built-in staging plates, uploads, and imported scene configs.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Next Likely Work

- Generate or import the first production-grade `6144 x 1536` plate set.
- Add a final QA checklist if the Photoshop round-trip needs stricter signoff.
