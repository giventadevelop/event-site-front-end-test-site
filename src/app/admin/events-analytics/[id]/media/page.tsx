import { fetchUserProfileServer, fetchMediaServer, fetchOfficialDocsServer } from './ApiServerActions';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
import { safeAuth } from '@/lib/safe-auth';
import { MediaClientPage } from './MediaClientPage';

interface UploadMediaPageProps { params: { id: string } }

export default async function UploadMediaPage({ params }: UploadMediaPageProps) {
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const eventId = resolvedParams.id;
  const mediaList = eventId ? await fetchMediaServer(eventId) : [];
  const eventDetails = eventId ? await fetchEventDetailsServer(eventId) : null;
  const officialDocsList = eventId ? await fetchOfficialDocsServer(eventId) : [];
  const { userId } = await safeAuth();
  let userProfileId = null;
  if (userId) {
    try {
      const profile = await fetchUserProfileServer(userId);
      userProfileId = profile?.id ?? null;
    } catch {
      userProfileId = null;
    }
  }
  return (
    <MediaClientPage
      eventId={eventId}
      mediaList={mediaList}
      eventDetails={eventDetails}
      officialDocsList={officialDocsList}
      userProfileId={userProfileId}
    />
  );
}