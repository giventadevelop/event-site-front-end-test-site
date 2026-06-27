import { unstable_noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { getGivebutterCheckoutData } from './GivebutterCheckoutServerData';
import GivebutterCheckoutClient from './GivebutterCheckoutClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * GiveButter Event Campaign Embed Checkout page.
 * URL: /events/[id]/givebutter-checkout
 * For ticketed fundraiser/charity events with GiveButter; shows event hero at top and embedded widget in center.
 */
export default async function GivebutterCheckoutPage({ params }: PageProps) {
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const checkoutData = await getGivebutterCheckoutData(eventId);
    return (
      <GivebutterCheckoutClient initialData={checkoutData} eventId={eventId} />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('not found') || message.includes('Event not found')) {
      notFound();
    }
    if (
      message.includes('does not support GiveButter embed') ||
      message.includes('GiveButter is not configured')
    ) {
      notFound();
    }
    console.error('[GivebutterCheckoutPage] Error:', error);
    throw error;
  }
}
