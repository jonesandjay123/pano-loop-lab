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
const CANDIDATE_ROOT = "/panos/adapter-candidates";

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
    activeCandidateId: "hf-nb2-axb-02",
    candidates: [
      {
        id: "hf-nb2-axb-01",
        label: "HF NB2 AXB 01",
        imageUrl: candidateUrl("dawn-valley", "dusk-ridge", "hf-nb2-axb-01.png"),
        status: "generated",
        notes:
          "Nano Banana 2 reference candidate from AXB canvas + mask. Whole-frame reference generation; anchors are not guaranteed pixel-preserved.",
      },
      {
        id: "hf-nb2-axb-02",
        label: "HF NB2 AXB 02",
        imageUrl: candidateUrl("dawn-valley", "dusk-ridge", "hf-nb2-axb-02.png"),
        status: "generated",
        notes:
          "Softer atmospheric Nano Banana 2 reference candidate. Current dashboard active for review only; not accepted as final.",
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
