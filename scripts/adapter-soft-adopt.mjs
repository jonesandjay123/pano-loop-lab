import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_FROM = "dawn-valley";
const DEFAULT_TO = "dusk-ridge";
const DEFAULT_SOURCE_ID = "gpt-axb-01";
const DEFAULT_FEATHER_PX = 128;
const CURVES = ["linear", "smoothstep", "cosine"];

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

  const featherPx = Number.parseInt(args["feather-px"] ?? `${DEFAULT_FEATHER_PX}`, 10);
  if (!Number.isFinite(featherPx) || featherPx < 1) {
    throw new Error("--feather-px must be a positive integer");
  }

  const sourceId = typeof args.source === "string" ? args.source : DEFAULT_SOURCE_ID;
  const curve = typeof args.curve === "string" ? args.curve : "smoothstep";
  if (!CURVES.includes(curve)) {
    throw new Error(`--curve must be one of: ${CURVES.join(", ")}`);
  }
  const id = typeof args.id === "string" ? args.id : `${sourceId}-${curve}${featherPx}`;

  return {
    from: typeof args.from === "string" ? args.from : DEFAULT_FROM,
    to: typeof args.to === "string" ? args.to : DEFAULT_TO,
    sourceId,
    id,
    label: typeof args.label === "string" ? args.label : `${sourceId.toUpperCase()} soft ${featherPx}`,
    featherPx,
    curve,
    force: args.force === true,
  };
}

