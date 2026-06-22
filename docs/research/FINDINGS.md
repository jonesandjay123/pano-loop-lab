# FINDINGS.md

## Current Conclusions

- The useful runtime model is ordered plates plus full `from -> to` adapters, not
  X-only runtime crops and not legacy standalone seam images.
- The homepage should be honest: completed adapters look good; unfinished work
  canvases look visibly wrong.
- The clean runtime can support N plates, with a minimum of 2. It should not be
  hardcoded to A/B/C.
- The first production set uses 4 plates. Each source plate is exactly
  `6144 x 1536`.
- Old GPT/HF sweeps, soft-adoption variants, legacy seams, and giant working folders
  were research noise for the current goal and should not return to `public/panos`.
- `generated/production-plates/` may keep curated production source plates and
  review sheets. Runtime assets still enter through upload or scene config import.
