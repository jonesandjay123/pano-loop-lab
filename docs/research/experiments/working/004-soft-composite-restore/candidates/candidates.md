# 004 soft composite restore candidates

Generated: 2026-06-19 (Turn 14, Codex as Runner).
Backend/model pixels: Turn 13 ComfyUI SDXL inpaint outputs; no new model and no selector promotion.
Postprocess: deterministic Pillow composite at 1536 x 640.

## Strategy

- Outer anchors: hard preserve from `adapter-work-canvas.png` outside the original hard mask white region.
- Feather zones: smoothstep alpha ramp inside the original hard mask boundaries.
- Center: generated pixels from the Turn 13 SDXL inpaint candidate.

## Candidates

| id | source | seed | feather | outer-left diff | outer-right diff | verdict |
|---|---|---:|---:|---:|---:|---|
| softcomp-01 | `inpaint-sdxl-02.png` | 42424202 | 32px | 0 | 0 | PARTIAL diagnostic: hard white seam reduced, but right-side warm-to-blue transition remains abrupt. |
| softcomp-02 | `inpaint-sdxl-02.png` | 42424202 | 64px | 0 | 0 | BEST diagnostic: strongest balance; hard composite artifact reduced without over-erasing the center. |
| softcomp-03 | `inpaint-sdxl-02.png` | 42424202 | 96px | 0 | 0 | PARTIAL: slightly smoother than 64px, but starts to flatten the generated/right-anchor transition. |
| softcomp-04 | `inpaint-sdxl-01.png` | 42424201 | 64px | 0 | 0 | REJECT: inherits seed 42424201's oversized dark central mountain mass. |

## Review artifacts

- `../review/softcomp-anchor-diff.json`
- `../review/softcomp-*-internal-weld.jpg`
- `../review/softcomp-*-external-left-join.jpg`
- `../review/softcomp-*-external-right-join.jpg`
- `../review/join-softcomp-*.jpg`
- `../review/compare-softcomp-vs-hard-c08-c04.jpg`

## Verdict

All variants preserve outer-left and outer-right anchor zones exactly (`max_abs_diff = 0`).

Soft composite **does improve** the specific Turn 13 artifact: the bright vertical hard
restore stripe at the generated-center/right-anchor boundary is materially reduced,
especially in `softcomp-02` and `softcomp-03`.

This is still **not selector-ready**. The remaining problem is no longer primarily the
final composite mask; it is the SDXL inpaint content and color/world transition itself.
The generated center stays warm and heavy, then fades into the cool dusk anchor instead
of becoming a believable dusk-facing bridge. Compared with Higgsfield c08/c04, the
softcomp candidates are more mechanically reliable at the outer pixel weld, but less
convincing as standalone transition worlds.

Keep `softcomp-02` and `softcomp-03` as diagnostic references. Do not promote this batch.
