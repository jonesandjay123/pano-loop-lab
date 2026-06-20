# EXPERIMENT_LOG.md — chronological record of every turn

> One entry per turn, newest at the top. Append-only in spirit: do not rewrite
> history, even for failures — failures are the point. Distilled conclusions move to
> `FINDINGS.md`. Use `templates/EXPERIMENT_TEMPLATE.md` for full experiment entries.

---

## Turn 24 - 2026-06-20 - Strict-X soft anchor adoption
- **Role:** Engineering Runner / Reviewer / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge`.
- **Question:** if GPT modifies the provided anchors, can the repo still use GPT's
  good X transition while strictly preserving original A/B anchors?
- **User correction:** direct GPT output cannot be trusted if the goal is strict
  X-only editing. The real requirement is: A/B anchor pixels must remain unchanged;
  only X may change.
- **Implementation:** added deterministic postprocess script
  `scripts/adapter-soft-adopt.mjs` and npm script `adapter:soft-adopt`.
- **Method:** starting from `gpt-axb-01`, copy the original left/right prep anchors
  exactly into the output, then blend only pixels inside the X region against the
  GPT candidate near the anchor boundaries. No anchor pixels are changed.
- **Variants written:**
  - `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft64.png`;
  - `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft128.png`;
  - `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft256.png`.
- **Anchor diff:** all three variants report left/right outer anchor max diff `0` and
  mean diff `0`.
- **Review artifacts:** wrote external joins, internal boundary crops, and comparison
  sheets under
  `docs/research/experiments/working/012-soft-anchor-adoption/dawn-valley__dusk-ridge/review/`.
- **Visual result:** `soft64` still reads too hard near the internal anchor/X
  boundary. `soft128` is better. `soft256` is the smoothest strict-X version and is
  now active for review, but it should still be inspected in the actual seam lab
  before being accepted as final.
- **Verdict:** **PARTIAL / promising.** The issue was real: GPT changed the anchors.
  The repo can enforce strict anchor preservation after the fact, and only modify X.
  The next decision is whether `soft256` is visually acceptable in motion / seam-lab
  context, or whether a true mask-inpaint backend is still required.

## Turn 23 - 2026-06-20 - Import GPT AXB candidate and exact-anchor diagnostic
- **Role:** Runner / Reviewer / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge`.
- **Question:** does the user's GPT-filled `1:4:1` AXB result become a usable
  candidate when imported into the repo, and does X-only exact-anchor adoption solve
  the weld?
- **Input:** `/Users/joneswang/Downloads/ChatGPT Image 2026年6月20日 下午06_08_09.png`,
  source dimensions `1918 x 820`.
- **Import:** ran `npm run adapter:import` with id `gpt-axb-01`. The import resized
  the external image to the current prep geometry, `3136 x 1344`, and registered it
  under:
  - `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01.png`;
  - `docs/research/experiments/working/011-imported-gpt-candidates/dawn-valley__dusk-ridge/gpt-axb-01.png`.
- **Derived diagnostic:** created `gpt-axb-01-xonly` by extracting only the GPT X
  region and compositing exact original A/B anchors back in according to the prep
  manifest:
  - anchor width: `523px`;
  - X region: `2090px`;
  - right anchor starts at `2613px`.
- **Anchor diff:** review report shows:
  - `gpt-axb-01`: left max diff `194`, mean `18.777924`; right max diff `100`,
    mean `9.611601`;
  - `gpt-axb-01-xonly`: left/right max diff `0`, mean `0`.
- **Review artifacts:** wrote blend-0-equivalent external joins and internal
  anchor/X crops under
  `docs/research/experiments/working/011-imported-gpt-candidates/dawn-valley__dusk-ridge/review/`.
- **Visual result:** `gpt-axb-01` is the strongest standalone semantic transition so
  far: it makes the warm dawn world naturally move into the cool dusk mountains. It is
  not pixel-exact at the outer anchors, so it is not accepted as final. `gpt-axb-01-xonly`
  proves exact outer anchor restoration is mechanically possible, but the hard
  composite creates visible internal anchor-to-X discontinuities.
- **Dashboard / selector:** both GPT candidates are registered through
  `candidates.json` and the generated TS registry. `gpt-axb-01` is active for review;
  both GPT candidates are marked `partial`, not accepted.
- **Verdict:** **PARTIAL.** Keep the GPT raw candidate as the best visual review target,
  keep the X-only version as an exact-anchor diagnostic, and test soft anchor adoption
  next.
- **Next:** create a soft anchor-adoption composite from `gpt-axb-01` that preserves
  the outer plate-facing pixels exactly while feathering the transition into GPT X.

## Turn 22 - 2026-06-20 - Candidate import path
- **Role:** Engineering Runner
- **Boundary:** `dawn-valley -> dusk-ridge` import path, no new candidate image yet.
- **Question:** can the repo import a GPT-filled AXB result without hand-editing
  dashboard and seam-lab registries?
