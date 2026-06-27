#!/usr/bin/env python3
"""Duplicate tenant_demo_002 INSERT rows for mosc_malankara_orthodox_2 with ID/FK remapping."""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

SOURCE_TENANT = "tenant_demo_002"
TARGET_TENANT = "mosc_malankara_orthodox_2"
ID_OFFSET = 600_000
# Duplicated rows reuse the same S3 objects as tenant_demo_002 (bucket is not copied per tenant).
S3_TENANT_PATH_SOURCE = f"tenantId/{SOURCE_TENANT}"
S3_TENANT_PATH_TARGET = f"tenantId/{TARGET_TENANT}"

SKIP_DUPLICATE_TABLES = {
    "satellite_domain",  # global unique hostname/satellite_key — configure per tenant manually
}

# Spring Batch operational tables — not tenant business data; low numeric PKs collide with other tables
SKIP_TABLE_PREFIXES = ("batch_",)

# Tables whose primary key column is not `id`
PK_COLUMNS: dict[str, str] = {
    "batch_job_execution": "job_execution_id",
    "batch_job_instance": "job_instance_id",
    "batch_step_execution": "step_execution_id",
    "batch_job_execution_context": "job_execution_id",
    "batch_step_execution_context": "step_execution_id",
}

# Composite-PK tables: duplicate when any FK column value is in id_map (handled generically)
NO_TENANT_ID_TABLES = {
    "batch_job_execution_params",
    "batch_step_execution_context",
    "batch_job_execution_context",
}

# FK column -> referenced table (avoids flat id_map collisions, e.g. created_by_id=4 vs event_type id=4)
UNIQUE_STRING_COLUMNS: dict[str, set[str]] = {
    "discount_code": {"code"},
    "event_ticket_transaction": {
        "stripe_payment_intent_id",
        "stripe_checkout_session_id",
        "payment_reference",
    },
    "user_payment_transaction": {
        "stripe_payment_intent_id",
        "stripe_checkout_session_id",
        "payment_reference",
    },
}
UNIQUE_SUFFIX = "_M2"

FK_COLUMN_TARGETS: dict[str, str] = {
    "created_by_id": "user_profile",
    "uploaded_by_id": "user_profile",
    "reviewed_by_admin_id": "user_profile",
    "user_profile_id": "user_profile",
    "event_type_id": "event_type_details",
    "event_id": "event_details",
    "event_details_id": "event_details",
    "parent_event_id": "event_details",
    "recurrence_series_id": "event_recurrence_series",
    "tenant_organization_id": "tenant_organization",
    "gallery_album_id": "gallery_album",
    "album_id": "gallery_album",
    "discount_codes_id": "discount_code",
    "ticket_type_id": "event_ticket_type",
    "transaction_id": "event_ticket_transaction",
    "ticket_transaction_id": "event_ticket_transaction",
    "live_update_id": "event_live_update",
    "score_card_id": "event_score_card",
    "membership_plan_id": "membership_plan",
    "focus_group_id": "focus_group",
    "event_focus_group_id": "focus_group",
    "event_sponsors_join_id": "event_sponsors_join",
    "sponsor_id": "event_sponsors",
    "job_execution_id": "batch_job_execution",
    "job_instance_id": "batch_job_instance",
    "step_execution_id": "batch_step_execution",
    "payment_request_id": "manual_payment_request",
    "category_id": "official_document_category",
    "official_document_category_id": "official_document_category",
    "year_bundle_id": "official_document_year_bundle",
    "poll_id": "event_poll",
    "poll_option_id": "event_poll_option",
    "attendee_id": "event_attendee",
    "primary_attendee_id": "event_attendee",
    "template_id": "promotion_email_template",
    "sent_by_id": "user_profile",
}


@dataclass
class InsertStmt:
    raw: str
    table: str
    columns: list[str]
    values: list[str]


def split_inserts(text: str) -> list[str]:
    parts = re.split(r"(?=INSERT INTO public\.)", text)
    return [p.strip() for p in parts if p.strip().startswith("INSERT INTO public.")]


