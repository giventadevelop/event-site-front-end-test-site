'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export interface CalendarEventDTO {
  id: number;
  title: string;
  caption?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  location?: string;
  timezone: string;
  isActive: boolean;
  tenantId?: string;
}

/** Normalize list responses (plain array or Spring page `{ content: [] }`). */
function parseCalendarEventList(data: unknown): CalendarEventDTO[] {
  if (Array.isArray(data)) return data as CalendarEventDTO[];
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: CalendarEventDTO[] }).content;
  }
  return [];
}

/**
 * Events that overlap [rangeStart, rangeEnd] (inclusive).
 * An event overlaps when startDate <= rangeEnd AND endDate >= rangeStart.
 * Do NOT require both dates to fall inside the range — multi-month events
 * (e.g. Aug 29–Sep 27) must still appear on August and September.
 */
function buildOverlapEventDetailsUrl(rangeStart: string, rangeEnd: string, tenantId: string) {
  return (
    `${getApiBase()}/api/event-details?` +
    `startDate.lessThanOrEqual=${rangeEnd}&` +
    `endDate.greaterThanOrEqual=${rangeStart}&` +
    `isActive.equals=true&` +
    `tenantId.equals=${encodeURIComponent(tenantId)}&` +
    `sort=startDate,asc&page=0&size=100`
  );
}

export async function fetchEventsForMonthServer(year: number, month: number, focusGroupSlug?: string) {
  if (!getApiBase()) return [];
  const tenantId = getTenantId();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const monthStart = start.toISOString().slice(0, 10);
  const monthEnd = end.toISOString().slice(0, 10);

  let url = buildOverlapEventDetailsUrl(monthStart, monthEnd, tenantId);
  if (focusGroupSlug) {
    // backend to resolve slug→id; if not available, a proxy convenience can handle this
    url += `&focusGroupSlug.equals=${encodeURIComponent(focusGroupSlug)}`;
  }

  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' }, 'calendar-fetch-month');
    if (!res.ok) return [];
    return parseCalendarEventList(await res.json());
  } catch {
    return [];
  }
}

export async function fetchEventsForRangeServer(startDate: string, endDate: string) {
  if (!getApiBase()) return [];
  const tenantId = getTenantId();
  const url = buildOverlapEventDetailsUrl(startDate, endDate, tenantId);
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' }, 'calendar-fetch-range');
    if (!res.ok) return [];
    return parseCalendarEventList(await res.json());
  } catch {
    return [];
  }
}
