import type { PanoLoopConfig } from "./panoTypes";

/**
 * The default pano loop.
 *
 * The three Higgsfield matte plates are reused here as *ordered segments* (no
 * longer separately selectable scenes). The order is a natural day -> night
 * journey — dawn valley, dusk ridge, moonlit tidelands — so the endless leftward
 * scroll reads as travelling through one widening world and back around.
 */
export const PANO_LOOP: PanoLoopConfig = {
  id: "day-to-night",
  label: "Day → Night reel",
  loopDurationSeconds: 72, // ~24s per segment; slow, contemplative
  direction: "left",
  segments: [
    {
      id: "dawn-valley",
      label: "Dawn Valley",
      imageUrl: "/panos/dawn-valley.jpg",
      fitMode: "cover",
      baseScale: 1.04,
      verticalOffset: 0.0,
      notes: "Higgsfield matte: golden-hour valley + winding lake (21:9).",
    },
    {
      id: "dusk-ridge",
      label: "Dusk Ridge",
      imageUrl: "/panos/dusk-ridge.jpg",
      fitMode: "cover",
      baseScale: 1.04,
      verticalOffset: -0.02,
      notes: "Higgsfield matte: indigo/magenta twilight ridges (16:9).",
    },
    {
      id: "moonlit-tidelands",
      label: "Moonlit Tidelands",
      imageUrl: "/panos/moonlit-tidelands.jpg",
      fitMode: "cover",
      baseScale: 1.04,
      verticalOffset: 0.02,
      notes: "Higgsfield matte: moonlit tideland, reflective flats (16:9).",
    },
  ],
  // One subtle vignette across the whole strip keeps mood consistent and avoids
  // per-segment overlays banding at the seams.
  overlayGradient: {
    css: "linear-gradient(180deg, rgba(10,8,20,0.10) 0%, rgba(10,8,20,0.0) 40%, rgba(8,6,16,0.26) 100%)",
    opacity: 1,
  },
  notes: "First reel built from the three existing plates to inspect A→B→C seams.",
};
