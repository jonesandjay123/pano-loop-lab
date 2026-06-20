# FINDINGS.md — proven / disproven hypotheses

> Durable knowledge, distilled from `EXPERIMENT_LOG.md`. The log is chronological
> and messy; this file is the **clean, deduplicated** set of conclusions a future
> session can trust. Updated by the **Archivist**. Each entry must point back to the
> experiment(s) that justify it.

## Legend
- ✅ **Supported** — repeatedly held up under `blend = 0` inspection.
- ❌ **Disproven** — tried, did not meet success criteria.
- 🟡 **Inconclusive** — needs another turn before we trust it.

---

## Confirmed so far

- 🟡 **CSS overlap + feather is auxiliary, not a solution.** On soft atmospheric
  mattes it hides ~70% of tonal / hard-line mismatch but cannot weld structure
  (ridge lines, lake-vs-mountain). _Source: pre-loop inspection lab, HANDOFF.md §1._

- 🟡 **Single edge-crop anchored generation is promising but not proven.** In Loop 2,
  using `dawn-valley` right-edge and `dusk-ridge` left-edge crops removed much of
  the baseline's lake-to-land collision at the `adapter -> dusk-ridge` join, but
  introduced a large dark mountain/value mass at the `dawn-valley -> adapter` join.
  The result is INCONCLUSIVE, not accepted. Loop 3 review agreed with that verdict.
  _Source: EXPERIMENT_LOG.md Turns 2 and 3._

- ✅ **Comparison registration must keep baseline and candidates selectable.** Loop
  3 found that Loop 2 preserved the baseline file but replaced the active
  `dawn-valley -> dusk-ridge` seam in `PANO_RING`, leaving comparison dependent on
  manual code/config swaps. Loop 4 repaired that gap with a minimal selector, and
  Loop 5 verified it. Future experiments should register new adapters as selectable
  comparison options, not replacements. _Source: EXPERIMENT_LOG.md Turns 3, 4, and
  5._

- ✅ **Baseline/candidate comparison is now selectable for `dawn-valley -> dusk-ridge`.**
  Loop 4 added a minimal debug-panel comparison selector backed by a small
  data/config registry, so the original baseline and `exp001-edge-anchored-v1` can
  be inspected without manual code swaps. Loop 5 confirmed that only the
  dawn-to-dusk seam URL changes, while blend and inspect controls still work at
  `blend = 0` and `blend = 16`. This is a tooling finding only; it does not accept
  the adapter visually. _Source: EXPERIMENT_LOG.md Turns 4 and 5._

- ✅ **The next engineering unit should be an Adapter Workbench, not a loop-engine
  rewrite.** Source inspection of `openOutpaint` and `stablediffusion-infinity`
  suggests the practical missing layer is a repeatable prep/generation contract:
  edge crops, wide adapter work canvas, explicit mask, optional structure guide,
  prompt files, manifest, and candidate batch output. This supports Jones's goal
  of generating several candidates and selecting the best, while leaving the
  existing React/CSS renderer intact. _Source: EXPERIMENT_LOG.md Turn 6 and
  `adapter-workbench-source-dive.md`._

- ✅ **The no-backend prep contract is implemented and reviewed-READY.**
  `npm run adapter:prep` deterministically produces edge crops, a wide work canvas
  (opaque center, no hole), an explicit preserve/regenerate mask with anchor
  overmask, a low-frequency structure guide, prompt/negative-prompt files, and a
  manifest — reproducible to the byte except for the manifest timestamp. This is a
  **tooling** finding only: it does **not** evaluate adapter visual quality. The
  original Turn 7/8 limitation was that prompt text was hardcoded to dawn-to-dusk;
  that limitation is superseded by the Turn 16 all-pairs AXB CLI. _Source:
  EXPERIMENT_LOG.md Turns 7 (runner) and 8 (review)._

