# exp002 candidates — dawn-valley → dusk-ridge (Higgsfield, first batch)

Generated: 2026-06-18 (Loop Turn 9, Opus as Runner).
Backend: **Higgsfield MCP**, model **nano_banana_2** (requested `nano_banana_pro`;
the MCP routed/ran the job as `nano_banana_2` — recorded as-run).
Output: `2k`, aspect `21:9`, `3168 x 1344`. Cost: 2 credits/image, 16 credits total.

## Inputs used (from the reviewed prep contract)

| Artifact | Higgsfield media_id | How it was used |
|---|---|---|
| `adapter-work-canvas.png` | `65c67848-f28d-413d-8e01-63f8928f08fe` | Primary `image` reference (image-to-image layout). |
| `structure-guide.png` | `5c934487-c915-4ebb-889c-8f3a1aa11014` | Second `image` reference, **only for structure-ON variants**. |
| `prompt.txt` | — | Adapted into the image-to-image prompt (original variant). |
| `negative-prompt.txt` | — | Folded into the prompt as an `Avoid: ...` clause (see fallback below). |
| `adapter-mask.png` | — | **NOT usable** — see fallback below. |

## Higgsfield / MCP limitations + fallbacks (honest record)

1. **No inpaint mask input.** Higgsfield image models accept only `medias` with role
   `image` (reference images); there is **no mask / inpaint-region parameter**. So
   `adapter-mask.png` could not be applied. Consequence: the model performs
   **image-to-image over the whole frame** and does **not** pixel-preserve the anchor
   crops. Variant axis #2 (mask original vs narrow) was therefore **not executable**
   with this backend and was dropped — it would require an inpaint backend
   (A1111 / ComfyUI) and is out of scope this turn.
2. **No separate negative-prompt field.** `negative-prompt.txt` was inlined into the
   main prompt as `Avoid: ...`.
3. **Anchors are repainted, not preserved.** Because there is no mask, the left/right
   edges of each candidate are *stylistically compatible* with the plates but are not
   the real plate pixels. Whether they truly weld at `blend = 0` against
   `dawn-valley` / `dusk-ridge` is **unverified** and is exactly the next turn's job.
4. **No seed exposed.** The MCP response did not return a seed; re-rolls within a
   config differ stochastically (see the grey-artifact failures below).

## Variant axes actually tested

- **Axis 1 — structure-guide ON vs OFF** (ON = pass `structure-guide.png` as a 2nd reference).
- **Axis 3 — prompt: original (`prompt.txt`) vs left-preserve-strong** (adds an explicit
  "left third stays open / airy / low-contrast, no dark mass, no hard ridge" clause,
  plus "fill whole frame, no gray bars/letterbox").
