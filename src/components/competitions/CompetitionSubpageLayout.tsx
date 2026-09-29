import type { ReactNode } from 'react';
import CompetitionBackLink from './CompetitionBackLink';
import CompetitionNav, { type CompetitionNavActive } from './CompetitionNav';

interface Props {
  eventId: string;
  title: string;
  active: CompetitionNavActive;
  registrationOpen?: boolean;
  children: ReactNode;
  /** Optional max width for page body below the nav (nav always uses full row width). */
  contentClassName?: string;
}

export default function CompetitionSubpageLayout({
  eventId,
  title,
  active,
  registrationOpen = false,
  children,
  contentClassName,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-bar-height,6.5rem)+1.5rem)] pb-12 space-y-10">
      <div>
        <CompetitionBackLink href={`/events/${eventId}/competitions`}>← Competitions</CompetitionBackLink>
        <h1 className="font-heading font-semibold text-3xl text-foreground mt-4">{title}</h1>
      </div>

      <CompetitionNav eventId={eventId} active={active} registrationOpen={registrationOpen} />

      <div className={contentClassName}>{children}</div>
    </div>
  );
}
