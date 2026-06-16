import type { SceneManifest } from "../scenes/sceneTypes";
import { SCENES } from "../scenes/sceneManifests";

interface DebugPanelProps {
  scene: SceneManifest;
  onSelect: (id: string) => void;
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
 * Floating panel that exposes the live scene state. This is the lab's instrument
 * cluster — it lets us eyeball whether the manifest values map to what we see.
 */
export function DebugPanel({ scene, onSelect, reducedMotion }: DebugPanelProps) {
  return (
    <aside className="debug-panel">
      <div className="debug-title">pano-loop-lab</div>

      <label className="debug-field">
        <span className="debug-key">scene</span>
        <select value={scene.id} onChange={(e) => onSelect(e.target.value)}>
          {SCENES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <div className="debug-readout">
        <Row label="id" value={scene.id} />
        <Row label="image" value={scene.imageUrl} />
        <Row label="fit" value={scene.fitMode} />
        <Row label="scale" value={scene.baseScale.toFixed(2)} />
        <Row label="driftX" value={`${(scene.driftRangeX * 100).toFixed(0)}vw`} />
        <Row label="driftDur" value={`${scene.driftDuration}s`} />
        <Row label="vOffset" value={`${(scene.verticalOffset * 100).toFixed(0)}%`} />
        <Row label="motion" value={reducedMotion ? "reduced (drift off)" : "on"} />
      </div>

      {scene.notes && <p className="debug-notes">{scene.notes}</p>}
    </aside>
  );
}
