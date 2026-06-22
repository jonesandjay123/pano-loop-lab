# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = manual-inpaint pipeline smoke test with a real external X

### Goal

Use the manual-inpainting-ready adapter pipeline as the primary path:

```text
repo export AXB work canvas
-> human fills X in Kling / Photoshop / Midjourney / Firefly
-> repo imports only X
-> repo composites original A/B + generated X
-> repo validates outside-X pixel diff = 0
-> inspect in workbench / loop
```

Priority is manual export/import infrastructure, not automatic model generation.
Do **not** pursue a strict mask-inpaint backend this turn.

### Current base

Manual export/import scripts exist:

- `npm run adapter:export-manual -- --all`
- `npm run adapter:import-manual -- --pair <from>__<to> --input <image> --id <id>`

Core contract:

```text
Only X may come from the external tool.
A/B must always come from the original work canvas.
outside-X pixel diff must be 0.
```

Manual workflow docs:

- `docs/research/MANUAL_INPAINT_WORKFLOW.md`

Current best old candidate:

- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-soft256.png`

This remains a comparison candidate only. It is not a final solution.

### Allowed changes

- Run `npm run adapter:export-manual -- --all` if manual folders need refreshing.
- Import exactly one real external manual-inpaint output with
  `npm run adapter:import-manual`.
- Use `--resize-to-canvas` only if the external tool changed dimensions and that
  decision is recorded.
- Verify `diff-report.json` reports outside-X changed pixels `0`.
- Inspect the imported candidate in the workbench / seam lab at `blend = 0`.
- Record the result in `EXPERIMENT_LOG.md`, `FINDINGS.md`, and `STATE.md`.

### Forbidden this turn

- Do **not** call any external AI generation API from the repo.
- Do **not** research more models.
- Do **not** pursue strict mask backend capability.
- Do **not** import a full external output as final.
- Do **not** trust external A/B pixels.
- Do **not** delete or overwrite existing candidates.
- Do **not** change global sizing or renderer architecture.

### Required evaluation / stop condition

- Report the manual import command used.
- Report whether the external image dimensions matched the manifest.
- Report outside-X changed pixels and max diff.
- If imported, confirm the candidate appears in generated registry / workbench.
- Run `npm run build` if code or generated registry changes.
