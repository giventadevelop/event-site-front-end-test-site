"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchEventsServer(pageNum = 0, pageSize = 20): Promise<EventDetailsDTO[]> {
  try {
    const url = `${getApiBase()}/api/event-details?page=${pageNum}&size=${pageSize}&sort=startDate,asc&tenantId.equals=${getTenantId()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error('[fetchEventsServer] Failed:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('[fetchEventsServer] Error:', error);
    return [];
  }
}

export async function fetchEventTypesServer(): Promise<EventTypeDetailsDTO[]> {
  try {
    const url = `${getApiBase()}/api/event-type-details?tenantId.equals=${getTenantId()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error('[fetchEventTypesServer] Failed:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('[fetchEventTypesServer] Error:', error);
    return [];
  }
}

export async function fetchCalendarEventsServer(eventIds: number[] = []): Promise<EventCalendarEntryDTO[]> {
  try {
    const ids = eventIds.filter((id) => id != null);
    if (ids.length === 0) return [];
    // Scope the fetch to the events actually being enriched (repeated eventId.in params)
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('eventId.in', String(id)));
    params.append('size', String(ids.length));
    params.append('tenantId.equals', getTenantId());
    const url = `${getApiBase()}/api/event-calendar-entries?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error('[fetchCalendarEventsServer] Failed:', res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[fetchCalendarEventsServer] Error:', error);
    return [];
  }
}

export async function createEventServer(event: any): Promise<any> {
  const url = `${getApiBase()}/api/event-details`;
  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return await res.json();
}

export async function updateEventServer(event: any): Promise<any> {
  if (!event.id) throw new Error('Event ID required for update');
  const url = `${getApiBase()}/api/event-details/${event.id}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return await res.json();
}

export async function cancelEventServer(event: EventDetailsDTO): Promise<EventDetailsDTO> {
  if (!event.id) throw new Error('Event ID required for cancel');
  const url = `${getApiBase()}/api/event-details/${event.id}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, isActive: false }),
  });
  if (!res.ok) throw new Error('Failed to cancel event');
  return await res.json();
}

function toGoogleCalendarDate(date: string, time: string) {
  if (!date || !time) return '';
  const [year, month, day] = date.split('-');
  let [hour, minute] = time.split(':');
  let ampm = '';
  if (minute && minute.includes(' ')) {
    [minute, ampm] = minute.split(' ');
  }
  let h = parseInt(hour, 10);
  if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute}00`;
}

export async function createCalendarEventServer(event: EventDetailsDTO, userProfile: UserProfileDTO) {
  const now = new Date().toISOString();
  const start = toGoogleCalendarDate(event.startDate, event.startTime);
  const end = toGoogleCalendarDate(event.endDate, event.endTime);
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  const calendarEvent: EventCalendarEntryDTO = {
    calendarProvider: 'GOOGLE',
    calendarLink,
    createdAt: now,
    updatedAt: now,
    event,
    createdBy: userProfile,
  };
  const url = `${getApiBase()}/api/event-calendar-entries`;
  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(calendarEvent),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create calendar event: ${err}`);
  }
  return await res.json();
}

export async function findCalendarEventByEventIdServer(eventId: number): Promise<EventCalendarEntryDTO | null> {
  const url = `${getApiBase()}/api/event-calendar-entries?eventId.equals=${eventId}&size=1&tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

export async function updateCalendarEventForEventServer(event: EventDetailsDTO, userProfile: UserProfileDTO) {
  if (!event.id) return;
  const calendarEvent = await findCalendarEventByEventIdServer(event.id);
  if (!calendarEvent || !calendarEvent.id) return;
  const now = new Date().toISOString();
  const start = toGoogleCalendarDate(event.startDate, event.startTime);
  const end = toGoogleCalendarDate(event.endDate, event.endTime);
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  const updatedCalendarEvent: EventCalendarEntryDTO = {
    ...calendarEvent,
    calendarLink,
    updatedAt: now,
    event,
    createdBy: userProfile,
  };
  const url = `${getApiBase()}/api/event-calendar-entries/${calendarEvent.id}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCalendarEvent),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update calendar event: ${err}`);
  }
  return await res.json();
}

