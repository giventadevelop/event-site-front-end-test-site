#!/usr/bin/env python3
"""Remap event_media.uploaded_by_id FKs in duplicated MOSC SQL (+600000 or NULL)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Reuse SQL insert parser from tenant duplication script.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from duplicate_tenant_sql import (  # noqa: E402
    ID_OFFSET,
    TARGET_TENANT,
    parse_insert,
    rebuild_insert,
    split_inserts,
)

MARKER = f"-- ========== DUPLICATED TENANT: {TARGET_TENANT}"


def build_user_profile_map(text: str) -> dict[int, int]:
    """demo user_profile id -> duplicated mosc user_profile id (same +offset)."""
    mapping: dict[int, int] = {}
    for raw in split_inserts(text):
        stmt = parse_insert(raw)
        if not stmt or stmt.table != "user_profile":
            continue
        if "tenant_id" not in stmt.columns:
            continue
        tid = stmt.values[stmt.columns.index("tenant_id")]
        if TARGET_TENANT not in tid:
            continue
        pk = stmt.values[0].strip()
        if pk.isdigit():
            new_id = int(pk)
            if new_id >= ID_OFFSET:
                mapping[new_id - ID_OFFSET] = new_id
    return mapping


def patch_uploaded_by(stmt, user_map: dict[int, int]):
    if stmt.table != "event_media" or "uploaded_by_id" not in stmt.columns:
        return stmt
    if "tenant_id" not in stmt.columns:
        return stmt
    if TARGET_TENANT not in stmt.values[stmt.columns.index("tenant_id")]:
        return stmt
    idx = stmt.columns.index("uploaded_by_id")
    raw = stmt.values[idx].strip()
    if raw.upper() == "NULL":
        return stmt
    if not raw.isdigit():
        return stmt
    old = int(raw)
    if old >= ID_OFFSET:
        return stmt
    new_val = user_map.get(old)
    stmt.values[idx] = str(new_val) if new_val is not None else "NULL"
    return stmt


def patch_text(text: str) -> tuple[str, int]:
    user_map = build_user_profile_map(text)
    count = 0
    out_parts: list[str] = []
    last = 0
    for m in re.finditer(r"INSERT INTO public\.\w+", text):
        start = m.start()
        if last < start:
            out_parts.append(text[last:start])
        # find end of statement
        end = text.find(";", m.start())
        if end < 0:
            break
        end += 1
        raw = text[m.start() : end].strip()
        stmt = parse_insert(raw)
        if stmt:
            before = stmt.values[stmt.columns.index("uploaded_by_id")] if (
                stmt.table == "event_media"
                and "uploaded_by_id" in stmt.columns
                and TARGET_TENANT in stmt.values[stmt.columns.index("tenant_id")]
            ) else None
            stmt = patch_uploaded_by(stmt, user_map)
            if before is not None:
                after = stmt.values[stmt.columns.index("uploaded_by_id")]
                if before != after:
                    count += 1
            out_parts.append(rebuild_insert(stmt, {}))
        else:
            out_parts.append(raw)
        last = end
    out_parts.append(text[last:])
    return "".join(out_parts), count


def patch_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    idx = text.find(MARKER)
    if idx >= 0:
        head, tail = text[:idx], text[idx:]
        patched_tail, count = patch_text(tail)
        patched = head + patched_tail
    elif TARGET_TENANT in text:
        patched, count = patch_text(text)
    else:
        print(f"skip: {path.name}")
        return 0
    if count == 0:
        print(f"no uploaded_by_id changes: {path.name}")
        return 0
    path.write_text(patched, encoding="utf-8")
    print(f"patched {path.name}: {count} uploaded_by_id FK(s)")
    return count


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    paths = [
        root / "code_html_template/SQLS/mosc_dup_only.sql",
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql",
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql",
    ]
    if len(sys.argv) > 1:
        paths = [Path(p) for p in sys.argv[1:]]
    for p in paths:
        if p.is_file():
            patch_file(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
