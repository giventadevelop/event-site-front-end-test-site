import { unstable_noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { getEventcubeCheckoutData } from './EventcubeCheckoutServerData';
import EventcubeCheckoutClient from './EventcubeCheckoutClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Event Cube embed checkout page.
 * URL: /events/[id]/eventcube-checkout
 * For ticketed events with Event Cube; shows event hero at top and embedded Event Cube iframe.
 */
export default async function EventcubeCheckoutPage({ params }: PageProps) {
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const checkoutData = await getEventcubeCheckoutData(eventId);
    return (
      <EventcubeCheckoutClient initialData={checkoutData} eventId={eventId} />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('not found') || message.includes('Event not found')) {
      notFound();
    }
    if (
      message.includes('does not support Event Cube embed') ||
      message.includes('Event Cube is not configured')
    ) {
      notFound();
    }
    console.error('[EventcubeCheckoutPage] Error:', error);
    throw error;
  }
}
