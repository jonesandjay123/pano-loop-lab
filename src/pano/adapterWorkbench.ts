export interface AdapterWorkbenchPair {
  fromId: string;
  toId: string;
  label: string;
  workCanvasUrl: string;
  activeRuntimeUrl: string;
  status: "filled" | "placeholder";
  geometry: {
    width: number;
    height: number;
    ratio: string;
    anchorWidth: number;
    xRegionWidth: number;
    xStart: number;
    xEnd: number;
  };
}

const GEOMETRY = {
  width: 3136,
  height: 1344,
  ratio: "1:4:1",
  anchorWidth: 523,
  xRegionWidth: 2090,
  xStart: 523,
  xEnd: 2613,
};

export const ADAPTER_WORKBENCH_PAIRS: AdapterWorkbenchPair[] = [
  {
    fromId: "dawn-valley",
    toId: "dusk-ridge",
    label: "Dawn Valley -> Dusk Ridge",
    workCanvasUrl: "/panos/adapters-clean/dawn-valley__dusk-ridge-work.png",
    activeRuntimeUrl: "/panos/adapters-clean/dawn-valley__dusk-ridge-photoshop-test1.png",
    status: "filled",
    geometry: GEOMETRY,
  },
  {
    fromId: "dusk-ridge",
    toId: "moonlit-tidelands",
    label: "Dusk Ridge -> Moonlit Tidelands",
    workCanvasUrl: "/panos/adapters-clean/dusk-ridge__moonlit-tidelands-work.png",
    activeRuntimeUrl: "/panos/adapters-clean/dusk-ridge__moonlit-tidelands-photoshop-test2.png",
    status: "filled",
    geometry: GEOMETRY,
  },
  {
    fromId: "moonlit-tidelands",
    toId: "dawn-valley",
    label: "Moonlit Tidelands -> Dawn Valley",
    workCanvasUrl: "/panos/adapters-clean/moonlit-tidelands__dawn-valley-work.png",
    activeRuntimeUrl: "/panos/adapters-clean/moonlit-tidelands__dawn-valley-photoshop-test3.png",
    status: "filled",
    geometry: GEOMETRY,
  },
];
