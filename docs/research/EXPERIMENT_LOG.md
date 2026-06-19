# EXPERIMENT_LOG.md — chronological record of every turn

> One entry per turn, newest at the top. Append-only in spirit: do not rewrite
> history, even for failures — failures are the point. Distilled conclusions move to
> `FINDINGS.md`. Use `templates/EXPERIMENT_TEMPLATE.md` for full experiment entries.

---

## Turn 8 — 2026-06-18 — Review of Adapter Workbench prep script
- **Role:** Reviewer (Opus, cross-checking Codex's Turn 7 runner work)
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** is the no-backend prep artifact contract correct, reproducible, and
  ready to feed a candidate-generation turn — without having touched the renderer or
  any backend?
- **Verdict:** ✅ **READY / PASS.** No blockers.
- **What was checked:**
  - **Scope:** `scripts/adapter-prep.mjs` only reads `public/panos/*.jpg` and writes
    under `docs/research/experiments/working/002-wide-structure-workbench/`. It does
    **not** touch the renderer, `public/panos/adapters/`, or any backend. No scope
    creep.
  - **Reproducibility:** re-running the prep command regenerates byte-identical
    images; only `manifest.json` `createdAt` changes (timestamp). Working tree
    restored to the committed manifest after verification.
  - **Crops (visual + code):** `dawn-valley-right-crop.jpg` is the right edge of the
    dawn plate, `dusk-ridge-left-crop.jpg` is the left edge of the dusk plate. Both
    `1045 x 1344`. Direction is correct (`from -> right`, `to -> left`), not flipped.
  - **Work canvas:** `3168 x 1344`; two real edge crops on the outside, opaque
    edge-color gradient through a `1078px` center band. No transparent/blank hole.
  - **Mask:** outer anchors black (preserve), broad white center (regenerate), soft
    feather overmasking ~`190px` into each anchor. `manifest.maskStrategy` documents
    `white = regenerate, black = preserve`.
  - **Structure guide:** low-frequency only — warm dawn left, misty basin center,
    dusk ridge mass emerging bottom-right. Intentionally not detailed; reads as a
    placeholder, not a final image.
  - **Prompt / negative:** explicitly target the Loop 2 / `exp001` failure mode
    (no large dark mountain / value mass on the left edge, no hard structure jump,
    no abrupt horizon step, no lake-hitting-mountain, no pasted-collage seam).
  - **Manifest:** carries boundary, source paths, dimensions, crop pixels, source
    image info, mask + prefill strategy, edge colors, structure-guide note, prompt
    file paths — enough to repeat the prep or hand it to a backend/manual route.
  - **Dependency:** `sharp` is a single, narrow **devDependency** (build/runtime
    bundle unaffected).
  - **Build:** `npm run build` passed (tsc + vite, TS clean).
- **Should-fix (non-blocking, future turn):** `promptText()` interpolates only the
  first line; lines 2-5 and the negative prompt hardcode `dawn-valley` / `dusk-ridge`
  and this pair's dark-mass failure mode. Correct and desirable for this pair-specific
  boundary, but the generically-named `adapter:prep` script would emit dawn-specific
  text if reused for another pair. Generalize when the workbench is extended beyond
  dawn-to-dusk — do not weaken the current pair-specific prompt to do it.
- **Runtime / assets changed:** none by this review. No backend calls. No candidates
  under `public/panos/adapters/`.
- **Result:** prep contract accepted. This still does **not** evaluate visual adapter
  quality — that is the next turn's job.
- **Next:** see `NEXT.md` — authorize one route to generate 4-8 `dawn-valley -> dusk-ridge`
  candidates from these artifacts, then register + inspect at `blend = 0` / `blend = 16`.

## Turn 7 — 2026-06-18 — Adapter Workbench prep script
- **Role:** Engineering Runner / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** a deterministic no-backend prep contract can make the next
  adapter-generation step reproducible without changing the renderer or calling a
  generation service.
- **What was done:**
  - Added `scripts/adapter-prep.mjs`.
  - Added the package command:
    `npm run adapter:prep -- --from dawn-valley --to dusk-ridge --id exp002-wide-structure-workbench-v1`.
  - Generated the working directory:
    `docs/research/experiments/working/002-wide-structure-workbench/`.
  - Produced these artifacts:
    - `manifest.json`
    - `prompt.txt`
    - `negative-prompt.txt`
    - `dawn-valley-right-crop.jpg`
    - `dusk-ridge-left-crop.jpg`
    - `adapter-work-canvas.png`
    - `adapter-mask.png`
    - `structure-guide.png`
- **Implementation details:**
  - Work canvas defaults to the existing adapter size: `3168 x 1344`.
  - Left and right anchors each use about 33% of the work canvas width
    (`1045px` each), leaving a broad center transition band (`1078px`).
  - Source scenes are height-normalized to `1344px`; the script extracts the right
    crop from `dawn-valley` and the left crop from `dusk-ridge`.
  - `adapter-work-canvas.png` places the two real edge crops on the outside and
    fills the center with a non-transparent edge-color gradient.
  - `adapter-mask.png` records `white = regenerate, black = preserve`; it protects
    the outer anchors while overmasking slightly into both anchor regions.
  - `structure-guide.png` is intentionally minimal: low-frequency fog basin,
    distant ridge continuity, and dusk ridge mass emerging gradually on the right.
  - The prompt/negative prompt are specific to `dawn-valley -> dusk-ridge` and
    explicitly avoid the Loop 2 failure mode: a large dark mountain/value mass at
    the left endpoint.
- **Dependency note:** added narrow devDependency `sharp` because the repo had no
  existing image tooling for deterministic JPEG/PNG resize, crop, composite, mask,
  and metadata-safe artifact generation from a Node script.
- **Verification:**
  - `npm run adapter:prep -- --from dawn-valley --to dusk-ridge --id exp002-wide-structure-workbench-v1` passed.
  - `sips` confirmed crop artifacts are `1045 x 1344`; canvas, mask, and guide are
    `3168 x 1344`.
  - `npm run build` passed.
- **Runtime / assets changed:** no runtime renderer changes. No backend calls. No
  final adapter candidates were created under `public/panos/adapters/`.
- **Result:** ✅ prep contract implemented. This does not evaluate visual adapter
  quality and does not solve the adapter-generation problem.
- **Next:** see `NEXT.md` — review the prep artifacts before choosing a manual or
  backend route for generating 4-8 candidates.

## Turn 6 — 2026-06-18 — Adapter Workbench source dive
- **Role:** Engineering Scout / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge` as the motivating case, but no visual
  experiment was run.
- **Hypothesis:** source-code references from existing outpainting tools can clarify
  how to structure a small `pano-loop-lab` Adapter Workbench before generating more
  candidates.
- **What was checked:**
  - `zero01101/openOutpaint` source:
    - `js/ui/tool/dream.js`
    - `js/ui/tool/maskbrush.js`
    - `js/lib/commands.js`
    - `js/lib/layers.js`
    - `js/extensions.js`
    - `js/index.js`
  - `lkwq007/stablediffusion-infinity` source:
    - `app.py`
    - `utils.py`
    - `postprocess.py`
    - `process.py`
    - `canvas.py`
- **What was learned:**
  - `openOutpaint` is a strong reference for candidate-oriented outpainting
    workflow: bounded generation region, visible init canvas, mask canvas,
    overmask, prompt/payload construction, optional ControlNet input, candidate
    navigation, generate-more, accept/discard, and command-history application.
  - `stablediffusion-infinity` is a strong reference for RGBA selection buffers,
    mask-as-alpha, prefill strategies (`edge_pad`, PatchMatch, Perlin/Gaussian
    noise, OpenCV inpaint), batch candidate generation, and photometric/Poisson
    postprocess hooks.
  - The next useful tooling step is not a new renderer and not a full drawing app.
    It is a deterministic Adapter Workbench prep contract: edge crops, wide work
    canvas, mask, optional structure guide, prompt files, and manifest.
  - Jones clarified that wide plates and wide adapters are desirable for immersion
    and transition breathing room, and that the pipeline should support generating
    several candidates and selecting the best rather than expecting one perfect
    generation.
- **Runtime / assets changed:** none. Docs-only.
- **New documentation:** `docs/research/adapter-workbench-source-dive.md`.
- **Result:** ✅ source dive complete. Adapter Workbench is now the recommended
  next engineering direction.
- **Next:** see `NEXT.md` — implement the smallest no-backend `adapter:prep`
  script to create reproducible workbench artifacts for one boundary.

## Turn 5 — 2026-06-17 — Loop 5: skeptical review of comparison repair
- **Role:** Skeptical Reviewer
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** review only — no image-generation experiment run.
- **What was checked:** reviewed the Loop 4 diff, the app/config comparison
  registration, the debug-panel selector, `blend = 0` / `blend = 16` inspection
  controls, documentation accuracy, and build status.
- **Runtime / assets changed:** none in this review. Docs-only review notes.
- **Verification:**
  - `npm run build` passed.
  - The app exposes a `dawn->dusk` comparison selector with exactly:
    - `baseline`
    - `exp001 edge-anchored`
  - Switching the selector changes only the first seam image:
    - `baseline` -> `/panos/seams/dawn-valley__dusk-ridge.jpg`
    - `exp001-edge-anchored-v1` ->
      `/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg`
  - The other two seam URLs stayed unchanged while switching comparison options.
  - `blend = 0`, `blend = 16`, and inspect boundaries `0` and `1` remained usable
    with both adapter options.
- **Visual re-check:**
  - At `blend = 0`, `exp001-edge-anchored-v1` still improves the
    `adapter -> dusk-ridge` endpoint by reducing the baseline lake-to-land
    collision.
  - At `blend = 0`, it still worsens / complicates the
    `dawn-valley -> adapter` endpoint with a large dark mountain/value mass.
  - At `blend = 16`, feathering makes both options more plausible, but this does
    not satisfy the research rule because ACCEPT must hold at raw `blend = 0`.
- **Review answers:**
  - Baseline vs candidate is actually selectable without manual code edits: yes.
  - The selector only affects `dawn-valley -> dusk-ridge`: yes.
  - Loop 4 did not change renderer/stage logic, scroll/drag behavior, layout
    behavior, existing assets, or other boundaries.
  - The DebugPanel change is minimal and limited to research comparison.
  - Baseline and `exp001-edge-anchored-v1` both remain available.
  - Loop 2's INCONCLUSIVE verdict is still correct.
- **Result:** ✅ READY FOR LOOP 6. The comparison-registration repair is valid.
  No further tooling repair is required before planning the next experiment.
- **Next:** see `NEXT.md` — Loop 6 should be a Planner turn for a revised single
  dawn-to-dusk experiment that addresses the left-endpoint failure before any new
  image generation happens.

## Turn 4 — 2026-06-17 — Loop 4: baseline/candidate comparison repair
- **Role:** Experiment Runner + skeptical self-review
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** tooling repair only — no image-generation experiment run.
- **What was done:**
  - Added a small dawn-to-dusk adapter option registry in `src/pano/panoRing.ts`.
  - Restored `PANO_RING`'s base `dawn-valley -> dusk-ridge` seam to the original
    baseline file:
    `public/panos/seams/dawn-valley__dusk-ridge.jpg`.
  - Added `buildPanoRingWithDawnDuskAdapter()` so the active ring can use either:
    - `baseline`
    - `exp001-edge-anchored-v1`
  - Added a minimal debug-panel selector labeled `dawn->dusk` for switching only
    this boundary's active adapter option.
- **Runtime / assets changed:** code/config only. No new image assets, crops,
  adapters, libraries, renderer changes, scroll changes, layout system changes,
  or other-boundary changes.
- **Verification:**
  - `npm run build` passed.
  - In the app, the dawn-to-dusk selector exposes both `baseline` and
    `exp001 edge-anchored`.
  - Browser verification confirmed the active first seam image changes from
    `/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg` to
    `/panos/seams/dawn-valley__dusk-ridge.jpg` and back without manual code edits.
  - `blend = 0` and `blend = 16` remain selectable while using the comparison
    selector.
- **Skeptical self-review:**
  - Baseline is actually selectable/comparable now: yes.
  - `exp001-edge-anchored-v1` is still available: yes.
  - Renderer, scroll, drag, layout behavior, and existing assets were not changed.
  - The UI change is limited to a single comparison selector in the existing debug
    panel; it is not product polish.
  - No plate / seam / socket widths were locked.
- **Result:** ✅ comparison-registration repair complete. This does not change the
  Loop 2 visual verdict; `exp001-edge-anchored-v1` remains INCONCLUSIVE.
- **Next:** see `NEXT.md` — Loop 5 should run a Skeptical Reviewer re-check using
  the now-selectable baseline/candidate comparison path.

## Turn 3 — 2026-06-17 — Loop 3: skeptical review of Loop 2
- **Role:** Skeptical Reviewer
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** review only — no experiment run.
- **What was checked:** reviewed the Loop 2 diff, generated assets, Candidate B
  spec, `src/pano/panoRing.ts` registration change, baseline preservation, and the
  INCONCLUSIVE verdict.
- **Runtime / assets changed:** none in this review. Docs-only review notes.
- **Inspection:** no new images generated and no new visual experiment run. Review
  relied on Loop 2's recorded `blend = 0` / `blend = 16` inspection evidence and
  the actual diff.
- **Findings:**
  - Exactly one new adapter was generated:
    `public/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg`.
  - Candidate B was followed: the generation used the right edge of `dawn-valley`
    and the left edge of `dusk-ridge` as references. It did not drift into
    Candidate A or Candidate C.
  - The generated asset is standalone pair-specific transition material. It is not
    a permanent outpaint of either neighboring plate.
  - The INCONCLUSIVE verdict is justified. The candidate improved the
    `adapter -> dusk-ridge` endpoint by reducing the baseline lake-to-land
    collision, but it worsened / complicated the `dawn-valley -> adapter` endpoint
    with a large dark ridge/value mass. It does not meet ACCEPT criteria because
    both endpoints are not clearly better at `blend = 0`.
  - Baseline was preserved as a file, but **baseline comparison is not actually
    selectable in the app/config after Loop 2**. The active `PANO_RING` now points
    directly to the candidate adapter. The baseline can only be compared by a manual
    code/config swap or by relying on Loop 2's pre-swap screenshots. This is a
    review issue.
  - The `src/pano/panoRing.ts` change stayed small and data/config-like, but it did
    not fully satisfy the intent of "add as a comparison option" because it replaced
    the active seam rather than registering baseline and candidate side by side.
  - No renderer, debug-panel, scroll, layout, interaction behavior, existing plates,
    or existing seam assets were changed.
- **Result:** 🟡 NEEDS FOLLOW-UP. Keep Loop 2's visual verdict as INCONCLUSIVE, but
  repair comparison registration before running any more image-generation
  experiments.
- **Next:** see `NEXT.md` — Loop 4 should add the smallest reviewable comparison
  mechanism for `dawn-valley -> dusk-ridge` baseline vs `exp001-edge-anchored-v1`
  and stop before generating more images.

## Turn 2 — 2026-06-17 — Loop 2: edge-anchored dawn-to-dusk adapter
- **Role:** Experiment Runner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** H1 — edge-anchored pair-specific adapter generation. Feeding the
  actual right edge of `dawn-valley` and actual left edge of `dusk-ridge` should
  improve raw endpoint alignment at `blend = 0`.
- **What was done:**
  - Created 30% edge-crop references:
    - `docs/research/experiments/working/001-dawn-to-dusk/dawn-valley-right-30pct.jpg`
    - `docs/research/experiments/working/001-dawn-to-dusk/dusk-ridge-left-30pct.jpg`
  - Generated exactly one Higgsfield `nano_banana_2` adapter candidate, 21:9, 2k:
    `public/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg`
  - Registered it with the smallest data/config change available: updated only the
    `dawn-valley -> dusk-ridge` seam `imageUrl` in `src/pano/panoRing.ts`.
    Baseline asset remains untouched at
    `public/panos/seams/dawn-valley__dusk-ridge.jpg`.
- **Generation details:** Higgsfield job `3c46d706-2627-4b2e-8ce4-7e4d5536f5fe`,
  model `nano_banana_2` / Nano Banana Pro, output URL captured during run.
- **Runtime / assets changed:** one new adapter asset, two research crop inputs,
  and one data/config registration line. No renderer, debug-panel, scroll, layout,
  interaction logic, libraries, existing plates, or existing seams were changed.
- **Inspection:** used the existing inspect lab at `blend = 0` and `blend = 16`.
  Baseline was inspected before registration; candidate was inspected after the
  data/config registration.
  - Baseline `dawn-valley -> baseline`: tonal continuity was acceptable, but the
    seam introduced lake/water structure immediately at the join.
  - Baseline `baseline -> dusk-ridge`: clear structural mismatch; lake/water on
    the seam side met ridge/land on the dusk side.
  - Candidate `dawn-valley -> exp001-edge-anchored-v1`: no immediate lake/water
    collision, but a large dark mountain mass enters at the join and creates a
    stronger structural/value change than desired.
  - Candidate `exp001-edge-anchored-v1 -> dusk-ridge`: visibly better than
    baseline; ridge/foreground language is closer and the lake-to-land collision is
    mostly removed.
  - At `blend = 16`, the candidate is production-plausible on the right join and
    somewhat plausible on the left join, but the left-side mass is still doing a
    lot of hidden work.
- **Build:** `npm run build` passed after installing existing lockfile
  dependencies with `npm ci`.
- **Result:** 🟡 INCONCLUSIVE. Edge anchoring improved the adapter's right endpoint
  into `dusk-ridge`, but did not clearly improve both endpoints. The left endpoint
  introduced a large dark ridge/value shift, so this does not meet ACCEPT criteria.
- **Next:** run Loop 3 as Skeptical Reviewer. Do not generate images. Review the
  Loop 2 diff, the visual evidence, the data/config registration choice, and the
  INCONCLUSIVE verdict.

## Turn 1R — 2026-06-17 — Loop 1 Review: experiment design readiness
- **Role:** Skeptical Reviewer
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** review only — no experiment run.
- **What was checked:** reviewed whether
  `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` and `NEXT.md`
  are ready for Loop 2 without drifting into outpaint, UI work, sizing locks, or
  multi-variant generation.
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** not run; no images generated. Reviewed the written criteria for
  required `blend = 0` and `blend = 16` inspection.
- **Result:** ✅ READY after a small docs tightening. Candidate B remains the
  recommended Loop 2 experiment. `NEXT.md` now limits any comparison registration
  to data/config scope and explicitly forbids renderer, debug-panel, scroll,
  layout, or interaction logic changes.
- **Build note:** `npm run build` was attempted during Loop 1 but could not run
  because dependencies were not installed (`tsc: command not found`). No
  runtime/code changes were made.
- **Next:** Loop 2 may proceed only under `NEXT.md`: generate exactly one
  edge-anchored adapter variant for `dawn-valley -> dusk-ridge`, keep baseline,
  inspect at `blend = 0` and `blend = 16`, log ACCEPT / REJECT / INCONCLUSIVE,
  and stop.

## Turn 1 — 2026-06-17 — Loop 1: dawn-to-dusk adapter experiment design (docs-only)
- **Role:** Research Planner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** H1 pair-specific adapter generation, with one bounded H4 ritual
  transition variant for future event-scene relevance.
- **What was done:** created
  `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` with three
  candidate generation experiments: full-reference pair bridge, edge-anchored
  boundary-crop bridge, and ritual mist / light veil bridge.
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** not run; design-only turn. No images were generated and no
  adapter was evaluated.
- **Result:** ✅ Loop 1 design artifact complete. The adapter problem is not solved;
  Loop 2 must generate and inspect exactly one candidate before any success claim.
- **Next:** see `NEXT.md` — Loop 2 should run Candidate B, the edge-anchored
  boundary-crop bridge, on the same boundary only.

## Turn 0 — 2026-06-16 — Loop 0: research scaffolding (docs-only)
- **Role:** Archivist / setup
- **Boundary:** none (infrastructure turn)
- **Hypothesis:** none — set up the repo to run controlled loop-engineering research.
- **What was done:** created `AGENTS.md` and `docs/research/` memory
  (STATE, FINDINGS, NEXT, ROLES, this log, templates/EXPERIMENT_TEMPLATE).
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** n/a.
- **Result:** ✅ scaffolding in place. `npm run build` expected green (no code touched).
- **Next:** see `NEXT.md` — Loop 1 is *design only* (3 experiments for one boundary,
  no image generation, no code).

<!-- Add new turns ABOVE this line. -->
