import Link from 'next/link';

export type CompetitionNavActive =
  | 'hub'
  | 'register'
  | 'catalog'
  | 'winners'
  | 'rules'
  | 'my-registrations';

interface Props {
  eventId: string;
  active: CompetitionNavActive;
  registrationOpen?: boolean;
}

function primaryClass(): string {
  return 'inline-flex shrink-0 items-center whitespace-nowrap px-4 sm:px-6 py-3 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover';
}

function outlineClass(): string {
  return 'inline-flex shrink-0 items-center whitespace-nowrap px-4 sm:px-6 py-3 text-sm sm:text-base border-2 border-border rounded-xl font-semibold reverent-hover';
}

export default function CompetitionNav({ eventId, active, registrationOpen = false }: Props) {
  const base = `/events/${eventId}/competitions`;

  return (
    <nav
      className="flex flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1"
      aria-label="Competition sections"
    >
      {registrationOpen && (
        <Link
          href={`${base}/register`}
          className={active === 'register' ? primaryClass() : outlineClass()}
        >
          Register for competitions
        </Link>
      )}
      <Link
        href={`${base}/catalog`}
        className={active === 'catalog' ? primaryClass() : outlineClass()}
      >
        Catalogs
      </Link>
      <Link
        href={`${base}/winners`}
        className={active === 'winners' ? primaryClass() : outlineClass()}
      >
        View winners
      </Link>
      <Link
        href={`${base}/rules`}
        className={active === 'rules' ? primaryClass() : outlineClass()}
      >
        Rules & info
      </Link>
      <Link
        href={`${base}/my-registrations`}
        className={active === 'my-registrations' ? primaryClass() : outlineClass()}
      >
        My registrations
      </Link>
    </nav>
  );
}
