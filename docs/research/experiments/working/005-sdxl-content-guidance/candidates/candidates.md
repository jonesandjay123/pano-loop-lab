# 005 SDXL content-guidance candidates

Generated: 2026-06-19 (Turn 15, Codex as Runner) on Jones's Windows RTX 5080 box.
Backend: **ComfyUI 0.25.0**, model `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`
via `DiffusersLoader`, torch `2.11.0+cu128`, CUDA 12.8.

## Variable tested

Only the positive prompt changed. The new `right-aware-prompt.txt` asks the right third
to cool toward blue-violet dusk ridges, avoid warm vertical walls, avoid central dark
mountain mass, and avoid a warm sunlit mountain near the right edge.

The model, mask, canvas, negative prompt, sampler, resolution, and soft composite recipe
were held constant:

- Resolution: `1536 x 640`.
- Steps: `30`.
- CFG: `6.5`.
- Sampler / scheduler: `dpmpp_2m` / `karras`.
- Denoise: `1.0`.
- ControlNet: OFF.
- Final restore: `scripts/soft-composite-restore.py`, feather `64px`.

## Candidates

| id | raw | soft64 | seed | outer-left diff | outer-right diff | verdict |
|---|---|---|---:|---:|---:|---|
| rightaware-01 | `rightaware-01-raw.png` | `rightaware-01-soft64.png` | `5252001` | 0 | 0 | REJECT: large central dark mountain remains; right side still warms into dusk. |
| rightaware-02 | `rightaware-02-raw.png` | `rightaware-02-soft64.png` | `5252002` | 0 | 0 | PARTIAL / best of batch: better distant ridges, but still warm/grey before the right anchor. |

## Review artifacts

- `../review/rightaware-01-anchor-diff.json`
- `../review/rightaware-02-anchor-diff.json`
- `../review/join-rightaware-01.jpg`
- `../review/join-rightaware-02.jpg`
- `../review/compare-rightaware-vs-hard-softcomp-c08-c04.jpg`

## Visual verdict

The right-aware prompt did **not** solve the content-guidance problem. It does add more
right-side ridge language, especially in `rightaware-02`, but the generated center does
not cool early enough. The right overmask band remains warm/grey/brown before meeting
the blue-violet `dusk-ridge` anchor, so the warm/cool conflict is still visible.

Compared with Turn 14 `softcomp-02`, this batch is not a clear improvement. It keeps the
mechanical strengths (outer anchor diff = 0, no hard white restore stripe), but the
world transition remains less convincing than Higgsfield c08/c04 and not suitable for
selector promotion.

Keep `rightaware-02` only as a diagnostic reference. Do not promote this batch.
