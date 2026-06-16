# pano-loop-lab

A small, clean research lab to answer one engineering question:

> **Can multiple generated panorama plates be arranged into a continuous moving
> background *reel* that feels like one wider world** — a slow, endless
> side-scrolling far background — **using only web primitives (HTML/CSS/a little
> React state)?**

It is **not** "can we swap backgrounds with a dropdown?" — that's a trivial
manifest check. The thing worth proving is whether ordered panorama **segments**
can be stitched into one horizontal **loop track** that scrolls forever and wraps
without a visible jump.

This repo is **not** Jovicheer. It deliberately contains no Three.js, R3F, GSAP,
shaders, canvas, routing, backend, or any Jovicheer runtime code. The first
milestone is **not visual beauty** — it is proving the continuous-strip loop
mechanism with the smallest possible architecture.

## What this prototype tests

- An ordered **pano strip**: segments laid side-by-side into one horizontal track.
- The strip **scrolls left forever** and **loops seamlessly** back to the start.
- Seamless wrap via a **duplicated sequence** `[A, B, C, A, B, C]` animated from
  `translateX(0)` to `translateX(-50%)` (linear, infinite). −50% of the track is
  exactly one sequence, and the second half is identical to the first, so the wrap
  point is pixel-identical — no jump.
- **No manual scene selection** — the reel auto-plays on load.
- **No visible empty edges**: each segment is a `100vw` window painted with
  `background-size: cover`, so it fills any viewport aspect (desktop or portrait).
- **Segment-boundary inspection**: a debug toggle draws a thin line + id label at
  each seam so you can judge whether A→B→C reads as a continuous journey.
- **`prefers-reduced-motion`** pauses the loop.

## What it intentionally does NOT yet prove

- **True image-seam blending.** Boundaries between segments are currently *hard
  cuts*. This lab tests the loop *mechanism*, not smooth visual continuity across
  the seam.
- **AI-generated tileable panoramas / connecting "seam" plates** (e.g. a B→C
  transition frame generated to bridge two scenes). The three plates here were
  generated independently.
- **Parallax depth.** The strip moves as one flat plane.
- **Foreground integration with Jovicheer** (wish UI, anchor posts, near layers).
- Performance optimization, testing framework, auth, backend.

## Run it

```bash
npm install
npm run dev      # start the lab — it loops automatically
npm run build    # type-check + production build (must pass)
npm run preview  # serve the built output
```

The app opens **directly into the auto-looping reel**. The floating **debug panel**
(top-left) is an instrument readout, not the main control: it reports segment
count, ordered ids, loop duration, the virtual `[A,B,C,A,B,C]` track, and
reduced-motion status, and offers a **"show segment seams"** toggle for inspection.

## Project structure

```
pano-loop-lab/
  index.html
  vite.config.ts
  src/
    main.tsx
    App.tsx
    styles.css
    useReducedMotion.ts
    pano/
      panoTypes.ts        # PanoSegment + PanoLoopConfig data model
      panoLoop.ts         # the default reel (3 ordered segments)
    components/
      PanoLoopStage.tsx   # the continuous horizontal strip renderer
      DebugPanel.tsx      # floating loop readout + seam toggle
  public/
    panos/
      dawn-valley.jpg          # real Higgsfield matte (21:9)
      dusk-ridge.jpg           # real Higgsfield matte (16:9)
      moonlit-tidelands.jpg    # real Higgsfield matte (16:9)
      dawn-placeholder.svg     # original SVG placeholders (fallback reference)
      dusk-placeholder.svg
      moon-placeholder.svg
```

## How the loop works

`PanoLoopStage` renders:

1. a stage container that fills the viewport with `overflow: hidden` (and a solid
   fallback gradient so there's no white flash before images paint),
2. a flex **track** holding the segment sequence **rendered twice**
   (`[...segments, ...segments]`); each segment is `flex: 0 0 100vw`, full height,
   `overflow: hidden`, with an inner image layer painted `cover` (its `baseScale`
   zoom / vertical framing are clipped to the window so they never bleed across a
   seam), and
3. an optional vignette painted across the whole viewport above the strip.

The track animates `pano-loop` from `translateX(0)` to `translateX(-50%)`, `linear
infinite`. Because the second half of the track is identical to the first, when it
reaches −50% the visible result equals the start → the loop is seamless. Direction
`"right"` is supported via `animation-direction: reverse`.

Data model (`src/pano/panoTypes.ts`):

- **`PanoSegment`** — `id`, `label`, `imageUrl`, `fitMode`, `baseScale`,
  `verticalOffset`, optional `overlayGradient`, optional `notes`.
- **`PanoLoopConfig`** — `id`, `label`, `segments: PanoSegment[]`,
  `loopDurationSeconds`, optional `direction`, optional `overlayGradient`, `notes`.

## How this could feed back into Jovicheer

If a far background can be a *continuous data-driven strip*, then a Jovicheer
region could ship as a small loop manifest (ordered plates + duration) rather than
a bespoke 3D far-background setup, sitting behind the existing interactive near
layers. New regions become "list some plates in order," not "build a scene."

## Open questions / what remains uncertain

- **Seam continuity.** The hard cut between independently-generated plates is the
  weakest point. Next step is likely **Higgsfield-generated connecting plates** (a
  panel whose left edge matches scene A and right edge matches scene B), or a soft
  cross-fade band at each boundary, so the journey reads as one world.
- **Tileable wrap plate.** The wrap C→A is also a hard cut; a plate designed so its
  right edge meets its own left edge would make the full loop feel endless.
- **Per-segment width.** Every segment is exactly `100vw`; very wide (21:9) plates
  are cropped to a viewport window. Showing more of each plate (segments wider than
  the viewport) is a tuning question once seam blending is solved.
- **Image weight & format.** Plates are ~0.7–1.1 MB JPEGs (quality 88 from 2K). A
  production pass would likely want WebP/AVIF and responsive sources.
- **Parallax.** A single flat strip has no depth; multi-layer parallax would need
  each plate split into depth bands — out of scope for now.
