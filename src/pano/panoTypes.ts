/**
 * Data model for the panorama RING.
 *
 * This lab builds the far-background environment for a 3D immersive site as a flat
 * image strip (cheap) instead of real geometry. The strip is a **ring**: an ordered
 * list of N background *plates* that you can scroll/drag around forever and come
 * back to the start.
 *
 * The crucial piece is the **seam**: between every two adjacent plates sits a
 * transition image whose left edge continues plate A and whose right edge continues
 * plate B, so A→B reads as one continuous world rather than a hard cut. A ring of N
 * plates therefore has N seams (including the wrap seam from the last plate back to
 * the first). The renderer assembles `[A, seamAB, B, seamBC, …, lastPlate,
 * seamLastFirst]` automatically for any N — this is a pipeline, not a fixed 3-up.
 *
 * Everything here is plain serializable data, so a ring could live in a JSON
 * manifest the 3D site loads at runtime.
 */

/** How an image is sized inside its window. `cover` fills both axes (may crop). */
export type FitMode = "cover" | "height";

/** Optional darkening/vignette overlay painted across the whole strip. */
export interface OverlayGradient {
  /** Any valid CSS `background` value. */
  css: string;
  /** 0..1 opacity. */
  opacity: number;
}

/** Shared visual tuning for a single window of the strip. */
interface SegmentVisuals {
  /** How the image fills its window. Defaults to `cover`. */
  fitMode?: FitMode;
  /** Aesthetic zoom (>= 1). 1 = exact cover. Clipped per-window, no seam bleed. */
  baseScale?: number;
  /** Vertical framing offset as a fraction of viewport height (-0.5..0.5). */
  verticalOffset?: number;
}

/** One background plate — a "scene" in the ring (N of these). */
export interface PanoPlate extends SegmentVisuals {
  /** Stable identifier, referenced by seams and shown in debug. */
  id: string;
  /** Human-readable name. */
  label: string;
  /** Path to the wide plate image (served from /public). */
  imageUrl: string;
  /** Free-form notes. */
  notes?: string;
}

/** A transition image stitched between two adjacent plates. */
export interface PanoSeam extends SegmentVisuals {
  /** Plate id this seam's LEFT edge continues. */
  fromId: string;
  /** Plate id this seam's RIGHT edge continues. */
  toId: string;
  /** Path to the seam image (served from /public). */
  imageUrl: string;
  /** Free-form notes. */
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
  /** Optional vignette across the whole strip for consistent mood/readability. */
  overlayGradient?: OverlayGradient;
  notes?: string;
}

/**
 * A flattened, render-ready window of the ring (either a plate or a seam), with all
 * visual defaults resolved. Produced by `buildRingSegments`.
 */
export interface RingSegment {
  key: string;
  kind: "plate" | "seam";
  /** Debug label, e.g. "dawn-valley" or "dawn-valley → dusk-ridge". */
  label: string;
  imageUrl: string;
  fitMode: FitMode;
  baseScale: number;
  verticalOffset: number;
}
