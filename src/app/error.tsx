'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary – catches errors from layout and page and logs them.
 * Use Amplify/CloudWatch logs and search for "[ROOT-ERROR]" to find the cause of 500s.
 */
export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ROOT-ERROR] Caught error:', error?.message);
    console.error('[ROOT-ERROR] Digest:', error?.digest);
    console.error('[ROOT-ERROR] Stack:', error?.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          This page is temporarily unavailable. Please try again or return to the home page.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Try again
          </button>
          <a
            href="/"
            className="block w-full border border-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
          >
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
}
