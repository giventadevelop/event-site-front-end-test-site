import { getAppUrl } from '@/lib/env';
import { fetchRecentEventsServer, fetchLinkedEventsPaginatedServer } from './ApiServerActions';
import ManageGroupEventsClient from './ManageGroupEventsClient';
import type { EventDetailsDTO } from '@/types';

const LINKED_PAGE_SIZE = 10;

async function fetchGroup(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ManageGroupEventsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, params.id);
  const focusGroupId = parseInt(params.id, 10);
  const { linked: initialLinked, totalCount: initialTotalCount } =
    await fetchLinkedEventsPaginatedServer(focusGroupId, 0, LINKED_PAGE_SIZE);
  const recentEvents = await fetchRecentEventsServer();

  return (
    <ManageGroupEventsClient
      focusGroupId={focusGroupId}
      groupName={group?.name ?? 'Focus Group'}
      initialLinked={initialLinked}
      initialTotalLinkedCount={initialTotalCount}
      linkedPageSize={LINKED_PAGE_SIZE}
      recentEvents={recentEvents}
    />
  );
}