function pairKey(from, to) {
  return `${from}__${to}`;
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function prepDir(from, to) {
  return path.join(REPO_ROOT, "public", "panos", "adapter-prep", pairKey(from, to));
}

function candidateDir(from, to) {
  return path.join(REPO_ROOT, "public", "panos", "adapter-candidates", pairKey(from, to));
}

function researchDir(from, to) {
  return path.join(
    REPO_ROOT,
    "docs",
    "research",
    "experiments",
    "working",
    "012-soft-anchor-adoption",
    pairKey(from, to),
  );
}

function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function curveWeight(value, curve) {
  const clamped = Math.max(0, Math.min(1, value));
  if (curve === "linear") {
    return clamped;
  }
  if (curve === "cosine") {
    return 0.5 - Math.cos(clamped * Math.PI) / 2;
  }
  return smoothstep(clamped);
}

async function rawRgb(filePath, width, height) {
  return sharp(filePath).resize({ width, height, fit: "fill" }).removeAlpha().raw().toBuffer();
}

function diffStats(candidate, reference) {
  let max = 0;
  let sum = 0;
  for (let index = 0; index < candidate.length; index += 1) {
    const diff = Math.abs(candidate[index] - reference[index]);
    sum += diff;
    if (diff > max) {
      max = diff;
    }
  }
  return { maxAbsDiff: max, meanAbsDiff: Number((sum / candidate.length).toFixed(6)) };
}

function lineSvg(width, height, x) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect x="${x}" y="0" width="3" height="${height}" fill="#ff00ff"/></svg>`,
  );
}

function labelSvg(text, width) {
  return Buffer.from(
    `<svg width="${width}" height="42" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="42" fill="rgba(0,0,0,0.60)"/><text x="16" y="28" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${text}</text></svg>`,
  );
}

async function rightPlateCrop(filePath, width, height, cropWidth) {
  const meta = await sharp(filePath).metadata();
  const resizedWidth = Math.round((meta.width / meta.height) * height);
  return sharp(filePath)
    .resize({ height })
    .extract({ left: resizedWidth - cropWidth, top: 0, width: cropWidth, height })
    .png()
    .toBuffer();
}

async function leftPlateCrop(filePath, height, cropWidth) {
  return sharp(filePath)
    .resize({ height })
    .extract({ left: 0, top: 0, width: cropWidth, height })
    .png()
    .toBuffer();
}

async function writeReviewJoins(options, manifest, outputPath, reviewDirPath) {
  const { from, to, id } = options;
  const { width, height } = manifest.dimensions;
  const anchorWidth = manifest.layout.leftAnchorWidth;
  const rightAnchorStart = manifest.layout.rightAnchorStart;
  const joinWidth = Math.min(anchorWidth, 523);
  const fromPlate = path.join(REPO_ROOT, "public", "panos", `${from}.jpg`);
  const toPlate = path.join(REPO_ROOT, "public", "panos", `${to}.jpg`);

  async function writeJoin(name, leftBuffer, rightBuffer, label) {
    await sharp({ create: { width: joinWidth * 2, height, channels: 4, background: "#111318" } })
      .composite([
        { input: leftBuffer, left: 0, top: 0 },
        { input: rightBuffer, left: joinWidth, top: 0 },
        { input: lineSvg(joinWidth * 2, height, joinWidth), left: 0, top: 0 },
        { input: labelSvg(label, joinWidth * 2), left: 0, top: 0 },
      ])
      .png()
      .toFile(path.join(reviewDirPath, name));
  }

  await writeJoin(
    `${id}-external-left-join.png`,
    await rightPlateCrop(fromPlate, width, height, joinWidth),
    await sharp(outputPath).extract({ left: 0, top: 0, width: joinWidth, height }).png().toBuffer(),
    `${id}: A plate -> adapter left`,
  );
  await writeJoin(
    `${id}-external-right-join.png`,
    await sharp(outputPath).extract({ left: width - joinWidth, top: 0, width: joinWidth, height }).png().toBuffer(),
    await leftPlateCrop(toPlate, height, joinWidth),
    `${id}: adapter right -> B plate`,
  );

  const leftInternalWidth = anchorWidth + joinWidth;
  await sharp(outputPath)
    .extract({ left: 0, top: 0, width: leftInternalWidth, height })
    .composite([
      { input: lineSvg(leftInternalWidth, height, anchorWidth), left: 0, top: 0 },
      { input: labelSvg(`${id}: left anchor -> X`, leftInternalWidth), left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(reviewDirPath, `${id}-internal-left-anchor-x.png`));

  const rightInternalWidth = anchorWidth + joinWidth;
  await sharp(outputPath)
    .extract({ left: rightAnchorStart - joinWidth, top: 0, width: rightInternalWidth, height })
    .composite([
      { input: lineSvg(rightInternalWidth, height, joinWidth), left: 0, top: 0 },
      { input: labelSvg(`${id}: X -> right anchor`, rightInternalWidth), left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(reviewDirPath, `${id}-internal-right-x-anchor.png`));
}

async function readCandidates(jsonPath, from, to) {
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
  const prepDirPath = prepDir(options.from, options.to);
  const candidateDirPath = candidateDir(options.from, options.to);
  const researchDirPath = researchDir(options.from, options.to);
  const reviewDirPath = path.join(researchDirPath, "review");
  const manifestPath = path.join(prepDirPath, "manifest.json");
  const sourcePath = path.join(candidateDirPath, `${options.sourceId}.png`);
  const outputPath = path.join(candidateDirPath, `${options.id}.png`);
  const researchOutputPath = path.join(researchDirPath, `${options.id}.png`);

  if (!existsSync(manifestPath)) {
    throw new Error(`Missing prep manifest: ${repoRelative(manifestPath)}`);
  }
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing source candidate: ${repoRelative(sourcePath)}`);
  }
  if ((existsSync(outputPath) || existsSync(researchOutputPath)) && !options.force) {
    throw new Error(`Candidate ${options.id} already exists. Pass --force to replace it.`);
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const { width, height } = manifest.dimensions;
  const leftAnchorWidth = manifest.layout.leftAnchorWidth;
  const xStart = manifest.layout.xStart;
  const xRegionWidth = manifest.layout.xRegionWidth;
  const rightAnchorStart = manifest.layout.rightAnchorStart;
  const featherPx = Math.min(options.featherPx, Math.floor(xRegionWidth / 2));

  await mkdir(candidateDirPath, { recursive: true });
  await mkdir(researchDirPath, { recursive: true });
  await mkdir(reviewDirPath, { recursive: true });

  const workCanvasPath = path.join(REPO_ROOT, manifest.outputPaths.adapterWorkCanvas);
  const leftAnchorPath = path.join(REPO_ROOT, manifest.outputPaths.fromRightAnchor);
  const rightAnchorPath = path.join(REPO_ROOT, manifest.outputPaths.toLeftAnchor);
  const source = await rawRgb(sourcePath, width, height);
  const work = await rawRgb(workCanvasPath, width, height);
  const leftAnchor = await sharp(leftAnchorPath).removeAlpha().raw().toBuffer();
  const rightAnchor = await sharp(rightAnchorPath).removeAlpha().raw().toBuffer();
  const out = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outputIndex = (y * width + x) * 3;
      if (x < leftAnchorWidth) {
        const anchorIndex = (y * leftAnchorWidth + x) * 3;
        out[outputIndex] = leftAnchor[anchorIndex];
        out[outputIndex + 1] = leftAnchor[anchorIndex + 1];
        out[outputIndex + 2] = leftAnchor[anchorIndex + 2];
        continue;
      }

      if (x >= rightAnchorStart) {
        const anchorX = x - rightAnchorStart;
        const anchorIndex = (y * leftAnchorWidth + anchorX) * 3;
        out[outputIndex] = rightAnchor[anchorIndex];
        out[outputIndex + 1] = rightAnchor[anchorIndex + 1];
        out[outputIndex + 2] = rightAnchor[anchorIndex + 2];
        continue;
      }

      const xOffset = x - xStart;
      const leftWeight = xOffset < featherPx ? curveWeight(xOffset / featherPx, options.curve) : 1;
      const rightDistance = rightAnchorStart - x - 1;
      const rightWeight = rightDistance < featherPx ? curveWeight(rightDistance / featherPx, options.curve) : 1;
      const sourceWeight = Math.min(leftWeight, rightWeight);
      const workWeight = 1 - sourceWeight;

      out[outputIndex] = Math.round(source[outputIndex] * sourceWeight + work[outputIndex] * workWeight);
      out[outputIndex + 1] = Math.round(source[outputIndex + 1] * sourceWeight + work[outputIndex + 1] * workWeight);
      out[outputIndex + 2] = Math.round(source[outputIndex + 2] * sourceWeight + work[outputIndex + 2] * workWeight);
    }
  }

  await sharp(out, { raw: { width, height, channels: 3 } }).png().toFile(outputPath);
  await sharp(outputPath).toFile(researchOutputPath);

  const leftOut = await sharp(outputPath).extract({ left: 0, top: 0, width: leftAnchorWidth, height }).removeAlpha().raw().toBuffer();
  const rightOut = await sharp(outputPath)
    .extract({ left: rightAnchorStart, top: 0, width: leftAnchorWidth, height })
    .removeAlpha()
    .raw()
    .toBuffer();
  const report = {
    createdAt: new Date().toISOString(),
    id: options.id,
    sourceCandidate: options.sourceId,
    method: "strict-anchor-x-only-soft-adoption",
    dimensions: { width, height },
    layout: {
      leftAnchorWidth,
      xStart,
      xRegionWidth,
      rightAnchorStart,
      featherPx,
      curve: options.curve,
    },
    invariant: "A/B anchor pixels are copied from the original prep anchors. Only X-region pixels are blended.",
    outerAnchorDiff: {
      left: diffStats(leftOut, leftAnchor),
      right: diffStats(rightOut, rightAnchor),
    },
  };
  const reviewReportPath = path.join(reviewDirPath, `${options.id}-review-report.json`);
  await writeFile(reviewReportPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeReviewJoins(options, manifest, outputPath, reviewDirPath);

  const jsonPath = path.join(candidateDirPath, "candidates.json");
  const data = await readCandidates(jsonPath, options.from, options.to);
  data.updatedAt = report.createdAt;
  data.reviewedAt = report.createdAt;
  data.activeForReview = options.id;
  data.reviewVerdict =
    "PARTIAL. Strict-X soft adoption preserves outer anchors exactly, but visual acceptance depends on internal boundary review.";

  const entry = {
    id: options.id,
    label: options.label,
    localPath: repoRelative(outputPath),
    researchCopy: repoRelative(researchOutputPath),
    status: "partial",
    method: "strict-anchor-x-only-soft-adoption",
    notes: `Derived from ${options.sourceId}. A/B anchors are copied exactly; only X-region pixels are softened over ${featherPx}px near the anchors with a ${options.curve} curve.`,
    reviewNotes:
      "Strictly preserves original A/B anchors and blends only inside X. Review at blend=0 before accepting.",
    sourceCandidate: options.sourceId,
    reviewReport: repoRelative(reviewReportPath),
  };
  const existingIndex = data.candidates.findIndex((candidate) => candidate.id === options.id);
  if (existingIndex >= 0) {
    data.candidates[existingIndex] = entry;
  } else {
    data.candidates.push(entry);
  }
  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  await writeFile(path.join(researchDirPath, "candidates.json"), `${JSON.stringify(data, null, 2)}\n`);

  await import("./adapter-candidates-generate.mjs");

  console.log(`Wrote ${repoRelative(outputPath)}`);
  console.log(`Wrote ${repoRelative(reviewReportPath)}`);
  console.log(JSON.stringify(report.outerAnchorDiff, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
