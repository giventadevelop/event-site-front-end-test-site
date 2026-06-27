'use client';

import type { EventCompetitionDTO, EventCompetitionParticipantDTO } from '@/types';
import { checkParticipantEligibility } from '@/lib/competitionEligibility';

interface Props {
  competition: EventCompetitionDTO;
  participant?: EventCompetitionParticipantDTO | null;
  compact?: boolean;
}

export default function CompetitionEligibilityBadge({ competition, participant, compact }: Props) {
  if (!participant) return null;

  const { eligible, reasons } = checkParticipantEligibility(competition, participant);

  if (eligible) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-green-100 text-green-800 font-medium ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      >
        Eligible
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-orange-100 text-orange-800 font-medium ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      title={reasons.join(' ')}
    >
      Not eligible
    </span>
  );
}
