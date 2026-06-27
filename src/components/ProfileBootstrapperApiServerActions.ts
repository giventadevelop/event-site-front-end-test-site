"use server";
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

// Lazy getter - evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function bootstrapUserProfile({
  userId,
  userData
}: {
  userId: string,
  userData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }
}) {
  if (!userId) return;
  try {
    const tenantId = getTenantId();
    let token = await getCachedApiJwt();

    /** Backend TenantContextFilter + getUserProfileByUserId require X-Tenant-ID (query alone is not enough). */
    const tenantAuthHeaders = (t: string, extra?: Record<string, string>) => ({
      Authorization: `Bearer ${t}`,
      'X-Tenant-ID': tenantId,
      ...extra,
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // 1. Try to fetch by userId + tenantId
    // CRITICAL: If profile exists with correct userId, do NOT update anything
    // This prevents overwriting existing firstName, lastName, email fields
    let res = await fetch(`${getApiBase()}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`, {
      headers: tenantAuthHeaders(token),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (res.status === 401) {
      clearTimeout(timeout);
      const newController = new AbortController();
      const newTimeout = setTimeout(() => newController.abort(), 15000);
      token = await generateApiJwt();
      res = await fetch(`${getApiBase()}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`, {
        headers: tenantAuthHeaders(token),
        cache: 'no-store',
        signal: newController.signal,
      });
      clearTimeout(newTimeout);
    } else {
      clearTimeout(timeout);
    }

    // CRITICAL: If profile exists with correct userId + tenantId, return immediately
    // Do NOT update anything - preserve all existing fields
    if (res.ok) {
      const existingProfile = await res.json();
      console.log('[bootstrapUserProfile] ✅ Profile exists with correct userId, preserving all existing fields:', {
        id: existingProfile?.id,
        userId: existingProfile?.userId,
        firstName: existingProfile?.firstName || '(empty)',
        lastName: existingProfile?.lastName || '(empty)',
        email: existingProfile?.email || '(empty)',
      });
      return; // Profile exists - do NOT update
    }

    // 2. Fallback: lookup by email
    if (res.status === 404) {
      const email = userData?.email || "";
      if (email) {
        let emailToken = token;
        let emailRes = await fetch(`${getApiBase()}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`, {
          headers: tenantAuthHeaders(emailToken, { 'Content-Type': 'application/json' }),
          cache: 'no-store',
        });
        if (emailRes.status === 401) {
          emailToken = await generateApiJwt();
          emailRes = await fetch(`${getApiBase()}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`, {
            headers: tenantAuthHeaders(emailToken, { 'Content-Type': 'application/json' }),
            cache: 'no-store',
          });
        }
        if (emailRes.ok) {
          const profiles = await emailRes.json();
          if (Array.isArray(profiles) && profiles.length > 0) {
            const userProfile = profiles[0];

            // CRITICAL: Only update if userId is different
            // If userId already matches, skip update to preserve existing data
            if (userProfile.userId === userId) {
              console.log('[bootstrapUserProfile] Profile already has correct userId, skipping update to preserve existing data');
              return;
            }

            // Update the found profile with the current userId
            // CRITICAL: Use PATCH (not PUT) and only update userId/clerkUserId
            // DO NOT overwrite firstName, lastName, email if they already exist
            const now = new Date().toISOString();
            const updatePayload: any = {
              id: userProfile.id, // MUST include id for PATCH
              userId: userId, // Update to current Clerk userId
              clerkUserId: userId, // Also update clerkUserId
              tenantId: tenantId, // Include tenantId
              updatedAt: now,
            };

            // CRITICAL: ONLY update firstName/lastName/email if they are missing/empty in existing profile
            // NEVER include these fields in the payload if they would overwrite existing non-empty values
            // This prevents overwriting existing data with empty values from Clerk
            if (!userProfile.firstName || userProfile.firstName.trim() === '') {
              // Only update if Clerk provides a non-empty value
              if (userData?.firstName && userData.firstName.trim() !== '') {
                updatePayload.firstName = userData.firstName;
                console.log('[bootstrapUserProfile] Will update firstName (was empty):', userData.firstName);
              } else {
                console.log('[bootstrapUserProfile] Skipping firstName update (Clerk data missing/empty)');
              }
            } else {
              console.log('[bootstrapUserProfile] Preserving existing firstName:', userProfile.firstName);
            }
            // Preserve existing firstName - do NOT update

            if (!userProfile.lastName || userProfile.lastName.trim() === '') {
              // Only update if Clerk provides a non-empty value
              if (userData?.lastName && userData.lastName.trim() !== '') {
                updatePayload.lastName = userData.lastName;
                console.log('[bootstrapUserProfile] Will update lastName (was empty):', userData.lastName);
              } else {
                console.log('[bootstrapUserProfile] Skipping lastName update (Clerk data missing/empty)');
              }
            } else {
              console.log('[bootstrapUserProfile] Preserving existing lastName:', userProfile.lastName);
            }
            // Preserve existing lastName - do NOT update

            if (!userProfile.email || userProfile.email.trim() === '') {
              // Only update if Clerk provides a non-empty value
              if (email && email.trim() !== '') {
                updatePayload.email = email;
                console.log('[bootstrapUserProfile] Will update email (was empty):', email);
              } else {
                console.log('[bootstrapUserProfile] Skipping email update (Clerk data missing/empty)');
              }
            } else {
              console.log('[bootstrapUserProfile] Preserving existing email:', userProfile.email);
            }
            // Preserve existing email - do NOT update

            if (!userProfile.profileImageUrl || userProfile.profileImageUrl.trim() === '') {
              if (userData?.imageUrl && userData.imageUrl.trim() !== '') {
                updatePayload.profileImageUrl = userData.imageUrl;
              }
            }
            // Preserve existing profileImageUrl - do NOT update

            // CRITICAL: Log the payload to verify we're not sending empty strings
            console.log('[bootstrapUserProfile] 🔍 PATCH payload before sending:', {
              profileId: userProfile.id,
              oldUserId: userProfile.userId,
              newUserId: userId,
              existingFirstName: userProfile.firstName || '(empty)',
              existingLastName: userProfile.lastName || '(empty)',
              existingEmail: userProfile.email || '(empty)',
              updatePayloadKeys: Object.keys(updatePayload),
              updatePayload: JSON.stringify(updatePayload, null, 2),
              willUpdateFirstName: updatePayload.hasOwnProperty('firstName'),
              willUpdateLastName: updatePayload.hasOwnProperty('lastName'),
              willUpdateEmail: updatePayload.hasOwnProperty('email'),
            });

            // CRITICAL: Double-check - remove any fields that are empty strings to prevent overwriting
            if (updatePayload.firstName === '' || updatePayload.firstName === null || updatePayload.firstName === undefined) {
              delete updatePayload.firstName;
              console.log('[bootstrapUserProfile] ⚠️ Removed empty firstName from payload');
            }
            if (updatePayload.lastName === '' || updatePayload.lastName === null || updatePayload.lastName === undefined) {
              delete updatePayload.lastName;
              console.log('[bootstrapUserProfile] ⚠️ Removed empty lastName from payload');
            }
            if (updatePayload.email === '' || updatePayload.email === null || updatePayload.email === undefined) {
              delete updatePayload.email;
              console.log('[bootstrapUserProfile] ⚠️ Removed empty email from payload');
            }

            let updateToken = token;
            let updateRes = await fetch(`${getApiBase()}/api/user-profiles/${userProfile.id}`, {
              method: 'PATCH', // Use PATCH instead of PUT to avoid overwriting fields
              headers: tenantAuthHeaders(updateToken, { 'Content-Type': 'application/merge-patch+json' }),
              body: JSON.stringify(updatePayload),
            });
            if (updateRes.status === 401) {
              updateToken = await generateApiJwt();
              updateRes = await fetch(`${getApiBase()}/api/user-profiles/${userProfile.id}`, {
                method: 'PATCH', // Use PATCH instead of PUT
                headers: tenantAuthHeaders(updateToken, { 'Content-Type': 'application/merge-patch+json' }),
                body: JSON.stringify(updatePayload),
              });
            }
            return;
          }
        }
      }
      // 3. If not found by email, create minimal profile
      const now = new Date().toISOString();
      const profile = {
        userId,
        email,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        profileImageUrl: userData?.imageUrl || "",
        tenantId,
        createdAt: now,
        updatedAt: now,
      };
      let createToken = token;
      let createRes = await fetch(`${getApiBase()}/api/user-profiles`, {
        method: "POST",
        headers: tenantAuthHeaders(createToken, { "Content-Type": "application/json" }),
        body: JSON.stringify(profile),
      });
      if (createRes.status === 401) {
        createToken = await generateApiJwt();
        createRes = await fetch(`${getApiBase()}/api/user-profiles`, {
          method: "POST",
          headers: tenantAuthHeaders(createToken, { "Content-Type": "application/json" }),
          body: JSON.stringify(profile),
        });
      }
      return;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch user profile: ${res.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[bootstrapUserProfile] Profile bootstrap timed out after 15 seconds');
    } else {
      console.error('[bootstrapUserProfile] Error bootstrapping user profile:', error);
    }
    // Don't throw - allow page to continue loading even if bootstrap fails
  }
}