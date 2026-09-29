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
import { checkParticipantEligibility } from '@/lib/competitionEligibility';

interface Props {
  eventId: string;
  settings: EventCompetitionSettingsDTO;
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  clerkUserId: string;
  existingParticipants: EventCompetitionParticipantDTO[];
  userEmail?: string;
  preselectedCompetitionId?: number;
  initialStep?: string;
}

type CartLine = { competitionId: number; feeAmount: number; registrationId?: number };

type RegisterDraft = {
  participantId: number | null;
  childSessionIds: number[];
  sessionParticipants: EventCompetitionParticipantDTO[];
  actorMode: RegistrationActorMode;
};

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

function draftStorageKey(eventId: string) {
  return `competition-register-draft:${eventId}`;
}

function readRegisterDraft(eventId: string): RegisterDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(draftStorageKey(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegisterDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      participantId: parsed.participantId != null ? Number(parsed.participantId) : null,
      childSessionIds: Array.isArray(parsed.childSessionIds)
        ? parsed.childSessionIds.map(Number).filter((n) => !Number.isNaN(n))
        : [],
      sessionParticipants: Array.isArray(parsed.sessionParticipants) ? parsed.sessionParticipants : [],
      actorMode: parsed.actorMode,
    };
  } catch {
    return null;
  }
}

function writeRegisterDraft(eventId: string, draft: RegisterDraft) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(draftStorageKey(eventId), JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

function clearRegisterDraft(eventId: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(draftStorageKey(eventId));
  } catch {
    // ignore
  }
}

function defaultActorMode(settings: EventCompetitionSettingsDTO): RegistrationActorMode {
  if (settings.registrationMode === 'MIXED' || settings.audienceMode === 'MIXED') return 'PARENT';
  if (settings.audienceMode === 'ADULT') return 'SELF';
  return 'PARENT';
}

const ACTOR_STEP = 0;
const PROFILE_STEP = 1;
const CATALOG_STEP = 2;
const PAYMENT_STEP = 3;

function resolveInitialStep(
  settings: EventCompetitionSettingsDTO,
  initialStep?: string
): number {
  if (initialStep === 'competitions') return CATALOG_STEP;
  if (initialStep === 'profile') return PROFILE_STEP;
  if (initialStep === 'who') return ACTOR_STEP;
  if (initialStep === 'payment') return PAYMENT_STEP;
  return settings.registrationMode === 'MIXED' || settings.audienceMode === 'MIXED'
    ? ACTOR_STEP
    : PROFILE_STEP;
}

