'use client';

import { useState } from 'react';
import type { EventCompetitionDTO, EventCompetitionParticipantDTO } from '@/types';
import ParticipantProfileForm, { type ParticipantFormValues } from './ParticipantProfileForm';

interface RosterMember {
  participantId?: number;
  profile: ParticipantFormValues;
  isNew: boolean;
}

interface Props {
  competition: EventCompetitionDTO;
  existingParticipants: EventCompetitionParticipantDTO[];
  captainId: number | null;
  onCaptainChange: (id: number) => void;
  onCreateParticipant: (values: ParticipantFormValues, type: 'ADULT' | 'CHILD' | 'TEAM_MEMBER') => Promise<number | null>;
  teamName: string;
  onTeamNameChange: (name: string) => void;
  roster: RosterMember[];
  onRosterChange: (roster: RosterMember[]) => void;
  userEmail?: string;
}

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

export default function TeamRosterForm({
  competition,
  existingParticipants,
  captainId,
  onCaptainChange,
  onCreateParticipant,
  teamName,
  onTeamNameChange,
  roster,
  onRosterChange,
  userEmail,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const minSize = competition.minGroupSize ?? 1;
  const maxSize = competition.maxGroupSize ?? 20;
  const teamMembers = existingParticipants.filter((p) => p.participantType === 'TEAM_MEMBER' || p.participantType === 'CHILD');

  const addMemberSlot = () => {
    if (roster.length >= maxSize - 1) return;
    onRosterChange([...roster, { profile: emptyProfile(userEmail), isNew: true }]);
  };

  const selectExistingMember = (participantId: number, index: number) => {
    const p = existingParticipants.find((x) => x.id === participantId);
    if (!p) return;
    const next = [...roster];
    next[index] = {
      participantId,
      isNew: false,
      profile: {
        firstName: p.firstName,
        lastName: p.lastName,
        displayName: p.displayName || '',
        dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
        currentGrade: p.currentGrade != null ? String(p.currentGrade) : '',
        schoolName: p.schoolName || '',
        phone: p.phone || '',
        email: p.email || userEmail || '',
      },
    };
    onRosterChange(next);
  };

  return (
    <div className="space-y-4 bg-card rounded-lg sacred-shadow p-6">
      <h3 className="font-heading font-semibold text-lg">Team registration — {competition.name}</h3>
      <p className="text-sm text-muted-foreground">
        Team size: {minSize}–{maxSize} members (including captain)
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {(competition.requiresTeamName ?? competition.competitionType === 'GROUP') && (
        <div>
          <label className="block text-sm font-medium mb-1">Team name *</label>
          <input
            required
            className="w-full border border-gray-400 rounded-xl px-4 py-3"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Team display name"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Team captain</label>
        <select
          className="w-full border border-gray-400 rounded-xl px-4 py-3"
          value={captainId ?? ''}
          onChange={(e) => onCaptainChange(parseInt(e.target.value, 10))}
        >
          <option value="">Select captain...</option>
          {existingParticipants
            .filter((p) => p.participantType === 'ADULT' || p.participantType === 'CHILD')
            .map((p) => (
              <option key={p.id} value={p.id ?? ''}>
                {p.displayName || `${p.firstName} ${p.lastName}`}
              </option>
            ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Team roster (excluding captain)</label>
          <button
            type="button"
            onClick={addMemberSlot}
            disabled={roster.length >= maxSize - 1}
            className="text-sm text-primary font-semibold disabled:opacity-50"
          >
            + Add member
          </button>
        </div>
        {roster.map((member, idx) => (
          <div key={idx} className="border border-border rounded-lg p-3 mb-3 space-y-2">
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={member.participantId ?? ''}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                if (id) selectExistingMember(id, idx);
              }}
            >
              <option value="">New or select existing...</option>
              {teamMembers.map((p) => (
                <option key={p.id} value={p.id ?? ''}>
                  {p.displayName || `${p.firstName} ${p.lastName}`}
                </option>
              ))}
            </select>
            {!member.participantId && (
              <ParticipantProfileForm
                audienceMode="YOUTH"
                values={member.profile}
                onChange={(values) => {
                  const next = [...roster];
                  next[idx] = { ...next[idx], profile: values, isNew: true };
                  onRosterChange(next);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Total with captain: {(captainId ? 1 : 0) + roster.filter((m) => m.participantId || m.profile.firstName).length}{' '}
        / {maxSize}
      </p>
    </div>
  );
}

export type { RosterMember };
