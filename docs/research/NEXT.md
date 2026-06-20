# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = X-only composite contract

### Goal

Fix the failure exposed by Turn 19:

> Can we treat generated AXB outputs as **X-only material**, extract the center X
> region, and deterministically composite it between exact original anchors so the
> outer plate-facing pixels are guaranteed while the internal anchor/X band is
> minimized?

### Why this is next

Turn 19 showed that whole-frame AXB reference candidates make the outer joins look
closer mainly by copying A/B anchor strips, but they move the visible seam inside the
adapter at the anchor-to-X boundary. The next smallest engineering variable is not more
generation; it is a deterministic postprocess contract:

1. start from an AXB candidate;
2. discard or downweight its generated/copy-painted anchor strips;
3. keep only its center X material;
4. composite exact original anchors + X with a controlled soft restore band;
5. measure outer anchor diff = 0.

### Allowed changes

- Implement a small deterministic script for `dawn-valley -> dusk-ridge` only.
- Inputs may be the existing `hf-nb2-axb-01/02` candidates plus the AXB prep
  workbench.
- Output recomposited review candidates under a new working folder.
- Verify exact outer anchors with a JSON diff report.
- Register recomposited candidates in the dashboard only if the mechanics work.

### Forbidden this turn

- Do **not** generate new AI images.
- Do **not** delete or overwrite existing candidates.
- Do **not** claim visual acceptance without `blend = 0` review.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend, routing libraries, Three.js, R3F, GSAP, or canvas.

### Required evaluation / stop condition

- Produce at most 2 recomposited candidates, one from each HF source candidate.
- Prove outer-left and outer-right anchor diff are `0`.
- Inspect whether the internal anchor/X band is reduced versus the raw HF candidates.
- Run `npm run build`.
