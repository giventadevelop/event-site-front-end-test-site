'use server';

import { auth } from '@clerk/nextjs/server';
import { UserProfileDTO } from '@/types';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

/**
 * Fetch user profile with optimized performance
 * Accepts optional Clerk user data to avoid multiple Clerk API calls
 */
export async function fetchUserProfileServer(
  userId: string,
  clerkUserData?: { email?: string; firstName?: string; lastName?: string }
): Promise<UserProfileDTO | null> {
  const baseUrl = getAppUrl();

  try {
    console.log('[Profile Server] Starting profile fetch for userId:', userId);

    // Step 1: Try to fetch the profile by userId (most common case - should be fast)
    const url = `${baseUrl}/api/proxy/user-profiles/by-user/${userId}`;
    let response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Profile Server] ✅ Profile found by userId');
      // Handle empty array case - return null if no profile found
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      }
      // Handle single object case
      return data && data.id ? data : null;
    }

    // Step 2: Fallback to email lookup (only if userId lookup fails)
    // Use provided Clerk data or fetch once if needed
    let email = clerkUserData?.email;
    if (!email) {
      try {
        const { userId: authUserId } = await auth();
        if (authUserId) {
          const clerkApiKey = process.env.CLERK_SECRET_KEY;
          if (clerkApiKey) {
            const clerkRes = await fetch(`https://api.clerk.dev/v1/users/${authUserId}`, {
              headers: {
                'Authorization': `Bearer ${clerkApiKey}`,
                'Content-Type': 'application/json'
              }
            });
            if (clerkRes.ok) {
              const clerkUser = await clerkRes.json();
              email = clerkUser.email_addresses?.[0]?.email_address || "";
            }
          }
        }
      } catch (error) {
        console.log('[Profile Server] Error getting user email:', error);
      }
    }

    if (email) {
      const emailUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(email)}`;
      const emailRes = await fetch(emailUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (emailRes.ok) {
        const emailData = await emailRes.json();
        // Handle empty array case - return null if no profile found
        let profile = null;
        if (Array.isArray(emailData)) {
          profile = emailData.length > 0 ? emailData[0] : null;
        } else {
          profile = emailData && emailData.id ? emailData : null;
        }

        if (profile && profile.id) {
          console.log('[Profile Server] ✅ Profile found by email');

          // Check if profile needs userId update (async - don't block return)
          if (profile.userId !== userId) {
            console.log('[Profile Server] 🔄 Profile needs userId reconciliation');
            // Fire and forget - don't wait for reconciliation
            fetch(`${baseUrl}/api/proxy/user-profiles/${profile.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/merge-patch+json' },
              body: JSON.stringify({
                id: profile.id,
                userId: userId,
                updatedAt: new Date().toISOString()
              }),
            }).catch(err => console.error('[Profile Server] ⚠️ Profile reconciliation failed:', err));
          }

          return profile;
        }
      }
    }

    // Step 3: Profile not found - return null (let caller handle creation if needed)
    // This avoids duplicate creation logic and reduces latency
    console.log('[Profile Server] ❌ No profile found for userId:', userId);
    return null;

  } catch (error) {
    console.error('[Profile Server] ❌ Critical error in profile fetching:', error);
    return null;
  }
}

/**
 * Update user profile - uses centralized fetchWithJwtRetry helper
 * Complies with .cursor/rules/nextjs_api_routes.mdc standards
 * CRITICAL: Always includes tenantId to comply with multi-tenant architecture
 */
