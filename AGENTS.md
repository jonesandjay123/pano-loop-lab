# AGENTS.md

Read `HANDOFF.md` and `docs/research/STATE.md` before editing.

This repo is a private panorama loop staging tool. Keep it focused and small.

## Do

- Keep the runtime centered on deterministic plate -> adapter -> plate playback.
- Use the new strict geometry:
  - plate: `6144 x 1536`
  - adapter: `6144 x 1536`
  - edge `m`: `1024px`
  - X zone: `4096px`
- Derive adapter pairs from plate order. Do not hardcode A/B/C.
- Let unfinished work adapters stay visible until a finished adapter is uploaded.
- Use browser-only image assembly for work adapters; no backend service is needed.
- Keep README and user-facing repo docs in Chinese.
- Run `npm run build` before claiming done.

## Do Not

- Do not reintroduce legacy seams, candidate registries, GPT/HF sweeps, or bulky working artifacts.
- Do not add Three.js, GSAP, backend services, or new libraries without a specific need.
- Do not auto-resize invalid uploads. Reject images that do not match the strict dimensions.
- Do not hide unfinished adapters with blend tricks.

## Current Runtime

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

Workbench state resolves the ring. Finished adapters override generated work adapters; otherwise runtime falls back to the generated work adapter.
