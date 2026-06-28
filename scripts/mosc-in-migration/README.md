# Migration from mosc.in — download scripts & bulk upload

**HTML user manual (catalog, copyable commands):** [`documentation/mosc_document_downloads_page/MOSC_Document_Download_User_Manual.html`](../../documentation/mosc_document_downloads_page/MOSC_Document_Download_User_Manual.html) — open in a browser; follows `.cursor/rules/html_documentation_styling_guide.mdc`.

This folder contains **one-off tooling** to help migrate official documents from the legacy site (`mosc.in`) into this app’s **official document library** (categories + year bundles + bulk upload). It runs **outside** the Next.js browser app.

> **Naming:** “Bulk load” in the admin UI is the feature this doc ties to. It is **not** related to any sports “World Cup” — use the same **bulk tenant official** upload flow documented below.

---

## Legal, copyright, and ethics

1. **You must have the right** to copy and republish each file (copyright, license, or written permission from the rights holder and/or Malankara Orthodox Church / MOSC as applicable).
2. **Terms of use:** Comply with `mosc.in` terms of service and any notices on the pages you mirror.
3. **robots.txt:** The downloader fetches `/robots.txt` and **skips** URLs whose path matches a `Disallow` rule for `User-agent: *`. Override only with `--ignore-robots` for debugging — not for bypassing policy in production.
4. **Rate limits:** Use a sensible `delayMs` (default 1500 ms between requests). Increase if the remote server is slow or if you are asked to back off.
5. **No crawling:** The script does **not** spider the site. You maintain an explicit **manifest** of URLs (`url-list.json`). This avoids accidental mass scraping.

---

## Download folder (default)

| Setting | Value |
|--------|--------|
| **Default root** | `C:\E_Drive\code_backup\mosc_downloads` |
| **Override** | Environment variable `MOSC_DOWNLOAD_ROOT` |

The repo script `config.mjs` defines the default; on non-Windows it falls back to `~/mosc_downloads`.

Create the folder once (already expected for your machine):

```text
C:\E_Drive\code_backup\mosc_downloads
```

Downloads are stored as:

```text
<MOSC_DOWNLOAD_ROOT>/<categorySlug>/<year>/<filename>
```

Example:

```text
C:\E_Drive\code_backup\mosc_downloads\synod-minutes\2024\minutes-jan.pdf
```

This layout matches how you will **select files in bulk** in the admin UI (one category + one year per batch).

---

## Prerequisites

- **Node.js** 20+ (matches project `.nvmrc`).
- A **manifest** file listing only URLs you are allowed to fetch (copy `url-list.example.json` to `url-list.json` and edit).

---

## Step 1 — Build `url-list.json`

### Option A — Generated list from mosc.in `/downloads/` (committed)

