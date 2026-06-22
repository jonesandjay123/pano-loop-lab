import type {
  PanoRingConfig,
  PanoSeam,
  RingBoundary,
  RingSegment,
  SegmentVisuals,
} from "./panoTypes";

const ASPECT = {
  dawnValley: 3168 / 1344,
  duskRidge: 2688 / 1520,
  moonlitTidelands: 2688 / 1520,
  axb: 3136 / 1344,
};

const AXB_ANCHOR_WIDTH_PX = 523;

const AXB_SOCKET = {
  aspectRatio: ASPECT.axb,
  overlapStartPx: AXB_ANCHOR_WIDTH_PX,
  overlapEndPx: AXB_ANCHOR_WIDTH_PX,
  edgeLocked: true,
} satisfies SegmentVisuals;

export const PANO_RING: PanoRingConfig = {
  id: "clean-axb-ring",
  label: "Clean AXB ring",
  loopDurationSeconds: 120,
  direction: "left",
  defaultOverlapVw: 0,
  plates: [
    {
      id: "dawn-valley",
      label: "Dawn Valley",
      imageUrl: "/panos/dawn-valley.jpg",
      aspectRatio: ASPECT.dawnValley,
      edgeLocked: true,
      notes: "Plate A.",
    },
    {
      id: "dusk-ridge",
      label: "Dusk Ridge",
      imageUrl: "/panos/dusk-ridge.jpg",
      aspectRatio: ASPECT.duskRidge,
      edgeLocked: true,
      notes: "Plate B.",
    },
    {
      id: "moonlit-tidelands",
      label: "Moonlit Tidelands",
      imageUrl: "/panos/moonlit-tidelands.jpg",
      aspectRatio: ASPECT.moonlitTidelands,
      edgeLocked: true,
      notes: "Plate C.",
    },
  ],
  seams: [
    {
      fromId: "dawn-valley",
      toId: "dusk-ridge",
      imageUrl: "/panos/adapters-clean/dawn-valley__dusk-ridge-photoshop-test1.png",
      ...AXB_SOCKET,
      notes: "Filled AXB from Photoshop test 1.",
    },
    {
      fromId: "dusk-ridge",
      toId: "moonlit-tidelands",
      imageUrl: "/panos/adapters-clean/dusk-ridge__moonlit-tidelands-work.png",
      ...AXB_SOCKET,
      notes: "Unfilled BXC work canvas placeholder. This should look wrong until manually filled.",
    },
    {
      fromId: "moonlit-tidelands",
      toId: "dawn-valley",
      imageUrl: "/panos/adapters-clean/moonlit-tidelands__dawn-valley-work.png",
      ...AXB_SOCKET,
      notes: "Unfilled CXA work canvas placeholder. This should look wrong until manually filled.",
    },
  ],
  notes: "Clean runtime: A/B/C plates plus full AXB/BXC/CXA adapters with anchor overlap.",
};

const PLATE_DEFAULTS = {
  widthVw: 100,
  overlapStartPx: 0,
  overlapEndPx: 0,
  fitMode: "cover",
  scale: 1,
  xOffset: 0,
  yOffset: 0,
  edgeLocked: false,
} satisfies Required<Pick<SegmentVisuals, "widthVw" | "overlapStartPx" | "overlapEndPx" | "fitMode" | "scale" | "xOffset" | "yOffset" | "edgeLocked">>;

const SEAM_DEFAULTS = PLATE_DEFAULTS;

function resolve(v: SegmentVisuals, defaults: typeof PLATE_DEFAULTS): Omit<RingSegment, "key" | "kind" | "label" | "imageUrl"> {
  return {
    widthVw: v.widthVw ?? defaults.widthVw,
    aspectRatio: v.aspectRatio,
    overlapStartPx: v.overlapStartPx ?? defaults.overlapStartPx,
    overlapEndPx: v.overlapEndPx ?? defaults.overlapEndPx,
    edgeLocked: v.edgeLocked ?? defaults.edgeLocked,
    fitMode: v.fitMode ?? defaults.fitMode,
    scale: v.scale ?? defaults.scale,
    xOffset: v.xOffset ?? defaults.xOffset,
    yOffset: v.yOffset ?? defaults.yOffset,
  };
}

function findSeam(seams: PanoSeam[] | undefined, fromId: string, toId: string) {
  return seams?.find((s) => s.fromId === fromId && s.toId === toId);
}

export function buildRingSegments(config: PanoRingConfig): RingSegment[] {
  const { plates, seams } = config;
  const n = plates.length;
  const segments: RingSegment[] = [];

  plates.forEach((plate, i) => {
    const previous = plates[(i - 1 + n) % n];
    const previousSeam = findSeam(seams, previous.id, plate.id);
    const previousOverlapEndPx = previousSeam?.overlapEndPx ?? 0;
    const v = {
      ...resolve(plate, PLATE_DEFAULTS),
      overlapStartPx: plate.overlapStartPx ?? previousOverlapEndPx,
    };
    segments.push({ key: `plate-${plate.id}`, kind: "plate", label: plate.id, imageUrl: plate.imageUrl, ...v });

    const next = plates[(i + 1) % n];
    const seam = findSeam(seams, plate.id, next.id);
    if (seam) {
      const sv = resolve(seam, SEAM_DEFAULTS);
      segments.push({
        key: `seam-${plate.id}-${next.id}`,
        kind: "seam",
        label: `${plate.id} -> ${next.id}`,
        imageUrl: seam.imageUrl,
        ...sv,
      });
    }
  });

  return segments;
}

export function buildBoundaries(segments: RingSegment[]): RingBoundary[] {
  const n = segments.length;
  return segments.map((seg, i) => {
    const right = segments[(i + 1) % n];
    return {
      index: i,
      label: `${seg.label} -> ${right.label}`,
      leftKind: seg.kind,
      rightKind: right.kind,
    };
  });
}

export function seamCoverage(config: PanoRingConfig): { present: number; total: number } {
  const n = config.plates.length;
  let present = 0;
  for (let i = 0; i < n; i += 1) {
    const from = config.plates[i].id;
    const to = config.plates[(i + 1) % n].id;
    if (findSeam(config.seams, from, to)) present += 1;
  }
  return { present, total: n };
}
