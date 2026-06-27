import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventContactsDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventContactsServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contacts: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contact: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventContactServer(contact: Omit<EventContactsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  console.log('🎯 createEventContactServer called!');
  const currentTime = new Date().toISOString();
  const payload = withTenantId({
    ...contact,
    createdAt: currentTime,
    updatedAt: currentTime,
  });

  // Debug logging
  console.log('🔍 Event Contact Creation Debug:');
  console.log('📥 Input contact:', contact);
  console.log('📤 Final payload:', payload);
  console.log('⏰ Timestamps:', { createdAt: currentTime, updatedAt: currentTime });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Event Contact Creation Failed:', errorText);
    throw new Error(`Failed to create event contact: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventContactServer(id: number, contact: Partial<EventContactsDTO>) {
  const payload = withTenantId({ ...contact, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event contact: ${errorText}`);
  }

  return await response.json();
}

/**
 * Associate a contact with an event using the dedicated associate endpoint.
 * This is the proper way to associate a contact with an event and avoids Hibernate ID change errors.
 */
export async function associateContactWithEventServer(contactId: number, eventId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-contacts/${contactId}/associate/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to associate contact with event: ${errorText}`);
  }

  return await response.json();
}

/**
 * Disassociate a contact from an event (set event_id to null) using the dedicated disassociate endpoint.
 */
export async function disassociateContactFromEventServer(contactId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-contacts/${contactId}/disassociate`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disassociate contact from event: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event contact: ${errorText}`);
  }

  return true;
}

// Get available contacts (not mapped to current event) with pagination and search
export async function fetchAvailableContactsServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available contacts for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all contacts assigned to the current event
    const assignedContacts = await fetchEventContactsServer(eventId);
    const assignedContactIds = new Set((Array.isArray(assignedContacts) ? assignedContacts : [assignedContacts]).map((contact: any) => contact.id).filter(Boolean));
    console.log('🔍 Contact IDs assigned to current event:', Array.from(assignedContactIds));

    // Step 2: Get all tenant-level contacts (fetch without eventId filter)
    console.log('🔄 Fetching all tenant-level contacts...');
    let allContacts: EventContactsDTO[] = [];
    try {
      // Fetch all contacts for the tenant (no eventId filter)
      const params = new URLSearchParams();
      const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        allContacts = Array.isArray(data) ? data : [data];
        console.log('✅ Fetched', allContacts.length, 'total tenant-level contacts');
      } else {
        console.warn('⚠️ Failed to fetch all contacts:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching all contacts:', error instanceof Error ? error.message : String(error));
    }

    // Step 3: Filter out contacts that are assigned to the current event
    const availableContacts = allContacts.filter((contact: any) =>
      !assignedContactIds.has(contact.id)
    );

    console.log('🔍 Available contacts (not assigned to current event):', availableContacts.length);

    // Step 4: Apply search filter if provided
    const filteredContacts = searchTerm
      ? availableContacts.filter((contact: any) =>
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableContacts;

    console.log('✅ Available contacts after search filtering:', filteredContacts.length);

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

    return {
      content: paginatedContacts,
      totalElements: filteredContacts.length,
      totalPages: Math.ceil(filteredContacts.length / size),
      assignedCount: assignedContactIds.size,
      totalContacts: allContacts.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available contacts:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalContacts: 0 };
  }
}