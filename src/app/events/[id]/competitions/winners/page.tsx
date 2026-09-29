import CompetitionSubpageLayout from '@/components/competitions/CompetitionSubpageLayout';
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
    <CompetitionSubpageLayout
      eventId={eventId}
      title="Winners"
      active="winners"
      registrationOpen={settings?.registrationOpen ?? false}
    >
      <PublishedWinnersView results={results} championEnabled={settings?.championEnabled} />
    </CompetitionSubpageLayout>
  );
}
