# Flash News & Social Media Implementation Plan

**Reference**: `documentation/news_portal/strapi/index.html` (catholicatenews.in)

**Purpose**: Externalize social URLs and implement flash news scrolling from Strapi, matching the reference layout.

---

## 1. Social Media URLs (from index.html)

These URLs are currently hardcoded. Plan: store in Strapi **Settings / Site Settings** so admins can update without code changes.

| Purpose | Current URL | Source |
|--------|-------------|--------|
| **LIVE** (YouTube streams) | `https://www.youtube.com/@DevalokamAramana/streams` | Nav menu item 2467 |
| **Facebook Page** (Follow Us sidebar) | `https://www.facebook.com/catholicatenews.in/` | Header social + sidebar iframe |
| **Twitter/X** | `https://x.com/malankaranews` | Header social links |
| **MOSC Official Website** | `https://mosc.in/` | Nav menu item 217 |

### Facebook Page Plugin iframe

The sidebar "Follow Us" panel uses the Facebook Page Plugin. Full embed URL pattern:

```
https://www.facebook.com/plugins/page.php?href={FACEBOOK_PAGE_URL}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true
```

**Parameters**:
- `href` — Facebook page URL (e.g. `https://www.facebook.com/catholicatenews.in`)
- `width` — 340 (reference) or 360 (current FollowUsFacebook)
- `height` — 500 (reference) or 720 (current FollowUsFacebook)
- `tabs=timeline` — Shows page posts
- `show_facepile=true` — Shows follower avatars
- `hide_cover=false` — Shows cover photo

---

## 2. Live Link and Facebook Embed – How They Work

### Live link
- Simple nav link: `<a href="https://www.youtube.com/@DevalokamAramana/streams">LIVE</a>`
- Opens YouTube live streams in a new tab
- No embed; just a direct link

### Facebook sidebar embed
- Uses Facebook Page Plugin iframe
- **Source**: `https://www.facebook.com/plugins/page.php?href=...`
- Displays the page timeline, cover, facepile, and Follow button
- Content is rendered by Facebook; we only provide the page URL

### Externalization strategy

1. **Strapi single type**: `site-settings` or `tenant-settings`
   - Fields: `youtubeLiveUrl`, `facebookPageUrl`, `twitterUrl`, `moscOfficialWebsiteUrl`
   - Optional: `facebookEmbedWidth`, `facebookEmbedHeight`

2. **API**: `GET /api/site-settings` or `GET /api/tenant-settings`

3. **Frontend**:
   - Fetch settings server-side in `getNewsHomePageData` (or a dedicated `getSiteSettings`)
   - Pass to nav and `FollowUsFacebook` component
   - Use env fallbacks if Strapi returns nothing

---

## 3. Flash News – Reference Implementation

### Structure in index.html

```html
<div class="flash-news">
  <div class="flash-title">Flash News</div>
  <div class="owl-carousel tb-flash-carousel">
    <div class="carousel-item">
      <a href="https://catholicatenews.in/article-slug-1/">Headline 1</a>
    </div>
    <div class="carousel-item">
      <a href="https://catholicatenews.in/article-slug-2/">Headline 2</a>
    </div>
    <!-- ... more items -->
  </div>
</div>
```

### Behaviour
- **Owl Carousel** (`owl.carousel.min.js`) scrolls items horizontally
- Each item: link (title) → article detail
- Label: "Flash News" in a coloured bar
- CSS: `.flash-news` (green background), `.flash-title` (red, angled clip-path)

### Current MOSC implementation (different)
- Single message from `homepage.flashNewsMessage` (Strapi `homepage` single type)
- One `FlashBar` component with a single line
- No carousel, no multiple items

---

## 4. Flash News – Strapi-Driven Implementation

### Option A: Flash news as a collection (recommended)

**Content type**: `flash-news-item`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | Text (short) | Yes | Headline shown in the bar |
| `article` | Relation (Article) | No | Link to article detail |
| `externalUrl` | URL | No | External link (if no article) |
| `order` | Integer | No | Display order (asc) |
| `publishedAt` | DateTime | Yes | Visibility control |
| `tenant` | Relation (Tenant) | Yes | Multi-tenant |

**Logic**: If `article` is set, link to `/mosc/news/{article.slug}`. Else use `externalUrl` if set.

