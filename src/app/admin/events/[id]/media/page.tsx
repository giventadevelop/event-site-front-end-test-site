import { fetchUserProfileServer, fetchMediaServer, fetchOfficialDocsServer, fetchEventFocusGroupsWithNamesServer } from './ApiServerActions';
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
  let focusGroupOptions: { id: number; name: string }[] = [];
  if (eventId) {
    try {
      const { eventFocusGroups, focusGroupNameByAssociationId } = await fetchEventFocusGroupsWithNamesServer(parseInt(eventId, 10));
      focusGroupOptions = eventFocusGroups
        .filter((efg) => efg.id != null)
        .map((efg) => ({ id: efg.id!, name: focusGroupNameByAssociationId[efg.id!] ?? `Focus group ${efg.id}` }));
    } catch {
      focusGroupOptions = [];
    }
  }
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
      focusGroupOptions={focusGroupOptions}
    />
  );
}
