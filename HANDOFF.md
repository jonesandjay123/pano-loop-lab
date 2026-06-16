# pano-loop-lab — Handoff & Research Brief (v1)

> Read this first. It tells a fresh session exactly where we are, what is solved,
> and what the ONE hard problem actually is. The previous sessions repeatedly
> mis-scoped this repo (loop animation → seam-blending → outpaint). The scope was
> corrected on **2026-06-16**. Do not regress to the earlier framings.

---

## 0. One-line core problem (the only thing this repo exists to solve)

> **Build a modular panoramic world strip where ANY two scene plates placed next to
> each other can get a believable transition generated on demand — so scenes can be
> inserted / swapped / removed at any time without redoing the existing plates.**

Concretely: today the loop is `A → B → C`. Tomorrow, for Christmas / snow / a World
Cup event, we want to drop a seasonal scene **between A and B** and have it just
work — by adding two **adapters** (`A→Christmas`, `Christmas→B`), **without
re-generating A or B**. That pluggability is the whole point.

This is NOT "extend A's right edge until it reaches B." A permanent A→B extension
breaks the moment you want to insert something else between them.

---

## 1. Current state — what is built and STABLE (don't rebuild)

Tech: Vite + React 18 + TypeScript + plain CSS. **No** Three.js / R3F / GSAP /
canvas / routing / backend. `npm run build` passes, TS clean.

Working today:
- **N-plate + N-seam ring model.** `buildRingSegments()` assembles
  `[plate0, seam0→1, plate1, …, plateN-1, seamN-1→0]` for **any N** (pipeline, not a
  fixed 3-up). Files: `src/pano/panoTypes.ts`, `src/pano/panoRing.ts`.
- **Continuous infinite loop.** Sequence rendered twice; `usePanoRingScroll`
  (`src/pano/usePanoRingScroll.ts`) drives `translate3d` via requestAnimationFrame
  with a modulo-wrapped offset → endless both directions, pixel-seamless wrap.
- **Manual drag scrub** (no inertia) + auto-scroll, sharing one offset (hand-off
  never jumps).
