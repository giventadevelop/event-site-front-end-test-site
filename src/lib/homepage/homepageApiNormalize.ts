import type { EventDetailsDTO, EventMediaDTO } from '@/types';

/** Coerce API boolean fields that may arrive as true/false, "true"/"false", or 0/1. */
export function isTruthyApiFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** Normalize event-details list responses (array, single object, or Spring page). */
export function normalizeEventDetailsList(data: unknown): EventDetailsDTO[] {
  if (Array.isArray(data)) return data as EventDetailsDTO[];
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: EventDetailsDTO[] }).content;
  }
  if (data && typeof data === 'object') return [data as EventDetailsDTO];
  return [];
}

/** Normalize event-medias list responses (array, single object, or Spring page). */
export function normalizeEventMediasList(data: unknown): EventMediaDTO[] {
  if (Array.isArray(data)) return data as EventMediaDTO[];
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: EventMediaDTO[] }).content;
  }
  if (data && typeof data === 'object' && '_embedded' in data) {
    const embedded = (data as { _embedded: Record<string, unknown> })._embedded;
    const eventMedias = embedded?.eventMedias;
    if (Array.isArray(eventMedias)) return eventMedias as EventMediaDTO[];
  }
  if (data && typeof data === 'object') return [data as EventMediaDTO];
  return [];
}
