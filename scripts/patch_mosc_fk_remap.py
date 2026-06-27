#!/usr/bin/env python3
"""Apply FK + PK remaps to duplicated MOSC INSERT blocks using duplicate_tenant_sql rules."""

from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from duplicate_tenant_sql import (  # noqa: E402
    FK_COLUMN_TARGETS,
    ID_OFFSET,
    TARGET_TENANT,
    fk_columns,
    parse_insert,
    pk_column,
    rebuild_insert,
    remap_value,
    split_inserts,
    sql_int,
)

MARKER = f"-- ========== DUPLICATED TENANT: {TARGET_TENANT}"


def is_mosc_stmt(stmt) -> bool:
    if "tenant_id" in stmt.columns:
        return TARGET_TENANT in stmt.values[stmt.columns.index("tenant_id")]
    return stmt.table in {
        "rel_event_details__discount_codes",
        "event_live_update",
        "event_live_update_attachment",
        "event_score_card",
        "event_score_card_detail",
    }


def build_id_maps(statements: list) -> dict[str, dict[int, int]]:
    maps: dict[str, dict[int, int]] = defaultdict(dict)
    for stmt in statements:
        if not is_mosc_stmt(stmt):
            continue
        pk_col = pk_column(stmt.table)
        if pk_col not in stmt.columns:
            continue
        new_id = sql_int(stmt.values[stmt.columns.index(pk_col)])
        if new_id is None or new_id < ID_OFFSET:
            continue
        maps[stmt.table][new_id - ID_OFFSET] = new_id
    return maps


def remap_fk_value(col: str, val: str, table: str, id_maps: dict[str, dict[int, int]]) -> str:
    n = sql_int(val)
    target = FK_COLUMN_TARGETS.get(col)
    if n is not None and target:
        table_map = id_maps.get(target, {})
        if n in table_map:
            return str(table_map[n])
        # Already duplicated offset id — preserve (patch must not null 605152-style FKs)
        if target == "user_profile" and n >= ID_OFFSET and n in table_map.values():
            return str(n)
        if n < ID_OFFSET:
            fallback = n + ID_OFFSET
            if fallback in table_map.values():
                return str(fallback)
            if target == "user_profile":
                return "NULL"
    return remap_value(col, val, table, id_maps)


USER_PROFILE_FK_COLUMNS = frozenset(
    col for col, tgt in FK_COLUMN_TARGETS.items() if tgt == "user_profile"
)


def build_user_profile_fk_index(text: str) -> dict[tuple[str, int], str]:
    """(table, row_pk) -> user_profile_id value from MOSC INSERTs in reference SQL."""
    index: dict[tuple[str, int], str] = {}
    for raw in split_inserts(text):
        stmt = parse_insert(raw)
        if not stmt or not is_mosc_stmt(stmt):
            continue
        pk_col = pk_column(stmt.table)
        if pk_col not in stmt.columns:
            continue
        row_pk = sql_int(stmt.values[stmt.columns.index(pk_col)])
        if row_pk is None:
            continue
        for col in USER_PROFILE_FK_COLUMNS:
            if col not in stmt.columns:
                continue
            up_val = stmt.values[stmt.columns.index(col)]
            if up_val.upper() == "NULL":
                continue
            index[(stmt.table, row_pk)] = up_val
            break
    return index


def restore_null_user_profile_fks(dup_text: str, ordered_path: Path) -> tuple[str, int]:
    if not ordered_path.is_file():
        return dup_text, 0
    ref_index = build_user_profile_fk_index(ordered_path.read_text(encoding="utf-8"))
    if not ref_index:
        return dup_text, 0

    inserts = split_inserts(dup_text)
    if not inserts:
        return dup_text, 0

    changed = 0
    rebuilt: list[str] = []
    pos = 0
    id_maps = build_id_maps([parse_insert(r) for r in inserts if parse_insert(r)])

    for raw in inserts:
        idx = dup_text.find(raw, pos)
        if idx > pos:
            rebuilt.append(dup_text[pos:idx])
        pos = idx + len(raw) if idx >= 0 else pos

        stmt = parse_insert(raw)
        if not stmt or not is_mosc_stmt(stmt):
            rebuilt.append(raw)
            continue

        pk_col = pk_column(stmt.table)
        row_pk = sql_int(stmt.values[stmt.columns.index(pk_col)]) if pk_col in stmt.columns else None
        modified = False
        new_values = list(stmt.values)
        for i, col in enumerate(stmt.columns):
            if col not in USER_PROFILE_FK_COLUMNS:
                continue
            if new_values[i].upper() != "NULL":
                continue
            if row_pk is None:
                continue
            ref_val = ref_index.get((stmt.table, row_pk))
            if ref_val and ref_val.upper() != "NULL":
                new_values[i] = ref_val
                modified = True

        if modified:
            stmt.values = new_values
            rebuilt.append(rebuild_insert(stmt, id_maps))
            changed += 1
        else:
            rebuilt.append(raw)

    if pos < len(dup_text):
        rebuilt.append(dup_text[pos:])
    return "".join(rebuilt), changed


