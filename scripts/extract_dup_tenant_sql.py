#!/usr/bin/env python3
"""Extract duplicated-tenant block from mosc SQL file for isolated import."""

from __future__ import annotations

import sys
from pathlib import Path

TENANT = "mosc_malankara_orthodox_2"
MARKER = f"-- ========== DUPLICATED TENANT: {TENANT}"


def main() -> int:
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".dup_only.sql")
    text = src.read_text(encoding="utf-8", errors="replace")
    idx = text.find(MARKER)
    if idx < 0:
        print(f"Marker not found: {MARKER}")
        return 1
    dst.write_text(text[idx:], encoding="utf-8")
    print(f"Wrote {dst} ({len(text) - idx} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
