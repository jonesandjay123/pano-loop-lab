import { useEffect, useMemo, useState } from "react";
import { PanoRingStage } from "./components/PanoRingStage";
import type { SeamLabState } from "./components/PanoRingStage";
import { DebugPanel } from "./components/DebugPanel";
import { AdapterWorkbench } from "./components/AdapterWorkbench";
import { useReducedMotion } from "./useReducedMotion";
import {
  DEFAULT_WORKBENCH_STATE,
  buildRingFromWorkbench,
  derivePairs,
  exportScene,
  importScene,
  generateWorkAdapter,
} from "./pano/workbenchState";
import type { WorkbenchPair } from "./pano/workbenchState";

const STORAGE_KEY = "pano-loop-lab.workbench.v1";

const INITIAL_LAB: SeamLabState = {
  blendVw: 0,
  labels: false,
  paused: false,
  inspectIndex: null,
};

type AppView = "seam-lab" | "adapter-workbench";

function readHashView(): AppView {
  return window.location.hash === "#adapter-workbench" ? "adapter-workbench" : "seam-lab";
}

function readStoredWorkbenchState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? importScene(stored) : DEFAULT_WORKBENCH_STATE;
  } catch {
    return DEFAULT_WORKBENCH_STATE;
  }
}

export default function App() {
  const [lab, setLab] = useState<SeamLabState>(INITIAL_LAB);
  const [view, setView] = useState<AppView>(readHashView);
  const [workbenchState, setWorkbenchState] = useState(readStoredWorkbenchState);
  const [pairs, setPairs] = useState<WorkbenchPair[]>([]);
  const [generatingAdapters, setGeneratingAdapters] = useState(true);
  const [storageStatus, setStorageStatus] = useState("此瀏覽器會自動保存目前場景。");
  const ring = useMemo(() => buildRingFromWorkbench(pairs), [pairs]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleHashChange = () => setView(readHashView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const resolved = derivePairs(workbenchState);
    setGeneratingAdapters(true);

    Promise.all(
      resolved.map(async (pair) => ({
        ...pair,
        workAdapterUrl: await generateWorkAdapter(pair.from, pair.to),
      })),
    )
      .then((nextPairs) => {
        if (!cancelled) setPairs(nextPairs);
      })
      .finally(() => {
        if (!cancelled) setGeneratingAdapters(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workbenchState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, exportScene(workbenchState));
      setStorageStatus("已自動保存到此瀏覽器。");
    } catch {
      setStorageStatus("自動保存失敗：圖片資料可能太大，請改用匯出 config 保存。");
    }
  }, [workbenchState]);

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  if (view === "adapter-workbench") {
    return (
      <main className="app app-workbench">
        <AdapterWorkbench
          state={workbenchState}
          pairs={pairs}
          onChange={setWorkbenchState}
          onReset={() => setWorkbenchState(DEFAULT_WORKBENCH_STATE)}
          generating={generatingAdapters}
          storageStatus={storageStatus}
        />
      </main>
    );
  }

  return (
    <main className="app">
      <PanoRingStage ring={ring} lab={lab} reducedMotion={reducedMotion} />
      <a className="view-switch" href="#adapter-workbench">
        Workbench
      </a>
      <DebugPanel
        ring={ring}
        lab={lab}
        onChange={patch}
        reducedMotion={reducedMotion}
      />
    </main>
  );
}
