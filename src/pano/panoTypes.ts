/**
 * Data model for the panorama loop.
 *
 * The lab no longer thinks in "scenes you switch between". It thinks in an ordered
 * **pano strip**: a sequence of pano *segments* laid side-by-side into one long
 * horizontal track that scrolls forever. The question this model exists to answer
 * is whether several panorama plates can read as one continuous moving far world.
 *
 * Everything here is plain, serializable data — no functions, no class instances —
 * so a segment/loop could live in a JSON manifest later.
 */

/**
 * How a segment's image is sized inside its 100vw window.
 * - `cover`  : fill the window on both axes (may crop). The default.
 * - `height` : height fills, width may overflow (rarely needed for a strip).
 */
export type FitMode = "cover" | "height";

/** Optional darkening/vignette overlay painted on top of the image(s). */
export interface OverlayGradient {
  /** Any valid CSS `background` value (e.g. a linear-gradient or radial-gradient). */
  css: string;
  /** 0..1 opacity of the overlay layer. */
  opacity: number;
}

/** One panel of the strip: a single wide image shown in a 100vw window. */
export interface PanoSegment {
  /** Stable identifier, used as the React key and in the debug readout. */
  id: string;
  /** Human-readable name shown in debug labels. */
  label: string;
  /** Path to the wide panoramic image (served from /public). */
  imageUrl: string;

  /** How the image fills its window. */
  fitMode: FitMode;
  /** Aesthetic zoom (>= 1). 1 = exact cover. Contained per-segment, no seam bleed. */
  baseScale: number;
  /**
   * Vertical framing offset as a fraction of viewport height (-0.5..0.5).
   * Negative nudges the image up (more sky), positive nudges it down.
   */
  verticalOffset: number;

  /** Optional per-segment overlay tint (usually left off so the strip reads as one world). */
  overlayGradient?: OverlayGradient;
  /** Free-form notes for whoever reads the manifest next. */
  notes?: string;
}

/** The whole reel: an ordered list of segments + how they loop. */
export interface PanoLoopConfig {
  /** Stable identifier for this loop. */
  id: string;
  /** Human-readable name. */
  label: string;
  /** Segments in render order. The strip is this sequence, duplicated once. */
  segments: PanoSegment[];
  /** Seconds for one full sequence to scroll past (i.e. for the loop to repeat). */
  loopDurationSeconds: number;
  /** Travel direction of the world. Defaults to "left". */
  direction?: "left" | "right";
  /** Optional vignette painted across the whole strip for consistent mood/readability. */
  overlayGradient?: OverlayGradient;
  /** Free-form notes. */
  notes?: string;
}
