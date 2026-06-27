import { getAppUrl } from '@/lib/env';
import { redirect } from 'next/navigation';
import FocusGroupEditForm from './FocusGroupEditForm';
import { fetchAssociatedEvents } from './ApiServerActions';
import type { FocusGroupDTO, EventDetailsDTO } from '@/types';

async function fetchGroup(baseUrl: string, id: string): Promise<FocusGroupDTO | null> {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export default async function EditFocusGroupPage({ params }: { params: { id: string } }) {
  const baseUrl = getAppUrl();
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const focusGroupId = Number(resolvedParams.id);
  const group = await fetchGroup(baseUrl, resolvedParams.id);

  // Fetch initial associated events for the table
  let initialEvents: EventDetailsDTO[] = [];
  let initialTotalCount = 0;
  try {
    const eventsData = await fetchAssociatedEvents(focusGroupId, 0, 10, 'startDate,desc');
    initialEvents = eventsData.events;
    initialTotalCount = eventsData.totalCount;
  } catch (err) {
    console.error('Failed to fetch initial associated events:', err);
    // Continue with empty events - component will handle loading
  }

  async function updateFocusGroup(formData: FormData) {
    'use server';
    const payload = {
      id: focusGroupId,
      name: formData.get('name')?.toString().trim() || undefined,
      slug: formData.get('slug')?.toString().trim() || undefined,
      description: formData.get('description')?.toString() || undefined,
      coverImageUrl: formData.get('coverImageUrl')?.toString() || undefined,
      isActive: formData.getAll('isActive').some(v => String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 'on'),
      updatedAt: new Date().toISOString(),
    } as any;
    await fetch(`${baseUrl}/api/proxy/focus-groups/${resolvedParams.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    redirect('/admin/focus-groups');
  }

  return (
    <div className="px-8 pt-24 pb-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Edit Focus Group</h1>
      <FocusGroupEditForm
        group={group}
        focusGroupId={focusGroupId}
        updateFocusGroup={updateFocusGroup}
        initialEvents={initialEvents}
        initialTotalCount={initialTotalCount}
      />
    </div>
  );
}


