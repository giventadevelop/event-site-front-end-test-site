import CompetitionSubpageLayout from '@/components/competitions/CompetitionSubpageLayout';
import MyRegistrationsList from '@/components/competitions/MyRegistrationsList';
import {
  fetchMyRegistrationsForEventServer,
  fetchPublicCompetitionSettingsServer,
  getAuthenticatedClerkUserId,
} from '../ApiServerActions';
import { redirect } from 'next/navigation';

export default async function MyCompetitionRegistrationsPage(props: {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ payment?: string }> | { payment?: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const searchParams =
    props.searchParams && typeof (props.searchParams as Promise<unknown>).then === 'function'
      ? await (props.searchParams as Promise<{ payment?: string }>)
      : (props.searchParams as { payment?: string }) || {};
  const eventId = params.id;

  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/events/${eventId}/competitions/my-registrations`)}`);
  }

  const registrations = await fetchMyRegistrationsForEventServer(eventId, clerkUserId);
  const settings = await fetchPublicCompetitionSettingsServer(eventId);

  return (
    <CompetitionSubpageLayout
      eventId={eventId}
      title="My registrations"
      active="my-registrations"
      registrationOpen={settings?.registrationOpen ?? false}
      contentClassName="max-w-3xl"
    >
      <MyRegistrationsList
        eventId={eventId}
        registrations={registrations}
        paymentSuccess={searchParams.payment === 'success'}
      />
    </CompetitionSubpageLayout>
  );
}
