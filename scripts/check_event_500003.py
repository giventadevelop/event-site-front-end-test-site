#!/usr/bin/env python3
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8", errors="replace")
marker = "-- ========== DUPLICATED TENANT: mosc_malankara_orthodox_2"
idx = text.find(marker)
if idx < 0:
    raise SystemExit("marker not found")
block = text[idx:]
for m in re.finditer(
    r"INSERT INTO public\.event_details.*?VALUES \(500003, 'mosc_malankara_orthodox_2'.*?\);",
    block,
    re.S,
):
    s = m.group(0)
    chunk = s.split("'events@example.com', ", 1)[1]
    print("created_by_id / event_type_id snippet:", chunk[:120])
    break
