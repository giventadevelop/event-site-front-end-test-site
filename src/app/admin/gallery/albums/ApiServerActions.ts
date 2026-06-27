'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { GalleryAlbumDTO, GalleryCategoryDTO, EventMediaDTO } from '@/types';

/** URL-safe slug for gallery_category (matches DB check: ^[a-z0-9]+(-[a-z0-9]+)*$). */
function slugFromDisplayName(displayName: string): string {
  let slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    slug = 'category';
  }
  return slug.slice(0, 80);
}

/**
 * Find an active category by display name (case-insensitive exact match).
 */
export async function findGalleryCategoryByDisplayNameServer(
  displayName: string
): Promise<GalleryCategoryDTO | null> {
  const trimmed = displayName.trim();
  if (!trimmed) return null;

  const categories = await fetchGalleryCategoriesForAdminServer();
  return (
    categories.find((c) => c.displayName.trim().toLowerCase() === trimmed.toLowerCase()) ?? null
  );
}

/**
 * Create a new gallery category.
 */
export async function createGalleryCategoryServer(displayName: string): Promise<GalleryCategoryDTO> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error('Category name is required');
  }

  const existing = await findGalleryCategoryByDisplayNameServer(trimmed);
  if (existing) {
    return existing;
  }

  const categories = await fetchGalleryCategoriesForAdminServer();
  const maxSort = categories.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), 0);
  const baseSlug = slugFromDisplayName(trimmed);
  const now = new Date().toISOString();

  let lastError = 'Failed to create gallery category';

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const payload = withTenantId({
      slug,
      displayName: trimmed,
      sortOrder: maxSort + 10,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const url = `${getApiBase()}/api/gallery-categories`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as GalleryCategoryDTO;
    }

    const errorText = await res.text();
    lastError = errorText || lastError;
    const isDuplicate =
      res.status === 409 ||
      /duplicate|unique|already exists|constraint/i.test(errorText);

    if (!isDuplicate) {
      console.error('Failed to create gallery category:', res.status, errorText);
      throw new Error(`Failed to create gallery category: ${errorText}`);
    }
  }

  throw new Error(`Failed to create gallery category: ${lastError}`);
}

/**
 * Return existing category id or create one from the typed display name.
 */
export async function findOrCreateGalleryCategoryServer(
  displayName: string
): Promise<GalleryCategoryDTO> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error('Category name is required');
  }

  const existing = await findGalleryCategoryByDisplayNameServer(trimmed);
  if (existing) {
    return existing;
  }

  return createGalleryCategoryServer(trimmed);
}

/**
 * Resolve galleryCategoryId on album save when user typed a new name without clicking create.
 */
export async function resolveGalleryCategoryIdForSaveServer(
  categoryId: number | null,
  pendingDisplayName: string | null
): Promise<number | null> {
  if (categoryId != null) {
    return categoryId;
  }

  const name = pendingDisplayName?.trim();
  if (!name) {
    return null;
  }

  const category = await findOrCreateGalleryCategoryServer(name);
  return category.id;
}

/**
 * Fetch active gallery categories for admin album forms.
 */
export async function fetchGalleryCategoriesForAdminServer(): Promise<GalleryCategoryDTO[]> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('isActive.equals', 'true');
    params.append('sort', 'sortOrder,asc');

    const url = `${getApiBase()}/api/gallery-categories?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch gallery categories:', res.status, res.statusText);
      return [];
    }

    const data: GalleryCategoryDTO[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    return [];
  }
}

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
/**
 * Create new album
 */
export async function createAlbumServer(
  album: Omit<GalleryAlbumDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GalleryAlbumDTO> {
  try {
    const payload = withTenantId({
      ...album,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const url = `${getApiBase()}/api/gallery-albums`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to create album:', res.status, errorText);
      throw new Error(`Failed to create album: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
}

/**
 * Fetch albums with pagination and filtering
 */
