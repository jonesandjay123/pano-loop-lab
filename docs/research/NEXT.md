# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = import GPT-filled AXB candidate

### Goal

Use the dashboard-exported AXB inputs with an external image editor/model, then bring
the returned result back into the repo:

> Import one GPT-filled `dawn-valley -> dusk-ridge` AXB result, register it as a
> candidate, and review whether it reduces the internal anchor-to-X band seen in the
> Higgsfield candidates.

### Current base

Dashboard:

`/#adapter-workbench`

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
- Generate review composites if needed.
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
- Run `npm run build`.
