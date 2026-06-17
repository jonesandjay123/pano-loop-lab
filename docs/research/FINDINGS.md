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

- 🟡 **Single edge-crop anchored generation is promising but not proven.** In Loop 2,
  using `dawn-valley` right-edge and `dusk-ridge` left-edge crops removed much of
  the baseline's lake-to-land collision at the `adapter -> dusk-ridge` join, but
  introduced a large dark mountain/value mass at the `dawn-valley -> adapter` join.
  The result is INCONCLUSIVE, not accepted. Loop 3 review agreed with that verdict.
  _Source: EXPERIMENT_LOG.md Turns 2 and 3._

- ✅ **Comparison registration must keep baseline and candidates selectable.** Loop
  3 found that Loop 2 preserved the baseline file but replaced the active
  `dawn-valley -> dusk-ridge` seam in `PANO_RING`, leaving comparison dependent on
  manual code/config swaps. Loop 4 repaired that gap with a minimal selector, and
  Loop 5 verified it. Future experiments should register new adapters as selectable
  comparison options, not replacements. _Source: EXPERIMENT_LOG.md Turns 3, 4, and
  5._

- ✅ **Baseline/candidate comparison is now selectable for `dawn-valley -> dusk-ridge`.**
  Loop 4 added a minimal debug-panel comparison selector backed by a small
  data/config registry, so the original baseline and `exp001-edge-anchored-v1` can
  be inspected without manual code swaps. Loop 5 confirmed that only the
  dawn-to-dusk seam URL changes, while blend and inspect controls still work at
  `blend = 0` and `blend = 16`. This is a tooling finding only; it does not accept
  the adapter visually. _Source: EXPERIMENT_LOG.md Turns 4 and 5._

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
