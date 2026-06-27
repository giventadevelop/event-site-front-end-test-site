"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrlFromRequestHeaders, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipSubscriptionDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export interface FetchSubscriptionsFilters {
  userProfileId?: number;
  membershipPlanId?: number;
  subscriptionStatus?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * Fetch all subscriptions with filtering and pagination
 */
export async function fetchAllSubscriptionsServer(
  filters: FetchSubscriptionsFilters = {}
): Promise<{ data: MembershipSubscriptionDTO[]; totalCount: number }> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());

  if (filters.userProfileId) {
    params.append('userProfileId.equals', String(filters.userProfileId));
  }
  if (filters.membershipPlanId) {
    params.append('membershipPlanId.equals', String(filters.membershipPlanId));
  }
  if (filters.subscriptionStatus) {
    params.append('subscriptionStatus.equals', filters.subscriptionStatus);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  } else {
    params.append('sort', 'createdAt,desc');
  }
  if (filters.page !== undefined) {
    params.append('page', String(filters.page - 1)); // Backend uses 0-based pagination
  }
  if (filters.pageSize) {
    params.append('size', String(filters.pageSize));
  }

  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-subscriptions?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch subscriptions:', res.status, await res.text());
    return { data: [], totalCount: 0 };
  }

  const data = await res.json();
  const totalCount = res.headers.get('x-total-count');

  return {
    data: Array.isArray(data) ? data : [],
    totalCount: totalCount ? parseInt(totalCount, 10) : 0,
  };
}

/**
 * Get subscription details by ID
 */
export async function getSubscriptionDetailsServer(
  subscriptionId: number
): Promise<MembershipSubscriptionDTO | null> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  if (!subscriptionId) {
    return null;
  }

  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-subscriptions/${subscriptionId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    console.error('Failed to fetch subscription details:', res.status, await res.text());
    return null;
  }

  return res.json();
}

/**
 * Cancel a user's subscription (admin action)
 */
export async function cancelUserSubscriptionServer(
  subscriptionId: number,
  cancellationReason?: string
): Promise<MembershipSubscriptionDTO> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const payload = withTenantId({
    id: subscriptionId,
    subscriptionStatus: 'CANCELLED',
    cancelAtPeriodEnd: true,
    cancellationReason: cancellationReason || 'Cancelled by admin',
    cancelledAt: new Date().toISOString(),
  });

  const url = `${getApiBase()}/api/membership-subscriptions/${subscriptionId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to cancel subscription:', res.status, errorBody);
    throw new Error('Failed to cancel subscription');
  }

  return res.json();
}



