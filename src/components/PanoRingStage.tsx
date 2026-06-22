import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { FitMode, PanoRingConfig, RingBoundary, RingSegment } from "../pano/panoTypes";
import { buildBoundaries, buildRingSegments } from "../pano/panoRing";
import { usePanoRingScroll } from "../pano/usePanoRingScroll";

/** Seam-lab UI state, owned by App and shared with the debug panel. */
export interface SeamLabState {
  /** Overlap + feather width in vw. 0 = raw butt-join (reveals the real seam). */
  blendVw: number;
  /** Draw the contact line + label at each boundary. */
  labels: boolean;
  /** Pause auto-scroll. */
  paused: boolean;
  /** Boundary index to center & hold, or null for the whole loop. */
  inspectIndex: number | null;
}

interface PanoRingStageProps {
  ring: PanoRingConfig;
  lab: SeamLabState;
  /** Pause from reduced-motion (folded into the hook alongside lab.paused). */
  reducedMotion: boolean;
}

function backgroundSizeFor(fit: FitMode): string {
  if (fit === "height") return "auto 100%";
  if (fit === "width") return "100% auto";
  return "cover";
}

const RUNTIME_GEOMETRY_HEIGHT = 1536;

function heightScaledPx(px: number): string {
  return `calc(100dvh * ${px / RUNTIME_GEOMETRY_HEIGHT})`;
}

function Segment({
  segment,
  boundary,
  blendVw,
  labels,
  inspected,
}: {
  segment: RingSegment;
  boundary: RingBoundary;
  blendVw: number;
  labels: boolean;
  inspected: boolean;
}) {
  const feather = blendVw > 0;
  const mask = feather
    ? `linear-gradient(to right, transparent 0, #000 ${blendVw}vw, #000 calc(100% - ${blendVw}vw), transparent 100%)`
    : "none";

  const segStyle: CSSProperties = {
    flex: segment.aspectRatio
      ? `0 0 calc(100dvh * ${segment.aspectRatio})`
      : `0 0 ${segment.widthVw}vw`,
    marginLeft:
      segment.overlapStartPx > 0
        ? feather
          ? `calc(-1 * ${heightScaledPx(segment.overlapStartPx)} - ${blendVw}vw)`
          : `calc(-1 * ${heightScaledPx(segment.overlapStartPx)})`
        : feather
          ? `-${blendVw}vw`
          : 0,
  };

  // Mask only the image layer (not the whole segment) so the overlap cross-fades
  // while debug lines/labels stay fully visible.
  const imageStyle: CSSProperties = {
    inset: segment.edgeLocked ? 0 : "-6%",
    backgroundImage: `url("${segment.imageUrl}")`,
    backgroundSize: backgroundSizeFor(segment.fitMode),
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    transform: `translate(${segment.xOffset * 100}%, ${segment.yOffset * 100}%) scale(${segment.scale})`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };

  const isSeam = segment.kind === "seam";

  return (
    <div className={`pano-segment${isSeam ? " is-seam" : ""}`} style={segStyle} aria-hidden="true">
      <div className="pano-segment-image" style={imageStyle} />
      {labels && (
        <>
          {/* The line sits on this segment's LEFT edge = the boundary into it. */}
          <span className={`pano-seam-line${inspected ? " is-inspected" : ""}`} />
          <span className={`pano-seam-label${isSeam ? " is-seam" : ""}${inspected ? " is-inspected" : ""}`}>
            {boundary.label}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Continuous panorama RING / seam lab.
 *
 * `buildRingSegments` flattens the config into `[plate, seam, plate, seam, …]`
 * (wrapping last→first); that sequence is rendered twice for a seamless modulo
 * wrap. Clean mode keeps `blendVw === 0`, so unfinished adapters stay visible
 * and the runtime does not hide seams with a CSS feather.
 * Per-segment `fitMode` / `scale` / `xOffset` / `yOffset` are the alignment knobs.
 *
 * No Three.js / canvas / GSAP — the far layer is a plain CSS image strip.
 */
export function PanoRingStage({ ring, lab, reducedMotion }: PanoRingStageProps) {
  const segments = useMemo(() => buildRingSegments(ring), [ring]);
  const boundaries = useMemo(() => buildBoundaries(segments), [segments]);
  const rendered = useMemo(() => [...segments, ...segments], [segments]);
  const seqLen = segments.length;

  const { trackRef, onPointerDown, dragging } = usePanoRingScroll<HTMLDivElement>({
    loopDurationSeconds: ring.loopDurationSeconds,
    direction: ring.direction,
    paused: lab.paused || reducedMotion || lab.inspectIndex != null,
    inspectIndex: lab.inspectIndex,
    layoutKey: lab.blendVw,
  });

  return (
    <div
      className={`pano-ring-stage${dragging ? " is-dragging" : ""}`}
      onPointerDown={onPointerDown}
    >
      <div className="pano-ring-track" ref={trackRef}>
        {rendered.map((segment, j) => {
          // This segment's left edge is the boundary between seg j-1 and j.
          const boundaryIndex = ((j - 1) % seqLen + seqLen) % seqLen;
          return (
            <Segment
              key={`${segment.key}-${j}`}
              segment={segment}
              boundary={boundaries[boundaryIndex]}
              blendVw={lab.blendVw}
              labels={lab.labels}
              inspected={lab.inspectIndex === boundaryIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
