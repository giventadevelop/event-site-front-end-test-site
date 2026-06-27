import type {
  CompetitionEligibleAudience,
  EventCompetitionDTO,
  EventCompetitionParticipantDTO,
} from '@/types';

export const DISCIPLINE_LABELS: Record<string, string> = {
  SONG: 'Song',
  SPEECH: 'Speech',
  DANCE: 'Dance',
  MUSIC: 'Music',
  SPORTS: 'Sports',
  ART: 'Art',
  OTHER: 'Other',
};

export const PLACEMENT_LABELS: Record<number, string> = {
  1: '1st Place',
  2: '2nd Place',
  3: '3rd Place',
  4: '4th Place',
};

export function computeAgeFromDob(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/** Client-side eligibility preview (backend is authoritative). */
export function checkParticipantEligibility(
  competition: EventCompetitionDTO,
  participant: EventCompetitionParticipantDTO | null | undefined
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!participant) {
    return { eligible: false, reasons: ['Select a participant profile first.'] };
  }

  const eligibleAudience: CompetitionEligibleAudience = competition.eligibleAudience;
  const pType = participant.participantType;

  if (eligibleAudience === 'YOUTH_ONLY' && pType !== 'CHILD') {
    reasons.push('This competition is for youth participants only.');
  }
  if (eligibleAudience === 'ADULT_ONLY' && pType !== 'ADULT') {
    reasons.push('This competition is for adult participants only.');
  }

  const age = computeAgeFromDob(participant.dateOfBirth);
  if (competition.minAge != null && age != null && age < competition.minAge) {
    reasons.push(`Minimum age is ${competition.minAge}.`);
  }
  if (competition.maxAge != null && age != null && age > competition.maxAge) {
    reasons.push(`Maximum age is ${competition.maxAge}.`);
  }
  if (competition.minGrade != null && participant.currentGrade != null && participant.currentGrade < competition.minGrade) {
    reasons.push(`Minimum grade is ${competition.minGrade}.`);
  }
  if (competition.maxGrade != null && participant.currentGrade != null && participant.currentGrade > competition.maxGrade) {
    reasons.push(`Maximum grade is ${competition.maxGrade}.`);
  }

  if (competition.competitionType === 'GROUP' && pType === 'ADULT' && eligibleAudience === 'YOUTH_ONLY') {
    reasons.push('Team captain must register youth team members for this competition.');
  }

  return { eligible: reasons.length === 0, reasons };
}

export function getDefaultPointsForPlacement(
  placement: number,
  settings: { pointsFirst: number; pointsSecond: number; pointsThird: number; pointsFourth?: number }
): number {
  switch (placement) {
    case 1:
      return settings.pointsFirst;
    case 2:
      return settings.pointsSecond;
    case 3:
      return settings.pointsThird;
    case 4:
      return settings.pointsFourth ?? 0;
    default:
      return 0;
  }
}
