# ComfyUI mask-inpaint plan — exp002 dawn-valley → dusk-ridge

> Feasibility scout + executable spec written on the M2 dev box (Turn 12). **No
> generation was run here.** Target machine = Jones's Windows PC, **RTX 5080 (16 GB,
> Blackwell)**. This file is what to follow tomorrow on that box.
>
> Goal that Higgsfield could not meet: **preserve the two real anchor crops and
> regenerate only the center band**, so the adapter welds at `blend = 0` because its
> left/right edges *are* the real plate pixels.

---

## 0. ⚠️ Blackwell gotcha (read first)

RTX 5080 is `sm_120`. It needs **PyTorch ≥ 2.7 built for CUDA 12.8** (cu128). An older
torch fails with `no kernel image is available for execution` / `sm_120 not supported`.

- Use a **recent ComfyUI portable** (Nov 2025 or newer) — it ships a compatible torch — **or**
  in a venv: `pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/cu128`.
- Verify before anything else: `python -c "import torch;print(torch.__version__, torch.cuda.get_device_name(0))"`.

16 GB VRAM is comfortable for SDXL inpaint (and Flux Fill in fp8). No memory worry at
our sizes.

---

## 1. Inputs (already in this folder — the prep contract)

| File | Role in ComfyUI |
|---|---|
| `adapter-work-canvas.png` (3168×1344) | **init image** — two real anchor crops + grey center |
| `adapter-mask.png` (3168×1344) | **inpaint mask** — **white = regenerate, black = preserve** |
| `prompt.txt` | positive prompt |
| `negative-prompt.txt` | negative prompt |
| `dawn-valley-right-crop.jpg`, `dusk-ridge-left-crop.jpg` | anchor ground-truth for verification |

**Mask polarity matches ComfyUI directly** (white = the painted/regenerated region). No
inversion needed for the sampler. (One inversion *is* needed only for the final
composite-restore step — see §4.)

---

## 2. Recommended model (tiers)

- **Tier B — first run, fewest nodes (start here):** dedicated SDXL inpaint checkpoint
  `stable-diffusion-xl-1.0-inpainting-0.1` (single-file safetensors). Drives ComfyUI's
  native `InpaintModelConditioning`. Cleanest "it just inpaints" path.
- **Tier A — most robust SDXL inpaint (production):** any strong SDXL checkpoint
  (**Juggernaut XL** / **RealVisXL V5**) + the **`comfyui-inpaint-nodes`** extension's
  Fooocus inpaint patch (`fooocus_inpaint_head.pth` + `inpaint_v26.fooocus.patch`).
  Best unmasked-area preservation + center coherence with photoreal checkpoints.
- **Tier C — quality ceiling (later):** **Flux.1 Fill [dev]** in **fp8** (+ `t5xxl_fp8`,
  `clip_l`, flux VAE). Best fill quality; ~12 GB download; runs on 5080 fp8. Only after
  A/B weld is proven.

For the **first feasibility test, use Tier B.** The anchor weld is guaranteed by the
composite step (§4) regardless of model, so model choice only affects center quality.

---

## 3. First-round resolution

SDXL is happiest near ~1 MP; our canvas is 3168×1344 (4.26 MP, 21:9) — too wide for a
clean single SDXL pass (risks repetition).

- **Round 1 (prove the weld):** downscale canvas **and** mask to **1536×640** (both ÷64,
  ≈1 MP, ratio 2.40 vs native 2.357 — ~1.4% wider, negligible). Fast, clean latents.
- **Round 2 (quality, after weld confirmed):** either native **3168×1344** in one SDXL
  pass (5080 can; enable **tiled VAE**, watch for wide-canvas repetition) **or** the
  crispest route — **inpaint the center at ~1536 then composite the generated center
  back onto the full-res native canvas** (native anchors stay pixel-perfect).

Keep dimensions multiples of 8 (ideally 64). Downscale the mask with **nearest-neighbor**
(no interpolation) so black/white stays crisp.

---

## 4. Minimal ComfyUI graph (Tier B)

