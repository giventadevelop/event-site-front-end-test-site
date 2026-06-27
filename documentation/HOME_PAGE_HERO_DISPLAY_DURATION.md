# Home Page Hero Display Duration

## Overview

The `event_media` table includes an optional field that controls **how long** a homepage hero image is displayed in the hero section rotation. When set per media, each hero image can have its own duration (e.g. 50 secs, 1 min 20 secs). When `NULL`, the app uses the default rotation interval (8 seconds).

## Database

### Table & Column

- **Table**: `event_media`
- **Column**: `home_page_hero_display_duration_seconds`

### Data Type

- **SQL**: `int4` (PostgreSQL `INTEGER`)
- **Nullable**: `YES`, default `NULL`
- **Storage**: Total **seconds** (integer)

### Values & Examples

| Display        | Stored value | Notes                    |
|----------------|-------------|--------------------------|
| 50 secs        | `50`        |                          |
| 1 min 20 secs  | `80`        | 1×60 + 20                |
| 2 min          | `120`       | 2×60                     |
| 5 min 30 secs  | `330`       | 5×60 + 30                |
| Use default    | `NULL`      | App uses 8 seconds       |

### Constraint

- **Valid range**: `1`–`600` seconds (1 second to 10 minutes) when not `NULL`
- **Check**: `home_page_hero_display_duration_seconds IS NULL OR (home_page_hero_display_duration_seconds >= 1 AND home_page_hero_display_duration_seconds <= 600)`

### Schema Reference

- **Schema file**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **Migration**: `code_html_template/SQLS/migration_add_home_page_hero_display_duration.sql`

## Representation (UI / Config)

### Input (minutes and seconds)

- **Option A**: Two inputs — "Minutes" and "Seconds"; convert to total seconds when saving.
- **Option B**: Single string like `"1:20"` or `"50"`; parse to seconds (e.g. `mm:ss` or `ss`).

### Output (display)

- **From seconds**:  
  - `seconds < 60` → e.g. `"50 secs"`  
  - `seconds >= 60` → e.g. `"1 min 20 secs"` (compute `min = Math.floor(seconds / 60)`, `sec = seconds % 60`).

### Conversion Helpers

```ts
// Seconds → display string
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} secs`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} secs`;
}

// Minutes + seconds → total seconds
function toSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds;
}

// Parse "1:20" or "50" → seconds
function parseDuration(input: string): number | null {
  const n = parseInt(input, 10);
  if (!isNaN(n) && input === String(n)) return Math.max(0, n);
  const [min, sec] = input.split(':').map((x) => parseInt(x, 10));
  if (isNaN(min)) return null;
  return (min || 0) * 60 + (isNaN(sec) ? 0 : sec);
}
```

## Processing (Hero Rotation)

- **Default**: When `home_page_hero_display_duration_seconds` is `NULL`, use app default **8 seconds**.
- **Per-image**: When set, use that value for the rotation interval for that hero image.

```ts
const durationSeconds = media.homePageHeroDisplayDurationSeconds ?? 8;
const intervalMs = Math.max(1000, Math.min(600000, durationSeconds * 1000)); // clamp 1s–10min
```

Use `intervalMs` in `setInterval` (or equivalent) for the hero slider. Clamping keeps it within 1–600 seconds even if API data is off.

## TypeScript (DTO)

```ts
// EventMediaDTO
homePageHeroDisplayDurationSeconds?: number | null;
```

- **Optional**: Omit when not provided by API.
- **`null`**: Explicit “use default” (same as missing for hero logic).

## Backend / API

- Add `home_page_hero_display_duration_seconds` to the `event_media` API model.
- Expose as **integer** (seconds) or **null** in JSON.
- For PATCH/POST, accept `homePageHeroDisplayDurationSeconds` (camelCase) and map to DB column; validate 1–600 when present.

## Summary

| Item        | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **Column**  | `home_page_hero_display_duration_seconds`                             |
| **Type**    | `int4` (INTEGER), nullable                                            |
| **Storage** | Total seconds (e.g. 50, 80, 120)                                      |
| **Default** | `NULL` → app uses 8 seconds                                           |
| **Range**   | 1–600 seconds when not `NULL`                                         |
| **Config**  | Configure in minutes + seconds; store as seconds                       |
| **Schema**  | `Latest_Schema_Post__Blob_Claude_12.sql`                              |
| **Migration** | `migration_add_home_page_hero_display_duration.sql`                 |
