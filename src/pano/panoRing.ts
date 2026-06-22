import type {
  PanoRingConfig,
  PanoSeam,
  RingBoundary,
  RingSegment,
  SegmentVisuals,
} from "./panoTypes";

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
