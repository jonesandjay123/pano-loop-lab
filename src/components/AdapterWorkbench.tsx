import { useState } from "react";
import { ADAPTER_WORKBENCH_PAIRS } from "../pano/adapterWorkbench";
import type { AdapterWorkbenchPair } from "../pano/adapterWorkbench";

type PreviewMode = "work" | "runtime";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="workbench-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PairButton({
  pair,
  active,
  onClick,
}: {
  pair: AdapterWorkbenchPair;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`pair-button${active ? " is-active" : ""}`} type="button" onClick={onClick}>
      <span>{pair.fromId}</span>
      <strong>{pair.toId}</strong>
    </button>
  );
}

export function AdapterWorkbench() {
  const [pairIndex, setPairIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("runtime");
  const pair = ADAPTER_WORKBENCH_PAIRS[pairIndex];
  const previewUrl = previewMode === "work" ? pair.workCanvasUrl : pair.activeRuntimeUrl;
  const pairKey = `${pair.fromId}__${pair.toId}`;

  return (
    <section className="adapter-workbench" aria-label="Adapter workbench">
      <header className="workbench-header">
        <div>
          <p className="workbench-kicker">Clean AXB dashboard</p>
          <h1>AXB / BXC / CXA work canvases</h1>
        </div>
        <a className="workbench-link" href="#seam-lab">
          Seam lab
        </a>
      </header>

      <div className="workbench-shell">
        <aside className="workbench-sidebar" aria-label="Adjacent pairs">
          <div className="sidebar-heading">Pairs</div>
          <div className="pair-list">
            {ADAPTER_WORKBENCH_PAIRS.map((item, index) => (
              <PairButton
                key={`${item.fromId}-${item.toId}`}
                pair={item}
                active={index === pairIndex}
                onClick={() => setPairIndex(index)}
              />
            ))}
          </div>

          <div className="workbench-status">
            <span>Runtime state</span>
            <strong>{pair.status === "filled" ? "filled" : "placeholder"}</strong>
          </div>
        </aside>

        <main className="workbench-main">
          <div className="workbench-title-row">
            <div>
              <p className="workbench-kicker">Current pair</p>
              <h2>{pair.label}</h2>
            </div>
            <div className="mode-tabs" aria-label="Preview mode">
              <button
                type="button"
                className={previewMode === "runtime" ? "is-active" : ""}
                onClick={() => setPreviewMode("runtime")}
              >
                Runtime
              </button>
              <button
                type="button"
                className={previewMode === "work" ? "is-active" : ""}
                onClick={() => setPreviewMode("work")}
              >
                Work canvas
              </button>
            </div>
          </div>

          <div className="workbench-grid">
            <section className="preview-panel" aria-label="Adapter preview">
              <img src={previewUrl} alt={`${pair.label} ${previewMode} image`} />
            </section>

            <aside className="details-panel">
              <div className="details-block">
                <div className="sidebar-heading">Geometry</div>
                <div className="stat-grid">
                  <Stat label="Canvas" value={`${pair.geometry.width} x ${pair.geometry.height}`} />
                  <Stat label="Ratio" value={pair.geometry.ratio} />
                  <Stat label="Anchor" value={`${pair.geometry.anchorWidth}px each`} />
                  <Stat label="X region" value={`${pair.geometry.xRegionWidth}px`} />
                </div>
              </div>

              <div className="details-block">
                <div className="sidebar-heading">Files</div>
                <div className="file-links">
                  <a href={pair.workCanvasUrl} download={`${pairKey}-work-canvas.png`}>
                    download work canvas
                  </a>
                  <a href={pair.activeRuntimeUrl} download={`${pairKey}-runtime.png`}>
                    download runtime image
                  </a>
                </div>
              </div>

              <div className="details-block">
                <div className="sidebar-heading">Runtime contract</div>
                <div className="empty-candidates">
                  <strong>{pair.status === "filled" ? "ready" : "intentionally unfinished"}</strong>
                  <span>
                    Full AXB image with 523px anchor overlap. Unfilled placeholders should look wrong in
                    the loop until their X region is manually completed.
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </section>
  );
}
