from pathlib import Path

p = Path("code_html_template/SQLS/corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql")
text = p.read_text(encoding="utf-8")
marker = "-- ========== DUPLICATED TENANT:"
dup = text.split(marker, 1)[1] if marker in text else ""
print("dup section tenant_demo_002 count:", dup.count("tenant_demo_002"))
print("dup section mosc count:", dup.count("mosc_malankara_orthodox_2"))
print("corrupted timestamp pattern:", "500004 500003" in dup)
