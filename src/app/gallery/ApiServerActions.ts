'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type {
  EventDetailsDTO,
  EventMediaDTO,
  GalleryAlbumDTO,
  GalleryAlbumWithMedia,
  GalleryCategoryDTO,
} from '@/types';

export interface GalleryAlbumExtraFilters {
  categoryId?: number;
  albumYear?: number;
  eventLocation?: string;
}

export interface GalleryEventExtraFilters {
  year?: number;
  location?: string;
  eventTypeId?: number;
}

export interface GalleryAlbumFilterOptions {
  categories: GalleryCategoryDTO[];
  years: number[];
  locations: string[];
}

export interface GalleryEventFilterOptions {
  years: number[];
  locations: string[];
  eventTypes: { id: number; name: string }[];
}

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export interface GalleryEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}

export interface GalleryPageData {
  eventsWithMedia: GalleryEventWithMedia[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
}

export interface GalleryPageDataWithAlbums {
  eventsWithMedia: GalleryEventWithMedia[];
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalEvents: number;
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Fetch events with their media for gallery display
 */
export async function fetchEventsForGallery(
  page: number = 0,
  size: number = 12,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string,
  extraFilters?: GalleryEventExtraFilters
): Promise<GalleryPageData> {
  try {
    const tenantId = getTenantId();

        // Build query parameters for events
        const eventParams = new URLSearchParams();
        eventParams.append('tenantId.equals', tenantId);
        eventParams.append('isActive.equals', 'true');
        eventParams.append('page', page.toString());
        eventParams.append('size', size.toString());
        eventParams.append('sort', 'startDate,desc');

        if (searchTerm) {
          eventParams.append('title.contains', searchTerm);
        }

        if (extraFilters?.year && !startDate && !endDate) {
          eventParams.append('startDate.greaterThanOrEqual', `${extraFilters.year}-01-01`);
          eventParams.append('startDate.lessThanOrEqual', `${extraFilters.year}-12-31`);
        } else {
          if (startDate) {
            eventParams.append('startDate.greaterThanOrEqual', startDate);
          }
          if (endDate) {
            eventParams.append('startDate.lessThanOrEqual', endDate);
          }
        }

        if (extraFilters?.location) {
          eventParams.append('location.contains', extraFilters.location);
        }

        if (extraFilters?.eventTypeId) {
          eventParams.append('eventTypeId.equals', extraFilters.eventTypeId.toString());
        }

    // Fetch events
    const eventsUrl = `${getApiBase()}/api/event-details?${eventParams.toString()}`;
    const eventsResponse = await fetchWithJwtRetry(eventsUrl, { cache: 'no-store' });

    if (!eventsResponse.ok) {
      console.error(`Failed to fetch events for gallery: ${eventsResponse.statusText}`);
      return {
        eventsWithMedia: [],
        totalEvents: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    const totalEvents = parseInt(eventsResponse.headers.get('X-Total-Count') || '0', 10);
    const events: EventDetailsDTO[] = await eventsResponse.json();
    const eventsArray = Array.isArray(events) ? events : [];

    // Fetch media for each event
    const eventsWithMedia: GalleryEventWithMedia[] = [];

    for (const event of eventsArray) {
      try {
        // Fetch public media for this event (exclude official documents)
        const mediaParams = new URLSearchParams();
        mediaParams.append('eventId.equals', event.id!.toString());
        mediaParams.append('isEventManagementOfficialDocument.equals', 'false');
        mediaParams.append('isPublic.equals', 'true');
        mediaParams.append('sort', 'displayOrder,asc');
        mediaParams.append('sort', 'updatedAt,desc');
        mediaParams.append('size', '50');

        const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
        console.log(`Fetching media for event ${event.id}: ${mediaUrl}`);
        const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

        let media: EventMediaDTO[] = [];
        let totalMediaCount = 0;

        if (mediaResponse.ok) {
          totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
          const mediaData = await mediaResponse.json();
          media = Array.isArray(mediaData) ? mediaData : [];
          console.log(`Event ${event.id} media fetched:`, { totalMediaCount, mediaCount: media.length, media });
        } else {
          console.log(`Failed to fetch media for event ${event.id}:`, mediaResponse.status, mediaResponse.statusText);
        }

        eventsWithMedia.push({
          event,
          media,
          totalMediaCount
        });

      } catch (mediaError) {
        console.error(`Failed to fetch media for event ${event.id}:`, mediaError);
        eventsWithMedia.push({
          event,
          media: [],
          totalMediaCount: 0
        });
      }
    }

    const totalPages = Math.ceil(totalEvents / size);

    return {
      eventsWithMedia,
      totalEvents,
      currentPage: page,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching events for gallery:', error);
    return {
      eventsWithMedia: [],
      totalEvents: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}

/**
 * Fetch media for a specific event with pagination
 */
export async function fetchEventMedia(
  eventId: number,
  page: number = 0,
  size: number = 20
): Promise<{ media: EventMediaDTO[]; totalCount: number }> {
  try {
    const params = new URLSearchParams();
    params.append('eventId.equals', eventId.toString());
    params.append('isEventManagementOfficialDocument.equals', 'false');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'updatedAt,desc');
    params.append('page', page.toString());
    params.append('size', size.toString());

    const url = `${getApiBase()}/api/event-medias?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Failed to fetch media for event ${eventId}: ${response.statusText}`);
      return { media: [], totalCount: 0 };
    }

    const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const data = await response.json();
    const media = Array.isArray(data) ? data : [];

    return { media, totalCount };

  } catch (error) {
    console.error(`Error fetching media for event ${eventId}:`, error);
    return { media: [], totalCount: 0 };
  }
}

/**
 * Search events by title for gallery
 */
export async function searchEventsForGallery(
  searchTerm: string,
  startDate?: string,
  endDate?: string
): Promise<EventDetailsDTO[]> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('isActive.equals', 'true');
    params.append('title.contains', searchTerm);
    params.append('sort', 'startDate,desc');
    params.append('size', '50');

    // Add date range filtering
    if (startDate) {
      params.append('startDate.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      params.append('startDate.lessThanOrEqual', endDate);
    }

    const url = `${getApiBase()}/api/event-details?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Failed to search events: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

/**
 * Fetch albums with their media for gallery display
 */
export async function fetchAlbumsForGallery(
  page: number = 0,
  size: number = 12,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string,
  extraFilters?: GalleryAlbumExtraFilters
): Promise<{
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}> {
  try {
    const tenantId = getTenantId();

    // Build query parameters for albums
    const albumParams = new URLSearchParams();
    albumParams.append('tenantId.equals', tenantId);
    albumParams.append('isPublic.equals', 'true'); // Public albums only for gallery
    albumParams.append('page', page.toString());
    albumParams.append('size', size.toString());
    albumParams.append('sort', 'eventDateStart,desc');
    albumParams.append('sort', 'albumYear,desc');
    albumParams.append('sort', 'createdAt,desc');

    if (searchTerm) {
      albumParams.append('title.contains', searchTerm);
    }

    if (extraFilters?.categoryId) {
      albumParams.append('galleryCategoryId.equals', extraFilters.categoryId.toString());
    }
    if (extraFilters?.albumYear) {
      albumParams.append('albumYear.equals', extraFilters.albumYear.toString());
    }
    if (extraFilters?.eventLocation) {
      albumParams.append('eventLocation.contains', extraFilters.eventLocation);
    }

    if (startDate) {
      albumParams.append('eventDateStart.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      albumParams.append('eventDateStart.lessThanOrEqual', endDate);
    }

    // Fetch albums
    const albumsUrl = `${getApiBase()}/api/gallery-albums?${albumParams.toString()}`;
    const albumsResponse = await fetchWithJwtRetry(albumsUrl, { cache: 'no-store' });

    if (!albumsResponse.ok) {
      console.error(`Failed to fetch albums for gallery: ${albumsResponse.statusText}`);
      return {
        albumsWithMedia: [],
        totalAlbums: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    const totalAlbums = parseInt(albumsResponse.headers.get('X-Total-Count') || '0', 10);
    const albums: GalleryAlbumDTO[] = await albumsResponse.json();
    const albumsArray = Array.isArray(albums) ? albums : [];

    // Fetch media for each album
    const albumsWithMedia: GalleryAlbumWithMedia[] = [];

    for (const album of albumsArray) {
      try {
        // Fetch public media for this album
        const mediaParams = new URLSearchParams();
        mediaParams.append('albumId.equals', album.id!.toString());
        mediaParams.append('isPublic.equals', 'true');
        mediaParams.append('sort', 'displayOrder,asc');
        mediaParams.append('sort', 'updatedAt,desc');
        mediaParams.append('size', '50');

        const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
        console.log(`Fetching media for album ${album.id}: ${mediaUrl}`);
        const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

        let media: EventMediaDTO[] = [];
        let totalMediaCount = 0;

        if (mediaResponse.ok) {
          totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
          const mediaData = await mediaResponse.json();
          media = Array.isArray(mediaData) ? mediaData : [];
          console.log(`Album ${album.id} media fetched:`, { totalMediaCount, mediaCount: media.length });
        } else {
          console.log(`Failed to fetch media for album ${album.id}:`, mediaResponse.status, mediaResponse.statusText);
        }

        albumsWithMedia.push({
          album,
          media,
          totalMediaCount
        });

      } catch (mediaError) {
        console.error(`Failed to fetch media for album ${album.id}:`, mediaError);
        albumsWithMedia.push({
          album,
          media: [],
          totalMediaCount: 0
        });
      }
    }

    const totalPages = Math.ceil(totalAlbums / size);

    return {
      albumsWithMedia,
      totalAlbums,
      currentPage: page,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching albums for gallery:', error);
    return {
      albumsWithMedia: [],
      totalAlbums: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}

/**
 * Fetch album by ID with media
 */
export async function fetchAlbumWithMedia(
  albumId: number
): Promise<GalleryAlbumWithMedia | null> {
  try {
    // Fetch album
    const albumUrl = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const albumResponse = await fetchWithJwtRetry(albumUrl, { cache: 'no-store' });

    if (!albumResponse.ok) {
      if (albumResponse.status === 404) {
        return null;
      }
      console.error(`Failed to fetch album ${albumId}:`, albumResponse.statusText);
      return null;
    }

    const album: GalleryAlbumDTO = await albumResponse.json();

    // Fetch media for album
    const mediaParams = new URLSearchParams();
    mediaParams.append('albumId.equals', albumId.toString());
    mediaParams.append('isPublic.equals', 'true');
    mediaParams.append('sort', 'displayOrder,asc');
    mediaParams.append('sort', 'updatedAt,desc');
    mediaParams.append('size', '100');

    const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
    const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

    let media: EventMediaDTO[] = [];
    let totalMediaCount = 0;

    if (mediaResponse.ok) {
      totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
      const mediaData = await mediaResponse.json();
      media = Array.isArray(mediaData) ? mediaData : [];
    }

    return {
      album,
      media,
      totalMediaCount
    };

  } catch (error) {
    console.error(`Error fetching album ${albumId} with media:`, error);
    return null;
  }
}

function uniqueSortedNumbers(values: (number | null | undefined)[]): number[] {
  const set = new Set<number>();
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) set.add(v);
  }
  return [...set].sort((a, b) => b - a);
}

function uniqueSortedStrings(values: (string | null | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const trimmed = v?.trim();
    if (trimmed) set.add(trimmed);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * Active gallery categories for public filter dropdowns.
 */
export async function fetchGalleryCategoriesForGallery(): Promise<GalleryCategoryDTO[]> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('isActive.equals', 'true');
    params.append('sort', 'sortOrder,asc');

    const url = `${getApiBase()}/api/gallery-categories?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch gallery categories for gallery:', res.status, res.statusText);
      return [];
    }

    const data: GalleryCategoryDTO[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching gallery categories for gallery:', error);
    return [];
  }
}

/**
 * Distinct filter dropdown values from public gallery albums.
 */
export async function fetchGalleryAlbumFilterOptions(): Promise<GalleryAlbumFilterOptions> {
  try {
    const [categories, albumsResult] = await Promise.all([
      fetchGalleryCategoriesForGallery(),
      fetchAlbumsForGallery(0, 500),
    ]);

    const albums = albumsResult.albumsWithMedia.map((item) => item.album);

    return {
      categories,
      years: uniqueSortedNumbers(albums.map((a) => a.albumYear)),
      locations: uniqueSortedStrings(albums.map((a) => a.eventLocation)),
    };
  } catch (error) {
    console.error('Error fetching gallery album filter options:', error);
    return { categories: [], years: [], locations: [] };
  }
}

/**
 * Distinct filter dropdown values from active events with gallery media.
 */
export async function fetchGalleryEventFilterOptions(): Promise<GalleryEventFilterOptions> {
  try {
    const eventsResult = await fetchEventsForGallery(0, 500);
    const events = eventsResult.eventsWithMedia.map((item) => item.event);

    const eventTypeMap = new Map<number, string>();
    for (const event of events) {
      const typeId = event.eventType?.id;
      const typeName = event.eventType?.name?.trim();
      if (typeId && typeName) {
        eventTypeMap.set(typeId, typeName);
      }
    }

    const eventTypes = [...eventTypeMap.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      years: uniqueSortedNumbers(
        events.map((e) => {
          const start = e.startDate?.slice(0, 4);
          return start ? parseInt(start, 10) : null;
        }),
      ),
      locations: uniqueSortedStrings(events.map((e) => e.location)),
      eventTypes,
    };
  } catch (error) {
    console.error('Error fetching gallery event filter options:', error);
    return { years: [], locations: [], eventTypes: [] };
  }
}
