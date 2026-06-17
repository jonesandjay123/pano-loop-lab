import { useMemo, useState } from "react";
import { PanoRingStage } from "./components/PanoRingStage";
import type { SeamLabState } from "./components/PanoRingStage";
import { DebugPanel } from "./components/DebugPanel";
import {
  DAWN_DUSK_ADAPTER_OPTIONS,
  DEFAULT_DAWN_DUSK_ADAPTER_OPTION_ID,
  PANO_RING,
  buildPanoRingWithDawnDuskAdapter,
} from "./pano/panoRing";
import type { DawnDuskAdapterOptionId } from "./pano/panoRing";
import { useReducedMotion } from "./useReducedMotion";

const INITIAL_LAB: SeamLabState = {
  blendVw: PANO_RING.defaultOverlapVw ?? 12,
  labels: false,
  paused: false,
  inspectIndex: null,
};

export default function App() {
  const [lab, setLab] = useState<SeamLabState>(INITIAL_LAB);
  const [dawnDuskAdapterId, setDawnDuskAdapterId] = useState<DawnDuskAdapterOptionId>(
    DEFAULT_DAWN_DUSK_ADAPTER_OPTION_ID,
  );
  const ring = useMemo(() => buildPanoRingWithDawnDuskAdapter(dawnDuskAdapterId), [dawnDuskAdapterId]);
  const reducedMotion = useReducedMotion();

  const patch = (p: Partial<SeamLabState>) => setLab((prev) => ({ ...prev, ...p }));

  return (
    <main className="app">
      <PanoRingStage ring={ring} lab={lab} reducedMotion={reducedMotion} />
      <DebugPanel
        ring={ring}
        lab={lab}
        onChange={patch}
        reducedMotion={reducedMotion}
        dawnDuskAdapterOptions={DAWN_DUSK_ADAPTER_OPTIONS}
        dawnDuskAdapterId={dawnDuskAdapterId}
        onDawnDuskAdapterChange={setDawnDuskAdapterId}
      />
    </main>
  );
}
