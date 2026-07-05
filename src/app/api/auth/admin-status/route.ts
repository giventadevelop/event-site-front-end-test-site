import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { resolveIsTenantAdmin } from '@/lib/resolveTenantAdminStatus';

export const dynamic = 'force-dynamic';

/**
 * Returns whether the signed-in Clerk user is a tenant admin (DB user_role).
 * Used by Header after client-side sign-in when SSR isTenantAdmin may be stale.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false, userId: null });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
    const isAdmin = await resolveIsTenantAdmin(userId, email);

    return NextResponse.json({
      isAdmin,
      userId,
      userRole: isAdmin ? 'ADMIN' : undefined,
    });
  } catch (error) {
    console.error('[admin-status] Error:', error);
    return NextResponse.json({ isAdmin: false, error: 'lookup_failed' }, { status: 200 });
  }
}