export async function deleteCalendarEventForEventServer(event: EventDetailsDTO) {
  if (!event.id) return;
  const calendarEvent = await findCalendarEventByEventIdServer(event.id);
  if (!calendarEvent || !calendarEvent.id) return;
  const url = `${getApiBase()}/api/event-calendar-entries/${calendarEvent.id}`;
  const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete calendar event: ${err}`);
  }
}

export async function fetchEventsFilteredServer(params: {
  title?: string,
  id?: string,
  caption?: string,
  startDate?: string,
  endDate?: string,
  admissionType?: string,
  sort?: string,
  pageNum?: number,
  pageSize?: number
}): Promise<{ events: EventDetailsDTO[], totalCount: number }> {
  try {
    const tenantId = getTenantId();
    const queryParams = new URLSearchParams({
      'tenantId.equals': tenantId,
      page: String(params.pageNum || 0),
      size: String(params.pageSize || 20),
      sort: params.sort || 'startDate,asc'
    });

    if (params.title) queryParams.append('title.contains', params.title);
    if (params.id) queryParams.append('id.equals', params.id);
    if (params.caption) queryParams.append('caption.contains', params.caption);
    if (params.startDate) queryParams.append('startDate.greaterThanOrEqual', params.startDate);
    if (params.endDate) queryParams.append('endDate.lessThanOrEqual', params.endDate);
    if (params.admissionType) queryParams.append('admissionType.equals', params.admissionType);

    const url = `${getApiBase()}/api/event-details?${queryParams.toString()}`;

    const res = await fetchWithJwtRetry(url, {});

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[fetchEventsFilteredServer] Failed:', res.status, errorBody);
      return { events: [], totalCount: 0 };
    }

    const totalCount = Number(res.headers.get('X-Total-Count')) || 0;
    const events = await res.json();

    return { events, totalCount };
  } catch (error) {
    console.error('[fetchEventsFilteredServer] Error:', error);
    return { events: [], totalCount: 0 };
  }
}

const EVENT_TYPEAHEAD_LIMIT = 20;

function normalizeEventList(data: unknown): EventDetailsDTO[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: EventDetailsDTO[] }).content;
  }
  return [];
}

function mergeEventsById(...lists: EventDetailsDTO[][]): EventDetailsDTO[] {
  const byKey = new Map<string, EventDetailsDTO>();
  for (const list of lists) {
    for (const event of list) {
      const key =
        event.id != null
          ? `id:${event.id}`
          : event.title
            ? `title:${event.title}`
            : null;
      if (!key || byKey.has(key)) continue;
      byKey.set(key, event);
    }
  }
  return Array.from(byKey.values());
}

/**
 * Multi-field typeahead for Manage Events:
 * matches title, caption, and numeric id (parallel criteria queries).
 */
export async function searchEventsForTypeaheadServer(
  query: string,
): Promise<EventDetailsDTO[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tenantId = getTenantId();
  const baseParams = () => {
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('page', '0');
    params.append('size', String(EVENT_TYPEAHEAD_LIMIT));
    params.append('sort', 'startDate,asc');
    return params;
  };

  const fetchBy = async (apply: (params: URLSearchParams) => void) => {
    const params = baseParams();
    apply(params);
    const res = await fetchWithJwtRetry(
      `${getApiBase()}/api/event-details?${params.toString()}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [] as EventDetailsDTO[];
    return normalizeEventList(await res.json());
  };

  const jobs: Promise<EventDetailsDTO[]>[] = [
    fetchBy((p) => p.append('title.contains', trimmed)),
    fetchBy((p) => p.append('caption.contains', trimmed)),
  ];

  if (!Number.isNaN(Number(trimmed))) {
    jobs.push(fetchBy((p) => p.append('id.equals', String(Number(trimmed)))));
  }

  const results = await Promise.all(jobs);
  return mergeEventsById(...results).slice(0, EVENT_TYPEAHEAD_LIMIT);
}

export async function fetchEventDetailsServer(eventId: number): Promise<EventDetailsDTO | null> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/event-details/${eventId}?tenantId.equals=${tenantId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`Failed to fetch event details for eventId ${eventId}:`, res.status, await res.text());
    return null;
  }
  return await res.json();
}

