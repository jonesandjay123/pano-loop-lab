# Adapter Workbench Source Dive

Date: 2026-06-18

## Purpose

`pano-loop-lab` already has an adequate loop renderer and inspection surface. The
near-term engineering question is now:

> How do we build a small Adapter Workbench that repeatedly generates candidate
> transition adapters between two scene plates, registers the best candidates, and
> inspects them honestly?

This source dive focuses on practical implementation references from:

- `zero01101/openOutpaint`
- `lkwq007/stablediffusion-infinity`

It does not recommend porting either repo wholesale.

## Product Assumptions From Jones

- Scene plates should remain generously wide to preserve immersion.
- Adapters should also be wide enough to give the transition room to become
  natural. A too-short adapter forces the model to weld incompatible worlds too
  abruptly.
- Do not over-optimize for one perfect generation. The workbench should support
  repeated candidate generation, then human selection of the most plausible /
  preferred result.
- A visually bad candidate is expected pipeline output, not a crisis. The system
  should make it cheap to generate, compare, reject, and keep going.

## Source Files Inspected

### openOutpaint

Repository: https://github.com/zero01101/openOutpaint

Inspected files:

- `js/ui/tool/dream.js`
- `js/ui/tool/maskbrush.js`
- `js/lib/commands.js`
- `js/lib/layers.js`
- `js/extensions.js`
- `js/index.js`

### stablediffusion-infinity

Repository: https://github.com/lkwq007/stablediffusion-infinity

Inspected files:

- `app.py`
- `utils.py`
- `postprocess.py`
- `process.py`
- `canvas.py`

## Mechanism Summary

### openOutpaint

`openOutpaint` is mainly useful as a source reference for UI/workflow mechanics.
Its generation path is roughly:

1. User defines a bounding box / generation region on a large canvas.
2. It extracts visible canvas pixels inside that box as an init image.
3. It builds a mask canvas from the visible pixels and painted mask layer.
4. It optionally expands the mask with `overMaskPx` to cover a slightly larger
   area than the strict blank/masked region.
5. It builds a Stable Diffusion WebUI payload:
   - `prompt`
   - `negative_prompt`
   - `width` / `height`
   - `init_images`
   - `mask`
   - `mask_blur`
   - `inpainting_fill`
   - `outpainting_fill`
   - optional `alwayson_scripts` such as ControlNet
6. It sends the payload to A1111 `txt2img` or `img2img`.
7. It receives one or more generated images.
8. It lets the user cycle through candidates, mark candidates, generate more,
   accept one, discard one, or save one as a resource.
9. It applies the accepted result back onto the canvas through a command/history
   system.

Important mechanics:

- `dream_generate_callback()` builds the request and chooses `txt2img` or
  `img2img` depending on whether the selected canvas region is blank and whether
  ControlNet is active.
- `applyOvermask()` expands white mask pixels by randomized blotches. The exact
  implementation is not something to copy, but the idea matters: ask generation to
  touch slightly more than the strict unknown region so seams are less brittle.
- `_generate()` queues generations, prevents duplicate requests to the same area,
  previews progress, stores returned candidates, and provides a mini candidate
  selector.
- `addControlNetToAlwaysOnScripts()` shows how a reference image and mask are
  routed into A1111 ControlNet through `alwayson_scripts.controlnet.args`.
- `maskbrush.js` provides a paint/erase mask layer with brush size, blur, opacity,
  preview, and clear behavior.

### stablediffusion-infinity

`stablediffusion-infinity` is useful for generation-region mechanics and
pre/post-processing. Its generation path is roughly:

1. It maintains an RGBA selection buffer. RGB is current image content; alpha is
   the mask.
2. It chooses a fill mode for the unknown area before diffusion:
   - `patchmatch`
   - `edge_pad`
   - `perlin`
   - `gaussian`
   - `cv2_telea`
   - `cv2_ns`
   - `mean`
3. It converts the selection buffer into an init image and mask image.
4. It runs Stable Diffusion inpainting / img2img with prompt, negative prompt,
   strength, scheduler, seed, and `generate_num`.
5. It optionally applies photometric correction after generation.
6. It returns one or more base64 image candidates and writes the selected result
   back into the selection buffer/canvas.

Important mechanics:

- `utils.py` defines fill functions. `edge_pad()` propagates known edge pixels into
  unknown regions; `patch_match_func()` uses PatchMatch when available; `perlin`
  and `gaussian` provide noise-based unknown-region initialization.
- `app.py` converts RGBA selection buffers into image/mask inputs, calls the
  diffusion pipeline, and supports `generate_num`.
- `postprocess.py` wraps photometric / Poisson-style correction through
  Fast-Poisson-Image-Editing.
- `canvas.py` keeps a movable selection rectangle, writes selection results into a
  larger buffer, and serializes selection content as base64.

## What We Can Steal

### From openOutpaint

- **Candidate-first workflow.** Generate multiple results for a region, preview
  them, accept one, discard the rest. This directly matches Jones's preference:
  produce N adapters and pick the best.
- **Generation region abstraction.** Treat an adapter candidate as a bounded
  canvas region with known pixels, mask pixels, prompt, and metadata.
- **Mask discipline.** Keep mask construction explicit and visible rather than
  relying on prompt language alone.
- **Overmask concept.** Expand the generation area slightly beyond the strict
  missing region so the model has room to blend.
- **Payload manifest.** Capture prompt, negative prompt, width, height, init
  image, mask, seed, and optional ControlNet inputs as one reproducible request.
