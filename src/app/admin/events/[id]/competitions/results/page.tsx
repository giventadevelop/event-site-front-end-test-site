import { safeAuth } from '@/lib/safe-auth';
import CompetitionAdminNav from '@/components/admin/competitions/CompetitionAdminNav';
import CompetitionAdminHelpStrip from '@/components/admin/competitions/CompetitionAdminHelpStrip';
import CompetitionResultsEntryGrid from '@/components/admin/competitions/CompetitionResultsEntryGrid';
import {
  fetchCompetitionResultsForEventServer,
  fetchCompetitionRegistrationsForEventServer,
  fetchCompetitionsForEventServer,
  fetchCompetitionSettingsForEventServer,
  fetchCompetitionContentBlocksForEventServer,
  reconcileFreeCompetitionRegistrationsServer,
} from '../ApiServerActions';
import { hydrateCompetitionResults, parseResultsPodiumFromBlocks } from '@/lib/competitions/resultsPodium';
import type { EventCompetitionResultDTO } from '@/types';
import Link from 'next/link';

export default async function CompetitionResultsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { userId } = await safeAuth();
  if (!userId) return <div>You must be logged in.</div>;
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;

  let fetchError: string | null = null;
  let rawResults: EventCompetitionResultDTO[] = [];
  try {
    rawResults = await fetchCompetitionResultsForEventServer(eventId, { throwOnError: true });
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : 'Could not load competition results.';
  }

  const [rawRegistrations, competitions, settings, blocks] = await Promise.all([
    fetchCompetitionRegistrationsForEventServer(eventId),
    fetchCompetitionsForEventServer(eventId),
    fetchCompetitionSettingsForEventServer(eventId),
    fetchCompetitionContentBlocksForEventServer(eventId),
  ]);
  const registrations = await reconcileFreeCompetitionRegistrationsServer(
    eventId,
    rawRegistrations
  );
  const results = hydrateCompetitionResults(rawResults, competitions);
  const podiumDrafts = parseResultsPodiumFromBlocks(blocks);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <Link href={`/admin/events/${eventId}/competitions/list`} className="text-blue-600 text-sm hover:underline">
        ← Competitions catalog
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Results</h1>
      <CompetitionAdminHelpStrip
        title="Competition results"
        summary="Enter and publish placements. Mouse over the question mark for details."
        help="Enter and publish placements for this event. Upload a winner photo (portrait) and a photo of the winning work (painting, product, or still). If the public event page already shows Official results from a podium block, import those names here so they become editable table rows."
      />
      <CompetitionAdminNav eventId={eventId} />
      <CompetitionResultsEntryGrid
        eventId={eventId}
        competitions={competitions}
        registrations={registrations}
        initialResults={results}
        settings={settings}
        podiumDrafts={podiumDrafts}
        fetchError={fetchError}
      />
    </div>
  );
}
