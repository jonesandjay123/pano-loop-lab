# pano-loop-lab — Clean Handoff

This repo is now a compact AXB loop prototype, not a broad generation research lab.

## Goal

Show a looping background made from:

```text
A plate -> AXB adapter -> B plate -> BXC adapter -> C plate -> CXA adapter -> A plate
```

Only `AXB` has a manually completed Photoshop transition right now. `BXC` and `CXA`
still use raw work canvases, so they should look unfinished in the loop. That is the
intended visual debug behavior.

## Runtime Assets

Keep runtime assets small:

```text
public/panos/dawn-valley.jpg
public/panos/dusk-ridge.jpg
public/panos/moonlit-tidelands.jpg
public/panos/adapters-clean/dawn-valley__dusk-ridge-work.png
public/panos/adapters-clean/dusk-ridge__moonlit-tidelands-work.png
public/panos/adapters-clean/moonlit-tidelands__dawn-valley-work.png
public/panos/adapters-clean/dawn-valley__dusk-ridge-photoshop-test1.png
```

Do not reintroduce candidate registries, legacy seams, GPT/HF sweeps, or image
generation experiments into `public/panos`.

## Geometry

Each adapter is a full `[A][X][B]` image:

- canvas: `3136 x 1344`
- A anchor: `523px`
- X region: `2090px`
- B anchor: `523px`

Runtime uses anchor overlap:

```text
A plate overlaps AXB's A anchor
AXB X remains visible
B plate overlaps AXB's B anchor
```

## Commands

```bash
npm run dev
npm run build
npm run preview
```

No backend, no Three.js, no GSAP, no canvas.
