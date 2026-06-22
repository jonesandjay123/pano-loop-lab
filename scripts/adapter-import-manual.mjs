import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_MANUAL_ROOT = "docs/research/experiments/working/manual-inpaint";
const DEFAULT_STATUS = "partial";

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

  if (typeof args.pair !== "string") {
    throw new Error("Missing required --pair fromId__toId");
  }

  if (typeof args.input !== "string") {
    throw new Error("Missing required --input /path/to/external-output.png");
  }

  if (typeof args.id !== "string") {
    throw new Error("Missing required --id candidate-id");
  }

  return {
    pair: args.pair,
    input: resolveRepoPath(args.input),
    id: args.id,
    label: typeof args.label === "string" ? args.label : args.id,
    notes:
      typeof args.notes === "string"
        ? args.notes
        : "Manual inpaint import: external output was used as X source only; original A/B anchors were composited back in.",
    manualRoot: typeof args["manual-root"] === "string" ? args["manual-root"] : DEFAULT_MANUAL_ROOT,
    resizeToCanvas: args["resize-to-canvas"] === true,
    noActivate: args["no-activate"] === true,
    force: args.force === true,
    status: typeof args.status === "string" ? args.status : DEFAULT_STATUS,
  };
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function splitPair(pair) {
  const parts = pair.split("__");
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) {
    throw new Error(`Invalid --pair "${pair}". Expected fromId__toId.`);
  }
  return { from: parts[0], to: parts[1] };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function candidateDir(pair) {
  return path.join(REPO_ROOT, "public", "panos", "adapter-candidates", pair);
}

function researchDir(pair) {
  return path.join(REPO_ROOT, "docs", "research", "experiments", "working", "manual-inpaint-imports", pair);
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

async function imageRaw(filePath, width, height) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== width || info.height !== height || info.channels !== 4) {
    throw new Error(`Unexpected raw image shape for ${repoRelative(filePath)}.`);
  }

  return data;
}

function compositeXOnly(base, external, width, height, xStart, xEnd) {
  const output = Buffer.from(base);
  const rowBytes = width * 4;
  const xByteStart = xStart * 4;
  const xByteEnd = xEnd * 4;

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * rowBytes;
    external.copy(output, rowStart + xByteStart, rowStart + xByteStart, rowStart + xByteEnd);
  }

  return output;
}

function diffOutsideX(base, final, width, height, xStart, xEnd) {
  let changedPixels = 0;
  let changedValues = 0;
  let maxAbsDiff = 0;
  let sumAbsDiff = 0;
  let comparedValues = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= xStart && x < xEnd) continue;

      const offset = (y * width + x) * 4;
      let pixelChanged = false;
      for (let c = 0; c < 4; c += 1) {
        const diff = Math.abs(final[offset + c] - base[offset + c]);
        comparedValues += 1;
        sumAbsDiff += diff;
        if (diff > 0) {
          changedValues += 1;
          pixelChanged = true;
          if (diff > maxAbsDiff) maxAbsDiff = diff;
        }
      }
      if (pixelChanged) changedPixels += 1;
    }
  }

  return {
    outsideXChangedPixels: changedPixels,
    outsideXChangedValues: changedValues,
    outsideXMaxAbsDiff: maxAbsDiff,
    outsideXMeanAbsDiff: comparedValues > 0 ? sumAbsDiff / comparedValues : 0,
    comparedOutsideXPixels: (width - (xEnd - xStart)) * height,
    comparedOutsideXValues: comparedValues,
  };
}

