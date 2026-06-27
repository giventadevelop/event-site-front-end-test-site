'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CompetitionAudienceMode,
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  EventCompetitionParticipantDTO,
  EventCompetitionSettingsDTO,
  RegistrationActorMode,
} from '@/types';
import {
  createBulkRegistrationsServer,
  createParticipantServer,
  createRegistrationServer,
  createTeamRegistrationServer,
  patchParticipantServer,
} from '@/app/events/[id]/competitions/ApiServerActions';
import ParticipantProfileForm, { type ParticipantFormValues } from './ParticipantProfileForm';
import CompetitionCatalog from './CompetitionCatalog';
import RegistrationCart from './RegistrationCart';
import RegistrationActorStep from './RegistrationActorStep';
import ChildParticipantManager from './ChildParticipantManager';
import TeamRosterForm, { type RosterMember } from './TeamRosterForm';

interface Props {
  eventId: string;
  settings: EventCompetitionSettingsDTO;
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  clerkUserId: string;
  existingParticipants: EventCompetitionParticipantDTO[];
  userEmail?: string;
  preselectedCompetitionId?: number;
}

type CartLine = { competitionId: number; feeAmount: number; registrationId?: number };

const emptyProfile = (email = ''): ParticipantFormValues => ({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  currentGrade: '',
  schoolName: '',
  phone: '',
  email,
});

function defaultActorMode(settings: EventCompetitionSettingsDTO): RegistrationActorMode {
  if (settings.registrationMode === 'MIXED' || settings.audienceMode === 'MIXED') return 'PARENT';
  if (settings.audienceMode === 'ADULT') return 'SELF';
  return 'PARENT';
}