def collect_missing_event_ids(text: str) -> set[int]:
    event_pks: set[int] = set()
    refs: set[int] = set()
    for raw in split_inserts(text):
        stmt = parse_insert(raw)
        if not stmt:
            continue
        if stmt.table == "event_details" and is_mosc_stmt(stmt):
            pk = sql_int(stmt.values[stmt.columns.index("id")])
            if pk:
                event_pks.add(pk)
        if (
            stmt.table == "event_media"
            and "event_id" in stmt.columns
            and is_mosc_stmt(stmt)
        ):
            eid = sql_int(stmt.values[stmt.columns.index("event_id")])
            if eid and eid < ID_OFFSET:
                refs.add(eid)
    return {r for r in refs if (r + ID_OFFSET) not in event_pks}


def inject_orphan_events(dup_text: str, ordered_path: Path) -> tuple[str, int]:
    missing = collect_missing_event_ids(dup_text)
    if not missing or not ordered_path.is_file():
        return dup_text, 0

    ordered = ordered_path.read_text(encoding="utf-8")
    extra: list[str] = []
    for raw in split_inserts(ordered):
        stmt = parse_insert(raw)
        if not stmt or stmt.table != "event_details":
            continue
        old_id = sql_int(stmt.values[stmt.columns.index("id")])
        if old_id not in missing:
            continue
        id_maps: dict[str, dict[int, int]] = defaultdict(dict)
        new_values = []
        for col, val in zip(stmt.columns, stmt.values, strict=True):
            if col == "tenant_id":
                new_values.append(f"'{TARGET_TENANT}'")
            else:
                new_values.append(remap_fk_value(col, val, stmt.table, id_maps))
        stmt.values = new_values
        pk_idx = stmt.columns.index("id")
        stmt.values[pk_idx] = str(old_id + ID_OFFSET)
        extra.append(rebuild_insert(stmt, id_maps))

    if not extra:
        return dup_text, 0

    marker = "-- Orphan event_details referenced by MOSC event_media (NULL-tenant source rows)"
    block = marker + "\n" + "\n".join(extra) + "\n\n"
    insert_at = dup_text.find("INSERT INTO public.event_media")
    if insert_at < 0:
        return dup_text + "\n" + block, len(extra)
    return dup_text[:insert_at] + block + dup_text[insert_at:], len(extra)


def patch_block(text: str) -> tuple[str, int]:
    inserts = split_inserts(text)
    if not inserts:
        return text, 0

    stmts = [parse_insert(raw) for raw in inserts]
    id_maps = build_id_maps([s for s in stmts if s])

    changed = 0
    rebuilt: list[str] = []
    pos = 0
    for raw in inserts:
        idx = text.find(raw, pos)
        if idx > pos:
            rebuilt.append(text[pos:idx])
        pos = idx + len(raw) if idx >= 0 else pos

        stmt = parse_insert(raw)
        if not stmt or not is_mosc_stmt(stmt):
            rebuilt.append(raw)
            continue

        new_values = []
        modified = False
        for col, val in zip(stmt.columns, stmt.values, strict=True):
            remapped = remap_fk_value(col, val, stmt.table, id_maps)
            if remapped != val:
                modified = True
            new_values.append(remapped)
        if modified:
            stmt.values = new_values
            rebuilt.append(rebuild_insert(stmt, id_maps))
            changed += 1
        else:
            rebuilt.append(raw)

    if pos < len(text):
        rebuilt.append(text[pos:])
    return "".join(rebuilt), changed


def patch_file(path: Path, ordered_path: Path | None = None) -> int:
    text = path.read_text(encoding="utf-8")
    if ordered_path is None:
        ordered_path = path.parent / "corrected_event_media_inserts.ordered.sql"
    text, injected = inject_orphan_events(text, ordered_path)
    marker_idx = text.find(MARKER)
    if marker_idx >= 0:
        head, tail = text[:marker_idx], text[marker_idx:]
        patched_tail, count = patch_block(tail)
        restored_tail, restored = restore_null_user_profile_fks(patched_tail, ordered_path)
        out = head + restored_tail
        count += restored
    elif TARGET_TENANT in text:
        out, count = patch_block(text)
        out, restored = restore_null_user_profile_fks(out, ordered_path)
        count += restored
    else:
        print(f"skip: {path.name}")
        return 0

    if count == 0 and injected == 0:
        print(f"no FK remaps: {path.name}")
        return 0
    path.write_text(out, encoding="utf-8")
    msg = f"patched {path.name}: {count} INSERT(s) with FK remaps"
    if injected:
        msg += f", {injected} orphan event_details injected"
    print(msg)
    return count + injected


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    paths = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else [
        root / "code_html_template/SQLS/mosc_dup_only.sql",
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql",
    ]
    for p in paths:
        if p.is_file():
            patch_file(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
