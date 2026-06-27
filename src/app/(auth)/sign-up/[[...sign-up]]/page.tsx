// Satellite domain - redirect to primary domain for authentication
// For localhost - show Clerk component directly for development
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

export default function SignUpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const clerk = useClerk();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isPrimaryDomain, setIsPrimaryDomain] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();

  // Enhanced fallback: Redirect to /profile if user signs in on this page or lands on home page
  // This ensures redirect happens even if afterSignUp callback doesn't run
  // IMPORTANT: Only set the 'signup-redirected' flag if we're actually on the signup page
  // to prevent it from affecting subsequent logins
  useEffect(() => {
    // Only run this fallback if we're on the signup page and user just signed in
    // OR if user is on home page after signup (Clerk redirected them there)
    if (isLoaded && isSignedIn && userId && user && !hasHandledRedirect && typeof window !== 'undefined') {
      const currentPath = pathname || window.location.pathname;
      
      // Check if we should redirect to /profile
      // Only redirect if we're on the signup page OR if we're on home page with the flag already set
      const isOnSignupPage = currentPath.startsWith('/sign-up');
      const hasJustSignedUpFlag = sessionStorage.getItem('signup-redirected') === 'true';
      const shouldRedirectToProfile = isOnSignupPage || (currentPath === '/' && hasJustSignedUpFlag);
      
      if (shouldRedirectToProfile) {
        console.log('[SignUpPage] 🔄 Fallback: User signed in, ensuring redirect to /profile (current path:', currentPath, ')');
        
        // Mark that we've handled this redirect to prevent loops
        setHasHandledRedirect(true);
        
        // Only set the flag if we're actually on the signup page (user just signed up)
        // Don't set it if we're on home page (that means Clerk already redirected)
        if (isOnSignupPage) {
          sessionStorage.setItem('signup-redirected', 'true');
        }
        
        // Extract serializable data from user object (client reference)
        const userData = {
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
        };
        
        // Bootstrap profile in background, then redirect
        bootstrapUserProfile({ userId, userData })
          .then(() => {
            console.log('[SignUpPage] ✅ Fallback bootstrap completed, redirecting to /profile');
          })
          .catch((err) => {
            console.error('[SignUpPage] ⚠️ Fallback bootstrap failed, but still redirecting:', err);
          })
          .finally(() => {
            // Always redirect to /profile after signup (never to home page)
            const finalRedirectUrl = redirectUrl ? `${redirectUrl}/profile` : '/profile';
            console.log('[SignUpPage] 🎯 Fallback redirecting to /profile:', finalRedirectUrl);
            // Small delay to ensure any pending operations complete
            setTimeout(() => {
              window.location.href = finalRedirectUrl;
            }, 100);
          });
      }
    }
  }, [isLoaded, isSignedIn, userId, user, pathname, hasHandledRedirect, redirectUrl]);

  useEffect(() => {
    // Check if we're on a satellite domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Check if localhost - show Clerk component for development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
        return;
      }

      // Get primary domain from environment variable
      const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';
      const isPrimary = hostname === primaryDomain || hostname.includes(primaryDomain.replace('www.', ''));

      // If on primary domain, handle redirect_url parameter
      if (isPrimary) {
        setIsPrimaryDomain(true);
        // Get redirect_url from query params if present
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect_url');
        if (redirectParam) {
          setRedirectUrl(redirectParam);
        }
        return;
      }

      const isSatellite = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' && !isPrimary;
      if (isSatellite) {
        setShouldRedirect(true);
        // Use Clerk's redirectToSignUp — it reads isSatellite/domain/signUpUrl from
        // the ClerkProvider and adds __clerk_satellite_url so the primary returns
        // here with a __clerk_handshake token that establishes the satellite session.
        // A plain window.location.href to ?redirect_url=... skips that handshake and
        // leaves the satellite with __client_uat=0 forever.
        clerk.redirectToSignUp({ redirectUrl: window.location.origin });
      } else {
        // Default: assume primary domain if not satellite
        setIsPrimaryDomain(true);
      }
    }
  }, [clerk]);

  // Handle profile bootstrap after signup
  // Note: Clerk will handle redirect via afterSignUpUrl prop, so we only bootstrap here
  const handleAfterSignUp = async (createdUser: any) => {
    try {
      console.log('[SignUpPage] 🎯 afterSignUp callback triggered', {
        userId: createdUser?.id,
        hasEmail: !!createdUser?.primaryEmailAddress || !!createdUser?.emailAddresses?.[0],
      });

      // Extract serializable data from createdUser (client reference)
      // This prevents "Cannot access primaryEmailAddress on the server" errors
      const email = createdUser?.primaryEmailAddress?.emailAddress || createdUser?.emailAddresses?.[0]?.emailAddress || "";
      const userData = {
        email,
        firstName: createdUser?.firstName || "",
        lastName: createdUser?.lastName || "",
        imageUrl: createdUser?.imageUrl || "",
      };

      console.log('[SignUpPage] ✅ Signup completed, bootstrapping profile:', {
        userId: createdUser?.id,
        email
      });

      // Set the flag to indicate user just signed up (for home page fallback)
      sessionStorage.setItem('signup-redirected', 'true');

      // Bootstrap profile (Clerk will redirect to /profile via afterSignUpUrl prop)
      await bootstrapUserProfile({ 
        userId: createdUser?.id, 
        userData 
      });

      console.log('[SignUpPage] ✅ Profile bootstrap completed - Clerk will redirect to /profile');
    } catch (err) {
      console.error('[SignUpPage] ⚠️ Profile bootstrap failed (ProfileBootstrapper on /profile will retry):', err);
      // Don't block redirect even if bootstrap fails - ProfileBootstrapper will retry on /profile page
    }
  };

  // Show Clerk component for localhost development or primary domain
  if (isLocalhost || isPrimaryDomain) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 py-2">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">Create Account</h1>
          {isLocalhost && <p className="text-sm text-gray-500 text-center mt-2">(Development Mode)</p>}
        </div>
        <SignUp 
          afterSignUp={handleAfterSignUp}
          afterSignUpUrl="/profile"
          routing="path"
          path="/sign-up"
        />
      </main>
    );
  }

  // Show loading state while redirecting (satellite domain)
  if (shouldRedirect) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign up...</p>
        </div>
      </main>
    );
  }

  // Default: show nothing (will determine redirect/component in useEffect)
  return null;
}