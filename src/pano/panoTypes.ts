/**
 * Data model for the panorama RING — now a seam-research lab.
 *
 * The hard problem this repo exists to solve: take N independently AI-generated
 * far-background plates and make them read as ONE continuous world band. The ring
 * is `plate0, seam0→1, plate1, …, plateN-1, seamN-1→0` (the wrap closes it).
 *
 * This phase does NOT claim pixel-perfect welds. It turns the renderer into an
 * instrument for studying the boundaries: every segment exposes fit/scale/offset
 * knobs so horizons and ridges can be hand-aligned, adjacent segments can OVERLAP
 * and cross-fade, and a debug/inspect mode can reveal the *real* contact seam
 * (feather off) instead of hiding it. Whether CSS overlap + offsets can hide ~70%
 * of the mismatch is exactly what we want to find out here; the true fix
 * (edge-locked outpaint per boundary) is a later, separate phase.
 *
 * Everything is plain serializable data, so a ring could live in a JSON manifest.
 */

/**
 * How an image fills its window.
 * - `cover`  : fill both axes (crops — note: trims the seam's engineered edges).
 * - `height` : fit height, width follows aspect (less vertical crop).
 * - `width`  : fit width, height follows aspect (preserves left/right edges).
 */
export type FitMode = "cover" | "height" | "width";

/** Optional darkening/vignette overlay painted across the whole strip. */
export interface OverlayGradient {
  css: string;
  opacity: number;
}

/** Per-window visual knobs, shared by plates and seams. All optional w/ defaults. */
export interface SegmentVisuals {
  /** Fallback window width in vw. Ignored when `aspectRatio` is set. */
  widthVw?: number;
  /** Natural image width / height. When set, review can preserve true image edges. */
  aspectRatio?: number;
  /** Pixels from this segment's left edge that should overlap the previous segment. */
  overlapStartPx?: number;
  /** Pixels from this segment's right edge that the next segment should overlap. */
  overlapEndPx?: number;
  /** Disable overscan/pan cropping so segment boundaries correspond to source image edges. */
  edgeLocked?: boolean;
  /** How the image fills the window. Default `cover`. */
  fitMode?: FitMode;
  /** Zoom applied within the window (>= 1 keeps it covered). Default 1. */
  scale?: number;
  /** Horizontal pan as a fraction of the window width (-0.5..0.5). Default 0. */
  xOffset?: number;
  /** Vertical pan as a fraction of the window height (-0.5..0.5). Default 0. */
  yOffset?: number;
}

/** One background plate — a "scene" in the ring (N of these). */
export interface PanoPlate extends SegmentVisuals {
  id: string;
  label: string;
  imageUrl: string;
  notes?: string;
}

/** A transition image stitched between two adjacent plates. */
export interface PanoSeam extends SegmentVisuals {
  /** Plate id this seam's LEFT edge continues. */
  fromId: string;
  /** Plate id this seam's RIGHT edge continues. */
  toId: string;
  imageUrl: string;
  notes?: string;
}

/** The whole ring: ordered plates + the seams that connect them. */
export interface PanoRingConfig {
  id: string;
  label: string;
  /** Plates in ring order. The wrap (last → first) is implied. */
  plates: PanoPlate[];
  /** Seam images, matched to plate pairs by `fromId`/`toId`. Optional / partial. */
  seams?: PanoSeam[];
  /** Seconds for one full lap of the ring at auto-scroll speed. */
  loopDurationSeconds: number;
  /** Auto-scroll travel direction. Defaults to "left". */
  direction?: "left" | "right";
  /** Default overlap/feather width (vw) between adjacent windows. Default 12. */
  defaultOverlapVw?: number;
  /** Optional vignette across the whole strip. */
  overlayGradient?: OverlayGradient;
  notes?: string;
}

/**
 * A flattened, render-ready window of the ring (plate or seam) with all visual
 * defaults resolved. Produced by `buildRingSegments`.
 */
export interface RingSegment {
  key: string;
  kind: "plate" | "seam";
  /** Debug label, e.g. "dawn-valley" or "dawn-valley → dusk-ridge". */
  label: string;
  imageUrl: string;
  widthVw: number;
  aspectRatio?: number;
  overlapStartPx: number;
  overlapEndPx: number;
  edgeLocked: boolean;
  fitMode: FitMode;
  scale: number;
  xOffset: number;
  yOffset: number;
}

/**
 * A boundary between two adjacent ring windows — the thing we actually inspect.
 * `index` i is the seam line between rendered segment i and i+1.
 */
export interface RingBoundary {
  index: number;
  /** e.g. "dawn-valley ▸ dawn-valley→dusk-ridge". */
  label: string;
  leftKind: "plate" | "seam";
  rightKind: "plate" | "seam";
}
