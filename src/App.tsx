import { useEffect, useMemo, useState } from "react";
import { PanoRingStage } from "./components/PanoRingStage";
import type { SeamLabState } from "./components/PanoRingStage";
import { DebugPanel } from "./components/DebugPanel";
import { AdapterWorkbench } from "./components/AdapterWorkbench";
import { PANO_RING } from "./pano/panoRing";
import { useReducedMotion } from "./useReducedMotion";

const INITIAL_LAB: SeamLabState = {
  blendVw: PANO_RING.defaultOverlapVw ?? 12,
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
  const ring = useMemo(() => PANO_RING, []);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleHashChange = () => setView(readHashView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  if (view === "adapter-workbench") {
    return (
      <main className="app app-workbench">
        <AdapterWorkbench />
      </main>
    );
  }

  return (
    <main className="app">
      <PanoRingStage ring={ring} lab={lab} reducedMotion={reducedMotion} />
      <a className="view-switch" href="#adapter-workbench">
        AXB dashboard
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
