# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose (see HANDOFF.md and the discussion on goals). One turn answers **one**
> question. The Planner rewrites this file at the end of each turn.

---

## Next turn = Loop 2 — RUN ONE EDGE-ANCHORED ADAPTER EXPERIMENT

### Goal
Run **exactly one** adapter-generation experiment for **one** boundary only:
`dawn-valley -> dusk-ridge`.

Use `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` and execute
**Candidate B — Edge-anchored bridge from boundary crops** only.

The research question for Loop 2:

> Does using the actual right-edge crop of `dawn-valley` and the actual left-edge
> crop of `dusk-ridge` improve the raw adapter joins at `blend = 0` compared with
> the current baseline?

### Allowed changes
- Create temporary crop inputs only if needed for generation. If kept, place them
  under `docs/research/experiments/working/001-dawn-to-dusk/` or another clearly
  marked research-working folder, not in runtime asset paths.
- Generate exactly one new adapter variant:
  `public/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg`.
- Add the new adapter as a comparison option only through the smallest data/config
  registration needed for inspection; keep the existing baseline available.
- Update `EXPERIMENT_LOG.md` with the actual method, output path, inspection notes,
  and verdict: ACCEPT / REJECT / INCONCLUSIVE.
- Rewrite this `NEXT.md` for Loop 3.

### Forbidden this turn
- Do **not** run Candidate A or Candidate C.
- Do **not** generate multiple adapter variants.
- Do **not** overwrite or delete `public/panos/seams/dawn-valley__dusk-ridge.jpg`.
- Do **not** regenerate existing plates or other seams.
- Do **not** touch any other boundary.
- Do **not** lock plate / seam / socket sizes. Do **not** add libraries.
- Do **not** add Three.js / R3F / GSAP / canvas / backend.
- Do **not** add UI polish, drag inertia, parallax, or new interaction behavior.
- Do **not** modify renderer, debug-panel, scroll, layout, or interaction logic. If
  the candidate cannot be inspected without touching those areas, record the
  blocker honestly and stop.
- Do **not** claim the adapter problem is solved.

### Required evaluation
- Inspect the candidate against the baseline in the repo's inspection lab.
- Evaluate both raw joins at **`blend = 0`**:
  - `dawn-valley -> exp001-edge-anchored-v1`
  - `exp001-edge-anchored-v1 -> dusk-ridge`
- Also inspect at **`blend = 16`** to understand whether feathering makes a
  production-ish view plausible.
- Record concrete evidence: color/value break, horizon continuity, major landform
  continuity, and whether the middle reads as a transition world.
- If the candidate cannot be registered for visual comparison without exceeding
  the allowed scope, record that blocker honestly and stop with docs updated.

### Stop condition
Stop after one candidate is generated, inspected, logged, and `NEXT.md` is rewritten
for Loop 3. Report the exact diff scope (docs/assets/code), the generated asset path,
whether baseline remained untouched, and whether `npm run build` passed.

---

## Then Loop 3 (preview, do not start yet)
Run a Skeptical Reviewer turn. Do not generate images. Check the Loop 2 diff,
guardrails, baseline preservation, and visual evidence. Grade the edge-anchored
candidate ACCEPT / REJECT / INCONCLUSIVE against `blend = 0` truth, then decide the
next hypothesis.
