# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = import the provided GPT-filled AXB image

### Goal

Use the new import path on a real external result:

> Given a GPT-filled `dawn-valley -> dusk-ridge` `1:4:1` AXB image path from the
> user, import it as a candidate, verify it appears in the dashboard and seam-lab
> selector, then decide whether to run X-only / hard-composited anchor adoption.

### Current base

Import command shape:

```bash
npm run adapter:import -- \
  --source /absolute/path/to/gpt-result.png \
  --id gpt-axb-01 \
  --label "GPT AXB 01"
```

Primary prep geometry:
- `3136 x 1344`
- `A : X : B = 1 : 4 : 1`
- anchors `523px` each
- X region `2090px`
- overlap width `523px`

### Allowed changes

- Import one externally generated image if the user provides it.
- Register it under `public/panos/adapter-candidates/dawn-valley__dusk-ridge/`.
- Add it to the generated candidate registry, dashboard, and seam-lab selector.
- If useful, produce an X-only / hard-composited variant that restores exact original
  anchors according to the `placementContract` in the prep manifest.
- Keep all existing candidates and baselines.

### Forbidden this turn

- Do **not** delete or overwrite existing candidates.
- Do **not** generate more Higgsfield whole-frame candidates.
- Do **not** claim pixel preservation unless verified by exact diff.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend, routing libraries, Three.js, R3F, GSAP, or canvas.

### Required evaluation / stop condition

- The imported candidate appears in the dashboard.
- The imported candidate appears in the seam-lab `dawn->dusk` selector.
- If an exact-anchor composite is created, outer-anchor diff must be reported.
- Run `npm run build`.
