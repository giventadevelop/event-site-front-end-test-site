import type { TeamGroupDTO } from '@/types/teamGroup';

export function parseTeamGroupsResponse(data: unknown): TeamGroupDTO[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as TeamGroupDTO[];

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as TeamGroupDTO[];

    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded && typeof embedded === 'object') {
      const groups = embedded.teamGroups ?? embedded.team_groups;
      if (Array.isArray(groups)) return groups as TeamGroupDTO[];
      for (const v of Object.values(embedded)) {
        if (Array.isArray(v)) return v as TeamGroupDTO[];
      }
    }
  }

  return [];
}
