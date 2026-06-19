# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Review Adapter Workbench Prep Artifacts

### Goal

Review the generated no-backend Adapter Workbench artifacts for one boundary:

```text
dawn-valley -> dusk-ridge
```

The review should decide whether the artifact contract is ready to feed a manual
or backend generation route in a later turn. It must not generate final adapter
candidates yet.

### Why this is next

The prep script now creates the intended file contract:

```text
left crop + right crop + wide work canvas + mask + optional structure guide
+ prompt config -> candidate batch -> selector registration -> inspect
```

Before spending generation credits or wiring a backend, the artifacts need a
skeptical review: are the crops correct, is the mask usable, is the prompt aligned
with the known failure mode, and is the manifest complete enough for repeatable
candidate generation?

### Allowed changes

- Run the prep command again and confirm it recreates the expected files:

  ```bash
  npm run adapter:prep -- --from dawn-valley --to dusk-ridge --id exp002-wide-structure-workbench-v1
  ```

- Inspect the artifacts under:

  ```text
  docs/research/experiments/working/002-wide-structure-workbench/
  ```

- Check whether:
  - edge crops are the intended sides of the intended source plates;
  - `adapter-work-canvas.png` has no transparent/blank hole;
  - `adapter-mask.png` clearly preserves outer anchors and regenerates the center
    with slight anchor overmask;
  - `structure-guide.png` is good enough as a contract placeholder;
  - `prompt.txt` / `negative-prompt.txt` address the known dawn-to-dusk failure
    mode without overfitting;
  - `manifest.json` contains enough information for a later backend/manual route.
- Update `EXPERIMENT_LOG.md` with the review verdict.
- Update `FINDINGS.md` only if the review produces durable knowledge.
- Rewrite `NEXT.md` for the following turn.

### Forbidden this turn

- Do **not** call Higgsfield, A1111, ComfyUI, or any other generation backend.
- Do **not** create final adapter candidates under `public/panos/adapters/`.
- Do **not** change runtime renderer behavior.
- Do **not** add Pixi, Three.js, R3F, GSAP, canvas runtime, backend server, or UI
  polish.
- Do **not** remove or overwrite baseline/candidate assets.
- Do **not** claim the adapter problem is solved.

### Required evaluation / stop condition

- Produce a clear READY / NEEDS-REVISION verdict for the prep artifacts.
- If READY, the next `NEXT.md` may authorize one manual/backend route to generate
  4-8 candidates from these artifacts.
- If NEEDS-REVISION, the next `NEXT.md` should specify the smallest prep-script or
  artifact fix.
- Stop after the review and log update.

---

## Then

After the prep artifacts pass review, choose exactly one backend/manual route to
generate 4-8 candidates from the workbench artifacts, promote the best candidate(s)
into the adapter selector, and inspect with `blend = 0` and `blend = 16`.
