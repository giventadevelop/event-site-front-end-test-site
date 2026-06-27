'use client';

import type { EventCompetitionRegistrationDTO } from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';

interface Props {
  registrations: EventCompetitionRegistrationDTO[];
}

export default function CompetitionRegistrationAdminTable({ registrations }: Props) {
  const sorted = [...registrations].sort((a, b) => {
    const compA = a.competition?.name ?? '';
    const compB = b.competition?.name ?? '';
    if (compA !== compB) return compA.localeCompare(compB);
    return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
  });

  const exportCsv = () => {
    const headers = ['Competition', 'Participant', 'Team Name', 'Status', 'Fee', 'Category', 'Created', 'ID'];
    const rows = sorted.map((r) => [
      r.competition?.name ?? '',
      r.participantProfile?.displayName || `${r.participantProfile?.firstName ?? ''} ${r.participantProfile?.lastName ?? ''}`.trim(),
      r.teamDisplayName || r.teamName || '',
      r.registrationStatus,
      r.feeAmount,
      r.effectiveCategory ?? '',
      r.createdAt ?? '',
      r.id,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competition-registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-semibold">Registrations ({registrations.length})</h3>
        <button type="button" onClick={exportCsv} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Competition</th>
              <th className="px-4 py-3 text-left">Participant</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Fee</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No registrations.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{r.competition?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {r.participantProfile?.displayName ||
                      `${r.participantProfile?.firstName ?? ''} ${r.participantProfile?.lastName ?? ''}`.trim()}
                  </td>
                  <td className="px-4 py-3">{r.teamDisplayName || r.teamName || '—'}</td>
                  <td className="px-4 py-3">{r.registrationStatus}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(r.feeAmount) || 0)}</td>
                  <td className="px-4 py-3">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