export async function fetchUserProfileServer(userId: string): Promise<UserProfileDTO | null> {
    if (!userId) {
        return null;
    }
    const tenantId = getTenantId();
    const url = `${getApiBase()}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`;
    try {
        const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch user profile for userId ${userId}: ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`Error fetching user profile for userId ${userId}:`, error);
        return null;
    }
}

export async function fetchUserProfileByEmailServer(email: string): Promise<UserProfileDTO | null> {
    if (!email) {
      return null;
    }
    const tenantId = getTenantId();
    const url = `${getApiBase()}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`;
    try {
        const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch user profile for email ${email}: ${res.status}`);
            return null;
        }
        const users = await res.json();
        return users && users.length > 0 ? users[0] : null;
  } catch (error) {
        console.error(`Error fetching user profile for email ${email}:`, error);
    return null;
  }
}

/**
 * Fetch all events in a recurrence series (parent + children).
 *
 * IMPORTANT: Backend criteria on nullable fields (e.g. recurrenceSeriesId.equals=N)
 * can return the entire tenant event list when values are null. Always filter
 * client-side to the exact series id before using the result for delete/activate.
 */
export async function fetchChildEventsBySeriesIdServer(recurrenceSeriesId: number): Promise<EventDetailsDTO[]> {
  if (recurrenceSeriesId == null || Number.isNaN(Number(recurrenceSeriesId))) return [];
  const seriesIdNum = Number(recurrenceSeriesId);
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/event-details?recurrenceSeriesId.equals=${seriesIdNum}&tenantId.equals=${tenantId}&size=1000`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch child events for series ${seriesIdNum}: ${res.status}`);
      return [];
    }
    const events = await res.json();
    const eventArray = Array.isArray(events) ? events : [];
    // Guard against backend returning unfiltered tenant-wide lists for null criteria fields
    const filtered = eventArray.filter(
      (e) => e.recurrenceSeriesId != null && Number(e.recurrenceSeriesId) === seriesIdNum
    );
    console.log(
      `[fetchChildEventsBySeriesIdServer] series=${seriesIdNum} raw=${eventArray.length} filtered=${filtered.length}`,
      filtered.map((e) => ({ id: e.id, parentEventId: e.parentEventId, isActive: e.isActive, title: e.title }))
    );
    return filtered;
  } catch (error) {
    console.error(`Error fetching child events for series ${seriesIdNum}:`, error);
    return [];
  }
}

/**
 * Fetch child events whose parentEventId matches the given parent id.
 * Client-side filter required — parentEventId.equals criteria can return all events.
 */
export async function fetchChildEventsByParentIdServer(parentEventId: number): Promise<EventDetailsDTO[]> {
  if (parentEventId == null) return [];
  const parentIdNum = Number(parentEventId);
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/event-details?parentEventId.equals=${parentIdNum}&tenantId.equals=${tenantId}&size=1000`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch children for parent ${parentIdNum}: ${res.status}`);
      return [];
    }
    const events = await res.json();
    const eventArray = Array.isArray(events) ? events : [];
    return eventArray.filter(
      (e) => e.parentEventId != null && Number(e.parentEventId) === parentIdNum
    );
  } catch (error) {
    console.error(`Error fetching children for parent ${parentIdNum}:`, error);
    return [];
  }
}

async function deleteSingleEventByIdServer(event: EventDetailsDTO): Promise<void> {
  if (!event.id) return;
  try {
    await deleteCalendarEventForEventServer(event);
  } catch (calendarErr) {
    console.warn(`Failed to delete calendar event for event ${event.id}:`, calendarErr);
  }
  const url = `${getApiBase()}/api/event-details/${event.id}`;
  const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete event ${event.id}: ${err}`);
  }
}

/**
 * Soft delete (deactivate) an event
 * - If it's a parent event: deactivates parent + all child events
 * - If it's a child event: deactivates only that child event
 */