- **Implementation:** added:
  - `scripts/adapter-import.mjs`;
  - `scripts/adapter-candidates-generate.mjs`;
  - `npm run adapter:import`;
  - `npm run adapter:candidates`;
  - generated registry `src/pano/adapterCandidates.generated.ts`.
- **Behavior:** `adapter:import` takes an external image path, candidate id, label, and
  notes; resizes to the current prep manifest dimensions if needed; writes the runtime
  copy under `public/panos/adapter-candidates/<from>__<to>/`; mirrors a research copy
  under `docs/research/experiments/working/011-imported-gpt-candidates/`; updates
  `candidates.json`; and regenerates the TS registry.
- **UI wiring:** the AXB dashboard and the dawn-to-dusk seam-lab selector now read
  generated candidates from the generated registry, so future imports show up without
  manual TS edits.
- **Scope notes:** no external GPT result was provided this turn, so no new real
  candidate was imported and no visual verdict was made.
- **Next:** user should provide the GPT-filled AXB image path, then run/import exactly
  one candidate and review it.

## Turn 21 - 2026-06-20 - Promote 1:4:1 AXB baseline and width policy
- **Role:** Engineering Runner / Archivist
- **Boundary:** all current adjacent pairs for prep export.
- **Question:** should the primary AXB prep contract use wider semantic anchors and
  explicitly support normal through ultra-wide source plates?
- **User input:** GPT editing with downloaded AXB inputs was effective. User wants the
  repo to support future A/B/C plates that may be much wider than the current sources.
- **Implementation:** changed `scripts/adapter-prep.mjs` default ratio from `1:12:1`
  to `1:4:1`, with `3136 x 1344` output retained. Deterministic rounding yields:
  - anchor width: `523px`;
  - X width: `2090px`;
  - right anchor starts at `2613px`;
  - overlap width: `523px`.
- **Manifest contract:** each generated manifest now records:
  - `xStart`, `xEnd`, `rightAnchorStart`, `overlapWidth`;
  - `placementContract` describing full AXB overlap and X-only/hard-composite adoption;
  - source plate width policy: normal, wide, and ultra-wide source plates are allowed as
    long as the height-normalized source is at least one anchor wide.
- **Assets regenerated:** public dashboard assets for gradient/white/black variants now
  use the `1:4:1` geometry:
  - `public/panos/adapter-prep/`;
  - `public/panos/adapter-prep-white/`;
  - `public/panos/adapter-prep-black/`.
  Research copies were written under `docs/research/experiments/working/010-*`.
- **Dashboard update:** geometry now displays `1:4:1`, `523px` anchors, `2090px` X, and
  `523px` overlap. Download filenames include the ratio slug, e.g.
  `dawn-valley__dusk-ridge__1-4-1__white.png`.
- **Ultra-wide smoke test:** created a temporary `9000 x 1344` source plate outside the
  committed artifacts, ran `adapter:prep` against it, confirmed the right anchor output
  was `523 x 1344`, then removed the temporary source file.
- **Scope notes:** no image generation, candidate import, renderer rewrite, or old
  artifact deletion. The earlier `1:12:1` workbenches remain as legacy research outputs.
- **Next:** import a GPT-filled `1:4:1` AXB candidate and run X-only / hard-composited
  anchor adoption review.

## Turn 20 - 2026-06-20 - AXB prefill variants and download controls
- **Role:** Engineering Runner
- **Boundary:** all current adjacent pairs for prep export.
- **Question:** can the AXB dashboard offer white/black X prefill alternatives and
  direct downloads so the work canvas can be tested in GPT or another editor?
- **Implementation:** generated additional deterministic prep assets with the existing
  prep script:
  - white X prefill under `public/panos/adapter-prep-white/`;
  - black X prefill under `public/panos/adapter-prep-black/`;
  - research copies under `docs/research/experiments/working/009-axb-prefill-variants/`.
- **Dashboard changes:** added a `Gradient / White / Black` selector for the canvas
  preview and download buttons for the currently selected work canvas plus the mask.
- **Scope notes:** no AI generation was run and no candidate/adoption status changed.
- **Next:** use the downloaded white/black/gradient canvas + mask in GPT or another
  editor, then import the returned candidate through the dashboard/candidate registry.

## Turn 19 - 2026-06-20 - Review first AXB candidates at blend-0 equivalents
- **Role:** Reviewer / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** do `hf-nb2-axb-01` or `hf-nb2-axb-02` improve the real joins enough
  to keep one as active-for-review?
- **Method:** no new generation. Created deterministic review artifacts under
  `docs/research/experiments/working/008-dawn-dusk-candidate-review/review/`:
  - external butt-joins for baseline, exp002 c08/c04, and both HF candidates;
  - `compare-external-joins.png`;
  - internal anchor/X boundary crops for both HF candidates;
  - `anchor-diff.json` comparing HF outer 224px anchors against the real plate crops.