export default function RegistrationWizard({
  eventId,
  settings,
  competitions,
  days,
  clerkUserId,
  existingParticipants: initialParticipants,
  userEmail,
  preselectedCompetitionId,
}: Props) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [actorMode, setActorMode] = useState<RegistrationActorMode>(() => defaultActorMode(settings));
  const [step, setStep] = useState(() => (settings.registrationMode === 'MIXED' || settings.audienceMode === 'MIXED' ? 0 : 1));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [participantId, setParticipantId] = useState<number | null>(() => {
    const child = initialParticipants.find((p) => p.participantType === 'CHILD');
    const adult = initialParticipants.find((p) => p.participantType === 'ADULT');
    return child?.id ?? adult?.id ?? null;
  });
  const [profile, setProfile] = useState<ParticipantFormValues>(() => {
    const p = initialParticipants.find((x) => x.participantType === 'ADULT') ?? initialParticipants[0];
    if (!p) return emptyProfile(userEmail);
    return {
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      displayName: p.displayName || '',
      dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
      currentGrade: p.currentGrade != null ? String(p.currentGrade) : '',
      schoolName: p.schoolName || '',
      phone: p.phone || '',
      email: p.email || userEmail || '',
    };
  });
  const [selected, setSelected] = useState<Record<number, number>>(() => {
    if (!preselectedCompetitionId) return {};
    const comp = competitions.find((c) => c.id === preselectedCompetitionId);
    if (!comp) return {};
    return { [preselectedCompetitionId]: Number(comp.feeAmount) || 0 };
  });
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [registrationsCreated, setRegistrationsCreated] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [teamCompetitionId, setTeamCompetitionId] = useState<number | null>(null);

  const audienceMode: CompetitionAudienceMode = settings.audienceMode;
  const selectedIds = Object.keys(selected).map((k) => parseInt(k, 10));
  const showActorStep = settings.registrationMode === 'MIXED' || audienceMode === 'MIXED';

  const activeParticipant = useMemo(
    () => participants.find((p) => p.id === participantId) ?? null,
    [participants, participantId]
  );

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/events/${eventId}/competitions/my-registrations?payment=success`;
  }, [eventId]);

  useEffect(() => {
    if (actorMode === 'SELF') {
      const adult = participants.find((p) => p.participantType === 'ADULT');
      if (adult?.id) setParticipantId(adult.id);
    } else if (actorMode === 'PARENT') {
      const child = participants.find((p) => p.participantType === 'CHILD');
      if (child?.id) setParticipantId(child.id);
    }
  }, [actorMode, participants]);

  const toggleCompetition = (competitionId: number, feeAmount: number) => {
    const comp = competitions.find((c) => c.id === competitionId);
    if (comp?.competitionType === 'GROUP' && actorMode === 'TEAM_CAPTAIN') {
      setTeamCompetitionId(competitionId);
      setSelected({ [competitionId]: feeAmount });
      return;
    }
    setSelected((prev) => {
      const next = { ...prev };
      if (next[competitionId] != null) delete next[competitionId];
      else next[competitionId] = feeAmount;
      return next;
    });
  };

  const participantTypeForActor = (): 'CHILD' | 'ADULT' | 'TEAM_MEMBER' => {
    if (actorMode === 'PARENT') return 'CHILD';
    if (actorMode === 'TEAM_CAPTAIN') return 'ADULT';
    if (audienceMode === 'YOUTH') return 'CHILD';
    return 'ADULT';
  };

  const upsertParticipant = async (
    values: ParticipantFormValues,
    type: 'CHILD' | 'ADULT' | 'TEAM_MEMBER',
    existingId?: number | null
  ): Promise<number | null> => {
    const payload = {
      participantType: type,
      clerkUserId,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      displayName: values.displayName.trim() || `${values.firstName} ${values.lastName}`.trim(),
      dateOfBirth: values.dateOfBirth || null,
      currentGrade: values.currentGrade ? parseInt(values.currentGrade, 10) : null,
      schoolName: values.schoolName || '',
      phone: values.phone || '',
      email: values.email || userEmail || '',
      isActive: true,
    };
    if (existingId) {
      const updated = await patchParticipantServer(existingId, payload);
      setParticipants((prev) => prev.map((p) => (p.id === existingId ? updated : p)));
      return existingId;
    }
    const created = await createParticipantServer(payload);
    if (created.id) setParticipants((prev) => [...prev, created]);
    return created.id ?? null;
  };

  const saveProfile = () => {
    startTransition(async () => {
      try {
        setError(null);
        const pid = await upsertParticipant(profile, participantTypeForActor(), participantId);
        if (!pid) throw new Error('Could not save participant profile');
        setParticipantId(pid);
        setStep(catalogStep);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save profile');
      }
    });
  };

  const createChildParticipant = async (values: ParticipantFormValues) => {
    const id = await upsertParticipant(values, 'CHILD');
    if (id) setParticipantId(id);
    return id;
  };

  const createRegistrations = () => {
    if (selectedIds.length === 0) return;

    const teamCompId = teamCompetitionId ?? selectedIds.find((id) => {
      const c = competitions.find((x) => x.id === id);
      return c?.competitionType === 'GROUP';
    });

    if (actorMode === 'TEAM_CAPTAIN' && teamCompId) {
      if (!captainId) {
        setError('Select a team captain.');
        return;
      }
      const comp = competitions.find((c) => c.id === teamCompId);
      const minSize = comp?.minGroupSize ?? 1;
      const rosterIds = roster.filter((m) => m.participantId).map((m) => m.participantId!);
      if (1 + rosterIds.length < minSize) {
        setError(`Team must have at least ${minSize} members including captain.`);
        return;
      }
      if (comp?.requiresTeamName && !teamName.trim()) {
        setError('Team name is required.');
        return;
      }

      startTransition(async () => {
        try {
          setError(null);
          const memberIds: number[] = [];
          for (const member of roster) {
            if (member.participantId) {
              memberIds.push(member.participantId);
            } else if (member.profile.firstName.trim()) {
              const mid = await upsertParticipant(member.profile, 'TEAM_MEMBER');
              if (mid) memberIds.push(mid);
            }
          }
          const fee = selected[teamCompId] ?? Number(comp?.feeAmount) ?? 0;
          const reg = await createTeamRegistrationServer(eventId, {
            competitionId: teamCompId,
            captainParticipantId: captainId,
            memberParticipantIds: memberIds,
            feeAmount: fee,
            teamName: teamName.trim(),
            teamDisplayName: teamName.trim(),
            effectiveCategory: comp?.categoryCode || comp?.divisionLabel || '',
          });
          setCartLines([{ competitionId: teamCompId, feeAmount: fee, registrationId: reg.id ?? undefined }]);
          setRegistrationsCreated(true);
          setStep(paymentStep);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'Failed to create team registration');
        }
      });
      return;
    }

    if (!participantId) return;

    startTransition(async () => {
      try {
        setError(null);
        const individualIds = selectedIds.filter((id) => {
          const c = competitions.find((x) => x.id === id);
          return c?.competitionType !== 'GROUP';
        });

        if (individualIds.length > 1) {
          const bulkPayload = individualIds.map((compId) => {
            const comp = competitions.find((c) => c.id === compId);
            const fee = selected[compId] ?? Number(comp?.feeAmount) ?? 0;
            return {
              competitionId: compId,
              participantProfileId: participantId,
              feeAmount: fee,
              effectiveCategory: comp?.categoryCode || comp?.divisionLabel || '',
            };
          });
          const regs = await createBulkRegistrationsServer(eventId, bulkPayload);
          setCartLines(
            regs.map((reg, i) => ({
              competitionId: individualIds[i],
              feeAmount: bulkPayload[i].feeAmount,
              registrationId: reg.id ?? undefined,
            }))
          );
        } else if (individualIds.length === 1) {
          const compId = individualIds[0];
          const comp = competitions.find((c) => c.id === compId);
          const fee = selected[compId] ?? Number(comp?.feeAmount) ?? 0;
          const reg = await createRegistrationServer(eventId, {
            competitionId: compId,
            participantProfileId: participantId,
            feeAmount: fee,
            effectiveCategory: comp?.categoryCode || comp?.divisionLabel || '',
          });
          setCartLines([{ competitionId: compId, feeAmount: fee, registrationId: reg.id ?? undefined }]);
        } else {
          throw new Error('No individual competitions selected.');
        }

        setRegistrationsCreated(true);
        setStep(paymentStep);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create registrations');
      }
    });
  };

  const actorStep = 0;
  const profileStep = 1;
  const catalogStep = 2;
  const paymentStep = 3;

  if (!settings.registrationOpen) {
    return (
      <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
        Registration is currently closed for this event.
      </div>
    );
  }

  const stepLabels = showActorStep
    ? ['Who', 'Profile', 'Competitions', 'Payment']
    : ['Profile', 'Competitions', 'Payment'];

  const displayStepIndex = showActorStep ? step : step - 1;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2 text-sm">
        {stepLabels.map((label, i) => {
          const active = displayStepIndex === i;
          return (
            <span
              key={label}
              className={`px-3 py-1 rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {label}
            </span>
          );
        })}
      </div>

      {showActorStep && step === actorStep && (
        <>
          <RegistrationActorStep
            registrationMode={settings.registrationMode}
            audienceMode={audienceMode}
            value={actorMode}
            onChange={(mode) => {
              setActorMode(mode);
              setSelected({});
              setTeamCompetitionId(null);
            }}
          />
          <button
            type="button"
            onClick={() => setStep(profileStep)}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Continue
          </button>
        </>
      )}

      {step === profileStep && (
        <div className="bg-card rounded-lg sacred-shadow p-6 space-y-4">
          {actorMode === 'PARENT' ? (
            <ChildParticipantManager
              participants={participants}
              selectedId={participantId}
              onSelect={setParticipantId}
              onCreate={createChildParticipant}
              userEmail={userEmail}
            />
          ) : (
            <>
              <h2 className="font-heading font-semibold text-xl">
                {actorMode === 'TEAM_CAPTAIN' ? 'Captain profile' : 'Your profile'}
              </h2>
              <ParticipantProfileForm
                audienceMode={actorMode === 'SELF' ? 'ADULT' : audienceMode}
                values={profile}
                onChange={setProfile}
              />
            </>
          )}
          <div className="flex gap-3">
            {showActorStep && (
              <button type="button" onClick={() => setStep(actorStep)} className="px-4 py-2 border rounded-xl">
                Back
              </button>
            )}
            <button
              type="button"
              disabled={
                isPending ||
                (actorMode === 'PARENT' ? !participantId : !profile.firstName.trim() || !profile.lastName.trim())
              }
              onClick={() => {
                if (actorMode === 'PARENT' && participantId) {
                  setStep(catalogStep);
                } else {
                  saveProfile();
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Continue to competitions
            </button>
          </div>
        </div>
      )}

      {step === catalogStep && (
        <div className="space-y-4">
          {actorMode === 'TEAM_CAPTAIN' && teamCompetitionId ? (
            <TeamRosterForm
              competition={competitions.find((c) => c.id === teamCompetitionId)!}
              existingParticipants={participants}
              captainId={captainId}
              onCaptainChange={setCaptainId}
              onCreateParticipant={(values, type) => upsertParticipant(values, type)}
              teamName={teamName}
              onTeamNameChange={setTeamName}
              roster={roster}
              onRosterChange={setRoster}
              userEmail={userEmail}
            />
          ) : (
            <CompetitionCatalog
              competitions={
                actorMode === 'TEAM_CAPTAIN'
                  ? competitions.filter((c) => c.competitionType === 'GROUP')
                  : competitions.filter((c) => c.competitionType !== 'GROUP' || actorMode !== 'PARENT')
              }
              days={days}
              selectedIds={selectedIds}
              onToggle={toggleCompetition}
              activeParticipant={activeParticipant}
              eventId={eventId}
            />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(profileStep)} className="px-4 py-2 border rounded-xl">
              Back
            </button>
            <button
              type="button"
              disabled={isPending || selectedIds.length === 0}
              onClick={createRegistrations}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {step === paymentStep && registrationsCreated && (
        <div className="space-y-4">
          <RegistrationCart
            eventId={eventId}
            lines={cartLines}
            competitions={competitions}
            email={profile.email || userEmail}
            returnUrl={returnUrl}
            showCheckout
          />
          <button
            type="button"
            onClick={() => router.push(`/events/${eventId}/competitions/my-registrations`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View my registrations later
          </button>
        </div>
      )}
    </div>
  );
}
