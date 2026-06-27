import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventProgramDirectorsDTO, EventMediaDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventProgramDirectorsServer(eventId?: number, page: number = 0, size: number = 10) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program directors: ${response.statusText}`);
  }

  const data = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  // Handle Spring Data REST paginated response format
  if (data._embedded && data._embedded.eventProgramDirectors) {
    return {
      data: data._embedded.eventProgramDirectors,
      totalCount,
    };
  }

  // Handle direct array response
  return {
    data: Array.isArray(data) ? data : [data],
    totalCount: Array.isArray(data) ? data.length : 1,
  };
}

export async function fetchEventProgramDirectorServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program director: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventProgramDirectorServer(director: Omit<EventProgramDirectorsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const currentTime = new Date().toISOString();
  const payload = withTenantId({
    ...director,
    createdAt: currentTime,
    updatedAt: currentTime,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: cleanUrlField(director.photoUrl),
  });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event program director: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventProgramDirectorServer(id: number, director: Partial<EventProgramDirectorsDTO>) {
  const payload = withTenantId({ ...director, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event program director: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventProgramDirectorServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event program director: ${errorText}`);
  }

  return true;
}

/**
 * Fetch all media files for a director, sorted by priority ranking
 * Uses the criteria-based query endpoint: /api/event-medias?directorId.equals={directorId}
 */
export async function fetchDirectorMediaServer(
  directorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();
  params.append('directorId.equals', directorId.toString());

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
    console.warn(`Failed to fetch director media: ${response.statusText}`);
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
 * Upload director photo
 */
export async function uploadDirectorImageServer(
  directorId: number,
  file: File,
  title?: string,
  description?: string,
  tenantId?: string
): Promise<EventMediaDTO> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('eventId', '0'); // No event association
    params.append('entityId', directorId.toString());
    params.append('entityType', 'DIRECTOR');
    params.append('imageType', 'photo');
    params.append('isProgramDirectorPhoto', 'true');

    params.append('title', title || `photo - ${directorId}`);
    params.append('description', description || `Director photo image`);
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
    console.error('Error uploading director image:', error);
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
 * Update media priority ranking
 */
export async function updateMediaPriorityRankingServer(
  mediaId: number,
  priorityRanking: number
): Promise<EventMediaDTO> {
  return updateEventMediaServer(mediaId, { priorityRanking });
}
