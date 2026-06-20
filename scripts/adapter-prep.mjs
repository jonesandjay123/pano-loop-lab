import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_SCENES = ["dawn-valley", "dusk-ridge", "moonlit-tidelands"];
const DEFAULT_WIDTH = 3136;
const DEFAULT_HEIGHT = 1344;
const DEFAULT_RATIO = "1:4:1";
const DEFAULT_OVERMASK_PX = 32;
const DEFAULT_PREFILL = "gradient";
const DEFAULT_OUTPUT_ROOT = "docs/research/experiments/working/010-axb-prep-1-4-1";
const PREFILL_MODES = new Set(["gradient", "black", "white", "gray"]);

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

  const scenes = typeof args.scenes === "string" ? args.scenes.split(",").map((id) => id.trim()).filter(Boolean) : [];
  const hasPair = typeof args.from === "string" || typeof args.to === "string";
  const batchMode = args.all === true || scenes.length > 0 || !hasPair;

  if (hasPair && (typeof args.from !== "string" || typeof args.to !== "string")) {
    throw new Error("Use both --from and --to for single-pair prep, or use --all / --scenes for batch prep.");
  }

  if (batchMode && hasPair) {
    throw new Error("Use either batch mode (--all / --scenes) or single-pair mode (--from / --to), not both.");
  }

  const width = parsePositiveInteger(args.width, DEFAULT_WIDTH, "--width");
  const height = parsePositiveInteger(args.height, DEFAULT_HEIGHT, "--height");
  const ratio = typeof args.ratio === "string" ? args.ratio : DEFAULT_RATIO;
  const prefill = typeof args.prefill === "string" ? args.prefill : DEFAULT_PREFILL;
  const overmaskPx = parseNonNegativeInteger(args["overmask-px"], DEFAULT_OVERMASK_PX, "--overmask-px");

  if (!PREFILL_MODES.has(prefill)) {
    throw new Error(`Invalid --prefill "${prefill}". Use one of: ${Array.from(PREFILL_MODES).join(", ")}.`);
  }

  const layout = resolveLayout(width, ratio);

  if (overmaskPx > layout.anchorWidth) {
    throw new Error(`--overmask-px (${overmaskPx}) cannot exceed anchor width (${layout.anchorWidth}).`);
  }

  return {
    mode: batchMode ? "batch" : "pair",
    fromSceneId: args.from,
    toSceneId: args.to,
    scenes: scenes.length > 0 ? scenes : DEFAULT_SCENES,
    outputRoot: typeof args.out === "string" ? args.out : DEFAULT_OUTPUT_ROOT,
    recipeId: typeof args.id === "string" ? args.id : "axb-prep-v1",
    width,
    height,
    ratio,
    prefill,
    overmaskPx,
    layout,
  };
}

function parsePositiveInteger(value, fallback, label) {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

function parseNonNegativeInteger(value, fallback, label) {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return parsed;
}

function resolveLayout(width, ratioText) {
  const parts = ratioText.split(":").map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part) || part <= 0)) {
    throw new Error(`Invalid --ratio "${ratioText}". Use a format like 1:4:1.`);
  }

  const [left, middle, right] = parts;
  if (left !== right) {
    throw new Error("This prep script currently expects symmetrical anchors, e.g. 1:4:1.");
  }

  const unit = width / (left + middle + right);
  const anchorWidth = Math.round(unit * left);
  const middleWidth = width - anchorWidth * 2;

  if (anchorWidth <= 0 || middleWidth <= 0) {
    throw new Error(`Ratio ${ratioText} does not leave positive anchor and X widths at ${width}px.`);
  }

  return {
    leftRatio: left,
    middleRatio: middle,
    rightRatio: right,
    anchorWidth,
    middleWidth,
  };
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
}

function scenePath(sceneId) {
  return path.join(REPO_ROOT, "public", "panos", `${sceneId}.jpg`);
}

function pairsForScenes(scenes) {
  if (scenes.length < 2) {
    throw new Error("Batch prep needs at least two scene ids.");
  }

  return scenes.map((from, index) => ({
    fromSceneId: from,
    toSceneId: scenes[(index + 1) % scenes.length],
  }));
}

