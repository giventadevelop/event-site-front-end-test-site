"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';

/**
 * Fetches all active executive committee team members from the backend API
 * Sorted by priority order for proper display sequence
 */
export async function fetchExecutiveTeamMembersServer(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const params = new URLSearchParams({
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      'tenantId.equals': getTenantId(),
    });
    const url = `${getApiBaseUrl()}/api/executive-committee-team-members?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch executive team members:', response.statusText);
      return [];
    }

    const data = await response.json();
    return parseExecutiveCommitteeTeamMembersResponse(data);
  } catch (error) {
    console.error('Error fetching executive team members:', error);
    return [];
  }
}
