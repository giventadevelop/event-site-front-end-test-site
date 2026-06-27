'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';

const MAX_SEARCH_RESULTS = 50;
const MAX_RECENT_EVENTS = 50;

function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Search events by name, ID, or date range (max 50). For use in "Link event" search.
 */
export async function searchEventsServer(
  eventName?: string,
  eventId?: string,
  startDate?: string,
  endDate?: string
): Promise<EventDetailsDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('sort', 'startDate,desc');
    params.append('size', String(MAX_SEARCH_RESULTS));

    if (eventId) {
      params.append('id.equals', eventId);
    }
    if (eventName) {
      params.append('title.contains', eventName);
    }
    if (startDate) {
      params.append('startDate.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      params.append('endDate.lessThanOrEqual', endDate);
    }

    const url = `${getApiBase()}/api/event-details?${params.toString()}`;
    const res = await fetchWithJwtRetry(
      url,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'searchEventsServer'
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.content)) return data.content;
    return [];
  } catch (e) {
    console.error('[FocusGroupEvents] searchEventsServer error:', e);
    return [];
  }
}

const DEFAULT_LINKED_PAGE_SIZE = 10;

/**
 * Fetch linked events for a focus group with pagination.
 * Returns events and total count for the pagination footer.
 */
export async function fetchLinkedEventsPaginatedServer(
  focusGroupId: number,
  page: number,
  pageSize: number = DEFAULT_LINKED_PAGE_SIZE
): Promise<{ linked: EventDetailsDTO[]; totalCount: number }> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({
      'focusGroupId.equals': String(focusGroupId),
      sort: 'startDate,desc',
      page: String(page),
      size: String(pageSize),
    });
    const url = `${baseUrl}/api/proxy/event-details?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { linked: [], totalCount: 0 };
    const data = await res.json();
    let content: EventDetailsDTO[] = [];
    if (Array.isArray(data)) content = data;
    else if (data && typeof data === 'object' && Array.isArray(data.content)) content = data.content;
    let totalCount = 0;
    const totalHeader = res.headers.get('x-total-count') || res.headers.get('X-Total-Count');
    if (totalHeader) totalCount = parseInt(totalHeader, 10) || 0;
    else if (data && typeof data === 'object' && typeof (data as { totalElements?: number }).totalElements === 'number')
      totalCount = (data as { totalElements: number }).totalElements;
    else totalCount = content.length;
    return { linked: content, totalCount };
  } catch (e) {
    console.error('[FocusGroupEvents] fetchLinkedEventsPaginatedServer error:', e);
    return { linked: [], totalCount: 0 };
  }
}

/**
 * Fetch recent events for dropdown only (max 50). Does not load full list.
 */
export async function fetchRecentEventsServer(): Promise<EventDetailsDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('sort', 'startDate,desc');
    params.append('size', String(MAX_RECENT_EVENTS));
    const url = `${getApiBase()}/api/event-details?${params.toString()}`;
    const res = await fetchWithJwtRetry(
      url,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'fetchRecentEventsServer'
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.content)) return data.content;
    return [];
  } catch (e) {
    console.error('[FocusGroupEvents] fetchRecentEventsServer error:', e);
    return [];
  }
}

/**
 * Link an event to this focus group (creates event_focus_groups association).
 */
export async function linkEventToFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = getAppUrl();
    const payload = {
      eventId,
      focusGroupId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/event-focus-groups`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
      'linkEventToFocusGroup'
    );
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('already exists') || res.status === 409) {
        return { ok: false, error: 'This event is already linked to this focus group.' };
      }
      return { ok: false, error: text || res.statusText };
    }
    return { ok: true };
  } catch (e: any) {
    console.error('[FocusGroupEvents] linkEventToFocusGroup error:', e);
    return { ok: false, error: e?.message || 'Failed to link event.' };
  }
}

/**
 * Normalize event-focus-groups API response to an array of associations.
 * Handles: plain array, Spring paged { content: [] }, HATEOAS { _embedded: { eventFocusGroups: [] } }.
 */
function normalizeEventFocusGroupsResponse(data: unknown): Array<{ id?: number; eventId?: number; focusGroupId?: number; event_id?: number; focus_group_id?: number }> {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as Array<{ id?: number; eventId?: number; focusGroupId?: number; event_id?: number; focus_group_id?: number }>;
    const emb = o._embedded as Record<string, unknown> | undefined;
    if (emb && Array.isArray(emb.eventFocusGroups)) return emb.eventFocusGroups as Array<{ id?: number; eventId?: number; focusGroupId?: number; event_id?: number; focus_group_id?: number }>;
  }
  return [];
}

/**
 * Find association id from normalized list by eventId and focusGroupId (supports camelCase and snake_case).
 */
function findAssociationInList(
  arr: Array<{ id?: number; eventId?: number; focusGroupId?: number; event_id?: number; focus_group_id?: number }>,
  eventId: number,
  focusGroupId: number
): number | null {
  const assoc = arr.find(
    (a) =>
      (a.eventId === eventId || a.event_id === eventId) &&
      (a.focusGroupId === focusGroupId || a.focus_group_id === focusGroupId)
  );
  return assoc?.id ?? null;
}

/**
 * Unlink an event from this focus group (deletes event_focus_groups association).
 */
export async function unlinkEventFromFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = getAppUrl();
    const findParams = new URLSearchParams({
      'focusGroupId.equals': String(focusGroupId),
      'eventId.equals': String(eventId),
    });
    const findRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/event-focus-groups?${findParams.toString()}`,
      { cache: 'no-store' },
      'findAssociation'
    );
    if (!findRes.ok) return { ok: false, error: 'Association not found.' };
    const data = await findRes.json();
    const arr = normalizeEventFocusGroupsResponse(data);
    const associationId = findAssociationInList(arr, eventId, focusGroupId);
    if (associationId == null) return { ok: false, error: 'Association not found.' };

    const delRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/event-focus-groups/${associationId}`,
      { method: 'DELETE', cache: 'no-store' },
      'unlinkEvent'
    );
    if (!delRes.ok) return { ok: false, error: await delRes.text() || delRes.statusText };
    return { ok: true };
  } catch (e: any) {
    console.error('[FocusGroupEvents] unlinkEventFromFocusGroup error:', e);
    return { ok: false, error: e?.message || 'Failed to unlink event.' };
  }
}