function contactSheetSvg(width, height, labels) {
  const labelHeight = 74;
  const panelHeight = height + labelHeight;
  const sheetWidth = width * labels.length;
  const sheetHeight = panelHeight;
  const labelRects = labels
    .map((label, index) => {
      const x = index * width;
      return `
  <rect x="${x}" y="0" width="${width}" height="${labelHeight}" fill="#101018"/>
  <text x="${x + 32}" y="48" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white">${label}</text>`;
    })
    .join("");

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${sheetWidth}" height="${sheetHeight}" viewBox="0 0 ${sheetWidth} ${sheetHeight}">
  <rect width="${sheetWidth}" height="${sheetHeight}" fill="#101018"/>
  ${labelRects}
</svg>`);
}

async function writeReviewArtifacts(paths, manifest, finalPath, externalNormalizedPath) {
  const width = manifest.canvas.width;
  const height = manifest.canvas.height;
  const xStart = manifest.regions.x.xStart;
  const xEnd = manifest.regions.x.xEnd;
  const closeupWidth = Math.min(640, width);
  const leftCloseupLeft = Math.max(0, xStart - Math.floor(closeupWidth / 2));
  const rightCloseupLeft = Math.min(width - closeupWidth, xEnd - Math.floor(closeupWidth / 2));

  await mkdir(paths.reviewDir, { recursive: true });
  await copyFile(resolveRepoPath(manifest.outputPaths.workCanvas), path.join(paths.reviewDir, "original-work-canvas.png"));
  await copyFile(externalNormalizedPath, path.join(paths.reviewDir, "external-output.png"));
  await copyFile(finalPath, path.join(paths.reviewDir, "final-composited-candidate.png"));

  await sharp(finalPath)
    .extract({ left: leftCloseupLeft, top: 0, width: closeupWidth, height })
    .png()
    .toFile(path.join(paths.reviewDir, "a-x-boundary-closeup.png"));
  await sharp(finalPath)
    .extract({ left: rightCloseupLeft, top: 0, width: closeupWidth, height })
    .png()
    .toFile(path.join(paths.reviewDir, "x-b-boundary-closeup.png"));

  const thumbWidth = 784;
  const thumbHeight = Math.round((height / width) * thumbWidth);
  const originalThumb = await sharp(resolveRepoPath(manifest.outputPaths.workCanvas)).resize({ width: thumbWidth }).png().toBuffer();
  const externalThumb = await sharp(externalNormalizedPath).resize({ width: thumbWidth }).png().toBuffer();
  const finalThumb = await sharp(finalPath).resize({ width: thumbWidth }).png().toBuffer();
  const labelHeight = 74;

  await sharp(contactSheetSvg(thumbWidth, thumbHeight, ["original work canvas", "external output", "final X-only composite"]))
    .composite([
      { input: originalThumb, left: 0, top: labelHeight },
      { input: externalThumb, left: thumbWidth, top: labelHeight },
      { input: finalThumb, left: thumbWidth * 2, top: labelHeight },
    ])
    .png()
    .toFile(path.join(paths.reviewDir, "comparison-contact-sheet.png"));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pairParts = splitPair(options.pair);
  if (!existsSync(options.input)) {
    throw new Error(`Missing external output: ${options.input}`);
  }

  const manifestPath = path.join(resolveRepoPath(options.manualRoot), options.pair, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing manual manifest: ${repoRelative(manifestPath)}. Run npm run adapter:export-manual first.`);
  }

  const manifest = await readJson(manifestPath);
  const width = manifest.canvas.width;
  const height = manifest.canvas.height;
  const xStart = manifest.regions.x.xStart;
  const xEnd = manifest.regions.x.xEnd;

  const sourceMeta = await sharp(options.input).metadata();
  const dimensionsMatch = sourceMeta.width === width && sourceMeta.height === height;
  if (!dimensionsMatch && !options.resizeToCanvas) {
    throw new Error(
      `External output is ${sourceMeta.width}x${sourceMeta.height}, expected ${width}x${height}. ` +
        "Pass --resize-to-canvas to resize explicitly.",
    );
  }

  const outputDir = candidateDir(options.pair);
  const outputPath = path.join(outputDir, `${options.id}.png`);
  const researchOutputDir = researchDir(options.pair);
  const researchOutputPath = path.join(researchOutputDir, `${options.id}.png`);
  const externalNormalizedPath = path.join(researchOutputDir, `${options.id}-external-normalized.png`);
  const reviewDir = path.join(researchOutputDir, "review", options.id);
  const diffReportPath = path.join(reviewDir, "diff-report.json");

  if ((existsSync(outputPath) || existsSync(researchOutputPath)) && !options.force) {
    throw new Error(`Candidate ${options.id} already exists. Pass --force to replace it.`);
  }

  await mkdir(outputDir, { recursive: true });
  await mkdir(researchOutputDir, { recursive: true });

  if (dimensionsMatch) {
    await sharp(options.input).png().toFile(externalNormalizedPath);
  } else {
    await sharp(options.input).resize({ width, height, fit: "fill" }).png().toFile(externalNormalizedPath);
  }

  const workCanvasPath = resolveRepoPath(manifest.outputPaths.workCanvas);
  const base = await imageRaw(workCanvasPath, width, height);
  const external = await imageRaw(externalNormalizedPath, width, height);
  const final = compositeXOnly(base, external, width, height, xStart, xEnd);

  await sharp(final, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
  await copyFile(outputPath, researchOutputPath);

  const finalRaw = await imageRaw(outputPath, width, height);
  const diff = diffOutsideX(base, finalRaw, width, height, xStart, xEnd);
  const diffReport = {
    id: options.id,
    pairId: options.pair,
    createdAt: new Date().toISOString(),
    rule: "Only X may come from the external tool. A/B must always come from the original work canvas.",
    sourceInput: {
      path: repoRelative(options.input),
      width: sourceMeta.width,
      height: sourceMeta.height,
      resizedToCanvas: !dimensionsMatch,
    },
    canvas: { width, height },
    xRange: { xStart, xEnd, width: xEnd - xStart },
    outsideXDiff: diff,
    passed: diff.outsideXChangedPixels === 0 && diff.outsideXMaxAbsDiff === 0,
  };

  await writeReviewArtifacts({ reviewDir }, manifest, outputPath, externalNormalizedPath);
  await writeFile(diffReportPath, `${JSON.stringify(diffReport, null, 2)}\n`);

  if (!diffReport.passed) {
    throw new Error(`outside-X diff failed for ${options.id}; see ${repoRelative(diffReportPath)}`);
  }

  const jsonPath = path.join(outputDir, "candidates.json");
  const data = await readCandidateJson(jsonPath, pairParts.from, pairParts.to);
  data.updatedAt = new Date().toISOString();
  data.sourcePrep = {
    workCanvas: manifest.outputPaths.workCanvas,
    mask: manifest.outputPaths.maskHard,
    manualManifest: repoRelative(manifestPath),
  };
  if (!options.noActivate) {
    data.activeForReview = options.id;
  }

  const entry = {
    id: options.id,
    label: options.label,
    localPath: repoRelative(outputPath),
    researchCopy: repoRelative(researchOutputPath),
    status: options.status,
    method: "manual-inpaint-x-only-import",
    notes: options.notes,
    reviewNotes:
      "External output was treated as X source only. Original A/B anchors were composited back from the manual work canvas; outside-X diff is verified at 0.",
    reviewReport: repoRelative(diffReportPath),
    reviewArtifacts: {
      directory: repoRelative(reviewDir),
      originalWorkCanvas: repoRelative(path.join(reviewDir, "original-work-canvas.png")),
      externalOutput: repoRelative(path.join(reviewDir, "external-output.png")),
      finalCompositedCandidate: repoRelative(path.join(reviewDir, "final-composited-candidate.png")),
      aXBoundaryCloseup: repoRelative(path.join(reviewDir, "a-x-boundary-closeup.png")),
      xBBoundaryCloseup: repoRelative(path.join(reviewDir, "x-b-boundary-closeup.png")),
      comparisonContactSheet: repoRelative(path.join(reviewDir, "comparison-contact-sheet.png")),
    },
    sourceImport: {
      path: repoRelative(options.input),
      sourceWidth: sourceMeta.width,
      sourceHeight: sourceMeta.height,
      importedWidth: width,
      importedHeight: height,
      resizedToPrepDimensions: !dimensionsMatch,
      xOnlyHarvest: true,
      discardedExternalAnchors: true,
    },
    reviewSummary: {
      leftOuterAnchorMaxDiff: 0,
      rightOuterAnchorMaxDiff: 0,
      internalJoinVerdict: "Manual X-only import; exact A/B anchors restored. Inspect A-X and X-B at blend=0.",
    },
  };

  const existingIndex = data.candidates.findIndex((candidate) => candidate.id === options.id);
  if (existingIndex >= 0) {
    data.candidates[existingIndex] = entry;
  } else {
    data.candidates.push(entry);
  }

  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  await writeFile(path.join(researchOutputDir, "candidates.json"), `${JSON.stringify(data, null, 2)}\n`);

  await import("./adapter-candidates-generate.mjs");

  console.log(`Imported manual X-only candidate ${options.id}`);
  console.log(`- ${repoRelative(outputPath)}`);
  console.log(`- outside-X changed pixels: ${diff.outsideXChangedPixels}`);
  console.log(`- outside-X max diff: ${diff.outsideXMaxAbsDiff}`);
  console.log(`- ${repoRelative(diffReportPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
