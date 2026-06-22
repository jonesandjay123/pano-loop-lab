import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_SCENES = ["dawn-valley", "dusk-ridge", "moonlit-tidelands"];
const DEFAULT_PREP_ROOT = "public/panos/adapter-prep";
const DEFAULT_OUTPUT_ROOT = "docs/research/experiments/working/manual-inpaint";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  const scenes = typeof args.scenes === "string" ? args.scenes.split(",").map((id) => id.trim()).filter(Boolean) : [];
  const hasPair = typeof args.pair === "string";
  const batchMode = args.all === true || scenes.length > 0 || !hasPair;

  if (hasPair && batchMode && (args.all === true || scenes.length > 0)) {
    throw new Error("Use either --pair or batch mode (--all / --scenes), not both.");
  }

  return {
    mode: batchMode ? "batch" : "pair",
    pair: args.pair,
    scenes: scenes.length > 0 ? scenes : DEFAULT_SCENES,
    prepRoot: typeof args["prep-root"] === "string" ? args["prep-root"] : DEFAULT_PREP_ROOT,
    outputRoot: typeof args.out === "string" ? args.out : DEFAULT_OUTPUT_ROOT,
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

function splitPair(pair) {
  const parts = pair.split("__");
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) {
    throw new Error(`Invalid --pair "${pair}". Expected fromId__toId.`);
  }
  return { from: parts[0], to: parts[1] };
}

function pairsForScenes(scenes) {
  if (scenes.length < 2) {
    throw new Error("Batch export needs at least two scene ids.");
  }

  return scenes.map((from, index) => ({
    from,
    to: scenes[(index + 1) % scenes.length],
  }));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function hardMaskSvg(width, height, xStart, xEnd) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="black"/>
  <rect x="${xStart}" y="0" width="${xEnd - xStart}" height="${height}" fill="white"/>
</svg>`);
}

function labeledOverlaySvg(width, height, xStart, xEnd, from, to) {
  const rightWidth = width - xEnd;
  const labelY = 88;
  const ruleY = height - 78;

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0)"/>
  <rect x="0" y="0" width="${xStart}" height="${height}" fill="rgba(255,204,64,0.16)"/>
  <rect x="${xStart}" y="0" width="${xEnd - xStart}" height="${height}" fill="rgba(255,255,255,0.08)"/>
  <rect x="${xEnd}" y="0" width="${rightWidth}" height="${height}" fill="rgba(93,190,255,0.16)"/>
  <line x1="${xStart}" y1="0" x2="${xStart}" y2="${height}" stroke="#ffcc40" stroke-width="8"/>
  <line x1="${xEnd}" y1="0" x2="${xEnd}" y2="${height}" stroke="#5dbeff" stroke-width="8"/>
  <rect x="32" y="32" width="${xStart - 64}" height="104" rx="0" fill="rgba(0,0,0,0.58)"/>
  <rect x="${xStart + 32}" y="32" width="${xEnd - xStart - 64}" height="104" rx="0" fill="rgba(0,0,0,0.58)"/>
  <rect x="${xEnd + 32}" y="32" width="${rightWidth - 64}" height="104" rx="0" fill="rgba(0,0,0,0.58)"/>
  <text x="${xStart / 2}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="white">A anchor: ${from}</text>
  <text x="${xStart + (xEnd - xStart) / 2}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="white">X: human inpaint region</text>
  <text x="${xEnd + rightWidth / 2}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="white">B anchor: ${to}</text>
  <line x1="${xStart}" y1="${ruleY}" x2="${xEnd}" y2="${ruleY}" stroke="white" stroke-width="6"/>
  <text x="${xStart + (xEnd - xStart) / 2}" y="${ruleY - 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="white">Only this X range should be harvested on import</text>
</svg>`);
}

function promptText(from, to) {
  return `Manual AXB inpaint source for ${from} -> ${to}.

Upload work-canvas.png to Kling, Photoshop, Midjourney, Firefly, or another editor.
Select only the X region between the A/B anchors and generate a believable panoramic transition.

The external tool does not need to preserve A/B perfectly. The repo will ignore external A/B pixels on import.
Only X may come from the external tool. A/B must always come from the original work canvas.

Visual target: coherent horizon, compatible lighting, compatible scale, no hard vertical split, and no text/watermark/foreground objects.`;
}

