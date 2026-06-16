import type { PanoLoopConfig } from "../pano/panoTypes";

interface DebugPanelProps {
  loop: PanoLoopConfig;
  showSeams: boolean;
  onToggleSeams: (next: boolean) => void;
  reducedMotion: boolean;
}

/** A tiny labelled key/value row used in the readout. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="debug-row">
      <span className="debug-key">{label}</span>
      <span className="debug-val">{value}</span>
    </div>
  );
}

/**
 * Instrument readout for the pano loop. It does NOT drive the main behaviour — the
 * strip auto-loops on its own — it just reports the loop configuration and offers
 * a seam-inspection toggle.
 */
export function DebugPanel({ loop, showSeams, onToggleSeams, reducedMotion }: DebugPanelProps) {
  const ids = loop.segments.map((s) => s.id);
  const ordered = ids.join(" → ");
  // The actual rendered track: the sequence duplicated once.
  const virtualTrack = `[${[...ids, ...ids].join(", ")}]`;

  return (
    <aside className="debug-panel">
      <div className="debug-title">pano-loop-lab · {loop.label}</div>

      <div className="debug-readout">
        <Row label="segments" value={String(loop.segments.length)} />
        <Row label="order" value={ordered} />
        <Row label="loop dur" value={`${loop.loopDurationSeconds}s / full sequence`} />
        <Row label="direction" value={loop.direction ?? "left"} />
        <Row label="track" value={virtualTrack} />
        <Row label="motion" value={reducedMotion ? "reduced (loop paused)" : "auto-scrolling"} />
      </div>

      <label className="debug-toggle">
        <input
          type="checkbox"
          checked={showSeams}
          onChange={(e) => onToggleSeams(e.target.checked)}
        />
        <span>show segment seams</span>
      </label>

      {loop.notes && <p className="debug-notes">{loop.notes}</p>}
    </aside>
  );
}