- (Axis 2 — mask width — not executable, see limitation #1.)

2 configs per axis-pair × 2 seeds = 8 candidates.

## Candidates

| id | file | struct-guide | prompt | job id | verdict |
|---|---|---|---|---|---|
| c01 | `c01-struct-on-orig.png` | ON | original | `bdda441b` | ❌ grey letterbox bars top/bottom |
| c02 | `c02-struct-on-orig.png` | ON | original | `52148b56` | ✅ strong — clean full-frame panorama |
| c03 | `c03-struct-off-orig.png` | OFF | original | `7f639a5f` | ❌ grey vertical column in center |
| c04 | `c04-struct-off-orig.png` | OFF | original | `e05d3375` | ✅ strong — clean full-frame panorama |
| c05 | `c05-struct-on-leftpreserve.png` | ON | left-preserve | `d7cc7139` | ✅ good — airy left, clean |
| c06 | `c06-struct-on-leftpreserve.png` | ON | left-preserve | `6a5d6029` | ❌ worst — echoed the structure-guide (abstract blobs, no real scene) |
| c07 | `c07-struct-off-leftpreserve.png` | OFF | left-preserve | `8b7e3567` | 🟡 weak — residual harder vertical transition center→right |
| c08 | `c08-struct-off-leftpreserve.png` | OFF | left-preserve | `b978db57` | ✅ best — airy low-contrast left, soft layered mist, fully coherent |

## Per-criterion observations (on the non-failed candidates c02/c04/c05/c08)

- **dawn → adapter (left side):** natural. Warm low sun + soft haze; the left third
  reads as an open dawn valley. The **exp001 failure (large dark mountain / dark value
  mass on the left) did NOT recur** in any good candidate. The left-preserve prompt
  (c05, c08) makes the left visibly airier/lower-contrast.
- **adapter → dusk (right side):** mostly natural; cooler blue/violet ridges emerge on
  the right. c07 is the exception — a slightly hard center→right transition.
- **hard structure jump:** none in c02/c04/c05/c08 (one continuous horizon).
- **lake/ridge/horizon mismatch:** no obvious lake-vs-mountain collision; single
  coherent horizon edge to edge.
- **grey artifacts:** c01 (letterbox) and c03 (center column) show the model echoing
  the work-canvas's flat grey prefill. This is **stochastic** (seed-dependent), not a
  clean function of the structure-guide.

## Preliminary selection

- **Promote next turn (top 2):** **c08** (struct-off + left-preserve — softest, airiest,
  cleanest) and **c04** (struct-off + original — clean, slightly more defined ridges).
  Both are struct-OFF (the more reliable axis), full-frame, artifact-free, no left dark mass.
- **Alternates:** c02 and c05 (both strong but struct-ON, the riskier axis).
- **Reject:** c01, c03 (grey artifacts), c06 (guide echo), c07 (hard center→right).

## Notes for the prep tooling (feedback, not done this turn)

- The **flat grey edge-color-gradient prefill leaks** into some img2img seeds (grey
  bars/column). A future prep-script tweak could use an `edge-pad` / mirror / noise
  prefill instead of a flat grey gradient so the unknown center is less likely to be
  reproduced literally.
- **structure-guide as an image reference is risky** for this backend: 2 of its 4
  outputs failed (letterbox, guide-echo) and it produced nothing the struct-OFF runs
  didn't. Prefer struct-OFF, or use the guide only as a very weak influence.

This batch does NOT accept any adapter visually. Acceptance requires the next turn:
promote c08 (+ c04) into the selector as new comparison variants (never overwriting
baseline / exp001) and inspect both joins at `blend = 0` and `blend = 16`.

---

# ComfyUI inpaint batch 1 - SDXL diffusers inpaint, hard composite restore

Generated: 2026-06-19 (Turn 13, Codex as Runner) on Jones's Windows PC.
Backend: **ComfyUI 0.25.0**, RTX 5080, torch **2.11.0+cu128**, CUDA 12.8.
Model: `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`, fp16 diffusers subset
downloaded to `ComfyUI/models/diffusers/sdxl-inpaint-0.1`.
UNet SHA256: `6470840731E98CC16713DDF3AC7EE458C9FDBCB881A98C6727CD4A938F227D3F`.

## Workflow / parameters

- Workflow: `../workflows/inpaint-sdxl.json` (ComfyUI API prompt format).
- Init image: `adapter-work-canvas.png`.
- Mask: `adapter-mask.png` (white = regenerate, black = preserve), downscaled with
  nearest-neighbor.
- Resolution: `1536 x 640`.
- ControlNet / structure guide: OFF.
- Denoise: `1.0`.
- Steps: `30`.
- Sampler / scheduler: `dpmpp_2m` / `karras`.
- CFG: `6.5`.
- Composite anchor restore: yes, `ImageCompositeMasked` with the hard inpaint mask.
- Prompt version: `prompt.txt` from this folder.
- Negative prompt version: `negative-prompt.txt` from this folder.

## Candidates

| id | file | seed | anchor diff | visual verdict |
|---|---|---:|---|---|
| inpaint-sdxl-01 | `inpaint-sdxl-01.png` | `42424201` | PASS: preserved-mask max diff `0` | REJECT / diagnostic: heavy dark mountain mass; hard vertical value break into right anchor. |
| inpaint-sdxl-02 | `inpaint-sdxl-02.png` | `42424202` | PASS: preserved-mask max diff `0` | PARTIAL / diagnostic: less extreme structure than 01, but still a hard right-side value break. |

Anchor preservation report:
`../review/inpaint-sdxl-anchor-diff.json`.

Review composites:

- `../review/inpaint-sdxl-01-internal-weld.jpg`
- `../review/inpaint-sdxl-02-internal-weld.jpg`
- `../review/inpaint-sdxl-01-external-left-join.jpg`
- `../review/inpaint-sdxl-01-external-right-join.jpg`
- `../review/inpaint-sdxl-02-external-left-join.jpg`
- `../review/inpaint-sdxl-02-external-right-join.jpg`

## Honest result

The **anchor-preservation mechanism works**: both candidates have byte-identical RGB
values wherever the downscaled hard mask is black (`changed_values = 0`, `max diff = 0`).
This confirms ComfyUI + `ImageCompositeMasked` can protect the real anchor pixels.

However, the first hard-composite workflow does **not** visually solve the adapter.
Both candidates expose a strong internal vertical seam at the generated-center to
right-anchor boundary; candidate 01 also introduces an oversized dark central mountain
mass. Candidate 02 is the better diagnostic sample but is not selector-ready.

Interpretation: the method's **pixel preservation** part is proven, but the **hard
restore mask** likely creates an internal butt-join between generated pixels and the
protected right anchor. Next probe should keep outer anchor pixels exact while using a
feathered/graded composite restore only across the overmask band.
