import { useMemo, useState } from "react";
import { ADAPTER_WORKBENCH_PAIRS } from "../pano/adapterWorkbench";
import type { AdapterWorkbenchPair } from "../pano/adapterWorkbench";

type PreviewMode = "canvas" | "mask" | "anchors";
type PrepVariantId = "gradient" | "white" | "black";

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
  const [previewMode, setPreviewMode] = useState<PreviewMode>("canvas");
  const [prepVariantId, setPrepVariantId] = useState<PrepVariantId>("gradient");
  const [activeCandidateByPair, setActiveCandidateByPair] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(
      ADAPTER_WORKBENCH_PAIRS.map((item) => [`${item.fromId}__${item.toId}`, item.activeCandidateId]),
    ),
  );
  const pair = ADAPTER_WORKBENCH_PAIRS[pairIndex];
  const pairKey = `${pair.fromId}__${pair.toId}`;
  const selectedPrepVariant =
    pair.prepVariants.find((variant) => variant.id === prepVariantId) ?? pair.prepVariants[0];
  const ratioSlug = pair.geometry.ratio.replace(/:/g, "-");
  const activeCandidateId = activeCandidateByPair[pairKey] ?? null;
  const activeCandidate = useMemo(
    () => pair.candidates.find((candidate) => candidate.id === activeCandidateId) ?? null,
    [pair, activeCandidateId],
  );

  return (
    <section className="adapter-workbench" aria-label="Adapter workbench">
      <header className="workbench-header">
        <div>
          <p className="workbench-kicker">Adapter workbench</p>
          <h1>AXB prep dashboard</h1>
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
            <span>Active adapter</span>
            <strong>{activeCandidate ? activeCandidate.label : "none yet"}</strong>
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
                className={previewMode === "canvas" ? "is-active" : ""}
                onClick={() => setPreviewMode("canvas")}
              >
                Canvas
              </button>
              <button
                type="button"
                className={previewMode === "mask" ? "is-active" : ""}
                onClick={() => setPreviewMode("mask")}
              >
                Mask
              </button>
              <button
                type="button"
                className={previewMode === "anchors" ? "is-active" : ""}
                onClick={() => setPreviewMode("anchors")}
              >
                Anchors
              </button>
            </div>
          </div>

          <div className="prefill-tabs" aria-label="Canvas prefill">
            {pair.prepVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={variant.id === selectedPrepVariant.id ? "is-active" : ""}
                onClick={() => {
                  setPreviewMode("canvas");
                  setPrepVariantId(variant.id);
                }}
              >
                {variant.label}
              </button>
            ))}
          </div>

          <div className="workbench-grid">
            <section className="preview-panel" aria-label="Prep preview">
              {previewMode === "canvas" && (
                <img src={selectedPrepVariant.workCanvasUrl} alt={`${pair.label} ${selectedPrepVariant.label} AXB work canvas`} />
              )}
              {previewMode === "mask" && <img src={pair.maskUrl} alt={`${pair.label} adapter mask`} />}
              {previewMode === "anchors" && (
                <div className="anchor-preview">
                  <img src={pair.fromAnchorUrl} alt={`${pair.fromId} right anchor`} />
                  <img src={pair.toAnchorUrl} alt={`${pair.toId} left anchor`} />
                </div>
              )}
            </section>

            <aside className="details-panel">
              <div className="details-block">
                <div className="sidebar-heading">Geometry</div>
                <div className="stat-grid">
                  <Stat label="Canvas" value={`${pair.geometry.width} x ${pair.geometry.height}`} />
                  <Stat label="Ratio" value={pair.geometry.ratio} />
                  <Stat label="Anchor" value={`${pair.geometry.anchorWidth}px`} />
                  <Stat label="X region" value={`${pair.geometry.xRegionWidth}px`} />
                  <Stat label="Overlap" value={`${pair.geometry.overlapWidth}px`} />
                  <Stat label="Overmask" value={`${pair.geometry.overmaskPx}px`} />
                </div>
              </div>

              <div className="details-block">
                <div className="sidebar-heading">Files</div>
                <div className="file-links">
                  <a
                    href={selectedPrepVariant.workCanvasUrl}
                    download={`${pair.fromId}__${pair.toId}__${ratioSlug}__${selectedPrepVariant.id}.png`}
                  >
                    download canvas
                  </a>
                  <a href={pair.maskUrl} download={`${pair.fromId}__${pair.toId}__${ratioSlug}__mask.png`}>
                    download mask
                  </a>
                  <a href={pair.manifestUrl} target="_blank" rel="noreferrer">
                    manifest
                  </a>
                  <a href={pair.promptUrl} target="_blank" rel="noreferrer">
                    prompt
                  </a>
                </div>
              </div>

              <div className="details-block">
                <div className="sidebar-heading">Candidates</div>
                {pair.candidates.length === 0 ? (
                  <div className="empty-candidates">
                    <strong>0 generated</strong>
                    <span>Candidate slots are ready; no AI-filled X outputs have been added.</span>
                  </div>
                ) : (
                  <div className="candidate-list">
                    {pair.candidates.map((candidate) => (
                      <article
                        key={candidate.id}
                        className={`candidate-card${candidate.id === activeCandidateId ? " is-active" : ""}`}
                      >
                        <img src={candidate.imageUrl} alt={candidate.label} />
                        <div>
                          <div className="candidate-title-row">
                            <strong>{candidate.label}</strong>
                            <span>{candidate.status}</span>
                          </div>
                          {candidate.reviewSummary && (
                            <div className="candidate-review-summary" aria-label={`${candidate.label} review summary`}>
                              <span>
                                L diff:{" "}
                                <strong>
                                  {candidate.reviewSummary.leftOuterAnchorMaxDiff ?? "n/a"}
                                </strong>
                              </span>
                              <span>
                                R diff:{" "}
                                <strong>
                                  {candidate.reviewSummary.rightOuterAnchorMaxDiff ?? "n/a"}
                                </strong>
                              </span>
                              <span>{candidate.reviewSummary.internalJoinVerdict}</span>
                            </div>
                          )}
                          <p>{candidate.notes}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCandidateByPair((prev) => ({
                                ...prev,
                                [pairKey]: candidate.id,
                              }))
                            }
                          >
                            {candidate.id === activeCandidateId ? "Active for review" : "Use for review"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </section>
  );
}
