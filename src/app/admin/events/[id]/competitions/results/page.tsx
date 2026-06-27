import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import CompetitionResultsEntryGrid from '@/components/admin/competitions/CompetitionResultsEntryGrid';
import {
  fetchCompetitionResultsForEventServer,
  fetchCompetitionRegistrationsForEventServer,
  fetchCompetitionsForEventServer,
  fetchCompetitionSettingsForEventServer,
} from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionResultsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const [results, registrations, competitions, settings] = await Promise.all([
    fetchCompetitionResultsForEventServer(eventId),
    fetchCompetitionRegistrationsForEventServer(eventId),
    fetchCompetitionsForEventServer(eventId),
    fetchCompetitionSettingsForEventServer(eventId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/settings`} className="text-blue-600 text-sm hover:underline">
        ← Competitions
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Results</h1>
      <CompetitionAdminNav eventId={eventId} />
      <CompetitionResultsEntryGrid
        eventId={eventId}
        competitions={competitions}
        registrations={registrations}
        initialResults={results}
        settings={settings}
      />
    </div>
  );
}
