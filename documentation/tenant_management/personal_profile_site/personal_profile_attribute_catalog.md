# Personal Profile Site — Attribute Catalog

**Version:** 1.0 | **Date:** July 2026 | **Status:** Approved for implementation

## Site type enum (`tenant_organization.site_type`)

| Value | Description |
|-------|-------------|
| `EVENT_ORG` | Default — events, sponsors, membership |
| `SPORTS_TEAM` | Squad rosters (`team_groups` SPORTS) |
| `MUSIC_BAND` | Band rosters (`team_groups` MUSIC) |
| `CHURCH_ORG` | Executive committee, documents, charity |
| `PERSONAL_PROFILE` | Single-subject portfolio / writer site |
| `HYBRID` | Profile sections + events (both enabled via flags) |

Optional: `site_template_version` (varchar 32) — e.g. `profile-writer-v1`.

## `public_profile` (1:1 per tenant, v1)

| Field | Type | Required | Public | Validation |
|-------|------|----------|--------|------------|
| `tenant_id` | varchar(255) | Yes | No | FK to `tenant_organization` |
| `display_name` | varchar(255) | Yes | Yes | Max 255 |
| `tagline` | varchar(500) | No | Yes | Short hero subtitle |
| `headline` | varchar(500) | No | Yes | Hero headline |
| `bio_markdown` | text | No | Yes | Rendered as HTML on public site |
| `profile_image_url` | varchar(1024) | No | Yes | HTTPS URL |
| `cover_image_url` | varchar(1024) | No | Yes | HTTPS URL |
| `location` | varchar(255) | No | Yes | City, region |
| `languages` | varchar(255) | No | Yes | Comma-separated |
| `public_slug` | varchar(100) | No | Yes | Unique per tenant; URL-safe |
| `contact_email` | varchar(255) | No | Yes | Valid email |
| `contact_form_enabled` | boolean | No | Yes | Default false |
| `linkedin_url` | varchar(500) | No | Yes | URL |
| `twitter_url` | varchar(500) | No | Yes | URL |
| `facebook_url` | varchar(500) | No | Yes | URL |
| `instagram_url` | varchar(500) | No | Yes | URL |
| `youtube_url` | varchar(500) | No | Yes | URL |
| `website_url` | varchar(500) | No | Yes | URL |
| `cv_document_url` | varchar(1024) | No | Yes | PDF/doc download |
| `meta_title` | varchar(255) | No | Yes | SEO |
| `meta_description` | varchar(500) | No | Yes | SEO |
| `is_published` | boolean | Yes | No | Default false |
| `owner_user_profile_id` | bigint | No | No | FK optional |
| `created_at`, `updated_at` | timestamptz | Yes | No | ISO |

## `profile_writing`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | varchar(500) | Yes | |
| `slug` | varchar(150) | No | Unique per tenant |
| `excerpt` | varchar(2000) | No | Card summary |
| `body` | text | No | Full text for ORIGINAL |
| `featured_image_url` | varchar(1024) | No | |
| `writing_type` | varchar(32) | Yes | `ORIGINAL`, `REPUBLISHED`, `EXTERNAL_LINK` |
| `external_url` | varchar(1024) | No | Required for EXTERNAL_LINK |
| `publication_name` | varchar(255) | No | Newspaper/magazine name |
| `published_at` | date | No | |
| `status` | varchar(32) | Yes | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `display_order` | integer | No | Sort asc |

## `profile_achievement`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | varchar(500) | Yes | |
| `description` | varchar(2000) | No | |
| `achievement_date` | date | No | |
| `category` | varchar(32) | Yes | `AWARD`, `HONOR`, `SPEAKING`, `EDUCATION`, `OTHER` |
| `issuer` | varchar(255) | No | |
| `url` | varchar(500) | No | |
| `display_order` | integer | No | |
| `is_featured` | boolean | No | Default false |

## `profile_affiliation`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `organization_name` | varchar(255) | Yes | |
| `role` | varchar(255) | No | |
| `description` | varchar(2000) | No | |
| `start_date` | date | No | |
| `end_date` | date | No | |
| `logo_url` | varchar(1024) | No | |
| `url` | varchar(500) | No | |
| `display_order` | integer | No | |

## `profile_media_asset`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | varchar(500) | Yes | |
| `description` | varchar(2000) | No | |
| `file_url` | varchar(1024) | Yes | HTTPS |
| `file_type` | varchar(64) | No | pdf, docx, etc. |
| `file_size_bytes` | bigint | No | |
| `display_order` | integer | No | |
| `is_downloadable` | boolean | Yes | Default true |
| `requires_email` | boolean | No | Default false (future gate) |

## `profile_audience_contact` (v2)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | bigint | Yes | PK; sequence `profile_audience_contact_id_seq` |
| `tenant_id` | varchar(255) | Yes | FK → `tenant_organization` |
| `public_profile_id` | bigint | Yes | FK → `public_profile` |
| `email` | varchar(255) | Yes | Unique per tenant with `tenant_id` |
| `first_name` | varchar(255) | No | |
| `last_name` | varchar(255) | No | |
| `source` | varchar(32) | Yes | `SUBSCRIBE_FORM`, `CONTACT_FORM`, `CSV_IMPORT`, `GATED_DOWNLOAD`, `ADMIN_MANUAL` |
| `opt_in_status` | varchar(32) | Yes | Default `OPTED_IN`; `OPTED_OUT`, `PENDING` |
| `unsubscribe_token` | varchar(64) | No | Per-contact token for bulk email unsubscribe |
| `notes` | varchar(500) | No | Admin or contact-form message |
| `created_at` | timestamptz | Yes | |
| `updated_at` | timestamptz | Yes | |

**Separation rule:** Do not conflate with `user_profile.is_email_subscribed` — profile audience is a separate list with its own opt-in and unsubscribe token.

## `tenant_settings` profile section flags

| Flag | Default (EVENT_ORG) | Default (PERSONAL_PROFILE preset) |
|------|---------------------|-----------------------------------|
| `show_public_profile_hero_section` | false | true |
| `show_profile_writings_section` | false | true |
| `show_profile_achievements_section` | false | true |
| `show_profile_affiliations_section` | false | true |
| `show_profile_media_downloads_section` | false | true |
| `show_profile_contact_section` | false | true |

## Admin vs public visibility

- **Admin**: all fields editable when authenticated as tenant admin.
- **Public**: only `is_published` profile + child rows with `status=PUBLISHED` (writings) or active flags.
- **Draft**: `is_published=false` on profile shows “coming soon” or org name fallback on homepage.
