import { safeAuth } from '@/lib/safe-auth';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import CompetitionAdminHelpStrip from '@/components/admin/competitions/CompetitionAdminHelpStrip';
import EventCompetitionSettingsForm from '@/components/admin/competitions/EventCompetitionSettingsForm';
import { fetchCompetitionSettingsForEventServer } from '../ApiServerActions';
import Link from 'next/link';

export default async function CompetitionSettingsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;

  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const [event, settings] = await Promise.all([
    fetchEventDetailsServer(Number(eventId)),
    fetchCompetitionSettingsForEventServer(eventId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href={`/admin/events/${eventId}/competitions/list`} className="text-blue-600 hover:underline">
            ← Competitions catalog
          </Link>
          <Link href={`/admin/events/${eventId}`} className="text-blue-600 hover:underline">
            ← Back to event
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Competition settings{event?.title ? ` — ${event.title}` : ''}
        </h1>
      </div>
      <CompetitionAdminHelpStrip
        title="Competition settings"
        summary="Scoring, eligibility, and how results appear on the public event page."
        help="Scoring, eligibility, and how placements display on the public event page. After saving settings, open the Competitions catalog to add age groups or categories, then enter Results when judging is complete."
      />
      <CompetitionAdminNav eventId={eventId} />
      <EventCompetitionSettingsForm eventId={eventId} initialSettings={settings} />
    </div>
  );
}
