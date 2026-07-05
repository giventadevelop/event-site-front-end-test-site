import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { isAdminRole } from '@/lib/utils';
import type { UserProfileDTO } from '@/types';

function parseProfileFromListResponse(data: unknown): UserProfileDTO | null {
  if (Array.isArray(data)) {
    return (data[0] as UserProfileDTO | undefined) ?? null;
  }
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as { content: unknown[] }).content)
  ) {
    return ((data as { content: UserProfileDTO[] }).content[0]) ?? null;
  }
  if (data && typeof data === 'object' && 'id' in data) {
    return data as UserProfileDTO;
  }
  return null;
}

export async function fetchUserProfileByUserId(
  userId: string
): Promise<UserProfileDTO | null> {
  const tenantId = getTenantId();
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/api/user-profiles/by-user/${encodeURIComponent(userId)}?tenantId.equals=${encodeURIComponent(tenantId)}`;

  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  if (data && typeof data === 'object' && 'id' in data) {
    return data as UserProfileDTO;
  }
  return parseProfileFromListResponse(data);
}

export async function fetchUserProfileByEmail(
  email: string
): Promise<UserProfileDTO | null> {
  const tenantId = getTenantId();
  const apiBase = getApiBaseUrl();
  const params = new URLSearchParams({
    'email.equals': email,
    'tenantId.equals': tenantId,
    size: '1',
  });
  const url = `${apiBase}/api/user-profiles?${params.toString()}`;

  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return parseProfileFromListResponse(data);
}

/**
 * Resolve tenant-scoped admin flag from backend user_profile (userRole ADMIN/SUPER_ADMIN).
 * Tries Clerk userId first, then email fallback (handles userId mismatch after re-login).
 */
export async function resolveIsTenantAdmin(
  userId: string,
  email?: string | null
): Promise<boolean> {
  try {
    let profile = await fetchUserProfileByUserId(userId);

    if (!profile && email?.trim()) {
      profile = await fetchUserProfileByEmail(email.trim());
    }

    return isAdminRole(profile?.userRole);
  } catch (error) {
    console.error('[resolveIsTenantAdmin] Failed to resolve admin status:', error);
    return false;
  }
}
