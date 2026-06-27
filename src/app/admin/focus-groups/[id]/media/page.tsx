import Link from 'next/link';
import { getAppUrl } from '@/lib/env';
import {
  fetchEventFocusGroupsByFocusGroupIdServer,
  fetchMediaByEventAndAssociationServer,
  fetchEventTitleServer,
} from './ApiServerActions';
import type { EventMediaDTO } from '@/types';

async function fetchGroup(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function FocusGroupMediaPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const baseUrl = getAppUrl();
  const focusGroupId = parseInt(params.id, 10);
  if (Number.isNaN(focusGroupId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8" style={{ paddingTop: '120px' }}>
        <p className="text-red-600">Invalid focus group ID.</p>
        <Link href="/admin/focus-groups" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Focus Groups
        </Link>
      </div>
    );
  }

  const [group, associations] = await Promise.all([
    fetchGroup(baseUrl, params.id),
    fetchEventFocusGroupsByFocusGroupIdServer(focusGroupId),
  ]);

  type MediaWithEvent = EventMediaDTO & { eventId: number; eventTitle: string };
  const allMedia: MediaWithEvent[] = [];
  const eventTitles: Record<number, string> = {};

  for (const efg of associations) {
    const eventId = efg.eventId;
    const associationId = efg.id;
    if (eventId == null || associationId == null) continue;
    if (!eventTitles[eventId]) {
      eventTitles[eventId] = await fetchEventTitleServer(eventId);
    }
    const mediaList = await fetchMediaByEventAndAssociationServer(eventId, associationId);
    const eventTitle = eventTitles[eventId];
    for (const m of mediaList) {
      allMedia.push({ ...m, eventId, eventTitle });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Media for: {group?.name ?? 'Focus Group'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Event media files tagged with this focus group across all linked events.
        </p>
      </div>

      {allMedia.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No media associated with this focus group.</p>
          <p className="text-sm text-gray-400 mt-2">
            Link events to this focus group and tag media with the focus group when uploading or editing event media.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allMedia.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {m.fileUrl ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.fileUrl}
                            alt={m.title ?? 'Media'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{m.title ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <Link
                        href={`/admin/events/${m.eventId}/media/list`}
                        className="text-blue-600 hover:underline"
                      >
                        {m.eventTitle || `Event ${m.eventId}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/events/${m.eventId}/media/list`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium"
                      >
                        Manage media
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link
          href={`/admin/focus-groups/${params.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Focus Group
        </Link>
        <Link
          href={`/admin/focus-groups/${params.id}/events`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Manage events
        </Link>
      </div>
    </div>
  );
}
