import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { PanoRingConfig, RingSegment } from "../pano/panoTypes";
import { buildRingSegments } from "../pano/panoRing";
import { usePanoRingScroll } from "../pano/usePanoRingScroll";
import { useReducedMotion } from "../useReducedMotion";

interface PanoRingStageProps {
  ring: PanoRingConfig;
  /** Draw a line + label at each segment boundary, and tint seam windows. */
  showSeams?: boolean;
}

/** One window of the strip — a plate or a seam — shown in a 100vw cover frame. */
function Segment({ segment, showSeams }: { segment: RingSegment; showSeams?: boolean }) {
  const imageStyle: CSSProperties = {
    backgroundImage: `url("${segment.imageUrl}")`,
    backgroundSize: segment.fitMode === "height" ? "auto 100%" : "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    transform: `translateY(${segment.verticalOffset * 100}vh) scale(${segment.baseScale})`,
  };

  const isSeam = segment.kind === "seam";

  return (
    <div className={`pano-segment${isSeam ? " is-seam" : ""}`} aria-hidden="true">
      <div className="pano-segment-image" style={imageStyle} />
      {showSeams && (
        <>
          <span className="pano-seam-line" />
          <span className={`pano-seam-label${isSeam ? " is-seam" : ""}`}>
            {isSeam ? "⇄ " : "▣ "}
            {segment.label}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Continuous panorama RING.
 *
 * `buildRingSegments` flattens the config into `[plate, seam, plate, seam, …]`
 * (wrapping last→first). That sequence is rendered **twice** so the modulo-wrapped
 * `translateX` from `usePanoRingScroll` loops forever with no visible jump. The
 * same offset is driven by both auto-scroll and pointer drag, so the world can be
 * grabbed and scrubbed left/right at any time and the auto-scroll resumes seamlessly.
 *
 * No Three.js / canvas / GSAP — the far environment for the 3D site is a plain CSS
 * image strip, which is the whole performance argument.
 */
export function PanoRingStage({ ring, showSeams }: PanoRingStageProps) {
  const reducedMotion = useReducedMotion();
  const segments = useMemo(() => buildRingSegments(ring), [ring]);
  // Duplicate the sequence so the wrap point is pixel-identical.
  const rendered = useMemo(() => [...segments, ...segments], [segments]);

  const { trackRef, onPointerDown, dragging } = usePanoRingScroll<HTMLDivElement>({
    loopDurationSeconds: ring.loopDurationSeconds,
    direction: ring.direction,
    reducedMotion,
  });

  return (
    <div
      className={`pano-ring-stage${dragging ? " is-dragging" : ""}`}
      onPointerDown={onPointerDown}
    >
      <div className="pano-ring-track" ref={trackRef}>
        {rendered.map((segment, i) => (
          <Segment key={`${segment.key}-${i}`} segment={segment} showSeams={showSeams} />
        ))}
      </div>
      {ring.overlayGradient && (
        <div
          className="pano-ring-overlay"
          style={{ background: ring.overlayGradient.css, opacity: ring.overlayGradient.opacity }}
        />
      )}
    </div>
  );
}
