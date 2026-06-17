# ROLES.md — the agents in this loop

> Tool-neutral role definitions. In Codex these can become subagents (config files,
> different models/reasoning levels); in Claude Code they can be `Agent` subagents or
> just a single session playing one role at a time. The key rule is **separation of
> making and judging**: whoever generates an adapter must not be the one who declares
> it a success.

| Role | Job | Writes | Reads |
|---|---|---|---|
| **Research Planner** | Propose the next experiment(s); write/refresh `NEXT.md`. Designs, does not build. | `NEXT.md`, `docs/research/experiments/*` | everything |
| **Experiment Runner** | Execute exactly what `NEXT.md` allows: generate/wire one adapter variant, keep baseline, add as comparison. | assets under `public/panos/adapters/…`, minimal wiring, `EXPERIMENT_LOG.md` | STATE, NEXT, experiment spec |
| **Skeptical Reviewer** | Trust nothing self-reported. Check the diff, check guardrails, inspect at `blend = 0`, grade against success criteria. Output ACCEPT / REJECT / INCONCLUSIVE + next hypothesis. | review notes (into `EXPERIMENT_LOG.md`) | diff, assets, AGENTS guardrails, success criteria |
| **Archivist** | Distil the log into `FINDINGS.md`; refresh `STATE.md`. Docs-only. | `FINDINGS.md`, `STATE.md` | log, repo state |

## Suggested cadence (sequential, not parallel for now)
```
Planner (Loop 1: design)
  → Runner (Loop 2: one experiment)
    → Reviewer (Loop 3: accept/reject)
      → Archivist (update findings + state)
        → Planner (write next NEXT.md)
```
Start sequential. Only parallelize (worktrees per `exp/*` branch) once the method is
stable enough that two experiments won't fight over the same files.

## Permissions intent
- Planner / Reviewer / Archivist: effectively **read + docs only**.
- Runner: may add assets and minimal wiring, but **never** deletes baselines or
  touches the scroll/ring core beyond what `NEXT.md` authorizes.
