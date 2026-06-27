'use server';

import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl, getAppUrl, getTenantId } from '@/lib/env';
import { parseApiListResponse } from '@/lib/parseApiListResponse';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import type {
  EventCompetitionContentBlockDTO,
  EventCompetitionDayDTO,
  EventCompetitionDTO,
  EventCompetitionParticipantDTO,
  EventCompetitionRegistrationDTO,
  EventCompetitionResultDTO,
  EventCompetitionSettingsDTO,
} from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

function eventRef(eventId: string | number) {
  return { id: typeof eventId === 'string' ? parseInt(eventId, 10) : eventId };
}

async function proxyJson<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getAppUrl();
  const res = await fetch(`${baseUrl}/api/proxy${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy request failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function listFromBackend<T>(resource: string, query: string): Promise<T[]> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/${resource}?${query}&tenantId.equals=${tenantId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[competitions-admin] GET ${resource} failed:`, res.status, text);
    return [];
  }
  const data = await res.json();
  return parseApiListResponse<T>(data);
}

// --- Settings ---

export async function fetchCompetitionSettingsForEventServer(
  eventId: string
): Promise<EventCompetitionSettingsDTO | null> {
  const items = await listFromBackend<EventCompetitionSettingsDTO>(
    'event-competition-settings',
    `eventId.equals=${eventId}`
  );
  return items[0] ?? null;
}

export async function createCompetitionSettingsServer(
  eventId: string,
  payload: Omit<EventCompetitionSettingsDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'>
): Promise<EventCompetitionSettingsDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionSettingsDTO>('/event-competition-settings', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        event: eventRef(eventId),
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function patchCompetitionSettingsServer(
  id: number,
  eventId: string,
  payload: Partial<EventCompetitionSettingsDTO>
): Promise<EventCompetitionSettingsDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionSettingsDTO>(`/event-competition-settings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id,
        event: eventRef(eventId),
        updatedAt: now,
      })
    ),
  });
}

// --- Days ---

export async function fetchCompetitionDaysForEventServer(eventId: string): Promise<EventCompetitionDayDTO[]> {
  return listFromBackend<EventCompetitionDayDTO>('event-competition-days', `eventId.equals=${eventId}&sort=sortOrder,asc`);
}

export async function createCompetitionDayServer(
  eventId: string,
  payload: Omit<EventCompetitionDayDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'>
): Promise<EventCompetitionDayDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionDayDTO>('/event-competition-days', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        event: eventRef(eventId),
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function patchCompetitionDayServer(
  id: number,
  eventId: string,
  payload: Partial<EventCompetitionDayDTO>
): Promise<EventCompetitionDayDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionDayDTO>(`/event-competition-days/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id,
        event: eventRef(eventId),
        updatedAt: now,
      })
    ),
  });
}

export async function deleteCompetitionDayServer(id: number): Promise<void> {
  const url = `${getApiBase()}/api/event-competition-days/${id}`;
  const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete competition day ${id}`);
}

// --- Competitions ---

export async function fetchCompetitionsForEventServer(eventId: string): Promise<EventCompetitionDTO[]> {
  return listFromBackend<EventCompetitionDTO>(
    'event-competitions',
    `eventId.equals=${eventId}&sort=displayOrder,asc`
  );
}

export async function fetchCompetitionByIdServer(id: number): Promise<EventCompetitionDTO | null> {
  try {
    return await proxyJson<EventCompetitionDTO>(`/event-competitions/${id}`);
  } catch {
    return null;
  }
}

export async function createCompetitionServer(
  eventId: string,
  payload: Omit<EventCompetitionDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'>
): Promise<EventCompetitionDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionDTO>('/event-competitions', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        event: eventRef(eventId),
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function patchCompetitionServer(
  id: number,
  eventId: string,
  payload: Partial<EventCompetitionDTO>
): Promise<EventCompetitionDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionDTO>(`/event-competitions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id,
        event: eventRef(eventId),
        updatedAt: now,
      })
    ),
  });
}

export async function deleteCompetitionServer(id: number): Promise<void> {
  const url = `${getApiBase()}/api/event-competitions/${id}`;
  const res = await fetchWithJwtRetry(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete competition ${id}`);
}

// --- Registrations ---

export async function fetchCompetitionRegistrationsForEventServer(
  eventId: string
): Promise<EventCompetitionRegistrationDTO[]> {
  return listFromBackend<EventCompetitionRegistrationDTO>(
    'event-competition-registrations',
    `eventId.equals=${eventId}&sort=createdAt,desc`
  );
}

// --- Results ---

export async function fetchCompetitionResultsForEventServer(
  eventId: string
): Promise<EventCompetitionResultDTO[]> {
  return listFromBackend<EventCompetitionResultDTO>(
    'event-competition-results',
    `eventId.equals=${eventId}&sort=placement,asc`
  );
}

export async function createCompetitionResultServer(
  eventId: string,
  payload: Omit<EventCompetitionResultDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'>
): Promise<EventCompetitionResultDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionResultDTO>('/event-competition-results', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        event: eventRef(eventId),
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function patchCompetitionResultServer(
  id: number,
  eventId: string,
  payload: Partial<EventCompetitionResultDTO>
): Promise<EventCompetitionResultDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionResultDTO>(`/event-competition-results/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id,
        event: eventRef(eventId),
        updatedAt: now,
      })
    ),
  });
}

export async function patchCompetitionResultDirectServer(
  resultId: number,
  payload: Partial<EventCompetitionResultDTO>
): Promise<EventCompetitionResultDTO> {
  let token = await getCachedApiJwt();
  if (!token) token = await generateApiJwt();
  const url = `${getApiBase()}/api/event-competition-results/${resultId}`;
  const finalPayload = { ...payload, id: resultId, updatedAt: new Date().toISOString() };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(finalPayload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Content blocks ---

export async function fetchCompetitionContentBlocksForEventServer(
  eventId: string
): Promise<EventCompetitionContentBlockDTO[]> {
  return listFromBackend<EventCompetitionContentBlockDTO>(
    'event-competition-content-blocks',
    `eventId.equals=${eventId}&sort=sortOrder,asc`
  );
}

export async function upsertCompetitionContentBlockServer(
  eventId: string,
  payload: Omit<EventCompetitionContentBlockDTO, 'tenantId' | 'createdAt' | 'updatedAt' | 'event'> & {
    id?: number | null;
  }
): Promise<EventCompetitionContentBlockDTO> {
  const now = new Date().toISOString();
  if (payload.id) {
    return proxyJson<EventCompetitionContentBlockDTO>(`/event-competition-content-blocks/${payload.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(
        withTenantId({
          ...payload,
          id: payload.id,
          event: eventRef(eventId),
          updatedAt: now,
        })
      ),
    });
  }
  return proxyJson<EventCompetitionContentBlockDTO>('/event-competition-content-blocks', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        event: eventRef(eventId),
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

// --- Participants (admin view) ---

export async function fetchCompetitionParticipantsForEventServer(
  eventId: string
): Promise<EventCompetitionParticipantDTO[]> {
  return listFromBackend<EventCompetitionParticipantDTO>(
    'event-competition-participants',
    `eventId.equals=${eventId}&sort=lastName,asc`
  );
}
