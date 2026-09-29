import Link from 'next/link';
import type { EventCompetitionRegistrationDTO } from '@/types';
import { formatCompetitionFee } from '@/lib/formatCurrency';

interface Props {
  eventId: string;
  registrations: EventCompetitionRegistrationDTO[];
  paymentSuccess?: boolean;
}

function participantLabel(reg: EventCompetitionRegistrationDTO): string {
  const p = reg.participantProfile;
  if (!p) return 'Participant unavailable';
  const name =
    p.displayName?.trim() ||
    `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
  return name || 'Participant unavailable';
}

function competitionLabel(reg: EventCompetitionRegistrationDTO): string {
  return reg.competition?.name?.trim() || 'Competition unavailable';
}

function isFreeRegistration(reg: EventCompetitionRegistrationDTO): boolean {
  return !(Number(reg.feeAmount) > 0);
}

function statusLabel(reg: EventCompetitionRegistrationDTO): string | null {
  if (isFreeRegistration(reg)) {
    if (
      reg.registrationStatus === 'PENDING_PAYMENT' ||
      reg.registrationStatus === 'CONFIRMED' ||
      reg.registrationStatus?.includes('PAYMENT')
    ) {
      return 'Registered';
    }
    return reg.registrationStatus || 'Registered';
  }
  return reg.registrationStatus || null;
}

export default function MyRegistrationsList({ eventId, registrations, paymentSuccess }: Props) {
  const hasPaidRegistration = registrations.some((reg) => !isFreeRegistration(reg));

  return (
    <div className="space-y-6">
      {paymentSuccess && hasPaidRegistration && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Payment received. Your registrations will show as confirmed shortly.
        </div>
      )}
      {registrations.length === 0 ? (
        <p className="text-muted-foreground">You have no registrations for this event yet.</p>
      ) : (
        <ul className="space-y-4">
          {registrations.map((reg) => {
            const free = isFreeRegistration(reg);
            const status = statusLabel(reg);
            return (
              <li
                key={reg.id}
                className="bg-card rounded-lg sacred-shadow p-4 flex flex-wrap justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Catalog</p>
                  <p className="font-semibold text-foreground">{competitionLabel(reg)}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground pt-2">Participant</p>
                  <p className="text-sm text-foreground">{participantLabel(reg)}</p>
                  {reg.competition?.divisionLabel && (
                    <p className="text-sm text-muted-foreground">{reg.competition.divisionLabel}</p>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-1">
                  {status && <p className="text-sm font-medium">{status}</p>}
                  {!free && (
                    <p className="text-sm text-primary font-semibold">
                      {formatCompetitionFee(Number(reg.feeAmount) || 0)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href={`/events/${eventId}/competitions/register`}
        className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
      >
        Register for more competitions
      </Link>
    </div>
  );
}
