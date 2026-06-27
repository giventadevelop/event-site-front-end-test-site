'use client';

import type { CompetitionAudienceMode, EventCompetitionParticipantDTO } from '@/types';

export type ParticipantFormValues = {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  currentGrade: string;
  schoolName: string;
  phone: string;
  email: string;
};

interface Props {
  audienceMode: CompetitionAudienceMode;
  initial?: EventCompetitionParticipantDTO | null;
  values: ParticipantFormValues;
  onChange: (values: ParticipantFormValues) => void;
}

export default function ParticipantProfileForm({ audienceMode, values, onChange }: Props) {
  const isYouth = audienceMode === 'YOUTH' || audienceMode === 'MIXED';

  const set = (field: keyof ParticipantFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">First name *</label>
        <input
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={values.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last name *</label>
        <input
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={values.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Display name</label>
        <input
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={values.displayName}
          onChange={(e) => set('displayName', e.target.value)}
        />
      </div>
      {isYouth && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of birth</label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
              value={values.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current grade</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
              value={values.currentGrade}
              onChange={(e) => set('currentGrade', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">School</label>
            <input
              className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
              value={values.schoolName}
              onChange={(e) => set('schoolName', e.target.value)}
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>
    </div>
  );
}
