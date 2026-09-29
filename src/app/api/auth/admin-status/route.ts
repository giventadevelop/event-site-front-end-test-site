import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { resolveTenantAdminStatus } from '@/lib/resolveTenantAdminStatus';

export const dynamic = 'force-dynamic';

/**
 * Returns whether the signed-in Clerk user is a tenant admin (DB user_role).
 * Used by Header after client-side sign-in when SSR isTenantAdmin may be stale.
 *
 * On profile lookup failure, returns lookupFailed: true (not a confirmed non-admin)
 * so the Header can keep the SSR admin flag instead of flickering off.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false, userId: null });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
    const result = await resolveTenantAdminStatus(userId, email);

    return NextResponse.json({
      isAdmin: result.isAdmin,
      userId,
      userRole: result.userRole ?? undefined,
      tenantId: result.tenantId,
      lookupFailed: result.lookupFailed === true,
    });
  } catch (error) {
    console.error('[admin-status] Error:', error);
    return NextResponse.json(
      { isAdmin: false, lookupFailed: true, error: 'lookup_failed' },
      { status: 200 }
    );
  }
}
