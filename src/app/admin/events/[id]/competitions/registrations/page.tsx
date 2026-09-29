import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import CompetitionAdminHelpStrip from '@/components/admin/competitions/CompetitionAdminHelpStrip';
import CompetitionRegistrationAdminTable from '@/components/admin/competitions/CompetitionRegistrationAdminTable';
import { fetchCompetitionRegistrationsForEventServer } from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionRegistrationsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const registrations = await fetchCompetitionRegistrationsForEventServer(eventId);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/list`} className="text-blue-600 text-sm hover:underline">
        ← Competitions catalog
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Registrations</h1>
      <CompetitionAdminHelpStrip
        title="Competition registrations"
        summary="Who signed up for each competition."
        help="Who signed up for each competition. Confirm or review registrations here, then add placements on the Results page."
      />
      <CompetitionAdminNav eventId={eventId} />
      <CompetitionRegistrationAdminTable registrations={registrations} />
    </div>
  );
}
