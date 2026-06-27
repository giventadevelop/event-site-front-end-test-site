'use client';

import { useState, useTransition } from 'react';
import type { EventCompetitionDayDTO } from '@/types';
import {
  createCompetitionDayServer,
  patchCompetitionDayServer,
  deleteCompetitionDayServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';

interface Props {
  eventId: string;
  initialDays: EventCompetitionDayDTO[];
}

const emptyDay = (): Omit<EventCompetitionDayDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'event'> => ({
  dayLabel: '',
  eventDate: new Date().toISOString().slice(0, 10),
  venueName: '',
  venueAddress: '',
  sortOrder: 0,
  notes: '',
});

export default function EventCompetitionDayList({ eventId, initialDays }: Props) {
  const [days, setDays] = useState(initialDays);
  const [editing, setEditing] = useState<EventCompetitionDayDTO | null>(null);
  const [form, setForm] = useState(emptyDay());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      try {
        setError(null);
        if (editing?.id) {
          const updated = await patchCompetitionDayServer(editing.id, eventId, form);
          setDays((d) => d.map((x) => (x.id === updated.id ? updated : x)));
        } else {
          const created = await createCompetitionDayServer(eventId, form);
          setDays((d) => [...d, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        }
        setEditing(null);
        setForm(emptyDay());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Save failed');
      }
    });
  };

  const remove = (id: number) => {
    if (!confirm('Delete this day?')) return;
    startTransition(async () => {
      try {
        await deleteCompetitionDayServer(id);
        setDays((d) => d.filter((x) => x.id !== id));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">{editing ? 'Edit day' : 'Add schedule day'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            placeholder="Day label"
            className="border border-gray-400 rounded-xl px-4 py-2"
            value={form.dayLabel}
            onChange={(e) => setForm((f) => ({ ...f, dayLabel: e.target.value }))}
          />
          <input
            type="date"
            className="border border-gray-400 rounded-xl px-4 py-2"
            value={form.eventDate}
            onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
          />
          <input
            placeholder="Venue name"
            className="border border-gray-400 rounded-xl px-4 py-2"
            value={form.venueName}
            onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Sort order"
            className="border border-gray-400 rounded-xl px-4 py-2"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
          />
          <input
            placeholder="Venue address"
            className="border border-gray-400 rounded-xl px-4 py-2 md:col-span-2"
            value={form.venueAddress ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, venueAddress: e.target.value }))}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {isPending ? 'Saving...' : 'Save'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(emptyDay());
              }}
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Venue</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.id} className="border-b border-gray-100">
                <td className="px-4 py-3">{day.dayLabel}</td>
                <td className="px-4 py-3">{day.eventDate}</td>
                <td className="px-4 py-3">{day.venueName}</td>
                <td className="px-4 py-3">{day.sortOrder}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    type="button"
                    className="text-blue-600"
                    onClick={() => {
                      setEditing(day);
                      setForm({
                        dayLabel: day.dayLabel,
                        eventDate: day.eventDate,
                        venueName: day.venueName,
                        venueAddress: day.venueAddress ?? '',
                        sortOrder: day.sortOrder,
                        notes: day.notes ?? '',
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-red-600" onClick={() => day.id && remove(day.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
