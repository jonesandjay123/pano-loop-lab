# STATE.md — current stable state of the repo

> The "you are here" snapshot. Updated by the **Archivist** at the end of a turn.
> For the full rationale and the redefined core problem, see `HANDOFF.md`.
> Last updated: **2026-06-20** (Turn 17 — AXB dashboard, no AI-filled candidates yet).

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

## Current method direction

The active direction is now **AXB prep + candidate selection**:

```
[A right-edge anchor][editable X transition region][B left-edge anchor]
```

`scripts/adapter-prep.mjs` deterministically prepares one inpainting workbench for
every adjacent ordered pair in the loop. This converts the hard adapter problem into
a standard masked-fill input:

- opaque `adapter-work-canvas.png`;
- separate `adapter-mask.png` where black = preserve and white = edit/regenerate;
- narrow A/B edge sockets, not large content blocks;
- later candidate batches can be generated from these inputs and one candidate can be
  chosen as the active adapter.

Default AXB prep geometry:
- `3136 x 1344`;
- `A : X : B = 1 : 12 : 1`;
- anchors `224px` each;
- X transition region `2688px`;
- `32px` overmask into each anchor.

Generated current-loop prep folders:
- `docs/research/experiments/working/006-axb-prep/dawn-valley__dusk-ridge/`
- `docs/research/experiments/working/006-axb-prep/dusk-ridge__moonlit-tidelands/`
- `docs/research/experiments/working/006-axb-prep/moonlit-tidelands__dawn-valley/`

Browser-served copies for the dashboard live under:
- `public/panos/adapter-prep/dawn-valley__dusk-ridge/`
- `public/panos/adapter-prep/dusk-ridge__moonlit-tidelands/`
- `public/panos/adapter-prep/moonlit-tidelands__dawn-valley/`

## Dashboard status

An in-app workbench is available at `/#adapter-workbench`.

It currently supports:
- pair switching for `A->B`, `B->C`, and `C->A`;
- viewing `adapter-work-canvas.png`, `adapter-mask.png`, and anchor crops;
- opening manifest/prompt files;
- showing the active adapter state and candidate count.

It does **not** yet generate images, import generated candidates, or apply a selected
candidate into the pano loop. Candidate lists are intentionally empty until real
AI-filled X outputs are produced.

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
- AXB prep pipeline exists and can generate current-loop prep assets with
  `npm run adapter:prep -- --all`.
- AXB dashboard exists at `/#adapter-workbench`.
- No Codex automations / scheduled jobs configured.
