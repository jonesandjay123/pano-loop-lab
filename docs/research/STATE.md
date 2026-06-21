# STATE.md — current stable state of the repo

> The "you are here" snapshot. Updated by the **Archivist** at the end of a turn.
> For the full rationale and the redefined core problem, see `HANDOFF.md`.
> Last updated: **2026-06-21** (Turn 25 — soft256 review and strict-X sweep).

## Stack
Vite + React 18 + TypeScript + plain CSS. **No** Three.js / R3F / GSAP / canvas /
routing / backend. `npm run build` passes, TS clean.

## What is built and STABLE (do not rebuild)
- **N-plate + N-seam ring model** — `buildRingSegments()` assembles
  `[plate0, seam0→1, plate1, …, seamN-1→0]` for any N.
  Files: `src/pano/panoTypes.ts`, `src/pano/panoRing.ts`.
- **Continuous infinite loop** — sequence rendered twice; `usePanoRingScroll`
  drives `translate3d` via rAF with modulo-wrapped offset (seamless both ways).
- **Manual drag scrub + auto-scroll**, sharing one offset (no jump on hand-off).
- **Seam inspection lab** (`PanoRingStage.tsx` + `DebugPanel.tsx`):
  - `blend` 0 / 8 / 12 / 16 vw overlap + CSS-mask feather.
    **`blend = 0` butt-joins to reveal the REAL seam** — debug stays honest.
  - Per-segment knobs: `fitMode` (cover/height/width), `scale`, `xOffset`, `yOffset`
    (image layer overscanned 6%).
  - **Inspect mode**: center / hold / highlight (magenta) any boundary; toggle
    labels/lines; pause.

## Assets (`public/panos/`)
- 3 plates: `dawn-valley.jpg`, `dusk-ridge.jpg`, `moonlit-tidelands.jpg`.
- 3 seams (adapters): `seams/<fromId>__<toId>.jpg`.
- All generated with **Higgsfield `nano_banana_2`, 21:9, 2k**, feeding the two
  adjacent plates as `medias` (role `image`).

## Current method direction

The active direction is now **AXB prep + candidate selection**:

```
[A right-edge anchor][editable X transition region][B left-edge anchor]
```

`scripts/adapter-prep.mjs` deterministically prepares one inpainting workbench for
every adjacent ordered pair in the loop. This converts the hard adapter problem into
a standard masked-fill input:

- opaque `adapter-work-canvas.png`;
- separate `adapter-mask.png` where black = preserve and white = edit/regenerate;
- narrow A/B edge sockets, not large content blocks;
- later candidate batches can be generated from these inputs and one candidate can be
  chosen as the active adapter.

Primary AXB prep geometry:
- `3136 x 1344`;
- `A : X : B = 1 : 4 : 1`;
- anchors `523px` each, via deterministic rounding from `3136 / 6`;
- X transition region `2090px`;
- `32px` overmask into each anchor.

Source plate width policy:
- source plates are **not** width-locked;
- normal, wide, and ultra-wide plates are valid;
- the prep script normalizes source images by height and crops only the left/right
  edge anchors;
- the only hard requirement is that the height-normalized source image is at least one
  anchor wide.

Generated current-loop prep folders:
- `docs/research/experiments/working/006-axb-prep/dawn-valley__dusk-ridge/`
- `docs/research/experiments/working/006-axb-prep/dusk-ridge__moonlit-tidelands/`
- `docs/research/experiments/working/006-axb-prep/moonlit-tidelands__dawn-valley/`

Browser-served copies for the dashboard live under:
- `public/panos/adapter-prep/dawn-valley__dusk-ridge/`
- `public/panos/adapter-prep/dusk-ridge__moonlit-tidelands/`
- `public/panos/adapter-prep/moonlit-tidelands__dawn-valley/`

Additional browser-served prefill variants:
- gradient: `public/panos/adapter-prep/`
- white: `public/panos/adapter-prep-white/`
- black: `public/panos/adapter-prep-black/`

Legacy 1:12:1 prep artifacts remain in earlier working folders such as
`docs/research/experiments/working/006-axb-prep/` and
`docs/research/experiments/working/009-axb-prefill-variants/`.

## Dashboard status

An in-app workbench is available at `/#adapter-workbench`.

