import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import EventCompetitionForm from '@/components/admin/competitions/EventCompetitionForm';
import { fetchCompetitionByIdServer, fetchCompetitionDaysForEventServer } from '../../ApiServerActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditCompetitionPage(props: {
  params: Promise<{ id: string; compId: string }> | { id: string; compId: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const compId = parseInt(params.compId, 10);
  const [competition, days] = await Promise.all([
    fetchCompetitionByIdServer(compId),
    fetchCompetitionDaysForEventServer(eventId),
  ]);
  if (!competition) notFound();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/list`} className="text-blue-600 text-sm hover:underline">
        ← Back to list
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Edit competition</h1>
      <CompetitionAdminNav eventId={eventId} />
      <EventCompetitionForm eventId={eventId} days={days} competition={competition} />
    </div>
  );
}
