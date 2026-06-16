import { useState } from "react";
import { PanoLoopStage } from "./components/PanoLoopStage";
import { DebugPanel } from "./components/DebugPanel";
import { PANO_LOOP } from "./pano/panoLoop";
import { useReducedMotion } from "./useReducedMotion";

export default function App() {
  // Seam markers are an inspection aid, off by default so the reel reads cleanly.
  const [showSeams, setShowSeams] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <main className="app">
      <PanoLoopStage loop={PANO_LOOP} showSeams={showSeams} />
      <DebugPanel
        loop={PANO_LOOP}
        showSeams={showSeams}
        onToggleSeams={setShowSeams}
        reducedMotion={reducedMotion}
      />
    </main>
  );
}
