import Link from 'next/link';
import type {
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import { DISCIPLINE_LABELS } from '@/lib/competitionEligibility';
import { formatCurrency } from '@/lib/formatCurrency';

interface Props {
  eventId: string;
  competition: EventCompetitionDTO;
  day?: EventCompetitionDayDTO | null;
  settings: EventCompetitionSettingsDTO | null;
  registrationOpen: boolean;
}

export default function CompetitionDetailView({
  eventId,
  competition,
  day,
  settings,
  registrationOpen,
}: Props) {
  const base = `/events/${eventId}/competitions`;
  const discipline = competition.disciplineCode
    ? DISCIPLINE_LABELS[competition.disciplineCode] ?? competition.disciplineCode
    : competition.track || null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href={base} className="text-sm text-primary hover:underline">
          ← All competitions
        </Link>
        <h1 className="font-heading font-semibold text-3xl text-foreground mt-2">{competition.name}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          {discipline && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {discipline}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
            {competition.competitionType === 'GROUP' ? 'Team' : 'Individual'}
          </span>
          {competition.divisionLabel && (
            <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm">
              {competition.divisionLabel}
            </span>
          )}
        </div>
      </div>

      {competition.description && (
        <section className="bg-card rounded-lg sacred-shadow p-6">
          <h2 className="font-heading font-semibold text-xl mb-3">About</h2>
          <p className="font-body text-muted-foreground whitespace-pre-wrap">{competition.description}</p>
        </section>
      )}

      <section className="bg-card rounded-lg sacred-shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Registration fee</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(Number(competition.feeAmount) || 0)}</p>
        </div>
        {day && (
          <div>
            <p className="text-sm text-muted-foreground">Schedule</p>
            <p className="font-medium">{day.dayLabel}</p>
            <p className="text-sm text-muted-foreground">
              {day.eventDate}
              {day.venueName ? ` · ${day.venueName}` : ''}
            </p>
          </div>
        )}
        {competition.timeLimitMinutes != null && (
          <div>
            <p className="text-sm text-muted-foreground">Time limit</p>
            <p className="font-medium">{competition.timeLimitMinutes} minutes</p>
          </div>
        )}
        {competition.competitionType === 'GROUP' && (
          <div>
            <p className="text-sm text-muted-foreground">Team size</p>
            <p className="font-medium">
              {competition.minGroupSize ?? 1}–{competition.maxGroupSize ?? '∞'} members
            </p>
          </div>
        )}
        {(competition.minAge != null || competition.maxAge != null) && (
          <div>
            <p className="text-sm text-muted-foreground">Age range</p>
            <p className="font-medium">
              {competition.minAge ?? '—'} to {competition.maxAge ?? '—'}
            </p>
          </div>
        )}
        {(competition.minGrade != null || competition.maxGrade != null) && (
          <div>
            <p className="text-sm text-muted-foreground">Grade range</p>
            <p className="font-medium">
              {competition.minGrade ?? '—'} to {competition.maxGrade ?? '—'}
            </p>
          </div>
        )}
      </section>

      {competition.rulesMarkdown && (
        <section className="bg-card rounded-lg sacred-shadow p-6">
          <h2 className="font-heading font-semibold text-xl mb-3">Rules & regulations</h2>
          <div className="font-body text-muted-foreground whitespace-pre-wrap">{competition.rulesMarkdown}</div>
        </section>
      )}

      {competition.judgmentCriteriaJson && (
        <section className="bg-card rounded-lg sacred-shadow p-6">
          <h2 className="font-heading font-semibold text-xl mb-3">Judging criteria</h2>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body">
            {competition.judgmentCriteriaJson}
          </pre>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {registrationOpen && settings?.registrationOpen && (
          <Link
            href={`${base}/register?competitionId=${competition.id}`}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover"
          >
            Register for this competition
          </Link>
        )}
        <Link href={`${base}/winners`} className="px-6 py-3 border-2 border-border rounded-xl font-semibold">
          View winners
        </Link>
      </div>
    </div>
  );
}
