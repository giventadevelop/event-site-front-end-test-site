import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventProgramDirectorsDTO, EventMediaDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventProgramDirectorsServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program directors: ${response.statusText}`);
  }

  return await response.json();
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
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const payload = withTenantId({
    ...director,
    id,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: director.photoUrl ? cleanUrlField(director.photoUrl) : undefined,
  });

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

/**
 * Associate a program director with an event using the dedicated associate endpoint.
 * This is the proper way to associate a director with an event and avoids Hibernate ID change errors.
 */
export async function associateDirectorWithEventServer(directorId: number, eventId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-program-directors/${directorId}/associate/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to associate program director with event: ${errorText}`);
  }

  return await response.json();
}

/**
 * Disassociate a program director from an event (set event_id to null) using the dedicated disassociate endpoint.
 */
export async function disassociateDirectorFromEventServer(directorId: number) {
  const response = await fetchWithJwtRetry(
    `${getApiBase()}/api/event-program-directors/${directorId}/disassociate`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disassociate program director from event: ${errorText}`);
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

// Get available program directors (not mapped to current event) with pagination and search
export async function fetchAvailableProgramDirectorsServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available program directors for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all program directors assigned to the current event
    const assignedDirectors = await fetchEventProgramDirectorsServer(eventId);
    const assignedDirectorIds = new Set((Array.isArray(assignedDirectors) ? assignedDirectors : [assignedDirectors]).map((director: any) => director.id).filter(Boolean));
    console.log('🔍 Program director IDs assigned to current event:', Array.from(assignedDirectorIds));

    // Step 2: Get all tenant-level program directors (fetch without eventId filter)
    console.log('🔄 Fetching all tenant-level program directors...');
    let allDirectors: EventProgramDirectorsDTO[] = [];
    try {
      // Fetch all program directors for the tenant (no eventId filter)
      const params = new URLSearchParams();
      const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-program-directors?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        allDirectors = Array.isArray(data) ? data : [data];
        console.log('✅ Fetched', allDirectors.length, 'total tenant-level program directors');
      } else {
        console.warn('⚠️ Failed to fetch all program directors:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching all program directors:', error instanceof Error ? error.message : String(error));
    }

    // Step 3: Filter out program directors that are assigned to the current event
    const availableDirectors = allDirectors.filter((director: any) =>
      !assignedDirectorIds.has(director.id)
    );

    console.log('🔍 Available program directors (not assigned to current event):', availableDirectors.length);

    // Step 4: Apply search filter if provided
    const filteredDirectors = searchTerm
      ? availableDirectors.filter((director: any) =>
          director.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          director.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableDirectors;

    console.log('✅ Available program directors after search filtering:', filteredDirectors.length);

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedDirectors = filteredDirectors.slice(startIndex, endIndex);

    return {
      content: paginatedDirectors,
      totalElements: filteredDirectors.length,
      totalPages: Math.ceil(filteredDirectors.length / size),
      assignedCount: assignedDirectorIds.size,
      totalDirectors: allDirectors.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available program directors:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalDirectors: 0 };
  }
}

// ============================================
// Event Media Upload Functions for Directors
// ============================================

/**
 * Upload custom poster for event-director combination
 * Uses the generic /api/event-medias/upload endpoint with eventId and directorId
 */
export async function uploadEventDirectorPosterServer(
  eventId: number,
  directorId: number,
  file: File,
  title?: string,
  description?: string,
  tenantId?: string
): Promise<EventMediaDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('eventId', String(eventId));
  params.append('directorId', String(directorId));
  params.append('tenantId', tenantId || getTenantId());
  params.append('isPublic', 'true');

  // Set eventMediaType to indicate this is a custom poster
  params.append('eventMediaType', 'EVENT_DIRECTOR_POSTER');

  // Set storage type
  params.append('storageType', 'S3');

  // Set required flags
  params.append('eventFlyer', 'false');
  params.append('isEventManagementOfficialDocument', 'false');
  params.append('isHeroImage', 'false');
  params.append('isActiveHeroImage', 'false');
  params.append('isFeaturedImage', 'false');

  // Title and description
  if (title) {
    params.append('title', title);
  } else {
    params.append('title', `Custom Poster - Event ${eventId} - Director ${directorId}`);
  }

  if (description) {
    params.append('description', description);
  } else {
    params.append('description', 'Custom poster for event-director combination');
  }

  // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  params.append('startDisplayingFromDate', today);

  const baseUrl = getAppUrl();
  // Use the generic upload endpoint (same pattern as sponsors)
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
    // 🚫 Any non-2xx status code indicates failure
    console.error('❌ Upload failed - HTTP status:', response.status);
    const errorText = await response.text();
    throw new Error(`Failed to upload event-director poster: ${errorText}`);
  }
}

/**
 * Fetch all media files for an event-director combination, sorted by priority ranking
 * Uses the criteria-based query endpoint: /api/event-medias?eventId.equals={eventId}&directorId.equals={directorId}
 */
export async function fetchEventDirectorMediaServer(
  eventId: number,
  directorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();

  // Use eventId.equals and directorId.equals query parameters (JHipster criteria syntax)
  params.append('eventId.equals', String(eventId));
  params.append('directorId.equals', String(directorId));

  // Add tenantId filter (always include tenantId for multi-tenant filtering)
  const tenantIdToUse = tenantId || getTenantId();
  params.append('tenantId.equals', tenantIdToUse);

  // Sort by priority ranking (ascending - lower = higher priority)
  params.append('sort', 'priorityRanking,asc');

  const url = `${baseUrl}/api/proxy/event-medias?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    console.warn(`Failed to fetch event-director media: ${response.status} ${response.statusText}`);
    return [];
  }

  const data = await response.json();

  // Handle paginated response (Spring Data REST format)
  if (data && typeof data === 'object' && '_embedded' in data && 'eventMedias' in data._embedded) {
    return Array.isArray(data._embedded.eventMedias) ? data._embedded.eventMedias : [];
  }

  // Handle direct array response
  return Array.isArray(data) ? data : [data];
}

/**
 * Update media priority ranking
 */
export async function updateMediaPriorityRankingServer(
  mediaId: number,
  priorityRanking: number,
  tenantId?: string
): Promise<EventMediaDTO> {
  // Validate priority ranking
  if (priorityRanking < 0) {
    throw new Error('Priority ranking must be >= 0');
  }

  // Fetch existing media first to get ALL required fields
  const existingMedia = await fetchEventMediaServer(mediaId, tenantId);

  // Use fetchWithJwtRetry for authenticated backend call
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  // Include ALL required fields from existing media + updated priority ranking
  // This ensures backend validation passes for all NotNull fields
  const payload = withTenantId({
    id: mediaId,
    priorityRanking,
    // Required string fields
    storageType: existingMedia.storageType || 'S3',
    eventMediaType: existingMedia.eventMediaType || 'gallery',
    title: existingMedia.title || '',
    createdAt: existingMedia.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Required boolean fields (must not be null)
    isHomePageHeroImage: existingMedia.isHomePageHeroImage ?? false,
    isFeaturedEventImage: existingMedia.isFeaturedEventImage ?? false,
    isLiveEventImage: existingMedia.isLiveEventImage ?? false,
  });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-medias/${mediaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update priority ranking: ${errorText}`);
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
 * Delete a media file
 */
export async function deleteEventMediaServer(
  mediaId: number,
  tenantId?: string
): Promise<boolean> {
  // Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const url = `${getApiBase()}/api/event-medias/${mediaId}`;
  const response = await fetchWithJwtRetry(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete media: ${errorText}`);
  }

  return true;
}
