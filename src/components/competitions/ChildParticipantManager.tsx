'use client';

import { useMemo, useState } from 'react';
import type { EventCompetitionParticipantDTO } from '@/types';
import ParticipantProfileForm, {
  isYouthParticipantFormValid,
  type ParticipantFormValues,
} from './ParticipantProfileForm';

interface Props {
  participants: EventCompetitionParticipantDTO[];
  selectedId: number | null;
  sessionIds: number[];
  onSelect: (id: number) => void;
  onSessionIdsChange: (ids: number[]) => void;
  onCreate: (values: ParticipantFormValues) => Promise<number | null>;
}

const emptyProfile = (): ParticipantFormValues => ({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  currentGrade: '',
  schoolName: '',
  phone: '',
  email: '',
});

function formatDob(iso?: string | null): string {
  if (!iso) return '';
  const day = iso.split('T')[0];
  if (!day) return '';
  try {
    return new Date(`${day}T00:00:00`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return day;
  }
}

function sameId(a: number | string | null | undefined, b: number | string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
}

export default function ChildParticipantManager({
  participants,
  selectedId,
  sessionIds,
  onSelect,
  onSessionIdsChange,
  onCreate,
}: Props) {
  const [addingAnother, setAddingAnother] = useState(false);
  const [newProfile, setNewProfile] = useState<ParticipantFormValues>(() => emptyProfile());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionChildren = useMemo(() => {
    const byId = new Map<number, EventCompetitionParticipantDTO>();
    for (const p of participants) {
      if (p.id == null) continue;
      byId.set(Number(p.id), p);
    }
    return sessionIds
      .map((id) => byId.get(Number(id)))
      .filter((p): p is EventCompetitionParticipantDTO => p != null);
  }, [participants, sessionIds]);

  const hasSaved = sessionChildren.length > 0;
  const showForm = !hasSaved || addingAnother;
  const canSave = isYouthParticipantFormValid(newProfile);

  const handleAdd = async () => {
    if (!canSave) {
      setError('Please fill in first name, last name, date of birth, phone, and a valid email.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const id = await onCreate(newProfile);
      if (id != null) {
        const numericId = Number(id);
        onSelect(numericId);
        if (!sessionIds.some((sid) => sameId(sid, numericId))) {
          onSessionIdsChange([...sessionIds, numericId]);
        }
        setAddingAnother(false);
        setNewProfile(emptyProfile());
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add child');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-lg">Participant profile</h3>

      {hasSaved && (
        <ul className="space-y-2">
          {sessionChildren.map((child) => {
            const isSelected = sameId(selectedId, child.id);
            const name = child.displayName || `${child.firstName} ${child.lastName}`.trim();
            return (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => child.id != null && onSelect(Number(child.id))}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors flex flex-wrap items-center gap-x-4 gap-y-1 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="font-semibold text-foreground">{name}</span>
                  {child.dateOfBirth && (
                    <span className="text-sm text-muted-foreground">
                      DOB {formatDob(child.dateOfBirth)}
                    </span>
                  )}
                  {child.phone && (
                    <span className="text-sm text-muted-foreground">{child.phone}</span>
                  )}
                  {child.email && (
                    <span className="text-sm text-muted-foreground">{child.email}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showForm && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <p className="font-medium">Enter participant details</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <ParticipantProfileForm
            audienceMode="YOUTH"
            values={newProfile}
            onChange={setNewProfile}
            requireYouthContactFields
          />
          <button
            type="button"
            disabled={saving || !canSave}
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save participant'}
          </button>
        </div>
      )}

      {hasSaved && !addingAnother && (
        <button
          type="button"
          onClick={() => {
            setAddingAnother(true);
            setError(null);
            setNewProfile(emptyProfile());
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add another participant
        </button>
      )}
    </div>
  );
}
