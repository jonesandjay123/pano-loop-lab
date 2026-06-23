import { WORKBENCH_GEOMETRY } from "./workbenchState";
import type { WorkbenchPair, WorkbenchState } from "./workbenchState";

export const WORLD_RING_VERSION = 1;

export const WORLD_RING_GEOMETRY = {
  plateWidth: WORKBENCH_GEOMETRY.plateWidth,
  plateHeight: WORKBENCH_GEOMETRY.plateHeight,
  adapterWidth: WORKBENCH_GEOMETRY.adapterWidth,
  adapterHeight: WORKBENCH_GEOMETRY.adapterHeight,
  edgeWidth: WORKBENCH_GEOMETRY.edgeWidth,
  xWidth: WORKBENCH_GEOMETRY.xWidth,
} as const;

export interface WorldRingGeometry {
  plateWidth: number;
  plateHeight: number;
  adapterWidth: number;
  adapterHeight: number;
  edgeWidth: number;
  xWidth: number;
}

export interface RegionCameraHints {
  anchorX?: number;
  preferredLookY?: number;
}

export interface Region {
  id: string;
  label: string;
  plate: string;
  stagingPreset?: string;
  lightingPreset?: string;
  particlePreset?: string;
  ribbonPalette?: string;
  cameraHints?: RegionCameraHints;
}

export interface Adapter {
  from: string;
  to: string;
  image: string;
  transitionPreset?: string;
}

export interface WorldRingPackage {
  id: string;
  version: typeof WORLD_RING_VERSION;
  geometry: WorldRingGeometry;
  regions: Region[];
  adapters: Adapter[];
}

export interface WorldRingValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateWorldRingPackage(pkg: WorldRingPackage): WorldRingValidationResult {
  const errors: string[] = [];

  if (!pkg.id) errors.push("Package id is required.");
  if (pkg.version !== WORLD_RING_VERSION) errors.push(`Package version must be ${WORLD_RING_VERSION}.`);

  const geometryEntries = Object.entries(WORLD_RING_GEOMETRY) as Array<[keyof WorldRingGeometry, number]>;
  geometryEntries.forEach(([key, expected]) => {
    if (pkg.geometry[key] !== expected) {
      errors.push(`geometry.${key} must be ${expected}.`);
    }
  });

  if (!Array.isArray(pkg.regions) || pkg.regions.length < 2) {
    errors.push("Package must contain at least 2 regions.");
  }

  const regionIds = new Set<string>();
  pkg.regions.forEach((region, index) => {
    if (!region.id) errors.push(`Region ${index + 1} is missing an id.`);
    if (regionIds.has(region.id)) errors.push(`Region id is duplicated: ${region.id}.`);
    regionIds.add(region.id);
    if (!region.label) errors.push(`Region ${region.id || index + 1} is missing a label.`);
    if (!region.plate) errors.push(`Region ${region.id || index + 1} is missing a plate path.`);
  });

  if (!Array.isArray(pkg.adapters) || pkg.adapters.length !== pkg.regions.length) {
    errors.push("Package must contain exactly one adapter for each adjacent region pair.");
  }

  const adapterKeys = new Set<string>();
  pkg.adapters.forEach((adapter, index) => {
    if (!regionIds.has(adapter.from)) errors.push(`Adapter ${index + 1} has unknown from region: ${adapter.from}.`);
    if (!regionIds.has(adapter.to)) errors.push(`Adapter ${index + 1} has unknown to region: ${adapter.to}.`);
    if (!adapter.image) errors.push(`Adapter ${adapter.from || "?"}->${adapter.to || "?"} is missing an image path.`);
    const key = `${adapter.from}__${adapter.to}`;
    if (adapterKeys.has(key)) errors.push(`Adapter pair is duplicated: ${adapter.from}->${adapter.to}.`);
    adapterKeys.add(key);
  });

  pkg.regions.forEach((region, index) => {
    const next = pkg.regions[(index + 1) % pkg.regions.length];
    const expectedKey = `${region.id}__${next.id}`;
    if (!adapterKeys.has(expectedKey)) {
      errors.push(`Missing adjacent adapter: ${region.id}->${next.id}.`);
    }
  });

  return { ok: errors.length === 0, errors };
}

export function stringifyWorldRingPackage(pkg: WorldRingPackage): string {
  const result = validateWorldRingPackage(pkg);
  if (!result.ok) {
    throw new Error(`Invalid world-ring package:\n${result.errors.join("\n")}`);
  }
  return JSON.stringify(pkg, null, 2);
}

export function buildWorldRingPackageFromWorkbench(
  state: WorkbenchState,
  pairs: WorkbenchPair[],
  options: { id?: string } = {},
): WorldRingPackage {
  return {
    id: options.id ?? "workbench-ring",
    version: WORLD_RING_VERSION,
    geometry: WORLD_RING_GEOMETRY,
    regions: state.plates.map((plate) => ({
      id: plate.id,
      label: plate.label,
      plate: plate.imageUrl,
      stagingPreset: plate.stagingPreset,
      lightingPreset: plate.lightingPreset,
      particlePreset: plate.particlePreset,
      ribbonPalette: plate.ribbonPalette,
      cameraHints: plate.cameraHints,
    })),
    adapters: pairs.map((pair) => ({
      from: pair.from.id,
      to: pair.to.id,
      image: pair.finishedAdapter?.imageUrl ?? pair.workAdapterUrl,
      transitionPreset: pair.finishedAdapter?.transitionPreset,
    })),
  };
}
