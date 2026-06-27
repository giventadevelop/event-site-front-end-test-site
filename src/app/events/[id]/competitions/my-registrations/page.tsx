import Link from 'next/link';
import { redirect } from 'next/navigation';
import MyRegistrationsList from '@/components/competitions/MyRegistrationsList';
import {
  fetchMyRegistrationsForEventServer,
  getAuthenticatedClerkUserId,
} from '../ApiServerActions';

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/events/${eventId}/competitions`} className="text-sm text-primary hover:underline">
        ← Competitions
      </Link>
      <h1 className="font-heading font-semibold text-3xl mt-2 mb-8">My registrations</h1>
      <MyRegistrationsList
        eventId={eventId}
        registrations={registrations}
        paymentSuccess={searchParams.payment === 'success'}
      />
    </div>
  );
}
