/**
 * Parse legacy manifest `date` strings into structured gallery_album event fields.
 * @see documentation/gallery_porting/gallery_album_event_date_location_enhancements/data_migration_enhancements_prd.html
 */

const MONTH_INDEX = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseMonthName(name) {
  return MONTH_INDEX[name.trim().toLowerCase()] ?? null;
}

function toIsoDate(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

function normalizeIsoDate(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(str);
  return match ? match[1] : null;
}

/**
 * @param {string | null | undefined} dateStr
 * @param {number | null | undefined} fallbackAlbumYear
 * @returns {{
 *   eventDateStart: string | null,
 *   eventDateEnd: string | null,
 *   eventLocation: string | null,
 *   albumYear: number | null,
 * }}
 */
export function parseManifestDateString(dateStr, fallbackAlbumYear = null) {
  const trimmed = (dateStr || '').trim();
  if (!trimmed) {
    return {
      eventDateStart: null,
      eventDateEnd: null,
      eventLocation: null,
      albumYear: fallbackAlbumYear ?? null,
    };
  }

  let datePart = trimmed;
  let eventLocation = null;

  const locationMatch = trimmed.match(/^(.+),\s*([A-Za-z][A-Za-z\s.-]{0,100})$/);
  if (locationMatch) {
    datePart = locationMatch[1].trim();
    eventLocation = locationMatch[2].trim();
  }

  if (/^\d{4}$/.test(datePart)) {
    return {
      eventDateStart: null,
      eventDateEnd: null,
      eventLocation,
      albumYear: Number(datePart),
    };
  }

  const rangeMatch = datePart.match(/^([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})$/);
  if (rangeMatch) {
    const monthIndex = parseMonthName(rangeMatch[1]);
    const day1 = Number(rangeMatch[2]);
    const day2 = Number(rangeMatch[3]);
    const year = Number(rangeMatch[4]);
    if (monthIndex != null) {
      return {
        eventDateStart: toIsoDate(year, monthIndex, day1),
        eventDateEnd: toIsoDate(year, monthIndex, day2),
        eventLocation,
        albumYear: year,
      };
    }
  }

  const parsedMs = Date.parse(`${datePart} UTC`);
  if (!Number.isNaN(parsedMs)) {
    const d = new Date(parsedMs);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    return {
      eventDateStart: toIsoDate(year, month, day),
      eventDateEnd: null,
      eventLocation,
      albumYear: year,
    };
  }

  return {
    eventDateStart: null,
    eventDateEnd: null,
    eventLocation,
    albumYear: fallbackAlbumYear ?? null,
  };
}

/** Build PATCH/POST event fields from manifest album row. */
export function eventFieldsFromManifestAlbum(meta) {
  const parsed = parseManifestDateString(meta?.date, meta?.albumYear ?? null);
  return {
    eventDateStart: parsed.eventDateStart,
    eventDateEnd: parsed.eventDateEnd,
    eventLocation: parsed.eventLocation,
    albumYear: parsed.albumYear ?? meta?.albumYear ?? null,
  };
}

/** True when API album row differs from manifest-derived target values. */
export function albumNeedsManifestPatch(album, categoryId, fields) {
  if (categoryId != null && album.galleryCategoryId !== categoryId) return true;

  const desiredYear = fields.albumYear;
  if (desiredYear != null && album.albumYear !== desiredYear) return true;

  if (normalizeIsoDate(fields.eventDateStart) !== normalizeIsoDate(album.eventDateStart)) return true;
  if (normalizeIsoDate(fields.eventDateEnd) !== normalizeIsoDate(album.eventDateEnd)) return true;

  const desiredLoc = fields.eventLocation?.trim() || null;
  const currentLoc = album.eventLocation?.trim() || null;
  if (desiredLoc !== currentLoc) return true;

  return false;
}
