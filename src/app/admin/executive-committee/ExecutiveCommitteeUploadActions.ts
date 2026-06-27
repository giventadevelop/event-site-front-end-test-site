'use server';

import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

/**
 * Uploads a profile image for a team member via a direct backend POST (multipart).
 *
 * Posts straight to the Spring API instead of routing through the Next upload proxy. The
 * proxy streams the raw request body through node-fetch (`body: req`, duplex 'half'), which
 * can stall / "premature close" on multipart and — because the caller has no timeout — leaves
 * the edit form stuck on "Saving…" indefinitely. fetchWithJwtRetry injects the JWT + tenant
 * header and applies a 30s timeout, so a slow upload fails fast instead of hanging.
 */
export async function uploadTeamMemberProfileImage(
  memberId: number,
  file: File,
  _userProfileId?: number
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('eventId', '0');
    params.append('executiveTeamMemberID', String(memberId));
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');
    params.append('isTeamMemberProfileImage', 'true');
    params.append('title', `Team Member Profile Image - ${memberId}`);
    params.append('description', 'Profile image uploaded for executive committee team member');
    params.append('tenantId', getTenantId());

    const url = `${getApiBaseUrl()}/api/event-medias/upload?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      body: formData,
    });

    if (response.status >= 200 && response.status < 300) {
      try {
        const result = await response.json();
        let imageUrl: string | null = null;
        if (result && typeof result === 'object') {
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const firstItem = result.data[0];
            if (firstItem && typeof firstItem === 'object') {
              imageUrl = firstItem.fileUrl || firstItem.url || null;
            }
          } else if (result.fileUrl) {
            imageUrl = result.fileUrl;
          } else if (result.url) {
            imageUrl = result.url;
          }
        }
        if (imageUrl && typeof imageUrl === 'string') {
          return imageUrl;
        }
        return 'upload-successful-no-url';
      } catch {
        return 'upload-successful-parse-error';
      }
    }
    throw new Error(`Upload failed with HTTP status ${response.status}. Please try again or contact support if the issue persists.`);
  } catch (error) {
    console.error('Error uploading team member profile image:', error);
    throw error;
  }
}