async function normalizedSceneBuffer(inputPath, targetHeight) {
  const sourceMeta = await sharp(inputPath).metadata();
  const resized = await sharp(inputPath).resize({ height: targetHeight }).toBuffer();
  const resizedMeta = await sharp(resized).metadata();

  return {
    buffer: resized,
    sourceWidth: sourceMeta.width,
    sourceHeight: sourceMeta.height,
    resizedWidth: resizedMeta.width,
    resizedHeight: resizedMeta.height,
  };
}

async function cropEdge(inputPath, side, targetHeight, cropWidth) {
  const normalized = await normalizedSceneBuffer(inputPath, targetHeight);

  if (!normalized.resizedWidth || normalized.resizedWidth < cropWidth) {
    throw new Error(
      `${repoRelative(inputPath)} is too narrow after height normalization: ` +
        `${normalized.resizedWidth}px < ${cropWidth}px.`,
    );
  }

  const left = side === "right" ? normalized.resizedWidth - cropWidth : 0;
  const buffer = await sharp(normalized.buffer)
    .extract({ left, top: 0, width: cropWidth, height: targetHeight })
    .png()
    .toBuffer();

  return {
    buffer,
    sourceWidth: normalized.sourceWidth,
    sourceHeight: normalized.sourceHeight,
    resizedWidth: normalized.resizedWidth,
    resizedHeight: normalized.resizedHeight,
    crop: { left, top: 0, width: cropWidth, height: targetHeight },
  };
}

async function edgeMean(buffer, side) {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 16;
  const height = metadata.height ?? DEFAULT_HEIGHT;
  const stripWidth = Math.min(16, width);
  const left = side === "right" ? width - stripWidth : 0;
  const stats = await sharp(buffer).extract({ left, top: 0, width: stripWidth, height }).stats();

  const [r, g, b] = stats.channels.slice(0, 3).map((channel) => Math.round(channel.mean));
  return { r, g, b };
}

