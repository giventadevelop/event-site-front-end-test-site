import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import CompetitionAdminHelpStrip from '@/components/admin/competitions/CompetitionAdminHelpStrip';
import EventCompetitionDayList from '@/components/admin/competitions/EventCompetitionDayList';
import { fetchCompetitionDaysForEventServer } from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionDaysPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const days = await fetchCompetitionDaysForEventServer(eventId);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/list`} className="text-blue-600 text-sm hover:underline">
        ← Competitions catalog
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Schedule days</h1>
      <CompetitionAdminHelpStrip
        title="Competition schedule days"
        summary="Schedule competition days for this event."
        help="Schedule competition days for this event. Days appear on public competition pages and can be attached to individual contests in the catalog."
      />
      <CompetitionAdminNav eventId={eventId} />
      <EventCompetitionDayList eventId={eventId} initialDays={days} />
    </div>
  );
}
