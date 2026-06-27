import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventFeaturedPerformersDTO, EventMediaDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventFeaturedPerformersServer(eventId?: number, page: number = 0, size: number = 10) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performers: ${response.statusText}`);
  }

  const data = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  // Handle Spring Data REST paginated response format
  if (data._embedded && data._embedded.eventFeaturedPerformers) {
    return {
      data: data._embedded.eventFeaturedPerformers,
      totalCount,
    };
  }

  // Handle direct array response
  return {
    data: Array.isArray(data) ? data : [data],
    totalCount: Array.isArray(data) ? data.length : 1,
  };
}

export async function fetchEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performer: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventFeaturedPerformerServer(performer: Omit<EventFeaturedPerformersDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const payload = withTenantId({
    ...performer,
    createdAt: now,
    updatedAt: now,
  });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event featured performer: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventFeaturedPerformerServer(id: number, performer: Partial<EventFeaturedPerformersDTO>) {
  const payload = withTenantId({ ...performer, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event featured performer: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event featured performer: ${errorText}`);
  }

  return true;
}

/**
 * Fetch all media files for a performer, sorted by priority ranking
 * Uses the criteria-based query endpoint: /api/event-medias?performerId.equals={performerId}
 */
export async function fetchPerformerMediaServer(
  performerId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();
  params.append('performerId.equals', performerId.toString());

  // Add tenantId filter (always include tenantId for multi-tenant filtering)
  const tenantIdToUse = tenantId || getTenantId();
  params.append('tenantId.equals', tenantIdToUse);

  // Sort by priority ranking (ascending)
  params.append('sort', 'priorityRanking,asc');

  const url = `${baseUrl}/api/proxy/event-medias?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    console.warn(`Failed to fetch performer media: ${response.statusText}`);
    return [];
  }

  const data = await response.json();

  // Handle Spring Data REST paginated response format
  if (data._embedded && data._embedded.eventMedias) {
    return data._embedded.eventMedias;
  }

  // Handle direct array response
  return Array.isArray(data) ? data : [data];
}

/**
 * Upload performer image (portrait or performance)
 */
export async function uploadPerformerImageServer(
  performerId: number,
  file: File,
  imageType: 'portrait' | 'performance',
  title?: string,
  description?: string,
  tenantId?: string
): Promise<EventMediaDTO> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('eventId', '0'); // No event association
    params.append('entityId', performerId.toString());
    params.append('entityType', 'PERFORMER');
    params.append('imageType', imageType);

    // Set flags based on image type
    if (imageType === 'portrait') {
      params.append('isFeaturedPerformerPortrait', 'true');
    } else if (imageType === 'performance') {
      params.append('isFeaturedPerformerPerformance', 'true');
    }

    params.append('title', title || `${imageType} - ${performerId}`);
    params.append('description', description || `Performer ${imageType} image`);
    params.append('isPublic', 'true');
    params.append('tenantId', tenantId || getTenantId());

    // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    params.append('startDisplayingFromDate', today);

    const baseUrl = getAppUrl();
    // Use the generic upload endpoint (same as sponsors)
    const url = `${baseUrl}/api/proxy/event-medias/upload?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // 🎯 CRITICAL: Only rely on HTTP status codes for success/failure determination
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Upload successful - HTTP status:', response.status);

      try {
        const result = await response.json();
        return result;
      } catch (parseError) {
        console.error('❌ Failed to parse successful upload response:', parseError);
        throw new Error('Upload succeeded but response parsing failed');
      }
    } else {
      console.error('❌ Upload failed - HTTP status:', response.status);
      const errorText = await response.text();
      throw new Error(`Upload failed with HTTP status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Error uploading performer image:', error);
    throw error;
  }
}

/**
 * Update event media attributes
 */
export async function updateEventMediaServer(
  mediaId: number,
  updates: Partial<EventMediaDTO>,
  tenantId?: string
): Promise<EventMediaDTO> {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const payload = {
    ...updates,
    id: mediaId,
    tenantId: tenantId || getTenantId(),
  };

  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-medias/${mediaId}`; // Proxy to backend's PATCH endpoint

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update media: ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch a single media file by ID
 */
export async function fetchEventMediaServer(
  mediaId: number,
  tenantId?: string
): Promise<EventMediaDTO> {
  // Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const url = `${getApiBase()}/api/event-medias/${mediaId}`;
  const response = await fetchWithJwtRetry(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch media: ${errorText}`);
  }

  return await response.json();
}

/**
 * Update media priority ranking
 */
export async function updateMediaPriorityRankingServer(
  mediaId: number,
  priorityRanking: number
): Promise<EventMediaDTO> {
  if (priorityRanking < 0) {
    throw new Error('Priority ranking must be >= 0');
  }

  const existingMedia = await fetchEventMediaServer(mediaId);

  const merged: Partial<EventMediaDTO> = withTenantId({
    ...existingMedia,
    priorityRanking,
    updatedAt: new Date().toISOString(),
  });

  merged.createdAt = merged.createdAt || existingMedia.createdAt || new Date().toISOString();
  merged.storageType = merged.storageType || existingMedia.storageType || 'S3';
  merged.eventMediaType = merged.eventMediaType || existingMedia.eventMediaType || 'gallery';
  merged.title = (merged.title ?? existingMedia.title ?? 'Untitled Media').trim() || 'Untitled Media';
  merged.tenantId = merged.tenantId || existingMedia.tenantId;

  const booleanFields: (keyof EventMediaDTO)[] = [
    'isHomePageHeroImage',
    'isFeaturedEventImage',
    'isLiveEventImage',
    'isPublic',
    'eventFlyer',
    'isEventManagementOfficialDocument',
    'isHeroImage',
    'isActiveHeroImage',
    'isFeaturedVideo',
  ];

  booleanFields.forEach((field) => {
    (merged as any)[field] = (merged as any)[field] ?? (existingMedia as any)?.[field] ?? false;
  });

  return updateEventMediaServer(mediaId, merged, existingMedia.tenantId);
}
