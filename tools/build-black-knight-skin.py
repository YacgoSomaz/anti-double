#!/usr/bin/env python3
"""Import the six supplied Black Knight walk frames without redrawing them.

The input images use a flat chroma-green backdrop.  This tool archives the
exact imports under artifacts/ (which is deliberately Git-ignored), removes
only that key colour, then packs the six original poses into the 6 × 65 × 77
runtime atlas used by the browser.  Nearest-neighbour scaling is intentional:
the source is pixel art and must never be blurred.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

FRAME_WIDTH = 65
FRAME_HEIGHT = 77
# The shared normal-gravity hitbox ends at y=67 (offset 19 + height 48).
# Preserve a ten-pixel transparent pad below every custom sprite so a visual
# foot never appears inside a platform while its physics body is standing on it.
CONTACT_Y = 67
FRAME_COUNT = 6


def is_chroma_green(red: int, green: int, blue: int) -> bool:
    """Remove the green screen and its compressed/spilled edge shades.

    These imports have no intentional green parts on the rider or mount.  The
    earlier bright-only key left dark green checker pixels from the green-screen
    edge, so use hue dominance as well as a low luminance floor.
    """
    # The imported sprite contains no intentional green.  Any green-leading
    # pixel is therefore green-screen spill, including the very dark 0/35/0
    # fragments that remain after nearest-neighbour downsizing.
    return green > red and green > blue


def transparent_frame(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if is_chroma_green(red, green, blue):
                pixels[x, y] = (red, green, blue, 0)
    return image


def visible_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("frame has no non-green pixels")
    return bounds


def pack_frame(frame: Image.Image) -> Image.Image:
    """Centre every original pose and keep its bottom contact point aligned."""
    left, top, right, bottom = visible_bounds(frame)
    sprite = frame.crop((left, top, right, bottom))
    scale = min(FRAME_WIDTH / sprite.width, CONTACT_Y / sprite.height)
    size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
    sprite = sprite.resize(size, Image.Resampling.NEAREST)
    cell = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT))
    cell.alpha_composite(sprite, ((FRAME_WIDTH - sprite.width) // 2, CONTACT_Y - sprite.height))
    return cell


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("frames", nargs=FRAME_COUNT, type=Path, help="six source frames in animation order")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    source_directory = root / "artifacts" / "black-knight" / "source"
    source_directory.mkdir(parents=True, exist_ok=True)
    output = root / "public" / "assets" / "players" / "player-black-knight.png"
    output.parent.mkdir(parents=True, exist_ok=True)

    archived = []
    packed = Image.new("RGBA", (FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT))
    for index, supplied in enumerate(args.frames):
        supplied = supplied.resolve()
        if not supplied.is_file():
            raise FileNotFoundError(supplied)
        archived_path = source_directory / f"walk-{index + 1:02d}.png"
        shutil.copy2(supplied, archived_path)
        archived.append({"frame": index, "file": archived_path.name, "sha256": sha256(archived_path)})
        packed.alpha_composite(pack_frame(transparent_frame(archived_path)), (FRAME_WIDTH * index, 0))

    packed.save(output, optimize=True)
    manifest = {
        "skinId": "black-knight",
        "animation": "walk",
        "frameCount": FRAME_COUNT,
        "frameWidth": FRAME_WIDTH,
        "frameHeight": FRAME_HEIGHT,
        "processing": "green chroma key; transparent RGBA; nearest-neighbour resize; y=67 collision-contact anchor",
        "sourceFrames": archived,
        "runtimeAtlas": {"file": output.name, "sha256": sha256(output)},
    }
    (source_directory.parent / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
