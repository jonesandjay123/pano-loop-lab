# EXPERIMENT_LOG.md

## 2026-06-22 — repo slimming / clean runtime reset

- Removed legacy public assets: old seams, GPT/HF candidate batches, soft-adoption
  sweeps, adapter-prep variants, placeholder SVGs, and generated candidate registry.
- Removed bulky working artifacts under `docs/research/experiments/working/`.
- Removed legacy generation/import scripts that could recreate the old research
  sprawl.
- Rebuilt runtime around the clean asset model:

```text
A plate -> AXB -> B plate -> BXC -> C plate -> CXA -> A plate
```

- `AXB` uses `dawn-valley__dusk-ridge-photoshop-test1.png`.
- `BXC` and `CXA` intentionally use raw work-canvas placeholders.
- Homepage should now reveal unfinished adapters honestly instead of hiding them
  behind legacy generated seams.