- ✅ **The prep contract is now an all-pairs AXB pipeline with narrow sockets.**
  Turn 16 updated `scripts/adapter-prep.mjs` from a dawn-to-dusk/single-pair helper
  into a deterministic batch CLI that prepares one workbench per adjacent ordered pair.
  The original Turn 16 default was `3136 x 1344`,
  `A : X : B = 1 : 12 : 1`, `224px` anchors, `2688px` editable X region, opaque
  gradient prefill, separate mask, and `32px` overmask into each anchor. Turn 21
  superseded this as the primary baseline with `1:4:1`, but the all-pairs prep
  contract remains supported. This is a tooling finding only: it prepares standard
  inpainting inputs and does not prove any generated adapter visually works. _Source:
  EXPERIMENT_LOG.md Turn 16 and
  `docs/research/experiments/working/006-axb-prep/index.json`._

- ✅ **Primary AXB baseline is now 1:4:1, with source plates allowed to be ultra-wide.**
  Turn 21 promoted `A : X : B = 1 : 4 : 1` as the main prep geometry. At the retained
  `3136 x 1344` export size this rounds to `523px` anchors and a `2090px` X region.
  The prep script normalizes source images by height and crops only edge anchors, so
  plate source width is not locked; normal, wide, and ultra-wide plates are valid as
  long as the normalized source is at least one anchor wide. _Source:
  EXPERIMENT_LOG.md Turn 21 and `public/panos/adapter-prep/index.json`._

- ✅ **Candidate registry should be generated from JSON, not manually duplicated in TS.**
  Turn 22 added an import path that updates `public/panos/adapter-candidates/.../candidates.json`
  and regenerates `src/pano/adapterCandidates.generated.ts`. Both dashboard and seam-lab
  selector now read generated candidate entries from that registry, so future GPT
  imports do not require hand-editing multiple TypeScript files. _Source:
  EXPERIMENT_LOG.md Turn 22._

- ❌ **Higgsfield whole-frame image-to-image makes pretty standalone panoramas that do
  NOT pixel-weld at `blend = 0`.** Turn 9 produced clean coherent dawn→dusk panoramas
  with `nano_banana_2`, and **none reproduced the exp001 left-edge dark-mass failure**.
  But Higgsfield image models have **no inpaint-mask parameter**, so the whole frame is
  repainted and the anchor crops are **not** pixel-preserved. Turn 11 inspected the
  promoted c08/c04 at `blend = 0` (runtime seam lab + pixel-exact butt-join composites)
  and confirmed the seam exposes the mismatch: on `dawn -> adapter` the airy adapters
  **under-match** `dawn-valley`'s dark right-edge ridge (a value/structure step);
  `exp002 c04` additionally keeps a warm sunlit peak that clashes with the cool dusk
  plate on `adapter -> dusk`, while `exp002 c08` welds the dusk side cleanly. `blend = 16`
  feather hides most of the tonal step but not the structure — reaffirming that **CSS is
  auxiliary, not a welder**. Net: whole-frame generation is **insufficient for a true
  weld; a mask-preserving inpaint backend is required.** Best whole-frame candidate so
  far = **c08** (cleanest dusk weld, most socket-friendly left). Secondary tooling
  observations carried from Turn 9: (a) the flat-grey prefill **leaks** into some seeds
  as grey bars/columns; (b) the structure guide as a reference is **risky** (2 of 4
  structure-ON runs failed). _Source: EXPERIMENT_LOG.md Turns 9 & 11;
  `.../002-wide-structure-workbench/candidates/candidates.md` and `review/join-*.jpg`._

- ? **ComfyUI hard-mask inpaint proves anchor preservation, but not the visual weld yet.**
  Turn 13 ran SDXL diffusers inpaint locally on the RTX 5080 through ComfyUI. The
  `ImageCompositeMasked` restore step preserved every black-mask anchor pixel exactly
  at round-1 size (`changed_values = 0`, `max_abs_diff = 0`) for both candidates, so
  mask polarity and the local backend are validated. But using the same hard mask for
  final composite created a visible internal vertical break where the generated center
  meets the protected right anchor; the candidates are diagnostic only and should not be
  promoted. Next test should keep the outer anchor edges exact while feathering/gradient
  compositing only across the overmask band. _Source: EXPERIMENT_LOG.md Turn 13;
  `.../002-wide-structure-workbench/review/inpaint-sdxl-anchor-diff.json` and
  `inpaint-sdxl-*-internal-weld.jpg`._

