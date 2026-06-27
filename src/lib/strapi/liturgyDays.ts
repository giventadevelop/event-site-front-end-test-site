import 'server-only';

import { resolveMalayalamDisplayText } from '@/lib/malayalam/liturgyText';
import { getStrapiApiBase, getStrapiHeaders, getStrapiTenantId, getStrapiUrl } from '@/lib/strapi';

const LOG_PREFIX = '[LITURGY-CALENDAR]';

// ---------------------------------------------------------------------------
// Shared types – consumed by /api/liturgy and liturgy calendar
// ---------------------------------------------------------------------------

export interface LiturgyReading {
  liturgy_day_heading?: string;
  season_name?: string;
  liturgy_heading: string;
  content_place: string;
}

export interface LiturgyApiResponse {
  message: LiturgyReading[];
  /** Date of the liturgy day (YYYY-MM-DD), when from Strapi */
  liturgyDate?: string;
}

export interface LiturgyReadingItem {
  id: number;
  liturgyHeadingEn: string;
  liturgyHeadingMalylm: string;
  contentPlaceEn: string;
  contentPlaceMalylm: string;
}

export interface LiturgyDay {
  id: number;
  documentId: string;
  date: string;
  dayHeadingEn: string;
  dayHeadingMalylm: string;
  seasonNameEn: string;
  seasonNameMalylm: string;
  order: number;
  readings: LiturgyReadingItem[];
}

