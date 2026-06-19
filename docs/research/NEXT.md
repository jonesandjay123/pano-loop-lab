# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = SDXL inpaint content-guidance probe with proven soft restore

### Goal

Keep the same boundary (`dawn-valley -> dusk-ridge`) and answer one narrow question:

> If the outer anchors stay pixel-exact and the final restore uses the proven 64px
> soft composite, can a more right-aware SDXL inpaint prompt/mask recipe make the
> generated center become a believable dusk-facing bridge?

### Why this is next

Turn 14 showed that soft composite restore reduces the hard vertical artifact from
Turn 13 while preserving outer anchors exactly. The remaining failure is content:
the generated center stays too warm/heavy and does not transition into the cool dusk
anchor. Do not switch models yet; first test whether the baseline SDXL inpaint can be
guided better under the same mechanics.

### Allowed changes

- Use the same model and environment: ComfyUI, `sdxl-inpaint-0.1`, `1536 x 640`,
  steps `30`, CFG `6.5`, `dpmpp_2m` / `karras`, denoise `1.0`, ControlNet OFF.
- Keep the Turn 14 soft restore recipe, with `64px` feather as the default final
  composite.
- Change only one content-guidance variable, such as:
  - a right-aware prompt that explicitly cools the generated center as it approaches
    the dusk anchor, avoids warm vertical walls, and asks for low mist / receding
    blue-violet ridges on the right; or
  - a minimally adjusted inpaint mask that gives the right overmask band more room
    while preserving the outermost right anchor exactly.
- Produce **2** candidates only in a new working folder, e.g.
  `docs/research/experiments/working/005-sdxl-content-guidance/`.
- Verify:
  - outer-left and outer-right anchor diff must remain `0`;
  - internal weld review versus `softcomp-02` and Turn 13 hard restore;
  - visual comparison against Higgsfield c08/c04.
- Update `EXPERIMENT_LOG.md`, `NEXT.md`, and `FINDINGS.md` only if durable knowledge
  emerges.

### Forbidden this turn

- Do **not** switch to JuggernautXL, RealVisXL, Flux, Fooocus patch, or ControlNet.
- Do **not** promote any candidate into the selector.
- Do **not** change runtime renderer, selector, or `src/pano/panoRing.ts`.
- Do **not** generate more than 2 candidates.
- Do **not** go native-res yet.

### Required evaluation / stop condition

- If content guidance makes the center/right transition materially more dusk-facing
  while preserving exact outer anchors, mark the method **PROMISING** and plan a
  selector-promotion review turn.
- If it still fails, record whether the blocker appears to be SDXL model quality,
  mask geometry, or the source plate's non-socket-friendly dark right edge, then plan
  exactly one next variable.
