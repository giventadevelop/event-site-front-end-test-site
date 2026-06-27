#!/usr/bin/env python3
"""Compare tenant row counts in SQL file (line-based, multiline-safe) and optional DB."""

from __future__ import annotations

import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

SOURCE = "tenant_demo_002"
TARGET = "mosc_malankara_orthodox_2"
MARKER = f"-- ========== DUPLICATED TENANT: {TARGET}"
INSERT_START = re.compile(r"^INSERT INTO public\.(\w+)", re.I)


def split_insert_blocks(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    blocks: list[tuple[str, str]] = []
    current_table: str | None = None
    buf: list[str] = []
    for line in lines:
        m = INSERT_START.match(line.strip())
        if m:
            if buf and current_table:
                blocks.append((current_table, "\n".join(buf)))
            current_table = m.group(1)
            buf = [line]
        elif buf:
            buf.append(line)
            if line.rstrip().endswith(";"):
                blocks.append((current_table or "?", "\n".join(buf)))
                buf = []
                current_table = None
    if buf and current_table:
        blocks.append((current_table, "\n".join(buf)))
    return blocks


def count_tenant(blocks: list[tuple[str, str]], tenant: str) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    needle = f"'{tenant}'"
    for table, body in blocks:
        if needle in body:
            counts[table] += 1
    return counts


def db_counts(tenant: str) -> dict[str, int]:
    """Query local docker postgres for tables with tenant_id column."""
    sql = """
SELECT c.table_name,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I where tenant_id = %L', c.table_name, '{tenant}'), false, true, '')))[1]::text::int AS cnt
FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.column_name = 'tenant_id'
ORDER BY c.table_name;
""".replace("{tenant}", tenant.replace("'", "''"))
    cmd = [
        "docker",
        "exec",
        "event_site_manager_db-postgresql-1",
        "psql",
        "-U",
        "event_site_admin",
        "-d",
        "event_site_manager_db",
        "-t",
        "-A",
        "-c",
        sql,
    ]
    out = subprocess.check_output(cmd, text=True, stderr=subprocess.STDOUT)
    counts: dict[str, int] = {}
    for line in out.splitlines():
        if "|" not in line:
            continue
        table, cnt = line.split("|", 1)
        counts[table] = int(cnt)
    return counts


def main() -> int:
    path = Path(
        sys.argv[1]
        if len(sys.argv) > 1
        else "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"
    )
    text = path.read_text(encoding="utf-8", errors="replace")
    idx = text.find(MARKER)
    base_text = text[:idx] if idx >= 0 else text
    dup_text = text[idx:] if idx >= 0 else ""

    base_blocks = split_insert_blocks(base_text)
    dup_blocks = split_insert_blocks(dup_text)
    all_blocks = split_insert_blocks(text)

    base_sql = count_tenant(base_blocks, SOURCE)
    dup_sql = count_tenant(dup_blocks, TARGET)
    all_source = count_tenant(all_blocks, SOURCE)

    print(f"File: {path}\n")
    print("=== SQL INSERT counts (tenant string in statement) ===")
    print(f"{'table':<42} {'src_base':>8} {'src_all':>8} {'mosc_dup':>8}  note")
    print("-" * 85)

    tables = sorted(set(base_sql) | set(all_source) | set(dup_sql))
    missing = []
    for t in tables:
        sb = base_sql.get(t, 0)
        sa = all_source.get(t, 0)
        d = dup_sql.get(t, 0)
        ref = sa if sa else sb
        if ref > 0 and d == 0:
            note = "MISSING in dup"
            missing.append(t)
        elif ref > 0 and d < ref:
            note = "PARTIAL in dup"
        elif ref > 0 and d == ref:
            note = "OK"
        else:
            note = ""
        if ref > 0 or d > 0:
            print(f"{t:<42} {sb:8d} {sa:8d} {d:8d}  {note}")

    print(f"\nSource ({SOURCE}) tables in full file: {len(all_source)}, inserts: {sum(all_source.values())}")
    print(f"Dup ({TARGET}) section: {len(dup_sql)}, inserts: {sum(dup_sql.values())}")
    print(f"Missing in dup block: {len(missing)} tables")

    if "--db" in sys.argv:
        print("\n=== Local PostgreSQL (docker) row counts ===")
        try:
            src_db = db_counts(SOURCE)
            tgt_db = db_counts(TARGET)
        except Exception as e:
            print(f"DB query failed: {e}")
            return 1
        print(f"{'table':<42} {'db_src':>8} {'db_mosc':>8}  note")
        print("-" * 70)
        for t in sorted(set(src_db) | set(tgt_db)):
            s, m = src_db.get(t, 0), tgt_db.get(t, 0)
            if s == 0 and m == 0:
                continue
            note = ""
            if s > 0 and m == 0:
                note = "NOT IMPORTED"
            elif s > 0 and m < s:
                note = "PARTIAL IMPORT"
            elif s == m and s > 0:
                note = "OK"
            print(f"{t:<42} {s:8d} {m:8d}  {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
