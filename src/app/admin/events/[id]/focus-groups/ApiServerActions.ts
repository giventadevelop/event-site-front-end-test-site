"use server";

import {
  associateEventWithFocusGroup,
  unlinkEventFromFocusGroup,
} from '@/app/admin/focus-groups/[id]/edit/ApiServerActions';
import { fetchEventFocusGroupsForEventServer } from '@/app/admin/events/[id]/media/ApiServerActions';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import type { EventFocusGroupDTO, FocusGroupDTO } from '@/types';

/**
 * Fetch event-focus-groups associations for this event (for event-centric admin page).
 */
export async function fetchLinkedEventFocusGroupsServer(
  eventId: number
): Promise<EventFocusGroupDTO[]> {
  return fetchEventFocusGroupsForEventServer(eventId);
}

/**
 * Fetch all focus groups (for "Link focus group" dropdown).
 */
export async function fetchAllFocusGroupsServer(): Promise<FocusGroupDTO[]> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/focus-groups?size=500&sort=name,asc`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Link this event to a focus group (creates event_focus_groups row).
 */
export async function linkEventToFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<EventFocusGroupDTO> {
  return associateEventWithFocusGroup(eventId, focusGroupId);
}

/**
 * Unlink this event from a focus group (deletes event_focus_groups association).
 */
export async function unlinkEventFromFocusGroupServer(
  eventId: number,
  focusGroupId: number
): Promise<void> {
  return unlinkEventFromFocusGroup(eventId, focusGroupId);
}