- **Anchor diff:** the HF candidates are not pixel-preserved:
  - `hf-nb2-axb-01`: left mean diff `2.821`, right mean diff `10.668`;
  - `hf-nb2-axb-02`: left mean diff `2.729`, right mean diff `4.168`.
- **Visual result:** both HF candidates improve the immediate outer joins mostly by
  carrying the AXB anchor strips into the generated image. But both introduce a new
  visible internal vertical discontinuity where the copied anchor strip meets the
  generated X region. `hf-nb2-axb-02` is softer and less severe than `01`, but still
  has obvious warm-to-blue banding. This is not a clean adapter weld.
- **Comparison:** exp002 c08/c04 remain better as standalone transition worlds, while
  the HF AXB candidates are better diagnostic proof that anchor duplication can make
  the outer butt-join look closer. Neither solves both the external join and internal
  anchor-to-X transition.
- **Verdict:**
  - `baseline`: **PARTIAL** (known tonal matte, structural mismatch remains).
  - `exp002-c08`: **PARTIAL** (best standalone dusk-side world, weak dawn side).
  - `exp002-c04`: **PARTIAL** (more dawn-side structure, warm/cool clash on dusk side).
  - `hf-nb2-axb-01`: **REJECT** as final; keep diagnostic only.
  - `hf-nb2-axb-02`: **REJECT** as final; keep diagnostic only.
- **Dashboard update:** both HF candidates are marked `rejected`; no active candidate is
  selected for `dawn-valley -> dusk-ridge`.
- **Next:** stop using whole-frame reference generation as the final AXB method. The
  next variable should be true mask-inpaint / crop-X-only generation, or a deterministic
  postprocess that extracts only the generated X and composites exact anchors back in.

## Turn 18 - 2026-06-20 - First dawn-to-dusk AXB candidate batch
- **Role:** Runner / Engineering Runner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** can the AXB dashboard show a real candidate batch and make active
  selection meaningful for review?
- **Generation backend:** Higgsfield CLI, account authenticated. `nano_banana_2`
  (`Nano Banana Pro`) was used with the AXB work canvas and mask as reference images.
- **Important limitation:** Higgsfield did not expose a true mask-inpaint parameter in
  this route. These are **whole-frame reference generations**, not pixel-preserving
  masked fills. Do not treat them as accepted welds without `blend = 0` review.
- **Candidates generated:**
  - `hf-nb2-axb-01`, job `7800701b-8256-435c-b70c-38d84b09a62f`, `3168 x 1344`.
  - `hf-nb2-axb-02`, job `56316c99-c63c-479b-a615-f6bfacf0bbb4`, `3168 x 1344`.
- **Files written:**
  - runtime/dashboard copies under
    `public/panos/adapter-candidates/dawn-valley__dusk-ridge/`;
  - research copies under
    `docs/research/experiments/working/007-dawn-dusk-candidates/`.
- **Dashboard changes:** candidate thumbnails, status, notes, and a local
  active-for-review selector were added. `hf-nb2-axb-02` is the initial
  active-for-review candidate in the registry.
- **Seam lab changes:** both candidates were added to the existing dawn-to-dusk adapter
  selector so they can be inspected with `blend = 0`. The default runtime adapter was
  not changed.
- **Visual sanity check:** both candidates are valid panoramic images, not blanks.
  `hf-nb2-axb-02` is brighter and lower contrast; `hf-nb2-axb-01` is darker and more
  dusk-heavy. No acceptance verdict was made.
- **Next:** review `hf-nb2-axb-01` and `hf-nb2-axb-02` in seam lab at `blend = 0`
  against the real plates; either promote one, reject both, or move to a true
  mask-inpaint backend/import path.

## Turn 17 - 2026-06-20 - AXB prep dashboard
- **Role:** Engineering Runner / Archivist
- **Boundary:** all current adjacent pairs for inspection; no generation verdict.
- **Question:** where is the independent page for viewing `AXB`, `BXC`, and `CXA`
  prep assets, and can it show the candidate/adoption state clearly?
- **Implementation:** added an in-app dashboard reachable at `/#adapter-workbench`.
  It is hash-based and uses no routing library or backend.
- **Data contract:** added `src/pano/adapterWorkbench.ts` with one registry entry per
  adjacent pair. Each entry includes:
  - work canvas URL;
  - mask URL;
  - left/right anchor URLs;
  - manifest and prompt URLs;
  - geometry;
  - `activeCandidateId`;
  - `candidates`.
- **Browser assets:** generated browser-served prep copies under
  `public/panos/adapter-prep/` so the dashboard can display the canvases and masks.
