import type { PanoRingConfig, PanoSeam, RingSegment } from "./panoTypes";

/**
 * The default ring.
 *
 * Three Higgsfield plates (dawn → dusk → night) plus three Higgsfield-generated
 * **seam** plates that bridge each adjacent pair, including the wrap seam that
 * closes night back to dawn. Add a 4th plate + its two new seams and the renderer
 * picks it up with no other changes — that's the N-image pipeline.
 */
export const PANO_RING: PanoRingConfig = {
  id: "day-night-ring",
  label: "Day → Night ring",
  loopDurationSeconds: 120, // one slow lap of the whole ring
  direction: "left",
  plates: [
    {
      id: "dawn-valley",
      label: "Dawn Valley",
      imageUrl: "/panos/dawn-valley.jpg",
      baseScale: 1.04,
      verticalOffset: 0.0,
      notes: "Golden-hour valley + winding lake (21:9).",
    },
    {
      id: "dusk-ridge",
      label: "Dusk Ridge",
      imageUrl: "/panos/dusk-ridge.jpg",
      baseScale: 1.04,
      verticalOffset: -0.02,
      notes: "Indigo/magenta twilight ridges (16:9).",
    },
    {
      id: "moonlit-tidelands",
      label: "Moonlit Tidelands",
      imageUrl: "/panos/moonlit-tidelands.jpg",
      baseScale: 1.04,
      verticalOffset: 0.02,
      notes: "Moonlit tideland, reflective flats (16:9).",
    },
  ],
  seams: [
    {
      fromId: "dawn-valley",
      toId: "dusk-ridge",
      imageUrl: "/panos/seams/dawn-valley__dusk-ridge.jpg",
      notes: "Warm dawn morphs into cool dusk.",
    },
    {
      fromId: "dusk-ridge",
      toId: "moonlit-tidelands",
      imageUrl: "/panos/seams/dusk-ridge__moonlit-tidelands.jpg",
      notes: "Twilight ridges descend into moonlit flats.",
    },
    {
      fromId: "moonlit-tidelands",
      toId: "dawn-valley",
      imageUrl: "/panos/seams/moonlit-tidelands__dawn-valley.jpg",
      notes: "Wrap seam: night brightens back to dawn, closing the ring.",
    },
  ],
  overlayGradient: {
    css: "linear-gradient(180deg, rgba(10,8,20,0.10) 0%, rgba(10,8,20,0.0) 40%, rgba(8,6,16,0.26) 100%)",
    opacity: 1,
  },
  notes: "N=3 plates + 3 seams. Drag to scrub, or let it auto-scroll one lap / 120s.",
};

const DEFAULTS = { fitMode: "cover" as const, baseScale: 1.04, verticalOffset: 0 };

function findSeam(seams: PanoSeam[] | undefined, fromId: string, toId: string) {
  return seams?.find((s) => s.fromId === fromId && s.toId === toId);
}

/**
 * Flatten a ring config into the ordered list of render windows:
 * `[plate0, seam0→1, plate1, seam1→2, …, plateN-1, seamN-1→0]`.
 *
 * Works for any number of plates. A seam is only inserted when its image is
 * provided; a missing seam simply butt-joins its neighbours (still a valid ring,
 * just a harder cut there). The wrap seam (last → first) closes the loop.
 */
export function buildRingSegments(config: PanoRingConfig): RingSegment[] {
  const { plates, seams } = config;
  const n = plates.length;
  const segments: RingSegment[] = [];

  plates.forEach((plate, i) => {
    segments.push({
      key: `plate-${plate.id}`,
      kind: "plate",
      label: plate.id,
      imageUrl: plate.imageUrl,
      fitMode: plate.fitMode ?? DEFAULTS.fitMode,
      baseScale: plate.baseScale ?? DEFAULTS.baseScale,
      verticalOffset: plate.verticalOffset ?? DEFAULTS.verticalOffset,
    });

    const next = plates[(i + 1) % n];
    const seam = findSeam(seams, plate.id, next.id);
    if (seam) {
      segments.push({
        key: `seam-${plate.id}-${next.id}`,
        kind: "seam",
        label: `${plate.id} → ${next.id}`,
        imageUrl: seam.imageUrl,
        fitMode: seam.fitMode ?? DEFAULTS.fitMode,
        baseScale: seam.baseScale ?? 1.0,
        verticalOffset: seam.verticalOffset ?? DEFAULTS.verticalOffset,
      });
    }
  });

  return segments;
}

/** How many of the ring's adjacent pairs actually have a seam image. */
export function seamCoverage(config: PanoRingConfig): { present: number; total: number } {
  const n = config.plates.length;
  let present = 0;
  for (let i = 0; i < n; i++) {
    const from = config.plates[i].id;
    const to = config.plates[(i + 1) % n].id;
    if (findSeam(config.seams, from, to)) present++;
  }
  return { present, total: n };
}
