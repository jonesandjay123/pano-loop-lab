# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Adapter Workbench Prep Script

### Goal

Implement the smallest no-backend Adapter Workbench preparation script for one
boundary:

```text
dawn-valley -> dusk-ridge
```

The script should make the generation setup reproducible, but it must not call an
image-generation API yet.

### Why this is next

The loop renderer and comparison selector are adequate. The missing engineering
unit is now a repeatable artifact contract for adapter generation:

```text
left crop + right crop + wide work canvas + mask + optional structure guide
+ prompt config -> candidate batch -> selector registration -> inspect
```

Jones prefers a pipeline that can generate multiple candidates and select the
best, not a brittle one-shot perfect generation attempt.

### Allowed changes

- Add a local script, likely under `scripts/`, for example:

  ```bash
  npm run adapter:prep -- --from dawn-valley --to dusk-ridge --id exp002-wide-structure-workbench-v1
  ```

- Add a package script entry if needed.
- Create deterministic workbench artifacts under:

  ```text
  docs/research/experiments/working/002-wide-structure-workbench/
  ```

- The generated artifacts should include:
  - `manifest.json`
  - `prompt.txt`
  - `negative-prompt.txt`
  - `dawn-valley-right-crop.jpg`
  - `dusk-ridge-left-crop.jpg`
  - `adapter-work-canvas.png`
  - `adapter-mask.png`
  - `structure-guide.png`

- Use existing image tooling if available in the repo/toolchain. If adding a new
  dependency is truly needed, keep it narrow and justify it in the log.
- Update `EXPERIMENT_LOG.md` with what the script produced.
- Update `FINDINGS.md` only if the implementation sharpens a durable finding.
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

- Running the prep command should create the expected files for
  `dawn-valley -> dusk-ridge`.
- The workbench artifacts should be inspectable as ordinary image files.
- `npm run build` should pass if runtime/package files changed.
- Stop after the prep artifact contract is implemented and logged.

---

## Then

After the prep script exists, the next turn can choose one backend/manual route to
generate 4-8 candidates from the workbench artifacts, promote the best candidate(s)
into the adapter selector, and inspect with `blend = 0` and `blend = 16`.
