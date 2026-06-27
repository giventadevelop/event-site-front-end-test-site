import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * API endpoint to fetch user profile data
 * Used by client components that need loading states
 * Auto-creates user profile if it doesn't exist
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[PROFILE-FETCH-API] 🚀 Profile fetch endpoint called');

    // Get authenticated user from Clerk (single call)
    const { userId: clerkUserId } = await auth();
    const user = await currentUser();

    if (!clerkUserId || !user) {
      console.log('[PROFILE-FETCH-API] ❌ Not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[PROFILE-FETCH-API] ✅ Authenticated user:', clerkUserId);

    // Extract Clerk user data once to pass to fetchUserProfileServer
    // This avoids multiple Clerk API calls in fetchUserProfileServer
    const clerkUserData = {
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Try to fetch existing profile (with Clerk data to avoid extra API calls)
    let profile = await fetchUserProfileServer(clerkUserId, clerkUserData);

    // If profile doesn't exist, create it automatically
    if (!profile) {
      console.log('[PROFILE-FETCH-API] ℹ️ Profile not found, creating automatically...');

      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_demo_001';
      const backendUrl = getApiBaseUrl() || 'http://localhost:8080';

      const syncPayload = {
        clerkUserId: user.id,
        email: clerkUserData.email,
        firstName: clerkUserData.firstName || 'User',
        lastName: clerkUserData.lastName || 'User',
        tenantId: tenantId,
      };

      console.log('[PROFILE-FETCH-API] Sending sync request:', JSON.stringify(syncPayload));

      try {
        // Use centralized JWT retry helper (complies with .cursor/rules/nextjs_api_routes.mdc)
        const syncResponse = await fetchWithJwtRetry(`${backendUrl}/api/clerk/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId,
          },
          body: JSON.stringify(syncPayload),
        }, '[PROFILE-FETCH-API] sync-user');

        const syncResponseText = await syncResponse.text();
        console.log('[PROFILE-FETCH-API] Sync response status:', syncResponse.status);
        console.log('[PROFILE-FETCH-API] Sync response body:', syncResponseText);

        if (syncResponse.ok) {
          console.log('[PROFILE-FETCH-API] ✅ User created successfully, fetching again...');
          // Reduced delay - database commits are usually faster than 500ms
          await new Promise(resolve => setTimeout(resolve, 200));
          // Fetch the newly created profile (with Clerk data to avoid extra calls)
          profile = await fetchUserProfileServer(clerkUserId, clerkUserData);
        } else if (syncResponse.status === 500) {
          // Check if error is due to duplicate key (profile already exists)
          try {
            const errorBody = JSON.parse(syncResponseText);
            if (errorBody.error && errorBody.error.includes('duplicate key value violates unique constraint')) {
              console.log('[PROFILE-FETCH-API] ℹ️ Profile already exists (duplicate key), fetching existing profile...');
              // Profile already exists - fetch it instead of treating as error
              await new Promise(resolve => setTimeout(resolve, 200));
              profile = await fetchUserProfileServer(clerkUserId, clerkUserData);
            } else {
              console.error('[PROFILE-FETCH-API] ❌ Failed to create user:', syncResponse.status, syncResponseText);
            }
          } catch (parseError) {
            // If response is not JSON, check if it contains duplicate key error string
            if (syncResponseText.includes('duplicate key value violates unique constraint')) {
              console.log('[PROFILE-FETCH-API] ℹ️ Profile already exists (duplicate key), fetching existing profile...');
              await new Promise(resolve => setTimeout(resolve, 200));
              profile = await fetchUserProfileServer(clerkUserId, clerkUserData);
            } else {
              console.error('[PROFILE-FETCH-API] ❌ Failed to create user:', syncResponse.status, syncResponseText);
            }
          }
        } else {
          console.error('[PROFILE-FETCH-API] ❌ Failed to create user:', syncResponse.status, syncResponseText);
        }
      } catch (syncError) {
        console.error('[PROFILE-FETCH-API] ❌ Error calling sync-user endpoint:', syncError);
      }
    }

    if (profile) {
      console.log('[PROFILE-FETCH-API] ✅ Profile fetched successfully');
      return NextResponse.json(profile);
    } else {
      console.log('[PROFILE-FETCH-API] ℹ️ No profile found after creation attempt');
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('[PROFILE-FETCH-API] ❌ Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}