**API**:
```
GET /api/flash-news-items?filters[tenant][tenantId][$eq]=xxx&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&pagination[limit]=10
```

### Option B: Reuse articles with a flag

Add `isFlashNews: boolean` to Article and a `flashOrder: number`.

- Query: `filters[isFlashNews][$eq]=true`
- Sort: `flashOrder:asc,publishedAt:desc`
- Simpler schema but mixes flash with regular articles.

### Option C: Keep homepage single type, extend it

Add `flashNewsItems` (JSON or Component) to `homepage`:

```json
{
  "flashNewsItems": [
    { "title": "...", "articleSlug": "...", "order": 1 },
    { "title": "...", "externalUrl": "https://...", "order": 2 }
  ]
}
```

Easier to manage in one place; less flexible for large numbers of items.

---

## 5. Recommended Approach: Collection + Carousel UI

### Strapi schema: `flash-news-item`

1. Create collection type `flash-news-item`
2. Fields: `title`, `article` (relation), `externalUrl`, `order`, `publishedAt`, `tenant`
3. Admin: Manage flash items in Strapi admin

### Frontend: Flash news carousel

1. **Data**: Extend `getNewsHomePageData` to fetch `/flash-news-items`
2. **Component**: Replace `FlashBar` with `FlashNewsCarousel`
   - Horizontal scrolling carousel
   - Each item: `<a href={...}>{title}</a>`
   - Use CSS `marquee` or a lightweight carousel (e.g. embla-carousel, swiper) instead of owl-carousel for Next.js

### Carousel behaviour (match reference)

- Horizontal auto-scroll
- One item visible at a time (or a few on wide screens)
- Smooth transitions
- Pause on hover
- Link to article or external URL

### Visual styling (from index.html)

- Container: `flash-news` — coloured bar (e.g. `#4ad822` or MOSC primary)
- Title: `flash-title` — "Flash News" label, distinct background (e.g. `#db1111`), optional clip-path
- Items: readable font, truncate if long

---

## 6. Implementation Checklist

### Phase 1: Externalize social URLs

- [ ] Add Strapi single type `site-settings` (or extend existing settings)
  - `youtubeLiveUrl`
  - `facebookPageUrl`
  - `twitterUrl`
  - `moscOfficialWebsiteUrl`
  - `facebookEmbedWidth`, `facebookEmbedHeight` (optional)
- [ ] Fetch in `getNewsHomePageData` or new `getSiteSettings()`
- [ ] Update nav `EXTERNAL_LINKS` to use fetched URLs (with env fallbacks)
- [ ] Update `FollowUsFacebook` to use `facebookPageUrl` from props

### Phase 2: Flash news collection + carousel

- [ ] Create Strapi collection `flash-news-item`
- [ ] Add fetch in `getNewsHomePageData` for flash items
- [ ] Add `FlashNewsCarousel` component (scroll like reference)
- [ ] Replace `FlashBar` usage with `FlashNewsCarousel` when flash items exist
- [ ] Fallback: show nothing (or single-message bar) if no items

### Phase 3: Documentation and testing

- [ ] Update `catholicatenews_strapi_content_mapping.md`
- [ ] Add admin guide section for flash news and site settings
- [ ] Test with Strapi admin: add/edit flash items, change social URLs

---

## 7. URL Reference Summary

| Name | URL |
|------|-----|
| YouTube LIVE | `https://www.youtube.com/@DevalokamAramana/streams` |
| Facebook | `https://www.facebook.com/catholicatenews.in/` |
| Twitter/X | `https://x.com/malankaranews` |
| MOSC Official | `https://mosc.in/` |
| Facebook Page Plugin | `https://www.facebook.com/plugins/page.php?href={encoded_page_url}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true` |

---

## 8. Flash News Data Shape (for API)

```ts
interface FlashNewsItem {
  id: number;
  documentId?: string;
  title: string;
  slug?: string;           // from article relation
  externalUrl?: string | null;
  articleId?: number;
  order?: number;
  publishedAt?: string;
}

// Normalized for UI
interface FlashNewsItemUI {
  title: string;
  href: string;  // /mosc/news/{slug} or externalUrl
  isExternal: boolean;
}
```

---

**Created**: 2026-02-04
**Status**: Implementation plan – ready for Strapi schema and frontend tasks
