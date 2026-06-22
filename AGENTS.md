# AGENTS.md

Read `HANDOFF.md` and `docs/research/STATE.md` before editing.

This repo is now a clean AXB loop prototype. Keep it small.

## Do

- Keep runtime assets under `public/panos` limited to plates and clean adapters.
- Use full `[A][X][B]` adapter images with `523px` anchor overlap.
- Keep the homepage honest: unfinished work canvases should look unfinished.
- Run `npm run build` before claiming done.

## Do Not

- Do not reintroduce legacy seams, candidate registries, GPT/HF sweeps, or bulky
  working artifacts.
- Do not add Three.js, canvas, GSAP, backend services, or new libraries.
- Do not hide unfinished adapters with blend tricks.

## Current Runtime

```text
A plate -> AXB -> B plate -> BXC -> C plate -> CXA -> A plate
```

Only AXB has a completed manual Photoshop result right now.
