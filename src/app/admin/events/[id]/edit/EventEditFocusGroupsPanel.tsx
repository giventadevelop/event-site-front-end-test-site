'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { EventFocusGroupDTO, FocusGroupDTO } from '@/types';
import {
  fetchAllFocusGroupsServer,
  fetchLinkedEventFocusGroupsServer,
  linkEventToFocusGroupServer,
  unlinkEventFromFocusGroupServer,
} from '@/app/admin/events/[id]/focus-groups/ApiServerActions';

type Props = {
  eventId: number;
};

/**
 * Compact focus-group selector for the event edit page.
 * Selecting a group creates an event_focus_groups row so the event appears on that group's public page.
 */
export default function EventEditFocusGroupsPanel({ eventId }: Props) {
  const [allGroups, setAllGroups] = useState<FocusGroupDTO[]>([]);
  const [linked, setLinked] = useState<EventFocusGroupDTO[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [groups, links] = await Promise.all([
          fetchAllFocusGroupsServer(),
          fetchLinkedEventFocusGroupsServer(eventId),
        ]);
        if (cancelled) return;
        setAllGroups(groups.filter((g) => g.id != null && g.isActive !== false));
        setLinked(links);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load focus groups');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const linkedIds = new Set(linked.map((l) => l.focusGroupId));
  const candidates = allGroups.filter((g) => g.id != null && !linkedIds.has(g.id!));
  const nameById = Object.fromEntries(allGroups.map((g) => [g.id!, g.name]));

  const handleLink = async () => {
    const fgId = selectedId ? parseInt(selectedId, 10) : 0;
    if (!fgId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const created = await linkEventToFocusGroupServer(eventId, fgId);
      setLinked((prev) => [...prev, created]);
      setSelectedId('');
      setMessage(`Linked to ${nameById[fgId] || 'focus group'}. It will appear on that group's public page.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to link focus group');
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (focusGroupId: number) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await unlinkEventFromFocusGroupServer(eventId, focusGroupId);
      setLinked((prev) => prev.filter((l) => l.focusGroupId !== focusGroupId));
      setMessage('Focus group unlinked.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unlink');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Focus Group</h2>
          <p className="text-sm text-gray-600">
            Link this event so it lists under the selected focus group&apos;s public page.
          </p>
        </div>
        <Link
          href={`/admin/events/${eventId}/focus-groups`}
          className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
        >
          Manage all links →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading focus groups…</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label htmlFor="event-edit-focus-group" className="block text-sm font-medium text-gray-700 mb-1">
                Select focus group
              </label>
              <select
                id="event-edit-focus-group"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={busy || candidates.length === 0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">
                  {candidates.length === 0 ? 'No more focus groups to link' : 'Choose a focus group…'}
                </option>
                {candidates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleLink}
              disabled={busy || !selectedId}
              className="h-10 px-4 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Link focus group"
              aria-label="Link focus group"
            >
              {busy ? 'Linking…' : 'Link'}
            </button>
          </div>

          {linked.length > 0 && (
            <ul className="mt-4 space-y-2" role="list">
              {linked.map((l) => (
                <li
                  key={`${l.focusGroupId}-${l.id ?? 'x'}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-900">
                    {nameById[l.focusGroupId] || `Focus group #${l.focusGroupId}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUnlink(l.focusGroupId)}
                    disabled={busy}
                    className="text-red-700 hover:text-red-900 font-medium disabled:opacity-50"
                    title="Unlink"
                    aria-label="Unlink focus group"
                  >
                    Unlink
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
    </div>
  );
}
