import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CompetitionSubpageLayout from '@/components/competitions/CompetitionSubpageLayout';
import RegistrationWizard from '@/components/competitions/RegistrationWizard';
import {
  fetchMyParticipantsServer,
  fetchPublicCompetitionByIdServer,
  fetchPublicCompetitionDaysServer,
  fetchPublicCompetitionsServer,
  fetchPublicCompetitionSettingsServer,
  getAuthenticatedClerkUserId,
} from '../ApiServerActions';

export default async function CompetitionRegisterPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ competitionId?: string; step?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const eventId = params.id;
  const preselectedCompetitionId = searchParams.competitionId
    ? parseInt(searchParams.competitionId, 10)
    : undefined;
  const initialStep = searchParams.step;

  const clerkUserId = await getAuthenticatedClerkUserId();
  const registerPath = preselectedCompetitionId
    ? `/events/${eventId}/competitions/register?competitionId=${preselectedCompetitionId}`
    : `/events/${eventId}/competitions/register`;
  if (!clerkUserId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(registerPath)}`);
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const [settings, competitions, days, participants, preselectedCompetition] = await Promise.all([
    fetchPublicCompetitionSettingsServer(eventId),
    fetchPublicCompetitionsServer(eventId),
    fetchPublicCompetitionDaysServer(eventId),
    fetchMyParticipantsServer(clerkUserId),
    preselectedCompetitionId ? fetchPublicCompetitionByIdServer(preselectedCompetitionId) : Promise.resolve(null),
  ]);

  if (!settings) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p>Competition settings are not configured for this event yet.</p>
        <Link href={`/events/${eventId}/competitions`} className="text-primary hover:underline">
          Back to competitions
        </Link>
      </div>
    );
  }

  return (
    <CompetitionSubpageLayout
      eventId={eventId}
      title="Register"
      active="register"
      registrationOpen={settings.registrationOpen ?? false}
      contentClassName="max-w-4xl"
    >
      {preselectedCompetition && (
        <p className="text-muted-foreground mb-8">
          Registering for: <span className="font-semibold text-foreground">{preselectedCompetition.name}</span>
        </p>
      )}
      <RegistrationWizard
        eventId={eventId}
        settings={settings}
        competitions={competitions}
        days={days}
        clerkUserId={clerkUserId}
        existingParticipants={participants}
        userEmail={userEmail}
        preselectedCompetitionId={
          preselectedCompetition?.id && preselectedCompetition.event?.id === parseInt(eventId, 10)
            ? preselectedCompetition.id
            : undefined
        }
        initialStep={initialStep}
      />
    </CompetitionSubpageLayout>
  );
}
