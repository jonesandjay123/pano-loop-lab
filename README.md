# pano-loop-lab

A small, clean research lab to answer one engineering question:

> **Can a Jovicheer-style far background be reduced to a data-driven image layer** —
> one wide panoramic image per scene, drifting slowly and switchable between
> scenes — **using only web primitives (HTML/CSS/a little React state)?**

This repo is **not** Jovicheer. It deliberately contains no Three.js, R3F, GSAP,
shaders, canvas, routing, backend, or any Jovicheer runtime code. The first
milestone is **not visual beauty** — it is proving the background replacement and
loop/drift mechanism with the smallest possible architecture.

## What this prototype tests

- A **scene = a manifest object** (`id`, `imageUrl`, fit/scale, drift, offset, overlay…).
- A `<PanoStage />` renders that scene's wide image as a **full-viewport background**.
- **Slow horizontal drift** via a CSS transform keyframe (no animation library).
- **No visible empty edges**: the image is painted with `background-size: cover`
  on an *overscanned* box (pulled past every viewport edge by the drift amount),
  so neither drift nor a tall/narrow viewport can scroll a seam into view.
- **Scene switching** at runtime without breaking layout.
- **`prefers-reduced-motion`** disables the drift.
- Works on **desktop and mobile** viewports (`100dvh`, `viewport-fit=cover`).

## What it intentionally does NOT test

- 3D scenes, camera control, GLB models, R3F, shaders, postprocessing.
- True infinite seamless looping of a tileable image (we use bounded drift; see
  "Open questions" below).
- Jovicheer UI: wish writing, anchor posts, persistence, scene editor.
- A full asset pipeline. The three panoramas are **real Higgsfield-generated
  matte paintings** (`public/panos/*.jpg`) swapped in over the original SVG
  placeholders to prove the mechanism holds with production-grade art; the SVGs
  remain as a lightweight fallback reference.
- Performance optimization, testing framework, auth, backend.

## Run it

```bash
npm install
npm run dev      # start the lab
npm run build    # type-check + production build (must pass)
npm run preview  # serve the built output
```

Open the dev URL, use the floating **debug panel** (top-left) to switch scenes and
read the live manifest values (id, image path, fit mode, scale, drift, offset,
reduced-motion status).

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
    scenes/
      sceneTypes.ts       # the SceneManifest data model
      sceneManifests.ts    # 3 sample scenes (dawn / dusk / moonlit)
    components/
      PanoStage.tsx        # the full-viewport panorama renderer
      DebugPanel.tsx       # floating scene selector + readout
  public/
    panos/
      dawn-valley.jpg          # real Higgsfield matte (21:9)
      dusk-ridge.jpg           # real Higgsfield matte (16:9)
      moonlit-tidelands.jpg    # real Higgsfield matte (16:9)
      dawn-placeholder.svg     # original SVG placeholders (fallback reference)
      dusk-placeholder.svg
      moon-placeholder.svg
```

## How a scene works

`PanoStage` paints three stacked layers:

1. a solid fallback gradient (no white flash before the image loads),
2. the wide image on an **overscanned box** (pulled out past every viewport edge
   by the drift amount horizontally + a margin vertically) painted with
   `background-size: cover`, drifting `±driftRangeX` of the viewport width via a
   fixed-length `translateX`, with an aesthetic `baseScale` zoom riding along, and
3. an optional overlay gradient for mood / future foreground readability.

The overscan + `cover` combination is what guarantees no empty edge appears: the
drift is a fixed screen-space shift that always stays inside the horizontal
overscan, and `cover` fills both axes so even a tall portrait phone never reveals
a bare top/bottom band (the exact failure the old `…% auto` sizing hid).

## Swapping in real art

This already happened once: the three scenes were swapped from SVG placeholders to
real **Higgsfield** matte paintings purely by editing `imageUrl` in
[`src/scenes/sceneManifests.ts`](src/scenes/sceneManifests.ts) and dropping the
JPEGs into `public/panos/` — no renderer changes. That swap-and-evaluate flow is
the point of the lab, and it held.

One finding from doing it for real: a **21:9** source (dawn) and **16:9** sources
(dusk, moon) both cover cleanly, but only because the renderer uses `cover` +
overscan. Recommended source spec: **wide** (16:9 is fine, ≈ 3:1 ideal), content
that reads as a far background, with tonally calm edges so bounded drift never
draws the eye to a border. Raster panoramas were exported as ~1 MB JPEGs (quality
88) from the 2K originals — a good size/quality balance for a full-screen plate.

## How this could feed back into Jovicheer

If the answer is "yes, a far background is just a data-driven image layer," then:

- Jovicheer scene templates can carry a small panorama manifest instead of bespoke
  3D far-background setup.
- New regions become "add a manifest + an image," not "build a scene."
- The image-only far layer can sit behind the existing 3D/interactive near layers.

## Open questions / what remains uncertain

- **Bounded drift vs. true infinite loop.** This lab uses safe bounded oscillation.
  Endless one-direction looping needs a horizontally *tileable* source image and a
  two-copy wrap; worth a follow-up once real art exists.
- **Image weight & format.** Current panoramas are ~0.7–1.1 MB JPEGs (quality 88
  from 2K). Good enough for the lab; a production pass would likely want WebP/AVIF
  and possibly per-DPR / responsive `<picture>` sources.
- **Parallax.** A single flat layer drifts as one plane. Multi-depth parallax would
  need the far background split into layered images — out of scope for P0.
- **Exact fit on extreme aspect ratios.** `cover` is robust; ultra-tall or
  ultra-wide viewports may want per-scene tuning of `baseScale` / `fitMode`.
