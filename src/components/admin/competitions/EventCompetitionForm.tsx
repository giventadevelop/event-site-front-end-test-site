'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  CompetitionType,
  CompetitionEligibleAudience,
  CompetitionDisciplineCode,
} from '@/types';
import {
  createCompetitionServer,
  patchCompetitionServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';

interface Props {
  eventId: string;
  days: EventCompetitionDayDTO[];
  competition?: EventCompetitionDTO | null;
}

const defaults: Omit<EventCompetitionDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'> = {
  name: '',
  description: '',
  competitionType: 'INDIVIDUAL',
  eligibleAudience: 'ALL',
  categoryCode: '',
  divisionLabel: '',
  track: '',
  feeAmount: 0,
  maxParticipants: null,
  minGroupSize: null,
  maxGroupSize: null,
  timeLimitMinutes: null,
  requiresSoundtrack: false,
  judgmentCriteriaJson: '',
  displayOrder: 0,
  isActive: true,
  disciplineCode: null,
  minAge: null,
  maxAge: null,
  minGrade: null,
  maxGrade: null,
  maxPlacements: null,
  registrationDeadline: null,
  rulesMarkdown: '',
  requiresTeamName: false,
};

export default function EventCompetitionForm({ eventId, days, competition }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...defaults,
    ...competition,
    competitionDayId: competition?.competitionDay?.id ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        const payload = {
          ...form,
          feeAmount: Number(form.feeAmount) || 0,
          competitionDay: form.competitionDayId ? { id: form.competitionDayId } : undefined,
        };
        delete (payload as { competitionDayId?: number | null }).competitionDayId;

        if (competition?.id) {
          await patchCompetitionServer(competition.id, eventId, payload);
        } else {
          await createCompetitionServer(eventId, payload);
        }
        router.push(`/admin/events/${eventId}/competitions/list`);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Save failed');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold">{competition?.id ? 'Edit competition' : 'New competition'}</h2>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <input
        required
        placeholder="Name"
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <textarea
        placeholder="Description"
        rows={3}
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.competitionType}
          onChange={(e) => setForm((f) => ({ ...f, competitionType: e.target.value as CompetitionType }))}
        >
          <option value="INDIVIDUAL">Individual</option>
          <option value="GROUP">Group</option>
        </select>
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.eligibleAudience}
          onChange={(e) =>
            setForm((f) => ({ ...f, eligibleAudience: e.target.value as CompetitionEligibleAudience }))
          }
        >
          <option value="YOUTH_ONLY">Youth only</option>
          <option value="ADULT_ONLY">Adult only</option>
          <option value="ALL">All</option>
        </select>
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.competitionDayId ?? ''}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              competitionDayId: e.target.value ? parseInt(e.target.value, 10) : null,
            }))
          }
        >
          <option value="">No schedule day</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {d.dayLabel} ({d.eventDate})
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Fee"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.feeAmount}
          onChange={(e) => setForm((f) => ({ ...f, feeAmount: parseFloat(e.target.value) || 0 }))}
        />
        <input
          placeholder="Division label"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.divisionLabel ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, divisionLabel: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Display order"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.displayOrder}
          onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))}
        />
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.disciplineCode ?? ''}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              disciplineCode: (e.target.value || null) as CompetitionDisciplineCode | null,
            }))
          }
        >
          <option value="">Discipline (optional)</option>
          {(['SONG', 'SPEECH', 'DANCE', 'MUSIC', 'SPORTS', 'ART', 'OTHER'] as const).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min age"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.minAge ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, minAge: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max age"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.maxAge ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, maxAge: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Min grade"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.minGrade ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, minGrade: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max grade"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.maxGrade ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, maxGrade: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max placements (podium depth)"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.maxPlacements ?? ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, maxPlacements: e.target.value ? parseInt(e.target.value, 10) : null }))
          }
        />
        {form.competitionType === 'GROUP' && (
          <>
            <input
              type="number"
              placeholder="Min team size"
              className="border border-gray-400 rounded-xl px-4 py-3"
              value={form.minGroupSize ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, minGroupSize: e.target.value ? parseInt(e.target.value, 10) : null }))
              }
            />
            <input
              type="number"
              placeholder="Max team size"
              className="border border-gray-400 rounded-xl px-4 py-3"
              value={form.maxGroupSize ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxGroupSize: e.target.value ? parseInt(e.target.value, 10) : null }))
              }
            />
          </>
        )}
      </div>
      <textarea
        placeholder="Rules & regulations (markdown)"
        rows={4}
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.rulesMarkdown ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, rulesMarkdown: e.target.value }))}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
        />
        Active
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.requiresSoundtrack}
          onChange={(e) => setForm((f) => ({ ...f, requiresSoundtrack: e.target.checked }))}
        />
        Requires soundtrack
      </label>
      {form.competitionType === 'GROUP' && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.requiresTeamName}
            onChange={(e) => setForm((f) => ({ ...f, requiresTeamName: e.target.checked }))}
          />
          Requires team name
        </label>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
