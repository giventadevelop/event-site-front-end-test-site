'use client';

/**
 * OAuth Callback Handler Page
 *
 * Handles OAuth redirects from backend after social authentication
 * Processes success/error states and completes login flow
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error from OAuth flow
        const oauthError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (oauthError) {
          console.error('OAuth error:', oauthError, errorDescription);
          setError(errorDescription || 'Authentication failed. Please try again.');
          setIsProcessing(false);

          // Redirect to sign-in after 3 seconds
          setTimeout(() => {
            router.push('/sign-in');
          }, 3000);
          return;
        }

        // Check for success
        const success = searchParams.get('success');

        if (success === 'true') {
          // Extract user data from query parameters
          const userId = searchParams.get('user_id');
          const email = searchParams.get('email');
          const firstName = searchParams.get('first_name');
          const lastName = searchParams.get('last_name');
          const redirectUrl = searchParams.get('redirect') || '/';

          console.log('OAuth success:', { userId, email, firstName, lastName });

          // TODO: Store user data in AuthContext or localStorage
          // For now, we'll just redirect to the intended page
          // The backend should have set appropriate cookies/tokens

          // Use full page reload to ensure Header and auth state update
          window.location.href = redirectUrl;
        } else {
          // No success or error parameter - invalid callback
          setError('Invalid callback. Please try signing in again.');
          setIsProcessing(false);

          setTimeout(() => {
            router.push('/sign-in');
          }, 3000);
        }
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsProcessing(false);

        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
            Authentication Failed
          </h2>
          <p className="mt-2 text-center text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-center text-gray-500">
            Redirecting to sign-in page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </h2>
        <p className="mt-2 text-center text-gray-600">Please wait</p>
      </div>
    </div>
  );
}