- **UI:** added `AdapterWorkbench` with pair switching, preview tabs (`Canvas`, `Mask`,
  `Anchors`), geometry stats, file links, active adapter status, and candidate count.
- **Scope notes:** no image-generation backend was called, no generated candidate images
  exist yet, no candidate was marked active, and no runtime pano adapter was changed.
- **Next:** see `NEXT.md` - produce/import the first `dawn-valley -> dusk-ridge`
  AI-filled candidate batch, register it, and make active selection meaningful.

## Turn 16 - 2026-06-20 - AXB prep pipeline for all current loop pairs
- **Role:** Engineering Runner / Archivist
- **Boundary:** all current adjacent pairs:
  - `dawn-valley -> dusk-ridge`
  - `dusk-ridge -> moonlit-tidelands`
  - `moonlit-tidelands -> dawn-valley`
- **Question:** can the repo deterministically prepare one standard AXB inpainting
  input for every adjacent pair, using narrow A/B edge anchors and a dominant editable
  X region?
- **User priority update:** treat `new_plan.md` as the latest goal. The immediate
  direction is no longer the old SDXL right-biased mask geometry probe; it is the AXB
  prep/candidate-selection workflow, followed by an independent dashboard for
  generating, reviewing, and adopting candidate adapters.
- **Implementation:** rewrote `scripts/adapter-prep.mjs` into a batch-capable CLI.
  It now supports:
  - default batch mode for the current ordered loop via `npm run adapter:prep -- --all`;
  - arbitrary ordered loops via `--scenes a,b,c`;
  - single-pair prep via `--from A --to B`;
  - configurable `--width`, `--height`, `--ratio`, `--prefill`, `--overmask-px`,
    and `--out`.
- **Default geometry:** `3136 x 1344`, `A : X : B = 1 : 12 : 1`, anchors `224px`
  each, X region `2688px`, and `32px` overmask into each anchor.
- **Output contract:** for each pair the script writes:
  - `adapter-work-canvas.png` (opaque PNG);
  - `adapter-mask.png` (black = preserve, white = edit/regenerate);
  - right/left anchor crops;
  - `prompt.txt`, `negative-prompt.txt`;
  - `manifest.json`.
  Batch mode also writes `index.json`.
- **Artifacts written under:** `docs/research/experiments/working/006-axb-prep/`.
- **Verification:** ran `npm run adapter:prep -- --all`; confirmed the dawn-to-dusk
  work canvas and mask are `3136 x 1344` and both anchor crops are `224 x 1344`.
- **Visual sanity check:** inspected the dawn-to-dusk work canvas and mask. The anchors
  are narrow edge sockets, X dominates the image, and the mask has the expected
  preserve/edit polarity with soft overmask edges.
- **Scope notes:** no generation backend was called, no runtime adapter was promoted,
  no renderer changed, and no baseline/candidate assets were deleted.
- **Next:** see `NEXT.md` - define or implement the minimal candidate/adoption registry
  and dashboard/design slice for choosing one active adapter from a batch.

## Turn 15 - 2026-06-19 - SDXL right-aware prompt content-guidance probe
- **Role:** Runner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** if the proven 64px soft composite keeps outer anchors exact, can a more
  right-aware prompt make the official SDXL inpaint center become a believable
  dusk-facing bridge?
- **Branch hygiene before this turn:** started on `main` at `abf491a`; working tree was
  clean. Verified `exp/mask-inpaint-comfyui` and `exp/soft-composite-restore` were
  merged into `main`, then safely deleted both local stale branches with
  `git branch -d` (no remote branch deletion, no force, no rebase).
- **Experiment branch:** `exp/sdxl-content-guidance`.
- **Reproducibility repair:** added `scripts/soft-composite-restore.py`, a deterministic
  Pillow script that composites generated inpaint pixels over the original work canvas
  with three zones: outer anchors hard-preserved, smoothstep feather transition, and
  generated center. It writes optional JSON reports proving outer-anchor max diff.
- **ComfyUI generation:** yes, regenerated 2 new raw images with the same official SDXL
  inpaint baseline (`sdxl-inpaint-0.1`), not reused from Turn 13/14. ComfyUI was launched
  on the Windows RTX 5080 and verified via `object_info`.
- **Only variable changed:** positive prompt. Added
  `docs/research/experiments/working/005-sdxl-content-guidance/right-aware-prompt.txt`
  to explicitly ask the right third to cool into blue-violet dusk ridges, avoid warm
  vertical walls, avoid central dark mountain mass, and avoid a warm right-edge peak.
- **Parameters held constant:** `1536 x 640`, steps `30`, CFG `6.5`, `dpmpp_2m` /
  `karras`, denoise `1.0`, ControlNet OFF, same `adapter-work-canvas.png`,
  `adapter-mask.png`, and `negative-prompt.txt`.
