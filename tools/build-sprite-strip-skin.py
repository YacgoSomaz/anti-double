#!/usr/bin/env python3
"""Pack one already-transparent pixel-art strip into the game's 65 × 77 atlas."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

FRAME_WIDTH = 65
FRAME_HEIGHT = 77
# Match the shared collision body's normal-gravity contact edge; retain the
# lower ten rows as transparent padding for both normal and inverted gravity.
CONTACT_Y = 67


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sprite_cell(sheet: Image.Image, index: int, cell_width: int, cell_height: int) -> Image.Image:
    source = sheet.crop((index * cell_width, 0, (index + 1) * cell_width, cell_height))
    bounds = source.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"frame {index} is completely transparent")
    sprite = source.crop(bounds)
    scale = min(FRAME_WIDTH / sprite.width, CONTACT_Y / sprite.height)
    size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
    sprite = sprite.resize(size, Image.Resampling.NEAREST)
    cell = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT))
    cell.alpha_composite(sprite, ((FRAME_WIDTH - sprite.width) // 2, CONTACT_Y - sprite.height))
    return cell


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="transparent sprite strip")
    parser.add_argument("--skin-id", required=True)
    parser.add_argument("--frame-count", required=True, type=int)
    parser.add_argument("--source-cell-width", required=True, type=int)
    parser.add_argument("--source-cell-height", required=True, type=int)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    if args.frame_count < 1 or args.source_cell_width < 1 or args.source_cell_height < 1:
        raise ValueError("frame count and source dimensions must be positive")
    root = args.root.resolve(); source = args.source.resolve()
    sheet = Image.open(source).convert("RGBA")
    expected_size = (args.frame_count * args.source_cell_width, args.source_cell_height)
    if sheet.size != expected_size:
        raise ValueError(f"expected {expected_size[0]}×{expected_size[1]} strip, received {sheet.width}×{sheet.height}")

    source_directory = root / "artifacts" / args.skin_id / "source"
    source_directory.mkdir(parents=True, exist_ok=True)
    archived = source_directory / source.name
    shutil.copy2(source, archived)
    atlas = Image.new("RGBA", (FRAME_WIDTH * args.frame_count, FRAME_HEIGHT))
    for index in range(args.frame_count):
        atlas.alpha_composite(sprite_cell(sheet, index, args.source_cell_width, args.source_cell_height), (index * FRAME_WIDTH, 0))
    output = root / "public" / "assets" / "players" / f"player-{args.skin_id}.png"
    atlas.save(output, optimize=True)
    manifest = {
        "skinId": args.skin_id,
        "source": {"file": archived.name, "sha256": sha256(archived), "cellWidth": args.source_cell_width, "cellHeight": args.source_cell_height},
        "runtime": {"file": output.name, "sha256": sha256(output), "frameCount": args.frame_count, "frameWidth": FRAME_WIDTH, "frameHeight": FRAME_HEIGHT},
        "processing": "original alpha retained; alpha-bounds crop; nearest-neighbour resize; bottom-centred fixed cell",
    }
    (source_directory.parent / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
