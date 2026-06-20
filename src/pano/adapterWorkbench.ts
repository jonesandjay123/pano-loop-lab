import { ADAPTER_CANDIDATES_BY_PAIR } from "./adapterCandidates.generated";

export interface AdapterCandidate {
  id: string;
  label: string;
  imageUrl: string;
  status: "generated" | "partial" | "accepted" | "rejected" | "legacy";
  notes: string;
}

export interface AdapterPrepVariant {
  id: "gradient" | "white" | "black";
  label: string;
  workCanvasUrl: string;
}

export interface AdapterWorkbenchPair {
  fromId: string;
  toId: string;
  label: string;
  workCanvasUrl: string;
  prepVariants: AdapterPrepVariant[];
  maskUrl: string;
  fromAnchorUrl: string;
  toAnchorUrl: string;
  manifestUrl: string;
  promptUrl: string;
  negativePromptUrl: string;
  activeCandidateId: string | null;
  candidates: AdapterCandidate[];
  geometry: {
    width: number;
    height: number;
    ratio: string;
    anchorWidth: number;
    xRegionWidth: number;
    xStart: number;
    xEnd: number;
    rightAnchorStart: number;
    overlapWidth: number;
    overmaskPx: number;
  };
}

const PREP_ROOT = "/panos/adapter-prep";

const PREP_VARIANTS: Array<Pick<AdapterPrepVariant, "id" | "label"> & { root: string }> = [
  { id: "gradient", label: "Gradient", root: "/panos/adapter-prep" },
  { id: "white", label: "White", root: "/panos/adapter-prep-white" },
  { id: "black", label: "Black", root: "/panos/adapter-prep-black" },
];

function pairUrls(fromId: string, toId: string) {
  const pairRoot = `${PREP_ROOT}/${fromId}__${toId}`;
  return {
    workCanvasUrl: `${pairRoot}/adapter-work-canvas.png`,
    prepVariants: PREP_VARIANTS.map((variant) => ({
      id: variant.id,
      label: variant.label,
      workCanvasUrl: `${variant.root}/${fromId}__${toId}/adapter-work-canvas.png`,
    })),
    maskUrl: `${pairRoot}/adapter-mask.png`,
    fromAnchorUrl: `${pairRoot}/${fromId}-right-anchor.png`,
    toAnchorUrl: `${pairRoot}/${toId}-left-anchor.png`,
    manifestUrl: `${pairRoot}/manifest.json`,
    promptUrl: `${pairRoot}/prompt.txt`,
    negativePromptUrl: `${pairRoot}/negative-prompt.txt`,
  };
}

function candidatesForPair(fromId: string, toId: string): AdapterCandidate[] {
  const key = `${fromId}__${toId}` as keyof typeof ADAPTER_CANDIDATES_BY_PAIR;
  return ((ADAPTER_CANDIDATES_BY_PAIR[key] ?? []) as readonly AdapterCandidate[]).map((candidate) => ({
    id: candidate.id,
    label: candidate.label,
    imageUrl: candidate.imageUrl,
    status: candidate.status,
    notes: candidate.notes,
  }));
}

function activeCandidateForPair(fromId: string, toId: string) {
  return candidatesForPair(fromId, toId).find((candidate) => candidate.status === "generated")?.id ?? null;
}

const DEFAULT_GEOMETRY = {
  width: 3136,
  height: 1344,
  ratio: "1:4:1",
  anchorWidth: 523,
  xRegionWidth: 2090,
  xStart: 523,
  xEnd: 2613,
  rightAnchorStart: 2613,
  overlapWidth: 523,
  overmaskPx: 32,
};

export const ADAPTER_WORKBENCH_PAIRS: AdapterWorkbenchPair[] = [
  {
    fromId: "dawn-valley",
    toId: "dusk-ridge",
    label: "Dawn Valley -> Dusk Ridge",
    ...pairUrls("dawn-valley", "dusk-ridge"),
    activeCandidateId: activeCandidateForPair("dawn-valley", "dusk-ridge"),
    candidates: candidatesForPair("dawn-valley", "dusk-ridge"),
    geometry: DEFAULT_GEOMETRY,
  },
  {
    fromId: "dusk-ridge",
    toId: "moonlit-tidelands",
    label: "Dusk Ridge -> Moonlit Tidelands",
    ...pairUrls("dusk-ridge", "moonlit-tidelands"),
    activeCandidateId: activeCandidateForPair("dusk-ridge", "moonlit-tidelands"),
    candidates: candidatesForPair("dusk-ridge", "moonlit-tidelands"),
    geometry: DEFAULT_GEOMETRY,
  },
  {
    fromId: "moonlit-tidelands",
    toId: "dawn-valley",
    label: "Moonlit Tidelands -> Dawn Valley",
    ...pairUrls("moonlit-tidelands", "dawn-valley"),
    activeCandidateId: activeCandidateForPair("moonlit-tidelands", "dawn-valley"),
    candidates: candidatesForPair("moonlit-tidelands", "dawn-valley"),
    geometry: DEFAULT_GEOMETRY,
  },
];
