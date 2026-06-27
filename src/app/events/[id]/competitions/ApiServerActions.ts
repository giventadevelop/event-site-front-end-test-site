'use server';

import { auth } from '@clerk/nextjs/server';
import { getApiBaseUrl, getAppUrl, getTenantId } from '@/lib/env';
import { parseApiListResponse } from '@/lib/parseApiListResponse';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import type {
  CompetitionEligibilityCheckDTO,
  EventCompetitionContentBlockDTO,
  EventCompetitionDayDTO,
  EventCompetitionDTO,
  EventCompetitionParticipantDTO,
  EventCompetitionRegistrationDTO,
  EventCompetitionResultDTO,
  EventCompetitionSettingsDTO,
  TeamRegistrationRequestDTO,
  EventCompetitionRegistrationDTO,
} from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

function eventRef(eventId: string | number) {
  return { id: typeof eventId === 'string' ? parseInt(eventId, 10) : eventId };
}

async function listFromBackend<T>(resource: string, query: string): Promise<T[]> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/${resource}?${query}&tenantId.equals=${tenantId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return parseApiListResponse<T>(data);
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

export async function fetchPublicCompetitionSettingsServer(
  eventId: string
): Promise<EventCompetitionSettingsDTO | null> {
  const items = await listFromBackend<EventCompetitionSettingsDTO>(
    'event-competition-settings',
    `eventId.equals=${eventId}`
  );
  return items[0] ?? null;
}

export async function fetchPublicCompetitionDaysServer(eventId: string): Promise<EventCompetitionDayDTO[]> {
  return listFromBackend<EventCompetitionDayDTO>('event-competition-days', `eventId.equals=${eventId}&sort=sortOrder,asc`);
}

export async function fetchPublicCompetitionsServer(eventId: string): Promise<EventCompetitionDTO[]> {
  return listFromBackend<EventCompetitionDTO>(
    'event-competitions',
    `eventId.equals=${eventId}&isActive.equals=true&sort=displayOrder,asc`
  );
}

export async function fetchPublicCompetitionByIdServer(compId: number): Promise<EventCompetitionDTO | null> {
  try {
    const tenantId = getTenantId();
    const url = `${getApiBase()}/api/event-competitions/${compId}?tenantId.equals=${tenantId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as EventCompetitionDTO;
  } catch {
    return null;
  }
}

export async function checkEligibilityServer(
  competitionId: number,
  participantProfileId: number
): Promise<CompetitionEligibilityCheckDTO> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/event-competitions/${competitionId}/eligibility-check?participantProfileId.equals=${participantProfileId}&tenantId.equals=${tenantId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    return { eligible: false, reasons: [text || 'Eligibility check failed'] };
  }
  return (await res.json()) as CompetitionEligibilityCheckDTO;
}

export async function fetchPublicContentBlocksServer(
  eventId: string
): Promise<EventCompetitionContentBlockDTO[]> {
  return listFromBackend<EventCompetitionContentBlockDTO>(
    'event-competition-content-blocks',
    `eventId.equals=${eventId}&sort=sortOrder,asc`
  );
}

export async function fetchPublishedResultsServer(eventId: string): Promise<EventCompetitionResultDTO[]> {
  return listFromBackend<EventCompetitionResultDTO>(
    'event-competition-results',
    `eventId.equals=${eventId}&isPublished.equals=true&sort=placement,asc`
  );
}

export async function fetchMyParticipantsServer(clerkUserId: string): Promise<EventCompetitionParticipantDTO[]> {
  if (!clerkUserId) return [];
  return listFromBackend<EventCompetitionParticipantDTO>(
    'event-competition-participants',
    `clerkUserId.equals=${encodeURIComponent(clerkUserId)}&isActive.equals=true`
  );
}

export async function createParticipantServer(
  payload: Omit<EventCompetitionParticipantDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<EventCompetitionParticipantDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionParticipantDTO>('/event-competition-participants', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id: null,
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function patchParticipantServer(
  id: number,
  payload: Partial<EventCompetitionParticipantDTO>
): Promise<EventCompetitionParticipantDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionParticipantDTO>(`/event-competition-participants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...payload,
        id,
        updatedAt: now,
      })
    ),
  });
}

