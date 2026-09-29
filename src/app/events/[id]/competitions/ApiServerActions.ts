'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchUserProfileServer, createUserProfileServer } from '@/app/profile/ApiServerActions';
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

async function resolveRegisteredByUserProfileId(): Promise<number> {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    throw new Error('You must be signed in to register for a competition.');
  }
  return resolveUserProfileIdForCompetition(clerkUserId);
}

function registeredByUserProfileRef(userProfileId: number) {
  return { id: userProfileId } as EventCompetitionRegistrationDTO['registeredByUserProfile'];
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

/** Backend requires user_profile_id on every competition participant row. */
async function resolveUserProfileIdForCompetition(
  clerkUserId: string,
  opts?: { email?: string; firstName?: string; lastName?: string }
): Promise<number> {
  const clerkUser = await currentUser();
  const email = opts?.email?.trim() || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
  const firstName = opts?.firstName?.trim() || clerkUser?.firstName || 'Pending';
  const lastName = opts?.lastName?.trim() || clerkUser?.lastName || 'User';

  let profile = await fetchUserProfileServer(clerkUserId, { email, firstName, lastName });

  if (!profile?.id && clerkUserId && email) {
    profile = await createUserProfileServer({
      userId: clerkUserId,
      email,
      firstName,
      lastName,
      phone: '',
      userRole: 'MEMBER',
      userStatus: 'ACTIVE',
    });
  }

  if (!profile?.id) {
    throw new Error(
      'We could not find or create your account profile. Please complete your profile and try again.'
    );
  }

  return profile.id;
}

function withParticipantUserProfileLinks(
  payload: Omit<EventCompetitionParticipantDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  userProfileId: number
): Omit<EventCompetitionParticipantDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> {
  const userProfileLink = { id: userProfileId } as EventCompetitionParticipantDTO['userProfile'];
  const linked = {
    ...payload,
    userProfile: userProfileLink,
  };

  if (payload.participantType === 'CHILD') {
    return {
      ...linked,
      guardianUserProfile: userProfileLink,
    };
  }

  return linked;
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
  const [results, competitions] = await Promise.all([
    listFromBackend<EventCompetitionResultDTO>(
      'event-competition-results',
      `eventId.equals=${eventId}&isPublished.equals=true&sort=placement,asc`
    ),
    listFromBackend<EventCompetitionDTO>(
      'event-competitions',
      `eventId.equals=${eventId}&sort=displayOrder,asc`
    ),
  ]);

  const competitionById = new Map(
    competitions.filter((c) => c.id != null).map((c) => [Number(c.id), c])
  );

  return results.map((r) => {
    const competitionId =
      r.competition?.id ??
      (r as EventCompetitionResultDTO & { competitionId?: number | null }).competitionId ??
      null;
    const competition =
      (competitionId != null ? competitionById.get(Number(competitionId)) : undefined) ?? r.competition;
    return { ...r, competition };
  });
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
  const userProfileId = await resolveUserProfileIdForCompetition(payload.clerkUserId, {
    email: payload.email ?? undefined,
    firstName: payload.firstName,
    lastName: payload.lastName,
  });
  const enriched = withParticipantUserProfileLinks(payload, userProfileId);
  const now = new Date().toISOString();
  return proxyJson<EventCompetitionParticipantDTO>('/event-competition-participants', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...enriched,
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
  let enriched: Partial<EventCompetitionParticipantDTO> = { ...payload };

  if (!payload.userProfile?.id && payload.clerkUserId) {
    const userProfileId = await resolveUserProfileIdForCompetition(payload.clerkUserId, {
      email: payload.email ?? undefined,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    const userProfileLink = { id: userProfileId } as EventCompetitionParticipantDTO['userProfile'];
    enriched = {
      ...enriched,
      userProfile: userProfileLink,
      ...(payload.participantType === 'CHILD'
        ? { guardianUserProfile: userProfileLink }
        : {}),
    };
  }

  return proxyJson<EventCompetitionParticipantDTO>(`/event-competition-participants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(
      withTenantId({
        ...enriched,
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
  const results: EventCompetitionRegistrationDTO[] = [];
  for (const r of registrations) {
    const reg = await createRegistrationServer(eventId, {
      competitionId: r.competitionId,
      participantProfileId: r.participantProfileId,
      feeAmount: r.feeAmount,
      effectiveCategory: r.effectiveCategory,
    });
    results.push(reg);
  }
  return results;
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
  const registeredByUserProfile = registeredByUserProfileRef(await resolveRegisteredByUserProfileId());
  const teamPayload: TeamRegistrationRequestDTO = {
    teamName: payload.teamName,
    teamDisplayName: payload.teamDisplayName ?? payload.teamName,
    memberParticipantIds: payload.memberParticipantIds,
    leaderRegistration: withTenantId({
      id: null,
      registrationStatus: (Number(payload.feeAmount) > 0 ? 'PENDING_PAYMENT' : 'CONFIRMED') as const,
      feeAmount: payload.feeAmount,
      effectiveCategory: payload.effectiveCategory ?? '',
      stripePaymentIntentId: '',
      teamName: payload.teamName,
      teamDisplayName: payload.teamDisplayName ?? payload.teamName,
      event: eventRef(eventId),
      competition: { id: payload.competitionId } as EventCompetitionRegistrationDTO['competition'],
      participantProfile: { id: payload.captainParticipantId } as EventCompetitionRegistrationDTO['participantProfile'],
      registeredByUserProfile,
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
  const existing = await findExistingRegistrationForParticipant(
    eventId,
    payload.competitionId,
    payload.participantProfileId
  );
  if (existing) return existing;

  const now = new Date().toISOString();
  const registeredByUserProfile = registeredByUserProfileRef(await resolveRegisteredByUserProfileId());
  try {
    return await proxyJson<EventCompetitionRegistrationDTO>('/event-competition-registrations', {
      method: 'POST',
      body: JSON.stringify(
        withTenantId({
          id: null,
          registrationStatus: Number(payload.feeAmount) > 0 ? 'PENDING_PAYMENT' : 'CONFIRMED',
          feeAmount: payload.feeAmount,
          effectiveCategory: payload.effectiveCategory ?? '',
          stripePaymentIntentId: '',
          event: eventRef(eventId),
          competition: { id: payload.competitionId },
          participantProfile: { id: payload.participantProfileId },
          registeredByUserProfile,
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
  } catch (error: unknown) {
    // Concurrent create or leftover row — reuse existing registration on conflict
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('409') || message.includes('error.duplicate')) {
      const again = await findExistingRegistrationForParticipant(
        eventId,
        payload.competitionId,
        payload.participantProfileId
      );
      if (again) return again;
    }
    throw error;
  }
}

async function findExistingRegistrationForParticipant(
  eventId: string,
  competitionId: number,
  participantProfileId: number
): Promise<EventCompetitionRegistrationDTO | null> {
  const all = await listFromBackend<EventCompetitionRegistrationDTO>(
    'event-competition-registrations',
    `eventId.equals=${eventId}&sort=createdAt,desc`
  );
  return (
    all.find(
      (r) =>
        r.competition?.id === competitionId && r.participantProfile?.id === participantProfileId
    ) ?? null
  );
}

export async function fetchMyRegistrationsForEventServer(
  eventId: string,
  clerkUserId: string
): Promise<EventCompetitionRegistrationDTO[]> {
  if (!clerkUserId) return [];
  const [participants, competitions, all] = await Promise.all([
    fetchMyParticipantsServer(clerkUserId),
    fetchPublicCompetitionsServer(eventId),
    listFromBackend<EventCompetitionRegistrationDTO>(
      'event-competition-registrations',
      `eventId.equals=${eventId}&sort=createdAt,desc`
    ),
  ]);

  const participantIds = new Set(
    participants.map((p) => p.id).filter((id): id is number => id != null)
  );
  if (participantIds.size === 0) return [];

  const participantById = new Map(
    participants.filter((p) => p.id != null).map((p) => [p.id as number, p])
  );
  const competitionById = new Map(
    competitions.filter((c) => c.id != null).map((c) => [c.id as number, c])
  );

  return all
    .filter((r) => {
      const pid = r.participantProfile?.id;
      return pid != null && participantIds.has(pid);
    })
    .map((r) => {
      const competitionId = r.competition?.id;
      const participantId = r.participantProfile?.id;
      const competition =
        (competitionId != null ? competitionById.get(competitionId) : undefined) ?? r.competition;
      const participantProfile =
        (participantId != null ? participantById.get(participantId) : undefined) ??
        r.participantProfile;

      return {
        ...r,
        competition,
        participantProfile,
      };
    });
}

export async function getAuthenticatedClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}