- **Candidates written:**
  - raw: `rightaware-01-raw.png`, seed `5252001`.
  - raw: `rightaware-02-raw.png`, seed `5252002`.
  - soft composite: `rightaware-01-soft64.png`, `rightaware-02-soft64.png`.
- **Verification:** both soft64 outputs passed outer-anchor exactness:
  - `rightaware-01`: outer-left `0`, outer-right `0`.
  - `rightaware-02`: outer-left `0`, outer-right `0`.
  Review artifacts include per-candidate butt-joins, internal weld reviews, and
  `compare-rightaware-vs-hard-softcomp-c08-c04.jpg`.
- **Visual result:** right-aware prompt did not solve the content-guidance problem.
  `rightaware-02` adds more distant-ridge language and is the best of the pair, but the
  generated center/right band stays warm/grey/brown before meeting the blue-violet
  `dusk-ridge` anchor. `rightaware-01` still has a large central dark mountain. Neither
  clearly improves on Turn 14 `softcomp-02`; neither matches Higgsfield c08/c04 as a
  standalone transition world.
- **Turn verdict:** **REJECT / diagnostic.** The exact-anchor + soft-composite mechanics
  remain valid, but prompt-only right-awareness is insufficient for this official SDXL
  inpaint baseline. Do not promote selector. The next single variable should be mask
  geometry / right-side context, or only after that a guidance mechanism.
- **Build:** `npm run build` passed.
- **Next:** see `NEXT.md` - test a right-biased/wider inpaint mask while keeping the
  same model, prompt family, and 64px soft restore.

## Turn 14 - 2026-06-19 - Soft composite restore diagnostic
- **Role:** Runner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** did Turn 13 fail mainly because the final hard `ImageCompositeMasked`
  restore created an internal butt-join, and can a feathered deterministic composite
  remove that artifact while keeping the outer plate-facing anchors pixel-exact?
- **Branch hygiene before this turn:** `f55e755` was inspected on
  `exp/mask-inpaint-comfyui`; working tree was clean, `npm run build` passed, and the
  commit contained only docs, candidates, review images, JSON verification, and a small
  workflow file. No ComfyUI model/cache/output junk was present. The branch was
  fast-forward merged into `main` and pushed to `origin/main` (`ac8ff72..f55e755`).
- **Experiment branch:** `exp/soft-composite-restore`.
- **Method:** no model switch and no selector/runtime changes. Used the Turn 13 SDXL
  inpaint outputs as source pixels and applied deterministic Pillow compositing at
  `1536 x 640`. The alpha mask has three zones:
  - outer anchors: alpha `0`, copied exactly from resized `adapter-work-canvas.png`;
  - feather zones: smoothstep alpha ramp inside the original hard mask boundaries;
  - generated center: alpha `1`, using Turn 13 generated pixels.
- **Candidates written under** `docs/research/experiments/working/004-soft-composite-restore/`:
  - `softcomp-01.png`: seed `42424202`, feather `32px`.
  - `softcomp-02.png`: seed `42424202`, feather `64px`.
  - `softcomp-03.png`: seed `42424202`, feather `96px`.
  - `softcomp-04.png`: seed `42424201`, feather `64px`.
- **Verification:** all four candidates passed outer-anchor exactness:
  `outer_left_anchor_max_abs_diff = 0` and `outer_right_anchor_max_abs_diff = 0`.
  Review artifacts include `join-softcomp-*.jpg`, per-side external joins,
  `softcomp-*-internal-weld.jpg`, `softcomp-anchor-diff.json`, and
  `compare-softcomp-vs-hard-c08-c04.jpg`.
- **Visual result:** soft composite materially reduces the specific Turn 13 hard-restore
  artifact, especially the bright vertical break at the right generated/anchor boundary.
  `softcomp-02` (64px) is the best balance; `softcomp-03` (96px) is slightly smoother
  but begins to flatten the transition; `softcomp-01` is a little too narrow;
  `softcomp-04` is rejected because it inherits the oversized dark mountain from seed
  `42424201`.
- **Comparison to c08/c04:** the softcomp outputs are more mechanically reliable at the
  outer pixel weld because the plate-facing anchors are exact, but less convincing than
  Higgsfield c08/c04 as standalone transition worlds. The remaining failure is not the
  final composite mask alone; the SDXL-generated center stays too warm/heavy and does
  not become a convincing dusk-facing bridge before it meets the right anchor.
- **Turn verdict:** **PARTIAL diagnostic / no promotion.** Soft restore solves the
  hard-composite artifact enough to keep, but this batch is not selector-ready. The next
  variable should target inpaint content/color guidance while keeping the proven soft
  composite and outer-anchor exactness.
- **Build:** `npm run build` passed.
- **Next:** see `NEXT.md` - one small SDXL inpaint content-guidance probe; no model
  switch, no selector promotion, no renderer changes.