export async function updateUserProfileServer(profileId: number, payload: Partial<UserProfileDTO>): Promise<UserProfileDTO | null> {
  try {
    console.log('[Profile Server] Updating profile:', profileId, 'with payload:', payload);

    // Add id field and tenantId as required by backend conventions
    const patchPayload = {
      id: profileId,
      tenantId: getTenantId(), // CRITICAL: Always include tenantId for multi-tenant support
      ...payload
    };

    // Direct backend call using NEXT_PUBLIC_API_BASE_URL
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
    }

    // Use centralized JWT retry helper (complies with .cursor/rules/nextjs_api_routes.mdc)
    const response = await fetchWithJwtRetry(`${apiBaseUrl}/api/user-profiles/${profileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(patchPayload),
    }, '[Profile Server] update-profile');

    if (response.ok) {
      const updatedProfile = await response.json();
      console.log('[Profile Server] ✅ Profile updated successfully');
      return updatedProfile;
    } else {
      const errorText = await response.text();
      console.error('[Profile Server] ❌ Profile update failed:', response.status, errorText);
      return null;
    }
  } catch (error) {
    console.error('[Profile Server] ❌ Error updating profile:', error);
    return null;
  }
}

export async function createUserProfileServer(payload: Omit<UserProfileDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfileDTO | null> {
  const baseUrl = getAppUrl();

  try {
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        tenantId: getTenantId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function resubscribeEmailServer(email: string, token: string): Promise<boolean> {
  const baseUrl = getAppUrl();

  try {
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles/resubscribe-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
    return response.ok;
  } catch (error) {
    console.error('Error resubscribing email:', error);
    return false;
  }
}

export async function checkEmailSubscriptionServer(email: string): Promise<{ isSubscribed: boolean; token?: string }> {
  const baseUrl = getAppUrl();

  try {
    const url = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(email)}`;
    const response = await fetch(url, { method: 'GET' });

    if (response.ok) {
      const data = await response.json();
      const profile = Array.isArray(data) ? data[0] : data;
      return {
        isSubscribed: !profile?.emailUnsubscribed,
        token: profile?.emailSubscriptionToken
      };
    }
    return { isSubscribed: false };
  } catch (error) {
    console.error('Error checking email subscription:', error);
    return { isSubscribed: false };
  }
}

/**
 * Fetch user profile by email address
 * Note: The proxy handler automatically injects tenantId.equals for security
 */
export async function fetchUserProfileByEmailServer(email: string): Promise<UserProfileDTO | null> {
  const baseUrl = getAppUrl();

  try {
    // The proxy handler automatically adds tenantId.equals for security
    // This ensures we only get profiles for the current tenant
    const url = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(email)}`;
    console.log('[fetchUserProfileByEmailServer] Fetching profile by email:', email);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      const profile = Array.isArray(data) ? data[0] : data;
      console.log('[fetchUserProfileByEmailServer] Profile found:', {
        id: profile?.id,
        email: profile?.email,
        tenantId: profile?.tenantId
      });
      return profile || null;
    }

    console.error('Error fetching profile by email:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching profile by email:', error);
    return null;
  }
}

/**
 * Generate a new email subscription token for a user profile
 * Uses centralized fetchWithJwtRetry helper - complies with .cursor/rules/nextjs_api_routes.mdc
 */
export async function generateEmailSubscriptionTokenServer(profileId: number): Promise<{ success: boolean; token?: string; error?: string }> {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  try {
    // Generate a new token (UUID-like string)
    const newToken = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Update the user profile with the new token using centralized JWT retry helper
    const url = `${getApiBase()}/api/user-profiles/${profileId}`;
    const response = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({
        id: profileId, // Include ID for PATCH operations
        tenantId: getTenantId(), // Include tenantId for multi-tenant support
        emailSubscriptionToken: newToken,
        isEmailSubscribed: true,
        updatedAt: new Date().toISOString()
      }),
    }, '[generateEmailSubscriptionTokenServer]');

    if (response.ok) {
      console.log('[generateEmailSubscriptionTokenServer] Successfully generated token:', newToken);
      return { success: true, token: newToken };
    } else {
      const errorText = await response.text();
      console.error('Error generating email subscription token:', response.status, errorText);
      return { success: false, error: `Failed to generate token: ${response.status}` };
    }
  } catch (error) {
    console.error('Error generating email subscription token:', error);
    return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}