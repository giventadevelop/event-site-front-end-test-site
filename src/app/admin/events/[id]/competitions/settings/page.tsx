import { safeAuth } from '@/lib/safe-auth';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import EventCompetitionSettingsForm from '@/components/admin/competitions/EventCompetitionSettingsForm';
import { fetchCompetitionSettingsForEventServer } from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionSettingsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;

  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const [event, settings] = await Promise.all([
    fetchEventDetailsServer(Number(eventId)),
    fetchCompetitionSettingsForEventServer(eventId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <div className="mb-6">
        <Link href={`/admin/events/${eventId}`} className="text-blue-600 hover:underline text-sm">
          ← Back to event
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Competition settings{event?.title ? ` — ${event.title}` : ''}
        </h1>
      </div>
      <CompetitionAdminNav eventId={eventId} />
      <EventCompetitionSettingsForm eventId={eventId} initialSettings={settings} />
    </div>
  );
}
