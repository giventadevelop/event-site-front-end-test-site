"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchEventsServer(pageNum = 0, pageSize = 5): Promise<EventDetailsDTO[]> {
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

export async function fetchCalendarEventsServer(): Promise<EventCalendarEntryDTO[]> {
  try {
    const url = `${getApiBase()}/api/event-calendar-entries?size=1000&tenantId.equals=${getTenantId()}`;
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
  const url = `${getApiBase()}/api/event-calendar-entries?size=1000&tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data)) return null;
  return data.find((ce: EventCalendarEntryDTO) => ce.event && ce.event.id === eventId) || null;
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
      size: String(params.pageSize || 5),
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
 * Fetch all child events in a recurrence series
 * Uses recurrenceSeriesId to find all events in the series (parent + children)
 */
export async function fetchChildEventsBySeriesIdServer(recurrenceSeriesId: number): Promise<EventDetailsDTO[]> {
  if (!recurrenceSeriesId) return [];
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/event-details?recurrenceSeriesId.equals=${recurrenceSeriesId}&tenantId.equals=${tenantId}&size=1000`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch child events for series ${recurrenceSeriesId}: ${res.status}`);
      return [];
    }
    const events = await res.json();
    const eventArray = Array.isArray(events) ? events : [];
    console.log(`[fetchChildEventsBySeriesIdServer] Fetched ${eventArray.length} events for series ${recurrenceSeriesId}:`,
      eventArray.map(e => ({ id: e.id, parentEventId: e.parentEventId, isActive: e.isActive, title: e.title })));
    return eventArray;
  } catch (error) {
    console.error(`Error fetching child events for series ${recurrenceSeriesId}:`, error);
    return [];
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

      // Delete calendar events for parent and all children (non-blocking)
      // Fetch all events in series to delete their calendar events
      const seriesId = event.recurrenceSeriesId || event.id;
      const allEventsInSeries = await fetchChildEventsBySeriesIdServer(seriesId);

      const calendarDeletionPromises = allEventsInSeries.map(async (e) => {
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
 * - If it's a parent event: deletes parent + all child events
 * - If it's a child event: deletes only that child event
 */
export async function hardDeleteEventWithChildrenServer(event: EventDetailsDTO): Promise<void> {
  if (!event.id) throw new Error('Event ID required for hard delete');

  // Check if this is a parent event (parentEventId is null/undefined)
  const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

  if (isParentEvent) {
    // Parent event: delete parent + all children
    const seriesId = event.recurrenceSeriesId || event.id;
    const allEventsInSeries = await fetchChildEventsBySeriesIdServer(seriesId);

    // Delete all events in the series (delete children first, then parent)
    // Sort so children (with parentEventId) are deleted before parent (without parentEventId)
    const sortedEvents = allEventsInSeries.sort((a, b) => {
      const aIsChild = a.parentEventId != null;
      const bIsChild = b.parentEventId != null;
      if (aIsChild && !bIsChild) return -1;
      if (!aIsChild && bIsChild) return 1;
      return 0;
    });

    const deletionPromises = sortedEvents.map(async (e) => {
      if (!e.id) return;
      try {
        // Delete calendar events first
        try {
          await deleteCalendarEventForEventServer(e);
        } catch (calendarErr) {
          console.warn(`Failed to delete calendar event for event ${e.id}:`, calendarErr);
        }

        // Then delete the event
        const url = `${getApiBase()}/api/event-details/${e.id}`;
        const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Failed to delete event ${e.id}: ${err}`);
        }
      } catch (err) {
        console.error(`Failed to delete event ${e.id}:`, err);
        throw err;
      }
    });

    await Promise.all(deletionPromises);
  } else {
    // Child event: delete only this child
    try {
      // Delete calendar event first
      try {
        await deleteCalendarEventForEventServer(event);
      } catch (calendarErr) {
        console.warn(`Failed to delete calendar event for event ${event.id}:`, calendarErr);
      }

      // Then delete the event
      const url = `${getApiBase()}/api/event-details/${event.id}`;
      const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to delete child event ${event.id}: ${err}`);
      }
    } catch (err) {
      console.error(`Failed to delete child event ${event.id}:`, err);
      throw err;
    }
  }
}