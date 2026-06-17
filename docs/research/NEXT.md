# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose (see HANDOFF.md and the discussion on goals). One turn answers **one**
> question. The Planner rewrites this file at the end of each turn.

---

## Next turn = Loop 6 — PLANNER: REVISED DAWN-TO-DUSK EXPERIMENT

### Goal
Design the next single experiment for `dawn-valley -> dusk-ridge`, based on the
Loop 5 review.

Do **not** generate images yet. Act as Research Planner.

The planning question:

> Since `exp001-edge-anchored-v1` improved the `adapter -> dusk-ridge` endpoint but
> worsened / complicated the `dawn-valley -> adapter` endpoint, what is the smallest
> next adapter-generation experiment that specifically targets the left-endpoint
> failure without losing the right-endpoint gain?

### Allowed changes
- Create one docs-only experiment spec for a revised Candidate B-style run, likely
  one of:
  - stricter left-edge anchoring / no-dark-mass prompt revision
  - narrower or asymmetric boundary crops
  - split-endpoint prompt strategy that explicitly preserves the dawn-side socket
    while keeping the dusk-side ridge/foreground gain
- The spec must cover only `dawn-valley -> dusk-ridge`.
- The spec must include:
  - hypothesis
  - input assets needed
  - generation method
  - exact prompt strategy
  - expected success
  - likely failure mode
  - evaluation method using inspect mode with `blend = 0` and `blend = 16`
  - whether it still supports future insertion of Christmas / Snow / World Cup
    scenes
  - ACCEPT / REJECT / INCONCLUSIVE criteria
- Update `EXPERIMENT_LOG.md` with the planning result.
- Update `FINDINGS.md` only if the planning step sharpens a durable finding.
- Rewrite `NEXT.md` for Loop 7.

### Forbidden this turn
- Do **not** generate images.
- Do **not** create new adapters, crops, or assets.
- Do **not** change runtime code.
- Do **not** change the comparison selector.
- Do **not** run Candidate A, Candidate B again, Candidate C, or any new
  generation.
- Do **not** broaden to another boundary.
- Do **not** add libraries.
- Do **not** change renderer, DebugPanel, scroll, drag, layout, or interaction
  behavior.
- Do **not** lock plate / seam / socket sizes.
- Do **not** claim the adapter problem is solved.

### Required evaluation / stop condition
- Stop after one revised experiment plan is written and Loop 7 is scoped.
- Loop 7 may be an Experiment Runner only if Loop 6 produces a narrow, reviewable
  spec for exactly one new adapter variant.
- Because Loop 6 is docs-only, `npm run build` is optional; if any runtime code is
  changed, that is a guardrail issue and must be documented.

---

## Then Loop 7 (preview, do not start yet)
Depends on Loop 6. Likely task:
- Run exactly one revised dawn-to-dusk adapter generation from the Loop 6 spec,
  register it as a selectable comparison option next to `baseline` and
  `exp001-edge-anchored-v1`, inspect at `blend = 0` and `blend = 16`, log ACCEPT /
  REJECT / INCONCLUSIVE, and stop.
