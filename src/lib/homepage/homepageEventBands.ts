import type { EventDetailsDTO } from '@/types';
import type { FeaturedEventWithMedia } from '@/lib/homepage/featuredEvents';

/**
 * Homepage band selection (On Sale Now / Join Us / past featured).
 * Pure helpers — UI can wire these when the modernist (or classic) home is ready.
 *
 * Rules (Sep 2026):
 * - On Sale Now + Join Us: upcoming only (`startDate >= today`). Hide when none.
 * - Featured list may still include past featured events; use {@link isPastFeaturedEvent}
 *   to drop ticket CTAs and show a past tag.
 */

export function isUpcomingEventStartDate(startDate?: string | null): boolean {
  if (!startDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = startDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  const start = new Date(year, month - 1, day);
  start.setHours(0, 0, 0, 0);
  return start >= today;
}

export function isPastFeaturedEvent(event: Pick<EventDetailsDTO, 'startDate'>): boolean {
  return !isUpcomingEventStartDate(event.startDate);
}

export function eventAdmissionLabel(event: Pick<EventDetailsDTO, 'admissionType'>): string {
  const raw = (event.admissionType || '').toUpperCase();
  if (raw.includes('DONAT') || raw.includes('CHARITY')) return 'Charity';
  if (raw.includes('TICKET') || raw.includes('PAID')) return 'Ticketed';
  if (raw.includes('FREE') || !raw) return 'Free';
  return event.admissionType || 'Free';
}

function firstUpcomingFeatured(
  featuredItems: FeaturedEventWithMedia[]
): EventDetailsDTO | null {
  return (
    featuredItems.find((item) => isUpcomingEventStartDate(item.event.startDate))?.event ?? null
  );
}

/**
 * On Sale Now source: ticketed upcoming featured → any upcoming featured →
 * ticketed upcoming list → first upcoming. Never past.
 */
export function pickOnSaleEvent(
  featuredItems: FeaturedEventWithMedia[],
  upcomingEvents: EventDetailsDTO[]
): EventDetailsDTO | null {
  const upcomingFeatured = firstUpcomingFeatured(featuredItems);
  const upcomingTicketed =
    upcomingEvents.find((event) => eventAdmissionLabel(event) === 'Ticketed') ?? null;

  return (
    (upcomingFeatured && eventAdmissionLabel(upcomingFeatured) === 'Ticketed'
      ? upcomingFeatured
      : null) ||
    upcomingFeatured ||
    upcomingTicketed ||
    upcomingEvents[0] ||
    null
  );
}

/**
 * Join Us source: upcoming featured → first upcoming event. Never past.
 * Callers should hide the section when this returns null.
 */
export function pickCloseCtaEvent(
  featuredItems: FeaturedEventWithMedia[],
  upcomingEvents: EventDetailsDTO[]
): EventDetailsDTO | null {
  return firstUpcomingFeatured(featuredItems) ?? upcomingEvents[0] ?? null;
}
