"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl, getAppUrlFromRequestHeaders } from '@/lib/env';
import type { MembershipPlanDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export interface FetchMembershipPlansFilters {
  isActive?: boolean;
  planType?: string;
  billingInterval?: string;
  sort?: string;
}

/**
 * Fetch membership plans with optional filtering
 */
export async function fetchMembershipPlansServer(
  filters: FetchMembershipPlansFilters = {}
): Promise<MembershipPlanDTO[]> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());

  if (filters.isActive !== undefined) {
    params.append('isActive.equals', String(filters.isActive));
  }
  if (filters.planType) {
    params.append('planType.equals', filters.planType);
  }
  if (filters.billingInterval) {
    params.append('billingInterval.equals', filters.billingInterval);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }

  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch membership plans:', res.status, await res.text());
    return [];
  }

  return res.json();
}



