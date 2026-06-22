import type { PanoRingConfig, PanoSeam } from "./panoTypes";

export const WORKBENCH_GEOMETRY = {
  plateWidth: 6144,
  plateHeight: 1536,
  adapterWidth: 6144,
  adapterHeight: 1536,
  edgeWidth: 1024,
  xWidth: 4096,
  aspectRatio: 6144 / 1536,
  xFill: "#20242b",
} as const;

export interface WorkbenchPlate {
  id: string;
  label: string;
  imageUrl: string;
  sourceName: string;
  locked?: boolean;
}

export interface WorkbenchFinishedAdapter {
  imageUrl: string;
  sourceName: string;
}

export interface WorkbenchPair {
  id: string;
  from: WorkbenchPlate;
  to: WorkbenchPlate;
  workAdapterUrl: string;
  finishedAdapter?: WorkbenchFinishedAdapter;
}

export interface WorkbenchState {
  plates: WorkbenchPlate[];
  finishedAdapters: Record<string, WorkbenchFinishedAdapter | undefined>;
}

interface WorkbenchSceneFile {
  app: "pano-loop-lab";
  version: 1;
  exportedAt: string;
  geometry: typeof WORKBENCH_GEOMETRY;
  state: WorkbenchState;
}

export interface ResolvedWorkbenchPair {
  id: string;
  from: WorkbenchPlate;
  to: WorkbenchPlate;
  finishedAdapter?: WorkbenchFinishedAdapter;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function samplePlate(label: string, palette: string[], details: string, id: string): WorkbenchPlate {
  const [sky, ridge, land, accent] = palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WORKBENCH_GEOMETRY.plateWidth}" height="${WORKBENCH_GEOMETRY.plateHeight}" viewBox="0 0 ${WORKBENCH_GEOMETRY.plateWidth} ${WORKBENCH_GEOMETRY.plateHeight}">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="${sky}"/>
          <stop offset="1" stop-color="#d7d6c8"/>
        </linearGradient>
        <linearGradient id="land" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="${land}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="6144" height="1536" fill="url(#sky)"/>
      <path d="M0 715 C560 610 900 670 1300 560 C1750 438 2220 690 2680 570 C3310 405 3740 662 4210 548 C4770 410 5350 645 6144 522 L6144 1536 L0 1536 Z" fill="${ridge}" opacity="0.82"/>
      <path d="M0 930 C760 850 1110 955 1740 835 C2360 720 3100 905 3730 800 C4450 680 5000 845 6144 760 L6144 1536 L0 1536 Z" fill="url(#land)"/>
      <path d="M0 1145 C780 1040 1620 1190 2440 1075 C3280 958 4020 1120 4900 1010 C5480 938 5850 985 6144 940 L6144 1536 L0 1536 Z" fill="#2f493c" opacity="0.62"/>
      <g fill="#f1dfb4" opacity="0.78">
        <rect x="2470" y="905" width="70" height="34"/>
        <rect x="2585" y="888" width="92" height="44"/>
        <rect x="2730" y="918" width="58" height="28"/>
        <path d="M2500 905 l36 -30 l36 30z M2615 888 l46 -38 l46 38z M2740 918 l30 -24 l30 24z" fill="#8b3d34"/>
      </g>
      <text x="160" y="1370" fill="rgba(255,255,255,0.72)" font-family="system-ui, sans-serif" font-size="86" font-weight="700">${label}</text>
      <text x="160" y="1452" fill="rgba(255,255,255,0.48)" font-family="system-ui, sans-serif" font-size="38">${details}</text>
    </svg>`;

  return {
    id,
    label,
    imageUrl: svgDataUrl(svg),
    sourceName: "built-in staging plate",
    locked: true,
  };
}

export const DEFAULT_WORKBENCH_STATE: WorkbenchState = {
  plates: [
    samplePlate("Sunlit Alpine Pasture", ["#8ec6e8", "#8fa6a0", "#78a05f", "#b8bc75"], "Central European pasture / distant village / wide horizon", "sunlit-pasture"),
    samplePlate("Pine Forest Ridge", ["#91adbf", "#657876", "#365343", "#7d8a61"], "Pine ridge / chapel silhouette / calm terrain", "pine-ridge"),
    samplePlate("Old River Town", ["#9abbd0", "#7b8c88", "#4e765f", "#a77954"], "River valley / stone bridge / red roof town", "river-town"),
    samplePlate("Misty Lake Castle", ["#b7c0c7", "#748180", "#49685f", "#879682"], "Lake surface / far castle hill / soft mist", "lake-castle"),
  ],
  finishedAdapters: {},
};

export function pairId(fromId: string, toId: string) {
  return `${fromId}__${toId}`;
}

export function derivePairs(state: WorkbenchState): ResolvedWorkbenchPair[] {
  const { plates } = state;
  if (plates.length < 2) return [];

  return plates.map((from, index) => {
    const to = plates[(index + 1) % plates.length];
    const id = pairId(from.id, to.id);
    return {
      id,
      from,
      to,
      finishedAdapter: state.finishedAdapters[id],
    };
  });
}

export function buildRingFromWorkbench(pairs: WorkbenchPair[]): PanoRingConfig {
  const plates = pairs.map((pair) => pair.from);
  const seams: PanoSeam[] = pairs.map((pair) => ({
    fromId: pair.from.id,
    toId: pair.to.id,
    imageUrl: pair.finishedAdapter?.imageUrl ?? pair.workAdapterUrl,
    aspectRatio: WORKBENCH_GEOMETRY.aspectRatio,
    overlapStartPx: WORKBENCH_GEOMETRY.edgeWidth,
    overlapEndPx: WORKBENCH_GEOMETRY.edgeWidth,
    edgeLocked: true,
    notes: pair.finishedAdapter ? "Finished adapter." : "Generated work adapter fallback.",
  }));

  return {
    id: "dynamic-workbench-ring",
    label: "Workbench loop",
    loopDurationSeconds: Math.max(90, pairs.length * 34),
    direction: "left",
    defaultOverlapVw: 0,
    plates: plates.map((plate) => ({
      id: plate.id,
      label: plate.label,
      imageUrl: plate.imageUrl,
      aspectRatio: WORKBENCH_GEOMETRY.aspectRatio,
      edgeLocked: true,
      notes: plate.sourceName,
    })),
    seams,
    notes: "Resolved from adapter workbench state.",
  };
}

export function makePlateId(label: string) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
  return `${slug || "plate"}-${Date.now().toString(36)}`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("File could not be read as a data URL."));
    };
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

export async function readImageFile(file: File): Promise<{ url: string; width: number; height: number }> {
  const url = await readFileAsDataUrl(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;

  try {
    await image.decode();
  } catch {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image could not be loaded."));
    });
  }

  return { url, width: image.naturalWidth, height: image.naturalHeight };
}

export function exportScene(state: WorkbenchState): string {
  const payload: WorkbenchSceneFile = {
    app: "pano-loop-lab",
    version: 1,
    exportedAt: new Date().toISOString(),
    geometry: WORKBENCH_GEOMETRY,
    state,
  };
  return JSON.stringify(payload, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidImageUrl(value: unknown): value is string {
  return typeof value === "string" && (value.startsWith("data:image/") || value.startsWith("/"));
}

function validateImportedState(value: unknown): WorkbenchState {
  if (!isRecord(value)) throw new Error("Scene state is missing.");
  const plates = value.plates;
  const finishedAdapters = value.finishedAdapters;

  if (!Array.isArray(plates) || plates.length < 2) {
    throw new Error("Scene must contain at least 2 plates.");
  }

  const normalizedPlates: WorkbenchPlate[] = plates.map((plate, index) => {
    if (!isRecord(plate)) throw new Error(`Plate ${index + 1} is invalid.`);
    if (typeof plate.id !== "string" || !plate.id) throw new Error(`Plate ${index + 1} is missing an id.`);
    if (typeof plate.label !== "string" || !plate.label) throw new Error(`Plate ${index + 1} is missing a label.`);
    if (!isValidImageUrl(plate.imageUrl)) throw new Error(`Plate ${index + 1} is missing image data.`);
    const imageUrl = plate.imageUrl;
    return {
      id: plate.id,
      label: plate.label,
      imageUrl,
      sourceName: typeof plate.sourceName === "string" ? plate.sourceName : "imported plate",
      locked: Boolean(plate.locked),
    };
  });

  const normalizedFinished: Record<string, WorkbenchFinishedAdapter | undefined> = {};
  if (isRecord(finishedAdapters)) {
    Object.entries(finishedAdapters).forEach(([key, adapter]) => {
      if (!adapter) return;
      if (!isRecord(adapter)) throw new Error(`Finished adapter ${key} is invalid.`);
      if (!isValidImageUrl(adapter.imageUrl)) throw new Error(`Finished adapter ${key} is missing image data.`);
      const imageUrl = adapter.imageUrl;
      normalizedFinished[key] = {
        imageUrl,
        sourceName: typeof adapter.sourceName === "string" ? adapter.sourceName : "imported finished adapter",
      };
    });
  }

  return { plates: normalizedPlates, finishedAdapters: normalizedFinished };
}

export function importScene(text: string): WorkbenchState {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) throw new Error("Scene file is invalid JSON.");
  if (parsed.app !== "pano-loop-lab" || parsed.version !== 1) {
    throw new Error("Scene file version is not supported.");
  }

  const geometry = parsed.geometry;
  if (!isRecord(geometry)) throw new Error("Scene geometry is missing.");
  if (
    geometry.plateWidth !== WORKBENCH_GEOMETRY.plateWidth ||
    geometry.plateHeight !== WORKBENCH_GEOMETRY.plateHeight ||
    geometry.adapterWidth !== WORKBENCH_GEOMETRY.adapterWidth ||
    geometry.adapterHeight !== WORKBENCH_GEOMETRY.adapterHeight ||
    geometry.edgeWidth !== WORKBENCH_GEOMETRY.edgeWidth ||
    geometry.xWidth !== WORKBENCH_GEOMETRY.xWidth
  ) {
    throw new Error("Scene geometry does not match this workbench.");
  }

  return validateImportedState(parsed.state);
}

export async function validateWorkbenchStateImages(state: WorkbenchState): Promise<void> {
  const plates = await Promise.all(state.plates.map((plate) => loadImage(plate.imageUrl)));
  plates.forEach((image, index) => {
    if (!validatePlateDimensions(image.naturalWidth, image.naturalHeight)) {
      throw new Error(
        `Plate ${index + 1} is ${image.naturalWidth} x ${image.naturalHeight}; expected ${WORKBENCH_GEOMETRY.plateWidth} x ${WORKBENCH_GEOMETRY.plateHeight}.`,
      );
    }
  });

  const finished = Object.entries(state.finishedAdapters);
  const images = await Promise.all(finished.map(([, adapter]) => (adapter ? loadImage(adapter.imageUrl) : null)));
  images.forEach((image, index) => {
    if (!image) return;
    if (!validateAdapterDimensions(image.naturalWidth, image.naturalHeight)) {
      throw new Error(
        `Finished adapter ${finished[index][0]} is ${image.naturalWidth} x ${image.naturalHeight}; expected ${WORKBENCH_GEOMETRY.adapterWidth} x ${WORKBENCH_GEOMETRY.adapterHeight}.`,
      );
    }
  });
}

export function validatePlateDimensions(width: number, height: number) {
  return width === WORKBENCH_GEOMETRY.plateWidth && height === WORKBENCH_GEOMETRY.plateHeight;
}

export function validateAdapterDimensions(width: number, height: number) {
  return width === WORKBENCH_GEOMETRY.adapterWidth && height === WORKBENCH_GEOMETRY.adapterHeight;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Adapter source image failed to load."));
  });
}

export async function generateWorkAdapter(from: WorkbenchPlate, to: WorkbenchPlate): Promise<string> {
  const [fromImage, toImage] = await Promise.all([loadImage(from.imageUrl), loadImage(to.imageUrl)]);
  const { adapterWidth, adapterHeight, edgeWidth, xWidth, xFill } = WORKBENCH_GEOMETRY;
  const canvas = document.createElement("canvas");
  canvas.width = adapterWidth;
  canvas.height = adapterHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser canvas is not available.");

  ctx.fillStyle = xFill;
  ctx.fillRect(0, 0, adapterWidth, adapterHeight);
  ctx.drawImage(
    fromImage,
    WORKBENCH_GEOMETRY.plateWidth - edgeWidth,
    0,
    edgeWidth,
    WORKBENCH_GEOMETRY.plateHeight,
    0,
    0,
    edgeWidth,
    adapterHeight,
  );
  ctx.drawImage(
    toImage,
    0,
    0,
    edgeWidth,
    WORKBENCH_GEOMETRY.plateHeight,
    edgeWidth + xWidth,
    0,
    edgeWidth,
    adapterHeight,
  );

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(edgeWidth - 2, 0, 4, adapterHeight);
  ctx.fillRect(edgeWidth + xWidth - 2, 0, 4, adapterHeight);
  ctx.fillStyle = "rgba(255,255,255,0.54)";
  ctx.font = "700 72px system-ui, sans-serif";
  ctx.fillText(`${from.label} -> ${to.label}`, edgeWidth + 96, 150);
  ctx.font = "500 42px system-ui, sans-serif";
  ctx.fillText("Photoshop fill zone: 4096px", edgeWidth + 96, 230);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Work adapter export failed."));
    }, "image/png");
  });

  return URL.createObjectURL(blob);
}
