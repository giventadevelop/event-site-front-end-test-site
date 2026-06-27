import Link from 'next/link';
import {
  fetchLinkedEventFocusGroupsServer,
  fetchAllFocusGroupsServer,
} from './ApiServerActions';
import EventFocusGroupsClient from './EventFocusGroupsClient';
import type { EventFocusGroupDTO, FocusGroupDTO } from '@/types';
import { getAppUrl } from '@/lib/env';

async function fetchEventTitle(eventId: string): Promise<string> {
  try {
    const baseUrl = getAppUrl();
    const res = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data?.title ?? '';
  } catch {
    return '';
  }
}

export default async function EventFocusGroupsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = parseInt(params.id, 10);
  if (Number.isNaN(eventId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8" style={{ paddingTop: '120px' }}>
        <p className="text-red-600">Invalid event ID.</p>
        <Link href="/admin/manage-events" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Manage Events
        </Link>
      </div>
    );
  }

  const [linked, allFocusGroups, eventTitle] = await Promise.all([
    fetchLinkedEventFocusGroupsServer(eventId),
    fetchAllFocusGroupsServer(),
    fetchEventTitle(params.id),
  ]);

  const linkedFocusGroupIds = new Set(linked.map((a) => a.focusGroupId));
  const candidates = allFocusGroups.filter(
    (fg): fg is FocusGroupDTO & { id: number } =>
      fg.id != null && !linkedFocusGroupIds.has(fg.id)
  );

  const focusGroupNameById: Record<number, string> = {};
  for (const fg of allFocusGroups) {
    if (fg.id != null && fg.name) focusGroupNameById[fg.id] = fg.name;
  }

  return (
    <EventFocusGroupsClient
      eventId={eventId}
      eventTitle={eventTitle}
      linked={linked}
      candidates={candidates}
      focusGroupNameById={focusGroupNameById}
    />
  );
}
