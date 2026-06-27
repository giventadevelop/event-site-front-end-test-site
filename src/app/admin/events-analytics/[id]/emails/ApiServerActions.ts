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
