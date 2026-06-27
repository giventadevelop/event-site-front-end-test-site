#!/usr/bin/env python3
"""Patch MOSC duplicated S3 URLs to source tenant paths (objects not copied in S3)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

SOURCE_TENANT = "tenant_demo_002"
TARGET_TENANT = "mosc_malankara_orthodox_2"
S3_TENANT_SEGMENT = f"tenantId/{TARGET_TENANT}"
S3_SOURCE_SEGMENT = f"tenantId/{SOURCE_TENANT}"

# Columns that store shared S3 object keys duplicated from tenant_demo_002
URL_COLUMNS = (
    "file_url",
    "pre_signed_url",
    "thumbnail_url",
    "thumbnail_pre_signed_url",
    "featured_video_url",
)


def patch_mosc_s3_urls_in_sql(text: str) -> tuple[str, int]:
    """Rewrite mosc S3 paths to tenant_demo_002 inside the duplicated tenant block."""
    marker = f"-- ========== DUPLICATED TENANT: {TARGET_TENANT}"
    marker_idx = text.find(marker)
    if marker_idx == -1:
        # Fallback: rewrite any remaining mosc media prefix in eventapp URLs
        count = text.count(S3_TENANT_SEGMENT)
        if count == 0:
            return text, 0
        return text.replace(S3_TENANT_SEGMENT, S3_SOURCE_SEGMENT), count

    head = text[:marker_idx]
    tail = text[marker_idx:]
    count = tail.count(S3_TENANT_SEGMENT)
    tail = tail.replace(S3_TENANT_SEGMENT, S3_SOURCE_SEGMENT)
    return head + tail, count


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    targets = [
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql",
        root / "code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql",
    ]
    if len(sys.argv) > 1:
        targets = [Path(p) for p in sys.argv[1:]]

    for path in targets:
        if not path.is_file():
            print(f"skip (missing): {path}")
            continue
        original = path.read_text(encoding="utf-8")
        patched, count = patch_mosc_s3_urls_in_sql(original)
        if count == 0:
            print(f"no changes: {path}")
            continue
        path.write_text(patched, encoding="utf-8")
        print(f"patched {path.name}: {count} S3 path segment(s) -> {SOURCE_TENANT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
