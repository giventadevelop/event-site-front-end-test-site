'use client';

import Link from 'next/link';
import type { EventCompetitionDTO } from '@/types';
import { formatCurrency } from '@/lib/formatCurrency';

interface Props {
  eventId: string;
  competitions: EventCompetitionDTO[];
}

export default function EventCompetitionList({ eventId, competitions }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-semibold text-lg">Competition catalog</h3>
        <Link
          href={`/admin/events/${eventId}/competitions/list/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Add competition
        </Link>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Audience</th>
            <th className="px-4 py-3 text-left">Fee</th>
            <th className="px-4 py-3 text-left">Active</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {competitions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No competitions yet.
              </td>
            </tr>
          ) : (
            competitions.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.competitionType}</td>
                <td className="px-4 py-3">{c.eligibleAudience}</td>
                <td className="px-4 py-3">{formatCurrency(Number(c.feeAmount) || 0)}</td>
                <td className="px-4 py-3">{c.isActive ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/events/${eventId}/competitions/${c.id}/edit`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
