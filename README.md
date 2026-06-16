# pano-loop-lab

A research lab for the **far-background environment of an immersive 3D website**
(Jovicheer), built as a flat image strip instead of real 3D geometry — that's the
performance argument: the distant world costs almost nothing to render.

> **Can N panorama plates be stitched into one continuous, seamless background
> RING** — auto-scrolling and drag-scrubbable, looping a full lap back to the
> start — **using only web primitives (HTML/CSS/React + requestAnimationFrame)?**

The key idea is the **seam**. Between every two adjacent plates sits a generated
*transition image* whose left edge continues plate A and whose right edge continues
plate B, so A→B reads as one world rather than a hard cut. A ring of **N** plates
therefore has **N** seams (including the wrap seam from the last plate back to the
first). This is a **pipeline for any N**, demonstrated here at N=3.

No Three.js, R3F, GSAP, canvas, routing, or backend — the whole point is that the
far layer is a plain CSS image strip.

## What this prototype tests

- An ordered **ring**: `plate0, seam0→1, plate1, seam1→2, …, plateN-1, seamN-1→0`,
  assembled automatically from the config for any number of plates.
- **Seams** (Higgsfield-generated) that visually bridge each adjacent pair so the
  journey is continuous, plus the **wrap seam** that closes night → dawn.
- **Endless auto-scroll**: the assembled sequence is rendered twice and a
  modulo-wrapped `translateX` loops forever with no visible jump.
- **Manual drag**: grab the background and scrub left/right at any time; auto-scroll
  pauses while held and resumes exactly where you let go.
- **No empty edges**: each window is `100vw` painted `cover`, so it fills any aspect
  (desktop or portrait).
- **Seam inspection**: a debug toggle marks every boundary and tints seam windows.
- **`prefers-reduced-motion`** pauses auto-scroll (drag still works).

## What it intentionally does NOT yet prove

- **Pixel-exact edge matching.** Seams are generated to *continue* their neighbours
  tonally and compositionally, and each window is `cover`-cropped, so the join is
  visually continuous but not pixel-welded. A future pass could pin seam widths to
  the image aspect (no horizontal crop) for exact edge alignment.
- **Drag inertia / momentum.** Drag is a direct 1:1 scrub; no fling physics yet.
- **Parallax depth.** The ring is one flat plane.
- **Foreground / Jovicheer integration** (the interactive 3D near layers, wish UI).
- Performance optimization beyond "it's just CSS", testing framework, backend.

## Run it

```bash
npm install
npm run dev      # opens straight into the auto-scrolling, drag-scrubbable ring
npm run build    # type-check + production build (must pass)
npm run preview  # serve the built output
```

The floating **debug panel** is an instrument readout (plate count, seam coverage,
the assembled ring order, lap time, motion mode) plus a **"show segment seams"**
toggle. It does not drive the motion — the ring moves on its own and responds to
drag.

## Project structure

```
pano-loop-lab/
  src/
    main.tsx
    App.tsx
    styles.css
    useReducedMotion.ts
    pano/
      panoTypes.ts          # PanoPlate, PanoSeam, PanoRingConfig, RingSegment
      panoRing.ts           # default ring + buildRingSegments() / seamCoverage()
      usePanoRingScroll.ts   # rAF auto-scroll + pointer-drag, infinite modulo wrap
    components/
      PanoRingStage.tsx     # the continuous ring renderer
      DebugPanel.tsx        # ring readout + seam toggle
  public/
    panos/
      dawn-valley.jpg              # plate A (Higgsfield, 21:9)
      dusk-ridge.jpg               # plate B (Higgsfield, 16:9)
      moonlit-tidelands.jpg        # plate C (Higgsfield, 16:9)
      seams/
        dawn-valley__dusk-ridge.jpg          # seam A→B (Higgsfield)
        dusk-ridge__moonlit-tidelands.jpg    # seam B→C (Higgsfield)
        moonlit-tidelands__dawn-valley.jpg   # seam C→A (wrap, Higgsfield)
      *-placeholder.svg            # original SVG placeholders (fallback reference)
```

## How the ring works

1. `buildRingSegments(config)` flattens plates + seams into the ordered window list
   `[plate, seam, plate, seam, …]`, wrapping last → first. A missing seam simply
   butt-joins its neighbours, so the ring still works at any seam coverage.
2. `PanoRingStage` renders that sequence **twice** in a flex track; each window is
   `flex: 0 0 100vw`, full height, `overflow: hidden`, with an inner image painted
   `cover` (its `baseScale` zoom / vertical framing clipped to the window).
3. `usePanoRingScroll` drives the track's `translate3d` imperatively via
   `requestAnimationFrame`, keeping an `offset` in `[0, sequenceWidth)` by modulo so
   it loops forever both ways. Auto-scroll advances the offset; a pointer drag
   overrides it and scrubs directly. Because both share the same wrapped offset,
   releasing a drag resumes auto-scroll with no jump.

### Adding plates (the N-image pipeline)

Add a `PanoPlate` to `plates` and the two `PanoSeam`s that connect it to its new
neighbours (regenerate the affected wrap seam too). No renderer changes — the ring
re-assembles itself. Generate seams with Higgsfield: pass the two adjacent plate
images as references and prompt for a left→right transition with one continuous
horizon and no hard seam (see the prompts used for the current three in git
history / `params` of the Higgsfield generations).

## How this feeds back into Jovicheer

A region's far background becomes a small **ring manifest** (ordered plates +
seams + lap time) loaded at runtime and rendered as this CSS strip behind the
interactive 3D near layers — cheap, data-driven, and template-friendly. New regions
are "list plates + generate seams," not "build a 3D scene."

## Open questions / what remains uncertain

- **Edge precision.** `cover`-cropping each `100vw` window trims a little off seam
  edges. Pinning seam window width to the image's natural aspect (height-fit, no
  horizontal crop) would align edges exactly — at the cost of variable segment
  widths. Worth trying next.
- **Seam length / pacing.** Seams are currently the same `100vw` as plates; making
  them narrower or wider changes how fast the world morphs.
- **Drag feel.** Add inertia/snap-to-plate if the scrub feels too raw.
- **Image weight.** Plates + seams are ~0.6–1.1 MB JPEGs (quality 88 from 2K). A
  production pass would want WebP/AVIF and responsive sources.
- **Parallax.** Splitting each plate into depth bands would add real 3D-feel — a
  separate experiment.
