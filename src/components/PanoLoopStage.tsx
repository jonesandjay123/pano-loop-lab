import type { CSSProperties } from "react";
import type { PanoLoopConfig, PanoSegment } from "../pano/panoTypes";
import { useReducedMotion } from "../useReducedMotion";

interface PanoLoopStageProps {
  loop: PanoLoopConfig;
  /** Draw a thin line + id label at each segment boundary (debug inspection). */
  showSeams?: boolean;
}

/**
 * One panel of the strip — a single image shown in a 100vw window.
 *
 * Each segment owns an `overflow: hidden` window and an inner image layer, so the
 * `baseScale` zoom / vertical framing can never bleed across a seam into a
 * neighbour. `cover` fills the window on both axes, so no empty edge ever shows,
 * in any viewport orientation.
 */
function Segment({
  segment,
  index,
  showSeams,
}: {
  segment: PanoSegment;
  index: number;
  showSeams?: boolean;
}) {
  const imageStyle: CSSProperties = {
    backgroundImage: `url("${segment.imageUrl}")`,
    backgroundSize: segment.fitMode === "height" ? "auto 100%" : "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    transform: `translateY(${segment.verticalOffset * 100}vh) scale(${segment.baseScale})`,
  };

  return (
    <div className="pano-segment" aria-hidden="true">
      <div className="pano-segment-image" style={imageStyle} />
      {segment.overlayGradient && (
        <div
          className="pano-segment-overlay"
          style={{ background: segment.overlayGradient.css, opacity: segment.overlayGradient.opacity }}
        />
      )}
      {showSeams && (
        <>
          <span className="pano-seam-line" />
          <span className="pano-seam-label">
            {index}. {segment.id}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Continuous horizontal pano loop.
 *
 * The reel is the segment sequence rendered **twice** back-to-back —
 * `[A, B, C, A, B, C]` — inside a flex track. The track animates from
 * `translateX(0)` to `translateX(-50%)` linearly and forever: -50% of the track's
 * own width is exactly one full sequence, and because the second half is identical
 * to the first, the wrap point is pixel-identical — no visible jump.
 *
 * No Three.js / canvas / GSAP — proving a moving far world can be a plain CSS strip
 * is the entire point of the lab.
 */
export function PanoLoopStage({ loop, showSeams }: PanoLoopStageProps) {
  const reducedMotion = useReducedMotion();
  const sequence = loop.segments;
  // Duplicate the sequence once so translateX(-50%) wraps seamlessly.
  const duplicated = [...sequence, ...sequence];

  const trackStyle: CSSProperties = {
    ["--loop-duration" as string]: `${loop.loopDurationSeconds}s`,
    animation: reducedMotion ? "none" : "pano-loop var(--loop-duration) linear infinite",
    animationDirection: loop.direction === "right" ? "reverse" : "normal",
  };

  return (
    <div className="pano-loop-stage">
      <div className="pano-loop-track" style={trackStyle}>
        {duplicated.map((segment, i) => (
          <Segment
            // Index in the duplicated array keeps keys unique across the two halves.
            key={`${segment.id}-${i}`}
            segment={segment}
            index={i % sequence.length}
            showSeams={showSeams}
          />
        ))}
      </div>
      {loop.overlayGradient && (
        <div
          className="pano-loop-overlay"
          style={{ background: loop.overlayGradient.css, opacity: loop.overlayGradient.opacity }}
        />
      )}
    </div>
  );
}
