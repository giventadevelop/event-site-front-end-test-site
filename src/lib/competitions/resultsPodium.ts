import type { EventCompetitionContentBlockDTO, EventCompetitionDTO, EventCompetitionResultDTO } from '@/types';

export function isResultsPodiumBlock(block: EventCompetitionContentBlockDTO) {
  return (block.blockType || '').toUpperCase() === 'RESULTS_PODIUM';
}

export function parseResultsPodiumFromBlocks(
  blocks: EventCompetitionContentBlockDTO[]
): EventCompetitionResultDTO[] {
  return blocks.filter(isResultsPodiumBlock).flatMap((block) => {
    try {
      const parsed = JSON.parse(block.bodyMarkdown || '');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (row) => row && typeof row.displayName === 'string'
      ) as EventCompetitionResultDTO[];
    } catch {
      return [];
    }
  });
}

export function hydrateCompetitionResults(
  results: EventCompetitionResultDTO[],
  competitions: EventCompetitionDTO[]
): EventCompetitionResultDTO[] {
  const competitionById = new Map(
    competitions.filter((c) => c.id != null).map((c) => [Number(c.id), c])
  );
  return results.map((r) => {
    const competitionId =
      r.competition?.id ??
      (r as EventCompetitionResultDTO & { competitionId?: number | null }).competitionId ??
      null;
    const competition =
      (competitionId != null ? competitionById.get(Number(competitionId)) : undefined) ??
      r.competition;
    return {
      ...r,
      competition: competition
        ? ({ ...r.competition, ...competition } as EventCompetitionResultDTO['competition'])
        : r.competition,
    };
  });
}

export function matchCompetitionByName(
  competitions: EventCompetitionDTO[],
  name?: string | null
): EventCompetitionDTO | undefined {
  const needle = (name || '').trim().toLowerCase();
  if (!needle) return undefined;
  return competitions.find((c) => (c.name || '').trim().toLowerCase() === needle);
}
