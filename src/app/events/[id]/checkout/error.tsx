'use client';

import { useEffect } from 'react';
import MobileDebugConsole from '@/components/MobileDebugConsole';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js Error Boundary for Checkout Page
 * Catches any errors during rendering and displays a friendly message
 * This prevents users from seeing stack traces
 */
export default function CheckoutError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for debugging
    console.error('[Checkout Error Boundary] Error caught:', error);
    console.error('[Checkout Error Boundary] Error message:', error.message);
    console.error('[Checkout Error Boundary] Error stack:', error.stack);
  }, [error]);

  // Determine user-friendly error message based on error type
  const errorMessage = error.message || String(error);
  const isNetworkError =
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('Network error') ||
    errorMessage.includes('Unable to reach') ||
    errorMessage.includes('ECONNREFUSED');
  const isAuthError =
    errorMessage.includes('Authentication error') ||
    errorMessage.includes('JWT') ||
    errorMessage.includes('authenticate');

  let userMessage = "We're having trouble loading the checkout page. This might be a temporary issue.";
  let technicalHint = "If the problem persists, please contact support or try again later.";

  if (isNetworkError) {
    userMessage = "Unable to connect to the server. Please check your internet connection and try again.";
    technicalHint = "Make sure you're connected to the internet and the server is accessible.";
  } else if (isAuthError) {
    userMessage = "Authentication service is temporarily unavailable. We're working to restore access.";
    technicalHint = "This is likely a temporary issue. Please try again in a few moments.";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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
            onClick={() => {
              // Try to reset the error boundary
              reset();
            }}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Try Again
          </button>

          <button
            onClick={() => {
              // Hard reload the page
              window.location.reload();
            }}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Reload Page
          </button>

          <a
            href="/"
            className="block w-full bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Return to Home
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          {technicalHint}
        </p>

        {/* Show error code in development only */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
            <p className="font-mono text-gray-700">Error ID: {error.digest}</p>
          </div>
        )}
      </div>

      {/* Mobile Debug Console - Always visible on error pages for log copying */}
      <MobileDebugConsole />
    </div>
  );
}
