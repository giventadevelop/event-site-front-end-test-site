import CompetitionSubpageLayout from '@/components/competitions/CompetitionSubpageLayout';
import CompetitionCatalogBrowse from '@/components/competitions/CompetitionCatalogBrowse';
import {
  fetchPublicCompetitionDaysServer,
  fetchPublicCompetitionsServer,
  fetchPublicCompetitionSettingsServer,
} from '../ApiServerActions';

export default async function CompetitionCatalogPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;

  const [settings, competitions, days] = await Promise.all([
    fetchPublicCompetitionSettingsServer(eventId),
    fetchPublicCompetitionsServer(eventId),
    fetchPublicCompetitionDaysServer(eventId),
  ]);

  return (
    <CompetitionSubpageLayout
      eventId={eventId}
      title="Catalogs"
      active="catalog"
      registrationOpen={settings?.registrationOpen ?? false}
      contentClassName="max-w-5xl"
    >
      <CompetitionCatalogBrowse
        eventId={eventId}
        competitions={competitions}
        days={days}
        registrationOpen={settings?.registrationOpen ?? false}
      />
    </CompetitionSubpageLayout>
  );
}
