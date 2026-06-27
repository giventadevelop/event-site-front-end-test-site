export interface GalleryAlbumEventDateInput {
  eventDateStart?: string | null;
  eventDateEnd?: string | null;
  eventLocation?: string | null;
  albumYear?: number | null;
  /** Static fallback: raw legacy date string from moscStaticAlbums */
  eventDateDisplay?: string | null;
}

function parseIsoDateOnly(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatSameMonthRange(start: Date, end: Date): string {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(start);
  const year = start.getFullYear();
  return `${month} ${start.getDate()}\u2013${end.getDate()}, ${year}`;
}

/**
 * Formats album event date for public gallery cards.
 * Prefers structured fields; falls back to albumYear or static display string.
 */
export function formatGalleryAlbumEventDate(album: GalleryAlbumEventDateInput): string | null {
  const staticDisplay = album.eventDateDisplay?.trim();
  if (staticDisplay) {
    return staticDisplay;
  }

  const startIso = album.eventDateStart?.trim();
  if (!startIso) {
    return album.albumYear != null ? String(album.albumYear) : null;
  }

  const startDate = parseIsoDateOnly(startIso);
  if (!startDate) {
    return album.albumYear != null ? String(album.albumYear) : null;
  }

  const endIso = album.eventDateEnd?.trim();
  let datePart: string;

  if (endIso && endIso !== startIso) {
    const endDate = parseIsoDateOnly(endIso);
    if (
      endDate &&
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    ) {
      datePart = formatSameMonthRange(startDate, endDate);
    } else if (endDate) {
      datePart = `${formatFullDate(startDate)} \u2013 ${formatFullDate(endDate)}`;
    } else {
      datePart = formatFullDate(startDate);
    }
  } else {
    datePart = formatFullDate(startDate);
  }

  const location = album.eventLocation?.trim();
  return location ? `${datePart}, ${location}` : datePart;
}
