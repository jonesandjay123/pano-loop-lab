# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose (see HANDOFF.md and the discussion on goals). One turn answers **one**
> question. The Planner rewrites this file at the end of each turn.

---

## Next turn = Loop 1 — DESIGN ONLY (no images, no code)

### Goal
Design **three concrete adapter-generation experiments** for **one** boundary only:
`dawn-valley → dusk-ridge`. Center on **H1 (pair-specific adapter)**, and include the
**edge-anchored variant** (crop A's right strip + B's left strip, generate the middle).

### Each experiment spec must include
- Hypothesis (which of H1–H4 it tests)
- Input assets needed (which plates / crops / references)
- Generation method + exact prompt strategy (Higgsfield `nano_banana_2`, 21:9, 2k)
- Expected success
- Likely failure mode
- How to evaluate in inspect mode at **`blend = 0`** and **`blend = 16`**
- Whether it supports future insertion of Christmas / Snow / World Cup scenes

### Allowed changes
- Create `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` only
  (use `templates/EXPERIMENT_TEMPLATE.md`).
- Update `EXPERIMENT_LOG.md` (add Turn 1) and rewrite this `NEXT.md` for Loop 2.

### Forbidden this turn
- Do **not** generate any images. Do **not** call image tools.
- Do **not** change runtime behavior or existing assets.
- Do **not** lock plate / seam / socket sizes. Do **not** add libraries.
- Do **not** modify `PanoRingStage`, `DebugPanel`, `panoRing`, or scrolling logic
  (comments-only edits excepted).

### Stop condition
Stop after the experiment spec is written and the log/NEXT are updated. Report files
changed and confirm the diff is docs-only.

---

## Then Loop 2 (preview, do not start yet)
Run **exactly one** of the three designed experiments on `dawn-valley → dusk-ridge`:
add the new adapter as a **comparison asset** (baseline kept), inspect at `blend = 0`,
record the result in `EXPERIMENT_LOG.md`, and stop before touching any other boundary.
