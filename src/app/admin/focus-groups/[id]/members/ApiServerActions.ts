'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';

/**
 * Fetch focus group by id (direct backend call per nextjs_api_routes.mdc).
 */
export async function fetchFocusGroupByIdServer(id: string): Promise<Record<string, unknown> | null> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) return null;
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id != null ? data : null;
  } catch {
    return null;
  }
}

export interface FocusGroupMembersResult {
  members: Record<string, unknown>[];
  totalCount: number;
}

/**
 * Fetch focus group members with pagination (direct backend call per nextjs_api_routes.mdc).
 * Returns members and totalCount (from x-total-count header).
 */
export async function fetchFocusGroupMembersServer(
  focusGroupId: string,
  page: number,
  pageSize: number
): Promise<FocusGroupMembersResult> {
  const API_BASE_URL = getApiBaseUrl();
  const tenantId = getTenantId();
  if (!API_BASE_URL) return { members: [], totalCount: 0 };
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId,
    'tenantId.equals': tenantId,
    sort: 'createdAt,desc',
    page: String(page),
    size: String(pageSize),
  });
  const url = `${API_BASE_URL}/api/focus-group-members?${params.toString()}`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    const totalCount = parseInt(res.headers.get('x-total-count') || res.headers.get('X-Total-Count') || '0', 10);
    if (!res.ok) return { members: [], totalCount: 0 };
    const data = await res.json();
    const members = Array.isArray(data) ? data : [];
    return { members, totalCount: totalCount > 0 ? totalCount : members.length };
  } catch {
    return { members: [], totalCount: 0 };
  }
}

export interface UserProfileSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Fetch user profile by id for display (direct backend call per nextjs_api_routes.mdc).
 */
export async function fetchUserProfileByIdServer(profileId: number): Promise<UserProfileSummary | null> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) return null;
  try {
    const res = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles/${profileId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.id == null) return null;
    return {
      id: Number(data.id),
      firstName: String(data.firstName ?? ''),
      lastName: String(data.lastName ?? ''),
      email: String(data.email ?? ''),
    };
  } catch {
    return null;
  }
}
