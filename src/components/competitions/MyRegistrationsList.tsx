import Link from 'next/link';
import type { EventCompetitionRegistrationDTO } from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';

interface Props {
  eventId: string;
  registrations: EventCompetitionRegistrationDTO[];
  paymentSuccess?: boolean;
}

export default function MyRegistrationsList({ eventId, registrations, paymentSuccess }: Props) {
  return (
    <div className="space-y-6">
      {paymentSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Payment received. Your registrations will show as confirmed shortly.
        </div>
      )}
      {registrations.length === 0 ? (
        <p className="text-muted-foreground">You have no registrations for this event yet.</p>
      ) : (
        <ul className="space-y-4">
          {registrations.map((reg) => (
            <li key={reg.id} className="bg-card rounded-lg sacred-shadow p-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">{reg.competition?.name ?? 'Competition'}</p>
                <p className="text-sm text-muted-foreground">
                  {reg.participantProfile?.displayName ||
                    `${reg.participantProfile?.firstName ?? ''} ${reg.participantProfile?.lastName ?? ''}`.trim()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{reg.registrationStatus}</p>
                <p className="text-sm text-primary">{formatCurrency(Number(reg.feeAmount) || 0)}</p>
              </div>
            </li>
          ))}
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
