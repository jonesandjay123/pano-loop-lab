import { useState } from "react";
import { PanoRingStage } from "./components/PanoRingStage";
import { DebugPanel } from "./components/DebugPanel";
import { PANO_RING } from "./pano/panoRing";
import { useReducedMotion } from "./useReducedMotion";

export default function App() {
  // Seam markers are an inspection aid, off by default so the ring reads cleanly.
  const [showSeams, setShowSeams] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <main className="app">
      <PanoRingStage ring={PANO_RING} showSeams={showSeams} />
      <DebugPanel
        ring={PANO_RING}
        showSeams={showSeams}
        onToggleSeams={setShowSeams}
        reducedMotion={reducedMotion}
      />
    </main>
  );
}
