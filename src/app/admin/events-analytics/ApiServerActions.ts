import { EventCalendarEntryDTO, EventTypeDetailsDTO } from '@/types';
import { getTenantId, getAppUrl } from '@/lib/env';

export async function fetchCalendarEventsServer(): Promise<EventCalendarEntryDTO[]> {
  const baseUrl = getAppUrl();
  const tenantId = getTenantId();

  try {
    const response = await fetch(`${baseUrl}/api/proxy/event-calendar-entries?size=1000&tenantId.equals=${tenantId}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export async function fetchEventTypesServer(): Promise<EventTypeDetailsDTO[]> {
  const baseUrl = getAppUrl();
  const tenantId = getTenantId();

  try {
    const response = await fetch(`${baseUrl}/api/proxy/event-type-details?tenantId.equals=${tenantId}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching event types:', error);
    return [];
  }
}