export async function softDeleteEventWithChildrenServer(event: EventDetailsDTO): Promise<void> {
  if (!event.id) throw new Error('Event ID required for soft delete');

  // Check if this is a parent event (parentEventId is null/undefined)
  const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

  if (isParentEvent) {
    // Parent event: Only update the parent - backend will automatically sync children via syncChildEventsActiveStatus
    console.log(`[softDeleteEventWithChildrenServer] Deactivating parent event ${event.id} - backend will sync children automatically`);

    try {
      // Fetch full event details to ensure we have all required fields
      const fullEvent = await fetchEventDetailsServer(event.id);
      if (!fullEvent) {
        throw new Error(`Event ${event.id} not found`);
      }

      const url = `${getApiBase()}/api/event-details/${event.id}`;
      console.log(`[softDeleteEventWithChildrenServer] Calling PUT ${url} to deactivate parent event ${event.id}`);

      // Explicitly set isRecurring to false to prevent backend from trying to generate recurring events
      // This is a workaround for backend bug where it calls generateRecurringEvents() even when isRecurring=false
      const updatePayload = {
        ...fullEvent,
        isActive: false,
        isRecurring: false, // Explicitly set to false to prevent recurrence generation
      };

      const res = await fetchWithJwtRetry(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[softDeleteEventWithChildrenServer] Failed to deactivate parent event ${event.id}: ${res.status} ${errorText}`);
        throw new Error(`Failed to deactivate parent event: ${res.status} ${errorText}`);
      }

      console.log(`[softDeleteEventWithChildrenServer] Successfully deactivated parent event ${event.id} - backend should sync children automatically`);

      // Delete calendar events for parent + real children only (non-blocking)
      const calendarTargets: EventDetailsDTO[] = [fullEvent];
      if (event.recurrenceSeriesId != null) {
        const seriesEvents = await fetchChildEventsBySeriesIdServer(event.recurrenceSeriesId);
        for (const e of seriesEvents) {
          if (e.id != null && e.id !== event.id) calendarTargets.push(e);
        }
      } else {
        const children = await fetchChildEventsByParentIdServer(event.id);
        calendarTargets.push(...children);
      }

      const calendarDeletionPromises = calendarTargets.map(async (e) => {
        if (!e.id) return;
        try {
          await deleteCalendarEventForEventServer(e);
        } catch (calendarErr) {
          console.warn(`[softDeleteEventWithChildrenServer] Failed to delete calendar event for event ${e.id}:`, calendarErr);
        }
      });

      // Don't await calendar deletions - they're non-blocking
      Promise.all(calendarDeletionPromises).catch(err => {
        console.warn(`[softDeleteEventWithChildrenServer] Some calendar event deletions failed:`, err);
      });
    } catch (err) {
      console.error(`[softDeleteEventWithChildrenServer] Failed to deactivate parent event ${event.id}:`, err);
      throw err;
    }
  } else {
    // Child event: deactivate only this child
    console.log(`[softDeleteEventWithChildrenServer] Deactivating child event ${event.id}, parentEventId: ${event.parentEventId}`);
    try {
      // First, fetch the full event details to ensure we have all required fields
      const fullEvent = await fetchEventDetailsServer(event.id);
      if (!fullEvent) {
        throw new Error(`Event ${event.id} not found`);
      }

      const url = `${getApiBase()}/api/event-details/${event.id}`;
      console.log(`[softDeleteEventWithChildrenServer] Calling PUT ${url} with isActive=false`);

      // Explicitly set isRecurring to false to prevent backend from trying to generate recurring events
      // This is a workaround for backend bug where it calls generateRecurringEvents() even when isRecurring=false
      const updatePayload = {
        ...fullEvent,
        isActive: false,
        isRecurring: false, // Explicitly set to false to prevent recurrence generation
      };

      const res = await fetchWithJwtRetry(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[softDeleteEventWithChildrenServer] Failed to deactivate child event ${event.id}: ${res.status} ${errorText}`);
        throw new Error(`Failed to deactivate event: ${res.status} ${errorText}`);
      }

      const updatedEvent = await res.json();
      console.log(`[softDeleteEventWithChildrenServer] Successfully deactivated child event ${event.id}`, updatedEvent);

      // Also delete calendar event if it exists (non-blocking)
      try {
        await deleteCalendarEventForEventServer(fullEvent);
      } catch (calendarErr) {
        console.warn(`[softDeleteEventWithChildrenServer] Failed to delete calendar event for event ${event.id}:`, calendarErr);
        // Don't throw - calendar deletion is optional
      }
    } catch (err) {
      console.error(`[softDeleteEventWithChildrenServer] Error deactivating child event ${event.id}:`, err);
      throw err;
    }
  }
}

