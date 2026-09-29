'use server';

import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl, getAppUrl, getTenantId } from '@/lib/env';
import { parseApiListResponse } from '@/lib/parseApiListResponse';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import { hydrateCompetitionResults, matchCompetitionByName } from '@/lib/competitions/resultsPodium';
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

async function listFromBackend<T>(
  resource: string,
  query: string,
  options?: { throwOnError?: boolean }
): Promise<T[]> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/${resource}?${query}&tenantId.equals=${tenantId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[competitions-admin] GET ${resource} failed:`, res.status, text);
    if (options?.throwOnError) {
      throw new Error(`Could not load ${resource} (HTTP ${res.status}).`);
    }
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
  const { competitionDay, ...rest } = payload;
  return proxyJson<EventCompetitionDTO>('/event-competitions', {
    method: 'POST',
    body: JSON.stringify(
      withTenantId({
        ...rest,
        id: null,
        event: eventRef(eventId),
        ...(competitionDay?.id ? { competitionDay: { id: competitionDay.id } } : {}),
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

function relatedEntityId(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: number | string | null }).id;
    if (id == null) return null;
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

async function fetchParticipantByIdServer(
  id: number
): Promise<EventCompetitionParticipantDTO | null> {
  try {
    return await proxyJson<EventCompetitionParticipantDTO>(`/event-competition-participants/${id}`);
  } catch {
    return null;
  }
}

export async function fetchCompetitionRegistrationsForEventServer(
  eventId: string
): Promise<EventCompetitionRegistrationDTO[]> {
  const [registrations, competitions] = await Promise.all([
    listFromBackend<EventCompetitionRegistrationDTO>(
      'event-competition-registrations',
      `eventId.equals=${eventId}&sort=createdAt,desc`
    ),
    fetchCompetitionsForEventServer(eventId),
  ]);

  const competitionById = new Map(
    competitions.filter((c) => c.id != null).map((c) => [Number(c.id), c])
  );

  const participantIds = Array.from(
    new Set(
      registrations
        .map((r) => {
          const nested = relatedEntityId(r.participantProfile);
          const flat = relatedEntityId(
            (r as EventCompetitionRegistrationDTO & { participantProfileId?: number | null })
              .participantProfileId
          );
          return nested ?? flat;
        })
        .filter((id): id is number => id != null)
    )
  );

  const participantEntries = await Promise.all(
    participantIds.map(async (id) => {
      const participant = await fetchParticipantByIdServer(id);
      return [id, participant] as const;
    })
  );
  const participantById = new Map(
    participantEntries.filter(([, p]) => p != null) as Array<[number, EventCompetitionParticipantDTO]>
  );

  return registrations.map((r) => {
    const competitionId =
      relatedEntityId(r.competition) ??
      relatedEntityId(
        (r as EventCompetitionRegistrationDTO & { competitionId?: number | null }).competitionId
      );
    const participantId =
      relatedEntityId(r.participantProfile) ??
      relatedEntityId(
        (r as EventCompetitionRegistrationDTO & { participantProfileId?: number | null })
          .participantProfileId
      );

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

/**
 * Free registrations created before fee→CONFIRMED may still be PENDING_PAYMENT.
 * Promote them so Results and other CONFIRMED-only flows see them.
 */
export async function reconcileFreeCompetitionRegistrationsServer(
  eventId: string,
  registrations: EventCompetitionRegistrationDTO[]
): Promise<EventCompetitionRegistrationDTO[]> {
  const now = new Date().toISOString();
  const updated = await Promise.all(
    registrations.map(async (r) => {
      const isFree = !(Number(r.feeAmount) > 0);
      const needsConfirm =
        isFree &&
        r.id != null &&
        (r.registrationStatus === 'PENDING_PAYMENT' ||
          r.registrationStatus?.includes('PAYMENT') === true);
      if (!needsConfirm) return r;

      try {
        const patched = await proxyJson<EventCompetitionRegistrationDTO>(
          `/event-competition-registrations/${r.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify(
              withTenantId({
                id: r.id,
                registrationStatus: 'CONFIRMED',
                updatedAt: now,
              })
            ),
          }
        );
        return { ...r, ...patched, registrationStatus: 'CONFIRMED' as const };
      } catch (err) {
        console.error('[competitions-admin] Failed to confirm free registration', r.id, err);
        return r;
      }
    })
  );
  return updated;
}

// --- Results ---

export async function fetchCompetitionResultsForEventServer(
  eventId: string,
  options?: { throwOnError?: boolean }
): Promise<EventCompetitionResultDTO[]> {
  return listFromBackend<EventCompetitionResultDTO>(
    'event-competition-results',
    `eventId.equals=${eventId}&sort=placement,asc`,
    options
  );
}