- **Optional ControlNet/reference input routing.** The exact A1111 payload is not
  a must, but the workbench should have a slot for structure/reference inputs.

### From stablediffusion-infinity

- **RGBA selection buffer.** Use RGB for the composed adapter work canvas and alpha
  for the generation mask.
- **Prefill strategy.** Before generation, fill unknown regions with something
  better than blank:
  - edge extension from known crops
  - PatchMatch-like fill
  - low-frequency noise
  - mean color
- **Wide but bounded selection.** Bigger adapters can help transitions, but the
  generated region should still be a bounded, repeatable selection with explicit
  dimensions.
- **Batch candidate generation.** Use `generate_num` / batch count as a first-class
  setting.
- **Postprocess hook.** Keep a hook for photometric correction or simple edge
  color/luminance normalization after generation.

## What We Should Not Steal

- Do not port openOutpaint's full freeform drawing UI. It is more tool than this
  repo needs.
- Do not modify browser canvas prototypes like openOutpaint does in `layers.js`.
  That is clever for a drawing app but too invasive for this lab.
- Do not make the first implementation depend on A1111, ComfyUI, Higgsfield, or
  any one backend. The workbench should produce files and manifests first; backend
  execution can be manual or automated later.
- Do not copy stablediffusion-infinity's full Gradio/PyScript infinite canvas.
  We only need deterministic crop/mask/manifest preparation.
- Do not add runtime libraries to the current React renderer for this phase.
- Do not make seam metrics the gatekeeper too early. Human visual selection still
  matters; metrics should assist comparison, not replace judgment.

## Proposed Minimal Adapter Workbench Design

The first version should be a deterministic repo-local preparation pipeline, not a
full generation UI.

### Data Model

```ts
type AdapterRecipe = {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  leftCropPercent: number;
  rightCropPercent: number;
  adapterWidthRatio: number;
  adapterAspectRatio: "21:9";
  candidateCount: number;
  maskStrategy:
    | "center-band"
    | "edge-preserve"
    | "wide-fog-dissolve"
    | "structure-guide";
  prefillStrategy:
    | "edge-pad"
    | "mean"
    | "noise"
    | "manual"
    | "none";
  prompt: string;
  negativePrompt: string;
  structureGuidePath?: string;
  notes?: string;
};
```

### Workbench Artifact Layout

For a recipe like `exp002-wide-structure-workbench-v1`:

```text
docs/research/experiments/working/002-wide-structure-workbench/
  manifest.json
  prompt.txt
  negative-prompt.txt
  dawn-valley-right-crop.jpg
  dusk-ridge-left-crop.jpg
  adapter-work-canvas.png
  adapter-mask.png
  structure-guide.png
  candidates/
    exp002-candidate-01.jpg
    exp002-candidate-02.jpg
    ...
```

Generated candidates promoted into the renderer should still live under:

```text
public/panos/adapters/dawn-valley__dusk-ridge/
```

### Workbench Steps

1. Read the two scene plate files from `public/panos/`.
2. Crop a wide right-edge slice from the left plate.
3. Crop a wide left-edge slice from the right plate.
4. Compose a wider-than-minimal 21:9 adapter work canvas:
   - left crop locked to the left side
   - right crop locked to the right side
   - broad center transition region
5. Create a mask:
   - keep the outer crop anchors mostly protected
   - generate a wide center band
   - optionally overmask slightly into the crop anchors
6. Create or load a structure guide:
   - left: open dawn valley / low detail
   - middle: fog / luminous open basin
   - right: dusk ridge gradually emerging
7. Write a manifest with all parameters.
8. Generate N candidates externally or through a backend.
9. Register the best candidate(s) in the adapter selector.
10. Inspect:
    - `dawn-valley -> adapter` at `blend = 0`
    - `adapter -> dusk-ridge` at `blend = 0`
    - both at `blend = 16`
11. Record which candidates were accepted, rejected, or kept for later comparison.

## One Concrete First Implementation Step

Implement one docs-safe, no-backend script:

```bash
npm run adapter:prep -- --from dawn-valley --to dusk-ridge --id exp002-wide-structure-workbench-v1
```

The script should only prepare workbench artifacts:

- edge crops
- adapter work canvas
- adapter mask
- optional simple structure guide
- `manifest.json`
- prompt files

It should not call an image-generation API yet.
It should not register a candidate yet.
It should not change runtime renderer code.

This first step is valuable because it converts the vague generation problem into
a reproducible file contract. Once the contract is stable, candidate generation can
be manual, Higgsfield-based, A1111-based, ComfyUI-based, or another backend.

## Recommended Next Recipe

Name:

```text
exp002-wide-structure-workbench-v1
```

Purpose:

Test whether a wider adapter work canvas plus explicit mask/structure guide makes
candidate generation easier and more repeatable than `exp001-edge-anchored-v1`.

Parameters:

- Boundary: `dawn-valley -> dusk-ridge`
- Left crop: 30-40% of `dawn-valley`
- Right crop: 30-40% of `dusk-ridge`
- Adapter width: generous; do not compress the transition
- Mask: wide center band with slight overmask into anchors
- Structure guide:
  - left third: pale dawn valley / open low-detail land
  - center third: luminous fog / low-detail basin
  - right third: dusk ridge silhouette
- Candidate count: 4-8, not 1

Success is not "all candidates are good." Success is:

- the workbench can produce repeatable candidate batches
- the best candidate is easy to promote and inspect
- bad candidates can be rejected without changing the renderer
- the method can be repeated for `A -> Christmas` and `Christmas -> B`

