# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Run the ComfyUI mask-inpaint test on the RTX 5080 (Windows)

### Goal

Execute `experiments/working/002-wide-structure-workbench/comfyui-inpaint-plan.md` on
Jones's Windows + RTX 5080 box. Produce the first **anchor-preserved** dawn→dusk adapter
and prove whether it welds at `blend = 0` where Higgsfield whole-frame (c08/c04, verdict
PARTIAL) could not.

This turn runs on the Windows box, not this Mac (M2/8 GB is unfit — see Turn 12).

### Why this is next

Turn 11 showed the only thing missing is **anchor preservation**: keep the real plate
crops, regenerate only the center band. ComfyUI inpaint + the `ImageCompositeMasked`
restore step makes the adapter's edges byte-identical to the plate edges → a `blend = 0`
weld becomes possible. The prep artifacts are already in the right shape.

### Allowed changes

- Follow the plan: SDXL inpaint (Tier B first), round-1 **1536×640**, batch **2–4**,
  ControlNet OFF, params per §5.
- Save outputs to `candidates/inpaint-sdxl-0X.png` and the workflow to
  `workflows/inpaint-sdxl.json`; **append** to `candidates.md`. Do not overwrite the
  Higgsfield `c0X` batch.
- Verify per plan §8: anchor pixel-diff **≈0**, then `blend = 0` butt-join composite vs
  `review/join-c08.jpg` / `join-c04.jpg`.
- Update `EXPERIMENT_LOG.md`; move durable knowledge to `FINDINGS.md`; rewrite `NEXT.md`.

### Forbidden this turn

- Do **not** mass-generate before the weld is verified (2–4 images first).
- Do **not** promote into the selector yet (that is the following Codex turn) beyond, at
  most, registering one verified winner for inspection — never overwrite baseline /
  exp001 / c08 / c04.
- Do **not** refactor the renderer or add UI polish.
- Do **not** claim a weld without the `blend = 0` evidence.

### Required evaluation / stop condition

- 2–4 inpaint candidates with anchor pixel-diff ≈0 and a `blend = 0` verdict on both
  joins, compared honestly against c08/c04.
- If the weld is clean → hand the best to Codex for selector promotion and plan a
  native-res Round 2. If anchors do **not** weld → it is almost certainly mask polarity
  or a missing composite step (plan §4/§8a); fix and re-run.
- "ComfyUI/torch not ready on the 5080" is a valid stop — record the blocker (likely the
  Blackwell cu128 mismatch, plan §0) and the fix, do not fake a result.

---

## Then

A clean weld turns the open question from "can we generate a transition" to "is this
method *repeatable* for an arbitrary pair" — the next probes become: native-res quality
pass, prep-prefill/structure-guide tuning (Turn 9 notes), and testing a second boundary
or a Jovicheer event-scene insert. One boundary per turn.
