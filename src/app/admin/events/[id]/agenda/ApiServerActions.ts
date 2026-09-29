'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventAgendaItemDTO, EventMediaDTO } from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

function cleanUrlField(value: string | undefined | null): string | null {
  return value && value.trim() !== '' ? value.trim() : null;
}

function parseList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') return [data as T];
  return [];
}

export async function fetchEventAgendaItemsServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());
  params.append('sort', 'sortOrder,asc');
  params.append('size', '200');

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-agenda-items?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event agenda items: ${response.statusText}`);
  }

  return parseList<EventAgendaItemDTO>(await response.json());
}

export async function fetchEventAgendaItemServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-agenda-items/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event agenda item: ${response.statusText}`);
  }

  return (await response.json()) as EventAgendaItemDTO;
}

export async function fetchEventMediaForAgendaServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());
  params.append('size', '200');
  params.append('sort', 'displayOrder,asc');

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-medias?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [] as EventMediaDTO[];
  }

  return parseList<EventMediaDTO>(await response.json());
}

export async function createEventAgendaItemServer(
  item: Omit<EventAgendaItemDTO, 'id' | 'createdAt' | 'updatedAt'>
) {
  const currentTime = new Date().toISOString();
  const payload = withTenantId({
    ...item,
    createdAt: currentTime,
    updatedAt: currentTime,
    imageUrl: cleanUrlField(item.imageUrl),
    endTime: item.endTime && item.endTime.trim() !== '' ? item.endTime.trim() : null,
    scheduleDate: item.scheduleDate && String(item.scheduleDate).trim() !== '' ? item.scheduleDate : null,
    sortOrder: item.sortOrder ?? 0,
    isPublished: item.isPublished ?? true,
  });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-agenda-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create agenda item: ${errorText}`);
  }

  return (await response.json()) as EventAgendaItemDTO;
}

async function putEventAgendaItem(id: number, payload: Record<string, unknown>) {
  const body: Record<string, unknown> = withTenantId({
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  });
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });

  console.log('[putEventAgendaItem] PUT payload', JSON.stringify(body));

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-agenda-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update agenda item: ${errorText}`);
  }

  return (await response.json()) as EventAgendaItemDTO;
}

/**
 * Update agenda item.
 *
 * JHipster partialUpdate often ignores nulls, so PATCH with imageUrl:null / eventMedia:null
 * does not clear those fields in the DB (UI looks updated until refresh). Use PUT with a
 * full resource, and empty string for cleared imageUrl.
 *
 * When switching EventMedia ids, clear the association first to avoid:
 * "identifier of an instance of EventMedia was altered from X to Y".
 */
export async function updateEventAgendaItemServer(
  id: number,
  item: Partial<EventAgendaItemDTO>,
  options?: { previousEventMediaId?: number | null; eventId?: number }
) {
  const current = await fetchEventAgendaItemServer(id);

  const newMediaId =
    item.eventMedia === undefined
      ? current.eventMedia?.id != null
        ? Number(current.eventMedia.id)
        : null
      : item.eventMedia?.id != null
        ? Number(item.eventMedia.id)
        : null;

  const previousMediaId =
    options?.previousEventMediaId != null
      ? Number(options.previousEventMediaId)
      : current.eventMedia?.id != null
        ? Number(current.eventMedia.id)
        : null;

  const nextImageUrl =
    item.imageUrl !== undefined
      ? cleanUrlField(item.imageUrl)
      : cleanUrlField(current.imageUrl);

  // Persist cleared URLs as "" — JHipster ignore-null PATCH/PUT mappers skip null Strings.
  const persistedImageUrl = nextImageUrl ?? '';

  const eventId =
    options?.eventId ??
    current.event?.id ??
    (typeof (current as any).eventId === 'number' ? (current as any).eventId : null);

  const buildFullPayload = (mediaId: number | null): Record<string, unknown> => ({
    id,
    title: item.title ?? current.title,
    description:
      item.description !== undefined ? item.description : current.description ?? null,
    startTime: item.startTime ?? current.startTime,
    endTime:
      item.endTime !== undefined
        ? item.endTime && String(item.endTime).trim() !== ''
          ? String(item.endTime).trim()
          : null
        : current.endTime ?? null,
    scheduleDate:
      item.scheduleDate !== undefined
        ? item.scheduleDate && String(item.scheduleDate).trim() !== ''
          ? item.scheduleDate
          : null
        : current.scheduleDate ?? null,
    imageUrl: persistedImageUrl,
    sortOrder: item.sortOrder ?? current.sortOrder ?? 0,
    isPublished: item.isPublished ?? current.isPublished ?? true,
    createdAt: current.createdAt,
    event: eventId != null ? { id: Number(eventId) } : current.event ? { id: current.event.id } : undefined,
    eventMedia: mediaId != null ? { id: mediaId } : null,
  });

  const mediaChanging = previousMediaId != null && previousMediaId !== newMediaId;

  if (mediaChanging) {
    // Step 1: detach old EventMedia (and clear image when removing / replacing).
    console.log(
      '[updateEventAgendaItemServer] Detaching eventMedia',
      previousMediaId,
      'before setting',
      newMediaId
    );
    const cleared = await putEventAgendaItem(id, buildFullPayload(null));
    if (newMediaId == null) {
      // Remove-image path: cleared payload is the final state.
      return cleared;
    }
  }

  const result = await putEventAgendaItem(id, buildFullPayload(newMediaId));

  // Belt-and-suspenders: if image should be gone but GET still returns a URL, force empty string.
  const shouldHaveNoImage = !persistedImageUrl;
  if (shouldHaveNoImage && result?.imageUrl) {
    console.warn(
      '[updateEventAgendaItemServer] imageUrl still present after PUT; forcing clear. got=',
      result.imageUrl
    );
    return await putEventAgendaItem(id, {
      ...buildFullPayload(null),
      imageUrl: '',
    });
  }

  console.log(
    '[updateEventAgendaItemServer] result imageUrl=',
    result?.imageUrl,
    'eventMedia=',
    result?.eventMedia?.id
  );
  return result;
}

export async function deleteEventAgendaItemServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-agenda-items/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete agenda item: ${errorText}`);
  }
}
