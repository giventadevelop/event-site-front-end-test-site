import { getCheckoutData } from '../checkout/CheckoutServerData';
import ManualCheckoutClient from './ManualCheckoutClient';
import { unstable_noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - Fetches data on server before rendering
 * Checks payment_flow_mode and redirects if manual payment is not enabled
 */
export default async function ManualCheckoutPage({ params }: PageProps) {
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  console.log('[ManualCheckoutPage SERVER] Fetching data for event:', eventId);

  try {
    // Fetch event details to check payment_flow_mode
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
    if (!getApiBase()) {
      throw new Error('API_BASE_URL not configured');
    }

    const tenantId = getTenantId();
    const eventRes = await fetchWithJwtRetry(
      `${getApiBase()}/api/event-details/${eventId}`,
      { cache: 'no-store' }
    );

    // Handle different error status codes with user-friendly messages
    if (!eventRes.ok) {
      const status = eventRes.status;

      if (status === 404) {
        // Event not found - show friendly 404 page
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Event Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't find the event you're looking for. It may have been removed or the link may be incorrect.
              </p>
              <div className="space-y-3">
                <Link
                  href="/events"
                  className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Browse All Events
                </Link>
                <Link
                  href="/"
                  className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        );
      }

      // For other errors, throw to be caught by catch block
      throw new Error(`Failed to fetch event: ${status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();

    // Check if manual payment is enabled for this event
    if (!event.manualPaymentEnabled || event.paymentFlowMode === 'STRIPE_ONLY') {
      // Redirect to regular checkout if manual payment is not enabled
      redirect(`/events/${eventId}/checkout`);
    }

    // Fetch checkout data (same as regular checkout)
    const checkoutData = await getCheckoutData(eventId);

    console.log('[ManualCheckoutPage SERVER] Data fetched, rendering client component');

    // Pass server-fetched data to client component
    return <ManualCheckoutClient initialData={checkoutData} eventId={eventId} event={event} />;
  } catch (error) {
    // Log detailed error information for debugging
    console.error('[ManualCheckoutPage SERVER] Error loading manual checkout page:', error);
    console.error('[ManualCheckoutPage SERVER] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[ManualCheckoutPage SERVER] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[ManualCheckoutPage SERVER] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Determine user-friendly error message based on error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('Network error') || errorMessage.includes('Unable to reach');
    const isAuthError = errorMessage.includes('Authentication error') || errorMessage.includes('JWT');
    const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('API_BASE_URL');

    let userMessage = "We're having trouble loading the manual payment checkout page. This might be a temporary issue.";
    let technicalHint = "If the problem persists, please contact support or try again later.";
    let showTryAgain = true;
    let showReturnToEvent = true;

    if (isNetworkError) {
      userMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      technicalHint = "Make sure you're connected to the internet and the server is accessible.";
    } else if (isAuthError) {
      userMessage = "Authentication service is temporarily unavailable. We're working to restore access.";
      technicalHint = "This is likely a temporary issue. Please try again in a few moments.";
    } else if (isConfigError) {
      userMessage = "The checkout system is temporarily unavailable due to a configuration issue.";
      technicalHint = "Please contact support if this problem continues.";
      showReturnToEvent = false;
    } else if (errorMessage.includes('404')) {
      userMessage = "The event you're looking for could not be found. It may have been removed or the link may be incorrect.";
      technicalHint = "Please check the event link or browse our events page to find what you're looking for.";
      showTryAgain = false;
      showReturnToEvent = false;
    }

    // Graceful error UI
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
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
            Unable to Load Manual Payment Checkout
          </h1>
          <p className="text-gray-600 mb-6">
            {userMessage}
          </p>
          <div className="space-y-3">
            {showTryAgain && (
              <Link
                href={`/events/${eventId}/manual-checkout`}
                className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium text-center"
              >
                Try Again
              </Link>
            )}
            {showReturnToEvent && (
              <Link
                href={`/events/${eventId}`}
                className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Return to Event
              </Link>
            )}
            <Link
              href="/events"
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Browse All Events
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Return to Home
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            {technicalHint}
          </p>
        </div>
      </div>
    );
  }
}
