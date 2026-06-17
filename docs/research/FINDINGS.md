# FINDINGS.md — proven / disproven hypotheses

> Durable knowledge, distilled from `EXPERIMENT_LOG.md`. The log is chronological
> and messy; this file is the **clean, deduplicated** set of conclusions a future
> session can trust. Updated by the **Archivist**. Each entry must point back to the
> experiment(s) that justify it.

## Legend
- ✅ **Supported** — repeatedly held up under `blend = 0` inspection.
- ❌ **Disproven** — tried, did not meet success criteria.
- 🟡 **Inconclusive** — needs another turn before we trust it.

---

## Confirmed so far

- 🟡 **CSS overlap + feather is auxiliary, not a solution.** On soft atmospheric
  mattes it hides ~70% of tonal / hard-line mismatch but cannot weld structure
  (ridge lines, lake-vs-mountain). _Source: pre-loop inspection lab, HANDOFF.md §1._

## Open hypotheses (not yet tested in the loop)

- **H1 — Pair-specific adapter generation** (primary candidate). Generate a dedicated
  `A→B` image from the (A,B) pair; must read as a *transition world*, not a colour
  average. Most aligned with pluggability.
- **H2 — Socket-friendly scene edges** (a generation *tendency*, not a fixed size).
  Generate plate edges that are transition-able (fog / sky / water / distant ridges).
- **H3 — Layered generation.** Split into sky / far-mountains / mist / mid / water;
  transition per layer. Adapter may be multi-layer assets.
- **H4 — Emotional / ritual continuity** for event scenes (snow veil, glow, ribbons,
  fog waves) — "world hop", not same-map. Natural fit for Jovicheer.
- **Likely answer = HYBRID:** wide plates + socket-friendly edges + pair-specific
  adapters + fog/light/particle cover.

> See HANDOFF.md §4 for full descriptions and generation approaches to try.
