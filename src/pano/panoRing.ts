import type {
  PanoRingConfig,
  PanoSeam,
  RingBoundary,
  RingSegment,
  SegmentVisuals,
} from "./panoTypes";

export type DawnDuskAdapterOptionId =
  | "baseline"
  | "exp001-edge-anchored-v1"
  | "exp002-c08-struct-off-leftpreserve"
  | "exp002-c04-struct-off-orig"
  | "hf-nb2-axb-01"
  | "hf-nb2-axb-02";

export interface DawnDuskAdapterOption {
  id: DawnDuskAdapterOptionId;
  label: string;
  imageUrl: string;
  notes: string;
}

export const DAWN_DUSK_ADAPTER_OPTIONS: DawnDuskAdapterOption[] = [
  {
    id: "baseline",
    label: "baseline",
    imageUrl: "/panos/seams/dawn-valley__dusk-ridge.jpg",
    notes: "Original dawn-valley -> dusk-ridge seam baseline.",
  },
  {
    id: "exp001-edge-anchored-v1",
    label: "exp001 edge-anchored",
    imageUrl: "/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg",
    notes: "Loop 2 edge-anchored adapter candidate; verdict INCONCLUSIVE.",
  },
  {
    id: "exp002-c08-struct-off-leftpreserve",
    label: "exp002 c08 left-preserve",
    imageUrl: "/panos/adapters/dawn-valley__dusk-ridge/exp002-c08-struct-off-leftpreserve.png",
    notes:
      "Loop 9 Higgsfield whole-frame image-to-image candidate c08; promoted for honest blend=0 inspection.",
  },
  {
    id: "exp002-c04-struct-off-orig",
    label: "exp002 c04 original",
    imageUrl: "/panos/adapters/dawn-valley__dusk-ridge/exp002-c04-struct-off-orig.png",
    notes:
      "Loop 9 Higgsfield whole-frame image-to-image candidate c04; promoted for honest blend=0 inspection.",
  },
  {
    id: "hf-nb2-axb-01",
    label: "HF NB2 AXB 01",
    imageUrl: "/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-01.png",
    notes:
      "Turn 18 Nano Banana 2 reference candidate from AXB canvas + mask. Whole-frame generation; anchors are not pixel-guaranteed.",
  },
  {
    id: "hf-nb2-axb-02",
    label: "HF NB2 AXB 02",
    imageUrl: "/panos/adapter-candidates/dawn-valley__dusk-ridge/hf-nb2-axb-02.png",
    notes:
      "Turn 18 softer Nano Banana 2 reference candidate from AXB canvas + mask. Dashboard active for review, not visually accepted yet.",
  },
];

export const DEFAULT_DAWN_DUSK_ADAPTER_OPTION_ID: DawnDuskAdapterOptionId = "exp001-edge-anchored-v1";

/**
 * The default ring.
 *
 * Three Higgsfield plates (dawn → dusk → night) plus three Higgsfield seam plates
 * that bridge each adjacent pair, including the wrap seam (night → dawn). The
 * per-segment knobs below are the alignment controls — tune `scale` / `xOffset` /
 * `yOffset` / `fitMode` to line up horizons and ridges across a boundary.
 */
export const PANO_RING: PanoRingConfig = {
  id: "day-night-ring",
  label: "Day → Night ring",
  loopDurationSeconds: 120,
  direction: "left",
  defaultOverlapVw: 12,
  plates: [
    {
      id: "dawn-valley",
      label: "Dawn Valley",
      imageUrl: "/panos/dawn-valley.jpg",
      notes: "Golden-hour valley + winding lake (21:9).",
    },
    {
      id: "dusk-ridge",
      label: "Dusk Ridge",
      imageUrl: "/panos/dusk-ridge.jpg",
      yOffset: -0.02,
      notes: "Indigo/magenta twilight ridges (16:9).",
    },
    {
      id: "moonlit-tidelands",
      label: "Moonlit Tidelands",
      imageUrl: "/panos/moonlit-tidelands.jpg",
      yOffset: 0.02,
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
  notes: "N=3 plates + 3 seams. Seam lab: tune overlap/fit/offset, inspect each boundary.",
};

function findDawnDuskAdapterOption(optionId: DawnDuskAdapterOptionId) {
  return DAWN_DUSK_ADAPTER_OPTIONS.find((option) => option.id === optionId) ?? DAWN_DUSK_ADAPTER_OPTIONS[0];
}

export function buildPanoRingWithDawnDuskAdapter(optionId: DawnDuskAdapterOptionId): PanoRingConfig {
  const option = findDawnDuskAdapterOption(optionId);

  return {
    ...PANO_RING,
    seams: PANO_RING.seams?.map((seam) =>
      seam.fromId === "dawn-valley" && seam.toId === "dusk-ridge"
        ? { ...seam, imageUrl: option.imageUrl, notes: option.notes }
        : seam,
    ),
  };
}

const PLATE_DEFAULTS: Required<SegmentVisuals> = {
  widthVw: 100,
  fitMode: "cover",
  scale: 1,
  xOffset: 0,
  yOffset: 0,
};

const SEAM_DEFAULTS: Required<SegmentVisuals> = {
  widthVw: 100,
  fitMode: "cover",
  scale: 1,
  xOffset: 0,
  yOffset: 0,
};

function resolve(v: SegmentVisuals, defaults: Required<SegmentVisuals>): Required<SegmentVisuals> {
  return {
    widthVw: v.widthVw ?? defaults.widthVw,
    fitMode: v.fitMode ?? defaults.fitMode,
    scale: v.scale ?? defaults.scale,
    xOffset: v.xOffset ?? defaults.xOffset,
    yOffset: v.yOffset ?? defaults.yOffset,
  };
}

function findSeam(seams: PanoSeam[] | undefined, fromId: string, toId: string) {
  return seams?.find((s) => s.fromId === fromId && s.toId === toId);
}

/**
 * Flatten a ring config into the ordered window list:
 * `[plate0, seam0→1, plate1, …, plateN-1, seamN-1→0]` (wrapping last→first).
 * A missing seam simply butt-joins its neighbours. Works for any N.
 */
export function buildRingSegments(config: PanoRingConfig): RingSegment[] {
  const { plates, seams } = config;
  const n = plates.length;
  const segments: RingSegment[] = [];

  plates.forEach((plate, i) => {
    const v = resolve(plate, PLATE_DEFAULTS);
    segments.push({ key: `plate-${plate.id}`, kind: "plate", label: plate.id, imageUrl: plate.imageUrl, ...v });

    const next = plates[(i + 1) % n];
    const seam = findSeam(seams, plate.id, next.id);
    if (seam) {
      const sv = resolve(seam, SEAM_DEFAULTS);
      segments.push({
        key: `seam-${plate.id}-${next.id}`,
        kind: "seam",
        label: `${plate.id} → ${next.id}`,
        imageUrl: seam.imageUrl,
        ...sv,
      });
    }
  });

  return segments;
}

/** Every boundary in the ring (between segment i and i+1, wrapping at the end). */
export function buildBoundaries(segments: RingSegment[]): RingBoundary[] {
  const n = segments.length;
  return segments.map((seg, i) => {
    const right = segments[(i + 1) % n];
    return {
      index: i,
      label: `${seg.label}  ▸  ${right.label}`,
      leftKind: seg.kind,
      rightKind: right.kind,
    };
  });
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
