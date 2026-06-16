import type { PanoRingConfig } from "../pano/panoTypes";
import { buildRingSegments, seamCoverage } from "../pano/panoRing";

interface DebugPanelProps {
  ring: PanoRingConfig;
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
 * Instrument readout for the pano ring. It does NOT drive the motion — the ring
 * auto-scrolls and is drag-scrubbable on its own — it reports the ring structure
 * (plates, seams, assembled track) and offers a seam-inspection toggle.
 */
export function DebugPanel({ ring, showSeams, onToggleSeams, reducedMotion }: DebugPanelProps) {
  const segments = buildRingSegments(ring);
  const coverage = seamCoverage(ring);
  const plateIds = ring.plates.map((p) => p.id);
  // The assembled ring order, e.g. dawn ▸ ⇄ ▸ dusk ▸ ⇄ ▸ moon ▸ ⇄(wrap)
  const ringOrder = segments.map((s) => (s.kind === "seam" ? "⇄" : s.label)).join(" · ");

  return (
    <aside className="debug-panel">
      <div className="debug-title">pano-loop-lab · {ring.label}</div>

      <div className="debug-readout">
        <Row label="plates (N)" value={String(ring.plates.length)} />
        <Row label="seams" value={`${coverage.present} / ${coverage.total}`} />
        <Row label="segments" value={`${segments.length} (×2 rendered)`} />
        <Row label="plate order" value={plateIds.join(" → ")} />
        <Row label="ring" value={ringOrder} />
        <Row label="lap" value={`${ring.loopDurationSeconds}s`} />
        <Row label="direction" value={ring.direction ?? "left"} />
        <Row label="motion" value={reducedMotion ? "reduced (auto paused)" : "auto + drag"} />
      </div>

      <label className="debug-toggle">
        <input
          type="checkbox"
          checked={showSeams}
          onChange={(e) => onToggleSeams(e.target.checked)}
        />
        <span>show segment seams</span>
      </label>

      <p className="debug-notes">Drag the background left/right to scrub the ring.</p>
      {ring.notes && <p className="debug-notes">{ring.notes}</p>}
    </aside>
  );
}