async function exportPair(options, pair) {
  const key = pairKey(pair.from, pair.to);
  const prepDir = path.join(resolveRepoPath(options.prepRoot), key);
  const prepManifestPath = path.join(prepDir, "manifest.json");
  if (!existsSync(prepManifestPath)) {
    throw new Error(`Missing prep manifest: ${repoRelative(prepManifestPath)}. Run npm run adapter:prep -- --all first.`);
  }

  const prepManifest = await readJson(prepManifestPath);
  const width = prepManifest.dimensions.width;
  const height = prepManifest.dimensions.height;
  const xStart = prepManifest.layout.xStart;
  const xEnd = prepManifest.layout.xEnd;
  const leftAnchorWidth = prepManifest.layout.leftAnchorWidth;
  const rightAnchorStart = prepManifest.layout.rightAnchorStart;

  const sourceCanvas = resolveRepoPath(prepManifest.outputPaths.adapterWorkCanvas);
  const sourceSoftMask = resolveRepoPath(prepManifest.outputPaths.adapterMask);
  const outputDir = path.join(resolveRepoPath(options.outputRoot), key);
  await mkdir(outputDir, { recursive: true });

  const workCanvasPath = path.join(outputDir, "work-canvas.png");
  const workCanvasGradientPath = path.join(outputDir, "work-canvas-gradient.png");
  const labeledPath = path.join(outputDir, "work-canvas-labeled.png");
  const hardMaskPath = path.join(outputDir, "mask-hard.png");
  const softMaskPath = path.join(outputDir, "mask-soft.png");
  const promptPath = path.join(outputDir, "prompt.txt");
  const manifestPath = path.join(outputDir, "manifest.json");

  await copyFile(sourceCanvas, workCanvasPath);
  await copyFile(sourceCanvas, workCanvasGradientPath);
  await copyFile(sourceSoftMask, softMaskPath);

  await sharp(sourceCanvas)
    .composite([{ input: labeledOverlaySvg(width, height, xStart, xEnd, pair.from, pair.to), left: 0, top: 0 }])
    .png()
    .toFile(labeledPath);

  await sharp(hardMaskSvg(width, height, xStart, xEnd)).greyscale().png().toFile(hardMaskPath);
  await writeFile(promptPath, `${promptText(pair.from, pair.to)}\n`);

  const manifest = {
    id: "manual-inpaint-v1",
    pairId: key,
    createdAt: new Date().toISOString(),
    fromScene: pair.from,
    toScene: pair.to,
    sourcePaths: {
      from: prepManifest.sourcePaths.from,
      to: prepManifest.sourcePaths.to,
      prepManifest: repoRelative(prepManifestPath),
      prepWorkCanvas: repoRelative(sourceCanvas),
      prepSoftMask: repoRelative(sourceSoftMask),
    },
    outputPaths: {
      directory: repoRelative(outputDir),
      workCanvas: repoRelative(workCanvasPath),
      workCanvasGradient: repoRelative(workCanvasGradientPath),
      workCanvasLabeled: repoRelative(labeledPath),
      maskHard: repoRelative(hardMaskPath),
      maskSoft: repoRelative(softMaskPath),
      prompt: repoRelative(promptPath),
      manifest: repoRelative(manifestPath),
    },
    canvas: {
      width,
      height,
      aspectRatio: prepManifest.dimensions.aspectRatio,
    },
    regions: {
      leftAnchor: { xStart: 0, xEnd: leftAnchorWidth, width: leftAnchorWidth },
      x: { xStart, xEnd, width: xEnd - xStart },
      rightAnchor: { xStart: rightAnchorStart, xEnd: width, width: width - rightAnchorStart },
    },
    expectedExternalOutputDimensions: { width, height },
    finalCandidateImportRules: {
      core: "Only X may come from the external tool. A/B must always come from the original work canvas. outside-X pixel diff must be 0.",
      externalOutputRole: "X source only; external A/B pixels are untrusted and discarded.",
      dimensionPolicy: "Importer rejects dimension mismatches unless --resize-to-canvas is explicitly passed.",
      compositeRule: "final = original work-canvas A/B + external-output X range",
      diffRule: "Compare final candidate against original work-canvas outside the X range. changedPixels must be 0.",
    },
    notes: [
      "Human-in-the-loop manual inpainting is the intended workflow, not a workaround.",
      "Use work-canvas.png for external tools; work-canvas-labeled.png is for human inspection only.",
      "mask-hard.png marks the strict X harvest region. mask-soft.png is retained only for future mask-aware tools.",
      "The final candidate must never trust external A/B pixels.",
    ],
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { outputDir, manifestPath, pair };
}

async function writeIndex(options, results) {
  const outputRoot = resolveRepoPath(options.outputRoot);
  await mkdir(outputRoot, { recursive: true });
  const indexPath = path.join(outputRoot, "index.json");
  const index = {
    id: "manual-inpaint-v1",
    createdAt: new Date().toISOString(),
    workflow:
      "repo export AXB -> human fills X externally -> repo imports X only -> repo composites original A/B + generated X -> repo verifies outside-X diff = 0",
    workbenches: results.map((result) => ({
      from: result.pair.from,
      to: result.pair.to,
      directory: repoRelative(result.outputDir),
      manifest: repoRelative(result.manifestPath),
    })),
  };
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return indexPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pairs = options.mode === "pair" ? [splitPair(options.pair)] : pairsForScenes(options.scenes);
  const results = [];

  for (const pair of pairs) {
    results.push(await exportPair(options, pair));
  }

  const indexPath = await writeIndex(options, results);
  console.log(`Exported ${results.length} manual inpaint workbench${results.length === 1 ? "" : "es"} under ${repoRelative(resolveRepoPath(options.outputRoot))}`);
  console.log(`- ${repoRelative(indexPath)}`);
  for (const result of results) {
    console.log(`- ${repoRelative(result.outputDir)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
