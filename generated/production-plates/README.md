# Production Plates

This folder contains curated production source plates for the current panorama loop.

## Current Set

```text
raw/00-6144x1536.png
raw/01-6144x1536.png
raw/02-6144x1536.png
raw/03-6144x1536.png
```

All four images are exactly `6144 x 1536`.

`contact-sheet-current.png` is a review sheet only. Do not use it as a runtime plate.

## Finished Adapters

Photoshop-filled connection images belong in:

```text
finished-adapters/
```

Each file in that folder should be a full `6144 x 1536` adapter image:

```text
left 1024px source edge + filled 4096px X zone + right 1024px target edge
```

Suggested names for the current four-plate loop:

```text
00-to-01-finished.png
01-to-02-finished.png
02-to-03-finished.png
03-to-00-finished.png
```

## Usage

1. Open `/#adapter-workbench`.
2. Replace or add plate slots with the files in `raw/`.
3. Download the generated work adapters.
4. Fill the X regions in Photoshop.
5. Save the Photoshop output in `finished-adapters/`.
6. Upload the finished adapters back into the matching pairs.
7. Export a scene config once the loop is approved.
