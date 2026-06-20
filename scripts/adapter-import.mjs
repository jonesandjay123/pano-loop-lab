import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_FROM = "dawn-valley";
const DEFAULT_TO = "dusk-ridge";
const DEFAULT_METHOD = "external-gpt-image-edit";
const DEFAULT_STATUS = "generated";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  if (typeof args.source !== "string") {
    throw new Error("Missing required --source /path/to/generated-image.png");
  }

  if (typeof args.id !== "string") {
    throw new Error("Missing required --id candidate-id");
  }

  return {
    source: resolveRepoPath(args.source),
    from: typeof args.from === "string" ? args.from : DEFAULT_FROM,
    to: typeof args.to === "string" ? args.to : DEFAULT_TO,
    id: args.id,
    label: typeof args.label === "string" ? args.label : args.id,
    notes:
      typeof args.notes === "string"
        ? args.notes
        : "Imported external AXB candidate. Pixel preservation must be verified before acceptance.",
    method: typeof args.method === "string" ? args.method : DEFAULT_METHOD,
    status: typeof args.status === "string" ? args.status : DEFAULT_STATUS,
    force: args.force === true,
  };
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function pairKey(from, to) {
  return `${from}__${to}`;
}

function prepManifestPath(from, to) {
  return path.join(REPO_ROOT, "public", "panos", "adapter-prep", pairKey(from, to), "manifest.json");
}

function candidateDir(from, to) {
  return path.join(REPO_ROOT, "public", "panos", "adapter-candidates", pairKey(from, to));
}

function researchDir(from, to) {
  return path.join(REPO_ROOT, "docs", "research", "experiments", "working", "011-imported-gpt-candidates", pairKey(from, to));
}

async function readPrepManifest(from, to) {
  const manifestPath = prepManifestPath(from, to);
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing prep manifest: ${repoRelative(manifestPath)}`);
  }
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function readCandidateJson(jsonPath, from, to) {
  if (!existsSync(jsonPath)) {
    return {
      id: "adapter-candidates",
      createdAt: new Date().toISOString(),
      boundary: { from, to },
      activeForReview: null,
      candidates: [],
    };
  }

  return JSON.parse(await readFile(jsonPath, "utf8"));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.source)) {
    throw new Error(`Missing source image: ${options.source}`);
  }

  const manifest = await readPrepManifest(options.from, options.to);
  const width = manifest.dimensions.width;
  const height = manifest.dimensions.height;

  const outputDir = candidateDir(options.from, options.to);
  const outputPath = path.join(outputDir, `${options.id}.png`);
  const researchOutputDir = researchDir(options.from, options.to);
  const researchOutputPath = path.join(researchOutputDir, `${options.id}.png`);

  if ((existsSync(outputPath) || existsSync(researchOutputPath)) && !options.force) {
    throw new Error(`Candidate ${options.id} already exists. Pass --force to replace it.`);
  }

  await mkdir(outputDir, { recursive: true });
  await mkdir(researchOutputDir, { recursive: true });

  const sourceMeta = await sharp(options.source).metadata();
  await sharp(options.source)
    .resize({ width, height, fit: "fill" })
    .png()
    .toFile(outputPath);
  await sharp(outputPath).toFile(researchOutputPath);

  const importedMeta = await sharp(outputPath).metadata();
  const jsonPath = path.join(outputDir, "candidates.json");
  const data = await readCandidateJson(jsonPath, options.from, options.to);
  data.updatedAt = new Date().toISOString();
  data.sourcePrep = {
    workCanvas: repoRelative(path.join(REPO_ROOT, manifest.outputPaths.adapterWorkCanvas)),
    mask: repoRelative(path.join(REPO_ROOT, manifest.outputPaths.adapterMask)),
  };
  data.activeForReview = options.id;

  const entry = {
    id: options.id,
    label: options.label,
    localPath: repoRelative(outputPath),
    researchCopy: repoRelative(researchOutputPath),
    status: options.status,
    method: options.method,
    notes: options.notes,
    sourceImport: {
      path: repoRelative(options.source),
      sourceWidth: sourceMeta.width,
      sourceHeight: sourceMeta.height,
      importedWidth: importedMeta.width,
      importedHeight: importedMeta.height,
      resizedToPrepDimensions: sourceMeta.width !== width || sourceMeta.height !== height,
    },
  };

  const existingIndex = data.candidates.findIndex((candidate) => candidate.id === options.id);
  if (existingIndex >= 0) {
    data.candidates[existingIndex] = entry;
  } else {
    data.candidates.push(entry);
  }

  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);

  const researchJsonPath = path.join(researchOutputDir, "candidates.json");
  await writeFile(researchJsonPath, `${JSON.stringify(data, null, 2)}\n`);

  await import("./adapter-candidates-generate.mjs");

  console.log(`Imported ${options.id}`);
  console.log(`- ${repoRelative(outputPath)}`);
  console.log(`- ${repoRelative(jsonPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
