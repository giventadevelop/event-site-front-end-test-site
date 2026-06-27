import type { EventDetailsDTO } from '@/types';

/**
 * Determines if an event is ticketed via Event Cube (external ticketing embed).
 * Event is Event Cube ticketed if:
 * - admissionType === 'TICKETED' AND
 * - eventcubeEmbedUrl is set and non-empty
 */
export function isTicketedEventCube(event: EventDetailsDTO): boolean {
  if (event.admissionType?.toUpperCase() !== 'TICKETED') {
    return false;
  }
  return Boolean(event.eventcubeEmbedUrl?.trim());
}
