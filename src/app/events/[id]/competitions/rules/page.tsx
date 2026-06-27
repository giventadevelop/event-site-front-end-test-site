import Link from 'next/link';
import RulesContent from '@/components/competitions/RulesContent';
import { fetchPublicContentBlocksServer } from '../ApiServerActions';

export default async function CompetitionRulesPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;
  const blocks = await fetchPublicContentBlocksServer(eventId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/events/${eventId}/competitions`} className="text-sm text-primary hover:underline">
        ← Competitions
      </Link>
      <h1 className="font-heading font-semibold text-3xl mt-2 mb-8">Rules & information</h1>
      <RulesContent blocks={blocks} />
    </div>
  );
}
