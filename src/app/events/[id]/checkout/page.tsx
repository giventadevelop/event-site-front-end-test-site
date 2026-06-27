import { getCheckoutData } from './CheckoutServerData';
import CheckoutClient from './CheckoutClient';
import { unstable_noStore } from 'next/cache';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - Fetches data on server before rendering
 * No flickering because data is ready before page renders
 * Uses Next.js cache() for request-level caching
 *
 * NOTE: unstable_noStore() prevents Next.js from caching this page
 * This ensures hero images are always fresh
 */
export default async function CheckoutPage({ params }: PageProps) {
  // Prevent Next.js from caching this page to ensure fresh hero images
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  console.log('[CheckoutPage SERVER] Fetching data for event:', eventId);

  try {
    // Fetch all data on server - NO loading state needed!
    const checkoutData = await getCheckoutData(eventId);

    console.log('[CheckoutPage SERVER] Data fetched, rendering client component');
    console.log('[CheckoutPage SERVER] Hero image URL:', checkoutData.heroImageUrl);
    console.log('[CheckoutPage SERVER] Event ID:', eventId);

    // Pass server-fetched data to client component
    return <CheckoutClient initialData={checkoutData} eventId={eventId} />;
  } catch (error) {
    // Log detailed error information for debugging
    console.error('[CheckoutPage SERVER] Error loading checkout page:', error);
    console.error('[CheckoutPage SERVER] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[CheckoutPage SERVER] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[CheckoutPage SERVER] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Determine user-friendly error message based on error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('Network error') || errorMessage.includes('Unable to reach');
    const isAuthError = errorMessage.includes('Authentication error') || errorMessage.includes('JWT');

    let userMessage = "We're having trouble connecting to our servers. This might be a temporary issue.";
    let technicalHint = "If the problem persists, please contact support or try again later.";

    if (isNetworkError) {
      userMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      technicalHint = "Make sure you're connected to the internet and the server is accessible.";
    } else if (isAuthError) {
      userMessage = "Authentication service is temporarily unavailable. We're working to restore access.";
      technicalHint = "This is likely a temporary issue. Please try again in a few moments.";
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
            Unable to Load Checkout
          </h1>
          <p className="text-gray-600 mb-6">
            {userMessage}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <a
              href="/"
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Return to Home
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            {technicalHint}
          </p>
        </div>
      </div>
    );
  }
}
