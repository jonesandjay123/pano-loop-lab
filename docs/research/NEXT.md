# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = Test soft composite restore for the ComfyUI inpaint workflow

### Goal

On the same Windows + RTX 5080 ComfyUI setup, answer one narrow question:

> Did the first ComfyUI batch fail because the final `ImageCompositeMasked` used a
> hard mask, creating an internal butt-join between generated pixels and the protected
> right anchor?

Keep the same boundary: `dawn-valley -> dusk-ridge`.

### Why this is next

Turn 13 proved the important technical piece: hard black-mask regions are
pixel-preserved exactly (`max_abs_diff = 0`). But both candidates show a hard vertical
break at the generated-center to right-anchor boundary. That is likely a compositing
recipe problem, not proof that mask-inpaint is the wrong method.

The next smallest test is to keep the **outer anchor edges** exact while feathering or
grading only the **overmask band** before the final composite restore.

### Allowed changes

- Use the existing Turn 13 setup, model, prompts, and seeds as much as possible:
  `sdxl-inpaint-0.1`, `1536 x 640`, steps `30`, CFG `6.5`, `dpmpp_2m` / `karras`,
  denoise `1.0`, ControlNet OFF.
- Create exactly one soft-restore workflow variant, for example:
  - sampler mask stays the existing hard `adapter-mask.png`;
  - final composite mask is feathered/graded across the overmask band;
  - the far-left and far-right outer anchor edge zones remain hard-preserved and must
    still pixel-diff `0`.
- Produce **2** candidates only, e.g.
  `candidates/inpaint-sdxl-soft-01.png` and `inpaint-sdxl-soft-02.png`.
- Save the workflow under `workflows/inpaint-sdxl-soft-restore.json`.
- Add verification artifacts under `review/`, including:
  - outer-anchor pixel diff (`max_abs_diff = 0` required in the protected outer zones);
  - internal weld review composites against Turn 13 hard-mask candidates.
- Append results to `candidates/candidates.md`, update `EXPERIMENT_LOG.md`, update
  `FINDINGS.md` only if there is durable knowledge, and rewrite this `NEXT.md`.

### Forbidden this turn

- Do **not** promote any inpaint candidate into the runtime selector.
- Do **not** switch models, add ControlNet, test Flux, or go native-res yet.
- Do **not** generate more than 2 soft-restore candidates.
- Do **not** refactor renderer/UI or change `src/pano/panoRing.ts`.
- Do **not** claim success unless the review images show the internal vertical break is
  materially reduced at `blend = 0` while outer anchor pixels still diff `0`.

### Required evaluation / stop condition

- If soft restore removes the internal vertical break while keeping outer anchor edges
  exact, mark the method **PROMISING** and plan a native/full-res quality pass.
- If the break remains, mark the soft-restore hypothesis **REJECTED** and plan the next
  single variable: mask width / prompt constraint / ControlNet Tile or Depth, one at a
  time.
- If ComfyUI/model/tooling breaks, record the blocker honestly and stop. A tooling
  blocker is a valid turn result.
