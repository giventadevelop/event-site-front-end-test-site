'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { EventFocusGroupDTO, FocusGroupDTO } from '@/types';
import {
  linkEventToFocusGroupServer,
  unlinkEventFromFocusGroupServer,
} from './ApiServerActions';

interface EventFocusGroupsClientProps {
  eventId: number;
  eventTitle: string;
  linked: EventFocusGroupDTO[];
  candidates: FocusGroupDTO[];
  focusGroupNameById: Record<number, string>;
}

export default function EventFocusGroupsClient({
  eventId,
  eventTitle,
  linked: initialLinked,
  candidates: initialCandidates,
  focusGroupNameById,
}: EventFocusGroupsClientProps) {
  const [linked, setLinked] = useState<EventFocusGroupDTO[]>(initialLinked);
  const [candidates, setCandidates] = useState<FocusGroupDTO[]>(initialCandidates);
  const [selectedFocusGroupId, setSelectedFocusGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const fgId = selectedFocusGroupId ? parseInt(selectedFocusGroupId, 10) : 0;
    if (!fgId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await linkEventToFocusGroupServer(eventId, fgId);
      const newAssociation: EventFocusGroupDTO = {
        eventId,
        focusGroupId: fgId,
        id: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLinked((prev) => [...prev, newAssociation]);
      setCandidates((prev) => prev.filter((c) => c.id !== fgId));
      setSelectedFocusGroupId('');
      setSuccess('Focus group linked successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to link focus group.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (association: EventFocusGroupDTO) => {
    const fgId = association.focusGroupId;
    if (fgId == null) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await unlinkEventFromFocusGroupServer(eventId, fgId);
      setLinked((prev) => prev.filter((a) => a.focusGroupId !== fgId));
      const name = focusGroupNameById[fgId] ?? `Focus group ${fgId}`;
      setCandidates((prev) => {
        if (prev.some((c) => c.id === fgId)) return prev;
        const added: FocusGroupDTO = {
          id: fgId,
          name,
          slug: `focus-group-${fgId}`,
          createdAt: '',
          updatedAt: '',
        };
        return [...prev, added].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      });
      setSuccess('Focus group unlinked.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to unlink focus group.');
    } finally {
      setLoading(false);
    }
  };

  const linkedWithNames = linked.map((efg) => ({
    ...efg,
    name: focusGroupNameById[efg.focusGroupId] ?? `Focus group ${efg.focusGroupId}`,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Focus groups for: {eventTitle || 'Event'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Link or unlink focus groups to this event.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Linked Focus Groups</h2>
          <ul className="space-y-2">
            {linkedWithNames.map((efg) => (
              <li
                key={efg.id ?? `${efg.eventId}-${efg.focusGroupId}`}
                className="flex items-center justify-between text-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold text-gray-900">{efg.name}</span>
                <button
                  type="button"
                  onClick={() => handleUnlink(efg)}
                  disabled={loading}
                  className="flex-shrink-0 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Unlink focus group"
                  aria-label="Unlink focus group"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </span>
                  <span className="font-semibold text-red-700 text-sm hidden sm:inline">Unlink</span>
                </button>
              </li>
            ))}
            {linkedWithNames.length === 0 && (
              <li className="text-gray-500 text-sm p-4">No focus groups linked.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Link Focus Group</h2>
          <form onSubmit={handleLink} className="flex flex-col sm:flex-row gap-3">
            <select
              name="focusGroupId"
              value={selectedFocusGroupId}
              onChange={(e) => setSelectedFocusGroupId(e.target.value)}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base flex-1"
              disabled={loading || candidates.length === 0}
            >
              <option value="">Select focus group...</option>
              {candidates.map((fg) => (
                <option key={fg.id} value={fg.id}>
                  {fg.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !selectedFocusGroupId}
              className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Link focus group"
              aria-label="Link focus group"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <span className="font-semibold text-green-700 hidden sm:inline">Link</span>
            </button>
          </form>
          {candidates.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">All focus groups are already linked to this event.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/admin/events/${eventId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event Overview
        </Link>
      </div>
    </div>
  );
}
