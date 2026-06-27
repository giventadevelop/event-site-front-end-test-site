import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';
import CompetitionHub from '@/components/competitions/CompetitionHub';
import {
  fetchPublicCompetitionDaysServer,
  fetchPublicCompetitionsServer,
  fetchPublicCompetitionSettingsServer,
} from './ApiServerActions';

export default async function CompetitionsHubPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;

  const [settings, days, competitions, eventRes] = await Promise.all([
    fetchPublicCompetitionSettingsServer(eventId),
    fetchPublicCompetitionDaysServer(eventId),
    fetchPublicCompetitionsServer(eventId),
    fetchWithJwtRetry(`${getApiBaseUrl()}/api/event-details/${eventId}`, { cache: 'no-store' }).catch(
      () => null
    ),
  ]);

  let eventTitle = 'Event';
  if (eventRes?.ok) {
    const event = (await eventRes.json()) as EventDetailsDTO;
    eventTitle = event.title || eventTitle;
  }

  return (
    <CompetitionHub
      eventId={eventId}
      eventTitle={eventTitle}
      settings={settings}
      competitions={competitions}
      days={days}
      registrationOpen={settings?.registrationOpen ?? false}
    />
  );
}
