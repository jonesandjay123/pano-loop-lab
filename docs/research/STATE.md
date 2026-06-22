# STATE.md — current repo state

Last updated: 2026-06-22.

## Current Shape

`pano-loop-lab` is a clean AXB loop prototype.

Runtime sequence:

```text
dawn-valley -> AXB -> dusk-ridge -> BXC -> moonlit-tidelands -> CXA -> dawn-valley
```

Only `AXB` is manually completed:

```text
public/panos/adapters-clean/dawn-valley__dusk-ridge-photoshop-test1.png
```

`BXC` and `CXA` intentionally still use raw work canvases:

```text
public/panos/adapters-clean/dusk-ridge__moonlit-tidelands-work.png
public/panos/adapters-clean/moonlit-tidelands__dawn-valley-work.png
```

They should look unfinished in the loop until a human fills their X regions.

## Runtime Assets

The clean runtime asset set is:

```text
public/panos/dawn-valley.jpg
public/panos/dusk-ridge.jpg
public/panos/moonlit-tidelands.jpg
public/panos/adapters-clean/dawn-valley__dusk-ridge-work.png
public/panos/adapters-clean/dusk-ridge__moonlit-tidelands-work.png
public/panos/adapters-clean/moonlit-tidelands__dawn-valley-work.png
public/panos/adapters-clean/dawn-valley__dusk-ridge-photoshop-test1.png
```

## Geometry

Each adapter is a full `[A][X][B]` image:

- canvas: `3136 x 1344`
- A anchor: `523px`
- X: `2090px`
- B anchor: `523px`

Runtime uses anchor overlap, so visible motion is:

```text
plate A -> X -> plate B
```

## Guardrail

Do not reintroduce old candidate registries, legacy seam images, GPT/HF sweeps, or
bulk working artifacts. If another adapter is manually completed, add one clean
runtime image under `public/panos/adapters-clean/` and wire that pair to it.
