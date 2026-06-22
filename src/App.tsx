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
  generateWorkAdapter,
} from "./pano/workbenchState";
import type { WorkbenchPair } from "./pano/workbenchState";

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

export default function App() {
  const [lab, setLab] = useState<SeamLabState>(INITIAL_LAB);
  const [view, setView] = useState<AppView>(readHashView);
  const [workbenchState, setWorkbenchState] = useState(DEFAULT_WORKBENCH_STATE);
  const [pairs, setPairs] = useState<WorkbenchPair[]>([]);
  const [generatingAdapters, setGeneratingAdapters] = useState(true);
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

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  if (view === "adapter-workbench") {
    return (
      <main className="app app-workbench">
        <AdapterWorkbench
          state={workbenchState}
          pairs={pairs}
          onChange={setWorkbenchState}
          generating={generatingAdapters}
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