/**
 * Activate an event
 * - If it's a parent event: activates parent + all child events
 * - If it's a child event: activates only that child event
 */
export async function activateEventWithChildrenServer(event: EventDetailsDTO): Promise<void> {
  if (!event.id) throw new Error('Event ID required for activation');

  // Check if this is a parent event (parentEventId is null/undefined)
  const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

  if (isParentEvent) {
    // Parent event: Only update the parent - backend will automatically sync children via syncChildEventsActiveStatus
    console.log(`[activateEventWithChildrenServer] Activating parent event ${event.id} - backend will sync children automatically`);

    try {
      // Fetch full event details to ensure we have all required fields
      const fullEvent = await fetchEventDetailsServer(event.id);
      if (!fullEvent) {
        throw new Error(`Event ${event.id} not found`);
      }

      const url = `${getApiBase()}/api/event-details/${event.id}`;
      console.log(`[activateEventWithChildrenServer] Calling PUT ${url} to activate parent event ${event.id}`);

      const updatePayload = {
        ...fullEvent,
        isActive: true,
      };

      const res = await fetchWithJwtRetry(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[activateEventWithChildrenServer] Failed to activate parent event ${event.id}: ${res.status} ${errorText}`);
        throw new Error(`Failed to activate parent event: ${res.status} ${errorText}`);
      }

      console.log(`[activateEventWithChildrenServer] Successfully activated parent event ${event.id} - backend should sync children automatically`);
    } catch (err) {
      console.error(`[activateEventWithChildrenServer] Failed to activate parent event ${event.id}:`, err);
      throw err;
    }
  } else {
    // Child event: activate only this child
    try {
      const url = `${getApiBase()}/api/event-details/${event.id}`;
      await fetchWithJwtRetry(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, isActive: true }),
      });
    } catch (err) {
      console.error(`Failed to activate child event ${event.id}:`, err);
      throw err;
    }
  }
}

/**
 * Hard delete (permanently delete) an event
 * - Standalone event (no series / no children): deletes only that event id
 * - Parent of a recurrence series: deletes parent + events that truly belong to that series
 * - Child event: deletes only that child event
 *
 * Never use event.id as a fake recurrenceSeriesId — backend criteria on null
 * recurrenceSeriesId can return every tenant event and wipe the list.
 */
export async function hardDeleteEventWithChildrenServer(event: EventDetailsDTO): Promise<void> {
  if (!event.id) throw new Error('Event ID required for hard delete');

  const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;
  const eventsToDeleteById = new Map<number, EventDetailsDTO>();
  eventsToDeleteById.set(event.id, event);

  if (isParentEvent) {
    if (event.recurrenceSeriesId != null) {
      const seriesEvents = await fetchChildEventsBySeriesIdServer(event.recurrenceSeriesId);
      for (const e of seriesEvents) {
        if (e.id != null) eventsToDeleteById.set(e.id, e);
      }
    } else {
      const children = await fetchChildEventsByParentIdServer(event.id);
      for (const e of children) {
        if (e.id != null) eventsToDeleteById.set(e.id, e);
      }
    }
  }

  const sortedEvents = Array.from(eventsToDeleteById.values()).sort((a, b) => {
    const aIsChild = a.parentEventId != null;
    const bIsChild = b.parentEventId != null;
    if (aIsChild && !bIsChild) return -1;
    if (!aIsChild && bIsChild) return 1;
    return 0;
  });

  console.log(
    `[hardDeleteEventWithChildrenServer] Deleting ${sortedEvents.length} event(s) for target id=${event.id}:`,
    sortedEvents.map((e) => e.id)
  );

  // Delete sequentially (children first) so a failure does not leave orphans mid-parallel fan-out
  for (const e of sortedEvents) {
    await deleteSingleEventByIdServer(e);
  }
}