```
Load Checkpoint (sdxl-inpainting-0.1)
        │ model ─────────────────────────────────────────────┐
        │ clip ── CLIP Text Encode (+)  ← prompt.txt ──┐      │
        │ clip ── CLIP Text Encode (−)  ← negative ───┐│      │
        │ vae ───────────────────────────────┐        ││      │
Load Image (adapter-work-canvas.png) ─ pixels ┤        ││      │
Load Image (adapter-mask.png) ─ Image→Mask ─── mask ──┐│|      │
                                                      ││|      │
        InpaintModelConditioning(pos,neg,vae,pixels,mask)      │
                         │ positive,negative,latent            │
                         └────────────► KSampler ◄─────────────┘
                                          │ LATENT
                                       VAE Decode ─ generated_img
                                          │
   ImageCompositeMasked(                  │
     destination = work-canvas (original),│   ← keeps native anchor pixels
     source      = generated_img,         │
     mask        = adapter-mask)          │   ← white→use generated (center only)
                         │
                   Save Image  → ComfyUI/output/inpaint-sdxl-XX.png
```

**The `ImageCompositeMasked` step is the whole point.** Even though the sampler only
touches the masked center, the VAE encode/decode can shift unmasked pixels slightly;
compositing the **original** canvas back wherever the mask is **black** makes the anchors
**byte-identical** to the real plate crops → guaranteed `blend = 0` weld.

- Mask node: our mask is RGB-greyscale, so use `Image To Mask` (channel = red) or
  `Convert Image to Mask`. **Preview the mask** once to confirm white = center.
- For `InpaintModelConditioning`, leave the unmasked latent locked (default). Our mask
  already overmasks ~190 px into each anchor; add only a small `grow_mask_by` 8–16 px and
  a light blur (≤4 px) inside the sampler for seam softness — but feed the **composite
  step a hard (un-blurred) mask** so the restored anchors are exact.

### Tier A variant
Replace the inpaint checkpoint with Juggernaut/RealVisXL + add
`Load Fooocus Inpaint` + `Apply Fooocus Inpaint` (from `comfyui-inpaint-nodes`) between
the model and KSampler; everything else identical, including the composite-restore.

---

## 5. First-round parameters

| Param | Value | Note |
|---|---|---|
| denoise | **1.0** | inpaint conditioning only regenerates masked area |
| steps | **30** | SDXL |
| sampler | `dpmpp_2m` | + scheduler `karras` |
| CFG | **6.5** | range 5–8 |
| batch size | **4** | 5080 16 GB handles SDXL@1 MP ×4 easily; gives a selection |
| seed | random, **record each** | note seeds for repro; reuse a good seed at Round 2 |
| grow_mask_by | 8–16 px | small; we already overmask in-canvas |
| mask blur (sampler) | ≤4 px | composite mask stays hard |

Generate **2–4** images in round 1 (one batch). That is enough to judge the method; do
**not** mass-generate before the weld is verified.

---

## 6. ControlNet / structure-guide

**Round 1: OFF.** Keep variables minimal and prove the masked weld first. (Turn 9 already
found the structure-guide risky as a reference.) If the center comes out incoherent
(floating horizon, mushy ridges), Round 2 may add **one** light ControlNet — Tile or
Depth — at low weight (~0.4) for large-shape guidance only. Do not stack multiple.

---

## 7. Output artifact contract

- **Save candidates to:** `docs/research/experiments/working/002-wide-structure-workbench/candidates/`
  with an **`inpaint-`** prefix, e.g. `inpaint-sdxl-01.png` … `inpaint-sdxl-04.png`.
  Do **not** overwrite the Higgsfield `c0X` files.
- **Save the workflow** (drag-drop reproducible) to
  `.../002-wide-structure-workbench/workflows/inpaint-sdxl.json`.
- **Extend** `candidates/candidates.md` with a new "Inpaint batch" section (append, don't
  rewrite). Per candidate record: backend (ComfyUI), checkpoint name + hash, resolution,
  denoise, steps, sampler/scheduler, CFG, **seed**, mask file, prompt/negative versions,
  grow/blur, "composite-anchor-restore: yes/no", date.
