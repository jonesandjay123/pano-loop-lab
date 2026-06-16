# pano-loop-lab

A research lab for the **far-background environment of an immersive 3D website**
(Jovicheer), built as a flat image strip instead of real 3D geometry — that's the
performance argument: the distant world costs almost nothing to render.

> **The hard problem:** take **N independently AI-generated panorama plates** and
> make them read as **one continuous world band** — looping forever — using only
> web primitives (HTML/CSS/React + requestAnimationFrame).

The ring is `plate0, seam0→1, plate1, …, plateN-1, seamN-1→0` (the wrap closes it).
A **seam** is a generated transition image whose left edge continues plate A and
right edge continues plate B. N plates ⇒ N seams. This is a pipeline for any N,
shown here at N=3.

No Three.js, R3F, GSAP, canvas, routing, or backend.

## Current phase: a seam *inspection lab* (not a solved seam)

The honest state: stitching independently-generated plates leaves **visible
boundaries** — colours are close, but composition, horizon height, and ridge lines
don't truly line up. This phase does **not** claim to fix that. It turns the
renderer into an instrument to *study* the boundaries and to measure how far cheap
CSS techniques get us:

- **Overlap + feather blend.** Adjacent windows can overlap by `blendVw`
  (0 / 8 / 12 / 16) and cross-fade via a CSS mask. At `blendVw = 0` they butt-join
  so the **real contact seam is revealed** — debug must not hide the problem.
- **Per-segment alignment knobs.** Every plate/seam exposes `fitMode`
  (`cover` / `height` / `width`), `scale`, `xOffset`, `yOffset` so horizons and
  ridges can be hand-aligned. (Seam edges are still `cover`-trimmed by default —
  see "What this does NOT solve".)
- **Inspect mode.** Pick any boundary to **center, hold, and highlight** it
  (magenta line) for close study; toggle labels/lines; pause auto-scroll.
- Still a continuous, drag-scrubbable, infinitely-looping ring.

What the lab already shows: for these **soft atmospheric mattes**, overlap+feather
hides most of the *tonal/line* discontinuity — but a **structural** mismatch (e.g.
a lake on the seam side meeting a mountain on the plate side) only softens into
haze; it is not resolved. That is the motivation for the next phase.

## What this does NOT solve (yet)

- **Pixel-perfect welds.** Seams *continue* their neighbours tonally, and each
  window is `cover`-cropped, so joins are visually continuous at best, not welded.
  CSS overlap cannot make a ridge line actually connect.
- The real fix is **edge-locked outpainting per boundary**: take plate A's right
  edge as a hard source, outpaint right; take plate B's left edge as a hard source,
  outpaint left; blend only in the invented middle. That is a **separate next
  phase**, to be proven on **one** boundary (dawn → dusk) before scaling to N.
- Also out of scope here: drag inertia, parallax depth, UI polish, regenerating
  all seams, any claim of "done".

## Run it

```bash
npm install
npm run dev      # opens into the auto-scrolling, drag-scrubbable ring
npm run build    # type-check + production build (must pass)
npm run preview
```

In the debug panel:
- **blend** — `raw — 0` reveals the true seams; `8/12/16vw` test overlap blending.
- **inspect** — center & hold one boundary for study (auto-pauses).
- **boundary labels + lines** — show every contact line + its A▸B label.
- **pause auto-scroll** — freeze the loop. Drag the background to scrub.

## Project structure

```
src/
  App.tsx                    # owns the SeamLabState (blend/labels/pause/inspect)
  pano/
    panoTypes.ts             # PanoPlate, PanoSeam, PanoRingConfig, RingSegment, RingBoundary
    panoRing.ts              # default ring + buildRingSegments / buildBoundaries / seamCoverage
    usePanoRingScroll.ts     # rAF auto-scroll + drag + inspect-centering, infinite wrap
  components/
    PanoRingStage.tsx        # overlap/feather renderer + per-segment knobs + SeamLabState
    DebugPanel.tsx           # readout + lab controls
public/panos/
  dawn-valley.jpg  dusk-ridge.jpg  moonlit-tidelands.jpg     # plates (Higgsfield)
  seams/
    dawn-valley__dusk-ridge.jpg          # seam A→B (Higgsfield)
    dusk-ridge__moonlit-tidelands.jpg    # seam B→C
    moonlit-tidelands__dawn-valley.jpg   # seam C→A (wrap)
```

## How it works

1. `buildRingSegments(config)` flattens plates + seams into the ordered window list
   (wrapping last→first), resolving each window's fit/scale/offset defaults.
2. `PanoRingStage` renders that sequence **twice** in a flex track. Each window is
   `widthVw` wide; the image layer is `cover`/`height`/`width`-sized, panned by
   `xOffset`/`yOffset`, zoomed by `scale`, and **overscanned 6%** so the pan knobs
   don't reveal an edge. With `blendVw > 0`, windows get `margin-left: -blendVw`
   and a left/right `mask-image` feather so the overlap cross-fades.
3. `usePanoRingScroll` drives the track's `translate3d` via `requestAnimationFrame`,
   keeping `offset` in `[0, sequenceWidth)` by modulo (infinite both ways). Auto-
   scroll advances it; pointer drag scrubs it; inspect snaps it to a boundary
   centre. All share the one wrapped offset, so hand-offs never jump.

### Adding plates (the N-image pipeline)

Add a `PanoPlate` plus the two `PanoSeam`s connecting it to its new neighbours
(regenerate the affected wrap seam). No renderer changes — the ring re-assembles.

## Roadmap

```
done   : continuous ring + N seams + overlap/feather + per-segment knobs + inspect lab
next   : edge-locked OUTPAINT on ONE boundary (dawn → dusk), verify a real weld
then   : scale the proven outpaint method to all N seams
later  : drag inertia, parallax depth bands, format/responsive passes
```

## Open questions

- **How much can overlap+offset hide?** The lab exists to answer this per boundary;
  early read: most tonal mismatch, not structural.
- **Edge preservation vs. fill.** `cover` trims the seam's engineered edges; a
  `height`/`width` fit preserves them but letterboxes — the real answer is the
  outpaint phase, not a CSS fit mode.
- **Loop closure.** The wrap seam (C→A) is the hardest; outpaint must still meet
  plate A's left edge there.
