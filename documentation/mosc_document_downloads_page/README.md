# MOSC document downloads — documentation index

This folder holds cross-project planning and PRD-style documents for:

- Mirroring **https://mosc.in/downloads/** content into tenant-scoped S3 storage.
- **Bulk admin upload** with **per-batch folder/category** names.
- Public **Syro downloads** pages (`/mosc-redesign/downloads`) backed by API data instead of placeholder `#` links.
- Official-document downloads use the tenant-scoped lookup table `public.official_document_category` (stable `slug`) and store the year on `event_media.official_document_year`, so S3 paths follow `.../official_document/{category.slug}/{year}/...`.

| Document | Audience | Purpose |
|----------|----------|---------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Both teams | Phased plan, gaps, S3 layout, scraping vs manual |
| [PRD_BACKEND.md](./PRD_BACKEND.md) | Spring Boot (`malayalees-us-site-boot`) | APIs, S3 paths, DTO fields, acceptance criteria |
| [PRD_FRONTEND.md](./PRD_FRONTEND.md) | Next.js (`mosc-temp`) | Admin UI, public downloads, proxy patterns |
| [thumbnail/README.md](./thumbnail/README.md) | Both teams | Per-file `event_media` thumbnails, migration, API contract |

**Related backend doc (existing):**  
`malayalees-us-site-boot/documentation/Enhanced_Upload_System_Documentation.md` — event-media uploads, entity-specific paths; lists **bulk upload** as a future enhancement.

**Why localhost download links fail today:**  
`src/app/mosc-redesign/(syro)/downloads/page.tsx` uses many `link: '#'` entries; the UI shows an alert instead of fetching files. Real files live on **mosc.in** (or must be supplied via S3 + `event_media` records).
