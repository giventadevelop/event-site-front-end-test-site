import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompetitionDetailView from '@/components/competitions/CompetitionDetailView';
import {
  fetchPublicCompetitionByIdServer,
  fetchPublicCompetitionDaysServer,
  fetchPublicCompetitionSettingsServer,
} from '../ApiServerActions';

export default async function CompetitionDetailPage(props: {
  params: Promise<{ id: string; compId: string }>;
}) {
  const params = await props.params;
  const eventId = params.id;
  const compId = parseInt(params.compId, 10);

  if (Number.isNaN(compId)) notFound();

  const [competition, days, settings] = await Promise.all([
    fetchPublicCompetitionByIdServer(compId),
    fetchPublicCompetitionDaysServer(eventId),
    fetchPublicCompetitionSettingsServer(eventId),
  ]);

  if (!competition || competition.event?.id !== parseInt(eventId, 10)) {
    notFound();
  }

  const dayId = competition.competitionDay?.id;
  const day = dayId ? days.find((d) => d.id === dayId) ?? competition.competitionDay : null;

  return (
    <CompetitionDetailView
      eventId={eventId}
      competition={competition}
      day={day}
      settings={settings}
      registrationOpen={settings?.registrationOpen ?? false}
    />
  );
}