- **Seam *inspection lab*** (`PanoRingStage.tsx` + `DebugPanel.tsx`):
  - `blend` 0 / 8 / 12 / 16 vw overlap + CSS-mask feather. **`blend = 0` butt-joins
    so the REAL seam is revealed** — debug stays honest, never hides the problem.
  - Per-segment alignment knobs: `fitMode` (cover/height/width), `scale`,
    `xOffset`, `yOffset` (image layer overscanned 6% so pans don't expose an edge).
  - **Inspect mode**: center, hold, highlight (magenta) any boundary; toggle
    labels/lines; pause.
- **Assets** (`public/panos/`): 3 plates + 3 seams, all generated with **Higgsfield
  `nano_banana_2`, 21:9, 2k**, feeding the two adjacent plates as `medias` (role
  `image`). Seams in `public/panos/seams/<fromId>__<toId>.jpg`.

### Honest finding from the inspection lab
For these **soft atmospheric mattes**, CSS overlap + feather hides most of the
**tonal / hard-line** mismatch (~"70%"). It does **NOT** fix **structural** mismatch
— e.g. a lake on the seam side meeting a mountain on the plate side only softens
into haze. CSS is auxiliary; it cannot make ridge lines actually connect.

---

## 2. The mental model to adopt (plate vs adapter)

Stop thinking `A, B, C, D`. Think of an **adapter graph**:

```
Plate A · Adapter A→B · Plate B · Adapter B→C · Plate C · Adapter C→A
```

- An **Adapter** (we currently call it a "seam") belongs to **neither** neighbour.
  It is **pair-specific**, generated from the (A,B) relationship, and is
  cacheable / replaceable / regenerable.
- Insert an event scene by editing the graph only:
  ```
  Plate A · Adapter A→Christmas · Plate Christmas · Adapter Christmas→B · Plate B
  ```
  A and B are untouched; the old `Adapter A→B` stays in cache (not deleted).
- **Separate scene body from transition material.** Renderer already supports this
  (plate vs seam segments) — the model rename plate→`ScenePlate`, seam→`Adapter`
  is a documentation/naming step, the structure is already there.

Reframed research question (put this in any future README):
> *Can we build a pipeline of scene plates + generated pair-specific adapters such
> that any two scenes placed adjacent get a believable mid-transition — on demand,
> without modifying the scenes themselves?*

---

## 3. Deliberately NOT decided yet (do not lock these)

- **Fixed plate / seam widths.** We discussed standardizing widths (PLATE_WIDTH,
  SEAM_WIDTH, SOCKET_WIDTH) so Jovicheer can place a fixed number of wish-paper
  (紙條) objects per plate on stable world coordinates. **This is deferred on
  purpose.** The user wants each scene to be **generously WIDE** (爽度), and does
  not want to cage the design before the generation method is found. Revisit sizing
  AFTER the generation/transition method works. (Why it matters later: object
  placement slots, anchors, camera stops, mobile viewport all need predictable
  world X-coords; objects should live in a plate's safe zone, never in a seam.)

---

## 4. The actual next research = GENERATION methodology (not CSS, not sizing)

The next session should investigate **how to generate plates and adapters**, by
testing these hypotheses (one at a time, with honest inspection):

- **H1 — Pair-specific adapter generation.** Generate a dedicated `A→B` image from
  the (A,B) pair. Must read as a *transition world*, not just "colour averaged
  between A and B": horizon not jumping, big shapes not colliding, fore/mid/back
  language not snapping. Most aligned with pluggability. **Primary candidate.**
- **H2 — Socket-friendly scene edges (a generation *tendency*, not a fixed size).**
  Generate plates whose left/right edges are *transition-able* — fog / sky / water /
  distant ridges / low-detail slopes — instead of a giant peak or a hard lakeline
  hitting the border. Raises every adapter's success rate.
- **H3 — Layered generation.** Split background into sky / far-mountains / mist /
  mid-silhouettes / water-land. Transition per layer (sky & mist are easy; terrain
  structure is the hard one). Adapter may be *multi-layer assets*, not one image.
  More complex, possibly strongest long-term (games/animation do this).
- **H4 — Emotional/ritual continuity for event scenes.** Some inserts (Christmas,
  snow, World Cup) aren't geographic neighbours; the adapter can be a *ritual*
  transition (snow veil, glow, ribbons/紙條 swarm, fog waves, moonlight clouds) —
  "world hop", not same-map. Natural fit for Jovicheer.
- **Likely answer = HYBRID:** wide plates + socket-friendly edges + pair-specific
  adapters + fog/light/particle cover, composed together.

### Generation approaches worth trying for an adapter
- Two plates as references → generate one bridge (what we did; tonally OK, structure
  not welded).
- Crop A's right strip + B's left strip → generate the bridge *between* them
  (edge-anchored; the earlier `55e9887c` experiment hinted at this).
- Semantic/described intermediate scene → then style it.
- Structure sketch first, then style pass.
- Layered adapter (per H3).
Higgsfield tools available: `generate_image`, `outpaint_image`, `reframe`,
`remove_background`, `upscale_image`, `models_explore`. Credits were ~825 (plus
plan) as of handoff.

---

## 5. Success criteria (so we don't self-congratulate)

- **Visual:** no hard colour break, no value break, horizon not jumping, main
  structures not colliding across the join.
- **World-feel:** looks like one journey, not two wallpapers taped together.
- **System:** works for an **arbitrary** pair; inserting Christmas / Snow / World
  Cup still works without touching neighbours.
- **Division of labour:** decide what generation can vs. can't own — big shapes &
  sky (yes), precise welds (need post-processing), fog/light (great for *hiding*
  transitions), object-placement zones (must be annotated, never random).

---

## 6. Do NOT do next (explicit guardrails)

- Don't lock plate/seam/socket sizes yet.
- Don't treat the fix as "outpaint A permanently into B."
- Don't keep polishing CSS as if it's the core (it's auxiliary).
- Don't add drag inertia, parallax, or UI polish.
- Don't add Three.js / R3F / GSAP / canvas / backend.
- Don't regenerate everything or claim "pixel-perfect / done."

> **Do not optimize for making the current three-scene demo look good. Optimize for
> discovering a repeatable adapter-generation method that would still work if the
> middle scene is replaced by Christmas / Snow / World Cup tomorrow.**

---

## 7. Suggested first move for the next session

Do **not** open the editor first. Start by writing a short **generation spec**:
pick **H1** (pair-specific adapter) and design 2–3 concrete Higgsfield experiments
on **one** pair (e.g. dawn → dusk) — including the *edge-anchored* variant (crop A's
right + B's left, generate the middle) — then judge them against §5 with the repo's
inspect mode (`blend = 0` to see the truth). Only after a method looks promising do
we revisit fixed sizing (§3) and the plate/adapter model rename.

---

## 8. Run it / file map

```bash
npm install && npm run dev      # opens into the auto-scrolling, drag-scrubbable ring
npm run build                   # type-check + production build
```

```
src/
  App.tsx                     # owns SeamLabState (blend/labels/pause/inspect)
  pano/
    panoTypes.ts              # PanoPlate, PanoSeam, PanoRingConfig, RingSegment, RingBoundary
    panoRing.ts               # buildRingSegments / buildBoundaries / seamCoverage + default ring
    usePanoRingScroll.ts      # rAF auto-scroll + drag + inspect-centering, infinite wrap
  components/
    PanoRingStage.tsx         # overlap/feather renderer + per-segment knobs
    DebugPanel.tsx            # readout + lab controls
public/panos/                 # 3 plates + seams/ (Higgsfield, nano_banana_2, 21:9 2k)
README.md                     # current (seam-lab) state
HANDOFF.md                    # this file — the redefined core problem
```

## 9. Glossary
- **Scene Plate** — a wide background "scene" (currently `PanoPlate`/"plate").
- **Adapter** — pair-specific transition between two plates (currently
  `PanoSeam`/"seam"). Belongs to neither plate; cacheable; regenerable.
- **Socket** — a plate's low-detail, transition-friendly left/right edge region
  (concept only; not implemented).
- **Placement zone** — the safe interior of a plate where Jovicheer puts wish-paper
  / interactive objects; never the adapter (concept only; not implemented).
