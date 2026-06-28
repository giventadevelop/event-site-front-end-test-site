'use client';

/**
 * Sign-out redirect page (primary domain only).
 *
 * Used when a user signs out from a satellite domain (e.g. mosc-temp.com).
 * The satellite redirects here; this page calls Clerk signOut() then redirects
 * the user back to the satellite (redirect_url). Required for satellite/primary
 * Clerk setup so the session is cleared on the primary and the user returns to
 * the satellite as signed out.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export default function SignOutRedirectPage() {
  const searchParams = useSearchParams();
  const { signOut } = useClerk();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const runSignOut = async () => {
      const redirectUrlRaw = searchParams?.get('redirect_url') ?? '';
      let decoded = typeof redirectUrlRaw === 'string' ? redirectUrlRaw : '';
      try {
        if (decoded && decoded.includes('%')) decoded = decodeURIComponent(decoded);
      } catch {
        // leave decoded as-is
      }

      // Only allow redirect to known satellite or localhost; otherwise send to /
      const allowedHost =
        decoded.startsWith('http') &&
        (decoded.includes('mosc-temp.com') || decoded.includes('localhost'));
      const baseUrl = allowedHost ? decoded.replace(/\/$/, '') : '';
      const finalUrl = baseUrl
        ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}clerk_signout=true`
        : '/';

      if (!signOut) {
        // Clerk not ready yet; redirect anyway so user isn't stuck
        window.location.href = finalUrl;
        return;
      }

      try {
        await signOut();
        if (cancelled) return;
        window.location.href = finalUrl;
      } catch (err) {
        if (cancelled) return;
        console.error('[signout-redirect] Sign out failed:', err);
        setError('Sign out failed. Redirecting...');
        setTimeout(() => {
          window.location.href = finalUrl;
        }, 2000);
      }
    };

    runSignOut();
    return () => {
      cancelled = true;
    };
  }, [searchParams, signOut]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}
