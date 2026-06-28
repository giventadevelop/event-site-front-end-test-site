# Official document duplicates — cause, purge, and prevention

## Summary

Triple cards on the public downloads page (e.g. three identical “Download FCRA First Quarter Of - 2020-21” entries) are **duplicate rows in the database**, not a scrape bug. The migration manifest (`url-list.full-remapped.json`) has **10 distinct FCRA files** (quarters across years). The same logical document was uploaded more than once during migration runs.

The public downloads page also **deduplicates in memory** (`src/lib/downloads/deduplicateOfficialDocuments.ts`) so users see one card per file. That does not remove rows from the DB — use the purge script for permanent cleanup.

---

## Dedupe key (DB + UI + scripts)

All layers use the same rule:

1. **Primary (logical document):** `officialDocumentCategoryId` + `hierarchyPath` (or `[[MOSC_TREE_PATH]]` from description). This collapses re-uploads that received new S3 URLs and suffixed filenames (`_1782619014443_67398298`).
2. **Fallback:** normalized `fileUrl` when no tree path is set.
3. **Last resort:** category + logical filename (S3 suffix stripped).

**Keeper row** when multiple match: lowest `displayPriority` / `priorityRanking`, then lowest `id`.

| Layer | File |
|-------|------|
| Public downloads API | `src/lib/downloads/deduplicateOfficialDocuments.ts` |
| Migration / purge | `scripts/mosc-in-migration/official-doc-dedupe.mjs` |
| Purge admin script | `scripts/mosc-in-migration/purge-duplicate-official-docs.mjs` |

---

## Purge duplicate rows (permanent delete)

Requires `.env.local` with `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_TENANT_ID`, `API_JWT_USER`, `API_JWT_PASS`. Backend must be running.

### Dry run (no deletes)

```bash
npm run mosc:migration:purge-duplicates:dry
```

Writes a JSON report under `scripts/mosc-in-migration/_purge-duplicates-report-<timestamp>.json` listing every row that would be deleted and which row is kept.

### Delete all duplicates

```bash
npm run mosc:migration:purge-duplicates
```

### Delete duplicates in one category only

```bash
npm run mosc:migration:purge-duplicates:fcra
# or
node scripts/mosc-in-migration/purge-duplicate-official-docs.mjs --confirm --category-slug fcra-statements
```

**Flags**

| Flag | Meaning |
|------|---------|
| `--dry-run` | Default when `--confirm` is omitted |
| `--confirm` | Permanently `DELETE /api/event-medias/{id}` for duplicate rows |
| `--category-slug <slug>` | Limit to one official document category |

---

## Upload prevention (migration)

`upload-manifest-to-official-docs.mjs` was hardened so re-runs do not create duplicates for **any** category:

1. **Manifest dedupe** — duplicate entries in the JSON manifest are dropped before upload (`deduplicateManifestItems`).
2. **DB dedupe always on** — skip upload when a matching row exists, including in `--missing-only` mode (previously skipped dedupe when `--missing-only` was set).
3. **In-session dedupe** — after each successful upload, keys are registered so the same batch cannot upload twice.
4. **`computeMissingManifestItems`** — compares manifest keys against **all** official documents in DB (not only Malankara categories).

Dedupe is **skipped only** with `--force` (deletes existing matches, then re-uploads).

### Safe re-upload workflow

```bash
# 1. Purge existing DB duplicates (once)
npm run mosc:migration:purge-duplicates

# 2. Upload missing files only (will skip anything already present)
npm run mosc:migration:full:upload:missing
```

---

## FCRA example

- **Manifest:** 10 unique FCRA items in `url-list.full-remapped.json`.
- **Symptom:** Three identical cards for “First Quarter 2020-21” → multiple DB rows with the **same category + hierarchy path** but different S3 `fileUrl` / suffixed `fileName` from repeated migration runs.
- **Year `2016` on cards:** legacy upload path metadata (`/uploads/2016/04/`), not the document’s reporting year.

---

## Related files

- `scripts/mosc-in-migration/README.md` — full migration guide
- `scripts/mosc-in-migration/upload-manifest-to-official-docs.mjs` — manifest upload
- `scripts/mosc-in-migration/official-docs-query.mjs` — DB fetch / match helpers
- `src/app/mosc-redesign/(syro)/downloads/ApiServerActions.ts` — public API with search + dedupe
