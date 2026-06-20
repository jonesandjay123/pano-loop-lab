# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = adapter candidate dashboard/design slice

### Goal

Build the smallest useful management layer for the new AXB workflow:

> Given one adjacent pair such as `dawn-valley -> dusk-ridge`, how should the repo
> represent generated candidate adapters, pick one active candidate, and make that
> choice visible/editable without replacing baselines?

This follows the new working direction from `new_plan.md`: generate many `A X B`
candidate outputs later, then choose which one becomes the active `A->B` transition.

### Current base

Turn 16 created deterministic AXB prep assets for the full current loop under:

`docs/research/experiments/working/006-axb-prep/`

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

- Design or implement a minimal candidate/adoption data contract for generated AXB
  results.
- Prefer a simple JSON registry before UI complexity.
- If implementing UI, keep it static/minimal and repo-local; do **not** add backend,
  routing libraries, or heavy dependencies.
- Keep the existing pano renderer intact unless reading the registry requires a very
  small, explicit selector change.
- Keep baselines and all old adapter variants.

### Forbidden this turn

- Do **not** call an image-generation backend.
- Do **not** delete or overwrite existing adapters.
- Do **not** generate more candidate images.
- Do **not** add Three.js / R3F / GSAP / canvas / backend / new libraries.
- Do **not** lock global plate/seam/socket sizing beyond the AXB prep-canvas defaults.

### Required evaluation / stop condition

- The repo should have a clear answer for:
  - where candidate images for each `A->B` pair live;
  - how 10 generated candidates would be registered;
  - how one candidate is marked active;
  - how the active candidate would be applied to the pano loop without deleting the
    baseline.
- Run `npm run build`.
