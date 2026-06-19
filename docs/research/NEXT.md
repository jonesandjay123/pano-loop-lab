# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Promote exp002 candidate(s) into the selector + honest inspect

### Goal

Turn 9 generated a first Higgsfield candidate batch for `dawn-valley -> dusk-ridge`
(8 images under `experiments/working/002-wide-structure-workbench/candidates/`, with
verdicts in `candidates.md`). Now promote the top candidate(s) into the adapter
comparison selector and **inspect honestly** to decide whether any actually welds.

This is a renderer/registration turn — a natural hand-off to **Codex**.

### Why this is next

The candidates look like good standalone panoramas, but Higgsfield ran whole-frame
image-to-image with **no mask**, so the anchors were **repainted, not pixel-preserved**.
Whether a candidate truly joins the real plates is unproven until inspected at
`blend = 0` (the honest butt-join). That inspection is the actual H1 test.

### Allowed changes

- Promote **c08** (`candidates/c08-struct-off-leftpreserve.png`) and optionally **c04**
  (`candidates/c04-struct-off-orig.png`) into the renderer as **new selectable
  comparison variants** under:

  ```text
  public/panos/adapters/dawn-valley__dusk-ridge/
    exp002-c08-struct-off-leftpreserve.jpg
    exp002-c04-struct-off-orig.jpg
  ```

  Register them in the existing adapter selector/registry **alongside** the baseline
  and `exp001-edge-anchored-v1` — never overwrite either.
- Inspect both joins — `dawn-valley -> adapter` and `adapter -> dusk-ridge` — at
  `blend = 0` and `blend = 16`, and record the verdict.
- Update `EXPERIMENT_LOG.md`; move any durable conclusion to `FINDINGS.md`; rewrite
  `NEXT.md` for the turn after.

### Forbidden this turn

- Do **not** overwrite or delete the baseline or `exp001`.
- Do **not** generate new candidates (that was this turn) or call a backend.
- Do **not** refactor the renderer, add Pixi/Three/R3F/GSAP/canvas runtime, or do UI
  polish.
- Do **not** lock plate/seam/socket widths.
- Do **not** claim the adapter problem is solved on a pretty thumbnail — the
  `blend = 0` join is the verdict, not the standalone image.

### Required evaluation / stop condition

- c08 (+ optionally c04) selectable next to baseline and exp001 without code swaps.
- A clear written verdict per join at `blend = 0` / `blend = 16`: does the repainted
  anchor actually meet the real plate, or is there a visible seam / tonal / structural
  break?
- `npm run build` passes.
- Stop after promotion + inspection + log. "All candidates fail at blend = 0" is a
  valid, loggable result.

---

## Then

If a candidate welds acceptably, the following turn can (a) feed the accepted
direction back into the prep script (e.g. swap the flat-grey prefill for edge-pad to
kill the grey-echo failures, and de-emphasize the structure-guide), or (b) test the
workbench on a second boundary to see whether the method transfers. One boundary per
turn. If nothing welds, the next turn reconsiders whether a true inpaint backend
(A1111/ComfyUI) is needed to preserve anchors, since Higgsfield cannot mask.