It currently supports:
- pair switching for `A->B`, `B->C`, and `C->A`;
- viewing `adapter-work-canvas.png`, `adapter-mask.png`, and anchor crops;
- opening manifest/prompt files;
- showing the active adapter state and candidate count.

It now shows the original rejected AXB candidates, raw GPT concept candidates, and a
strict-X soft-adoption sweep for `dawn-valley -> dusk-ridge`. The generated registry
preserves `activeForReview` from `candidates.json`; `gpt-axb-01-soft256` is active in
both the workbench and seam lab by default. No candidate is accepted as final yet.
The dashboard can switch the prep canvas between gradient, white, and black X
prefill variants, and provides download links for the selected work canvas and mask.

Candidate import path:
- `npm run adapter:import -- --source /absolute/path/to/result.png --id gpt-axb-01`
- imports into `public/panos/adapter-candidates/<from>__<to>/`;
- mirrors into `docs/research/experiments/working/011-imported-gpt-candidates/`;
- updates `candidates.json`;
- regenerates `src/pano/adapterCandidates.generated.ts`;
- dashboard and seam-lab selector read from the generated registry.

Imported GPT candidate status:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01.png`
  came from the user's external GPT image, resized from `1918 x 820` to the current
  `3136 x 1344` prep dimensions.
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-xonly.png`
  extracts only GPT's X region and hard-composites exact original A/B anchors back in.
- Review report:
  `docs/research/experiments/working/011-imported-gpt-candidates/dawn-valley__dusk-ridge/review/gpt-axb-01-review-report.json`.
- `gpt-axb-01` is the best visual semantic transition so far, but anchor diff is not
  zero: left max `194`, right max `100`.
- `gpt-axb-01-xonly` has exact outer anchors, left/right max diff `0`, but hard
  anchor restoration creates visible internal anchor-to-X breaks.
- Strict-X soft-adoption variants:
  - `gpt-axb-01-soft64`;
  - `gpt-axb-01-soft128`;
  - `gpt-axb-01-soft256`.
- These variants copy original A/B anchors exactly and only alter X-region pixels.
  All report left/right outer anchor max diff `0`.
- Turn 25 added a broader strict-X sweep:
  - feather widths `128`, `192`, `256`, `384`, `512`;
  - curves `linear`, `smoothstep`, `cosine`;
  - all sweep outputs preserve outer anchors exactly.
- Sweep summary:
  `docs/research/experiments/working/012-soft-anchor-adoption/dawn-valley__dusk-ridge/review/strict-x-sweep-summary.json`.
- Current verdict: **current best / not final**. `gpt-axb-01-soft256` remains the best
  balanced strict-X candidate. Wider blends reduce the right-side band but muddy the
  left A-X transition. The method is placement-safe but not visually solved.

First candidate batch:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-01.png`
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-02.png`
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/candidates.json`

These candidates were generated with Higgsfield `nano_banana_2` from the AXB work
canvas + mask as reference images. Higgsfield did not expose a true mask-inpaint
parameter in this route, so these are **whole-frame reference candidates**; anchors
are not pixel-guaranteed. Turn 19 review found that they improve immediate outer joins
by duplicating anchor strips, but introduce visible internal anchor-to-X bands.

## Known truth from the inspection lab
CSS overlap + feather hides most **tonal / hard-line** mismatch on these soft
atmospheric mattes (~70%). It does **NOT** fix **structural** mismatch (a lake
meeting a mountain across the join only softens into haze). CSS is auxiliary.

## Deliberately undecided (do not lock)
Fixed plate / seam / socket widths. Plates should stay generously wide; sizing is
revisited only **after** a generation/transition method works. See HANDOFF.md §3.

## Loop infrastructure status
- Memory: `docs/research/` created (STATE, FINDINGS, EXPERIMENT_LOG, NEXT, ROLES,
  templates/EXPERIMENT_TEMPLATE). `AGENTS.md` created at repo root.
- AXB prep pipeline exists and can generate current-loop prep assets with
  `npm run adapter:prep -- --all`.
- Strict-X soft adoption exists with `npm run adapter:soft-adopt`; it supports
  `--feather-px` and `--curve linear|smoothstep|cosine`.
- AXB dashboard exists at `/#adapter-workbench`.
- First dawn-to-dusk candidate batch exists and remains selectable for comparison in
  both the dashboard and seam lab, but both candidates are rejected as final adapters.
- No Codex automations / scheduled jobs configured.
