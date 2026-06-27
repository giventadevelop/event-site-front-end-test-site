import Image from 'next/image';
import type { EventCompetitionResultDTO } from '@/types';
import { PLACEMENT_LABELS } from '@/lib/competitionEligibility';

interface Props {
  results: EventCompetitionResultDTO[];
  championEnabled?: boolean;
}

function groupByCompetition(results: EventCompetitionResultDTO[]) {
  const map = new Map<string, EventCompetitionResultDTO[]>();
  for (const r of results) {
    const key = r.competition?.name ?? `Competition ${r.competition?.id ?? 'unknown'}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  for (const [, items] of map) {
    items.sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function PublishedWinnersView({ results, championEnabled }: Props) {
  if (results.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">Winners will be announced after the competition.</p>
    );
  }

  const grouped = groupByCompetition(results);
  const championCandidate = championEnabled
    ? [...results].sort((a, b) => (b.pointsAwarded ?? 0) - (a.pointsAwarded ?? 0))[0]
    : null;

  return (
    <div className="space-y-12">
      {championCandidate && championCandidate.pointsAwarded > 0 && (
        <section className="bg-gradient-to-br from-background via-muted to-background border border-border/30 rounded-3xl p-8 text-center sacred-shadow-lg">
          <p className="text-sm font-caption text-primary uppercase tracking-wide mb-2">Overall Champion</p>
          <h2 className="font-heading font-semibold text-2xl text-foreground">{championCandidate.displayName}</h2>
          {championCandidate.competition?.name && (
            <p className="text-muted-foreground mt-1">{championCandidate.competition.name}</p>
          )}
          <p className="text-sm font-medium text-primary mt-2">{championCandidate.pointsAwarded} points</p>
        </section>
      )}

      {grouped.map(([compName, compResults]) => (
        <section key={compName}>
          <h2 className="font-heading font-semibold text-2xl text-foreground mb-6 border-b border-border pb-2">
            {compName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compResults.map((result) => (
              <div
                key={result.id}
                className={`bg-card rounded-lg sacred-shadow overflow-hidden ${
                  result.placement === 1 ? 'ring-2 ring-primary/30' : ''
                }`}
              >
                <div className="relative w-full h-48 bg-muted">
                  {result.winnerPhotoUrl ? (
                    <Image
                      src={result.winnerPhotoUrl}
                      alt={result.displayName}
                      fill
                      className="object-contain"
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl text-muted-foreground">
                      {result.placement === 1 ? '🥇' : result.placement === 2 ? '🥈' : result.placement === 3 ? '🥉' : '🏆'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-caption text-primary uppercase tracking-wide">
                    {result.placementLabel ||
                      (result.placement ? PLACEMENT_LABELS[result.placement] ?? `#${result.placement}` : '')}
                  </p>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{result.displayName}</h3>
                  {result.prizeTitle && (
                    <p className="text-sm font-medium text-foreground mt-2">{result.prizeTitle}</p>
                  )}
                  {result.pointsAwarded > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{result.pointsAwarded} pts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
