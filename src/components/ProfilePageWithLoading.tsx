'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { UserProfileDTO } from '@/types';
import ProfileForm from '@/components/ProfileForm';
import ErrorDialog from '@/components/ErrorDialog';
import { ProfileBootstrapper } from '@/components/ProfileBootstrapper';
import Image from 'next/image';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import subpageStyles from '@/components/SubpageHomeDesign.module.css';

/**
 * Client-side profile page wrapper that shows loading state
 * while fetching profile data from the server.
 * Receives initialUserId from server to avoid requiring ClerkProvider context.
 */
interface ProfilePageWithLoadingProps {
  initialUserId: string;
  homepageDesign?: boolean;
}

export default function ProfilePageWithLoading({
  initialUserId,
  homepageDesign = false,
}: ProfilePageWithLoadingProps) {
  const userId = initialUserId;
  const isLoaded = true;
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [lastResponseStatus, setLastResponseStatus] = useState<number | null>(null);

  // Clear the signup-redirected flag when user successfully lands on profile page
  // This prevents the flag from persisting and affecting subsequent logins
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded && userId) {
      // Clear the flag if it exists (user completed signup flow)
      const hasJustSignedUp = sessionStorage.getItem('signup-redirected') === 'true';
      if (hasJustSignedUp) {
        console.log('[ProfilePage] ✅ User successfully reached profile page, clearing signup-redirected flag');
        sessionStorage.removeItem('signup-redirected');
      }
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchProfile();
    }
  }, [isLoaded, userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      setShowErrorDialog(false);
      setErrorDetails(null);

      // Call the server action through an API endpoint
      const response = await fetch('/api/profile/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      // Store the response status for later use
      setLastResponseStatus(response.status);

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else {
        const errorText = await response.text();

        if (response.status === 401) {
          // For 401 errors, just log the error but don't prevent the page from showing
          console.log('[ProfilePageWithLoading] 🔄 401 error detected, but continuing to show profile form');
          // Don't set error state for 401s - let the page continue

          // Try to retry once after a shorter delay (reduced from 1000ms to 300ms)
          console.log('[ProfilePageWithLoading] 🔄 Retrying profile fetch after 401 error...');
          setTimeout(() => {
            if (userId) {
              console.log('[ProfilePageWithLoading] 🔄 Retry attempt for user:', userId);
              fetchProfile();
            }
          }, 300); // Reduced delay - 401s are usually auth timing issues that resolve quickly
        } else if (response.status === 500) {
          const errorMessage = 'There is some unexpected error happened. Please try back again later.';
          setError(errorMessage);
          setErrorDetails(errorText);
          setShowErrorDialog(true);
        } else {
          const errorMessage = 'Failed to load profile';
          setError(errorMessage);
          setErrorDetails(errorText);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage = 'There is some unexpected error happened. Please try back again later.';
      setError(errorMessage);
      setErrorDetails(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const pageShellClass = homepageDesign
    ? `${subpageStyles.subpageRoot} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`
    : '';
  const contentWrapClass = homepageDesign
    ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    : '';
  const contentWrapStyle = homepageDesign ? { paddingTop: '120px', paddingBottom: '2rem' as const } : undefined;

  const profileHeader = (
    <div className={`mb-8 ${homepageDesign ? 'text-center' : ''}`}>
      {homepageDesign ? (
        <>
          <HomeSectionTitle className="mb-4">Profile</HomeSectionTitle>
          <p className={`${subpageStyles.pageDescription} text-lg max-w-3xl ${homepageDesign ? 'mx-auto' : ''}`}>
            Manage your account information and preferences.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences.</p>
        </>
      )}
    </div>
  );

  const wrapHomepage = (children: ReactNode) =>
    homepageDesign ? (
      <div className={pageShellClass}>
        <div className={contentWrapClass} style={contentWrapStyle}>
          {profileHeader}
          <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    ) : (
      <div className="max-w-4xl mx-auto">
        {profileHeader}
        {children}
      </div>
    );

  // Show loading state
  if (!isLoaded || loading) {
    const loadingBody = (
      <div
        className={`flex flex-col justify-center items-center w-full py-8 ${
          homepageDesign ? '' : 'min-h-screen'
        }`}
      >
        <div className="relative w-full max-w-6xl">
          <div className="text-center mb-6">
            <p
              className={`text-2xl font-semibold animate-pulse ${
                homepageDesign ? subpageStyles.loadingText : 'text-teal-600'
              }`}
            >
              Please wait while your profile is being loaded..
            </p>
          </div>

          <Image
            src="/images/loading_user_profile.jpeg"
            alt="Loading profile..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
        </div>
      </div>
    );

    if (homepageDesign) {
      return (
        <div className={pageShellClass}>
          <div className={contentWrapClass} style={contentWrapStyle}>
            {profileHeader}
            <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
              {loadingBody}
            </div>
          </div>
        </div>
      );
    }
    return loadingBody;
  }

  // Show error state - only show for non-500 errors
  if (error && !showErrorDialog) {
    return wrapHomepage(
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
      </div>
    );
  }

  // Show profile form
  return (
    <>
      <ProfileBootstrapper />

      {wrapHomepage(
        <>
          {!profile && lastResponseStatus === 401 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                🔄 Profile data is being loaded. If you continue to see this message, please refresh the page.
              </p>
            </div>
          )}

          {!profile && lastResponseStatus !== 401 && userId && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-base font-semibold text-blue-900">
                    Please complete your registration
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Fill in your profile information below to finish setting up your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ProfileForm initialProfile={profile || undefined} />
        </>
      )}

      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Some unexpected error has occurred"
        message="Please try back again later."
      />
    </>
  );
}
