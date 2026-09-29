import CompetitionSubpageLayout from '@/components/competitions/CompetitionSubpageLayout';
import RulesContent from '@/components/competitions/RulesContent';
import {
  fetchPublicCompetitionSettingsServer,
  fetchPublicContentBlocksServer,
} from '../ApiServerActions';

export default async function CompetitionRulesPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const [blocks, settings] = await Promise.all([
    fetchPublicContentBlocksServer(eventId),
    fetchPublicCompetitionSettingsServer(eventId),
  ]);

  return (
    <CompetitionSubpageLayout
      eventId={eventId}
      title="Rules & information"
      active="rules"
      registrationOpen={settings?.registrationOpen ?? false}
      contentClassName="max-w-4xl"
    >
      <RulesContent blocks={blocks} />
    </CompetitionSubpageLayout>
  );
}
