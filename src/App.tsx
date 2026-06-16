import { useState } from "react";
import { PanoStage } from "./components/PanoStage";
import { DebugPanel } from "./components/DebugPanel";
import { DEFAULT_SCENE_ID, getSceneById } from "./scenes/sceneManifests";
import { useReducedMotion } from "./useReducedMotion";

export default function App() {
  const [sceneId, setSceneId] = useState(DEFAULT_SCENE_ID);
  const reducedMotion = useReducedMotion();
  const scene = getSceneById(sceneId);

  return (
    <main className="app">
      <PanoStage scene={scene} />
      <DebugPanel scene={scene} onSelect={setSceneId} reducedMotion={reducedMotion} />
    </main>
  );
}
