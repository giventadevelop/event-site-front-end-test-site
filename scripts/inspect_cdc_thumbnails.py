#!/usr/bin/env python3
"""Inspect CDC official document thumbnail URLs in ordered SQL."""
import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql"
text = path.read_text(encoding="utf-8", errors="replace")

# Merge broken multiline INSERTs (lines starting with [[MOSC_ are continuations)
lines = text.splitlines()
merged: list[str] = []
buf = ""
for line in lines:
    if line.startswith("INSERT INTO public."):
        if buf:
            merged.append(buf)
        buf = line
    elif buf and (line.startswith("[[MOSC_") or (not line.strip().endswith(";") and buf)):
        buf += " " + line.strip()
    elif buf:
        buf += " " + line.strip()
        if line.strip().endswith(";"):
            merged.append(buf)
            buf = ""
    elif line.strip():
        merged.append(line)
if buf:
    merged.append(buf)

titles = [
    "CDC_Poster.pdf",
    "CDC-Folder-2026",
    "CDC-Kalpana-2026-Keralam",
    "CDC-Kalpana-2026-English",
    "CDC-Book-2026_compressed_compressed",
]

cols_pattern = re.compile(
    r"INSERT INTO public\.event_media \(([^)]+)\) VALUES \((.*)\);?\s*$",
    re.DOTALL,
)

for raw in merged:
    if "event_media" not in raw or "CDC" not in raw:
        continue
    m = cols_pattern.match(raw)
    if not m:
        continue
    cols = [c.strip().strip('"') for c in m.group(1).split(",")]
    # naive split on commas outside quotes - use simpler title match
    for title in titles:
        if f"'{title}'" not in raw and f"'{title.split('.')[0]}'" not in raw:
            continue
        if title not in raw:
            continue
        idx_id = cols.index("id") if "id" in cols else 0
        idx_tenant = cols.index("tenant_id")
        idx_title = cols.index("title")
        idx_thumb = cols.index("thumbnail_url") if "thumbnail_url" in cols else None
        idx_file = cols.index("file_url") if "file_url" in cols else None
        # Extract values with regex for key fields
        vm = re.search(
            r"VALUES \((\d+), '([^']+)'[^,]*,\s*'((?:[^']|'')*)'",
            raw,
        )
        if not vm:
            continue
        rec_id, tenant = vm.group(1), vm.group(2)
        thumb_m = re.search(r", (NULL|'(?:[^']|'')*'), (NULL|'(?:[^']|'')*'), (NULL|'(?:[^']|'')*'), '", raw)
        # Better: find thumbnail_url position
        thumb_url = None
        if idx_thumb is not None:
            tmatch = re.search(
                r"thumbnail_url.*?VALUES.*?(?:,\s*){20}(NULL|'https?://[^']*')",
                raw,
                re.DOTALL,
            )
        # Simpler approach: find all https URLs
        urls = re.findall(r"'(https://[^']+)'", raw)
        thumb_urls = [u for u in urls if "thumbnail" in u.lower() or "MOSC_Download" in u]
        file_urls = [u for u in urls if u.endswith(".pdf") or ".pdf?" in u]
        print(f"\n=== {title} | id={rec_id} tenant={tenant} ===")
        print(f"  file_url: {file_urls[0][:120] if file_urls else 'NONE'}...")
        print(f"  thumbnail_url: {thumb_urls[0] if thumb_urls else 'NONE'}")
        for u in urls:
            if "tenant_demo_002" in u and tenant == "mosc_malankara_orthodox_2":
                print("  ** MISMATCH: MOSC row still has tenant_demo_002 in URL **")
                break

# Full URL dump for CDC_Poster both tenants
print("\n=== FULL URL LIST CDC_Poster ===")
for rec_id in (10993, 610993):
    pat = f"VALUES ({rec_id}, "
    i = text.find(pat)
    if i < 0:
        print("missing", rec_id)
        continue
    chunk = text[i : i + 4000]
    urls = re.findall(r"'(https://[^']+)'", chunk)
    print(f"\nid={rec_id}:")
    for u in urls:
        print(" ", u.split("?")[0])
