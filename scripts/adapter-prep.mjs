import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const REPO_ROOT = process.cwd();
const DEFAULT_WIDTH = 3168;
const DEFAULT_HEIGHT = 1344;
const ANCHOR_PERCENT = 0.33;
const OVERMASK_PERCENT = 0.06;

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

  for (const required of ["from", "to", "id"]) {
    if (!args[required] || typeof args[required] !== "string") {
      throw new Error(`Missing required --${required} argument.`);
    }
  }

  return {
    fromSceneId: args.from,
    toSceneId: args.to,
    recipeId: args.id,
  };
}

function workbenchSlug(recipeId) {
  const match = recipeId.match(/^exp(?<num>\d+)-(?<slug>.+?)(?:-v\d+)?$/);
  if (!match?.groups) {
    return recipeId;
  }

  return `${match.groups.num.padStart(3, "0")}-${match.groups.slug}`;
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function scenePath(sceneId) {
  return path.join(REPO_ROOT, "public", "panos", `${sceneId}.jpg`);
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
    .jpeg({ quality: 94 })
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
  const stripWidth = Math.min(16, metadata.width ?? 16);
  const left = side === "right" ? (metadata.width ?? stripWidth) - stripWidth : 0;
  const stats = await sharp(buffer)
    .extract({ left, top: 0, width: stripWidth, height: metadata.height ?? DEFAULT_HEIGHT })
    .stats();

  const [r, g, b] = stats.channels.slice(0, 3).map((channel) => Math.round(channel.mean));
  return { r, g, b };
}

function rgb({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function workCanvasFillSvg(width, height, leftColor, rightColor, leftX, rightX) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="transition" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="${rgb(leftColor)}"/>
      <stop offset="50%" stop-color="rgb(${Math.round((leftColor.r + rightColor.r) / 2)}, ${Math.round((leftColor.g + rightColor.g) / 2)}, ${Math.round((leftColor.b + rightColor.b) / 2)})"/>
      <stop offset="100%" stop-color="${rgb(rightColor)}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#transition)"/>
  <rect x="0" y="0" width="${leftX}" height="${height}" fill="${rgb(leftColor)}"/>
  <rect x="${rightX}" y="0" width="${width - rightX}" height="${height}" fill="${rgb(rightColor)}"/>
</svg>`);
}

function maskSvg(width, height, anchorWidth, overmaskWidth) {
  const leftBlackEnd = ((anchorWidth - overmaskWidth) / width) * 100;
  const leftWhiteStart = (anchorWidth / width) * 100;
  const rightWhiteEnd = ((width - anchorWidth) / width) * 100;
  const rightBlackStart = ((width - anchorWidth + overmaskWidth) / width) * 100;

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="mask" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="black"/>
      <stop offset="${leftBlackEnd.toFixed(2)}%" stop-color="black"/>
      <stop offset="${leftWhiteStart.toFixed(2)}%" stop-color="white"/>
      <stop offset="${rightWhiteEnd.toFixed(2)}%" stop-color="white"/>
      <stop offset="${rightBlackStart.toFixed(2)}%" stop-color="black"/>
      <stop offset="100%" stop-color="black"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#mask)"/>
</svg>`);
}

function structureGuideSvg(width, height) {
  const horizonY = Math.round(height * 0.48);
  const basinY = Math.round(height * 0.67);
  const ridgeY = Math.round(height * 0.38);
  const foregroundY = Math.round(height * 0.8);

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#d8d2bd"/>
      <stop offset="55%" stop-color="#d9d6ce"/>
      <stop offset="100%" stop-color="#9da0aa"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#8d8b73"/>
      <stop offset="50%" stop-color="#bbb7a2"/>
      <stop offset="100%" stop-color="#5e6570"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <path d="M0 ${horizonY} C ${width * 0.16} ${horizonY - 60}, ${width * 0.3} ${horizonY + 40}, ${width * 0.44} ${horizonY + 10} S ${width * 0.68} ${horizonY - 30}, ${width} ${ridgeY}" fill="none" stroke="#747b80" stroke-width="26" opacity="0.55"/>
  <path d="M0 ${foregroundY} C ${width * 0.18} ${foregroundY - 42}, ${width * 0.34} ${basinY + 24}, ${width * 0.5} ${basinY} S ${width * 0.76} ${basinY + 12}, ${width} ${foregroundY - 80} L ${width} ${height} L 0 ${height} Z" fill="url(#ground)" opacity="0.82"/>
  <path d="M${width * 0.58} ${height} C ${width * 0.67} ${height * 0.58}, ${width * 0.82} ${height * 0.42}, ${width} ${height * 0.5} L ${width} ${height} Z" fill="#444d5a" opacity="0.44"/>
  <ellipse cx="${width * 0.48}" cy="${basinY}" rx="${width * 0.28}" ry="${height * 0.18}" fill="#e4ded0" opacity="0.48"/>
  <rect y="${Math.round(height * 0.56)}" width="${width}" height="${Math.round(height * 0.18)}" fill="#e2ded4" opacity="0.28"/>
</svg>`);
}

function promptText(fromSceneId, toSceneId) {
  return `Pair-specific panoramic adapter for ${fromSceneId} to ${toSceneId}.
Use the left anchor as the actual right edge of dawn-valley and the right anchor as the actual left edge of dusk-ridge.
Generate a wide natural transition world between them: open dawn valley atmosphere, low mist basin, distant layered ridges, soft haze, coherent horizon, dusk ridge gradually emerging on the right.
Keep the left endpoint airy and low-contrast; do not introduce a large dark mountain mass immediately on the left edge.
Preserve the anchor crops where the mask is black and regenerate the white center band plus slight overmask area.
The result should feel like one continuous panoramic journey, not two wallpapers taped together.`;
}

function negativePromptText() {
  return `large black mountain on the left edge, hard structure jump, abrupt horizon step, lake hitting mountain, pasted collage, split-screen image, vertical seam line, transparent area, empty blank center, sharp black silhouette at dawn-valley boundary, mismatched perspective, text, watermark, people, buildings, vehicles`;
}

async function main() {
  const { fromSceneId, toSceneId, recipeId } = parseArgs(process.argv.slice(2));
  const fromPath = scenePath(fromSceneId);
  const toPath = scenePath(toSceneId);

  if (!existsSync(fromPath)) {
    throw new Error(`Missing source scene: ${repoRelative(fromPath)}`);
  }

  if (!existsSync(toPath)) {
    throw new Error(`Missing source scene: ${repoRelative(toPath)}`);
  }

  const outputDir = path.join(
    REPO_ROOT,
    "docs",
    "research",
    "experiments",
    "working",
    workbenchSlug(recipeId),
  );

  await mkdir(outputDir, { recursive: true });

  const width = DEFAULT_WIDTH;
  const height = DEFAULT_HEIGHT;
  const anchorWidth = Math.round(width * ANCHOR_PERCENT);
  const middleWidth = width - anchorWidth * 2;
  const overmaskWidth = Math.round(width * OVERMASK_PERCENT);

  const fromCrop = await cropEdge(fromPath, "right", height, anchorWidth);
  const toCrop = await cropEdge(toPath, "left", height, anchorWidth);

  const fromCropPath = path.join(outputDir, `${fromSceneId}-right-crop.jpg`);
  const toCropPath = path.join(outputDir, `${toSceneId}-left-crop.jpg`);
  const workCanvasPath = path.join(outputDir, "adapter-work-canvas.png");
  const maskPath = path.join(outputDir, "adapter-mask.png");
  const structureGuidePath = path.join(outputDir, "structure-guide.png");
  const promptPath = path.join(outputDir, "prompt.txt");
  const negativePromptPath = path.join(outputDir, "negative-prompt.txt");
  const manifestPath = path.join(outputDir, "manifest.json");

  await writeFile(fromCropPath, fromCrop.buffer);
  await writeFile(toCropPath, toCrop.buffer);

  const leftEdgeColor = await edgeMean(fromCrop.buffer, "right");
  const rightEdgeColor = await edgeMean(toCrop.buffer, "left");

  const prefill = await sharp(
    workCanvasFillSvg(width, height, leftEdgeColor, rightEdgeColor, anchorWidth, width - anchorWidth),
  )
    .png()
    .toBuffer();

  await sharp(prefill)
    .composite([
      { input: fromCrop.buffer, left: 0, top: 0 },
      { input: toCrop.buffer, left: width - anchorWidth, top: 0 },
    ])
    .png()
    .toFile(workCanvasPath);

  await sharp(maskSvg(width, height, anchorWidth, overmaskWidth)).greyscale().png().toFile(maskPath);
  await sharp(structureGuideSvg(width, height)).png().toFile(structureGuidePath);

  const prompt = promptText(fromSceneId, toSceneId);
  const negativePrompt = negativePromptText();

  await writeFile(promptPath, `${prompt}\n`);
  await writeFile(negativePromptPath, `${negativePrompt}\n`);

  const outputs = {
    manifest: manifestPath,
    prompt: promptPath,
    negativePrompt: negativePromptPath,
    fromRightCrop: fromCropPath,
    toLeftCrop: toCropPath,
    adapterWorkCanvas: workCanvasPath,
    adapterMask: maskPath,
    structureGuide: structureGuidePath,
  };

  const manifest = {
    id: recipeId,
    boundary: {
      from: fromSceneId,
      to: toSceneId,
    },
    createdAt: new Date().toISOString(),
    sourcePaths: {
      from: repoRelative(fromPath),
      to: repoRelative(toPath),
    },
    outputPaths: Object.fromEntries(
      Object.entries(outputs).map(([key, value]) => [key, repoRelative(value)]),
    ),
    dimensions: {
      width,
      height,
      aspectRatio: "21:9",
    },
    cropPercent: {
      leftAnchorOfWorkCanvas: ANCHOR_PERCENT,
      rightAnchorOfWorkCanvas: ANCHOR_PERCENT,
      transitionBandOfWorkCanvas: middleWidth / width,
      overmaskIntoEachAnchor: OVERMASK_PERCENT,
    },
    cropPixels: {
      anchorWidth,
      middleWidth,
      overmaskWidth,
      fromRightCrop: fromCrop.crop,
      toLeftCrop: toCrop.crop,
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
    maskStrategy: {
      name: "center-band-with-anchor-overmask",
      meaning: "white = regenerate, black = preserve",
      description:
        "Outer anchor edges are protected, the broad center band is regenerate, and the white region slightly enters each anchor to give an inpainting backend room to blend.",
    },
    prefillStrategy: {
      name: "edge-color-gradient",
      description:
        "The unknown center is initialized with a non-transparent horizontal gradient between the average colors of the two crop-facing edges.",
      leftEdgeColor,
      rightEdgeColor,
    },
    structureGuide: {
      path: repoRelative(structureGuidePath),
      description:
        "Minimal low-frequency guide: open mist basin through the center, distant ridge continuity, and dusk ridge mass emerging gradually on the right.",
    },
    promptFilePaths: {
      prompt: repoRelative(promptPath),
      negativePrompt: repoRelative(negativePromptPath),
    },
    notes: [
      "No generation backend was called by this prep script.",
      "No final adapter candidate was written to public/panos/adapters.",
      "The left endpoint prompt explicitly avoids the Loop 2 failure mode: a large dark mountain/value mass entering immediately from dawn-valley.",
    ],
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Prepared adapter workbench: ${repoRelative(outputDir)}`);
  for (const outputPath of Object.values(outputs)) {
    console.log(`- ${repoRelative(outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
