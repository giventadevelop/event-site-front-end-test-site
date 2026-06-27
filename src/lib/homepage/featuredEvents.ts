import type { EventDetailsDTO, EventMediaDTO } from '@/types';

/** Same shape as `useEventsData` / `useFilteredEvents` input */
export interface EventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
}

/** One featured card: event + chosen media row */
export interface FeaturedEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

export const MAX_FEATURED_EVENTS_HOMEPAGE = 3;

/**
 * Featured strip logic (must match `useFilteredEvents` / `featured` case).
 * Picks media with `isFeaturedEventImage`, respects `startDisplayingFromDate` vs today.
 */
export function computeFeaturedEventsFromMedia(eventsWithMedia: EventWithMedia[]): FeaturedEventWithMedia[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const results: FeaturedEventWithMedia[] = [];

  for (const { event, media } of eventsWithMedia) {
    const filteredMedia = media.filter((mediaItem) => {
      if (!mediaItem.isFeaturedEventImage) return false;
      const displayDateValue = mediaItem.startDisplayingFromDate;
      if (!displayDateValue) return true;
      try {
        const [year, month, day] = displayDateValue.split('-').map(Number);
        const displayDate = new Date(year, month - 1, day);
        displayDate.setHours(0, 0, 0, 0);
        return displayDate <= today;
      } catch {
        return true;
      }
    });

    if (filteredMedia.length > 0) {
      results.push({
        event,
        media: filteredMedia[0],
      });
    }
  }

  return results;
}
