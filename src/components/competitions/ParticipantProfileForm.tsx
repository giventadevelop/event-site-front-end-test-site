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
  /** When true (child registration), require DOB, phone, and email. */
  requireYouthContactFields?: boolean;
}

export default function ParticipantProfileForm({
  audienceMode,
  values,
  onChange,
  requireYouthContactFields = false,
}: Props) {
  const isYouth = audienceMode === 'YOUTH' || audienceMode === 'MIXED';
  const requireContact = requireYouthContactFields || isYouth;

  const set = (field: keyof ParticipantFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const inputClass = 'mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">First name *</label>
        <input
          name="comp-reg-first-name"
          autoComplete="off"
          className={inputClass}
          value={values.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last name *</label>
        <input
          name="comp-reg-last-name"
          autoComplete="off"
          className={inputClass}
          value={values.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Display name</label>
        <input
          name="comp-reg-display-name"
          autoComplete="off"
          className={inputClass}
          value={values.displayName}
          onChange={(e) => set('displayName', e.target.value)}
        />
      </div>
      {isYouth && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of birth{requireContact ? ' *' : ''}
            </label>
            <input
              type="date"
              name="comp-reg-dob"
              autoComplete="off"
              className={inputClass}
              value={values.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              required={requireContact}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current grade</label>
            <input
              type="number"
              name="comp-reg-grade"
              autoComplete="off"
              className={inputClass}
              value={values.currentGrade}
              onChange={(e) => set('currentGrade', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">School</label>
            <input
              name="comp-reg-school"
              autoComplete="off"
              className={inputClass}
              value={values.schoolName}
              onChange={(e) => set('schoolName', e.target.value)}
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone{requireContact ? ' *' : ''}
        </label>
        <input
          type="tel"
          name="comp-reg-phone"
          autoComplete="off"
          className={inputClass}
          value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
          required={requireContact}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email{requireContact ? ' *' : ''}
        </label>
        <input
          type="email"
          name="comp-reg-email"
          autoComplete="off"
          className={inputClass}
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          required={requireContact}
        />
      </div>
    </div>
  );
}

export function isYouthParticipantFormValid(values: ParticipantFormValues): boolean {
  if (!values.firstName.trim() || !values.lastName.trim()) return false;
  if (!values.dateOfBirth.trim()) return false;
  if (!values.phone.trim()) return false;
  const email = values.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return true;
}
