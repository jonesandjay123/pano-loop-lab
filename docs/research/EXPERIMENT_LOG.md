# EXPERIMENT_LOG.md

## 2026-06-22 — repo slimming / clean runtime reset

- Removed legacy public assets: old seams, GPT/HF candidate batches, soft-adoption
  sweeps, adapter-prep variants, placeholder SVGs, and generated candidate registry.
- Removed bulky working artifacts under `docs/research/experiments/working/`.
- Removed legacy generation/import scripts that could recreate the old research
  sprawl.
- Rebuilt runtime around the clean asset model:

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

- Reworked `/#adapter-workbench` into a browser-only control surface for strict
  upload validation, plate reorder/add/delete, work adapter generation, finished
  adapter upload, scene config export/import, batch downloads, and manifest export.

## 2026-06-22 — first four-plate production loop

- Added the first curated production source plates under:

```text
generated/production-plates/raw/
```

- Verified the four source plates are exactly `6144 x 1536`.
- Confirmed the four-plate loop can run successfully in the browser after
  Photoshop-filled adapters are uploaded through the workbench.
- Known art issue: one Photoshop seam still has a visible line and should be
  manually repaired before final delivery.
