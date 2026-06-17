# EXPERIMENT_NNN — <short title>

> Copy this file to `docs/research/experiments/NNN-<slug>.md` and fill it in.
> One experiment = one hypothesis on one boundary.

- **Date:**
- **Boundary:** `<fromId> → <toId>` (e.g. `dawn-valley → dusk-ridge`)
- **Hypothesis tested:** H1 / H2 / H3 / H4 (see FINDINGS.md / HANDOFF.md §4)
- **Branch:** `exp/<hypothesis>-<slug>`

## Hypothesis
What do we believe will work, and why?

## Inputs / assets needed
- Plates / crops / references used (e.g. "A right 20% crop + B left 20% crop").

## Generation method
- Tool + model (e.g. Higgsfield `nano_banana_2`, 21:9, 2k).
- **Exact prompt strategy** (paste the actual prompt or its skeleton).
- Any post-processing.

## Expected success
What "better" looks like, concretely.

## Likely failure mode
Where we expect it to break (structure / horizon / colour / composition).

## How to evaluate
- Inspect mode at **`blend = 0`** (truth) and **`blend = 16`** (production-ish).
- Success criteria (HANDOFF.md §5): no hard colour/value break, horizon not jumping,
  main structures not colliding, reads as one journey.
- Pluggability check: would this method still work if the middle scene were swapped
  for Christmas / Snow / World Cup?

## Result (filled in after running)
- Output asset path: `public/panos/adapters/<from>__<to>/expNNN-<variant>.jpg`
- Verdict: ✅ ACCEPT / ❌ REJECT / 🟡 INCONCLUSIVE
- Evidence (what `blend = 0` actually showed):
- Next hypothesis / what to change:
