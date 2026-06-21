# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = strict mask-inpaint backend capability probe

### Goal

Stop asking general image-edit models to protect A/B anchors by prompt. Find or test a
backend path that can obey the actual AXB contract:

> Given `adapter-work-canvas.png` and `adapter-mask.png`, regenerate only white mask
> pixels and preserve black mask pixels exactly.

### Current base

Current best candidate:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft256.png`

Current verdict:
- `gpt-axb-01-soft256` is placement-safe and active for review.
- Outer anchors diff = `0`.
- It is still not final because the internal X-B tonal step remains visible at
  `blend = 0`.

Sweep already done:
- feather widths: `128`, `192`, `256`, `384`, `512`;
- curves: `linear`, `smoothstep`, `cosine`;
- all preserve anchors;
- no variant clearly beats `soft256`.

Review summary:
- `docs/research/experiments/working/012-soft-anchor-adoption/dawn-valley__dusk-ridge/review/strict-x-sweep-summary.json`

### Allowed changes

- Inspect available local / CLI / API generation backends for true mask-inpaint
  support.
- Add a small backend capability note under `docs/research/experiments/working/`.
- If a backend can be called non-interactively and supports real masks, run one small
  dawn-to-dusk probe using the existing AXB work canvas and mask.
- Verify black-mask / preserved-region diff numerically.
- Register a generated candidate only if preserved-region diff is reported.

### Forbidden this turn

- Do **not** run more generic GPT / whole-image reference generations as final
  candidates.
- Do **not** do another soft-adoption parameter sweep.
- Do **not** treat red/green/blue frame prompting as a strict-mask solution.
- Do **not** delete or overwrite existing candidates.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend infrastructure unless a minimal probe proves the backend can
  preserve mask-black pixels.

### Required evaluation / stop condition

- Answer whether a strict mask-inpaint backend is available in the current environment.
- If tested, report preserved-region max diff.
- If no backend is available, record that honestly and list the minimal backend
  contract needed next.
- Run `npm run build` if code or generated registry changes.
