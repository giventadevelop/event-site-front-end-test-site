'use client';

import { useState } from 'react';
import type { EventCompetitionParticipantDTO } from '@/types';
import ParticipantProfileForm, { type ParticipantFormValues } from './ParticipantProfileForm';

interface Props {
  participants: EventCompetitionParticipantDTO[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (values: ParticipantFormValues) => Promise<number | null>;
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

export default function ChildParticipantManager({
  participants,
  selectedId,
  onSelect,
  onCreate,
  userEmail,
}: Props) {
  const children = participants.filter((p) => p.participantType === 'CHILD');
  const [showAdd, setShowAdd] = useState(children.length === 0);
  const [newProfile, setNewProfile] = useState<ParticipantFormValues>(() => emptyProfile(userEmail));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = await onCreate(newProfile);
      if (id) {
        onSelect(id);
        setShowAdd(false);
        setNewProfile(emptyProfile(userEmail));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add child');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-lg">Select participant</h3>
      {children.length > 0 && (
        <ul className="space-y-2">
          {children.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                onClick={() => onSelect(child.id!)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedId === child.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span className="font-semibold">
                  {child.displayName || `${child.firstName} ${child.lastName}`}
                </span>
                {child.currentGrade != null && (
                  <span className="text-sm text-muted-foreground ml-2">Grade {child.currentGrade}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!showAdd && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="text-sm text-primary font-semibold hover:underline"
        >
          + Add another child
        </button>
      )}
      {showAdd && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <p className="font-medium">{children.length === 0 ? 'Add child profile' : 'Add another child'}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <ParticipantProfileForm audienceMode="YOUTH" values={newProfile} onChange={setNewProfile} />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || !newProfile.firstName.trim() || !newProfile.lastName.trim()}
              onClick={handleAdd}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save child'}
            </button>
            {children.length > 0 && (
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
