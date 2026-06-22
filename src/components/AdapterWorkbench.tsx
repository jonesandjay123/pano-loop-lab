import { useState } from "react";
import {
  WORKBENCH_GEOMETRY,
  exportScene,
  importScene,
  makePlateId,
  readImageFile,
  validateAdapterDimensions,
  validatePlateDimensions,
  validateWorkbenchStateImages,
} from "../pano/workbenchState";
import type { WorkbenchFinishedAdapter, WorkbenchPair, WorkbenchPlate, WorkbenchState } from "../pano/workbenchState";

type Notice = { tone: "ok" | "warn"; text: string } | null;

interface AdapterWorkbenchProps {
  state: WorkbenchState;
  pairs: WorkbenchPair[];
  onChange: (next: WorkbenchState) => void;
  onReset: () => void;
  generating: boolean;
  storageStatus: string;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="workbench-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function move<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function plateLabelFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export function AdapterWorkbench({
  state,
  pairs,
  onChange,
  onReset,
  generating,
  storageStatus,
}: AdapterWorkbenchProps) {
  const [selectedPairId, setSelectedPairId] = useState<string | null>(pairs[0]?.id ?? null);
  const [notice, setNotice] = useState<Notice>(null);
  const selectedPair = pairs.find((pair) => pair.id === selectedPairId) ?? pairs[0];

  const patchPlates = (plates: WorkbenchPlate[]) => {
    onChange({ ...state, plates });
  };

  const addPlate = async (file: File) => {
    const image = await readImageFile(file);
    if (!validatePlateDimensions(image.width, image.height)) {
      URL.revokeObjectURL(image.url);
      setNotice({
        tone: "warn",
        text: `拒絕上傳：${file.name} 是 ${image.width} x ${image.height}，必須是 ${WORKBENCH_GEOMETRY.plateWidth} x ${WORKBENCH_GEOMETRY.plateHeight}。`,
      });
      return;
    }

    const label = plateLabelFromFile(file);
    patchPlates([
      ...state.plates,
      {
        id: makePlateId(label),
        label,
        imageUrl: image.url,
        sourceName: file.name,
      },
    ]);
    setNotice({ tone: "ok", text: `已新增 plate：${file.name}` });
  };

  const replacePlate = async (plate: WorkbenchPlate, file: File) => {
    const image = await readImageFile(file);
    if (!validatePlateDimensions(image.width, image.height)) {
      URL.revokeObjectURL(image.url);
      setNotice({
        tone: "warn",
        text: `拒絕替換：${file.name} 是 ${image.width} x ${image.height}，必須是 ${WORKBENCH_GEOMETRY.plateWidth} x ${WORKBENCH_GEOMETRY.plateHeight}。`,
      });
      return;
    }

    patchPlates(
      state.plates.map((item) =>
        item.id === plate.id
          ? { ...item, label: plateLabelFromFile(file), imageUrl: image.url, sourceName: file.name, locked: false }
          : item,
      ),
    );
    setNotice({ tone: "ok", text: `已替換 plate：${plate.label}` });
  };

  const removePlate = (plate: WorkbenchPlate) => {
    if (state.plates.length <= 2) {
      setNotice({ tone: "warn", text: "至少要保留 2 張 plate 才能形成循環。" });
      return;
    }
    patchPlates(state.plates.filter((item) => item.id !== plate.id));
    setNotice({ tone: "ok", text: `已移除 plate：${plate.label}` });
  };

  const uploadFinished = async (pair: WorkbenchPair, file: File) => {
    const image = await readImageFile(file);
    if (!validateAdapterDimensions(image.width, image.height)) {
      URL.revokeObjectURL(image.url);
      setNotice({
        tone: "warn",
        text: `拒絕 finished adapter：${file.name} 是 ${image.width} x ${image.height}，必須是 ${WORKBENCH_GEOMETRY.adapterWidth} x ${WORKBENCH_GEOMETRY.adapterHeight}。`,
      });
      return;
    }

    const finished: WorkbenchFinishedAdapter = { imageUrl: image.url, sourceName: file.name };
    onChange({
      ...state,
      finishedAdapters: {
        ...state.finishedAdapters,
        [pair.id]: finished,
      },
    });
    setNotice({ tone: "ok", text: `已套用 finished adapter：${pair.from.label} -> ${pair.to.label}` });
  };

  const clearFinished = (pair: WorkbenchPair) => {
    const next = { ...state.finishedAdapters };
    delete next[pair.id];
    onChange({ ...state, finishedAdapters: next });
    setNotice({ tone: "ok", text: "已回到 work adapter fallback。" });
  };

  const exportConfig = () => {
    const blob = new Blob([exportScene(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pano-loop-scene-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ tone: "ok", text: "已匯出 scene config。" });
  };

  const importConfig = async (file: File) => {
    try {
      const text = await file.text();
      const next = importScene(text);
      await validateWorkbenchStateImages(next);
      onChange(next);
      setSelectedPairId(null);
      setNotice({ tone: "ok", text: `已匯入 scene config：${file.name}` });
    } catch (error) {
      setNotice({
        tone: "warn",
        text: error instanceof Error ? `匯入失敗：${error.message}` : "匯入失敗。",
      });
    }
  };

  return (
    <section className="adapter-workbench" aria-label="Adapter workbench">
      <header className="workbench-header">
        <div>
          <p className="workbench-kicker">背景循環搭景工具台</p>
          <h1>Panorama loop workbench</h1>
        </div>
        <a className="workbench-link" href="#seam-lab">
          回首頁預覽
        </a>
      </header>

      <div className="workbench-shell">
        <aside className="workbench-sidebar" aria-label="Plate manager">
          <div className="scene-tools">
            <div className="sidebar-heading">Scene file</div>
            <div className="scene-actions">
              <button type="button" onClick={exportConfig}>
                匯出 config
              </button>
              <label>
                匯入 config
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) void importConfig(file);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setSelectedPairId(null);
                  setNotice({ tone: "ok", text: "已重置為內建 staging scene。" });
                }}
              >
                重置
              </button>
            </div>
            <p>{storageStatus}</p>
          </div>

          <div className="sidebar-heading">Plate slots</div>
          <label className="upload-button">
            新增 plate
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void addPlate(file);
              }}
            />
          </label>

          <div className="plate-list">
            {state.plates.map((plate, index) => (
              <div className="plate-card" key={plate.id}>
                <img src={plate.imageUrl} alt={plate.label} />
                <div className="plate-meta">
                  <strong>{plate.label}</strong>
                  <span>{plate.sourceName}</span>
                </div>
                <div className="plate-actions">
                  <button type="button" onClick={() => patchPlates(move(state.plates, index, -1))} disabled={index === 0}>
                    ↑
                  </button>
                  <button type="button" onClick={() => patchPlates(move(state.plates, index, 1))} disabled={index === state.plates.length - 1}>
                    ↓
                  </button>
                  <label>
                    換
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void replacePlate(plate, file);
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => removePlate(plate)}>
                    刪
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notice && <div className={`workbench-notice is-${notice.tone}`}>{notice.text}</div>}
        </aside>

        <main className="workbench-main">
          <div className="workbench-title-row">
            <div>
              <p className="workbench-kicker">Derived pairs</p>
              <h2>{selectedPair ? `${selectedPair.from.label} -> ${selectedPair.to.label}` : "等待 plate"}</h2>
            </div>
            <div className="mode-tabs" aria-label="Pair selector">
              {pairs.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  className={pair.id === selectedPair?.id ? "is-active" : ""}
                  onClick={() => setSelectedPairId(pair.id)}
                >
                  {pair.from.label} → {pair.to.label}
                </button>
              ))}
            </div>
          </div>

          <div className="workbench-grid">
            <section className="preview-panel" aria-label="Adapter preview">
              {selectedPair ? (
                <img
                  src={selectedPair.finishedAdapter?.imageUrl ?? selectedPair.workAdapterUrl}
                  alt={`${selectedPair.from.label} to ${selectedPair.to.label} adapter`}
                />
              ) : (
                <div className="empty-candidates">至少需要 2 張 plate。</div>
              )}
            </section>

            <aside className="details-panel">
              <div className="details-block">
                <div className="sidebar-heading">Geometry</div>
                <div className="stat-grid">
                  <Stat label="Plate" value={`${WORKBENCH_GEOMETRY.plateWidth} x ${WORKBENCH_GEOMETRY.plateHeight}`} />
                  <Stat label="Adapter" value={`${WORKBENCH_GEOMETRY.adapterWidth} x ${WORKBENCH_GEOMETRY.adapterHeight}`} />
                  <Stat label="Edge m" value={`${WORKBENCH_GEOMETRY.edgeWidth}px`} />
                  <Stat label="X zone" value={`${WORKBENCH_GEOMETRY.xWidth}px`} />
                </div>
              </div>

              <div className="details-block">
                <div className="sidebar-heading">Runtime source</div>
                <div className="empty-candidates">
                  <strong>{selectedPair?.finishedAdapter ? "finished adapter" : "work adapter fallback"}</strong>
                  <span>
                    {selectedPair?.finishedAdapter?.sourceName ??
                      (generating ? "正在產生 work adapter..." : "X 區保留給 Photoshop 手修。")}
                  </span>
                </div>
              </div>

              {selectedPair && (
                <div className="details-block">
                  <div className="sidebar-heading">Files</div>
                  <div className="file-links">
                    <a href={selectedPair.workAdapterUrl} download={`${selectedPair.id}-work.png`}>
                      下載 work
                    </a>
                    <label className="file-label">
                      上傳 finished
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          event.currentTarget.value = "";
                          if (file) void uploadFinished(selectedPair, file);
                        }}
                      />
                    </label>
                    {selectedPair.finishedAdapter && (
                      <button type="button" className="clear-button" onClick={() => clearFinished(selectedPair)}>
                        清除 finished
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="details-block">
                <div className="sidebar-heading">Contract</div>
                <div className="empty-candidates">
                  <strong>嚴格尺寸，不自動縮放</strong>
                  <span>
                    上傳 plate 必須精準符合 6144 x 1536。finished adapter 也必須同尺寸，否則拒絕。
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