## Turn 13 - 2026-06-19 - ComfyUI SDXL mask-inpaint batch 1 on RTX 5080
- **Role:** Runner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** can local ComfyUI inpaint preserve real anchor pixels and produce a
  cleaner `blend = 0` weld than Higgsfield whole-frame c08/c04?
- **Environment:** Jones's Windows PC, ComfyUI 0.25.0, RTX 5080 detected, torch
  `2.11.0+cu128`, CUDA 12.8. ComfyUI launched successfully at
  `http://127.0.0.1:8188`.
- **Setup done:** `ComfyUI/models/checkpoints` had no SDXL inpaint checkpoint. Downloaded
  the official fp16 diffusers subset for
  `diffusers/stable-diffusion-xl-1.0-inpainting-0.1` into
  `ComfyUI/models/diffusers/sdxl-inpaint-0.1`. ComfyUI's `DiffusersLoader` saw it as
  `sdxl-inpaint-0.1`.
- **Workflow:** `docs/research/experiments/working/002-wide-structure-workbench/workflows/inpaint-sdxl.json`
  (ComfyUI API prompt format): load diffusers inpaint model, load work canvas and mask,
  downscale both to `1536 x 640` (mask nearest-neighbor), `InpaintModelConditioning`,
  `KSampler`, `VAEDecode`, then `ImageCompositeMasked` using the hard mask to restore
  black/preserved anchor pixels.
- **Parameters:** steps `30`, sampler/scheduler `dpmpp_2m` / `karras`, CFG `6.5`,
  denoise `1.0`, ControlNet OFF, seeds `42424201` and `42424202`.
- **Candidates written:**
  - `docs/research/experiments/working/002-wide-structure-workbench/candidates/inpaint-sdxl-01.png`
  - `docs/research/experiments/working/002-wide-structure-workbench/candidates/inpaint-sdxl-02.png`
- **Verification artifacts written:**
  - `docs/research/experiments/working/002-wide-structure-workbench/review/inpaint-sdxl-anchor-diff.json`
  - `docs/research/experiments/working/002-wide-structure-workbench/review/inpaint-sdxl-01-internal-weld.jpg`
  - `docs/research/experiments/working/002-wide-structure-workbench/review/inpaint-sdxl-02-internal-weld.jpg`
  - external edge sanity joins for both candidates under the same `review/` folder.
- **Anchor pixel check:** PASS for both candidates. In the downscaled black-mask preserve
  region, `changed_values = 0`, `max_abs_diff = 0`, `mean_abs_diff = 0.0`. This proves
  the composite-restore step is wired with the correct mask polarity.
- **Visual check:** FAIL / PARTIAL. The hard composite preserves anchor pixels exactly,
  but both candidates show a hard internal vertical value break where the generated
  center meets the protected right anchor. `inpaint-sdxl-01` also creates an oversized
  dark central mountain mass. `inpaint-sdxl-02` is less structurally extreme but still
  not a clean weld and is not selector-ready.
- **Turn verdict:** **PARTIAL diagnostic.** ComfyUI mask-inpaint is technically ready and
  anchor preservation is proven. The first hard-mask composite recipe is not visually
  accepted; the next probe should test a feathered/graded composite restore across the
  overmask band while keeping the outer anchor edges pixel-exact.
- **Build:** initial `npm run build` failed because dependencies were not installed
  (`tsc` missing). Ran `npm ci`, then `npm run build` passed. `npm ci` reported existing
  audit warnings (1 moderate, 1 high); no dependency fixes were attempted.
- **Next:** see `NEXT.md` - do one narrow ComfyUI rerun/recomposite test for soft
  composite restore, not selector promotion.

## Turn 12 — 2026-06-19 — Mask-inpaint backend feasibility scout (no generation)
- **Role:** Scout (Opus)
- **Boundary:** `dawn-valley -> dusk-ridge` (tooling/feasibility only)
- **Question:** can we run a true mask-inpaint backend (anchor-preserve + center
  regenerate) to beat the Higgsfield whole-frame PARTIAL verdict?
- **Environment scanned (this Mac):** Apple **M2, 8 GB RAM**, arm64, ~29 GiB free.
  **No** A1111 / ComfyUI / InvokeAI / Fooocus / DiffusionBee anywhere; **no** torch /
  diffusers / MLX; **no** checkpoints/safetensors; no SD ports listening. Miniconda is
  installed; HF + PyPI reachable. → **This box is unfit** for local SDXL/Flux inpaint
  (8 GB RAM + 3168×1344 target). No generation was attempted here.
- **Decision:** Jones has a **Windows PC with RTX 5080 (16 GB, Blackwell)** — that is the
  generation box. This turn produced an executable plan instead of running anything.
