import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventEmailsDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventEmailsServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event emails: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventEmailServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event email: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventEmailServer(email: Omit<EventEmailsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const currentTime = new Date().toISOString();
  const payload = withTenantId({
    ...email,
    createdAt: currentTime,
    updatedAt: currentTime,
  });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event email: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventEmailServer(id: number, email: Partial<EventEmailsDTO>) {
  const payload = withTenantId({ ...email, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event email: ${errorText}`);
  }

  return await response.json();
}

/**
 * Associate an email with an event using the dedicated associate endpoint.
 * This is the proper way to associate an email with an event and avoids Hibernate ID change errors.
 */
export async function associateEmailWithEventServer(emailId: number, eventId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-emails/${emailId}/associate/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to associate email with event: ${errorText}`);
  }

  return await response.json();
}

/**
 * Disassociate an email from an event (set event_id to null) using the dedicated disassociate endpoint.
 */
export async function disassociateEmailFromEventServer(emailId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-emails/${emailId}/disassociate`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disassociate email from event: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventEmailServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event email: ${errorText}`);
  }

  return true;
}

// Get available emails (not mapped to current event) with pagination and search
export async function fetchAvailableEmailsServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available emails for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all emails assigned to the current event
    const assignedEmails = await fetchEventEmailsServer(eventId);
    const assignedEmailIds = new Set((Array.isArray(assignedEmails) ? assignedEmails : [assignedEmails]).map((email: any) => email.id).filter(Boolean));
    console.log('🔍 Email IDs assigned to current event:', Array.from(assignedEmailIds));

    // Step 2: Get all tenant-level emails (fetch without eventId filter)
    console.log('🔄 Fetching all tenant-level emails...');
    let allEmails: EventEmailsDTO[] = [];
    try {
      // Fetch all emails for the tenant (no eventId filter)
      const params = new URLSearchParams();
      const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-emails?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        allEmails = Array.isArray(data) ? data : [data];
        console.log('✅ Fetched', allEmails.length, 'total tenant-level emails');
      } else {
        console.warn('⚠️ Failed to fetch all emails:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching all emails:', error instanceof Error ? error.message : String(error));
    }

    // Step 3: Filter out emails that are assigned to the current event
    const availableEmails = allEmails.filter((email: any) =>
      !assignedEmailIds.has(email.id)
    );

    console.log('🔍 Available emails (not assigned to current event):', availableEmails.length);

    // Step 4: Apply search filter if provided
    const filteredEmails = searchTerm
      ? availableEmails.filter((email: any) =>
          email.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableEmails;

    console.log('✅ Available emails after search filtering:', filteredEmails.length);

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

    return {
      content: paginatedEmails,
      totalElements: filteredEmails.length,
      totalPages: Math.ceil(filteredEmails.length / size),
      assignedCount: assignedEmailIds.size,
      totalEmails: allEmails.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available emails:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalEmails: 0 };
  }
}
