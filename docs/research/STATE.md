# STATE.md — current stable state of the repo

> The "you are here" snapshot. Updated by the **Archivist** at the end of a turn.
> For the full rationale and the redefined core problem, see `HANDOFF.md`.
> Last updated: **2026-06-16** (Loop 0 — scaffolding only, no runtime change).

## Stack
Vite + React 18 + TypeScript + plain CSS. **No** Three.js / R3F / GSAP / canvas /
routing / backend. `npm run build` passes, TS clean.

## What is built and STABLE (do not rebuild)
- **N-plate + N-seam ring model** — `buildRingSegments()` assembles
  `[plate0, seam0→1, plate1, …, seamN-1→0]` for any N.
  Files: `src/pano/panoTypes.ts`, `src/pano/panoRing.ts`.
- **Continuous infinite loop** — sequence rendered twice; `usePanoRingScroll`
  drives `translate3d` via rAF with modulo-wrapped offset (seamless both ways).
- **Manual drag scrub + auto-scroll**, sharing one offset (no jump on hand-off).
- **Seam inspection lab** (`PanoRingStage.tsx` + `DebugPanel.tsx`):
  - `blend` 0 / 8 / 12 / 16 vw overlap + CSS-mask feather.
    **`blend = 0` butt-joins to reveal the REAL seam** — debug stays honest.
  - Per-segment knobs: `fitMode` (cover/height/width), `scale`, `xOffset`, `yOffset`
    (image layer overscanned 6%).
  - **Inspect mode**: center / hold / highlight (magenta) any boundary; toggle
    labels/lines; pause.

## Assets (`public/panos/`)
- 3 plates: `dawn-valley.jpg`, `dusk-ridge.jpg`, `moonlit-tidelands.jpg`.
- 3 seams (adapters): `seams/<fromId>__<toId>.jpg`.
- All generated with **Higgsfield `nano_banana_2`, 21:9, 2k**, feeding the two
  adjacent plates as `medias` (role `image`).

## Known truth from the inspection lab
CSS overlap + feather hides most **tonal / hard-line** mismatch on these soft
atmospheric mattes (~70%). It does **NOT** fix **structural** mismatch (a lake
meeting a mountain across the join only softens into haze). CSS is auxiliary.

## Deliberately undecided (do not lock)
Fixed plate / seam / socket widths. Plates should stay generously wide; sizing is
revisited only **after** a generation/transition method works. See HANDOFF.md §3.

## Loop infrastructure status
- Memory: `docs/research/` created (STATE, FINDINGS, EXPERIMENT_LOG, NEXT, ROLES,
  templates/EXPERIMENT_TEMPLATE). `AGENTS.md` created at repo root.
- No experiments run yet. No Codex automations / scheduled jobs configured.
