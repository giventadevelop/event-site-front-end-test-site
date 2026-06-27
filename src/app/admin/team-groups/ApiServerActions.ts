import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseTeamGroupsResponse } from '@/lib/parseTeamGroupsResponse';
import type { TeamGroupDTO } from '@/types/teamGroup';

function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchTeamGroups(): Promise<TeamGroupDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
    });
    const url = `${getApiBase()}/api/team-groups?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store', timeout: 15000 });
    if (!response.ok) throw new Error(`Failed to fetch team groups: ${response.status}`);
    const data = await response.json();
    return parseTeamGroupsResponse(data);
  } catch (error) {
    console.error('Error fetching team groups:', error);
    return [];
  }
}

export async function createTeamGroup(
  payload: Omit<TeamGroupDTO, 'id'>
): Promise<TeamGroupDTO | null> {
  try {
    const body = withTenantId({ ...payload });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to create team group: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating team group:', error);
    return null;
  }
}

export async function updateTeamGroup(
  id: number,
  payload: Partial<TeamGroupDTO>
): Promise<TeamGroupDTO | null> {
  try {
    const body = withTenantId({ ...payload, id });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to update team group: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating team group:', error);
    return null;
  }
}

export async function deleteTeamGroup(id: number): Promise<boolean> {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete team group: ${response.status}`);
    return true;
  } catch (error) {
    console.error('Error deleting team group:', error);
    return false;
  }
}
