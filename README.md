# pano-loop-lab

Clean AXB panorama loop prototype.

The repo now models the background as:

```text
A plate -> AXB adapter -> B plate -> BXC adapter -> C plate -> CXA adapter -> A plate
```

Runtime assets are intentionally small:

```text
public/panos/
  dawn-valley.jpg
  dusk-ridge.jpg
  moonlit-tidelands.jpg
  adapters-clean/
    dawn-valley__dusk-ridge-work.png
    dusk-ridge__moonlit-tidelands-work.png
    moonlit-tidelands__dawn-valley-work.png
    dawn-valley__dusk-ridge-photoshop-test1.png
```

`photoshop-test1` is the only manually completed adapter right now. The other two
adapters are still work canvases, so their X regions should look visibly unfinished
in the loop. That is deliberate: the homepage is now an honest visual debug surface.

## Run

```bash
npm install
npm run dev
npm run build
```

Open:

```text
http://localhost:5173/
```

The AXB dashboard is available at:

```text
http://localhost:5173/#adapter-workbench
```

## Contract

Each adapter is a full `[A][X][B]` image at `3136 x 1344`:

- `A` anchor: `523px`
- `X` region: `2090px`
- `B` anchor: `523px`

In runtime, adapter anchors overlap their neighboring plates. The visible journey is:

```text
plate A -> X -> plate B
```

Unfilled work canvases are expected to look wrong until a human fills X in Photoshop,
Kling, Midjourney, Firefly, or another editor.