- **Hand-off to Codex (next turn):** promote at most **1** best inpaint candidate into
  `public/panos/adapters/dawn-valley__dusk-ridge/` as a **new** selector option in
  `src/pano/panoRing.ts` — never overwrite baseline / exp001 / c08 / c04.

---

## 8. Verification (the part that matters most)

**(a) Anchor-preserved check — pixel exact.** Extract the left 1045 px and right 1045 px
of each inpaint output and diff against the same columns of `adapter-work-canvas.png`
(or against `dawn-valley-right-crop.jpg` / `dusk-ridge-left-crop.jpg`). With the §4
composite step, the diff must be **≈0** (identical). If it is not ~0, the composite step
is mis-wired (wrong mask polarity) — fix before judging anything.
A ready-made check already exists in this repo's pattern: a small `sharp` script that
`extract`s the strips and compares means / max-diff (mirror the Turn 11 `review/` script).

**(b) `blend = 0` butt-join — same test as Turn 11.** Rebuild the join composites
(`review/join-inpaint.jpg`): `[dawn-valley right edge | inpaint left edge]` and
`[inpaint right edge | dusk-ridge left edge]`, red line on the seam. Because the anchors
are now the real plate pixels, the seam should be **continuous / invisible** — unlike the
Higgsfield c08/c04 joins which showed a value/structure step. Also run the runtime seam
lab: select the inpaint option, `blend = 0`, inspect boundary 0 and 1.
**Win condition:** at `blend = 0`, the dawn→adapter and adapter→dusk seams show **no**
value/structure step (clearly better than c08/c04). Then judge the *center* quality
separately — that is what the inpaint model actually contributes.

**(c) Compare** the new join composite side-by-side with the existing
`review/join-c08.jpg` / `review/join-c04.jpg` to make the improvement explicit and honest.

---

## 9. Verdict

**`READY-FOR-WINDOWS-COMFYUI`** — repo side is ready: the prep artifacts are already in
exactly the shape ComfyUI inpaint wants (init image + matching-polarity mask + prompt
files), and this plan is executable as-is. The only outstanding work is the **one-time
ComfyUI + model setup on the Windows 5080 box** (§0, §2), which is standard.

### Tomorrow, on the 5080 Windows PC — do this
1. Install/refresh **ComfyUI portable (recent)**; verify torch is **cu128 / sees the 5080** (§0).
2. Download **`stable-diffusion-xl-1.0-inpainting-0.1`** (single-file safetensors) into
   `ComfyUI/models/checkpoints/`. (Optional Tier A: install `comfyui-inpaint-nodes` +
   the two Fooocus patch files into `ComfyUI/models/inpaint/`.)
3. Copy this folder's `adapter-work-canvas.png`, `adapter-mask.png`, `prompt.txt`,
   `negative-prompt.txt` to `ComfyUI/input/`.
4. Build the §4 graph (or load `workflows/inpaint-sdxl.json` once it exists). **Downscale
   canvas+mask to 1536×640** (mask = nearest-neighbor).
5. Run the §5 params, **batch 4**. Save to `candidates/inpaint-sdxl-0X.png`; save the
   workflow JSON.
6. Run the §8 verification: anchor pixel-diff ≈0, then `blend = 0` butt-join vs c08/c04.
7. If the weld is clean → promote 1 best (hand to Codex) and scale to native in Round 2.
   If not → it is almost certainly mask polarity or a missing composite step (§4/§8a).

### Risks / limits
- Blackwell torch mismatch (§0) — the #1 likely failure tomorrow.
- SDXL wide-canvas repetition at native res — mitigated by 1536 round-1 then scale-up.
- Inpaint center can disagree with anchor *lighting/perspective* even when pixels weld;
  the seam will be clean but the mid-transition may still need prompt/ControlNet tuning.
- This proves the *method* on one boundary; pluggability to other pairs is a later turn.