- **Deliverable:** `comfyui-inpaint-plan.md` in the exp002 working dir — full ComfyUI
  mask-inpaint spec: Blackwell torch caveat (needs cu128), model tiers (start SDXL
  `…-inpainting-0.1`; Tier A Juggernaut/RealVisXL + `comfyui-inpaint-nodes`; Tier C Flux
  Fill fp8), round-1 size **1536×640** then native, params (denoise 1.0 / 30 steps /
  cfg 6.5 / batch 4), ControlNet OFF round 1, the critical **`ImageCompositeMasked`
  anchor-restore** step that guarantees pixel-exact anchors, the artifact/metadata
  contract, and the verification protocol (anchor pixel-diff ≈0 + `blend = 0` butt-join
  vs c08/c04).
- **Key insight:** the prep artifacts already match ComfyUI's expected shape and the
  mask polarity (white = regenerate) matches ComfyUI directly — no repo change needed.
- **Verdict:** **READY-FOR-WINDOWS-COMFYUI** (repo ready; Windows box needs the standard
  one-time ComfyUI + model setup). **No candidates generated** (scout only, as scoped).
- **Next:** see `NEXT.md` — execute `comfyui-inpaint-plan.md` on the 5080, generate 2–4
  test inpaints, verify the weld, then hand the best to Codex for selector promotion.

## Turn 11 — 2026-06-19 — Visual verdict: exp002 c08 / c04 at blend 0 & 16
- **Role:** Reviewer (Opus)
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Question:** do the promoted whole-frame Higgsfield candidates (c08, c04) actually
  weld to the real plates, or just look nice as standalone images?
- **Method:** (1) runtime seam lab — selected each option, `blend = 0` (raw) and
  `blend = 16`, inspected boundary 0 (`dawn -> adapter`) and boundary 1
  (`adapter -> dusk`), auto-scroll paused; (2) pixel-exact **butt-join composites**
  (each adapter's left/right edge strip placed against the real plate edge it must
  meet) saved under `.../002-wide-structure-workbench/review/join-*.jpg`. The
  composite is what `blend = 0` reveals, measured rather than eyeballed.
- **Standing limitation (confirmed, not worked around):** Higgsfield has **no mask
  inpaint**, so c08/c04 are whole-frame image-to-image — **anchors are repainted, not
  pixel-preserved**. So a clean `blend = 0` weld was never guaranteed; this turn tested
  whether it happened anyway. It did not.
- **Findings per join (`blend = 0`):**
  - **dawn -> adapter:** `dawn-valley`'s real right edge is a **large dark ridge mass**.
    Both new adapters are lighter/airier there, so the seam shows a **value + structure
    step**. c04 (more ridge structure on its left) is **milder**; c08 (airiest left) is
    the **largest** step. Note: this is the *opposite* polarity of the exp001 failure —
    no new dark mass is introduced; instead the airy left **under-matches** the dark
    plate edge. The exp001 "adapter adds a dark mass" failure did **not** recur.
  - **adapter -> dusk:** cool/purple side. **c08 welds well** (cool tone + layered
    ridges continue into `dusk-ridge`). **c04 keeps a warm sunlit peak** on its right
    edge that **clashes** with the cool dusk plate. `baseline`'s dusk-side join is also
    strong (it was tuned as a tonal bridge).
  - **`blend = 16`:** feather/overlap hides most of the **tonal** step on the dawn side
    and softens c04's warm clash, but does **not** weld structure — consistent with the
    established "CSS is auxiliary" finding.
- **Per-candidate verdict:**
  - `baseline`: **PARTIAL** — soft tonal matte; strong dusk side, structureless dawn side.
  - `exp001 edge-anchored`: **PARTIAL / INCONCLUSIVE** — unchanged from prior loops.
  - `exp002 c08`: **PARTIAL** — best `adapter -> dusk` weld of the new pair; `dawn ->
    adapter` value/structure step from the airy left. **Current best whole-frame candidate.**
  - `exp002 c04`: **PARTIAL** — better `dawn -> adapter` structure than c08, but a
    warm-peak/cool-dusk clash on the right.
- **Turn verdict:** **PARTIAL.** No candidate cleanly welds **both** joins at
  `blend = 0`. The candidates improve standalone world-feel and avoid re-introducing a
  dark mass, but whole-frame img2img cannot pixel-weld to the real plates.
- **Best to keep / refinement base:** **c08** (cleanest dusk weld; airy left is the more
  socket-friendly direction, and its weakness is partly a property of `dawn-valley`'s
  atypically dark right edge → an H2 socket-edge issue, not an adapter defect). c04 is a
  strong alternate if the dawn-side structure matters more.
- **Changed:** docs only + `review/join-*.jpg` composites. No renderer/selector/candidate
  changes. No backend called. `npm run build` passed.
- **Next:** see `NEXT.md` — the honest next method step is a **true mask-inpaint backend
  (A1111 / ComfyUI)** that preserves the anchors and regenerates only the center band,
  since Higgsfield whole-frame cannot weld.

