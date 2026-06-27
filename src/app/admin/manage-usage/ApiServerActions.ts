// This file was renamed from actions.ts to ApiServerActions.ts as a standard for server-side API calls in this module.
"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { UserProfileDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

async function fetchWithJwt(url: string, options: any = {}) {
  const { getCachedApiJwt, generateApiJwt } = await import('@/lib/api/jwt');
  let token = await getCachedApiJwt();
  let res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });

  if (res.status === 401) {
    token = await generateApiJwt();
    res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
  }
  return res;
}

export async function fetchAllUsersServer(): Promise<UserProfileDTO[]> {
  const url = `${getApiBase()}/api/user-profiles?tenantId.equals=${getTenantId()}`;
  const res = await fetchWithJwt(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAdminProfileServer(userId: string): Promise<UserProfileDTO | null> {
  if (!userId) return null;
  try {
    // Use criteria endpoint to guarantee tenant scoping and consistent response shape
    const params = new URLSearchParams();
    params.append('userId.equals', userId);
    params.append('tenantId.equals', getTenantId());
    params.append('size', '1');
    const url = `${getApiBase()}/api/user-profiles?${params.toString()}`;

    // Use fetchWithJwtRetry which handles retries and timeouts better
    const res = await fetchWithJwtRetry(url, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0] as UserProfileDTO;
    // Spring Data REST / paginated shape: { content: [...] }
    if (
      data &&
      typeof data === 'object' &&
      'content' in data &&
      Array.isArray((data as { content: unknown }).content)
    ) {
      const content = (data as { content: UserProfileDTO[] }).content;
      return content.length > 0 ? content[0] : null;
    }
    // Single profile object (must have userId — not a page wrapper)
    if (data && typeof data === 'object' && 'userId' in data) {
      return data as UserProfileDTO;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}

export async function fetchUsersServer({ search, searchField, status, role, page, pageSize }: {
  search: string;
  searchField: string;
  status: string;
  role: string;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams();
  if (search && searchField) {
    params.append(`${searchField}.contains`, search);
  }
  if (status) params.append('userStatus.equals', status);
  if (role) params.append('userRole.equals', role);
  params.append('page', String(page - 1));
  params.append('size', String(pageSize));
  params.append('tenantId.equals', getTenantId());
  const res = await fetchWithJwtRetry(`${getApiBase()}/api/user-profiles?${params.toString()}`, {
    cache: 'no-store',
  });
  const totalCount = res.headers.get('X-Total-Count');
  const data = await res.json();
  return { data, totalCount: totalCount ? parseInt(totalCount, 10) : 0 };
}

export async function patchUserProfileServer(userId: number, payload: Partial<UserProfileDTO>) {
  const url = `${getApiBase()}/api/user-profiles/${userId}`;

  const finalPayload = {
    ...payload,
    id: userId,
    tenantId: getTenantId(),
  };

  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(finalPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Failed to update user profile ${userId}:`, errorBody);
    throw new Error('Failed to update user profile');
  }
  return res.json();
}

export async function bulkUploadUsersServer(users: any[]) {
  const res = await fetchWithJwtRetry(`${getApiBase()}/api/user-profiles/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(users.map(u => ({ ...u, tenantId: getTenantId() }))),
  });
  return await res.json();
}