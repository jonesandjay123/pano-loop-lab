# NEXT.md — the goal + stop condition for the NEXT turn only

> This is the **brake** for the next session. It is small, hard, and stoppable on
> purpose. One turn answers **one** question.

---

## Next turn = Stand up a mask-inpaint backend for one anchor-preserved adapter

### Goal

Turn 11's visual verdict was **PARTIAL**: Higgsfield whole-frame image-to-image makes
nice standalone panoramas but does **not** pixel-weld at `blend = 0`, because it has no
mask and repaints the anchors. Test the smallest **true mask-inpaint** route on the
single boundary `dawn-valley -> dusk-ridge`, using the existing prep artifacts that
were built for exactly this — **preserve the anchors, regenerate only the center band**.

```text
adapter-work-canvas.png  +  adapter-mask.png  (white = regenerate, black = preserve)
```

### Why this is next

This is the first turn that can produce a candidate whose left/right edges are the
**real plate pixels**, so a `blend = 0` weld is even possible. Higgsfield cannot do
this; an inpainting backend (A1111 `img2img` inpaint, or ComfyUI) can. The prep
contract (Turn 7, reviewed Turn 8) already emits the canvas + mask in the right shape.

### Allowed changes

- Choose **one** local inpaint backend (A1111 inpaint API or a minimal ComfyUI graph).
  Feed `adapter-work-canvas.png` as the init image and `adapter-mask.png` as the inpaint
  mask, with `prompt.txt` / `negative-prompt.txt`. Generate a small batch (2-4).
- Save raw results under the workbench `candidates/` folder with an `inpaint-` prefix
  and extend `candidates.md` (do not overwrite the Higgsfield batch records).
- Promote at most 1 inpaint candidate into the selector as a **new** comparison option
  (never overwrite baseline / exp001 / c08 / c04). Inspect both joins at `blend = 0`
  and `blend = 16` and log whether anchors now actually weld.
- Update `EXPERIMENT_LOG.md`; move durable knowledge to `FINDINGS.md`; rewrite `NEXT.md`.

### Forbidden this turn

- Do **not** generate more Higgsfield whole-frame candidates (that route is understood).
- Do **not** overwrite or delete baseline, exp001, c08, or c04.
- Do **not** refactor the renderer, add Pixi/Three/R3F/GSAP/canvas runtime, or UI polish.
- Do **not** lock plate/seam/socket widths.
- Do **not** claim a weld without showing it at `blend = 0`.

### Required evaluation / stop condition

- One mask-inpaint candidate inspected at `blend = 0` on both `dawn -> adapter` and
  `adapter -> dusk`, with an explicit verdict on whether the **preserved anchors weld**
  where Higgsfield could not.
- `npm run build` passes if any code changed.
- Stop after the inpaint candidate is inspected and logged. "Inpaint backend not
  available locally" is a valid, loggable stop — in that case record the blocker and
  the smallest setup needed, and do not fake a result.

### Fallbacks if a true inpaint backend cannot be run this turn

1. **Prep-script fix first (cheaper):** swap the flat-grey prefill for an `edge-pad` /
   mirror fill and de-emphasize the structure guide (both flagged in Turn 9), then
   regenerate Higgsfield candidates — this reduces grey-echo failures but still will not
   weld anchors.
2. **Or** keep **c08** as the current best whole-frame candidate and hand the
   pluggability question (does this method transfer to another boundary / to a Jovicheer
   event scene) to a later turn.

> Honest north star check: the goal is a *repeatable adapter method*, not one pretty
> dawn→dusk image. The mask-inpaint test is the cleanest next probe of whether
> anchor-preserved generation is the missing piece.
