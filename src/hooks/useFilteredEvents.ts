import { useMemo } from 'react';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { computeFeaturedEventsFromMedia } from '@/lib/homepage/featuredEvents';
import { useEventsData } from './useEventsData';

export interface EventWithFilteredMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

export const useFilteredEvents = (filterType: 'hero' | 'live' | 'featured', enabled: boolean = true) => {
  const { eventsWithMedia, isLoading, error } = useEventsData(enabled);

  const filteredEvents = useMemo(() => {
    if (isLoading || error) {
      return [];
    }

    if (filterType === 'featured') {
      return computeFeaturedEventsFromMedia(eventsWithMedia);
    }

    console.log(`=== ${filterType.toUpperCase()} EVENTS FILTERING ===`);
    console.log(`Processing ${eventsWithMedia.length} events with media`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(`${filterType} Events - Today's date: ${today.toDateString()} (${today.toISOString()})`);

    const results: EventWithFilteredMedia[] = [];

    for (const { event, media } of eventsWithMedia) {
      console.log(`Processing ${filterType} event ${event.id}: ${event.title} with ${media.length} media items`);
      const filteredMedia = media.filter((mediaItem) => {
        let hasCorrectFlag = false;
        switch (filterType) {
          case 'hero':
            hasCorrectFlag = mediaItem.isHomePageHeroImage === true;
            break;
          case 'live':
            hasCorrectFlag = mediaItem.isLiveEventImage === true;
            break;
          default:
            break;
        }

        console.log(`  Media ${mediaItem.id}: isHomePageHeroImage=${mediaItem.isHomePageHeroImage}, isLiveEventImage=${mediaItem.isLiveEventImage}, hasCorrectFlag=${hasCorrectFlag}`);

        if (!hasCorrectFlag) return false;

        const displayDateValue = mediaItem.startDisplayingFromDate;
        if (!displayDateValue) {
          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} has no display date, allowing it`);
          return true;
        }

        try {
          const [year, month, day] = displayDateValue.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day);
          displayDate.setHours(0, 0, 0, 0);
          const shouldShow = displayDate <= today;

          console.log(`${filterType} Event ${event.id}: Media ${mediaItem.id} - Should show: ${shouldShow}`);

          return shouldShow;
        } catch (error) {
          console.warn(`Invalid startDisplayingFromDate for media ${mediaItem.id}:`, displayDateValue);
          return true;
        }
      });

      if (filteredMedia.length > 0) {
        results.push({
          event,
          media: filteredMedia[0],
        });
        console.log(`Found ${filterType} event: ${event.title} with media: ${filteredMedia[0].fileUrl}`);
      }
    }

    console.log(`Found ${results.length} ${filterType} events`);
    return results;
  }, [eventsWithMedia, isLoading, error, filterType]);

  return {
    filteredEvents,
    isLoading,
    error,
  };
};
