# EXPERIMENT_LOG.md — chronological record of every turn

> One entry per turn, newest at the top. Append-only in spirit: do not rewrite
> history, even for failures — failures are the point. Distilled conclusions move to
> `FINDINGS.md`. Use `templates/EXPERIMENT_TEMPLATE.md` for full experiment entries.

---

## Turn 1R — 2026-06-17 — Loop 1 Review: experiment design readiness
- **Role:** Skeptical Reviewer
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** review only — no experiment run.
- **What was checked:** reviewed whether
  `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` and `NEXT.md`
  are ready for Loop 2 without drifting into outpaint, UI work, sizing locks, or
  multi-variant generation.
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** not run; no images generated. Reviewed the written criteria for
  required `blend = 0` and `blend = 16` inspection.
- **Result:** ✅ READY after a small docs tightening. Candidate B remains the
  recommended Loop 2 experiment. `NEXT.md` now limits any comparison registration
  to data/config scope and explicitly forbids renderer, debug-panel, scroll,
  layout, or interaction logic changes.
- **Build note:** `npm run build` was attempted during Loop 1 but could not run
  because dependencies were not installed (`tsc: command not found`). No
  runtime/code changes were made.
- **Next:** Loop 2 may proceed only under `NEXT.md`: generate exactly one
  edge-anchored adapter variant for `dawn-valley -> dusk-ridge`, keep baseline,
  inspect at `blend = 0` and `blend = 16`, log ACCEPT / REJECT / INCONCLUSIVE,
  and stop.

## Turn 1 — 2026-06-17 — Loop 1: dawn-to-dusk adapter experiment design (docs-only)
- **Role:** Research Planner
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis:** H1 pair-specific adapter generation, with one bounded H4 ritual
  transition variant for future event-scene relevance.
- **What was done:** created
  `docs/research/experiments/001-dawn-to-dusk-adapter-options.md` with three
  candidate generation experiments: full-reference pair bridge, edge-anchored
  boundary-crop bridge, and ritual mist / light veil bridge.
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** not run; design-only turn. No images were generated and no
  adapter was evaluated.
- **Result:** ✅ Loop 1 design artifact complete. The adapter problem is not solved;
  Loop 2 must generate and inspect exactly one candidate before any success claim.
- **Next:** see `NEXT.md` — Loop 2 should run Candidate B, the edge-anchored
  boundary-crop bridge, on the same boundary only.

## Turn 0 — 2026-06-16 — Loop 0: research scaffolding (docs-only)
- **Role:** Archivist / setup
- **Boundary:** none (infrastructure turn)
- **Hypothesis:** none — set up the repo to run controlled loop-engineering research.
- **What was done:** created `AGENTS.md` and `docs/research/` memory
  (STATE, FINDINGS, NEXT, ROLES, this log, templates/EXPERIMENT_TEMPLATE).
- **Runtime / assets changed:** none. Docs-only.
- **Inspection:** n/a.
- **Result:** ✅ scaffolding in place. `npm run build` expected green (no code touched).
- **Next:** see `NEXT.md` — Loop 1 is *design only* (3 experiments for one boundary,
  no image generation, no code).

<!-- Add new turns ABOVE this line. -->
