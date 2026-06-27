'use client';

import Link from 'next/link';
import type { EventCompetitionDTO, EventCompetitionDayDTO, EventCompetitionParticipantDTO } from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';
import { DISCIPLINE_LABELS } from '@/lib/competitionEligibility';
import CompetitionEligibilityBadge from './CompetitionEligibilityBadge';

interface Props {
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  selectedIds: number[];
  onToggle: (competitionId: number, feeAmount: number) => void;
  activeParticipant?: EventCompetitionParticipantDTO | null;
  eventId?: string;
}

export default function CompetitionCatalog({
  competitions,
  days,
  selectedIds,
  onToggle,
  activeParticipant,
  eventId,
}: Props) {
  const dayMap = new Map(days.map((d) => [d.id, d]));

  const grouped = competitions.reduce<Record<string, EventCompetitionDTO[]>>((acc, c) => {
    const dayId = c.competitionDay?.id;
    const key = dayId ? String(dayId) : 'unscheduled';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dayKey, items]) => {
        const day = dayKey !== 'unscheduled' ? dayMap.get(parseInt(dayKey, 10)) : null;
        return (
          <section key={dayKey} className="bg-card rounded-lg sacred-shadow p-4">
            {day && (
              <h3 className="font-heading font-semibold text-lg mb-3">
                {day.dayLabel} — {day.eventDate}
                {day.venueName ? ` @ ${day.venueName}` : ''}
              </h3>
            )}
            <ul className="space-y-3">
              {items.map((comp) => {
                const id = comp.id!;
                const checked = selectedIds.includes(id);
                const discipline = comp.disciplineCode
                  ? DISCIPLINE_LABELS[comp.disciplineCode] ?? comp.disciplineCode
                  : null;
                return (
                  <li
                    key={id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(id, Number(comp.feeAmount) || 0)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between gap-2 items-start">
                        <div>
                          <span className="font-semibold text-foreground">{comp.name}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {discipline && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                {discipline}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              {comp.competitionType === 'GROUP' ? 'Team' : 'Individual'}
                            </span>
                            {activeParticipant && (
                              <CompetitionEligibilityBadge
                                competition={comp}
                                participant={activeParticipant}
                                compact
                              />
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-primary">
                          {formatCurrency(Number(comp.feeAmount) || 0)}
                        </span>
                      </div>
                      {comp.divisionLabel && (
                        <p className="text-sm text-muted-foreground">{comp.divisionLabel}</p>
                      )}
                      {comp.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comp.description}</p>
                      )}
                      {eventId && comp.id && (
                        <Link
                          href={`/events/${eventId}/competitions/${comp.id}`}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
