"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { getTenantId } from '@/lib/env';
import type { EventFocusGroupDTO, EventMediaDTO } from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch event-focus-groups associations for this focus group.
 */
export async function fetchEventFocusGroupsByFocusGroupIdServer(
  focusGroupId: number
): Promise<EventFocusGroupDTO[]> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-focus-groups?focusGroupId.equals=${focusGroupId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch event media for a given event and event-focus-group association id.
 */
export async function fetchMediaByEventAndAssociationServer(
  eventId: number,
  eventFocusGroupId: number
): Promise<EventMediaDTO[]> {
  const params = new URLSearchParams({
    'eventId.equals': String(eventId),
    'eventFocusGroupId.equals': String(eventFocusGroupId),
    'isEventManagementOfficialDocument.equals': 'false',
    sort: 'updatedAt,desc',
    'tenantId.equals': getTenantId(),
    page: '0',
    size: '500',
  });
  const url = `${getApiBase()}/api/event-medias?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch event title by event id.
 */
export async function fetchEventTitleServer(eventId: number): Promise<string> {
  const baseUrl = getAppUrl();
  const res = await fetchWithJwtRetry(`${baseUrl}/api/proxy/event-details/${eventId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data?.title ?? '';
}