function mergeParticipants(
  base: EventCompetitionParticipantDTO[],
  extras: EventCompetitionParticipantDTO[]
): EventCompetitionParticipantDTO[] {
  const map = new Map<number, EventCompetitionParticipantDTO>();
  for (const p of [...base, ...extras]) {
    if (p.id == null) continue;
    map.set(Number(p.id), p);
  }
  return Array.from(map.values());
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
  initialStep,
}: Props) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [actorMode, setActorMode] = useState<RegistrationActorMode>(() => defaultActorMode(settings));
  const [step, setStep] = useState(() => resolveInitialStep(settings, initialStep));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [childSessionIds, setChildSessionIds] = useState<number[]>([]);
  const [profile, setProfile] = useState<ParticipantFormValues>(() => emptyProfile());
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
  const [draftReady, setDraftReady] = useState(false);

  const audienceMode: CompetitionAudienceMode = settings.audienceMode;
  const selectedIds = Object.keys(selected).map((k) => parseInt(k, 10));
  const showActorStep = settings.registrationMode === 'MIXED' || audienceMode === 'MIXED';

  useEffect(() => {
    const draft = readRegisterDraft(eventId);
    if (draft) {
      if (draft.actorMode) setActorMode(draft.actorMode);
      if (draft.participantId != null) setParticipantId(draft.participantId);
      if (draft.childSessionIds.length > 0) setChildSessionIds(draft.childSessionIds);
      if (draft.sessionParticipants.length > 0) {
        setParticipants((prev) => mergeParticipants(prev, draft.sessionParticipants));
      }
    }
    setDraftReady(true);
  }, [eventId]);

  useEffect(() => {
    if (!draftReady) return;
    const sessionParticipants = participants.filter(
      (p) => p.id != null && childSessionIds.includes(Number(p.id))
    );
    writeRegisterDraft(eventId, {
      participantId,
      childSessionIds,
      sessionParticipants,
      actorMode,
    });
  }, [draftReady, eventId, participantId, childSessionIds, participants, actorMode]);

  const activeParticipant = useMemo(
    () => participants.find((p) => p.id != null && Number(p.id) === Number(participantId)) ?? null,
    [participants, participantId]
  );

  const hasEligibleSelection = useMemo(() => {
    return selectedIds.some((id) => {
      const comp = competitions.find((c) => c.id === id);
      if (!comp) return false;
      if (!activeParticipant) return actorMode === 'TEAM_CAPTAIN';
      return checkParticipantEligibility(comp, activeParticipant).eligible;
    });
  }, [selectedIds, competitions, activeParticipant, actorMode]);

  const selectedTotalFee = useMemo(
    () => selectedIds.reduce((sum, id) => sum + (Number(selected[id]) || 0), 0),
    [selectedIds, selected]
  );
  const requiresPayment = selectedTotalFee > 0;

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/events/${eventId}/competitions/my-registrations?payment=success`;
  }, [eventId]);

  const resetProfileForm = () => {
    setParticipantId(null);
    setChildSessionIds([]);
    setProfile(emptyProfile());
    clearRegisterDraft(eventId);
  };

  const toggleCompetition = (competitionId: number, feeAmount: number) => {
    const comp = competitions.find((c) => c.id === competitionId);
    if (!comp) return;

    if (activeParticipant) {
      const { eligible } = checkParticipantEligibility(comp, activeParticipant);
      if (!eligible) {
        setSelected((prev) => {
          if (prev[competitionId] == null) return prev;
          const next = { ...prev };
          delete next[competitionId];
          return next;
        });
        return;
      }
    }

    if (comp.competitionType === 'GROUP' && actorMode === 'TEAM_CAPTAIN') {
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
    if (created.id != null) {
      const id = Number(created.id);
      setParticipants((prev) => mergeParticipants(prev, [{ ...created, id }]));
      return id;
    }
    return null;
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
    if (id != null) {
      setParticipantId(id);
      setChildSessionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
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
          if (fee > 0) {
            setStep(paymentStep);
          } else {
            clearRegisterDraft(eventId);
            router.push(`/events/${eventId}/competitions/my-registrations`);
          }
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

        let totalFee = 0;

        if (individualIds.length > 1) {
          const bulkPayload = individualIds.map((compId) => {
            const comp = competitions.find((c) => c.id === compId);
            const fee = selected[compId] ?? Number(comp?.feeAmount) ?? 0;
            totalFee += fee;
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
          totalFee = fee;
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
        if (totalFee > 0) {
          setStep(paymentStep);
        } else {
          clearRegisterDraft(eventId);
          router.push(`/events/${eventId}/competitions/my-registrations`);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create registrations');
      }
    });
  };

  const actorStep = ACTOR_STEP;
  const profileStep = PROFILE_STEP;
  const catalogStep = CATALOG_STEP;
  const paymentStep = PAYMENT_STEP;

  if (!settings.registrationOpen) {
    return (
      <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
        Registration is currently closed for this event.
      </div>
    );
  }

  const wizardSteps = [
    ...(showActorStep ? [{ label: 'Who', step: actorStep }] : []),
    { label: 'Profile', step: profileStep },
    { label: 'Competitions', step: catalogStep },
    ...(requiresPayment || (registrationsCreated && cartLines.some((l) => l.feeAmount > 0))
      ? [{ label: 'Payment', step: paymentStep }]
      : []),
  ];

  const isStepClickable = (targetStep: number): boolean => {
    if (targetStep === step) return false;
    if (targetStep < step) return true;
    return targetStep === paymentStep && registrationsCreated;
  };

  const navigateToStep = (targetStep: number) => {
    if (!isStepClickable(targetStep)) return;
    setStep(targetStep);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2 text-sm">
        {wizardSteps.map(({ label, step: stepValue }) => {
          const active = step === stepValue;
          const clickable = isStepClickable(stepValue);
          const tagClass = active
            ? 'bg-primary text-primary-foreground'
            : clickable
              ? 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary cursor-pointer'
              : 'bg-muted text-muted-foreground';

          if (clickable) {
            return (
              <button
                key={label}
                type="button"
                onClick={() => navigateToStep(stepValue)}
                className={`px-3 py-1 rounded-full reverent-transition ${tagClass}`}
                aria-label={`Go to ${label} step`}
                aria-current={active ? 'step' : undefined}
              >
                {label}
              </button>
            );
          }

          return (
            <span
              key={label}
              className={`px-3 py-1 rounded-full ${tagClass}`}
              aria-current={active ? 'step' : undefined}
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
              resetProfileForm();
              setSelected({});
              setTeamCompetitionId(null);
            }}
          />
          <button
            type="button"
            onClick={() => setStep(profileStep)}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover"
          >
            Continue
          </button>
        </>
      )}

      {/* Keep profile panel mounted so saved child rows survive Back from Competitions */}
      <div
        className={`bg-card rounded-lg sacred-shadow p-6 space-y-4 ${
          step === profileStep ? '' : 'hidden'
        }`}
        aria-hidden={step !== profileStep}
      >
        {actorMode === 'PARENT' ? (
          <ChildParticipantManager
            participants={participants}
            selectedId={participantId}
            sessionIds={childSessionIds}
            onSelect={setParticipantId}
            onSessionIdsChange={setChildSessionIds}
            onCreate={createChildParticipant}
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
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to competitions
          </button>
        </div>
      </div>

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
              disabled={isPending || !hasEligibleSelection}
              onClick={createRegistrations}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl reverent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? requiresPayment
                  ? 'Creating...'
                  : 'Confirming...'
                : requiresPayment
                  ? 'Continue to payment'
                  : 'Confirm Registration'}
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
            className="text-sm text-primary hover:underline font-semibold"
          >
            View my registrations later
          </button>
        </div>
      )}
    </div>
  );
}
