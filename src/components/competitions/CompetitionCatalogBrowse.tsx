import Link from 'next/link';
import type { EventCompetitionDTO, EventCompetitionDayDTO } from '@/types';
import { formatCompetitionFee } from '@/lib/formatCurrency';
import { DISCIPLINE_LABELS } from '@/lib/competitionEligibility';

interface Props {
  eventId: string;
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  registrationOpen?: boolean;
}

export default function CompetitionCatalogBrowse({
  eventId,
  competitions,
  days,
  registrationOpen = false,
}: Props) {
  const dayMap = new Map(days.map((d) => [d.id, d]));

  return (
    <div className="space-y-6">
      {registrationOpen && (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/events/${eventId}/competitions/register`}
            className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover"
          >
            Register Here
          </Link>
        </div>
      )}

      {competitions.length === 0 ? (
        <p className="text-muted-foreground">Competitions will be listed here soon.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((c) => {
            const discipline = c.disciplineCode
              ? DISCIPLINE_LABELS[c.disciplineCode] ?? c.disciplineCode
              : c.track || null;
            const dayId = c.competitionDay?.id;
            const day = dayId ? dayMap.get(dayId) ?? c.competitionDay : null;
            const fee = Number(c.feeAmount) || 0;

            return (
              <li
                key={c.id}
                className="p-5 border border-border rounded-lg bg-card space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  {discipline && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {discipline}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                    {c.competitionType === 'GROUP' ? 'Team' : 'Individual'}
                  </span>
                  {c.divisionLabel && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-xs">
                      {c.divisionLabel}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-semibold text-lg text-foreground">{c.name}</h3>

                <p className="text-base font-semibold text-primary">{formatCompetitionFee(fee)}</p>

                {c.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.description}</p>
                )}

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-1">
                  {day && (
                    <div>
                      <dt className="text-muted-foreground">Schedule</dt>
                      <dd className="font-medium">
                        {day.dayLabel}
                        {day.eventDate ? ` · ${day.eventDate}` : ''}
                        {day.venueName ? ` @ ${day.venueName}` : ''}
                      </dd>
                    </div>
                  )}
                  {(c.minAge != null || c.maxAge != null) && (
                    <div>
                      <dt className="text-muted-foreground">Age range</dt>
                      <dd className="font-medium">
                        {c.minAge ?? '—'} to {c.maxAge ?? '—'}
                      </dd>
                    </div>
                  )}
                  {(c.minGrade != null || c.maxGrade != null) && (
                    <div>
                      <dt className="text-muted-foreground">Grade range</dt>
                      <dd className="font-medium">
                        {c.minGrade ?? '—'} to {c.maxGrade ?? '—'}
                      </dd>
                    </div>
                  )}
                  {c.timeLimitMinutes != null && (
                    <div>
                      <dt className="text-muted-foreground">Time limit</dt>
                      <dd className="font-medium">{c.timeLimitMinutes} minutes</dd>
                    </div>
                  )}
                  {c.competitionType === 'GROUP' && (
                    <div>
                      <dt className="text-muted-foreground">Team size</dt>
                      <dd className="font-medium">
                        {c.minGroupSize ?? 1}–{c.maxGroupSize ?? '∞'} members
                      </dd>
                    </div>
                  )}
                </dl>

                {c.rulesMarkdown && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground mb-1">Rules</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.rulesMarkdown}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
