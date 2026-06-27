import { getAppUrl } from '@/lib/env';
import type { EventProgramDirectorsDTO } from '@/types';

export async function fetchEventProgramDirectorsServer(eventId: number) {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetch(`${baseUrl}/api/proxy/event-program-directors?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program directors: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventProgramDirectorServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-program-directors/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program director: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventProgramDirectorServer(director: Omit<EventProgramDirectorsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const baseUrl = getAppUrl();
  const currentTime = new Date().toISOString();
  // Don't apply withTenantId here since the proxy will handle it
  const payload = {
    ...director,
    createdAt: currentTime,
    updatedAt: currentTime,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: cleanUrlField(director.photoUrl),
  };

  const response = await fetch(`${baseUrl}/api/proxy/event-program-directors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event program director: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventProgramDirectorServer(id: number, director: Partial<EventProgramDirectorsDTO>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const baseUrl = getAppUrl();
  // Don't apply withTenantId here since the proxy will handle it
  const payload = {
    ...director,
    id,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: director.photoUrl ? cleanUrlField(director.photoUrl) : undefined,
  };

  const response = await fetch(`${baseUrl}/api/proxy/event-program-directors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event program director: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventProgramDirectorServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-program-directors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event program director: ${errorText}`);
  }

  return true;
}