## Turn 10 — 2026-06-19 — exp002 selector promotion only
- **Role:** Engineering Runner / Archivist
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** promotion-only tooling step. Registering Opus's top two Turn 9
  candidates as selectable runtime variants will let the next reviewer inspect them
  honestly without manual file swaps.
- **What was done:**
  - Copied the two recommended candidates from the workbench batch into the runtime
    adapter path:
    - `docs/research/experiments/working/002-wide-structure-workbench/candidates/c08-struct-off-leftpreserve.png`
      -> `public/panos/adapters/dawn-valley__dusk-ridge/exp002-c08-struct-off-leftpreserve.png`
    - `docs/research/experiments/working/002-wide-structure-workbench/candidates/c04-struct-off-orig.png`
      -> `public/panos/adapters/dawn-valley__dusk-ridge/exp002-c04-struct-off-orig.png`
  - Added both promoted files to the existing dawn-to-dusk adapter selector registry
    in `src/pano/panoRing.ts`:
    - `exp002 c08 left-preserve`
    - `exp002 c04 original`
  - Kept existing selector options unchanged:
    - `baseline`
    - `exp001 edge-anchored`
- **Scope notes:**
  - No renderer architecture changed.
  - No UI polish was added.
  - No blend / inspect behavior changed.
  - No backend was called and no new candidates were generated.
  - No visual verdict was made this turn.
- **Important honesty note for next reviewer:** these exp002 candidates came from
  Higgsfield whole-frame image-to-image. Higgsfield did not apply
  `adapter-mask.png`, so the anchors are repainted rather than pixel-preserved.
  `blend = 0` inspection against the real neighboring plates is still required.
- **Verification:**
  - Confirmed the source candidate images are `3168 x 1344`.
  - `npm run build` passed.
- **Result:** ✅ selector promotion complete. c08 and c04 are now selectable next to
  baseline and exp001 for the next visual-verdict turn.
- **Next:** see `NEXT.md` — inspect c08/c04 against baseline and exp001 at
  `blend = 0` and `blend = 16`, judging both `dawn -> adapter` and
  `adapter -> dusk` honestly.

## Turn 9 — 2026-06-18 — Higgsfield candidate batch (dawn-valley → dusk-ridge)
- **Role:** Runner (Opus, generating from the reviewed prep artifacts)
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis (H1):** feeding the reviewed work canvas (+ optional structure guide)
  and the pair-specific prompt to a generation backend yields a believable transition
  world that avoids the exp001 left-edge dark-mass failure.
- **Backend:** Higgsfield MCP, model **nano_banana_2** (requested `nano_banana_pro`;
  MCP ran it as `nano_banana_2` — recorded as-run), `2k`, `21:9`, `3168x1344`.
  8 images, 2 credits each = **16 credits** (824.7 → ~808.7).
- **What was done:**
  - Uploaded `adapter-work-canvas.png` + `structure-guide.png` as `image` references.
  - Generated 8 candidates across 2 axes: structure-guide ON/OFF × prompt
    original/left-preserve-strong (2 seeds each). Saved to
    `experiments/working/002-wide-structure-workbench/candidates/` with a full
    `candidates.md` metadata + verdict table.
- **Honest backend limitations (fallbacks recorded in candidates.md):**
  - Higgsfield image models have **no inpaint-mask input** → `adapter-mask.png` could
    not be used; generation is whole-frame image-to-image, so anchors are **repainted,
    not pixel-preserved**. Variant **axis 2 (mask width) was not executable** and was
    dropped (would need A1111/ComfyUI).
  - No separate negative-prompt field → `negative-prompt.txt` inlined as `Avoid: ...`.
  - No seed exposed by the MCP.
- **Results:** 4 strong (c02, c04, c05, c08), 1 weak (c07), 3 failed (c01 grey
  letterbox, c03 grey center column, c06 structure-guide echo). The **exp001
  large-dark-mass-on-left failure did NOT recur** in any good candidate; left-preserve
  prompt visibly airier on the left. Grey artifacts are stochastic echoes of the flat
  grey prefill. Structure-guide ON was the riskier axis (2 of 4 failed).
- **Preliminary selection:** promote **c08** (struct-off + left-preserve) and **c04**
  (struct-off + original) next turn; alternates c02/c05.
- **Runtime / assets changed:** none. No renderer changes, no selector changes.
  **No candidate promoted into `public/panos/adapters/`** (per scope — promotion is
  next turn).
- **Result:** ✅ first candidate batch produced + logged. This does **not** accept any
  adapter visually — the real test (`blend = 0` weld against the plates) is next turn,
  and anchor mismatch is expected because anchors were repainted.
- **Next:** see `NEXT.md` — promote c08 (+ c04) into the selector and inspect.

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
