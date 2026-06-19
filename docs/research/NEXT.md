# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Visual verdict for promoted exp002 candidates

### Goal

Review the promoted `dawn-valley -> dusk-ridge` selector variants:

```text
exp002 c08 left-preserve
exp002 c04 original
```

Decide whether either candidate is genuinely better than the existing `baseline`
and `exp001 edge-anchored` options when inspected in the runtime lab.

### Why this is next

Turn 10 only promoted c08/c04 into the existing selector. It did **not** judge visual
quality.

Turn 9's Higgsfield batch produced plausible standalone panoramas, but Higgsfield
had **no mask inpaint input**. The candidates are whole-frame image-to-image
outputs; their anchor regions are repainted, not pixel-preserved. A thumbnail or
standalone image is not enough. The real verdict must come from the join against
the actual neighboring plates at `blend = 0`.

### Allowed changes

- Use the existing runtime selector to compare exactly these options:
  - `baseline`
  - `exp001 edge-anchored`
  - `exp002 c08 left-preserve`
  - `exp002 c04 original`
- Inspect both joins for c08 and c04:
  - `dawn-valley -> adapter`
  - `adapter -> dusk-ridge`
- Inspect each candidate at:
  - `blend = 0` for the honest butt-join;
  - `blend = 16` to understand how much feathering helps.
- Record a verdict in `EXPERIMENT_LOG.md`:
  - ACCEPT, REJECT, or INCONCLUSIVE for c08;
  - ACCEPT, REJECT, or INCONCLUSIVE for c04;
  - whether either is actually better than baseline / exp001 at each endpoint.
- Update `FINDINGS.md` only if the inspection creates durable knowledge.
- Rewrite `NEXT.md` for the following turn.

### Forbidden this turn

- Do **not** generate new candidates.
- Do **not** call Higgsfield, A1111, ComfyUI, or any backend.
- Do **not** add the other six Turn 9 candidates to the selector.
- Do **not** change runtime renderer architecture.
- Do **not** add UI polish.
- Do **not** change blend / inspect behavior.
- Do **not** overwrite or remove `baseline`, `exp001`, c08, or c04.
- Do **not** claim the adapter problem is solved unless the `blend = 0` joins
  genuinely support that claim.

### Required evaluation / stop condition

- A clear visual-verdict log for c08 and c04.
- The verdict must explicitly discuss both endpoints:
  - `dawn -> adapter`
  - `adapter -> dusk`
- The verdict must explicitly separate `blend = 0` truth from `blend = 16` feathered
  plausibility.
- The verdict must acknowledge that Higgsfield did not mask-preserve anchors.
- `npm run build` should pass if any code/docs are changed.
- Stop after the visual verdict and research-log update.

---

## Then

If c08 or c04 is accepted or strongly promising, the following turn can decide the
smallest next method step: improve prep prefill, test another boundary, or try a true
inpaint backend for pixel-preserved anchors. If both fail at `blend = 0`, the next
turn should consider whether A1111/ComfyUI-style mask inpainting is required before
more Higgsfield whole-frame candidates are useful.
