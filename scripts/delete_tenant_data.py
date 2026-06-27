#!/usr/bin/env python3
"""Delete all rows for a tenant (tables with tenant_id) in local Docker Postgres."""

from __future__ import annotations

import subprocess
import sys

TENANT = sys.argv[1] if len(sys.argv) > 1 else "mosc_malankara_orthodox_2"
CONTAINER = "event_site_manager_db-postgresql-1"
DB_USER = "event_site_admin"
DB_NAME = "event_site_manager_db"


def psql(sql: str) -> str:
    cmd = [
        "docker",
        "exec",
        CONTAINER,
        "psql",
        "-U",
        DB_USER,
        "-d",
        DB_NAME,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql,
    ]
    return subprocess.check_output(cmd, text=True, stderr=subprocess.STDOUT)


def main() -> int:
    tables = psql(
        "SELECT table_name FROM information_schema.columns "
        "WHERE table_schema='public' AND column_name='tenant_id' ORDER BY 1;"
    )
    table_list = [ln.strip() for ln in tables.splitlines() if ln.strip() and not ln.startswith("(")]
    print(f"Deleting tenant_id = '{TENANT}' from {len(table_list)} tables...")
    for table in reversed(table_list):
        try:
            out = psql(f"DELETE FROM public.{table} WHERE tenant_id = '{TENANT}';")
            if "DELETE" in out:
                print(out.strip())
        except subprocess.CalledProcessError as e:
            print(f"WARN {table}: {e.output.strip()}")
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
