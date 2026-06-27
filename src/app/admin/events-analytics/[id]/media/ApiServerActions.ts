"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getAppUrlFromRequestHeaders, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';
import { withTenantId } from '@/lib/withTenantId';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchUserProfileServer(userId: string) {
  if (!userId) return null;
  const tenantId = getTenantId();
  const res = await fetchWithJwtRetry(`${getApiBase()}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchMediaServer(eventId: string) {
  const url = `${getApiBase()}/api/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=false&sort=updatedAt,desc&tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export async function fetchMediaFilteredServer(
  eventId: string,
  page: number = 0,
  size: number = 10,
  searchTerm: string = '',
  eventFlyerOnly: boolean = false
) {
  const params = new URLSearchParams({
    'eventId.equals': eventId,
    'isEventManagementOfficialDocument.equals': 'false',
    sort: 'updatedAt,desc',
    'tenantId.equals': getTenantId(),
    page: page.toString(),
    size: size.toString(),
  });

  if (searchTerm) {
    params.append('title.contains', searchTerm);
  }

  if (eventFlyerOnly) {
    params.append('eventFlyer.equals', 'true');
  }

  const url = `${getApiBase()}/api/event-medias?${params.toString()}`;

  const response = await fetchWithJwtRetry(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    console.error(`Failed to fetch media for event ${eventId}: ${response.statusText}`);
    return { data: [], totalCount: 0 };
  }

  const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
  const data = await response.json();

  return {
    data: Array.isArray(data) ? data : [],
    totalCount,
  };
}

export async function fetchOfficialDocsServer(eventId: string) {
  const url = `${getApiBase()}/api/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=true&sort=updatedAt,desc&tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export interface MediaUploadParams {
  title: string; // Required parameter
  description: string;
  eventMediaType?: string; // Optional in new schema
  storageType?: string; // Optional in new schema
  fileUrl?: string; // Optional in new schema
  eventFlyer: boolean;
  isEventManagementOfficialDocument: boolean;
  isHeroImage: boolean;
  isActiveHeroImage: boolean;
  isPublic: boolean;
  altText?: string; // Optional in new schema
  displayOrder?: number; // Optional in new schema
  userProfileId?: number | null; // Optional in new schema
  files: File[];
  isTeamMemberProfileImage?: boolean; // Add optional parameter for team member profile images
  startDisplayingFromDate: string; // Required parameter - date when media should start being displayed
}

export async function uploadMedia(eventId: number, {
  title,
  description,
  eventMediaType,
  storageType,
  fileUrl,
  eventFlyer,
  isEventManagementOfficialDocument,
  isHeroImage,
  isActiveHeroImage,
  isPublic,
  altText,
  displayOrder,
  userProfileId,
  files,
  isTeamMemberProfileImage = false, // Default to false for regular event media
  startDisplayingFromDate
}: MediaUploadParams) {
  // Validate required fields
  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }

  if (!startDisplayingFromDate || startDisplayingFromDate.trim() === '') {
    throw new Error('Start Displaying From date is required');
  }

  if (!files || files.length === 0) {
    throw new Error('At least one file is required');
  }

  const formData = new FormData();

  // Append each file with the 'files' parameter (plural as expected by backend)
  files.forEach(file => {
    formData.append('files', file);
  });

  // Append other parameters as form data (not query params)
  formData.append('eventId', String(eventId));
  formData.append('eventFlyer', String(eventFlyer));
  formData.append('isEventManagementOfficialDocument', String(isEventManagementOfficialDocument));
  formData.append('isHeroImage', String(isHeroImage));
  formData.append('isActiveHeroImage', String(isActiveHeroImage));
  formData.append('isPublic', String(isPublic));
  formData.append('isTeamMemberProfileImage', String(isTeamMemberProfileImage));
  formData.append('tenantId', getTenantId());

  // Append title and description for each file (backend expects arrays)
  files.forEach(() => {
    formData.append('titles', title);
    formData.append('descriptions', description || '');
  });

  if (userProfileId) {
    formData.append('upLoadedById', String(userProfileId));
  }

  if (altText) {
    formData.append('altText', altText);
  }

  if (displayOrder !== undefined) {
    formData.append('displayOrder', String(displayOrder));
  }

  // Append startDisplayingFromDate (required field)
  formData.append('startDisplayingFromDate', startDisplayingFromDate);

  // Use the proxy endpoint (not direct backend call)
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-medias/upload-multiple`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return await res.json();
}

export async function deleteMediaServer(mediaId: number | string) {
  const url = `${getApiBase()}/api/event-medias/${mediaId}?tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'DELETE',
    });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return true;
}

export async function editMediaServer(mediaId: number | string, payload: Partial<EventMediaDTO>) {
  try {
    console.log('Starting direct-to-backend editMediaServer with payload:', payload);

    const url = `${getApiBase()}/api/event-medias/${mediaId}`;

    // Clean and prepare the payload according to rules - include all required fields
    const cleanedPayload = withTenantId({
      ...payload,
      id: Number(mediaId),
      // Include required fields that backend expects
      eventMediaType: payload.eventMediaType || 'gallery', // Default to gallery if not provided
      storageType: payload.storageType || 's3', // Default to s3 if not provided
      createdAt: payload.createdAt || new Date().toISOString(), // Use existing or current time
      updatedAt: new Date().toISOString(),
    });

    console.log(`Sending PATCH request directly to backend: ${url}`);

    const response = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json', // Use correct content type for PATCH
      },
      body: JSON.stringify(cleanedPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Direct backend media update failed:', errorText);
      throw new Error(errorText || 'Failed to update media');
    }

    const result = await response.json();
    console.log('Media update successful:', result);
    return result;
  } catch (error) {
    console.error('Error in editMediaServer:', error);
    throw error;
  }
}

// Keep the server action for backward compatibility, but it should not be used for file uploads
export async function uploadMediaServer(params: {
  eventId: string;
  files: File[];
  title: string;
  description: string;
  eventFlyer: boolean;
  isEventManagementOfficialDocument: boolean;
  isHeroImage: boolean;
  isActiveHeroImage: boolean;
  isPublic: boolean;
  altText: string;
  displayOrder?: number;
  userProfileId?: number | null;
  isTeamMemberProfileImage?: boolean; // Add optional parameter for team member profile images
  startDisplayingFromDate: string; // Required parameter - date when media should start being displayed
}) {
  const { eventId, files, ...rest } = params;

  // Assuming a single file upload for simplicity of infering type,
  // the backend seems to handle multiple files.
  // A more robust solution might be needed if multiple file types are uploaded at once.
  const eventMediaType = files.length > 0 ? inferEventMediaType(files[0]) : 'other';

  const uploadParams: MediaUploadParams = {
    ...rest,
    files,
    eventMediaType: eventMediaType || 'gallery', // Default to gallery if not specified
    storageType: 's3', // Default storage type
    fileUrl: '', // This seems to be handled by the backend
    isTeamMemberProfileImage: params.isTeamMemberProfileImage || false, // Pass through the parameter
  };

  return await uploadMedia(Number(eventId), uploadParams);
}

function inferEventMediaType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "gallery";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "video";
  if (["pdf"].includes(ext)) return "document";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "document";
  if (["svg"].includes(ext)) return "image";
  return "other";
}

export async function fetchEventDetailsByIdServer(eventId: number) {
  if (!eventId) return null;
  const tenantId = getTenantId();
  const res = await fetchWithJwtRetry(`${getApiBase()}/api/event-details/${eventId}?tenantId.equals=${tenantId}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`Failed to fetch event details for event ${eventId}: ${res.statusText}`);
    return null;
  }
  return await res.json();
}

// Add upload and delete actions as needed