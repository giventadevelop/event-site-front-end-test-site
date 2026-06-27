'use client';

import type { EventCompetitionDTO } from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';
import CompetitionStripeCheckout from './CompetitionStripeCheckout';

interface CartLine {
  competitionId: number;
  feeAmount: number;
  registrationId?: number;
}

interface Props {
  eventId: string;
  lines: CartLine[];
  competitions: EventCompetitionDTO[];
  email?: string;
  returnUrl: string;
  showCheckout: boolean;
}

export default function RegistrationCart({
  eventId,
  lines,
  competitions,
  email,
  returnUrl,
  showCheckout,
}: Props) {
  const compMap = new Map(competitions.map((c) => [c.id, c]));
  const total = lines.reduce((sum, l) => sum + l.feeAmount, 0);
  const registrationIds = lines.map((l) => l.registrationId).filter((id): id is number => !!id);

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 space-y-4">
      <h3 className="font-heading font-semibold text-xl">Your selections</h3>
      <ul className="space-y-2 text-sm">
        {lines.map((line) => {
          const comp = compMap.get(line.competitionId);
          return (
            <li key={line.competitionId} className="flex justify-between gap-4">
              <span>{comp?.name ?? `Competition #${line.competitionId}`}</span>
              <span className="font-semibold">{formatCurrency(line.feeAmount)}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between border-t pt-3 font-semibold text-lg">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
      {showCheckout && registrationIds.length > 0 && total > 0 && (
        <CompetitionStripeCheckout
          eventId={eventId}
          registrationIds={registrationIds}
          email={email}
          amountCents={Math.round(total * 100)}
          returnUrl={returnUrl}
          enabled
        />
      )}
      {total === 0 && lines.length > 0 && (
        <p className="text-sm text-muted-foreground">No payment required for selected competitions.</p>
      )}
    </div>
  );
}