def parse_insert(raw: str) -> InsertStmt | None:
    m = re.match(
        r"INSERT INTO public\.(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.*)\)\s*;?\s*$",
        raw,
        re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return None
    table = m.group(1)
    columns = [c.strip().strip('"') for c in m.group(2).split(",")]
    values = split_sql_values(m.group(3))
    if len(columns) != len(values):
        return None
    return InsertStmt(raw=raw, table=table, columns=columns, values=values)


def split_sql_values(values_str: str) -> list[str]:
    """Split SQL VALUES tuple respecting quoted strings."""
    out: list[str] = []
    cur: list[str] = []
    in_str = False
    i = 0
    s = values_str.strip()
    while i < len(s):
        ch = s[i]
        if in_str:
            cur.append(ch)
            if ch == "'":
                if i + 1 < len(s) and s[i + 1] == "'":
                    cur.append(s[i + 1])
                    i += 2
                    continue
                in_str = False
            i += 1
            continue
        if ch == "'":
            in_str = True
            cur.append(ch)
            i += 1
            continue
        if ch == ",":
            out.append("".join(cur).strip())
            cur = []
            i += 1
            continue
        cur.append(ch)
        i += 1
    if cur:
        out.append("".join(cur).strip())
    return out


def unquote_sql_string(val: str) -> str | None:
    val = val.strip()
    if val.upper() == "NULL":
        return None
    if val.startswith("'") and val.endswith("'"):
        inner = val[1:-1].replace("''", "'")
        return inner
    return None


def sql_int(val: str) -> int | None:
    val = val.strip()
    if val.upper() == "NULL":
        return None
    if re.fullmatch(r"-?\d+", val):
        return int(val)
    return None


def tenant_id_value(stmt: InsertStmt) -> str | None:
    if "tenant_id" not in stmt.columns:
        return None
    idx = stmt.columns.index("tenant_id")
    return unquote_sql_string(stmt.values[idx])


def pk_column(table: str) -> str:
    return PK_COLUMNS.get(table, "id")


def pk_value(stmt: InsertStmt) -> int | None:
    col = pk_column(stmt.table)
    if col not in stmt.columns:
        return None
    return sql_int(stmt.values[stmt.columns.index(col)])


def fk_columns(columns: list[str]) -> list[str]:
    return [c for c in columns if c.endswith("_id") or c in ("job_execution_id", "step_execution_id")]


def belongs_to_tenant(stmt: InsertStmt, tenant_job_exec_ids: set[int]) -> bool:
    tid = tenant_id_value(stmt)
    if tid == SOURCE_TENANT:
        return True
    if stmt.table == "batch_job_execution_params":
        if "parameter_value" in stmt.columns and "parameter_name" in stmt.columns:
            pname = unquote_sql_string(stmt.values[stmt.columns.index("parameter_name")])
            pval = unquote_sql_string(stmt.values[stmt.columns.index("parameter_value")])
            if pname == "tenantId" and pval == SOURCE_TENANT:
                return True
        if "job_execution_id" in stmt.columns:
            je = sql_int(stmt.values[stmt.columns.index("job_execution_id")])
            if je is not None and je in tenant_job_exec_ids:
                return True
        return False
    if stmt.table in NO_TENANT_ID_TABLES:
        for col in fk_columns(stmt.columns):
            n = sql_int(stmt.values[stmt.columns.index(col)])
            if n is not None and n in tenant_job_exec_ids:
                return True
    return False



def references_mapped_id(stmt: InsertStmt, id_maps: dict[str, dict[int, int]]) -> bool:
    for col in fk_columns(stmt.columns):
        if col == pk_column(stmt.table):
            continue
        n = sql_int(stmt.values[stmt.columns.index(col)])
        if n is None:
            continue
        target_table = FK_COLUMN_TARGETS.get(col)
        if target_table and n in id_maps.get(target_table, {}):
            return True
    return False


def replace_tenant_strings(val: str) -> str:
    if val.upper() == "NULL":
        return val
    if val.startswith("'") and val.endswith("'"):
        inner = val[1:-1].replace("''", "'")
        # Shared S3 objects remain under tenant_demo_002; duplication does not copy the bucket.
        if "eventapp-media-bucket" in inner and S3_TENANT_PATH_SOURCE in inner:
            return val
        inner = inner.replace(SOURCE_TENANT, TARGET_TENANT)
        inner = inner.replace(S3_TENANT_PATH_SOURCE, S3_TENANT_PATH_TARGET)
        return "'" + inner.replace("'", "''") + "'"
    s = unquote_sql_string(val)
    if s == SOURCE_TENANT:
        return f"'{TARGET_TENANT}'"
    return val


def remap_value(col: str, val: str, table: str, id_maps: dict[str, dict[int, int]]) -> str:
    val = replace_tenant_strings(val)
    pk_col = pk_column(table)
    n = sql_int(val)
    if n is None:
        return val
    if col == pk_col and n in id_maps.get(table, {}):
        return str(id_maps[table][n])
    target_table = FK_COLUMN_TARGETS.get(col)
    if target_table:
        table_map = id_maps.get(target_table, {})
        if n in table_map:
            return str(table_map[n])
        # Already duplicated offset id (e.g. 605152) — keep, do not null
        if target_table == "user_profile" and n >= ID_OFFSET and n in table_map.values():
            return str(n)
        # Shared demo event types (tenant_demo_001) referenced by tenant_demo_002 events
        if col == "event_type_id" and 1 <= n <= 20:
            return str(n + ID_OFFSET)
        # Stale cross-tenant FK (e.g. created_by_id from tenant_demo_001) — null for import safety
        if target_table == "user_profile":
            return "NULL"
    return val


def rebuild_insert(stmt: InsertStmt, id_maps: dict[str, dict[int, int]]) -> str:
    new_values = []
    for col, val in zip(stmt.columns, stmt.values, strict=True):
        remapped = remap_value(col, val, stmt.table, id_maps)
        if stmt.table == "discount_code" and col == "code":
            s = unquote_sql_string(remapped)
            if s and not s.endswith(UNIQUE_SUFFIX):
                remapped = "'" + s.replace("'", "''") + UNIQUE_SUFFIX + "'"
        unique_cols = UNIQUE_STRING_COLUMNS.get(stmt.table, set())
        if col in unique_cols:
            s = unquote_sql_string(remapped)
            if s and not s.endswith(UNIQUE_SUFFIX):
                remapped = "'" + s.replace("'", "''") + UNIQUE_SUFFIX + "'"
        new_values.append(remapped)
    cols = ", ".join(stmt.columns)
    vals = ", ".join(new_values)
    return f"INSERT INTO public.{stmt.table} ({cols}) VALUES ({vals});"


def collect_tenant_job_execution_ids(statements: list[InsertStmt]) -> set[int]:
    ids: set[int] = set()
    for stmt in statements:
        if stmt.table != "batch_job_execution_params":
            continue
        if "parameter_name" not in stmt.columns or "parameter_value" not in stmt.columns:
            continue
        pname = unquote_sql_string(stmt.values[stmt.columns.index("parameter_name")])
        pval = unquote_sql_string(stmt.values[stmt.columns.index("parameter_value")])
        if pname == "tenantId" and pval == SOURCE_TENANT and "job_execution_id" in stmt.columns:
            je = sql_int(stmt.values[stmt.columns.index("job_execution_id")])
            if je is not None:
                ids.add(je)
    return ids


def main() -> int:
    src = Path(
        sys.argv[1]
        if len(sys.argv) > 1
        else "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql"
    )
    dst = Path(
        sys.argv[2]
        if len(sys.argv) > 2
        else "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"
    )

    text = src.read_text(encoding="utf-8", errors="replace")
    dup_marker = f"-- ========== DUPLICATED TENANT: {TARGET_TENANT}"
    if dup_marker in text:
        text = text.split(dup_marker, 1)[0].rstrip()
        if "-- Generated duplicate of" in text:
            text = text.rsplit("-- Generated duplicate of", 1)[0].rstrip()
    raw_stmts = split_inserts(text)
    parsed: list[InsertStmt] = []
    for raw in raw_stmts:
        stmt = parse_insert(raw)
        if stmt:
            parsed.append(stmt)

    tenant_job_exec_ids = collect_tenant_job_execution_ids(parsed)

    # Expand batch job execution chain for tenant jobs
    for stmt in parsed:
        if stmt.table == "batch_job_execution":
            pk = pk_value(stmt)
            if pk is not None and pk in tenant_job_exec_ids:
                tenant_job_exec_ids.add(pk)

    selected: list[InsertStmt] = []
    selected_set: set[str] = set()

    def add(stmt: InsertStmt) -> None:
        if stmt.table in SKIP_DUPLICATE_TABLES:
            return
        if any(stmt.table.startswith(p) for p in SKIP_TABLE_PREFIXES):
            return
        if stmt.raw not in selected_set:
            selected_set.add(stmt.raw)
            selected.append(stmt)

    # Pass 1: direct tenant ownership
    for stmt in parsed:
        if belongs_to_tenant(stmt, tenant_job_exec_ids):
            add(stmt)

    # Per-table id maps (prevents FK collisions across tables with same numeric ids)
    id_maps: dict[str, dict[int, int]] = defaultdict(dict)

    def register_pk(stmt: InsertStmt) -> None:
        pk = pk_value(stmt)
        if pk is not None:
            id_maps[stmt.table][pk] = pk + ID_OFFSET

    for stmt in selected:
        register_pk(stmt)

    # Pass 2+: FK closure for child rows without tenant_id
    changed = True
    while changed:
        changed = False
        for stmt in parsed:
            if stmt.raw in selected_set:
                continue
            if tenant_id_value(stmt) not in (None, SOURCE_TENANT) and tenant_id_value(stmt) != SOURCE_TENANT:
                if tenant_id_value(stmt) is not None:
                    continue
            if references_mapped_id(stmt, id_maps):
                add(stmt)
                pk = pk_value(stmt)
                if pk is not None and pk not in id_maps[stmt.table]:
                    register_pk(stmt)
                    changed = True

    # Re-add batch execution rows tied to tenant job ids after id_map growth
    for stmt in parsed:
        if stmt.table == "batch_job_execution" and pk_value(stmt) in tenant_job_exec_ids:
            add(stmt)
            register_pk(stmt)
        if stmt.table == "batch_job_execution_params":
            if belongs_to_tenant(stmt, tenant_job_exec_ids):
                add(stmt)

    # Preserve original file order for duplicates
    ordered = [s for s in parsed if s.raw in selected_set]

    duplicates = [rebuild_insert(s, id_maps) for s in ordered]

    by_table: dict[str, int] = defaultdict(int)
    for s in ordered:
        by_table[s.table] += 1

    header = f"""-- Generated duplicate of {SOURCE_TENANT} rows for {TARGET_TENANT}
-- Source: {src.name}
-- ID offset: +{ID_OFFSET} on duplicated PK/FK integer ids (column-aware; timestamps preserved)
-- Original rows preserved; duplicated block appended at end in same dependency order.
-- Rows duplicated: {len(duplicates)} across {len(by_table)} tables

"""

    dup_section = "\n\n".join(
        [
            f"-- ========== DUPLICATED TENANT: {TARGET_TENANT} (from {SOURCE_TENANT}) ==========",
            *duplicates,
        ]
    )

    # Optional sequence bump for tables using sequence_generator
    footer = f"""
-- Suggested sequence reset after import (adjust if your DB uses different max ids):
-- SELECT setval('sequence_generator', (SELECT COALESCE(MAX(id), 1) FROM (
--   SELECT id FROM user_profile UNION ALL SELECT id FROM event_details UNION ALL SELECT id FROM event_media
-- ) t));
"""

    dst.write_text(
        text.rstrip() + "\n\n" + header + dup_section + footer + "\n",
        encoding="utf-8",
    )

    print(f"Wrote: {dst}")
    print(f"Parsed INSERT statements: {len(parsed)}")
    print(f"Duplicated {SOURCE_TENANT} rows: {len(duplicates)}")
    total_mappings = sum(len(m) for m in id_maps.values())
    print(f"ID mappings: {total_mappings} across {len(id_maps)} tables")
    print("Top tables:")
    for table, count in sorted(by_table.items(), key=lambda x: -x[1])[:20]:
        print(f"  {count:4d}  {table}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
