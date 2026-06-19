#!/usr/bin/env python3
"""Deterministic soft composite restore for pano-loop-lab inpaint candidates.

The generated inpaint image supplies the center. The original work canvas supplies
the outer plate-facing anchors exactly. A smoothstep feather inside the hard mask
boundary avoids creating a hard internal restore seam.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def smoothstep(t: np.ndarray) -> np.ndarray:
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def load_rgb(path: Path, size: tuple[int, int]) -> Image.Image:
    return Image.open(path).convert("RGB").resize(size, Image.Resampling.LANCZOS)


def hard_mask_bounds(mask: Image.Image) -> tuple[int, int]:
    mask_arr = np.array(mask.convert("L"))
    white_cols = np.where((mask_arr > 0).any(axis=0))[0]
    if white_cols.size == 0:
        raise ValueError("Mask has no white/regenerate columns")
    return int(white_cols.min()), int(white_cols.max() + 1)


def feather_alpha(width: int, height: int, left: int, right: int, feather: int) -> np.ndarray:
    x = np.arange(width, dtype=np.float32)
    if feather <= 0:
        alpha = np.zeros(width, dtype=np.float32)
        alpha[(x >= left) & (x < right)] = 1.0
    else:
        left_ramp = (x - left) / float(feather)
        right_ramp = (right - 1 - x) / float(feather)
        alpha = np.minimum(smoothstep(left_ramp), smoothstep(right_ramp))
        alpha[(x < left) | (x >= right)] = 0.0
    return np.repeat(alpha[None, :], height, axis=0)


def max_diff(a: np.ndarray, b: np.ndarray) -> int:
    if a.size == 0:
        return 0
    return int(np.abs(a.astype(np.int16) - b.astype(np.int16)).max())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path, help="Generated inpaint PNG")
    parser.add_argument("--canvas", required=True, type=Path, help="Original work canvas")
    parser.add_argument("--mask", required=True, type=Path, help="Hard inpaint mask; white = generated")
    parser.add_argument("--feather", required=True, type=int, help="Feather width in pixels")
    parser.add_argument("--out", required=True, type=Path, help="Composite output PNG")
    parser.add_argument("--width", type=int, default=None, help="Output width; defaults to source width")
    parser.add_argument("--height", type=int, default=None, help="Output height; defaults to source height")
    parser.add_argument("--report", type=Path, default=None, help="Optional JSON diff report")
    parser.add_argument("--mask-out", type=Path, default=None, help="Optional alpha mask output PNG")
    args = parser.parse_args()

    source_img = Image.open(args.source).convert("RGB")
    size = (args.width or source_img.width, args.height or source_img.height)
    source_img = source_img.resize(size, Image.Resampling.LANCZOS)
    canvas_img = load_rgb(args.canvas, size)
    mask_img = Image.open(args.mask).convert("L").resize(size, Image.Resampling.NEAREST)

    left, right = hard_mask_bounds(mask_img)
    alpha = feather_alpha(size[0], size[1], left, right, args.feather)

    source = np.array(source_img, dtype=np.float32)
    canvas = np.array(canvas_img, dtype=np.float32)
    comp = np.rint(source * alpha[:, :, None] + canvas * (1.0 - alpha[:, :, None]))
    comp = np.clip(comp, 0, 255).astype(np.uint8)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(comp, "RGB").save(args.out)

    if args.mask_out:
        args.mask_out.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(np.rint(alpha * 255.0).astype(np.uint8), "L").save(args.mask_out)

    canvas_u8 = np.array(canvas_img, dtype=np.uint8)
    report = {
        "source": str(args.source),
        "canvas": str(args.canvas),
        "mask": str(args.mask),
        "out": str(args.out),
        "size": [size[0], size[1]],
        "feather": args.feather,
        "left_boundary_x": left,
        "right_boundary_x": right,
        "outer_left_anchor_max_abs_diff": max_diff(comp[:, :left, :], canvas_u8[:, :left, :]),
        "outer_right_anchor_max_abs_diff": max_diff(comp[:, right:, :], canvas_u8[:, right:, :]),
    }
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
