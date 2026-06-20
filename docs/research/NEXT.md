# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = generate/import first AXB candidate batch

### Goal

Use the AXB dashboard and prep assets to produce the first real candidate batch for
one boundary:

> For `dawn-valley -> dusk-ridge`, generate or import a small set of AI-filled X
> outputs, register them as candidates, and make them selectable in the workbench
> without deleting any baseline.

This follows the new working direction from `new_plan.md`: generate many `A X B`
candidate outputs, then choose which one becomes the active `A->B` transition.

### Current base

Turn 16 created deterministic AXB prep assets for the full current loop under:

`docs/research/experiments/working/006-axb-prep/`

Turn 17 added an in-app dashboard at:

`/#adapter-workbench`

The dashboard reads browser-served copies under:

`public/panos/adapter-prep/`

Each pair has:
- `adapter-work-canvas.png`
- `adapter-mask.png`
- left/right anchor crops
- prompt files
- `manifest.json`

Default geometry:
- `3136 x 1344`
- `A : X : B = 1 : 12 : 1`
- anchors `224px` each
- X region `2688px`
- mask black = preserve, white = edit/regenerate

### Allowed changes

- Use one boundary only: `dawn-valley -> dusk-ridge`.
- Generate or import a small candidate set only if a generation backend/tool is
  explicitly available in the session.
- If generation is not available, implement the import/registration path only and stop.
- Register candidates without replacing baselines.
- Keep the existing pano renderer intact unless reading the candidate registry requires
  a very small, explicit selector change.
- Keep baselines and all old adapter variants.

### Forbidden this turn

- Do **not** delete or overwrite existing adapters.
- Do **not** generate more than 10 candidates.
- Do **not** add Three.js / R3F / GSAP / canvas / backend / new libraries.
- Do **not** lock global plate/seam/socket sizing beyond the AXB prep-canvas defaults.

### Required evaluation / stop condition

- The repo should have real candidate files or a working import path for them.
- The dashboard should show candidate thumbnails/counts for `dawn-valley -> dusk-ridge`.
- It should be clear how one candidate becomes active.
- Run `npm run build`.
