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
        placeholder="Name — e.g. Classical Vocal Solo"
        title="Competition name shown to registrants"
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <textarea
        placeholder="Description — short summary of the competition for participants"
        title="Description"
        rows={3}
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.competitionType}
          title="Competition type — Individual or Group"
          onChange={(e) => setForm((f) => ({ ...f, competitionType: e.target.value as CompetitionType }))}
        >
          <option value="INDIVIDUAL">Type: Individual (one participant)</option>
          <option value="GROUP">Type: Group (team)</option>
        </select>
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.eligibleAudience}
          title="Who may register"
          onChange={(e) =>
            setForm((f) => ({ ...f, eligibleAudience: e.target.value as CompetitionEligibleAudience }))
          }
        >
          <option value="ALL">Audience: All ages</option>
          <option value="YOUTH_ONLY">Audience: Youth only</option>
          <option value="ADULT_ONLY">Audience: Adult only</option>
        </select>
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.competitionDayId ?? ''}
          title="Optional schedule day from Competition Days"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              competitionDayId: e.target.value ? parseInt(e.target.value, 10) : null,
            }))
          }
        >
          <option value="">Schedule day — none (optional)</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {d.dayLabel} ({d.eventDate})
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Fee — e.g. 0 for free, or 25.00"
          title="Registration fee in dollars (0 = free)"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.feeAmount === 0 && !competition?.id ? '' : form.feeAmount}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              feeAmount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
            }))
          }
        />
        <input
          placeholder='Division label — e.g. "Junior Girls" or "Ages 8–12"'
          title="Display label for the age/skill division (shown under the competition name)"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.divisionLabel ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, divisionLabel: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Display order — e.g. 1 (lower numbers appear first)"
          title="Sort order in lists (lower = first)"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.displayOrder === 0 && !competition?.id ? '' : form.displayOrder}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              displayOrder: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
            }))
          }
        />
        <select
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.disciplineCode ?? ''}
          title="Discipline category"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              disciplineCode: (e.target.value || null) as CompetitionDisciplineCode | null,
            }))
          }
        >
          <option value="">Discipline — optional (Song, Dance, …)</option>
          {(
            [
              ['SONG', 'Song'],
              ['SPEECH', 'Speech'],
              ['DANCE', 'Dance'],
              ['MUSIC', 'Music'],
              ['SPORTS', 'Sports'],
              ['ART', 'Art'],
              ['PAINTING', 'Painting'],
              ['OTHER', 'Other'],
            ] as const
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min age — e.g. 5 (leave blank for no minimum)"
          title="Minimum participant age in years"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.minAge ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, minAge: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max age — e.g. 12 (leave blank for no maximum)"
          title="Maximum participant age in years"
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.maxAge ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, maxAge: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Min grade — school grade, e.g. 1 (K=0 optional)"
          title="Minimum school grade (1–12). Used with the participant's current grade for eligibility."
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.minGrade ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, minGrade: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max grade — school grade, e.g. 5"
          title="Maximum school grade (1–12). Used with the participant's current grade for eligibility."
          className="border border-gray-400 rounded-xl px-4 py-3"
          value={form.maxGrade ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, maxGrade: e.target.value ? parseInt(e.target.value, 10) : null }))}
        />
        <input
          type="number"
          placeholder="Max placements — e.g. 3 for 1st, 2nd, 3rd"
          title="How many ranked places to award (podium depth). Example: 3 = gold, silver, bronze."
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
              placeholder="Min team size — e.g. 3 members"
              title="Minimum number of people on a team"
              className="border border-gray-400 rounded-xl px-4 py-3"
              value={form.minGroupSize ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, minGroupSize: e.target.value ? parseInt(e.target.value, 10) : null }))
              }
            />
            <input
              type="number"
              placeholder="Max team size — e.g. 8 members"
              title="Maximum number of people on a team"
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
        placeholder="Rules & regulations — e.g. time limit, costume rules, judging criteria (markdown OK)"
        title="Rules shown to participants"
        rows={4}
        className="w-full border border-gray-400 rounded-xl px-4 py-3"
        value={form.rulesMarkdown ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, rulesMarkdown: e.target.value }))}
      />
      <label className="flex items-center gap-2" title="Inactive competitions are hidden from public registration">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
        />
        Active (show in public registration catalog)
      </label>
      <label className="flex items-center gap-2" title="Participants must provide music/audio">
        <input
          type="checkbox"
          checked={form.requiresSoundtrack}
          onChange={(e) => setForm((f) => ({ ...f, requiresSoundtrack: e.target.checked }))}
        />
        Requires soundtrack (music/audio file)
      </label>
      {form.competitionType === 'GROUP' && (
        <label className="flex items-center gap-2" title="Registrants must enter a team name">
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
