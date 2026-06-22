import type { PanoRingConfig } from "../pano/panoTypes";
import type { SeamLabState } from "./PanoRingStage";
import { buildBoundaries, buildRingSegments, seamCoverage } from "../pano/panoRing";

interface DebugPanelProps {
  ring: PanoRingConfig;
  lab: SeamLabState;
  onChange: (patch: Partial<SeamLabState>) => void;
  reducedMotion: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="debug-row">
      <span className="debug-key">{label}</span>
      <span className="debug-val">{value}</span>
    </div>
  );
}

const BLEND_OPTIONS = [0];

/**
 * Seam-lab instrument. Reports ring structure and exposes the inspection controls:
 * raw boundary mode, boundary labels, pause, and a per-boundary inspect that
 * centers & holds one seam for close study.
 */
export function DebugPanel({
  ring,
  lab,
  onChange,
  reducedMotion,
}: DebugPanelProps) {
  const segments = buildRingSegments(ring);
  const boundaries = buildBoundaries(segments);
  const coverage = seamCoverage(ring);

  const motion = reducedMotion
    ? "reduced (paused)"
    : lab.inspectIndex != null
      ? "inspecting"
      : lab.paused
        ? "paused"
        : "auto + drag";

  return (
    <aside className="debug-panel">
      <div className="debug-title">pano-loop-lab · seam lab</div>

      <div className="debug-readout">
        <Row label="plates (N)" value={String(ring.plates.length)} />
        <Row label="seams" value={`${coverage.present} / ${coverage.total}`} />
        <Row label="segments" value={`${segments.length} (×2)`} />
        <Row label="motion" value={motion} />
      </div>

      <div className="debug-controls">
        <label className="debug-field">
          <span className="debug-key">blend</span>
          <select
            value={lab.blendVw}
            onChange={(e) => onChange({ blendVw: Number(e.target.value) })}
          >
            {BLEND_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v === 0 ? "raw — 0 (real seams)" : `${v}vw overlap`}
              </option>
            ))}
          </select>
        </label>

        <label className="debug-field">
          <span className="debug-key">inspect</span>
          <select
            value={lab.inspectIndex ?? ""}
            onChange={(e) =>
              onChange({ inspectIndex: e.target.value === "" ? null : Number(e.target.value) })
            }
          >
            <option value="">— whole loop —</option>
            {boundaries.map((b) => (
              <option key={b.index} value={b.index}>
                {b.index}. {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="debug-toggle">
          <input
            type="checkbox"
            checked={lab.labels}
            onChange={(e) => onChange({ labels: e.target.checked })}
          />
          <span>boundary labels + lines</span>
        </label>

        <label className="debug-toggle">
          <input
            type="checkbox"
            checked={lab.paused}
            onChange={(e) => onChange({ paused: e.target.checked })}
            disabled={lab.inspectIndex != null}
          />
          <span>pause auto-scroll</span>
        </label>
      </div>

      <p className="debug-notes">
        Clean mode is locked to <strong>raw — 0</strong>. Unfinished AXB/BXC/CXA
        adapters should stay visibly wrong until a filled image replaces them.
      </p>
    </aside>
  );
}
