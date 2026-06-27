import { currentUser } from '@clerk/nextjs/server';
import { safeAuth } from '@/lib/safe-auth';
import { fetchAdminProfileServer } from './ApiServerActions';
import ManageUsageClient from './ManageUsageClient';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

export default async function ManageUsagePage() {
  // Fix for Next.js 15+: await auth() before using
  const { userId } = await safeAuth();
  let adminProfile = null;
  if (userId) {
    // Add timeout wrapper to prevent hanging
    try {
      // Ensure tenant-scoped profile exists for the current admin user
      const u = await Promise.race([
        currentUser(),
        new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn('[ManageUsage] currentUser() timeout after 10 seconds');
            resolve(null);
          }, 10000)
        )
      ]);

      if (u) {
        // Map Clerk user object to userData format expected by bootstrapUserProfile
        // CRITICAL: Only pass data that exists - don't pass empty strings
        await Promise.race([
          bootstrapUserProfile({
            userId,
            userData: {
              email: u.emailAddresses?.[0]?.emailAddress || undefined,
              firstName: u.firstName || undefined,
              lastName: u.lastName || undefined,
              imageUrl: u.imageUrl || undefined,
            }
          }),
          new Promise<void>((resolve) =>
            setTimeout(() => {
              console.warn('[ManageUsage] bootstrapUserProfile() timeout after 15 seconds');
              resolve();
            }, 15000)
          )
        ]);
      }

      adminProfile = await Promise.race([
        fetchAdminProfileServer(userId),
        new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn('[ManageUsage] fetchAdminProfileServer() timeout after 15 seconds');
            resolve(null);
          }, 15000)
        )
      ]);
    } catch (error) {
      console.error('[ManageUsage] Error fetching admin profile:', error);
      adminProfile = null;
    }
  }
  // Note: We are not fetching all users here anymore to keep it simple.
  // The ManageUsageClient will need to handle fetching users if required.
  return <ManageUsageClient adminProfile={adminProfile} />;
}