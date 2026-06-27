import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchAdminProfileServer } from './manage-usage/ApiServerActions';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';
import { isAdminRole } from '@/lib/utils';

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Admin Layout - Protects all /admin/* routes
 *
 * When Clerk is configured, this layout verifies authentication and ADMIN role
 * on the server side, redirecting non-admin users to the homepage.
 *
 * When Clerk is NOT configured (e.g., disabled on Amplify), this layout renders
 * children directly and relies on client-side auth checks in admin pages.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Clerk is not configured, skip server-side auth and let client-side handle it
  if (!CLERK_KEY) {
    console.log('[AdminLayout] Clerk not configured, skipping server-side auth check');
    return <>{children}</>;
  }

  try {
    // CRITICAL: Next.js 15+ requires headers() to be awaited before calling auth()
    const headersList = await headers();

    // Check authentication
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult?.userId || null;
    } catch (authError) {
      // If auth() throws, fall through to client-side protection
      console.warn('[AdminLayout] Auth check failed, deferring to client-side:', authError);
      return <>{children}</>;
    }

    // If not authenticated, redirect to homepage
    if (!userId) {
      redirect('/');
    }

    // Ensure tenant-scoped profile exists for the current user (non-blocking)
    try {
      const u = await currentUser();
      if (u) {
        await bootstrapUserProfile({
          userId,
          userData: {
            email: u.emailAddresses?.[0]?.emailAddress || undefined,
            firstName: u.firstName || undefined,
            lastName: u.lastName || undefined,
            imageUrl: u.imageUrl || undefined,
          }
        });
      }
    } catch (error) {
      console.error('[AdminLayout] Error bootstrapping user profile (non-fatal):', error);
    }

    // Fetch user profile to check admin role
    let userProfile = null;
    try {
      userProfile = await fetchAdminProfileServer(userId);
    } catch (error) {
      console.error('[AdminLayout] Error fetching user profile:', error);
      // Can't verify admin status — defer to client-side checks
      return <>{children}</>;
    }

    // Check if user has ADMIN or SUPER_ADMIN role
    const isAdmin = isAdminRole(userProfile?.userRole);

    if (!isAdmin) {
      console.warn(
        `[AdminLayout] User ${userId} does not have ADMIN/SUPER_ADMIN role. ` +
        `Role: ${userProfile?.userRole || 'NONE'}, Status: ${userProfile?.userStatus || 'NONE'}`
      );
      redirect('/');
    }

    // User is authenticated and has ADMIN role
    return <>{children}</>;
  } catch (error: any) {
    // NEXT_REDIRECT is thrown by redirect() — let it propagate
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // For other errors, defer to client-side protection
    console.error('[AdminLayout] Unexpected error:', error);
    return <>{children}</>;
  }
}

