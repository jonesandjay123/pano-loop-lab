import type { SceneManifest } from "./sceneTypes";

/**
 * Sample scenes for the lab.
 *
 * Image paths point at wide panoramas in /public/panos. These are real
 * Higgsfield-generated matte paintings (21:9 dawn / 16:9 dusk + moon) that map
 * 1:1 to the three scenes — swapped in over the original SVG placeholders to
 * prove the fit/drift/seam mechanism holds with production-grade art. The SVG
 * placeholders remain in /public/panos as a lightweight fallback reference.
 */
export const SCENES: SceneManifest[] = [
  {
    id: "dawn-valley",
    label: "Dawn Valley",
    imageUrl: "/panos/dawn-valley.jpg",
    baseScale: 1.1,
    fitMode: "cover",
    driftRangeX: 0.06,
    driftDuration: 80,
    verticalOffset: 0.0,
    overlayGradient: {
      // Real matte already carries golden-hour light; keep only a faint bottom
      // vignette so future foreground UI stays readable.
      css: "linear-gradient(180deg, rgba(255,228,180,0.06) 0%, rgba(20,18,40,0.0) 45%, rgba(12,8,18,0.28) 100%)",
      opacity: 1,
    },
    notes: "Higgsfield matte: golden-hour valley + winding lake, true 21:9. Tests cover-fit + gentle drift over a busy horizon.",
  },
  {
    id: "dusk-ridge",
    label: "Dusk Ridge",
    imageUrl: "/panos/dusk-ridge.jpg",
    baseScale: 1.16,
    fitMode: "cover",
    driftRangeX: 0.07,
    driftDuration: 95,
    verticalOffset: -0.02,
    overlayGradient: {
      css: "linear-gradient(180deg, rgba(40,18,60,0.10) 0%, rgba(20,10,40,0.0) 50%, rgba(10,4,24,0.30) 100%)",
      opacity: 1,
    },
    notes: "Higgsfield matte: indigo/magenta twilight ridges (16:9). Higher scale + wider drift to stress edge safety on a non-21:9 source.",
  },
  {
    id: "moonlit-tidelands",
    label: "Moonlit Tidelands",
    imageUrl: "/panos/moonlit-tidelands.jpg",
    baseScale: 1.14,
    fitMode: "cover",
    driftRangeX: 0.05,
    driftDuration: 110,
    verticalOffset: 0.02,
    overlayGradient: {
      css: "radial-gradient(120% 90% at 70% 22%, rgba(180,210,255,0.06) 0%, rgba(6,10,28,0.0) 50%, rgba(2,4,16,0.34) 100%)",
      opacity: 1,
    },
    notes: "Higgsfield matte: moonlit tideland, reflective flats (16:9). Lower drift to keep the calm mood; vignette pulled toward the moon (upper-right).",
  },
];

export const DEFAULT_SCENE_ID = SCENES[0].id;

export function getSceneById(id: string): SceneManifest {
  return SCENES.find((scene) => scene.id === id) ?? SCENES[0];
}