function rgb({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function solidColorForMode(mode, leftColor, rightColor) {
  if (mode === "black") return { r: 0, g: 0, b: 0 };
  if (mode === "white") return { r: 255, g: 255, b: 255 };
  if (mode === "gray") return { r: 128, g: 128, b: 128 };
  return {
    r: Math.round((leftColor.r + rightColor.r) / 2),
    g: Math.round((leftColor.g + rightColor.g) / 2),
    b: Math.round((leftColor.b + rightColor.b) / 2),
  };
}

function workCanvasFillSvg(width, height, leftColor, rightColor, prefillMode) {
  const midColor = solidColorForMode(prefillMode, leftColor, rightColor);
  const fill =
    prefillMode === "gradient"
      ? `url(#transition)`
      : rgb(midColor);

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="transition" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="${rgb(leftColor)}"/>
      <stop offset="50%" stop-color="${rgb(midColor)}"/>
      <stop offset="100%" stop-color="${rgb(rightColor)}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${fill}"/>
</svg>`);
}

function maskSvg(width, height, anchorWidth, overmaskPx) {
  const leftBlackEnd = ((anchorWidth - overmaskPx) / width) * 100;
  const leftWhiteStart = (anchorWidth / width) * 100;
  const rightWhiteEnd = ((width - anchorWidth) / width) * 100;
  const rightBlackStart = ((width - anchorWidth + overmaskPx) / width) * 100;

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="mask" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="black"/>
      <stop offset="${leftBlackEnd.toFixed(3)}%" stop-color="black"/>
      <stop offset="${leftWhiteStart.toFixed(3)}%" stop-color="white"/>
      <stop offset="${rightWhiteEnd.toFixed(3)}%" stop-color="white"/>
      <stop offset="${rightBlackStart.toFixed(3)}%" stop-color="black"/>
      <stop offset="100%" stop-color="black"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#mask)"/>
</svg>`);
}

function promptText(fromSceneId, toSceneId) {
  return `Pair-specific panoramic transition adapter for ${fromSceneId} to ${toSceneId}.
The provided work canvas is [left real edge anchor][editable X transition region][right real edge anchor].
Only the X region and the slight white overmask blend zones should be regenerated by the inpainting backend.
Use the left anchor as the exact outgoing edge of ${fromSceneId} and the right anchor as the exact incoming edge of ${toSceneId}.
Generate a wide natural transition world between them with coherent horizon, compatible lighting, compatible scale, and no visible split-screen composition.
The result should feel like one continuous panoramic journey, not two wallpapers taped together.`;
}

function negativePromptText() {
  return `hard vertical seam line, split-screen image, pasted collage, abrupt horizon step, mismatched perspective, mismatched scale, black empty center, white empty center, transparent area, text, watermark, people, buildings, vehicles`;
}

async function preparePair(options, pair) {
  const { fromSceneId, toSceneId } = pair;
  const fromPath = scenePath(fromSceneId);
  const toPath = scenePath(toSceneId);

  if (!existsSync(fromPath)) {
    throw new Error(`Missing source scene: ${repoRelative(fromPath)}`);
  }

  if (!existsSync(toPath)) {
    throw new Error(`Missing source scene: ${repoRelative(toPath)}`);
  }

  const outputRoot = resolveRepoPath(options.outputRoot);
  const outputDir = path.join(outputRoot, `${fromSceneId}__${toSceneId}`);
  await mkdir(outputDir, { recursive: true });

  const { width, height, layout, overmaskPx, prefill } = options;
  const { anchorWidth, middleWidth } = layout;
  const fromCrop = await cropEdge(fromPath, "right", height, anchorWidth);
  const toCrop = await cropEdge(toPath, "left", height, anchorWidth);

  const fromCropPath = path.join(outputDir, `${fromSceneId}-right-anchor.png`);
  const toCropPath = path.join(outputDir, `${toSceneId}-left-anchor.png`);
  const workCanvasPath = path.join(outputDir, "adapter-work-canvas.png");
  const maskPath = path.join(outputDir, "adapter-mask.png");
  const promptPath = path.join(outputDir, "prompt.txt");
  const negativePromptPath = path.join(outputDir, "negative-prompt.txt");
  const manifestPath = path.join(outputDir, "manifest.json");

  await writeFile(fromCropPath, fromCrop.buffer);
  await writeFile(toCropPath, toCrop.buffer);

  const leftEdgeColor = await edgeMean(fromCrop.buffer, "right");
  const rightEdgeColor = await edgeMean(toCrop.buffer, "left");
  const prefillBuffer = await sharp(workCanvasFillSvg(width, height, leftEdgeColor, rightEdgeColor, prefill))
    .png()
    .toBuffer();

  await sharp(prefillBuffer)
    .composite([
      { input: fromCrop.buffer, left: 0, top: 0 },
      { input: toCrop.buffer, left: width - anchorWidth, top: 0 },
    ])
    .png()
    .toFile(workCanvasPath);

  await sharp(maskSvg(width, height, anchorWidth, overmaskPx)).greyscale().png().toFile(maskPath);

  await writeFile(promptPath, `${promptText(fromSceneId, toSceneId)}\n`);
  await writeFile(negativePromptPath, `${negativePromptText()}\n`);

  const outputs = {
    manifest: manifestPath,
    prompt: promptPath,
    negativePrompt: negativePromptPath,
    fromRightAnchor: fromCropPath,
    toLeftAnchor: toCropPath,
    adapterWorkCanvas: workCanvasPath,
    adapterMask: maskPath,
  };

  const manifest = {
    id: options.recipeId,
    boundary: {
      from: fromSceneId,
      to: toSceneId,
    },
    createdAt: new Date().toISOString(),
    sourcePaths: {
      from: repoRelative(fromPath),
      to: repoRelative(toPath),
    },
    outputPaths: Object.fromEntries(Object.entries(outputs).map(([key, value]) => [key, repoRelative(value)])),
    dimensions: {
      width,
      height,
      aspectRatio: `${width}:${height}`,
    },
    layout: {
      ratio: options.ratio,
      leftAnchorWidth: anchorWidth,
      xRegionWidth: middleWidth,
      rightAnchorWidth: anchorWidth,
      xStart: anchorWidth,
      xEnd: width - anchorWidth,
      rightAnchorStart: width - anchorWidth,
      overlapWidth: anchorWidth,
      xRegionBounds: {
        left: anchorWidth,
        right: width - anchorWidth,
        width: middleWidth,
      },
    },
    maskStrategy: {
      name: "center-x-with-anchor-overmask",
      meaning: "white = editable/regenerate, black = preserve",
      overmaskPxIntoEachAnchor: overmaskPx,
      hardPreservePixelsPerOuterAnchor: anchorWidth - overmaskPx,
    },
    prefillStrategy: {
      name: prefill === "gradient" ? "edge-color-gradient" : `solid-${prefill}`,
      description:
        "The work canvas is opaque. X is initialized with low-information pixels; the separate mask defines what an inpainting backend may edit.",
      leftInnerEdgeColor: leftEdgeColor,
      rightInnerEdgeColor: rightEdgeColor,
    },
    cropPixels: {
      fromRightAnchor: fromCrop.crop,
      toLeftAnchor: toCrop.crop,
    },
    sourceImageInfo: {
      from: {
        sourceWidth: fromCrop.sourceWidth,
        sourceHeight: fromCrop.sourceHeight,
        resizedWidth: fromCrop.resizedWidth,
        resizedHeight: fromCrop.resizedHeight,
      },
      to: {
        sourceWidth: toCrop.sourceWidth,
        sourceHeight: toCrop.sourceHeight,
        resizedWidth: toCrop.resizedWidth,
        resizedHeight: toCrop.resizedHeight,
      },
    },
    placementContract: {
      name: "full-axb-overlap-plus-x-only-adoption",
      adapterCanvas: "[A.right anchor][X transition][B.left anchor]",
      leftAnchor:
        "The left anchor is copied from the right edge of the from plate and is intended to overlap that same source edge during placement/review.",
      rightAnchor:
        "The right anchor is copied from the left edge of the to plate and is intended to overlap that same source edge during placement/review.",
      adoption:
        "AI-generated candidates must not be trusted to preserve anchors. Final adoption should hard-composite original anchors back into the candidate or extract X-only material before final placement.",
      sourcePlateWidthPolicy:
        "Source plates may be normal, wide, or ultra-wide. The script normalizes by height and crops only the edge anchors; source image width is not locked as long as the normalized image is at least one anchor wide.",
      overlapWidth: anchorWidth,
    },
    notes: [
      "No generation backend was called by this prep script.",
      "No final adapter candidate was written to public/panos/adapters.",
      "A/B anchors are context and placement sockets; the X region is the actual transition adapter target.",
      "The AXB prep canvas width is fixed for generation/export convenience, but source plates are not width-locked.",
    ],
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { outputDir, manifestPath, pair };
}

async function writeBatchIndex(options, results) {
  const outputRoot = resolveRepoPath(options.outputRoot);
  await mkdir(outputRoot, { recursive: true });

  const indexPath = path.join(outputRoot, "index.json");
  const index = {
    id: options.recipeId,
    createdAt: new Date().toISOString(),
    mode: options.mode,
    scenes: options.scenes,
    defaults: {
      width: options.width,
      height: options.height,
      ratio: options.ratio,
      anchorWidth: options.layout.anchorWidth,
      xRegionWidth: options.layout.middleWidth,
      overmaskPx: options.overmaskPx,
      prefill: options.prefill,
    },
    workbenches: results.map((result) => ({
      from: result.pair.fromSceneId,
      to: result.pair.toSceneId,
      directory: repoRelative(result.outputDir),
      manifest: repoRelative(result.manifestPath),
    })),
  };

  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return indexPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pairs =
    options.mode === "pair"
      ? [{ fromSceneId: options.fromSceneId, toSceneId: options.toSceneId }]
      : pairsForScenes(options.scenes);

  const results = [];
  for (const pair of pairs) {
    results.push(await preparePair(options, pair));
  }

  const indexPath = await writeBatchIndex(options, results);

  console.log(`Prepared ${results.length} AXB workbench${results.length === 1 ? "" : "es"} under ${repoRelative(resolveRepoPath(options.outputRoot))}`);
  console.log(`- ${repoRelative(indexPath)}`);
  for (const result of results) {
    console.log(`- ${repoRelative(result.outputDir)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
