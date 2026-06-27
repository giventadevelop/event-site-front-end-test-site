import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';

/**
 * Normalize list responses from GET /api/executive-committee-team-members:
 * plain array, Spring Data `content`, or HAL `_embedded.*`.
 */
export function parseExecutiveCommitteeTeamMembersResponse(data: unknown): ExecutiveCommitteeTeamMemberDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as ExecutiveCommitteeTeamMemberDTO[];

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as ExecutiveCommitteeTeamMemberDTO[];

    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      const members = embedded.executiveCommitteeTeamMembers ?? embedded.executive_committee_team_members;
      if (Array.isArray(members)) return members as ExecutiveCommitteeTeamMemberDTO[];
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v as ExecutiveCommitteeTeamMemberDTO[];
      }
    }
  }

  return [];
}
