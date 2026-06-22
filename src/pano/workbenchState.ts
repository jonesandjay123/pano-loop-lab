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

export async function readImageFile(file: File): Promise<{ url: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
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
