import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventSponsorsDTO, EventSponsorsJoinDTO, EventMediaDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventSponsorsServer(page: number = 0, pageSize: number = 10) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('size', String(pageSize));
  params.append('sort', 'priorityRanking,asc');

  // Add tenantId filter for multi-tenant support
  const tenantId = getTenantId();
  params.append('tenantId.equals', tenantId);

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event sponsors: ${response.statusText}`);
  }

  const data = await response.json();

  // Handle paginated response (Spring Data REST format)
  if (data && typeof data === 'object' && '_embedded' in data && 'eventSponsors' in data._embedded) {
    const sponsors = Array.isArray(data._embedded.eventSponsors) ? data._embedded.eventSponsors : [];
    const totalCount = data.page?.totalElements || sponsors.length;
    return { data: sponsors, totalCount };
  }

  // Handle direct array response (fallback)
  const sponsors = Array.isArray(data) ? data : [data];
  return { data: sponsors, totalCount: sponsors.length };
}

export async function fetchEventSponsorServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event sponsor: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventSponsorServer(sponsor: Omit<EventSponsorsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const payload = withTenantId({ ...sponsor, createdAt: now, updatedAt: now });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event sponsor: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventSponsorServer(id: number, sponsor: Partial<EventSponsorsDTO>) {
  const payload = withTenantId({ ...sponsor, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event sponsor: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventSponsorServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event sponsor: ${errorText}`);
  }

  return true;
}

// Event Sponsors Join (Many-to-Many Relationship) functions
export async function fetchEventSponsorsJoinServer(eventId?: number) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors-join${params.toString() ? `?${params.toString()}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event sponsors join: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventSponsorJoinServer(sponsorJoin: Omit<EventSponsorsJoinDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const payload = withTenantId(sponsorJoin);

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors-join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event sponsor join: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventSponsorJoinServer(id: number, sponsorJoin: Partial<EventSponsorsJoinDTO>) {
  const payload = withTenantId({ ...sponsorJoin, id });

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors-join/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event sponsor join: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventSponsorJoinServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors-join/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event sponsor join: ${errorText}`);
  }

  return true;
}

// ============================================
// Event Media Upload Functions
// ============================================

/**
 * Upload sponsor image (logo, hero, or banner)
 *
 * 🎯 IMPORTANT: This function uses the generic /api/event-medias/upload endpoint
 * (same pattern as executive team members) to support sponsor images without event ID.
 * When eventId is 0 or not provided, the image is associated only with the sponsor.
 */
export async function uploadSponsorImageServer(
  sponsorId: number,
  eventId: number,
  imageType: 'logo' | 'hero' | 'banner',
  file: File,
  tenantId?: string
): Promise<EventMediaDTO> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Convert frontend imageType to backend format: logo -> LOGO_IMAGE, hero -> HERO_IMAGE, banner -> BANNER_IMAGE
    const backendImageType = imageType.toUpperCase() + '_IMAGE';

    const params = new URLSearchParams();
    // Use eventId = 0 for sponsor images without event association (same pattern as executive team members)
    params.append('eventId', String(eventId || 0));

    // Use entityId to identify the sponsor (same pattern as executiveTeamMemberID)
    params.append('entityId', String(sponsorId));

    // Send imageType in backend format (LOGO_IMAGE, HERO_IMAGE, BANNER_IMAGE) to match uploadSponsorImage() switch statement
    params.append('imageType', backendImageType);

    // Set entityType to indicate this is a sponsor entity
    params.append('entityType', 'SPONSOR');

    // Set the appropriate sponsor image flag based on imageType (for backward compatibility)
    if (imageType === 'logo') {
      params.append('isSponsorLogo', 'true');
    } else if (imageType === 'hero') {
      params.append('isSponsorHero', 'true');
    } else if (imageType === 'banner') {
      params.append('isSponsorBanner', 'true');
    }

    // Set other required flags (similar to executive team member pattern)
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');

    // Backend requires "title" parameter
    const title = `Sponsor ${imageType} - ${sponsorId}`;
    params.append('title', title);

    // Backend accepts optional "description" parameter
    const description = `Sponsor ${imageType} image`;
    params.append('description', description);

    params.append('tenantId', tenantId || getTenantId());

    // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    params.append('startDisplayingFromDate', today);

    const baseUrl = getAppUrl();
    // Use the dedicated sponsor-image upload endpoint
    const url = `${baseUrl}/api/proxy/event-medias/upload/sponsor?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // 🎯 CRITICAL: Only rely on HTTP status codes for success/failure determination
    // This prevents issues with null responses or malformed JSON from backend errors
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
      throw new Error(`Upload failed with HTTP status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Error uploading sponsor image:', error);
    throw error;
  }
}

