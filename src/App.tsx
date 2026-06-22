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
  validateWorkbenchStateImages,
} from "./pano/workbenchState";
import type { WorkbenchPair } from "./pano/workbenchState";
import { loadPersistedWorkbenchScene, savePersistedWorkbenchScene } from "./pano/workbenchPersistence";

const LEGACY_STORAGE_KEY = "pano-loop-lab.workbench.v1";

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

async function readProductionPreset() {
  const response = await fetch("/panos/production/scene.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Production scene preset is missing.");
  const state = importScene(await response.text());
  await validateWorkbenchStateImages(state);
  return state;
}

export default function App() {
  const [lab, setLab] = useState<SeamLabState>(INITIAL_LAB);
  const [view, setView] = useState<AppView>(readHashView);
  const [workbenchState, setWorkbenchState] = useState(DEFAULT_WORKBENCH_STATE);
  const [pairs, setPairs] = useState<WorkbenchPair[]>([]);
  const [generatingAdapters, setGeneratingAdapters] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState("正在讀取此瀏覽器保存的場景。");
  const ring = useMemo(() => buildRingFromWorkbench(pairs), [pairs]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function restoreWorkbenchState() {
      try {
        const persisted = await loadPersistedWorkbenchScene();
        if (cancelled) return;

        if (persisted) {
          setWorkbenchState(importScene(persisted));
          setStorageStatus("已從此瀏覽器還原場景。");
          setStorageReady(true);
          return;
        }
      } catch {
        if (!cancelled) {
          setStorageStatus("IndexedDB 還原失敗，先使用內建 staging scene。");
        }
      }

      try {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (cancelled) return;
        if (legacy) {
          setWorkbenchState(importScene(legacy));
          setStorageStatus("已從舊 localStorage 還原場景，之後會改存 IndexedDB。");
          setStorageReady(true);
          return;
        }
      } catch {
        if (!cancelled) {
          setStorageStatus("舊 localStorage 無法讀取，改載入 repo production preset。");
        }
      }

      try {
        const productionPreset = await readProductionPreset();
        if (cancelled) return;
        setWorkbenchState(productionPreset);
        setStorageStatus("已載入 repo production preset。");
      } catch {
        if (!cancelled) {
          setStorageStatus("找不到 repo production preset，使用內建 staging scene。");
        }
      }

      if (!cancelled) setStorageReady(true);
    }

    void restoreWorkbenchState();

    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!storageReady) return;

    let cancelled = false;

    async function persistWorkbenchState() {
      try {
        await savePersistedWorkbenchScene(exportScene(workbenchState));
        if (!cancelled) setStorageStatus("已自動保存到此瀏覽器 IndexedDB。");
      } catch {
        if (!cancelled) {
          setStorageStatus("自動保存失敗：請用匯出 config 保存目前場景。");
        }
      }
    }

    void persistWorkbenchState();

    return () => {
      cancelled = true;
    };
  }, [storageReady, workbenchState]);

  const resetToProductionPreset = async () => {
    setStorageStatus("正在載入 repo production preset。");
    try {
      setWorkbenchState(await readProductionPreset());
      setStorageStatus("已重置為 repo production preset。");
    } catch {
      setWorkbenchState(DEFAULT_WORKBENCH_STATE);
      setStorageStatus("repo production preset 載入失敗，已重置為內建 staging scene。");
    }
  };

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  if (view === "adapter-workbench") {
    return (
      <main className="app app-workbench">
        <AdapterWorkbench
          state={workbenchState}
          pairs={pairs}
          onChange={setWorkbenchState}
          onReset={() => void resetToProductionPreset()}
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
