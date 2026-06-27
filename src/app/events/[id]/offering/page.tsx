import { unstable_noStore } from 'next/cache';
import { getDonationCheckoutData } from '../donation/DonationServerData';
import MassOfferingClient from './MassOfferingClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - Fetches data on server before rendering
 */
export default async function MassOfferingPage({ params }: PageProps) {
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  console.log('[MassOfferingPage SERVER] Fetching data for event:', eventId);

  try {
    const checkoutData = await getDonationCheckoutData(eventId);

    if (!checkoutData.isDonationBased) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Offerings Not Available
            </h1>
            <p className="text-gray-600 mb-6">
              This event does not support offerings.
            </p>
            <a
              href={`/events/${eventId}`}
              className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Return to Event
            </a>
          </div>
        </div>
      );
    }

    return <MassOfferingClient initialData={checkoutData} eventId={eventId} />;
  } catch (error) {
    console.error('[MassOfferingPage SERVER] Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Offering Page
          </h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the offering page. Please try again later.
          </p>
          <a
            href={`/events/${eventId}`}
            className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Return to Event
          </a>
        </div>
      </div>
    );
  }
}
