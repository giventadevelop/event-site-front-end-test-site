'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type {
  EventCompetitionDTO,
  EventCompetitionRegistrationDTO,
  EventCompetitionResultDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import {
  createCompetitionResultServer,
  importOfficialPlacementsFromPodiumServer,
  patchCompetitionResultDirectServer,
  patchCompetitionResultServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';
import { getDefaultPointsForPlacement, PLACEMENT_LABELS } from '@/lib/competitionEligibility';
import WinnerPhotoUpload from './WinnerPhotoUpload';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  eventId: string;
  competitions: EventCompetitionDTO[];
  registrations: EventCompetitionRegistrationDTO[];
  initialResults: EventCompetitionResultDTO[];
  settings?: EventCompetitionSettingsDTO | null;
  podiumDrafts?: EventCompetitionResultDTO[];
  fetchError?: string | null;
}

export default function CompetitionResultsEntryGrid({
  eventId,
  competitions,
  registrations,
  initialResults,
  settings,
  podiumDrafts = [],
  fetchError = null,
}: Props) {
  const [results, setResults] = useState(initialResults);
  const [filterCompId, setFilterCompId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(fetchError);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [manualName, setManualName] = useState('');
  const [manualCompId, setManualCompId] = useState<number | ''>(competitions[0]?.id ?? '');
  const [manualPlacement, setManualPlacement] = useState(1);

  const pointsSettings = {
    pointsFirst: settings?.pointsFirst ?? 10,
    pointsSecond: settings?.pointsSecond ?? 7,
    pointsThird: settings?.pointsThird ?? 5,
    pointsFourth: settings?.pointsFourth ?? 0,
  };

  useEffect(() => {
    if (!showPublishSuccess) return;
    const timer = window.setTimeout(() => setShowPublishSuccess(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showPublishSuccess]);

  const confirmedRegs = registrations.filter((r) => {
    if (r.registrationStatus === 'CANCELLED' || r.registrationStatus === 'REFUNDED') return false;
    if (r.registrationStatus === 'CONFIRMED') return true;
    const isFree = !(Number(r.feeAmount) > 0);
    return (
      isFree &&
      (r.registrationStatus === 'PENDING_PAYMENT' ||
        r.registrationStatus?.includes('PAYMENT') === true)
    );
  });

  const filteredResults = useMemo(() => {
    if (filterCompId === '') return results;
    return results.filter((r) => r.competition?.id === filterCompId);
  }, [results, filterCompId]);

  const usedPlacements = (compId: number | undefined) =>
    results
      .filter((r) => r.competition?.id === compId && r.isPublished)
      .map((r) => r.placement)
      .filter(Boolean);

  const resetResultFormFields = (resultId: number) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === resultId
          ? {
              ...r,
              displayName: '',
              placement: 1,
              placementLabel: PLACEMENT_LABELS[1],
              pointsAwarded: getDefaultPointsForPlacement(1, pointsSettings),
              prizeTitle: '',
              prizeDetails: '',
              notes: '',
              isPublished: false,
              publishedAt: null,
              winnerPhotoUrl: '',
              winnerMedia: undefined,
              workPhotoUrl: '',
              workMedia: undefined,
            }
          : r
      )
    );
  };

  const clearPhoto = (resultId: number, kind: 'winner' | 'work') => {
    startTransition(async () => {
      try {
        setError(null);
        const payload =
          kind === 'work'
            ? ({ workMedia: null, workPhotoUrl: '' } as Partial<EventCompetitionResultDTO>)
            : ({ winnerMedia: null, winnerPhotoUrl: '' } as Partial<EventCompetitionResultDTO>);
        try {
          await patchCompetitionResultDirectServer(resultId, payload);
        } catch {
          await patchCompetitionResultDirectServer(
            resultId,
            kind === 'work' ? { workPhotoUrl: '' } : { winnerPhotoUrl: '' }
          );
        }
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? kind === 'work'
                ? { ...r, workPhotoUrl: '', workMedia: undefined }
                : { ...r, winnerPhotoUrl: '', winnerMedia: undefined }
              : r
          )
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to remove photo');
      }
    });
  };

  const clearResultForm = (result: EventCompetitionResultDTO) => {
    if (!result.id) return;
    startTransition(async () => {
      try {
        setError(null);
        if (result.winnerPhotoUrl || result.winnerMedia?.id || result.workPhotoUrl || result.workMedia?.id) {
          try {
            await patchCompetitionResultDirectServer(result.id, {
              winnerMedia: null,
              winnerPhotoUrl: '',
              workMedia: null,
              workPhotoUrl: '',
            } as Partial<EventCompetitionResultDTO>);
          } catch {
            await patchCompetitionResultDirectServer(result.id, {
              winnerPhotoUrl: '',
              workPhotoUrl: '',
            });
          }
        }
        resetResultFormFields(result.id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Clear failed');
      }
    });
  };

  const saveResult = (result: EventCompetitionResultDTO) => {
    if (!result.id) return;
    const publishedAt = result.publishedAt || new Date().toISOString();
    const payload: Partial<EventCompetitionResultDTO> = {
      id: result.id,
      displayName: result.displayName,
      placement: result.placement,
      placementLabel: result.placementLabel,
      prizeTitle: result.prizeTitle ?? '',
      prizeDetails: result.prizeDetails ?? '',
      pointsAwarded: result.pointsAwarded,
      winnerPhotoUrl: result.winnerPhotoUrl ?? '',
      workPhotoUrl: result.workPhotoUrl ?? '',
      notes: result.notes ?? '',
      isPublished: true,
      publishedAt,
      competition: result.competition?.id
        ? ({ id: result.competition.id } as EventCompetitionResultDTO['competition'])
        : undefined,
      participantProfile: result.participantProfile?.id
        ? ({ id: result.participantProfile.id } as EventCompetitionResultDTO['participantProfile'])
        : undefined,
      registration: result.registration?.id
        ? ({ id: result.registration.id } as EventCompetitionResultDTO['registration'])
        : undefined,
      ...(result.winnerMedia?.id
        ? { winnerMedia: { id: result.winnerMedia.id } as EventCompetitionResultDTO['winnerMedia'] }
        : {}),
      ...(result.workMedia?.id
        ? { workMedia: { id: result.workMedia.id } as EventCompetitionResultDTO['workMedia'] }
        : {}),
    };

    startTransition(async () => {
      try {
        setError(null);
        const saved = await patchCompetitionResultServer(result.id!, eventId, payload);
        setResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? {
                  ...r,
                  ...saved,
                  isPublished: true,
                  publishedAt,
                  competition: r.competition,
                  winnerPhotoUrl: saved.winnerPhotoUrl ?? r.winnerPhotoUrl,
                  workPhotoUrl: saved.workPhotoUrl ?? r.workPhotoUrl,
                }
              : r
          )
        );
        setShowPublishSuccess(true);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    });
  };

  const applyPlacement = (resultId: number, placement: number) => {
    const compId = results.find((r) => r.id === resultId)?.competition?.id;
    const comp = competitions.find((c) => c.id === compId);
    const maxPlacements = Math.max(comp?.maxPlacements ?? settings?.defaultMaxPlacements ?? 3, placement);
    if (placement > (comp?.maxPlacements ?? settings?.defaultMaxPlacements ?? 5) && placement > 5) {
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
          workPhotoUrl: '',
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

  const addManualResult = () => {
    const displayName = manualName.trim();
    if (!displayName) {
      setError('Enter a winner name to add a result.');
      return;
    }
    if (!manualCompId) {
      setError('Select a competition for the new result.');
      return;
    }
    const comp = competitions.find((c) => c.id === manualCompId);
    startTransition(async () => {
      try {
        setError(null);
        const created = await createCompetitionResultServer(eventId, {
          displayName,
          placement: manualPlacement,
          placementLabel: PLACEMENT_LABELS[manualPlacement] ?? `${manualPlacement}th`,
          prizeTitle: '',
          prizeDetails: '',
          pointsAwarded: getDefaultPointsForPlacement(manualPlacement, pointsSettings),
          winnerPhotoUrl: '',
          workPhotoUrl: '',
          notes: '',
          isPublished: false,
          competition: { id: manualCompId } as EventCompetitionDTO,
        } as EventCompetitionResultDTO);
        setResults((prev) => [...prev, { ...created, competition: comp ?? created.competition }]);
        setManualName('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Create failed');
      }
    });
  };

  const importPodium = () => {
    startTransition(async () => {
      try {
        setError(null);
        const { created, skipped } = await importOfficialPlacementsFromPodiumServer(
          eventId,
          podiumDrafts,
          competitions
        );
        setResults((prev) => [...prev, ...created]);
        if (skipped.length > 0) {
          setError(`Imported ${created.length} placement(s). Skipped: ${skipped.join(', ')}`);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Import failed');
      }
    });
  };

  const showImportBanner = !fetchError && results.length === 0 && podiumDrafts.length > 0;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {showImportBanner && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Official results on the public page</h3>
          <p className="text-sm text-amber-800 mb-3">
            The public event page is showing {podiumDrafts.length} placement(s) from a podium block.
            Import them here so you can edit, publish, and attach photos.
          </p>
          <ul className="text-sm text-amber-900 mb-4 list-disc pl-5 space-y-1">
            {podiumDrafts.map((row) => (
              <li key={`${row.displayName}-${row.placement}-${row.competition?.name}`}>
                {row.competition?.name ? `${row.competition.name} — ` : ''}
                {row.displayName}
                {row.placementLabel ? ` (${row.placementLabel})` : ''}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={isPending}
            onClick={importPodium}
            className="flex-shrink-0 h-14 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
            title="Import official placements"
            aria-label="Import official placements"
          >
            <span className="font-semibold text-amber-800">
              {isPending ? 'Importing...' : 'Import official placements'}
            </span>
          </button>
        </div>
      )}

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
          <option value="">
            {confirmedRegs.length === 0
              ? 'No eligible registrations yet'
              : 'Select registration...'}
          </option>
          {confirmedRegs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.competition?.name} — {r.teamDisplayName || r.participantProfile?.firstName}{' '}
              {r.participantProfile?.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">Add result manually</h3>
        <p className="text-sm text-gray-600 mb-3">
          Use this when a winner was not registered (for example, a seeded or judged placement).
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              className="mt-1 border border-gray-400 rounded-xl px-4 py-2 block min-w-[200px]"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Winner name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Competition</span>
            <select
              className="mt-1 border border-gray-400 rounded-xl px-4 py-2 block min-w-[200px]"
              value={manualCompId === '' ? '' : String(manualCompId)}
              onChange={(e) => setManualCompId(e.target.value ? parseInt(e.target.value, 10) : '')}
            >
              <option value="">Select...</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id ?? ''}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Placement</span>
            <select
              className="mt-1 border border-gray-400 rounded-xl px-4 py-2 block"
              value={manualPlacement}
              onChange={(e) => setManualPlacement(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {PLACEMENT_LABELS[p] ?? `${p}th`}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={isPending}
            onClick={addManualResult}
            className="flex-shrink-0 h-14 rounded-xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
            title="Add result"
            aria-label="Add result"
          >
            <span className="font-semibold text-emerald-700">{isPending ? 'Adding...' : 'Add result'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result, idx) => {
          const compId = result.competition?.id;
          const comp = competitions.find((c) => c.id === compId);
          const maxPlacements = Math.max(comp?.maxPlacements ?? settings?.defaultMaxPlacements ?? 3, 5);
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
                  {[1, 2, 3, 4, 5].slice(0, maxPlacements).map((p) => (
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
              <div className="mt-3 flex flex-wrap items-start gap-4">
                <div className="custom-grid-cell" style={{ minWidth: '120px' }}>
                  <label className="flex flex-col items-center">
                    <span className="relative flex items-center justify-center">
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
                        onClick={(e) => e.stopPropagation()}
                        className="custom-checkbox custom-checkbox--yellow"
                        title="Published"
                        aria-label="Published"
                      />
                      <span className="custom-checkbox-tick">
                        {result.isPublished && (
                          <svg
                            className="w-6 h-6 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                          </svg>
                        )}
                      </span>
                    </span>
                    <span className="mt-2 text-sm font-semibold text-center select-none break-words max-w-[8rem]">
                      Published
                    </span>
                  </label>
                </div>
              </div>
              {result.id && (
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Winner photo</p>
                      <div className="flex flex-wrap items-center gap-3">
                        {result.winnerPhotoUrl && (
                          <div className="relative w-24 h-24 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={result.winnerPhotoUrl}
                              alt={result.displayName || 'Winner photo'}
                              className="w-24 h-24 object-contain rounded-lg border bg-gray-50"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => clearPhoto(result.id!, 'winner')}
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-red-200 disabled:opacity-50"
                              title="Remove winner photo"
                              aria-label="Remove winner photo"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <WinnerPhotoUpload
                          eventId={eventId}
                          resultId={result.id}
                          kind="winner"
                          onUploaded={(url, mediaId) =>
                            setResults((prev) =>
                              prev.map((r) =>
                                r.id === result.id
                                  ? {
                                      ...r,
                                      winnerPhotoUrl: url,
                                      winnerMedia: { id: mediaId } as EventCompetitionResultDTO['winnerMedia'],
                                    }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Winning work</p>
                      <div className="flex flex-wrap items-center gap-3">
                        {result.workPhotoUrl && (
                          <div className="relative w-24 h-24 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={result.workPhotoUrl}
                              alt={`${result.displayName || 'Winner'} work`}
                              className="w-24 h-24 object-contain rounded-lg border bg-gray-50"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => clearPhoto(result.id!, 'work')}
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-red-200 disabled:opacity-50"
                              title="Remove winning work"
                              aria-label="Remove winning work"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <WinnerPhotoUpload
                          eventId={eventId}
                          resultId={result.id}
                          kind="work"
                          onUploaded={(url, mediaId) =>
                            setResults((prev) =>
                              prev.map((r) =>
                                r.id === result.id
                                  ? {
                                      ...r,
                                      workPhotoUrl: url,
                                      workMedia: { id: mediaId } as EventCompetitionResultDTO['workMedia'],
                                    }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const current = results.find((r) => r.id === result.id);
                        if (current) clearResultForm(current);
                      }}
                      className="flex-shrink-0 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title="Clear"
                      aria-label="Clear"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="font-semibold text-orange-700">Clear</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const current = results.find((r) => r.id === result.id);
                        if (current) saveResult(current);
                      }}
                      className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title="Save"
                      aria-label="Save"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                        {isPending ? (
                          <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-blue-700">{isPending ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={showPublishSuccess} onOpenChange={setShowPublishSuccess}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-green-800">
              Results published successfully
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              Placement details are now visible on the event results section. Winner photos and
              winning-work images appear when uploaded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center pb-2">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
