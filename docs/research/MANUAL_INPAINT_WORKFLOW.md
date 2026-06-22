# Manual Inpaint Workflow

1. Open `/#adapter-workbench`.
2. Load or replace the plate slots with exact `6144 x 1536` PNGs.
3. Adjust plate order until the derived pair order is correct.
4. Use the workbench batch download to export all generated work adapters.
5. In Photoshop, fill only the middle X region while preserving the left and right anchor regions.
6. Export each finished adapter as a full `6144 x 1536` PNG.
7. Upload each finished adapter back into its matching pair in the workbench.
8. Verify the homepage loop. Unfinished pairs should remain visibly unfinished.
9. Export a scene config when the current loop is worth preserving.

```text
Plate:            6144 x 1536
Finished adapter: 6144 x 1536
m:                1024
X zone:           4096
```

Do not wire finished adapters into `src/` or `public/panos`. The runtime reads the
browser workbench state, with scene config export/import used for preservation.
