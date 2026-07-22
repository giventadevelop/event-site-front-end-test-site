import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl, getTenantId } from '@/lib/env';
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
  params.append('size', '200');

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

    // Step 2: Fetch one page of tenant-level contacts, excluding assigned ones server-side
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'name,asc');
    assignedContactIds.forEach((id) => params.append('id.notIn', String(id)));
    if (searchTerm.trim()) {
      params.append('name.contains', searchTerm.trim());
    }

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-contacts?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch available contacts:', response.status, response.statusText);
      return { content: [], totalElements: 0, totalPages: 0, assignedCount: assignedContactIds.size, totalContacts: 0 };
    }

    const data = await response.json();
    const availableContacts: EventContactsDTO[] = Array.isArray(data) ? data : [data];
    const totalElements = parseInt(response.headers.get('x-total-count') || `${availableContacts.length}`, 10);

    console.log('✅ Available contacts (not assigned to current event):', totalElements);

    return {
      content: availableContacts,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      assignedCount: assignedContactIds.size,
      totalContacts: totalElements + assignedContactIds.size
    };
  } catch (error) {
    console.warn('❌ Error fetching available contacts:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalContacts: 0 };
  }
}