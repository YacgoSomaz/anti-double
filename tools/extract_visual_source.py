"""Extract the renderable decoration lists from an exported G-Switch plist.

The input is an original XML plist exported from the SWF's DefineBinaryData
tag.  This keeps the browser-facing data reproducible without storing or
processing collision/entity records that the existing level pipeline owns.
"""
from __future__ import annotations

import argparse
import json
import plistlib
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source = plistlib.loads(args.input.read_bytes())
    expected = ("visualInfo", "frontVisualInfo")
    if not all(isinstance(source.get(key), list) for key in expected):
        raise ValueError("expected a G-Switch level plist with visualInfo and frontVisualInfo")

    result = {key: source[key] for key in expected}
    args.output.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
