import Link from 'next/link';
import type {
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';
import { DISCIPLINE_LABELS } from '@/lib/competitionEligibility';

interface Props {
  eventId: string;
  eventTitle: string;
  settings: EventCompetitionSettingsDTO | null;
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  registrationOpen: boolean;
}

export default function CompetitionHub({
  eventId,
  eventTitle,
  settings,
  competitions,
  days,
  registrationOpen,
}: Props) {
  const base = `/events/${eventId}/competitions`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <Link href={`/events/${eventId}`} className="text-sm text-primary hover:underline">
          ← Back to {eventTitle}
        </Link>
        <h1 className="font-heading font-semibold text-3xl text-foreground mt-2">Competitions</h1>
        {settings?.eligibilityText && (
          <p className="font-body text-muted-foreground mt-2 max-w-3xl">{settings.eligibilityText}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {registrationOpen && (
          <Link
            href={`${base}/register`}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover"
          >
            Register for competitions
          </Link>
        )}
        <Link
          href={`${base}/winners`}
          className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl"
        >
          View winners
        </Link>
        <Link href={`${base}/rules`} className="px-6 py-3 border-2 border-border rounded-xl font-semibold">
          Rules & info
        </Link>
        <Link href={`${base}/my-registrations`} className="px-6 py-3 border-2 border-border rounded-xl font-semibold">
          My registrations
        </Link>
      </div>

      {days.length > 0 && (
        <section className="bg-card rounded-lg sacred-shadow p-6">
          <h2 className="font-heading font-semibold text-xl mb-4">Schedule</h2>
          <ul className="space-y-3">
            {days.map((day) => (
              <li key={day.id} className="border-b border-border pb-3 last:border-0">
                <p className="font-semibold">{day.dayLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {day.eventDate}
                  {day.venueName ? ` · ${day.venueName}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-card rounded-lg sacred-shadow p-6">
        <h2 className="font-heading font-semibold text-xl mb-4">Competition catalog</h2>
        {competitions.length === 0 ? (
          <p className="text-muted-foreground">Competitions will be listed here soon.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitions.map((c) => {
              const discipline = c.disciplineCode
                ? DISCIPLINE_LABELS[c.disciplineCode] ?? c.disciplineCode
                : c.track || null;
              return (
                <li key={c.id}>
                  <Link
                    href={`${base}/${c.id}`}
                    className="block p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 reverent-transition group"
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      {discipline && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {discipline}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                        {c.competitionType === 'GROUP' ? 'Team' : 'Individual'}
                      </span>
                    </div>
                    <p className="font-semibold group-hover:text-primary">{c.name}</p>
                    {c.divisionLabel && <p className="text-sm text-muted-foreground">{c.divisionLabel}</p>}
                    <p className="text-sm font-medium text-primary mt-2">
                      {formatCurrency(Number(c.feeAmount) || 0)}
                    </p>
                    {registrationOpen && (
                      <span className="inline-block mt-3 text-sm font-semibold text-primary">
                        View details & register →
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
