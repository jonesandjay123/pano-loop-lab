# AGENTS.md — How to work in this repo

> Read this **before** touching anything. Then read `HANDOFF.md` (the redefined core
> problem) and `docs/research/STATE.md` (where we are right now). This file is
> tool-neutral: it applies to **any** agent — Codex, Claude Code, or a human.

`pano-loop-lab` is **not** a feature project. It is an **AI-assisted visual-generation
research lab** run as a controlled loop. Your job each session is to advance *one*
research question by *one* honest step — not to make the demo prettier.

---

## North Star (long-term, NOT a per-session stop condition)

> Discover a **repeatable method** for generating **pair-specific adapters** between
> **arbitrary** adjacent scene plates — so a new scene (Christmas / snow / World Cup)
> can be inserted between two existing plates by generating two adapters, **without
> regenerating the neighbours**.

This is a method-discovery problem, not a "fix these three images" problem.

---

## How the loop works

Every session is one turn of:

```
Read STATE + NEXT  →  do exactly what NEXT.md allows  →  inspect honestly
   →  record in EXPERIMENT_LOG + FINDINGS  →  rewrite NEXT.md for the next turn
```

- The **memory** lives in `docs/research/` (see that folder's files). Treat it as the
  source of truth across sessions — you start cold every time.
- The **goal + stop condition for *this* turn** is in `docs/research/NEXT.md`. Do not
  exceed it. If `NEXT.md` says "design only, do not generate images", then you stop
  after the spec.
- Roles (Planner / Runner / Reviewer / Archivist) are described in
  `docs/research/ROLES.md`. A single session may play one role; do not silently
  switch from Runner to Reviewer and grade your own work.

---

## Hard guardrails (do NOT violate — these mirror HANDOFF.md §3/§6)

- **Do not** optimize for making the current 3-scene demo look good.
- **Do not** treat the fix as "outpaint A permanently into B" (kills pluggability).
- **Do not** keep polishing CSS as if it were the core — it is auxiliary.
- **Do not** lock plate / seam / socket widths yet (sizing is deferred on purpose).
- **Do not** add Three.js / R3F / GSAP / canvas / backend / new libraries.
- **Do not** add drag inertia, parallax, or UI polish.
- **Do not** regenerate all assets or claim "pixel-perfect / done".
- **Do not** delete a baseline or an old adapter — keep it for comparison.

## Honesty rules (so we don't self-congratulate)

- Every "it improved" claim must be **inspectable with `blend = 0`** (the butt-join
  that reveals the real seam). No hiding structural mismatch behind feather.
- A failed experiment is a **valid, valuable result** — record it, don't bury it.
- If a turn produced nothing usable, still commit the **docs** (log + findings).
  Never fabricate success to close a turn.
- Judge against `docs/research/` success criteria, not vibes.

## Per-turn discipline

- One boundary per turn. One hypothesis per turn.
- Keep the baseline. Add new adapters as **comparison options**, never overwrite.
- Verify before claiming done: run `npm run build` if deps are installed; report the
  actual `git diff` scope (docs-only vs assets vs code).
- New experiment branches: `exp/<hypothesis>-<short-slug>` (e.g. `exp/h1-edge-crop`).
  `main` only receives accepted experiments or docs-only findings.

## Asset & file conventions

- Plates: `public/panos/<id>.jpg`. Adapters (currently "seams"):
  `public/panos/seams/<fromId>__<toId>.jpg`.
- Experiment adapter variants go under
  `public/panos/adapters/<fromId>__<toId>/<expNNN>-<variant>.jpg` so baselines and
  variants live side by side (see EXPERIMENT_TEMPLATE).
- Code map and run commands: see `HANDOFF.md` §8.

## Available tooling

- **Higgsfield image generation** is vendored as a skill:
  `.agents/skills/higgsfield-generate/` (real content), symlinked from
  `.claude/skills/higgsfield-generate/`. It documents the model catalog
  (`nano_banana_2`, GPT Image 2, Soul, etc.), prompt engineering, and reference/media
  inputs — useful for the Runner role when a turn is authorized to generate adapters.
  Do **not** invoke it on design-only turns (see `NEXT.md`).

---

If anything here conflicts with a session prompt, **the guardrails win** unless the
user explicitly overrides them in that session.