- ? **Soft composite restore removes the hard-mask artifact, but exposes a content
  guidance problem.** Turn 14 applied deterministic feathered compositing to the Turn 13
  SDXL inpaint pixels. All softcomp variants kept the outer plate-facing anchors
  pixel-exact (`max_abs_diff = 0` on both sides), and `softcomp-02` / `softcomp-03`
  materially reduced the bright vertical internal seam caused by the hard restore mask.
  The batch still is not selector-ready: the center generated by SDXL remains too warm,
  heavy, and dawn-facing before it meets the cool dusk anchor. Net: keep soft composite
  as the current restore recipe, but the next variable must guide the generated content
  and right-side color/world transition. _Source: EXPERIMENT_LOG.md Turn 14;
  `.../004-soft-composite-restore/candidates/candidates.md` and
  `review/compare-softcomp-vs-hard-c08-c04.jpg`._

- ❌ **Right-aware prompting alone does not fix official SDXL inpaint's dusk-side
  transition.** Turn 15 changed only the positive prompt, explicitly asking the right
  third to cool into blue-violet dusk ridges and avoid warm walls / central dark mass.
  The run regenerated two new SDXL inpaint raws and restored them with the proven 64px
  soft composite. Outer anchors stayed exact (`max_abs_diff = 0` both sides), but the
  generated center still remained warm/heavy before meeting the cool dusk anchor.
  `rightaware-02` is the best diagnostic sample, but not a selector candidate. Prompt
  text alone is therefore insufficient for this baseline; next probe should change mask
  geometry or add a single structure/color guidance mechanism. _Source:
  EXPERIMENT_LOG.md Turn 15 and
  `.../005-sdxl-content-guidance/candidates/candidates.md`._

- 🟡 **AXB reference generation can populate candidate batches, but still needs
  `blend = 0` review.** Turn 18 used Higgsfield `nano_banana_2` with the AXB work
  canvas and mask as reference images to generate two dawn-to-dusk candidates. This
  proves the dashboard/candidate batch path is usable, but not visual acceptance:
  Higgsfield did not expose a true mask-inpaint parameter for this route, so anchors
  are not pixel-guaranteed and the candidates must be judged as whole-frame reference
  generations. _Source: EXPERIMENT_LOG.md Turn 18._

- ❌ **Whole-frame AXB reference candidates are not enough; they move the seam inside
  the adapter.** Turn 19 reviewed `hf-nb2-axb-01` and `hf-nb2-axb-02` with
  deterministic butt-join composites and internal boundary crops. The candidates make
  the immediate external plate joins look closer because they carry copied A/B anchor
  strips, but both leave visible vertical bands where those anchors meet generated X.
  This rejects whole-frame reference generation as the final AXB method. The next
  viable direction is true mask-inpaint or a pipeline that extracts/composites only X
  while restoring exact anchors. _Source: EXPERIMENT_LOG.md Turn 19 and
  `.../008-dawn-dusk-candidate-review/review/compare-external-joins.png`._

## Open hypotheses (not yet tested in the loop)

- **H1 — Pair-specific adapter generation** (primary candidate). Generate a dedicated
  `A→B` image from the (A,B) pair; must read as a *transition world*, not a colour
  average. Most aligned with pluggability.
- **H2 — Socket-friendly scene edges** (a generation *tendency*, not a fixed size).
  Generate plate edges that are transition-able (fog / sky / water / distant ridges).
- **H3 — Layered generation.** Split into sky / far-mountains / mist / mid / water;
  transition per layer. Adapter may be multi-layer assets.
- **H4 — Emotional / ritual continuity** for event scenes (snow veil, glow, ribbons,
  fog waves) — "world hop", not same-map. Natural fit for Jovicheer.
- **Likely answer = HYBRID:** wide plates + socket-friendly edges + pair-specific
  adapters + fog/light/particle cover.

> See HANDOFF.md §4 for full descriptions and generation approaches to try.
