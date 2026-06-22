# Manual Inpaint Adapter Workflow

This is the current intended adapter pipeline:

```text
repo export AXB
-> human inpaints X in Kling / Photoshop / Midjourney / Firefly
-> repo imports external output
-> repo crops X only
-> repo composites original A/B + generated X
-> repo verifies outside-X diff = 0
-> inspect in the workbench / loop
```

Human-in-the-loop is a formal design choice, not a workaround. New seasonal scenes
are major updates, not high-frequency batch jobs, so manual X treatment is
acceptable if the repo handles the mechanical contract and verification.

## Export

Generate manual work folders for every current adjacent pair:

```bash
npm run adapter:export-manual -- --all
```

Each pair is written to:

```text
docs/research/experiments/working/manual-inpaint/<pair-id>/
```

Files:

- `work-canvas.png` - upload this to the external editor.
- `work-canvas-gradient.png` - same gradient AXB canvas, kept as an explicit alias.
- `work-canvas-labeled.png` - human reference only; do not upload it to a model.
- `mask-hard.png` - strict X harvest region: white = X, black = original A/B.
- `mask-soft.png` - existing soft/overmask prep mask for future mask-aware tools.
- `prompt.txt` - short human/external-editor prompt.
- `manifest.json` - geometry and import contract.

## Human Step

Upload `work-canvas.png` to Kling, Photoshop, Midjourney, Firefly, or another
editor. Select/fill only X. Download the external full image.

The external tool's A/B pixels are untrusted. They are context for generating X,
not final pixels.

## Import

Import the external full image as an X source:

```bash
npm run adapter:import-manual -- \
  --pair dawn-valley__dusk-ridge \
  --input /absolute/path/to/external-output.png \
  --id kling-01
```

If the external output dimensions differ from the manifest, the import fails by
default. Resize only when that choice is explicit:

```bash
npm run adapter:import-manual -- \
  --pair dawn-valley__dusk-ridge \
  --input /absolute/path/to/external-output.png \
  --id kling-01 \
  --resize-to-canvas
```

Import rules:

- Only X may come from the external tool.
- A/B must always come from the original work canvas.
- Final candidate = original A/B + external X.
- outside-X pixel diff must be `0`.

The importer writes:

- runtime candidate under `public/panos/adapter-candidates/<pair-id>/<id>.png`;
- research copy under `docs/research/experiments/working/manual-inpaint-imports/<pair-id>/`;
- `diff-report.json`;
- review artifacts: original work canvas, external output, final composite,
  A/X closeup, X/B closeup, and a comparison contact sheet;
- updated `candidates.json` and regenerated TypeScript candidate registry.

After import, inspect the candidate in `/#adapter-workbench` and the seam lab.
