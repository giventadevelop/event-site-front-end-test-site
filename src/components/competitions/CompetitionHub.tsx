import Link from 'next/link';
import type {
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import CompetitionBackLink from './CompetitionBackLink';
import CompetitionNav from './CompetitionNav';

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
  days,
  registrationOpen,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-bar-height,6.5rem)+1.5rem)] pb-12 space-y-10">
      <div>
        <CompetitionBackLink href={`/events/${eventId}`}>← Back to {eventTitle}</CompetitionBackLink>
        <h1 className="font-heading font-semibold text-3xl text-foreground mt-4">Competitions</h1>
        {settings?.eligibilityText && (
          <p className="font-body text-muted-foreground mt-2 max-w-3xl">{settings.eligibilityText}</p>
        )}
      </div>

      <CompetitionNav eventId={eventId} active="hub" registrationOpen={registrationOpen} />

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
        <h2 className="font-heading font-semibold text-xl mb-2">Browse the catalog</h2>
        <p className="text-muted-foreground mb-4">
          See every competition, eligibility details, and fees on the Catalogs page.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/events/${eventId}/competitions/catalog`}
            className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover"
          >
            Open catalogs
          </Link>
          {registrationOpen && (
            <Link
              href={`/events/${eventId}/competitions/register`}
              className="inline-flex px-6 py-3 border-2 border-border rounded-xl font-semibold reverent-hover"
            >
              Register here
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
