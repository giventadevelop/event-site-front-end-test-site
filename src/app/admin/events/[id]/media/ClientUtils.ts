// Client-side utilities for media upload
// This file contains only client-side functions and should not import any server-side code

export async function uploadMediaClient(params: {
  eventId: string;
  files: File[];
  title: string;
  description: string;
  eventFlyer: boolean;
  isEventManagementOfficialDocument: boolean;
  isHeroImage: boolean;
  isActiveHeroImage: boolean;
  isFeaturedImage: boolean;
  isPublic: boolean;
  altText: string;
  displayOrder?: number;
  userProfileId?: number | null;
  isTeamMemberProfileImage?: boolean;
}) {
  const { eventId, files, ...rest } = params;

  // Get tenant ID from environment variable (available on client)
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables');
  }

  // Create FormData for the upload
  const formData = new FormData();

  // Append each file with the 'files' parameter (plural as expected by backend)
  files.forEach(file => {
    formData.append('files', file);
  });

  // Append other parameters as form data
  formData.append('eventId', eventId);
  formData.append('eventFlyer', String(rest.eventFlyer));
  formData.append('isEventManagementOfficialDocument', String(rest.isEventManagementOfficialDocument));
  formData.append('isHeroImage', String(rest.isHeroImage));
  formData.append('isActiveHeroImage', String(rest.isActiveHeroImage));
  formData.append('isFeaturedImage', String(rest.isFeaturedImage));
  formData.append('isPublic', String(rest.isPublic));
  formData.append('isTeamMemberProfileImage', String(rest.isTeamMemberProfileImage || false));
  formData.append('tenantId', tenantId);

  // Append title and description for each file (backend expects arrays)
  files.forEach(() => {
    formData.append('titles', rest.title);
    formData.append('descriptions', rest.description || '');
  });

  if (rest.userProfileId) {
    formData.append('upLoadedById', String(rest.userProfileId));
  }

  if (rest.altText) {
    formData.append('altText', rest.altText);
  }

  if (rest.displayOrder !== undefined) {
    formData.append('displayOrder', String(rest.displayOrder));
  }

  const res = await fetch('/api/proxy/event-medias/upload-multiple', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return await res.json();
}
