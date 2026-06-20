# NEXT.md - the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. One turn answers **one** question.

---

## Next turn = review first AXB candidates at blend 0

### Goal

Review the two generated `dawn-valley -> dusk-ridge` AXB candidates honestly:

> Do `hf-nb2-axb-01` or `hf-nb2-axb-02` improve the real dawn->adapter and
> adapter->dusk joins at `blend = 0`, enough to keep one as the active review
> candidate?

### Current base

Dashboard:

`/#adapter-workbench`

Candidate files:

- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-01.png`
- `public/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-02.png`

Both candidates are also available in the seam lab's `dawn->dusk` selector.

Important limitation:

These were generated with Higgsfield `nano_banana_2` from the AXB canvas + mask as
reference images. Higgsfield did **not** expose true mask-inpaint in this route, so
anchors are not pixel-guaranteed.

### Allowed changes

- Inspect only `dawn-valley -> dusk-ridge`.
- Use the seam lab and/or generated butt-join review composites.
- Update candidate status/notes if the review is clear.
- If one candidate is clearly best, mark it as active-for-review, not final accepted.
- Keep all baseline and old adapter options.

### Forbidden this turn

- Do **not** generate more images.
- Do **not** delete or overwrite any candidate.
- Do **not** claim pixel preservation for these whole-frame reference candidates.
- Do **not** change global sizing or renderer architecture.
- Do **not** add backend, routing libraries, Three.js, R3F, GSAP, or canvas.

### Required evaluation / stop condition

- Compare `hf-nb2-axb-01`, `hf-nb2-axb-02`, baseline, and prior exp002 candidates at
  `blend = 0`.
- Record whether each candidate is ACCEPT / REJECT / PARTIAL / INCONCLUSIVE.
- Run `npm run build`.
