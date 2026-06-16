import type { CSSProperties } from "react";
import type { FitMode, SceneManifest } from "../scenes/sceneTypes";
import { useReducedMotion } from "../useReducedMotion";

interface PanoStageProps {
  scene: SceneManifest;
}

/** Extra vertical overscan (vh) beyond the vertical framing offset, for safety. */
const VERTICAL_SAFETY_VH = 6;
/** Extra horizontal overscan (vw) beyond the drift amplitude, for safety. */
const HORIZONTAL_SAFETY_VW = 6;

/**
 * Map a fit mode to a CSS `background-size`.
 *
 * `cover` is the workhorse: it fills the (overscanned) box on *both* axes, so the
 * background is never empty regardless of viewport aspect — the failure the SVG
 * placeholders hid and a portrait phone immediately exposes. `height` is kept for
 * the rare case where you deliberately want width to overflow instead.
 */
function backgroundSizeFor(fitMode: FitMode): string {
  return fitMode === "height" ? "auto 100%" : "cover";
}

/**
 * Full-viewport panoramic background.
 *
 * Layers, back to front:
 *   1. solid fallback color (avoids a white flash before the image paints)
 *   2. the wide image, drifting slowly left/right via a CSS keyframe transform
 *   3. an optional overlay gradient for mood / future foreground readability
 *
 * Edge safety: the image element is *overscanned* — pulled out past every viewport
 * edge by the drift amplitude (+ a margin) horizontally and a fixed margin
 * vertically — and painted with `background-size: cover`. Because the drift is a
 * fixed-length `translateX` that stays inside that horizontal overscan, no empty
 * edge can ever scroll into view, in any orientation. `baseScale` (>= 1) is an
 * aesthetic zoom applied as a transform; it only ever adds coverage.
 *
 * Nothing here imports Three.js / R3F / canvas — proving the far background can be
 * a plain data-driven image layer is the entire point of the lab.
 */
export function PanoStage({ scene }: PanoStageProps) {
  const reducedMotion = useReducedMotion();

  // Drift amplitude as a fraction of viewport width -> vw.
  const driftVw = scene.driftRangeX * 100;
  // Vertical framing nudge as a fraction of viewport height -> vh.
  const offsetVh = scene.verticalOffset * 100;

  // Overscan must always exceed the shift it has to absorb, or an edge shows.
  const overscanX = driftVw + HORIZONTAL_SAFETY_VW;
  const overscanY = Math.abs(offsetVh) + VERTICAL_SAFETY_VH;

  const imageStyle: CSSProperties = {
    backgroundImage: `url("${scene.imageUrl}")`,
    backgroundSize: backgroundSizeFor(scene.fitMode),
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    // CSS custom properties consumed by styles.css (.pano-image + @keyframes).
    ["--overscan-x" as string]: `${overscanX}vw`,
    ["--overscan-y" as string]: `${overscanY}vh`,
    ["--base-scale" as string]: `${scene.baseScale}`,
    ["--offset-y" as string]: `${offsetVh}vh`,
    ["--drift-vw" as string]: `${driftVw}vw`,
    ["--drift-duration" as string]: `${scene.driftDuration}s`,
    // translateX is the outermost (fixed-length) transform, so drift is an exact
    // screen-space shift independent of the scale zoom that follows it.
    transform: `translate(0, var(--offset-y)) scale(var(--base-scale))`,
    animation: reducedMotion ? "none" : "pano-drift var(--drift-duration) ease-in-out infinite",
  };

  return (
    <div className="pano-stage" aria-hidden="true">
      <div className="pano-fallback" />
      {/* `key` forces a fresh element per scene so the drift animation restarts cleanly. */}
      <div key={scene.id} className="pano-image" style={imageStyle} />
      {scene.overlayGradient && (
        <div
          className="pano-overlay"
          style={{
            background: scene.overlayGradient.css,
            opacity: scene.overlayGradient.opacity,
          }}
        />
      )}
    </div>
  );
}
