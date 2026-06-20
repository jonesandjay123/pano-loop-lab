# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = import GPT-filled 1:4:1 AXB candidate

### Goal

Bring an externally generated GPT image-edit result back into the repo:

> Import one GPT-filled `dawn-valley -> dusk-ridge` `1:4:1` AXB result, register it
> as a candidate, and test whether X-only / hard-composited anchor adoption reduces
> the internal anchor-to-X band seen in the Higgsfield whole-frame candidates.

### Current base

Dashboard:

`/#adapter-workbench`

Primary prep geometry:
- `3136 x 1344`
- `A : X : B = 1 : 4 : 1`
- anchors `523px` each
- X region `2090px`
- overlap width `523px`

Available prep downloads:
- gradient X canvas
- white X canvas
- black X canvas
- mask

Browser-served variant roots:
- `public/panos/adapter-prep/`
- `public/panos/adapter-prep-white/`
- `public/panos/adapter-prep-black/`

### Allowed changes

- Import one externally generated image if the user provides it.
- Register it under `public/panos/adapter-candidates/dawn-valley__dusk-ridge/`.
- Add it to the dashboard and seam-lab selector for review.
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
