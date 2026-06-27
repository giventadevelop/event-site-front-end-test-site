'use client';

import { useState, useTransition } from 'react';
import type { EventCompetitionSettingsDTO, CompetitionAudienceMode, CompetitionRegistrationMode, CompetitionResultsDisplayMode } from '@/types';
import {
  createCompetitionSettingsServer,
  patchCompetitionSettingsServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';

const defaultSettings: Omit<EventCompetitionSettingsDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'> = {
  audienceMode: 'MIXED',
  registrationMode: 'MIXED',
  registrationOpen: true,
  allowTicketSales: false,
  pointsFirst: 10,
  pointsSecond: 7,
  pointsThird: 5,
  pointsFourth: 0,
  defaultMaxPlacements: 3,
  championEnabled: false,
  championExcludeGroupPoints: false,
  registrationDeadline: null,
  championMaxCategory: null,
  resultsDisplayMode: 'FULL_NAME',
  eligibilityText: '',
};

interface Props {
  eventId: string;
  initialSettings: EventCompetitionSettingsDTO | null;
}

export default function EventCompetitionSettingsForm({ eventId, initialSettings }: Props) {
  const [form, setForm] = useState({ ...defaultSettings, ...initialSettings });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        setSuccess(null);
        if (initialSettings?.id) {
          await patchCompetitionSettingsServer(initialSettings.id, eventId, form);
          setSuccess('Settings updated.');
        } else {
          await createCompetitionSettingsServer(eventId, form);
          setSuccess('Settings created.');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Save failed');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-900">Competition settings</h2>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Audience mode</span>
          <select
            className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
            value={form.audienceMode}
            onChange={(e) => setForm((f) => ({ ...f, audienceMode: e.target.value as CompetitionAudienceMode }))}
          >
            <option value="YOUTH">Youth</option>
            <option value="ADULT">Adult</option>
            <option value="MIXED">Mixed</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Registration mode</span>
          <select
            className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
            value={form.registrationMode}
            onChange={(e) => setForm((f) => ({ ...f, registrationMode: e.target.value as CompetitionRegistrationMode }))}
          >
            <option value="PARENT_CHILD">Parent / child</option>
            <option value="SELF">Self</option>
            <option value="TEAM_CAPTAIN">Team captain</option>
            <option value="MIXED">Mixed</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Results display</span>
          <select
            className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
            value={form.resultsDisplayMode ?? 'FULL_NAME'}
            onChange={(e) =>
              setForm((f) => ({ ...f, resultsDisplayMode: e.target.value as CompetitionResultsDisplayMode }))
            }
          >
            <option value="FULL_NAME">Full name</option>
            <option value="INITIALS">Initials</option>
            <option value="ANONYMOUS">Anonymous</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Registration deadline</span>
          <input
            type="datetime-local"
            className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
            value={form.registrationDeadline ? form.registrationDeadline.slice(0, 16) : ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                registrationDeadline: e.target.value ? new Date(e.target.value).toISOString() : null,
              }))
            }
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        {[
          { key: 'registrationOpen', label: 'Registration open' },
          { key: 'allowTicketSales', label: 'Allow ticket sales' },
          { key: 'championEnabled', label: 'Champion enabled' },
          { key: 'championExcludeGroupPoints', label: 'Champion excludes group points' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!(form as Record<string, boolean>)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['pointsFirst', 'pointsSecond', 'pointsThird', 'pointsFourth'] as const).map((field, i) => (
          <label key={field} className="block">
            <span className="text-sm font-medium text-gray-700">{['1st', '2nd', '3rd', '4th'][i]} place points</span>
            <input
              type="number"
              min={0}
              className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
              value={form[field] ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, [field]: parseInt(e.target.value, 10) || 0 }))}
            />
          </label>
        ))}
      </div>

      <label className="block max-w-xs">
        <span className="text-sm font-medium text-gray-700">Default max placements (new competitions)</span>
        <input
          type="number"
          min={1}
          max={10}
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={form.defaultMaxPlacements ?? 3}
          onChange={(e) => setForm((f) => ({ ...f, defaultMaxPlacements: parseInt(e.target.value, 10) || 3 }))}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Eligibility text</span>
        <textarea
          rows={4}
          className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          value={form.eligibilityText ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, eligibilityText: e.target.value }))}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save settings'}
      </button>
    </form>
  );
}
