# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = Right-biased mask geometry probe for SDXL inpaint

### Goal

Keep the same boundary (`dawn-valley -> dusk-ridge`) and answer one narrow question:

> Does giving SDXL more right-side inpaint/context room let the generated center cool
> into the dusk anchor, while the final soft composite still preserves the outermost
> plate-facing anchor pixels exactly?

### Why this is next

Turn 15 showed that right-aware prompt text alone is insufficient. The model still
keeps the center/right transition warm and heavy before it meets the cool dusk anchor.
The next smallest variable is mask geometry: widen or bias the regenerate band into the
right overmask area so the model has more room to create a blue-violet dusk transition,
while the final output still hard-preserves the outer right edge.

### Allowed changes

- Use the same official SDXL inpaint baseline:
  `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`, `1536 x 640`, steps `30`, CFG
  `6.5`, `dpmpp_2m` / `karras`, denoise `1.0`, ControlNet OFF.
- Keep `scripts/soft-composite-restore.py` and 64px soft restore for final outputs.
- Change only mask geometry, e.g. create one right-biased mask variant that extends the
  regenerate area farther into the right anchor while leaving the final outer right
  anchor zone hard-preserved and diff `0`.
- Generate **2** candidates only in a new working folder.
- Verify:
  - outer-left and outer-right anchor diff must remain `0`;
  - internal weld review versus `softcomp-02` and `rightaware-02`;
  - visual comparison against Higgsfield c08/c04.

### Forbidden this turn

- Do **not** switch to JuggernautXL, RealVisXL, Flux, Fooocus patch, or ControlNet.
- Do **not** promote any candidate into the selector.
- Do **not** change runtime renderer, selector, or `src/pano/panoRing.ts`.
- Do **not** generate more than 2 candidates.
- Do **not** go native-res yet.

### Required evaluation / stop condition

- If right-biased mask geometry makes the center/right transition materially cooler and
  more dusk-compatible while preserving exact outer anchors, mark the method
  **PROMISING** and plan a selector-promotion review turn.
- If it still fails, record whether the blocker appears to be SDXL model quality or the
  source plate's non-socket-friendly dark right edge, then plan exactly one next
  variable.
