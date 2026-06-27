"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO, EventFocusGroupDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Associate an event with a focus group
 * Checks if relationship already exists before creating to prevent duplicate constraint violations
 */
export async function associateEventWithFocusGroup(
  eventId: number,
  focusGroupId: number
): Promise<EventFocusGroupDTO> {
  // Check if relationship already exists
  const existingId = await findAssociationId(eventId, focusGroupId);
  
  if (existingId) {
    // Relationship already exists - throw user-friendly error
    throw new Error('This event is already associated with this focus group.');
  }

  // Relationship doesn't exist - proceed with creation
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-focus-groups`;
  
  const payload = {
    eventId,
    focusGroupId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to associate event with focus group:', res.status, errorText);
    
    // Check if error is due to duplicate (in case check missed it)
    if (errorText.includes('already exists') || errorText.includes('duplicate') || res.status === 409) {
      throw new Error('This event is already associated with this focus group.');
    }
    
    throw new Error(`Failed to associate event: ${res.statusText}`);
  }

  return await res.json();
}

/** Normalize event-focus-groups API response to array (handles paged / _embedded / snake_case). */
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
 * Find association ID for an event and focus group
 */
export async function findAssociationId(
  eventId: number,
  focusGroupId: number
): Promise<number | null> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId.toString(),
    'eventId.equals': eventId.toString(),
  });

  const url = `${baseUrl}/api/proxy/event-focus-groups?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    console.error('Failed to find association:', res.status);
    return null;
  }

  const data = await res.json();
  const associations = normalizeEventFocusGroupsResponse(data);
  const association = associations.find(
    (a) =>
      (a.eventId === eventId || a.event_id === eventId) &&
      (a.focusGroupId === focusGroupId || a.focus_group_id === focusGroupId)
  );

  return association?.id ?? null;
}

/**
 * Unlink an event from a focus group
 */
export async function unlinkEventFromFocusGroup(
  eventId: number,
  focusGroupId: number
): Promise<void> {
  const baseUrl = getAppUrl();
  
  // First, find the association ID
  const associationId = await findAssociationId(eventId, focusGroupId);
  
  if (!associationId) {
    throw new Error('Association not found');
  }

  const url = `${baseUrl}/api/proxy/event-focus-groups/${associationId}`;

  const res = await fetchWithJwtRetry(url, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to unlink event from focus group:', res.status, errorText);
    throw new Error(`Failed to unlink event: ${res.statusText}`);
  }
}

/**
 * Fetch event IDs linked to a focus group from event_focus_groups table only.
 */
async function fetchLinkedEventIds(baseUrl: string, focusGroupId: number): Promise<number[]> {
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId.toString(),
    size: '500',
  });
  const res = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-focus-groups?${params.toString()}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const arr = normalizeEventFocusGroupsResponse(data);
  return arr
    .map((a) => a.eventId ?? a.event_id)
    .filter((id): id is number => typeof id === 'number');
}

/**
 * Fetch associated events for a focus group with pagination.
 * Uses event_focus_groups table as source of truth: only events that have a row there are shown.
 */
export async function fetchAssociatedEvents(
  focusGroupId: number,
  page: number = 0,
  pageSize: number = 10,
  sort: string = 'startDate,desc',
  showPastEvents?: boolean
): Promise<{ events: EventDetailsDTO[]; totalCount: number }> {
  const baseUrl = getAppUrl();

  const eventIds = await fetchLinkedEventIds(baseUrl, focusGroupId);
  if (eventIds.length === 0) {
    return { events: [], totalCount: 0 };
  }

  const params = new URLSearchParams({
    'id.in': eventIds.join(','),
    page: page.toString(),
    size: pageSize.toString(),
    sort,
  });

  if (showPastEvents !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    if (showPastEvents) {
      params.append('endDate.lessThan', today);
    } else {
      params.append('startDate.greaterThanOrEqual', today);
    }
  }

  const url = `${baseUrl}/api/proxy/event-details?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch associated events:', res.status, errorText);
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }

  const data = await res.json();
  const content = Array.isArray(data) ? data : (data && Array.isArray((data as { content?: unknown }).content) ? (data as { content: EventDetailsDTO[] }).content : []);
  let totalCount = Number(res.headers.get('X-Total-Count') || res.headers.get('x-total-count')) || 0;
  if (totalCount === 0 && data && typeof data === 'object' && typeof (data as { totalElements?: number }).totalElements === 'number') {
    totalCount = (data as { totalElements: number }).totalElements;
  }
  if (totalCount === 0) totalCount = content.length;

  return { events: content, totalCount };
}

/**
 * Search events by title or ID
 */
export async function searchEvents(
  searchTerm: string,
  searchType: 'title' | 'id',
  pageSize: number = 100
): Promise<EventDetailsDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    page: '0',
    size: pageSize.toString(),
    sort: 'startDate,desc',
  });

  if (searchType === 'id') {
    params.append('id.equals', searchTerm);
  } else {
    params.append('title.contains', searchTerm);
  }

  const url = `${baseUrl}/api/proxy/event-details?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to search events:', res.status, errorText);
    return [];
  }

  const events = await res.json();
  return Array.isArray(events) ? events : [];
}

