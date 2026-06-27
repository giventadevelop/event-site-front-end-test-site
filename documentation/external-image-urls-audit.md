# External Image & Asset URL Audit

Quick audit of **image and asset references that point to external URLs** (not stored locally under `public/`).  
*Generated from codebase search.*

---

## 1. External image URLs (not local)

### A. **demo.artureanec.com** (Philanthrop theme demo)

All under `src/components/sections/` — demo/template assets; **not stored locally**.

| File | Usage |
|------|--------|
| `about-foundation.tsx` | `Photo_5.jpg` |
| `causes-grid.tsx` | `Photo_6.jpg`, `Photo_7.jpg`, `Photo_8.jpg` |
| `team-section.tsx` | `Photo_9.jpg`–`Photo_12.jpg` |
| `become-volunteer.tsx` | `Photo_13.jpg` |
| `testimonials.tsx` | `Photo_14.jpg`, `Photo_15.jpg`, `Photo_16.jpg` |
| `children-cta.tsx` | `Photo_17.jpg` |
| `people-need-help.tsx` | `Photo_18.jpg`–`Photo_21.jpg` |
| `circular-images.tsx` | `Photo_22.jpg`–`Photo_25.jpg` |
| `events-section.tsx` | `Photo_26.jpg`–`Photo_28.jpg` |
| `projects-carousel.tsx` | `Photo_29.jpg`–`Photo_31.jpg` |
| `partners-logos.tsx` | `partner1.png`–`partner6.png` |
| `footer.tsx` | `logo_white.png` |

**Base URL:** `https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/` (or `.../themes/philantrop/img/` for logo).

---

### B. **cdn.builder.io** (Builder.io CMS assets)

| File | Usage |
|------|--------|
| `src/components/Footer.tsx` | Logo image (single URL) |
| `src/components/charity-sections/Footer.tsx` | Same logo |
| `src/components/charity-sections/HeroSection.tsx` | Multiple hero/background images (several asset IDs) |

**Not stored locally** — served from Builder.io CDN.

---

### C. **images.pexels.com** (stock photos)

| File | Usage |
|------|--------|
| `src/components/CausesSection.tsx` | 3 cause images (pexels photo IDs) |
| `src/components/charity-sections/CausesSection.tsx` | Same 3 images |

**Not stored locally** — Pexels CDN.

---

### D. **img.youtube.com** (video thumbnail)

| File | Usage |
|------|--------|
| `src/components/VideoSection.tsx` | `hqdefault.jpg` for video `JSLEUuqkhVQ` (background) |

**Not stored locally** — YouTube thumbnail URL; optional to cache locally.

---

## 2. Not image URLs (no change needed)

- **layout.tsx** – `https://widgets.givebutter.com/...` — script, not image.
- **mosc-globals.css / philanthrop/styles.css** – `@import url('https://fonts.googleapis.com/...')` — fonts, not images.
- **AnnouncementsSection.tsx** – `src="https://catholicatenews.in"` — iframe (external site), not image.
- **Admin placeholders** – `placeholder="https://example.com/..."` — placeholder text only.
- **ManageUsageClient.tsx** – `https://eventapp-media-bucket.s3.../...xlsx` — download link for template file.
- **EventCard.tsx** – `event.thumbnailUrl.includes('s3.amazonaws.com')` — runtime check for S3 URLs (event data from API).
- **world-council-of-churches, directory, contact, etc.** – `catholicos@mosc.in`, `calendar.mosc.in` — emails/links, not images.

---

## 3. MOSC app (`/mosc`) image usage

- **Ecumenical** – Already switched to local: `/images/mosc/ecumenical/*.jpg`.
- **All other MOSC pages checked** – Use local paths only: `/images/administration/`, `/images/church/`, `/images/catholicate/`, `/images/dioceses/`, `/images/ecumenical/`, `/images/mosc/gallery/`, etc.

**No remaining mosc.in (or other external) image URLs under `src/app/mosc`.**

---

## 4. Summary table

| Source | Count (approx) | Location | Stored locally? |
|--------|----------------|----------|------------------|
| demo.artureanec.com | 27+ images + 1 logo | `src/components/sections/` | No |
| cdn.builder.io | 4+ asset URLs | Footer, charity HeroSection | No |
| images.pexels.com | 3 images | CausesSection, charity CausesSection | No |
| img.youtube.com | 1 thumbnail | VideoSection | No |
| mosc.in / ecumenical | 0 | Was ecumenical; now local | Yes (done) |

---

## 5. Recommendations

1. **Sections under `src/components/sections/`**  
   If these pages are in use: download the Philanthrop demo images from `demo.artureanec.com`, add them under e.g. `public/images/charity-theme/` or `public/images/sections/`, and replace URLs with local paths (e.g. `/images/charity-theme/Photo_5.jpg`).

2. **Builder.io (Footer / charity HeroSection)**  
   Either keep using Builder.io CDN (and ensure `next.config` allows `cdn.builder.io` for images) or export assets and serve from `public/images/` with local paths.

3. **Pexels (CausesSection)**  
   For stability and control: download the 3 images, put under `public/images/causes/` (or similar), and point `image` to those paths.

4. **YouTube thumbnail**  
   Optional: download the thumbnail and use a local path in `VideoSection.tsx` to avoid depending on YouTube’s URL.

5. **S3 / event thumbnails**  
   `EventCard` and event data use S3 URLs at runtime from the API; that’s expected. No change unless you decide to proxy or re-host event media.

---

*Audit performed by searching for `https?://` in `src` with image-like extensions and common CDN/upload paths (mosc.in, wp-content, amazonaws, cloudfront, builder.io, pexels, youtube).*
