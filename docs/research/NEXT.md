# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = review `gpt-axb-01-soft256` in the actual loop

### Goal

Decide whether the strict-X soft-adoption result is good enough to become the current
active dawn-to-dusk adapter for demo review:

> Inspect `gpt-axb-01-soft256` in the seam lab / moving loop at `blend = 0`, then either
> promote it as the current best review adapter or keep it partial and move to a true
> mask-inpaint backend.

### Current base

Best strict-X candidate:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft256.png`

Supporting variants:
- `gpt-axb-01-soft64`
- `gpt-axb-01-soft128`
- `gpt-axb-01-xonly`
- raw source `gpt-axb-01`

Review comparisons:
- `docs/research/experiments/working/012-soft-anchor-adoption/dawn-valley__dusk-ridge/review/compare-soft-adoption-internal-boundaries.png`
- `docs/research/experiments/working/012-soft-anchor-adoption/dawn-valley__dusk-ridge/review/compare-soft-adoption-external-joins.png`

Known truth:
- GPT changed the provided A/B anchor pixels.
- `gpt-axb-01-soft256` restores original anchors exactly: left/right outer max diff `0`.
- Only X-region pixels are blended in the strict-X soft-adoption variants.
- `soft256` is the smoothest static review candidate so far, but not yet accepted.

### Allowed changes

- Inspect existing candidates in the app.
- Capture screenshots if useful.
- Update candidate status / active selection based on the inspection.
- If accepted for review, wire `gpt-axb-01-soft256` as the current dawn-to-dusk review
  adapter option without deleting any baseline or older candidate.
- Update research docs and candidate metadata.

### Forbidden this turn

- Do **not** generate new AI images.
- Do **not** add more postprocess variants unless `soft256` has a specific, inspectable
  failure that a single parameter change would test.
- Do **not** delete or overwrite existing candidates.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend, routing libraries, Three.js, R3F, GSAP, or canvas.

### Required evaluation / stop condition

- Inspect `gpt-axb-01-soft256` at `blend = 0`.
- Record whether the remaining issue is acceptable for demo review or still a blocker.
- Run `npm run build`.
