# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = soft anchor-adoption composite for GPT AXB 01

### Goal

Test whether the imported GPT candidate can be made placement-safe without losing its
natural transition:

> Starting from `gpt-axb-01`, preserve the outer plate-facing A/B anchor pixels exactly,
> but feather the inner anchor-to-X transition so the hard `gpt-axb-01-xonly` vertical
> breaks are reduced.

### Current base

Candidate source:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01.png`

Diagnostic hard composite:
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/gpt-axb-01-xonly.png`

Review report:
- `docs/research/experiments/working/011-imported-gpt-candidates/dawn-valley__dusk-ridge/review/gpt-axb-01-review-report.json`

Current geometry:
- `3136 x 1344`
- `A : X : B = 1 : 4 : 1`
- anchors `523px` each
- X region `2090px`
- right anchor starts at `2613px`

Known truth:
- `gpt-axb-01` is visually the strongest standalone transition so far, but its outer
  anchors are not exact.
- `gpt-axb-01-xonly` has exact outer anchors, but hard anchor/X boundaries are visible.

### Allowed changes

- Add one deterministic postprocess script or one small scripted experiment if useful.
- Create one or more soft-composite variants from `gpt-axb-01`, for example `soft64`
  and/or `soft128`.
- Preserve exact outer plate-facing anchor pixels and report diff.
- Register resulting variants as candidates under
  `public/panos/adapter-candidates/dawn-valley__dusk-ridge/`.
- Create blend-0-equivalent external joins and internal boundary crops.
- Update `candidates.json`, generated TS registry, and research docs.

### Forbidden this turn

- Do **not** generate new AI images.
- Do **not** delete or overwrite existing candidates.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend, routing libraries, Three.js, R3F, GSAP, or canvas.
- Do **not** accept a final adapter unless both external joins and internal boundaries
  are inspectably better.

### Required evaluation / stop condition

- At least one soft composite candidate is registered in dashboard and seam-lab selector.
- Outer anchor diff is reported and must remain `0` for preserved zones.
- Review artifacts compare `gpt-axb-01`, `gpt-axb-01-xonly`, and the soft variant.
- Run `npm run build`.
