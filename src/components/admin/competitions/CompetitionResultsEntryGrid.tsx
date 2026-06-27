'use client';

import { useMemo, useState, useTransition } from 'react';
import type {
  EventCompetitionDTO,
  EventCompetitionRegistrationDTO,
  EventCompetitionResultDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import {
  createCompetitionResultServer,
  patchCompetitionResultServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';
import { getDefaultPointsForPlacement, PLACEMENT_LABELS } from '@/lib/competitionEligibility';
import WinnerPhotoUpload from './WinnerPhotoUpload';

interface Props {
  eventId: string;
  competitions: EventCompetitionDTO[];
  registrations: EventCompetitionRegistrationDTO[];
  initialResults: EventCompetitionResultDTO[];
  settings?: EventCompetitionSettingsDTO | null;
}

export default function CompetitionResultsEntryGrid({
  eventId,
  competitions,
  registrations,
  initialResults,
  settings,
}: Props) {
  const [results, setResults] = useState(initialResults);
  const [filterCompId, setFilterCompId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pointsSettings = {
    pointsFirst: settings?.pointsFirst ?? 10,
    pointsSecond: settings?.pointsSecond ?? 7,
    pointsThird: settings?.pointsThird ?? 5,
    pointsFourth: settings?.pointsFourth ?? 0,
  };

  const confirmedRegs = registrations.filter((r) => r.registrationStatus === 'CONFIRMED');

  const filteredResults = useMemo(() => {
    if (filterCompId === '') return results;
    return results.filter((r) => r.competition?.id === filterCompId);
  }, [results, filterCompId]);

  const usedPlacements = (compId: number | undefined) =>
    results
      .filter((r) => r.competition?.id === compId && r.isPublished)
      .map((r) => r.placement)
      .filter(Boolean);

  const saveResult = (result: EventCompetitionResultDTO) => {
    if (!result.id) return;
    startTransition(async () => {
      try {
        setError(null);
        const updated = await patchCompetitionResultServer(result.id!, eventId, result);
        setResults((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    });
  };

  const applyPlacement = (resultId: number, placement: number) => {
    const compId = results.find((r) => r.id === resultId)?.competition?.id;
    const comp = competitions.find((c) => c.id === compId);
    const maxPlacements = comp?.maxPlacements ?? settings?.defaultMaxPlacements ?? 3;
    if (placement > maxPlacements) {
      setError(`Placement ${placement} exceeds max placements (${maxPlacements}) for this competition.`);
      return;
    }
    setResults((prev) =>
      prev.map((r) =>
        r.id === resultId
          ? {
              ...r,
              placement,
              placementLabel: PLACEMENT_LABELS[placement] ?? `${placement}th`,
              pointsAwarded: getDefaultPointsForPlacement(placement, pointsSettings),
            }
          : r
      )
    );
  };

  const addFromRegistration = (reg: EventCompetitionRegistrationDTO) => {
    const name =
      reg.teamDisplayName ||
      reg.teamName ||
      reg.participantProfile?.displayName ||
      `${reg.participantProfile?.firstName ?? ''} ${reg.participantProfile?.lastName ?? ''}`.trim();
    startTransition(async () => {
      try {
        setError(null);
        const created = await createCompetitionResultServer(eventId, {
          displayName: name || 'Participant',
          placement: 1,
          placementLabel: PLACEMENT_LABELS[1],
          prizeTitle: '',
          prizeDetails: '',
          pointsAwarded: getDefaultPointsForPlacement(1, pointsSettings),
          winnerPhotoUrl: '',
          notes: '',
          isPublished: false,
          competition: reg.competition?.id ? { id: reg.competition.id } : undefined,
          participantProfile: reg.participantProfile?.id ? { id: reg.participantProfile.id } : undefined,
          registration: reg.id ? { id: reg.id } : undefined,
        } as EventCompetitionResultDTO);
        setResults((prev) => [...prev, created]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Create failed');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 items-end">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Filter by competition</span>
          <select
            className="mt-1 border border-gray-400 rounded-xl px-4 py-2 block min-w-[200px]"
          value={filterCompId === '' ? '' : String(filterCompId)}
            onChange={(e) => setFilterCompId(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">All competitions</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id ?? ''}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">Add result from registration</h3>
        <select
          className="border border-gray-400 rounded-xl px-4 py-2 w-full max-w-md"
          defaultValue=""
          onChange={(e) => {
            const id = parseInt(e.target.value, 10);
            if (!id) return;
            const reg = confirmedRegs.find((r) => r.id === id);
            if (reg) addFromRegistration(reg);
            e.target.value = '';
          }}
        >
          <option value="">Select confirmed registration...</option>
          {confirmedRegs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.competition?.name} — {r.teamDisplayName || r.participantProfile?.firstName}{' '}
              {r.participantProfile?.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result, idx) => {
          const compId = result.competition?.id;
          const comp = competitions.find((c) => c.id === compId);
          const maxPlacements = comp?.maxPlacements ?? settings?.defaultMaxPlacements ?? 3;
          const taken = usedPlacements(compId);

          return (
            <div key={result.id ?? idx} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                {result.competition?.name ?? comp?.name ?? 'Competition'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="border border-gray-400 rounded-xl px-3 py-2"
                  value={result.displayName}
                  onChange={(e) =>
                    setResults((prev) =>
                      prev.map((r) => (r.id === result.id ? { ...r, displayName: e.target.value } : r))
                    )
                  }
                />
                <div className="flex flex-wrap gap-2 items-center">
                  {[1, 2, 3, 4].slice(0, maxPlacements).map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={taken.includes(p) && result.placement !== p}
                      onClick={() => result.id != null && applyPlacement(result.id, p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        result.placement === p
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300 disabled:opacity-40'
                      }`}
                    >
                      {PLACEMENT_LABELS[p] ?? `${p}th`}
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{result.pointsAwarded} pts</span>
                </div>
                <input
                  placeholder="Prize title"
                  className="border border-gray-400 rounded-xl px-3 py-2"
                  value={result.prizeTitle ?? ''}
                  onChange={(e) =>
                    setResults((prev) =>
                      prev.map((r) => (r.id === result.id ? { ...r, prizeTitle: e.target.value } : r))
                    )
                  }
                />
                <input
                  placeholder="Notes"
                  className="border border-gray-400 rounded-xl px-3 py-2"
                  value={result.notes ?? ''}
                  onChange={(e) =>
                    setResults((prev) =>
                      prev.map((r) => (r.id === result.id ? { ...r, notes: e.target.value } : r))
                    )
                  }
                />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm">
                <input
                  type="checkbox"
                  checked={result.isPublished}
                  onChange={(e) =>
                    setResults((prev) =>
                      prev.map((r) =>
                        r.id === result.id
                          ? {
                              ...r,
                              isPublished: e.target.checked,
                              publishedAt: e.target.checked ? new Date().toISOString() : null,
                            }
                          : r
                      )
                    )
                  }
                />
                Published
              </label>
              {result.id && (
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {result.winnerPhotoUrl && (
                    <img
                      src={result.winnerPhotoUrl}
                      alt={result.displayName}
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                  )}
                  <WinnerPhotoUpload
                    eventId={eventId}
                    resultId={result.id}
                    onUploaded={(url) =>
                      setResults((prev) =>
                        prev.map((r) => (r.id === result.id ? { ...r, winnerPhotoUrl: url } : r))
                      )
                    }
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      const current = results.find((r) => r.id === result.id);
                      if (current) saveResult(current);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
