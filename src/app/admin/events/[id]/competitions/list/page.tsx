import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import EventCompetitionList from '@/components/admin/competitions/EventCompetitionList';
import { fetchCompetitionsForEventServer } from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionListPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const competitions = await fetchCompetitionsForEventServer(eventId);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/settings`} className="text-blue-600 text-sm hover:underline">
        ← Competitions
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Competitions</h1>
      <CompetitionAdminNav eventId={eventId} />
      <EventCompetitionList eventId={eventId} competitions={competitions} />
    </div>
  );
}
