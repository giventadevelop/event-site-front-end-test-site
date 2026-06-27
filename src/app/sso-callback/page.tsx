'use client';

/**
 * SSO Callback Page
 *
 * Clerk redirects here after OAuth authentication.
 * This page handles the final authentication step and syncs user to backend.
 */

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const { isLoaded: authLoaded, userId } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function syncUserToBackend() {
      if (!authLoaded || !userLoaded) return;

      if (userId && user) {
        try {
          console.log('[SSO Callback] Syncing user to backend:', user.primaryEmailAddress?.emailAddress);

          const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_demo_001';

          // Sync user to backend multi-tenant system
          const response = await fetch('/api/clerk/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkUserId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              tenantId: tenantId,
            }),
          });

          if (response.ok) {
            console.log('[SSO Callback] User synced successfully');
            // Redirect to home or dashboard
            router.push('/');
          } else {
            console.error('[SSO Callback] Failed to sync user:', await response.text());
            router.push('/?error=sync_failed');
          }
        } catch (error) {
          console.error('[SSO Callback] Error syncing user:', error);
          router.push('/?error=sync_error');
        }
      } else {
        // No user authenticated, redirect to sign-in
        router.push('/sign-in');
      }
    }

    syncUserToBackend();
  }, [authLoaded, userLoaded, userId, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <h2 className="mt-4 text-xl font-semibold">Completing sign in...</h2>
        <p className="mt-2 text-gray-600">Please wait</p>
      </div>
    </div>
  );
}
