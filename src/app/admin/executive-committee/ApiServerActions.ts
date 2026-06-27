'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';

function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchExecutiveCommitteeMembers(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const params = new URLSearchParams({
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      'tenantId.equals': getTenantId(),
    });
    const url = `${getApiBase()}/api/executive-committee-team-members?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, {
      cache: 'no-store',
      timeout: 15000,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch executive committee members: ${response.status}`);
    }

    const data = await response.json();
    return parseExecutiveCommitteeTeamMembersResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Executive committee members fetch timed out after 15 seconds');
    } else {
      console.error('Error fetching executive committee members:', error);
    }
    return [];
  }
}

export async function createExecutiveCommitteeMember(
  memberData: Omit<ExecutiveCommitteeTeamMemberDTO, 'id'>
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const payload = withTenantId({ ...memberData });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/executive-committee-team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create executive committee member: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating executive committee member:', error);
    return null;
  }
}

export async function updateExecutiveCommitteeMember(
  id: number,
  memberData: Partial<ExecutiveCommitteeTeamMemberDTO>
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const payload = withTenantId({ ...memberData, id });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/executive-committee-team-members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update executive committee member: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating executive committee member:', error);
    return null;
  }
}

export async function deleteExecutiveCommitteeMember(id: number): Promise<boolean> {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/executive-committee-team-members/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete executive committee member: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting executive committee member:', error);
    return false;
  }
}

export async function updateProfileImage(
  memberId: number,
  imageUrl: string
): Promise<ExecutiveCommitteeTeamMemberDTO | null> {
  try {
    const payload = withTenantId({
      id: memberId,
      profileImageUrl: imageUrl,
    });
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/executive-committee-team-members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile image: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile image:', error);
    return null;
  }
}