export async function fetchAlbumsServer(
  page: number = 0,
  size: number = 12,
  searchTerm?: string,
  isPublic?: boolean
): Promise<{ albums: GalleryAlbumDTO[]; totalCount: number }> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'createdAt,desc');

    if (searchTerm) {
      params.append('title.contains', searchTerm);
    }

    if (typeof isPublic === 'boolean') {
      params.append('isPublic.equals', isPublic.toString());
    }

    const url = `${getApiBase()}/api/gallery-albums?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch albums:', res.status, res.statusText);
      return { albums: [], totalCount: 0 };
    }

    const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
    const albums: GalleryAlbumDTO[] = await res.json();
    const albumsArray = Array.isArray(albums) ? albums : [];

    return { albums: albumsArray, totalCount };
  } catch (error) {
    console.error('Error fetching albums:', error);
    return { albums: [], totalCount: 0 };
  }
}

/**
 * Fetch album by ID
 */
export async function fetchAlbumServer(albumId: number): Promise<GalleryAlbumDTO | null> {
  try {
    const url = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error('Failed to fetch album:', res.status, res.statusText);
      throw new Error(`Failed to fetch album: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
}

/**
 * Update album
 */
export async function updateAlbumServer(
  albumId: number,
  updates: Partial<GalleryAlbumDTO>
): Promise<GalleryAlbumDTO> {
  try {
    const payload = withTenantId({
      ...updates,
      id: albumId,
      updatedAt: new Date().toISOString(),
    });

    const url = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to update album:', res.status, errorText);
      throw new Error(`Failed to update album: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating album:', error);
    throw error;
  }
}

/**
 * Delete album
 */
export async function deleteAlbumServer(albumId: number): Promise<void> {
  try {
    const url = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to delete album:', res.status, errorText);
      throw new Error(`Failed to delete album: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
}

/**
 * Add media to album
 */
export async function addMediaToAlbumServer(albumId: number, mediaIds: number[]): Promise<void> {
  try {
    // Update each media item to set album_id and clear event_id
    for (const mediaId of mediaIds) {
      const url = `${getApiBase()}/api/event-medias/${mediaId}`;
      const payload = {
        id: mediaId,
        albumId,
        eventId: null, // Clear event association
        updatedAt: new Date().toISOString(),
      };

      const res = await fetchWithJwtRetry(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to add media ${mediaId} to album:`, res.status, errorText);
        throw new Error(`Failed to add media ${mediaId} to album: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('Error adding media to album:', error);
    throw error;
  }
}

/**
 * Remove media from album
 */
export async function removeMediaFromAlbumServer(mediaId: number): Promise<void> {
  try {
    const url = `${getApiBase()}/api/event-medias/${mediaId}`;
    const payload = {
      id: mediaId,
      albumId: null,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to remove media from album:', res.status, errorText);
      throw new Error(`Failed to remove media from album: ${errorText}`);
    }
  } catch (error) {
    console.error('Error removing media from album:', error);
    throw error;
  }
}

/**
 * Fetch media for album
 */
export async function fetchAlbumMediaServer(
  albumId: number,
  page: number = 0,
  size: number = 20
): Promise<{ media: EventMediaDTO[]; totalCount: number }> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('albumId.equals', albumId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'updatedAt,desc');

    const url = `${getApiBase()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch album media:', res.status, res.statusText);
      return { media: [], totalCount: 0 };
    }

    const totalCount = parseInt(res.headers.get('X-Total-Count') || '0', 10);
    const media: EventMediaDTO[] = await res.json();
    const mediaArray = Array.isArray(media) ? media : [];

    return { media: mediaArray, totalCount };
  } catch (error) {
    console.error('Error fetching album media:', error);
    return { media: [], totalCount: 0 };
  }
}


/**
 * Set cover image for album
 */
export async function setAlbumCoverImageServer(albumId: number, coverImageUrl: string): Promise<GalleryAlbumDTO> {
  try {
    const url = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const payload = withTenantId({
      id: albumId,
      coverImageUrl,
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to set cover image:', res.status, errorText);
      throw new Error(`Failed to set cover image: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error setting cover image:', error);
    throw error;
  }
}

/**
 * Edit media (update media properties)
 */
export async function editAlbumMediaServer(mediaId: number | string, payload: Partial<EventMediaDTO>): Promise<EventMediaDTO> {
  try {
    const url = `${getApiBase()}/api/event-medias/${mediaId}`;
    const cleanedPayload = withTenantId({
      ...payload,
      id: Number(mediaId),
      eventMediaType: payload.eventMediaType || 'gallery',
      storageType: payload.storageType || 's3',
      updatedAt: new Date().toISOString(),
    });

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(cleanedPayload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update media: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating media:', error);
    throw error;
  }
}

/**
 * Delete media
 */
export async function deleteAlbumMediaServer(mediaId: number | string): Promise<void> {
  try {
    const url = `${getApiBase()}/api/event-medias/${mediaId}?tenantId.equals=${getTenantId()}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete media: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
}