export async function importOfficialPlacementsFromPodiumServer(
  eventId: string,
  drafts: EventCompetitionResultDTO[],
  competitions: EventCompetitionDTO[]
): Promise<{ created: EventCompetitionResultDTO[]; skipped: string[] }> {
  const skipped: string[] = [];
  const created: EventCompetitionResultDTO[] = [];
  const now = new Date().toISOString();

  for (const draft of drafts) {
    const match = matchCompetitionByName(competitions, draft.competition?.name);
    if (!match?.id) {
      skipped.push(`${draft.displayName} (${draft.competition?.name || 'no competition'})`);
      continue;
    }
    const row = await createCompetitionResultServer(eventId, {
      displayName: draft.displayName,
      placement: draft.placement ?? null,
      placementLabel: draft.placementLabel ?? null,
      prizeTitle: draft.prizeTitle ?? '',
      prizeDetails: draft.prizeDetails ?? '',
      pointsAwarded: Number(draft.pointsAwarded) || 0,
      winnerPhotoUrl: draft.winnerPhotoUrl ?? '',
      workPhotoUrl: draft.workPhotoUrl ?? '',
      notes: draft.notes ?? '',
      isPublished: true,
      publishedAt: now,
      competition: { id: match.id } as EventCompetitionDTO,
    } as EventCompetitionResultDTO);
    created.push({ ...row, competition: match });
  }

  return { created: hydrateCompetitionResults(created, competitions), skipped };
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
  const res = await fetchWithJwtRetry(url, {
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

/**
 * Upload a winner portrait or winning-work photo (generic event-medias upload + PATCH result).
 * Mirrors program-director / performer poster uploads so required backend query fields are present.
 */
export type CompetitionResultPhotoKind = 'winner' | 'work';

export async function uploadCompetitionWinnerPhotoServer(
  eventId: string,
  resultId: number,
  formData: FormData,
  kind: CompetitionResultPhotoKind = 'winner'
): Promise<{ fileUrl: string; mediaId: number }> {
  const file = formData.get('file');
  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error('No image file provided');
  }

  const isWork = kind === 'work';
  const uploadForm = new FormData();
  uploadForm.append('file', file, file instanceof File ? file.name : `${kind}-${resultId}.jpg`);

  const today = new Date().toISOString().split('T')[0];
  const params = new URLSearchParams();
  params.append('eventId', String(eventId));
  params.append('tenantId', getTenantId());
  params.append('title', isWork ? `Winning work - result ${resultId}` : `Winner photo - result ${resultId}`);
  params.append(
    'description',
    isWork
      ? `Competition winning work for event ${eventId}, result ${resultId}`
      : `Competition winner photo for event ${eventId}, result ${resultId}`
  );
  params.append('isPublic', 'true');
  params.append('eventMediaType', 'gallery');
  params.append('isEventManagementOfficialDocument', 'false');
  params.append('eventFlyer', 'false');
  params.append('isHeroImage', 'false');
  params.append('isActiveHeroImage', 'false');
  params.append('isFeaturedImage', 'false');
  params.append('storageType', 'S3');
  params.append('startDisplayingFromDate', today);

  const apiUrl = `${getApiBase()}/api/event-medias/upload?${params.toString()}`;
  const response = await fetchWithJwtRetry(
    apiUrl,
    {
      method: 'POST',
      body: uploadForm,
      timeout: 120000,
    },
    isWork ? 'competition-work-photo-upload' : 'competition-winner-photo-upload'
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('[competitions-admin] Photo upload failed:', kind, response.status, text);
    let message = `Upload failed (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string; detail?: string };
      message = parsed.message || parsed.detail || parsed.error || message;
    } catch {
      if (text) message = text.slice(0, 240);
    }
    throw new Error(message);
  }

  const media = await response.json();
  const mediaId = Number(
    media?.id ?? media?.data?.[0]?.id ?? media?.eventMedias?.[0]?.id
  );
  const fileUrl = String(
    media?.fileUrl ?? media?.data?.[0]?.fileUrl ?? media?.url ?? media?.data?.[0]?.url ?? ''
  );

  if (!mediaId || !fileUrl) {
    console.error('[competitions-admin] Unexpected upload response shape:', media);
    throw new Error('Upload succeeded but media id/url was missing from the response');
  }

  const mediaField = isWork ? 'workMedia' : 'winnerMedia';
  const urlField = isWork ? 'workPhotoUrl' : 'winnerPhotoUrl';

  try {
    await patchCompetitionResultDirectServer(resultId, {
      [mediaField]: null,
    } as Partial<EventCompetitionResultDTO>);
  } catch (clearErr) {
    console.warn('[competitions-admin] Could not clear previous media association (continuing):', clearErr);
  }

  try {
    await patchCompetitionResultDirectServer(resultId, {
      [mediaField]: { id: mediaId },
      [urlField]: fileUrl,
    } as Partial<EventCompetitionResultDTO>);
  } catch (linkErr) {
    console.warn('[competitions-admin] media link failed; saving URL only:', linkErr);
    await patchCompetitionResultDirectServer(resultId, {
      [urlField]: fileUrl,
    } as Partial<EventCompetitionResultDTO>);
  }

  return { fileUrl, mediaId };
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
