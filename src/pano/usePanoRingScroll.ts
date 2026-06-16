import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface Options {
  /** Seconds for one full lap of the ring at auto-scroll speed. */
  loopDurationSeconds: number;
  /** Auto-scroll direction. Defaults to "left". */
  direction?: "left" | "right";
  /** When true, auto-scroll is paused (drag still works). */
  paused: boolean;
  /**
   * Boundary index to center & hold, or null for free running. When set, the loop
   * jumps so that boundary sits at viewport center.
   */
  inspectIndex: number | null;
  /** Bump this when layout (overlap/widths) changes so inspect re-measures. */
  layoutKey: number;
}

interface Result<T extends HTMLElement> {
  trackRef: RefObject<T>;
  onPointerDown: (e: React.PointerEvent) => void;
  dragging: boolean;
}

/**
 * Drives an infinite horizontal ring as a single `translate3d` on the track,
 * imperatively (no React re-render per frame).
 *
 * The track renders the sequence twice; `offset` is kept in `[0, sequenceWidth)`
 * via modulo so motion wraps forever both ways. Auto-scroll advances the offset;
 * a pointer drag scrubs it directly; `inspectIndex` snaps it to a boundary. All
 * three share the same wrapped offset, so handing off between them never jumps.
 */
export function usePanoRingScroll<T extends HTMLElement>({
  loopDurationSeconds,
  direction = "left",
  paused,
  inspectIndex,
  layoutKey,
}: Options): Result<T> {
  const trackRef = useRef<T>(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const paramsRef = useRef({ loopDurationSeconds, direction, paused });
  paramsRef.current = { loopDurationSeconds, direction, paused };

  // rAF loop: advance (unless paused/dragging), wrap, apply transform.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last: number | null = null;

    const frame = (t: number) => {
      const dt = last == null ? 0 : (t - last) / 1000;
      last = t;

      const seqWidth = track.scrollWidth / 2 || window.innerWidth;
      const { loopDurationSeconds: dur, direction: dir, paused: isPaused } = paramsRef.current;

      if (!isPaused && !draggingRef.current && dur > 0) {
        const sign = dir === "right" ? -1 : 1;
        offsetRef.current += (seqWidth / dur) * dt * sign;
      }

      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Inspect: snap the chosen boundary to viewport center. Re-runs when the target
  // boundary or the layout (overlap/widths) changes.
  useEffect(() => {
    if (inspectIndex == null) return;
    const track = trackRef.current;
    if (!track) return;

    const id = requestAnimationFrame(() => {
      // Children are the rendered segments (sequence twice). The boundary after
      // segment i is the left edge of child i+1.
      const next = track.children[inspectIndex + 1] as HTMLElement | undefined;
      if (!next) return;
      const seqWidth = track.scrollWidth / 2 || window.innerWidth;
      let o = next.offsetLeft - window.innerWidth / 2;
      o = ((o % seqWidth) + seqWidth) % seqWidth;
      offsetRef.current = o;
    });
    return () => cancelAnimationFrame(id);
  }, [inspectIndex, layoutKey]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    setDragging(true);
    const startX = e.clientX;
    const startOffset = offsetRef.current;

    const onMove = (ev: PointerEvent) => {
      offsetRef.current = startOffset - (ev.clientX - startX);
    };
    const onUp = () => {
      draggingRef.current = false;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return { trackRef, onPointerDown, dragging };
}
