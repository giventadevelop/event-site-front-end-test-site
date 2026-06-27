#!/usr/bin/env python3
"""Remap official_document_category_id FKs in duplicated MOSC SQL (+600000 offset)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

TARGET_TENANT = "mosc_malankara_orthodox_2"
MARKER = f"-- ========== DUPLICATED TENANT: {TARGET_TENANT}"
ID_OFFSET = 600_000

YEAR_BUNDLE_LINE = re.compile(
    r"^(INSERT INTO public\.official_document_year_bundle\b.*?VALUES \(\d+, '"
    + re.escape(TARGET_TENANT)
    + r"', )(\d+)(, \d{4},.*)$"
)

# Official-doc event_media rows: ..., true, <category_id>, <year>, ...
EVENT_MEDIA_CAT_INLINE = re.compile(r"(, true, )(\d+)(, (?:20\d{2}|201\d|203\d),)")


def remap_demo_category_id(raw: str) -> str:
    n = int(raw)
    if n >= ID_OFFSET:
        return raw
    if n >= 1000:
        return str(n + ID_OFFSET)
    return raw


def patch_lines(lines: list[str]) -> tuple[list[str], int]:
    count = 0
    in_mosc_official_media = False
    out: list[str] = []

    for line in lines:
        if YEAR_BUNDLE_LINE.search(line):
            def repl_year(m: re.Match[str]) -> str:
                nonlocal count
                new_id = remap_demo_category_id(m.group(2))
                if new_id != m.group(2):
                    count += 1
                return m.group(1) + new_id + m.group(3)

            line = YEAR_BUNDLE_LINE.sub(repl_year, line)

        if "INSERT INTO public.event_media" in line and TARGET_TENANT in line:
            in_mosc_official_media = "TENANT_OFFICIAL_DOCUMENT" in line
        elif in_mosc_official_media and line.rstrip().endswith(");"):
            in_mosc_official_media = False

        if in_mosc_official_media or (
            TARGET_TENANT in line and "TENANT_OFFICIAL_DOCUMENT" in line
        ):

            def repl_media(m: re.Match[str]) -> str:
                nonlocal count
                new_id = remap_demo_category_id(m.group(2))
                if new_id != m.group(2):
                    count += 1
                return m.group(1) + new_id + m.group(3)

            line = EVENT_MEDIA_CAT_INLINE.sub(repl_media, line)

        out.append(line)

    return out, count


def patch_text(text: str) -> tuple[str, int]:
    lines, count = patch_lines(text.splitlines(keepends=True))
    return "".join(lines), count


def patch_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    idx = text.find(MARKER)
    if idx < 0:
        if TARGET_TENANT not in text:
            print(f"skip (no dup marker, no {TARGET_TENANT}): {path}")
            return 0
        patched_text, count = patch_text(text)
    else:
        head, tail = text[:idx], text[idx:]
        patched_tail, count = patch_text(tail)
        patched_text = head + patched_tail
    if count == 0:
        print(f"no FK changes: {path.name}")
        return 0
    path.write_text(patched_text, encoding="utf-8")
    print(f"patched {path.name}: {count} official_document_category_id FK(s)")
    return count


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    paths = [
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql",
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql",
        root / "code_html_template/SQLS/mosc_dup_only.sql",
    ]
    if len(sys.argv) > 1:
        paths = [Path(p) for p in sys.argv[1:]]
    total = sum(patch_file(p) for p in paths if p.is_file())
    return 0 if total >= 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