export interface LiturgyDayListResult {
  days: LiturgyDay[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export type LiturgyLanguage = 'en' | 'ml';

interface StrapiListResponse {
  data: unknown[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

function parseReading(raw: Record<string, unknown>): LiturgyReadingItem {
  const attrs = (raw.attributes as Record<string, unknown> | undefined) ?? raw;
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    liturgyHeadingEn: stripHtml(String(attrs.liturgyHeadingEn ?? '')),
    liturgyHeadingMalylm: stripHtml(String(attrs.liturgyHeadingMalylm ?? '')),
    contentPlaceEn: stripHtml(String(attrs.contentPlaceEn ?? '')),
    contentPlaceMalylm: stripHtml(String(attrs.contentPlaceMalylm ?? '')),
  };
}

function parseReadings(readings: unknown): LiturgyReadingItem[] {
  if (!readings) return [];
  if (Array.isArray(readings)) {
    return readings.map((r) => parseReading(r as Record<string, unknown>));
  }
  const data = (readings as { data?: unknown[] })?.data;
  if (Array.isArray(data)) {
    return data.map((r) => parseReading(r as Record<string, unknown>));
  }
  return [];
}

function normalizeDate(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  // Strapi date fields may return YYYY-MM-DD or full ISO timestamps
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
}

function parseLiturgyDay(raw: unknown): LiturgyDay | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const attrs = (record.attributes as Record<string, unknown> | undefined) ?? record;
  const date = normalizeDate(attrs.date);
  if (!date) return null;

  return {
    id: typeof record.id === 'number' ? record.id : 0,
    documentId: String(record.documentId ?? attrs.documentId ?? ''),
    date,
    dayHeadingEn: stripHtml(String(attrs.dayHeadingEn ?? '')),
    dayHeadingMalylm: stripHtml(String(attrs.dayHeadingMalylm ?? attrs.dayHeadingMl ?? '')),
    seasonNameEn: stripHtml(String(attrs.seasonNameEn ?? '')),
    seasonNameMalylm: stripHtml(String(attrs.seasonNameMalylm ?? attrs.seasonNameMl ?? '')),
    order: typeof attrs.order === 'number' ? attrs.order : 0,
    readings: parseReadings(attrs.readings ?? record.readings),
  };
}

/** Append filters[date][$in] for each day in the month (Strapi $gte+$lte on date is unreliable). */
function appendMonthDateInFilter(params: URLSearchParams, year: number, month: number): void {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  for (let day = 1; day <= lastDay; day++) {
    params.append('filters[date][$in]', `${year}-${mm}-${String(day).padStart(2, '0')}`);
  }
}

function buildBaseParams(options?: { includeTenant?: boolean }): URLSearchParams | null {
  const tenantId = getStrapiTenantId();
  const base = getStrapiApiBase();
  if (!base || !tenantId) {
    console.warn(`${LOG_PREFIX} Strapi URL or tenant ID not configured`);
    return null;
  }

  const params = new URLSearchParams();
  if (options?.includeTenant !== false) {
    params.set('filters[tenant][tenantId][$eq]', tenantId);
  }
  // liturgy-day has draftAndPublish: false — publishedAt filter causes Strapi 400
  params.set('populate[0]', 'readings');
  params.set('sort', 'date:asc');
  return params;
}

async function fetchLiturgyDaysQueryOnce(params: URLSearchParams): Promise<LiturgyDayListResult> {
  const base = getStrapiApiBase();
  if (!base) {
    return { days: [], pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } };
  }

  const url = `${base}/liturgy-days?${params.toString()}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`${LOG_PREFIX} Strapi ${res.status}:`, body.slice(0, 300));
      return { days: [], pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } };
    }

    const json = (await res.json()) as StrapiListResponse;
    const rawList = Array.isArray(json.data) ? json.data : [];
    const days = rawList
      .map(parseLiturgyDay)
      .filter((d): d is LiturgyDay => d !== null);

    const pagination = json.meta?.pagination ?? {
      page: 1,
      pageSize: days.length,
      pageCount: 1,
      total: days.length,
    };

    return { days, pagination };
  } catch (err) {
    console.warn(`${LOG_PREFIX} fetch failed:`, err);
    return { days: [], pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } };
  }
}

async function fetchLiturgyDaysQuery(
  params: URLSearchParams,
  options?: { allowTenantFallback?: boolean },
): Promise<LiturgyDayListResult> {
  const result = await fetchLiturgyDaysQueryOnce(params);

  const hasTenantFilter = params.has('filters[tenant][tenantId][$eq]');
  const shouldFallback =
    options?.allowTenantFallback &&
    hasTenantFilter &&
    result.days.length === 0 &&
    (result.pagination.total === 0 || result.pagination.total === undefined);

  if (!shouldFallback) {
    return result;
  }

  console.warn(
    `${LOG_PREFIX} No liturgy days for tenant ${getStrapiTenantId()}; retrying without tenant filter (entries may lack tenant relation).`,
  );
  const fallbackParams = new URLSearchParams(params);
  fallbackParams.delete('filters[tenant][tenantId][$eq]');
  return fetchLiturgyDaysQueryOnce(fallbackParams);
}

/** Fetch all liturgy days for a calendar month (YYYY-MM-01 … last day). */
export async function fetchLiturgyDaysForMonth(year: number, month: number): Promise<LiturgyDayListResult> {
  const params = buildBaseParams();
  if (!params) {
    return { days: [], pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } };
  }

  appendMonthDateInFilter(params, year, month);
  params.set('pagination[pageSize]', '31');
  params.set('pagination[page]', '1');

  return fetchLiturgyDaysQuery(params, { allowTenantFallback: true });
}

/** Fetch a single liturgy day by exact date (YYYY-MM-DD). */
export async function fetchLiturgyDayByDate(date: string): Promise<LiturgyDay | null> {
  const params = buildBaseParams();
  if (!params) return null;

  params.set('filters[date][$eq]', date);
  params.set('pagination[pageSize]', '1');
  params.set('pagination[page]', '1');

  const result = await fetchLiturgyDaysQuery(params, { allowTenantFallback: true });
  return result.days[0] ?? null;
}

/** Next available liturgy day on or after today (for homepage /api/liturgy). */
export async function fetchNextLiturgyDayFromToday(): Promise<LiturgyDay | null> {
  const params = buildBaseParams();
  if (!params) return null;

  // Strapi date $gte is unreliable; fetch a batch sorted asc and pick first >= today
  params.set('pagination[pageSize]', '100');
  params.set('pagination[page]', '1');

  const today = new Date().toISOString().split('T')[0];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    params.set('pagination[page]', String(page));
    const result = await fetchLiturgyDaysQuery(params, { allowTenantFallback: true });
    pageCount = result.pagination.pageCount;
    const next = result.days.find((d) => d.date >= today);
    if (next) return next;
    page += 1;
  }

  return null;
}

/** Map Strapi liturgy day to legacy LiturgyReading[] for /api/liturgy consumers. */
export function mapLiturgyDayToReadings(day: LiturgyDay, lang: LiturgyLanguage): LiturgyReading[] {
  const isEn = lang === 'en';
  const dayHeadingResolved = isEn
    ? { text: day.dayHeadingEn, usedEnglishFallback: false }
    : resolveMalayalamDisplayText(day.dayHeadingMalylm, day.dayHeadingEn);
  const seasonResolved = isEn
    ? { text: day.seasonNameEn, usedEnglishFallback: false }
    : resolveMalayalamDisplayText(day.seasonNameMalylm, day.seasonNameEn);
  const dayHeading = dayHeadingResolved.text;
  const seasonName = seasonResolved.text;

  const readings: LiturgyReading[] = (day.readings || []).map((r) => {
    const headingResolved = isEn
      ? { text: r.liturgyHeadingEn }
      : resolveMalayalamDisplayText(r.liturgyHeadingMalylm, r.liturgyHeadingEn);
    const placeResolved = isEn
      ? { text: r.contentPlaceEn }
      : resolveMalayalamDisplayText(r.contentPlaceMalylm, r.contentPlaceEn);
    return {
      liturgy_day_heading: dayHeading || '',
      season_name: seasonName || '',
      liturgy_heading: headingResolved.text || '',
      content_place: placeResolved.text || '',
    };
  });

  if (readings.length === 0) {
    readings.push({
      liturgy_day_heading: dayHeading || '',
      season_name: seasonName || '',
      liturgy_heading: '',
      content_place: '',
    });
  }

  return readings;
}

/** Debug URL for development logs (no hardcoded host). */
export function getLiturgyDaysApiPath(): string {
  const base = getStrapiApiBase();
  return base ? `${base}/liturgy-days` : '(Strapi not configured)';
}

export function getLiturgyStrapiConfigured(): boolean {
  return Boolean(getStrapiUrl() && getStrapiTenantId());
}
