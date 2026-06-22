# FINDINGS.md

## Current Conclusions

- The useful runtime model is full `[A][X][B]` adapters with anchor overlap, not
  X-only runtime crops and not legacy standalone seam images.
- The homepage should be honest: completed adapters look good; unfinished work
  canvases look visibly wrong.
- The clean runtime set should stay small: 3 plates + 3 work canvases + completed
  manual adapter images as they become available.
- Old GPT/HF sweeps, soft-adoption variants, legacy seams, and giant working folders
  were research noise for the current goal and should not return to `public/panos`.
