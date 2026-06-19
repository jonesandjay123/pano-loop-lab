# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Generate dawn-to-dusk adapter candidates (Higgsfield)

### Goal

The prep artifact contract passed review (EXPERIMENT_LOG Turn 8: READY/PASS). Now
generate a **batch of candidate adapters** for the single boundary:

```text
dawn-valley -> dusk-ridge
```

using the reviewed workbench artifacts under:

```text
docs/research/experiments/working/002-wide-structure-workbench/
```

This is the H1 (pair-specific adapter) experiment. Generate several candidates and
keep them for comparison — do **not** chase one perfect one-shot.

### Why this is next

The missing step is no longer tooling; it is an honest visual test of whether a
wide work canvas + explicit mask + low-frequency structure guide + a pair-specific
prompt actually produces a *transition world* that beats `exp001-edge-anchored-v1`
at the known failure points (left-edge dark mass, lake-vs-ridge collision).

### Allowed changes

- Use **one** generation route only. Prefer the vendored **Higgsfield** skill
  (`.agents/skills/higgsfield-generate/`); the source plates / crops already act as
  references, and `prompt.txt` / `negative-prompt.txt` are ready to feed it.
- Generate **4-8 candidates**, not 1. Suggested first batch:
  - feed `adapter-work-canvas.png` as the init/reference image and
    `adapter-mask.png` as the inpaint region where the backend supports it;
  - keep the two edge crops as anchor references;
  - vary a small number of axes so the batch is informative, e.g.:
    1. structure-guide **on** vs **off** (does the low-freq guide help or flatten?);
    2. mask center band **as-is** vs **slightly narrower** (more anchor context);
    3. prompt **as-is** vs a variant that leans harder on "low-contrast airy left".
- Write candidates to the workbench `candidates/` folder first:

  ```text
  docs/research/experiments/working/002-wide-structure-workbench/candidates/
    exp002-candidate-01.jpg ...
  ```

- Promote only the best candidate(s) into the adapter selector under
  `public/panos/adapters/dawn-valley__dusk-ridge/` as **new comparison options**
  (never overwrite the baseline or `exp001`).
- Update `EXPERIMENT_LOG.md` with what was generated and the honest verdict; move any
  durable conclusion to `FINDINGS.md`; rewrite `NEXT.md` for the following turn.

### Forbidden this turn

- Do **not** continue researching / rewriting the loop engine, renderer, or CSS.
- Do **not** add Pixi, Three.js, R3F, GSAP, canvas runtime, backend server, or UI
  polish.
- Do **not** overwrite or delete the baseline, `exp001`, or any existing adapter.
- Do **not** lock plate / seam / socket widths.
- Do **not** claim the adapter problem is solved on the strength of one good render —
  judge every "it improved" claim at `blend = 0`.
- Do **not** generalize the prep script's prompt in the same turn (that is a separate
  tooling turn; see the Turn 8 should-fix).

### Required evaluation / stop condition

- Produce 4-8 inspectable candidate images for `dawn-valley -> dusk-ridge`.
- Inspect the most promising candidate(s) at `blend = 0` (the honest butt-join) and
  `blend = 16`, at **both** joins: `dawn-valley -> adapter` and `adapter -> dusk-ridge`.
- Record which candidates were accepted / rejected / kept for comparison, and whether
  any beats `exp001` at the left-edge dark-mass and lake-vs-ridge failure points.
- `npm run build` should pass if any runtime/package files changed.
- Stop after the batch is generated, inspected, and logged. A batch where every
  candidate fails is still a valid, loggable result — do not fabricate success.

---

## Then

After a candidate is accepted (or all are honestly rejected), the following turn can
either (a) generalize the prep script's prompt so the workbench works for an arbitrary
pair (Turn 8 should-fix), or (b) repeat the workbench on a second boundary to test
whether the method transfers — pick one, one boundary per turn.
