'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UserProfileDTO } from '@/types';
import type { GasStationLocationDTO, GasStationUserStationAssignmentDTO } from '@/types/gasStation';
import { GAS_STATION_ROLE_LABELS } from '@/types/gasStation';
import { replaceGasStationAssignmentsForUserServer } from '../gasStationAccessServer';

interface Props {
  managers: UserProfileDTO[];
  stations: GasStationLocationDTO[];
  initialAssignments: GasStationUserStationAssignmentDTO[];
  adminProfileId: number | null;
}

export default function GasStationAccessClient({
  managers,
  stations,
  initialAssignments,
  adminProfileId,
}: Props) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    managers[0]?.id ?? null
  );
  const [selectedStationIds, setSelectedStationIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const assignmentsByUser = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const row of assignments) {
      const list = map.get(row.userProfileId) ?? [];
      list.push(row.stationId);
      map.set(row.userProfileId, list);
    }
    return map;
  }, [assignments]);

  useEffect(() => {
    if (selectedUserId != null) {
      setSelectedStationIds(assignmentsByUser.get(selectedUserId) ?? []);
    }
  }, [selectedUserId, assignmentsByUser]);

  const selectManager = (userId: number) => {
    setSelectedUserId(userId);
    setSelectedStationIds(assignmentsByUser.get(userId) ?? []);
    setMessage(null);
  };

  const toggleStation = (stationId: number) => {
    setSelectedStationIds((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const save = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setMessage(null);
    const ok = await replaceGasStationAssignmentsForUserServer(
      selectedUserId,
      selectedStationIds,
      adminProfileId
    );
    setSaving(false);
    if (ok) {
      setAssignments((prev) => {
        const rest = prev.filter((a) => a.userProfileId !== selectedUserId);
        const added = selectedStationIds.map((stationId) => ({
          tenantId: '',
          userProfileId: selectedUserId,
          stationId,
        }));
        return [...rest, ...added];
      });
      setMessage('Location assignments saved.');
    } else {
      setMessage('Save failed. Ensure the backend assignment API is deployed.');
    }
  };

  if (managers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        No users with role <strong>{GAS_STATION_ROLE_LABELS.GAS_STATION_MANAGER}</strong> yet.
        Assign that role under{' '}
        <a href="/admin/manage-usage" className="underline font-medium">
          Manage Usage
        </a>
        , then return here to map locations.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Location managers</h2>
        <ul className="space-y-2">
          {managers.map((m) => {
            const count = assignmentsByUser.get(m.id)?.length ?? 0;
            const label = [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || `User #${m.id}`;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => selectManager(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    selectedUserId === m.id
                      ? 'border-blue-400 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{count} location(s) assigned</div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Assigned locations</h2>
        <p className="text-sm text-gray-600 mb-4">
          Managers only see dashboard data for checked stations. Tenant admins (
          <code className="text-xs">SUPER_ADMIN</code>, <code className="text-xs">ADMIN</code>,{' '}
          <code className="text-xs">GAS_STATION_ADMIN</code>) see all locations automatically.
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {stations.map((s) => {
            if (s.id == null) return null;
            return (
              <label
                key={s.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStationIds.includes(s.id)}
                  onChange={() => toggleStation(s.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium">{s.stationName}</span>
                  <span className="text-gray-500 ml-2">({s.stationCode})</span>
                </span>
              </label>
            );
          })}
        </div>
        {message && (
          <p className={`text-sm mb-3 ${message.includes('failed') ? 'text-red-600' : 'text-green-700'}`}>
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving || !selectedUserId}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save assignments'}
        </button>
      </div>
    </div>
  );
}