export async function createBulkRegistrationsServer(
  eventId: string,
  registrations: Array<{
    competitionId: number;
    participantProfileId: number;
    feeAmount: number;
    effectiveCategory?: string;
  }>
): Promise<EventCompetitionRegistrationDTO[]> {
  const now = new Date().toISOString();
  const payload = registrations.map((r) =>
    withTenantId({
      id: null,
      registrationStatus: 'PENDING_PAYMENT',
      feeAmount: r.feeAmount,
      effectiveCategory: r.effectiveCategory ?? '',
      stripePaymentIntentId: '',
      event: eventRef(eventId),
      competition: { id: r.competitionId },
      participantProfile: { id: r.participantProfileId },
      createdAt: now,
      updatedAt: now,
    })
  );
  return proxyJson<EventCompetitionRegistrationDTO[]>('/event-competition-registrations/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createTeamRegistrationServer(
  eventId: string,
  payload: {
    competitionId: number;
    captainParticipantId: number;
    memberParticipantIds: number[];
    feeAmount: number;
    teamName: string;
    teamDisplayName?: string;
    effectiveCategory?: string;
  }
): Promise<EventCompetitionRegistrationDTO> {
  const now = new Date().toISOString();
  const teamPayload: TeamRegistrationRequestDTO = {
    teamName: payload.teamName,
    teamDisplayName: payload.teamDisplayName ?? payload.teamName,
    memberParticipantIds: payload.memberParticipantIds,
    leaderRegistration: withTenantId({
      id: null,
      registrationStatus: 'PENDING_PAYMENT' as const,
      feeAmount: payload.feeAmount,
      effectiveCategory: payload.effectiveCategory ?? '',
      stripePaymentIntentId: '',
      teamName: payload.teamName,
      teamDisplayName: payload.teamDisplayName ?? payload.teamName,
      event: eventRef(eventId),
      competition: { id: payload.competitionId } as EventCompetitionRegistrationDTO['competition'],
      participantProfile: { id: payload.captainParticipantId } as EventCompetitionRegistrationDTO['participantProfile'],
      createdAt: now,
      updatedAt: now,
    }) as Partial<EventCompetitionRegistrationDTO>,
  };
  return proxyJson<EventCompetitionRegistrationDTO>('/event-competition-registrations/team', {
    method: 'POST',
    body: JSON.stringify(teamPayload),
  });
}

export async function createRegistrationServer(
  eventId: string,
  payload: {
    competitionId: number;
    participantProfileId: number;
    feeAmount: number;
    effectiveCategory?: string;
    groupLeaderRegistrationId?: number;
    teamName?: string;
    teamDisplayName?: string;
  }
): Promise<EventCompetitionRegistrationDTO> {
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionRegistrationDTO>('/event-competition-registrations', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        id: null,
        registrationStatus: 'PENDING_PAYMENT',
        feeAmount: payload.feeAmount,
        effectiveCategory: payload.effectiveCategory ?? '',
        stripePaymentIntentId: '',
        event: eventRef(eventId),
        competition: { id: payload.competitionId },
        participantProfile: { id: payload.participantProfileId },
        groupLeaderRegistration: payload.groupLeaderRegistrationId
          ? { id: payload.groupLeaderRegistrationId }
          : undefined,
        teamName: payload.teamName ?? '',
        teamDisplayName: payload.teamDisplayName ?? '',
        createdAt: now,
        updatedAt: now,
      })
    ),
  });
}

export async function fetchMyRegistrationsForEventServer(
  eventId: string,
  clerkUserId: string
): Promise<EventCompetitionRegistrationDTO[]> {
  if (!clerkUserId) return [];
  const participants = await fetchMyParticipantsServer(clerkUserId);
  const participantIds = participants.map((p) => p.id).filter(Boolean) as number[];
  if (participantIds.length === 0) return [];

  const all = await listFromBackend<EventCompetitionRegistrationDTO>(
    'event-competition-registrations',
    `eventId.equals=${eventId}&sort=createdAt,desc`
  );
  return all.filter((r) => {
    const pid = r.participantProfile?.id;
    return pid != null && participantIds.includes(pid);
  });
}

export async function getAuthenticatedClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}