/**
 * Upload custom poster for event-sponsor combination
 * Uses the generic /api/event-medias/upload endpoint with eventSponsorsJoinId
 */
export async function uploadEventSponsorPosterServer(
  eventId: number,
  sponsorId: number,
  eventSponsorsJoinId: number,
  file: File,
  title?: string,
  description?: string,
  tenantId?: string
): Promise<EventMediaDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('eventId', String(eventId));
  params.append('sponsorId', String(sponsorId));
  params.append('eventSponsorsJoinId', String(eventSponsorsJoinId));
  params.append('tenantId', tenantId || getTenantId());
  params.append('isPublic', 'true');

  // Set eventMediaType to indicate this is a custom poster
  params.append('eventMediaType', 'EVENT_SPONSOR_POSTER');

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
    params.append('title', `Custom Poster - Event ${eventId} - Sponsor ${sponsorId}`);
  }

  if (description) {
    params.append('description', description);
  } else {
    params.append('description', 'Custom poster for event-sponsor combination');
  }

  // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  params.append('startDisplayingFromDate', today);

  const baseUrl = getAppUrl();
  // Use the generic upload endpoint (same pattern as sponsor images)
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
    throw new Error(`Failed to upload event-sponsor poster: ${errorText}`);
  }
}

/**
 * Upload multiple media files for a sponsor
 */
export async function uploadSponsorMediaServer(
  sponsorId: number,
  file: File,
  title?: string,
  description?: string,
  priorityRanking?: number,
  tenantId?: string
): Promise<EventMediaDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('sponsorId', String(sponsorId));
  params.append('tenantId', tenantId || getTenantId());
  params.append('isPublic', 'true');
  if (title) params.append('title', title);
  if (description) params.append('description', description);
  if (priorityRanking !== undefined) params.append('priorityRanking', String(priorityRanking));

  // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  params.append('startDisplayingFromDate', today);

  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-medias/upload/sponsor-media?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload sponsor media: ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload multiple media files for an event-sponsor combination
 */
export async function uploadEventSponsorMediaServer(
  eventId: number,
  sponsorId: number,
  file: File,
  title?: string,
  description?: string,
  priorityRanking?: number,
  tenantId?: string
): Promise<EventMediaDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('eventId', String(eventId));
  params.append('sponsorId', String(sponsorId));
  params.append('tenantId', tenantId || getTenantId());
  params.append('isPublic', 'true');
  if (title) params.append('title', title);
  if (description) params.append('description', description);
  if (priorityRanking !== undefined) params.append('priorityRanking', String(priorityRanking));

  // Set startDisplayingFromDate to today's date (YYYY-MM-DD format) to satisfy NOT NULL constraint
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  params.append('startDisplayingFromDate', today);

  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-medias/upload/event-sponsor-media?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload event-sponsor media: ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch all media files for a sponsor, sorted by priority ranking
 * Uses the criteria-based query endpoint: /api/event-medias?sponsorId.equals={sponsorId}
 */
export async function fetchSponsorMediaServer(
  sponsorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();

  // Use sponsorId.equals query parameter (JHipster criteria syntax)
  params.append('sponsorId.equals', String(sponsorId));

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
    console.warn(`Failed to fetch sponsor media: ${response.statusText}`);
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
 * Fetch all media files for an event-sponsor combination, sorted by priority ranking
 * Uses the endpoint: /api/event-medias/event-sponsor/{eventId}/{sponsorId}
 */
export async function fetchEventSponsorMediaServer(
  eventId: number,
  sponsorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams();

  // Always include tenantId for multi-tenant filtering (same pattern as fetchSponsorMediaServer)
  const tenantIdToUse = tenantId || getTenantId();
  params.append('tenantId.equals', tenantIdToUse);

  // Sort by priority ranking (ascending - lower = higher priority)
  params.append('sort', 'priorityRanking,asc');

  const url = `${baseUrl}/api/proxy/event-medias/event-sponsor/${eventId}/${sponsorId}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    console.warn(`Failed to fetch event-sponsor media: ${response.status} ${response.statusText}`);
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
 * Update priority ranking of a media file
 */
/**
 * Update event media attributes (full update)
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
  const url = `${baseUrl}/api/proxy/event-medias/${mediaId}`;

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
