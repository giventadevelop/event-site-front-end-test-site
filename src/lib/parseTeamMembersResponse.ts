import type { TeamMemberDTO } from '@/types/teamMember';

export function parseTeamMembersResponse(data: unknown): TeamMemberDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as TeamMemberDTO[];

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as TeamMemberDTO[];

    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      const members = embedded.teamMembers ?? embedded.team_members;
      if (Array.isArray(members)) return members as TeamMemberDTO[];
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v as TeamMemberDTO[];
      }
    }
  }

  return [];
}
