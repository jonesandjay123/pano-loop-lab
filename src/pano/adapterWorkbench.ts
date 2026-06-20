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
    overmaskPx: number;
  };
}

const PREP_ROOT = "/panos/adapter-prep";
const CANDIDATE_ROOT = "/panos/adapter-candidates";

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

function candidateUrl(fromId: string, toId: string, fileName: string) {
  return `${CANDIDATE_ROOT}/${fromId}__${toId}/${fileName}`;
}

const DEFAULT_GEOMETRY = {
  width: 3136,
  height: 1344,
  ratio: "1:12:1",
  anchorWidth: 224,
  xRegionWidth: 2688,
  overmaskPx: 32,
};

export const ADAPTER_WORKBENCH_PAIRS: AdapterWorkbenchPair[] = [
  {
    fromId: "dawn-valley",
    toId: "dusk-ridge",
    label: "Dawn Valley -> Dusk Ridge",
    ...pairUrls("dawn-valley", "dusk-ridge"),
    activeCandidateId: null,
    candidates: [
      {
        id: "hf-nb2-axb-01",
        label: "HF NB2 AXB 01",
        imageUrl: candidateUrl("dawn-valley", "dusk-ridge", "hf-nb2-axb-01.png"),
        status: "rejected",
        notes:
          "Rejected for final use: external anchors help the outer joins, but the generated X keeps a hard internal anchor-to-X band.",
      },
      {
        id: "hf-nb2-axb-02",
        label: "HF NB2 AXB 02",
        imageUrl: candidateUrl("dawn-valley", "dusk-ridge", "hf-nb2-axb-02.png"),
        status: "rejected",
        notes:
          "Rejected for final use: softer than 01, but still has obvious internal warm-to-blue bands and is not pixel-preserved.",
      },
    ],
    geometry: DEFAULT_GEOMETRY,
  },
  {
    fromId: "dusk-ridge",
    toId: "moonlit-tidelands",
    label: "Dusk Ridge -> Moonlit Tidelands",
    ...pairUrls("dusk-ridge", "moonlit-tidelands"),
    activeCandidateId: null,
    candidates: [],
    geometry: DEFAULT_GEOMETRY,
  },
  {
    fromId: "moonlit-tidelands",
    toId: "dawn-valley",
    label: "Moonlit Tidelands -> Dawn Valley",
    ...pairUrls("moonlit-tidelands", "dawn-valley"),
    activeCandidateId: null,
    candidates: [],
    geometry: DEFAULT_GEOMETRY,
  },
];
