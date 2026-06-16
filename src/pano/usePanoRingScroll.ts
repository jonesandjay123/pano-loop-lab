import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface Options {
  /** Seconds for one full lap of the ring at auto-scroll speed. */
  loopDurationSeconds: number;
  /** Auto-scroll direction. Defaults to "left". */
  direction?: "left" | "right";
  /** When true, auto-scroll is paused (drag still works). */
  reducedMotion: boolean;
}

interface Result<T extends HTMLElement> {
  /** Attach to the moving track element. */
  trackRef: RefObject<T>;
  /** Attach to the stage element to start a drag. */
  onPointerDown: (e: React.PointerEvent) => void;
  /** True while the user is dragging (for cursor styling). */
  dragging: boolean;
}

/**
 * Drives an infinite horizontal ring as a single `translateX` on the track,
 * imperatively (no React re-render per frame).
 *
 * The track renders the segment sequence twice; this hook keeps an `offset` in
 * `[0, sequenceWidth)` via modulo, so the motion wraps forever in both directions.
 * Auto-scroll advances the offset every frame; a pointer drag overrides it and
 * scrubs the offset directly. The two share the same wrapped offset, so releasing a
 * drag resumes the auto-scroll exactly where you let go — no jump.
 *
 * Pure web primitives: requestAnimationFrame + Pointer Events. No GSAP, no canvas.
 */
export function usePanoRingScroll<T extends HTMLElement>({
  loopDurationSeconds,
  direction = "left",
  reducedMotion,
}: Options): Result<T> {
  const trackRef = useRef<T>(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  // Keep latest motion params in refs so the rAF loop never needs re-binding.
  const paramsRef = useRef({ loopDurationSeconds, direction, reducedMotion });
  paramsRef.current = { loopDurationSeconds, direction, reducedMotion };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last: number | null = null;

    const frame = (t: number) => {
      const dt = last == null ? 0 : (t - last) / 1000;
      last = t;

      // Sequence width = half the track (it's rendered twice). Read live so the
      // ring stays correct across viewport resizes.
      const seqWidth = track.scrollWidth / 2 || window.innerWidth;
      const { loopDurationSeconds: dur, direction: dir, reducedMotion: rm } =
        paramsRef.current;

      if (!rm && !draggingRef.current && dur > 0) {
        const sign = dir === "right" ? -1 : 1;
        offsetRef.current += (seqWidth / dur) * dt * sign;
      }

      // Wrap into [0, seqWidth) so the loop is endless both ways.
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    setDragging(true);
    const startX = e.clientX;
    const startOffset = offsetRef.current;

    const onMove = (ev: PointerEvent) => {
      // Drag right -> reveal content on the left -> offset decreases.
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