The repo includes **`url-list.mosc-in.generated.json`**: ~288 direct file URLs discovered from [https://mosc.in/downloads/](https://mosc.in/downloads/) (main page + subsection pages). Regenerate after site changes:

```bash
node scripts/mosc-in-migration/_scrape-downloads-deep.mjs --write-url-list
```

This overwrites `url-list.mosc-in.generated.json`. Use it as `--manifest` for fetch (see Step 3).

### Option B — Manual `url-list.json`

1. Copy `url-list.example.json` to `url-list.json` (keep it **out of git** if it contains internal URLs; `url-list.json` is listed in `.gitignore` in this folder).
2. For each asset:
   - `url` — full HTTPS URL to the file (PDF, image, etc.).
   - `categorySlug` — must match an **official document category** slug in your tenant (same slugs as `/admin/official-document-categories` and bulk upload).
   - `year` — calendar year for the official-document year field.
   - `filename` — optional; defaults to the last segment of the URL path.

3. Optional manifest fields:
   - `delayMs` — milliseconds between requests (default `1500`).
   - `userAgent` — identify your script responsibly.
   - `siteOrigin` — used to fetch `https://mosc.in/robots.txt` (change if you use another host).
   - `fetchRobotsTxt` — set `false` only if you intentionally skip robots (not recommended).

---

## Step 2 — Dry run

From the **repository root**:

```bash
node scripts/mosc-in-migration/fetch-urls.mjs --manifest scripts/mosc-in-migration/url-list.json --dry-run
```

Confirm paths under `C:\E_Drive\code_backup\mosc_downloads` (or your `MOSC_DOWNLOAD_ROOT`).

---

## Step 3 — Download

**Using the generated mosc.in downloads manifest:**

```bash
node scripts/mosc-in-migration/fetch-urls.mjs --manifest scripts/mosc-in-migration/url-list.mosc-in.generated.json --ignore-robots --skip-existing
```

(`--ignore-robots` only if paths under `/uploads/` are blocked by `robots.txt`; omit for production when policy allows. `--skip-existing` avoids re-downloading files already on disk.)

**Using a local `url-list.json`:**

```bash
node scripts/mosc-in-migration/fetch-urls.mjs --manifest scripts/mosc-in-migration/url-list.json
```

### Title-folder mirror mode (new)

If you need a **content hierarchy mirror** (page title -> child title -> file), use:

```bash
node scripts/mosc-in-migration/mirror-downloads-tree.mjs --ignore-robots --skip-existing
```

This traverses `/downloads/` pages and writes files under:

```text
C:\E_Drive\code_backup\mosc_downloads\mosc-in-downloads-by-title\<page-title>\<child-title>\<filename>
```

Use dry-run first:

```bash
node scripts/mosc-in-migration/mirror-downloads-tree.mjs --dry-run
```

Options:

| Flag | Meaning |
|------|--------|
| `--dry-run` | Print targets only; no files written (except robots snapshot). |
| `--skip-existing` | Skip if destination file already exists. |
| `--ignore-robots` | Do not skip URLs blocked by `robots.txt` (**use only for local testing**). |

After a successful run, check:

- `C:\E_Drive\code_backup\mosc_downloads\_robots_snapshot.txt` — copy of `robots.txt` when fetched.
- `C:\E_Drive\code_backup\mosc_downloads\_fetch-report-<timestamp>.json` — per-URL result log.

---

## Step 4 — Bulk load into the app (official documents UI)

The application uploads through the **proxied** backend:

- `POST /api/proxy/event-medias/upload/bulk-tenant-official`

The **admin UI** at **`/admin/official-documents`** builds that request for you:

1. Sign in as a tenant admin.
2. Choose **category** (slug must match the folder name you used under `mosc_downloads`, e.g. `synod-minutes`).
3. Set **year** to match the subfolder (e.g. `2024`).
4. Use **folder** or **multi-file** selection and pick all files under  
   `C:\E_Drive\code_backup\mosc_downloads\<categorySlug>\<year>\`.
5. Submit **bulk upload**.

Operational tips:

- **Title prefix / description / public** — same as normal bulk upload; see the official documents page.
- **Tenant ID** — must match `NEXT_PUBLIC_TENANT_ID` in your environment.
- If categories are missing, create them first under **`/admin/official-document-categories`** with the same slugs you used in the manifest.

There is **no separate “World Cup” feature** in code — the migration path is: **script download → local folder → bulk upload**.

---

## Step 5 — Auto-upload mirror hierarchy (scripted)

When you already have the mirrored folder tree (for example under
`C:\E_Drive\code_backup\mosc_downloads\mosc-in-downloads-by-title\Downloads`), use:

```bash
npm run mosc:migration:upload:mirror:dry
```

then:

```bash
npm run mosc:migration:upload:mirror
```

Script file:

```text
scripts/mosc-in-migration/upload-mirror-to-official-docs.mjs
```

What it does:

1. Reads `_mirror-report-*.json`.
2. Infers category from the first folder segment under `Downloads`.
3. Auto-creates missing official-document categories (tenant-scoped).
4. Uploads each file via `/api/proxy/event-medias/upload/tenant-official-document`.
5. Patches uploaded rows with hierarchy metadata and `priorityRanking` so public listing can render tree + priority-first order.
6. Performs safe dedupe before upload: skips files that already exist by `(tenant, category, year, hierarchy_path)`.

### Malankara manifest upload (direct backend API)

Uploads from `url-list.malankara-remapped.json` using **direct Spring Boot** calls (not Next.js proxy):

```bash
# Requires backend on :8080, API_JWT_* in .env.local, PDFs under MOSC_DOWNLOAD_ROOT
set "MOSC_DOWNLOAD_ROOT=f:\project_workspace\mosc-temp\.mosc-downloads"
npm run mosc:migration:malankara:upload:dry
npm run mosc:migration:malankara:upload
```

Script: `scripts/mosc-in-migration/upload-manifest-to-official-docs.mjs`  
Shared auth: `scripts/mosc-in-migration/migration-api-lib.mjs` → `POST http://localhost:8080/api/authenticate`, then `POST /api/event-medias/upload/tenant-official-document` with `Authorization` + `X-Tenant-ID`.

Environment overrides:

- `NEXT_PUBLIC_API_BASE_URL` or `MOSC_API_BASE_URL` (default `http://localhost:8080`)
- `MOSC_DOWNLOAD_ROOT` — **no trailing space** (Windows `set VAR=value &&` can append a space)
- `MOSC_UPLOAD_LIMIT` — set to `0` for full run
- `MOSC_UPLOAD_DELAY_MS` — pause between uploads (default `400`; reduces S3 rate errors)
- `MOSC_UPLOAD_MAX_RETRIES` — retry count for 500 / SignatureDoesNotMatch (default `3`)
- `MOSC_UPLOAD_FORCE=true` or `--force` — delete existing `(category, year, hierarchyPath)` matches, then re-upload
- `API_JWT_USER` / `API_JWT_PASS` — service JWT (from `.env.local`)

**S3 note:** Upload `title` (S3 user metadata) must be US-ASCII. Manifest `hierarchyPath` values with Unicode en-dashes (`–`) are sanitized for `title` automatically; full Unicode remains in `hierarchyPath` / description for the UI.

**AWS credentials:** Backend reads `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` (not `AWS_DEPLOY_REGION`). Ensure the running Spring Boot process uses the same values as `event-site-manager-service/src/main/docker/Docker_Local/.env` (bucket is in `us-east-2`).

---
- `MOSC_MIRROR_REPORT`
- `MOSC_MIRROR_DOWNLOADS_ROOT`
- `MOSC_UPLOAD_LIMIT` (limit number of files for staged runs)
- `MOSC_TENANT_ID` (fallback if `NEXT_PUBLIC_TENANT_ID` not present)
- `MOSC_AUTO_CREATE_CATEGORIES=true` (optional; default is false)

Dedupe notes:

- Category lookup checks existing categories first (by label/slug), then creates only when missing.
- Duplicate file detection uses `hierarchy_path` first, then legacy description marker fallback.
- Matching is case-insensitive on hierarchy path.
- Backend-first safety: by default, script **does not auto-create categories**. It fails fast with missing category list so you can seed categories first.
- SQL seed helper for missing categories (from mirror run):  
  `documentation/mosc_document_downloads_page/upload_refactor/seed_missing_official_document_categories.sql`

### Critical backend prerequisite (required for real upload)

If real upload fails with:

```text
Admin access required
```

this is a **backend authorization** issue, not a frontend/script bug.

Required backend behavior:

- Service JWT used by migration scripts must resolve to admin authorities (`ROLE_ADMIN` at minimum).
- `jwtadmin` (or your service subject) must be mapped to admin authorities in the backend auth filter/token conversion path.

Recommended backend fix order:

1. **Best**: issue service JWT with role claim including `ROLE_ADMIN` (or authority expected by `requireAdmin()`).
2. **Fallback workaround**: if subject is `jwtadmin`, inject `ROLE_ADMIN` authority in backend JWT authentication filter.

---

### Backend ticket prompt (copy/paste)

Use this prompt for backend implementation:

```text
We need a backend auth fix for MOSC migration uploads.

Context:
- Upload endpoint: POST /api/event-medias/upload/tenant-official-document
- Failure: 400 "Admin access required" from EventMediaResource.requireAdmin()
- Service auth user: jwtadmin
- Current authentication succeeds, but Granted Authorities is empty.

Please implement:
1) Preferred fix:
   - Ensure service JWT for jwtadmin contains admin role/authority claim
     (e.g., authorities or roles includes ROLE_ADMIN), and
   - Backend JWT-to-GrantedAuthority mapping consumes this claim.

2) Safe fallback workaround (keep even if token claim is delayed):
   - In ClerkJwtAuthenticationFilter (or equivalent JWT auth converter),
     if subject == "jwtadmin", add SimpleGrantedAuthority("ROLE_ADMIN")
     before creating Authentication.

Acceptance criteria:
- jwtadmin can upload via /api/event-medias/upload/tenant-official-document
  without "Admin access required".
- Security logs show ROLE_ADMIN in Granted Authorities for jwtadmin.
- Non-jwtadmin users are unchanged.
- Add unit/integration test for authority mapping.
```

---

## npm shortcuts

Root `package.json` includes:

| Script | What it runs |
|--------|----------------|
| `npm run mosc:migration:dry` | Dry-run using **`url-list.example.json`** (sample only). |
| `npm run mosc:migration:fetch` | Fetch using **`url-list.json`** (create/copy manifest first). |
| `npm run mosc:migration:fetch:mosc-in` | Fetch **`url-list.mosc-in.generated.json`** with `--ignore-robots --skip-existing`. |
| `npm run mosc:migration:mirror:dry` | Dry-run for hierarchy mirror traversal. |
| `npm run mosc:migration:mirror` | Hierarchy mirror download (title/subtitle folders). |
| `npm run mosc:migration:upload:mirror:dry` | Dry-run auto-upload from mirrored folder tree to official documents. |
| `npm run mosc:migration:upload:mirror` | Execute auto-upload + metadata patch for hierarchy/priority. |

For the committed mosc.in list without npm:

```bash
node scripts/mosc-in-migration/fetch-urls.mjs --manifest scripts/mosc-in-migration/url-list.mosc-in.generated.json --ignore-robots --skip-existing
```

---

## Python alternative

This repo ships **Node** scripts only. If you prefer Python:

- Replicate the same rules: explicit URL list, `time.sleep` between GETs, read `robots.txt`, stream writes to the **same folder layout**.
- Do **not** add `requests` + BeautifulSoup crawlers to “discover” URLs without permission.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `SKIP (robots)` | Path is disallowed in `robots.txt` — obtain the file another way or permission; do not use `--ignore-robots` for production. |
| HTTP 403/401 | Server blocks scripted access — you may need manual download or API from the content owner. |
| Wrong category in app | Align `categorySlug` in the manifest with database/API categories for your tenant. |
| Upload fails | Check backend logs, JWT env (`API_JWT_USER` / `API_JWT_PASS`), and `X-Tenant-ID` for the proxy. |

---

## Files in this directory

| File | Purpose |
|------|--------|
| `config.mjs` | Default download root and user-agent template. |
| `robots.mjs` | Minimal `robots.txt` parsing for `User-agent: *`. |
| `fetch-urls.mjs` | Manifest-driven downloader. |
| `url-list.example.json` | Example manifest — copy and edit. |
| `url-list.mosc-in.generated.json` | Committed URL list from mosc.in `/downloads/` (regenerate with `_scrape-downloads-deep.mjs`). |
| `_scrape-downloads-deep.mjs` | Optional: rebuild `url-list.mosc-in.generated.json` from the live site. |
| `_scrape-downloads-page-once.mjs` | Optional: shallow href dump from the main downloads page only. |
| `mirror-downloads-tree.mjs` | Traversal downloader that mirrors title/subtitle hierarchy into nested folders. |
| `upload-mirror-to-official-docs.mjs` | Auto-uploads mirrored files to official-documents API and patches hierarchy metadata + priority. |
| `malankara-category-map.json` | Legacy page folder → official-document category slug + election year. |
| `build-malankara-manifest.mjs` | Builds `url-list.malankara-remapped.json` from `code_clone_ref/mosc_in/downloads/malankara-association-*`. |
| `url-list.malankara-remapped.json` | Committed Malankara-only manifest (165 URLs, correct category slugs). |
| `upload-manifest-to-official-docs.mjs` | Upload from flat `{MOSC_DOWNLOAD_ROOT}/{categorySlug}/{year}/{filename}` with dedupe. |

---

## Malankara Association migration (Phase 1)

Per [`documentation/mosc_redesign/downloads_malankara_association/downloads_malankara_association_prd.html`](../../documentation/mosc_redesign/downloads_malankara_association/downloads_malankara_association_prd.html).

### 1. Regenerate manifest (optional)

```bash
npm run mosc:migration:malankara:manifest
```

Parses local legacy HTML mirrors and writes `url-list.malankara-remapped.json` with correct slugs (`malankara-association-2022`, etc.) and **election year** (2022 for 2022 cycle, not upload-path year 2021).

### 2. Download PDFs

Default download root is `C:\E_Drive\code_backup\mosc_downloads`. Override with `MOSC_DOWNLOAD_ROOT`.

On Windows, if TLS fetch fails with `fetch failed`, add `--insecure-tls` (certificate revocation check):

```bash
set MOSC_DOWNLOAD_ROOT=f:\project_workspace\mosc-temp\.mosc-downloads
npm run mosc:migration:malankara:fetch
```

Or dry-run:

```bash
npm run mosc:migration:malankara:fetch:dry
```

### 3. Upload to official documents (dedupe enabled)

Requires Next.js on `MOSC_APP_BASE_URL` (default `http://localhost:3000`), working backend JWT, **valid S3 credentials on the backend**, and tenant categories seeded (`mosc_malankara_orthodox_2`).

```bash
set MOSC_DOWNLOAD_ROOT=f:\project_workspace\mosc-temp\.mosc-downloads
set NEXT_PUBLIC_TENANT_ID=mosc_malankara_orthodox_2
npm run mosc:migration:malankara:upload:dry
npm run mosc:migration:malankara:upload
```

Dedupe skips existing rows by `(categoryId, year, hierarchyPath, filename)` and normalized `fileUrl`. Dedupe runs for **all** upload modes except `--force` (including `--missing-only`). See [`documentation/mosc_document_downloads_page/DUPLICATE_OFFICIAL_DOCUMENTS.md`](../../documentation/mosc_document_downloads_page/DUPLICATE_OFFICIAL_DOCUMENTS.md).

### Purge duplicate DB rows

If migration was run multiple times, the public page may show duplicate cards until rows are removed from the database. UI dedupe hides them; **permanent** cleanup:

```bash
npm run mosc:migration:purge-duplicates:dry
npm run mosc:migration:purge-duplicates
```

Optional filter: `npm run mosc:migration:purge-duplicates:fcra` (or `--category-slug <slug>`).

### npm shortcuts

| Script | What it runs |
|--------|----------------|
| `npm run mosc:migration:malankara:manifest` | Rebuild `url-list.malankara-remapped.json` from legacy HTML |
| `npm run mosc:migration:malankara:fetch` | Download Malankara PDFs with `--insecure-tls --skip-existing` |
| `npm run mosc:migration:malankara:upload:dry` | Dry-run manifest upload |
| `npm run mosc:migration:malankara:upload` | Upload + PATCH hierarchy metadata |
| `npm run mosc:migration:purge-duplicates:dry` | Report duplicate official-document rows (no delete) |
| `npm run mosc:migration:purge-duplicates` | Permanently delete duplicate official-document rows |

---

## Changelog

- **2026-03** — Initial migration kit: manifest downloader, default `C:\E_Drive\code_backup\mosc_downloads`, bulk-upload documentation.
- **2026-03** — Added `url-list.mosc-in.generated.json`, deep scrape script, README options A/B, Step 3 commands, and `mosc:migration:fetch:mosc-in` npm script.
- **2026-03** — Added hierarchy mirror script (`mirror-downloads-tree.mjs`) and npm shortcuts for title-based nested folder downloads.
- **2026-06** — Duplicate official documents: `purge-duplicate-official-docs.mjs`, shared `official-doc-dedupe.mjs`, stronger upload dedupe (all categories, `--missing-only` included). See `documentation/mosc_document_downloads_page/DUPLICATE_OFFICIAL_DOCUMENTS.md`.
