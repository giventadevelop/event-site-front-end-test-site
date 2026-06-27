import Link from 'next/link';
import PublishedWinnersView from '@/components/competitions/PublishedWinnersView';
import { fetchPublishedResultsServer, fetchPublicCompetitionSettingsServer } from '../ApiServerActions';

export default async function CompetitionWinnersPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const [results, settings] = await Promise.all([
    fetchPublishedResultsServer(eventId),
    fetchPublicCompetitionSettingsServer(eventId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/events/${eventId}/competitions`} className="text-sm text-primary hover:underline">
        ← Competitions
      </Link>
      <h1 className="font-heading font-semibold text-3xl mt-2 mb-8">Winners</h1>
      <PublishedWinnersView results={results} championEnabled={settings?.championEnabled} />
    </div>
  );
}
