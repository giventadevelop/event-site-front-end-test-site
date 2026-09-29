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

/** Profile list lookups — avoid /by-user/{id} which can hang on some backends. */
const PROFILE_LOOKUP_TIMEOUT_MS = 8000;

export async function fetchUserProfileByUserId(
  userId: string
): Promise<UserProfileDTO | null> {
  const tenantId = getTenantId();
  const apiBase = getApiBaseUrl();
  // Use criteria list (same as working user-profiles proxy by-user conversion).
  // Direct /api/user-profiles/by-user/{id} has been observed to hang → false admin clears.
  const params = new URLSearchParams({
    'userId.equals': userId,
    'tenantId.equals': tenantId,
    size: '1',
  });
  const url = `${apiBase}/api/user-profiles?${params.toString()}`;

  const res = await fetchWithJwtRetry(url, {
    cache: 'no-store',
    timeout: PROFILE_LOOKUP_TIMEOUT_MS,
  });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  if (data && typeof data === 'object' && 'id' in data && !Array.isArray(data)) {
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

  const res = await fetchWithJwtRetry(url, {
    cache: 'no-store',
    timeout: PROFILE_LOOKUP_TIMEOUT_MS,
  });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return parseProfileFromListResponse(data);
}

export type ResolveTenantAdminResult = {
  isAdmin: boolean;
  /** True when profile lookup threw / timed out — callers must not treat as confirmed non-admin */
  lookupFailed?: boolean;
  userRole?: string | null;
  tenantId?: string;
};

/**
 * Resolve tenant-scoped admin flag from backend user_profile (userRole ADMIN/SUPER_ADMIN).
 * Tries Clerk userId first, then email fallback (handles userId mismatch after re-login).
 */
export async function resolveIsTenantAdmin(
  userId: string,
  email?: string | null
): Promise<boolean> {
  const result = await resolveTenantAdminStatus(userId, email);
  return result.isAdmin;
}

/**
 * Same as resolveIsTenantAdmin but surfaces lookup failures so Header/SSR do not
 * flicker off admin when the API error is transient.
 */
export async function resolveTenantAdminStatus(
  userId: string,
  email?: string | null
): Promise<ResolveTenantAdminResult> {
  const tenantId = getTenantId();
  try {
    let profile = await fetchUserProfileByUserId(userId);

    if (!profile && email?.trim()) {
      profile = await fetchUserProfileByEmail(email.trim());
    }

    const userRole = profile?.userRole ?? null;
    return {
      isAdmin: isAdminRole(userRole),
      userRole,
      tenantId,
    };
  } catch (error) {
    console.error('[resolveIsTenantAdmin] Failed to resolve admin status:', error);
    return { isAdmin: false, lookupFailed: true, tenantId };
  }
}
