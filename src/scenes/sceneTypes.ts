/**
 * The data model that drives the panorama lab.
 *
 * A "scene" is just a plain data object. The whole point of this lab is to prove
 * that a far background can be expressed as data + one wide image, so this type
 * intentionally stays small and serializable — no functions, no class instances,
 * nothing that couldn't live in a JSON manifest later.
 */

/**
 * How the wide image is sized against the viewport.
 * - `cover`   : scale so the image always fills the viewport (may crop edges).
 * - `cover-x` : scale so the image width drives the fit (good for very wide panos).
 * - `height`  : scale so the image height fills the viewport (lets width overflow for drift).
 */
export type FitMode = "cover" | "cover-x" | "height";

/** Optional darkening/vignette overlay painted on top of the image. */
export interface OverlayGradient {
  /** Any valid CSS `background` value (e.g. a linear-gradient or radial-gradient). */
  css: string;
  /** 0..1 opacity of the overlay layer. */
  opacity: number;
}

export interface SceneManifest {
  /** Stable identifier, used as the React key and in the debug panel. */
  id: string;
  /** Human-readable name shown in the scene selector. */
  label: string;
  /** Path to the wide panoramic image (served from /public). */
  imageUrl: string;

  /**
   * Extra zoom applied on top of the fit mode. 1 = no extra zoom.
   * Values > 1 give the drift more room before an edge could be revealed.
   */
  baseScale: number;
  /** How the image is fit to the viewport. */
  fitMode: FitMode;

  /**
   * Horizontal drift amplitude as a fraction of viewport width (0..~0.2).
   * The image gently oscillates +/- this much. Kept small so edges never show.
   */
  driftRangeX: number;
  /** Seconds for one full drift cycle (there-and-back). Larger = slower. */
  driftDuration: number;
  /**
   * Vertical framing offset as a fraction of viewport height (-0.5..0.5).
   * Negative nudges the image up (show more sky), positive nudges it down.
   */
  verticalOffset: number;

  /** Optional overlay tint for mood / readability of future foreground UI. */
  overlayGradient?: OverlayGradient;
  /** Free-form notes for whoever reads the manifest next. */
  notes?: string;
}
