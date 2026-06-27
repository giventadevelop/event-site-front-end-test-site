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
