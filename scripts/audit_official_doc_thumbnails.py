#!/usr/bin/env python3
"""Audit official document thumbnail_url values in ordered SQL."""
import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "code_html_template/SQLS/corrected_event_media_inserts.ordered.sql"
text = path.read_text(encoding="utf-8", errors="replace")

# Only complete single-line INSERTs for event_media official docs
pattern = re.compile(
    r"INSERT INTO public\.event_media \(([^)]+)\) VALUES \((.*?)\);",
    re.DOTALL,
)

def split_values(s: str) -> list[str]:
    out, cur, in_str, esc = [], [], False, False
    for ch in s:
        if esc:
            cur.append(ch)
            esc = False
            continue
        if ch == "\\":
            cur.append(ch)
            esc = True
            continue
        if ch == "'":
            in_str = not in_str
            cur.append(ch)
            continue
        if ch == "," and not in_str:
            out.append("".join(cur).strip())
            cur = []
            continue
        cur.append(ch)
    if cur:
        out.append("".join(cur).strip())
    return out

issues = []
ok = 0
for m in pattern.finditer(text):
    raw = m.group(0)
    if "is_event_management_official_document" not in raw:
        continue
    if ", true," not in raw.lower() and ", true," not in raw.replace("TRUE", "true"):
        # check true flag
        if "true, 8" not in raw and "true, 6" not in raw:  # rough
            pass
    cols = [c.strip().strip('"') for c in m.group(1).split(",")]
    vals = split_values(m.group(2))
    if len(cols) != len(vals):
        if "[[MOSC_" in raw:
            issues.append(("MULTILINE_BROKEN_INSERT", raw[:80]))
        continue
    row = dict(zip(cols, vals))
    if row.get("is_event_management_official_document", "").upper() != "TRUE":
        continue
    tenant = row.get("tenant_id", "").strip("'")
    rec_id = row.get("id")
    title = row.get("title", "").strip("'")
    thumb = row.get("thumbnail_url", "NULL")
    if thumb == "NULL" or thumb.upper() == "NULL":
        issues.append((tenant, rec_id, title, "NO_THUMBNAIL"))
        continue
    thumb_clean = thumb.strip("'").split("?")[0]
    if thumb_clean.lower().endswith(".pdf"):
        issues.append((tenant, rec_id, title, "THUMB_IS_PDF", thumb_clean))
        continue
    if tenant == "mosc_malankara_orthodox_2" and "tenant_demo_002" in thumb_clean:
        # Expected: duplicated MOSC rows share S3 objects under tenant_demo_002 prefix
        ok += 1
        continue
    if tenant == "tenant_demo_002" and "mosc_malankara_orthodox_2" in thumb_clean:
        issues.append((tenant, rec_id, title, "STALE_MOSC_PATH", thumb_clean))
        continue
    ok += 1

print(f"OK official docs with image thumbnail: {ok}")
print(f"Issues: {len(issues)}")
for item in issues[:40]:
    print(item)
if len(issues) > 40:
    print(f"... and {len(issues)-40} more")
