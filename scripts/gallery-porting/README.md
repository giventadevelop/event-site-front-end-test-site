# Static → Dynamic Gallery Porting

Bulk-import MOSC static gallery albums (29 albums, ~315 photos) into the dynamic `gallery_album` + `event_media` API **without backend code changes**.

Full HTML guide: **documentation/gallery_porting/GALLERY_STATIC_TO_DYNAMIC_PORTING_GUIDE.html**

## Prerequisites

1. `.env.local` with:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_TENANT_ID`
   - `API_JWT_USER` / `API_JWT_PASS`
2. Backend running and reachable (service JWT auth).
3. For `--media-mode file`: Next.js dev server running (`npm run dev`) and image files under `public/images/mosc/gallery/`

## Gallery categories (important)

Albums require `gallery_category_id`. After a **fresh schema rebuild**, the `gallery_category` table is often **empty**. If you import in that state:

- Import **succeeds** (albums + photos are created).
- Every album has **`gallery_category_id = NULL`**.
- Console shows `No category id for slug …`.

**Fix:** run the category seed + backfill script (safe to re-run; merges duplicate category rows by slug/display name):

```bash
npm run gallery:seed-categories
```

This creates 8 category rows and PATCHes existing albums using `static_slug=` in the album description.

**Alternative:** SQL migrations in `documentation/gallery_album_category_year_enhancements/migrations/` (`002_seed_gallery_category.sql`, then `004_backfill_gallery_album_category_year.sql`).

Current `npm run gallery:import` also calls `ensureGalleryCategories()` before import, so new runs seed categories automatically. Use `gallery:seed-categories` when albums were already imported with NULL categories.

## Scripts to run (typical order)

### Fresh database — full port

```bash
# 1. Build manifest from static TS sources
npm run gallery:extract-manifest

# 2. Validate (optional)
npm run gallery:import:dry

# 3. Import albums + photos (auto-seeds categories if missing)
npm run gallery:import

# 4. If albums were imported earlier WITHOUT categories, backfill:
npm run gallery:seed-categories
```

### Already imported with NULL categories only

```bash
npm run gallery:seed-categories
# or dry-run first:
npm run gallery:seed-categories:dry
```

### Phased import

```bash
npm run gallery:extract-manifest
npm run gallery:seed-categories          # optional but recommended first
npm run gallery:import:albums
npm run gallery:import:media
```

## npm script reference

| Command | Script file | Purpose |
|---------|-------------|---------|
| `gallery:extract-manifest` | `extract-static-gallery-manifest.mjs` | Parse static pages → JSON manifest |
| `gallery:import:dry` | `import-static-gallery-to-api.mjs --dry-run` | Log payloads only |
| `gallery:import` | `import-static-gallery-to-api.mjs` | Full import (URL mode) |
| `gallery:import:albums` | `… --albums-only` | Album rows only |
| `gallery:import:media` | `… --media-only` | Photos only |
| `gallery:seed-categories` | `seed-gallery-categories-and-backfill-albums.mjs` | Seed 8 categories + backfill FK |
| `gallery:seed-categories:dry` | `… --dry-run` | Preview seed/backfill |

## Shared library

| File | Purpose |
|------|---------|
| `gallery-porting-lib.mjs` | JWT, manifest parsing, `GALLERY_CATEGORY_SEEDS`, category slug map |
| `import-static-gallery-to-api.mjs` | POST albums + event media |
| `seed-gallery-categories-and-backfill-albums.mjs` | POST categories + PATCH albums |

## Import flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Log actions only |
| `--albums-only` | Create album rows, skip photos |
| `--media-only` | Attach photos to existing albums (match `static_slug=` in description) |
| `--slug <id>` | Single album, e.g. `russia-visit` |
| `--limit N` | First N albums only |
| `--batch-size N` | Photos per batch (default 8) |
| `--media-mode url` | POST `event_media` with `fileUrl` (default) |
| `--media-mode file` | Multipart upload via Next proxy (needs local files + running app) |
| `--force` | Re-import even if album/media exists |
| `--manifest path` | Use pre-generated JSON instead of live parse |

## Output files

| File | Contents |
|------|----------|
| `static-gallery-manifest.json` | Extracted album/photo source data |
| `import-report.json` | Per-album import ids, counts, errors |
| `category-backfill-report.json` | Category seed + album PATCH results |

## Verify

1. DB: `SELECT COUNT(*) FROM gallery_category WHERE tenant_id = 'tenant_demo_002';` → expect **8**.
2. DB: `gallery_album.gallery_category_id` should be non-null for static imports (29 albums).
3. UI: http://localhost:3000/gallery — category labels on album cards.
4. Admin: http://localhost:3000/admin/gallery/albums
