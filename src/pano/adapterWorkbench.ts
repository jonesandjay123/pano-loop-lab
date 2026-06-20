export interface AdapterCandidate {
  id: string;
  label: string;
  imageUrl: string;
  status: "generated" | "accepted" | "rejected" | "legacy";
  notes: string;
}

export interface AdapterWorkbenchPair {
  fromId: string;
  toId: string;
  label: string;
  workCanvasUrl: string;
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

function pairUrls(fromId: string, toId: string) {
  const pairRoot = `${PREP_ROOT}/${fromId}__${toId}`;
  return {
    workCanvasUrl: `${pairRoot}/adapter-work-canvas.png`,
    maskUrl: `${pairRoot}/adapter-mask.png`,
    fromAnchorUrl: `${pairRoot}/${fromId}-right-anchor.png`,
    toAnchorUrl: `${pairRoot}/${toId}-left-anchor.png`,
    manifestUrl: `${pairRoot}/manifest.json`,
    promptUrl: `${pairRoot}/prompt.txt`,
    negativePromptUrl: `${pairRoot}/negative-prompt.txt`,
  };
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
    candidates: [],
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
