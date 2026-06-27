import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseTeamMembersResponse } from '@/lib/parseTeamMembersResponse';
import type { TeamMemberDTO } from '@/types/teamMember';

function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchTeamMembers(teamGroupId?: number): Promise<TeamMemberDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'priorityOrder,asc',
    });
    if (teamGroupId != null) {
      params.set('teamGroupId.equals', String(teamGroupId));
    }
    const url = `${getApiBase()}/api/team-members?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store', timeout: 15000 });
    if (!response.ok) throw new Error(`Failed to fetch team members: ${response.status}`);
    const data = await response.json();
    return parseTeamMembersResponse(data);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function createTeamMember(
  payload: Omit<TeamMemberDTO, 'id'>
): Promise<TeamMemberDTO | null> {
  try {
    const body = withTenantId({ ...payload });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to create team member: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating team member:', error);
    return null;
  }
}

export async function updateTeamMember(
  id: number,
  payload: Partial<TeamMemberDTO>
): Promise<TeamMemberDTO | null> {
  try {
    const body = withTenantId({ ...payload, id });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to update team member: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating team member:', error);
    return null;
  }
}

export async function deleteTeamMember(id: number): Promise<boolean> {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/team-members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete team member: ${response.status}`);
    return true;
  } catch (error) {
    console.error('Error deleting team member:', error);
    return false;
  }
}

export async function updateTeamMemberProfileImage(
  memberId: number,
  imageUrl: string
): Promise<TeamMemberDTO | null> {
  return updateTeamMember(memberId, { profileImageUrl: imageUrl });
}
