import { useState } from "react";
import { PanoRingStage } from "./components/PanoRingStage";
import type { SeamLabState } from "./components/PanoRingStage";
import { DebugPanel } from "./components/DebugPanel";
import { PANO_RING } from "./pano/panoRing";
import { useReducedMotion } from "./useReducedMotion";

const INITIAL_LAB: SeamLabState = {
  blendVw: PANO_RING.defaultOverlapVw ?? 12,
  labels: false,
  paused: false,
  inspectIndex: null,
};

export default function App() {
  const [lab, setLab] = useState<SeamLabState>(INITIAL_LAB);
  const reducedMotion = useReducedMotion();

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  return (
    <main className="app">
      <PanoRingStage ring={PANO_RING} lab={lab} reducedMotion={reducedMotion} />
      <DebugPanel ring={PANO_RING} lab={lab} onChange={patch} reducedMotion={reducedMotion} />
    </main>
  );
}
