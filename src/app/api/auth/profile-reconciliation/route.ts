import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getAppUrl, getTenantId } from '@/lib/env';
import { pickAllUserProfiles } from '@/lib/pickFirstUserProfile';
import {
  buildClerkProfileInsert,
  decideClerkProfileIdentity,
  profileMatchesClerkUser,
} from '@/lib/clerkProfileIdentity';
import type { UserProfileDTO } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Profile reconciliation after sign-in.
 * The dev Clerk pool inserts a new row when the email already belongs to a different Clerk user id.
 * Production still patches user_id on the single email row.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'User session not ready. This is normal during authentication flow.',
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const triggerSource = body.triggerSource || 'manual';
    console.log('[PROFILE-RECONCILIATION-API] Trigger source:', triggerSource);

    const apiBaseUrl = getApiBaseUrl();
    const tenantId = getTenantId();

    const clerkUserResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clerkUserResponse.ok) {
      console.error('[PROFILE-RECONCILIATION-API] Failed to fetch Clerk user data:', clerkUserResponse.status);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    const clerkUser = await clerkUserResponse.json();
    const email = clerkUser.email_addresses?.[0]?.email_address as string | undefined;
    const firstName = clerkUser.first_name as string | undefined;
    const lastName = clerkUser.last_name as string | undefined;

    if (!email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
    }

    const byUserUrl = `${apiBaseUrl}/api/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=5`;
    const byUserRes = await fetchWithJwtRetry(byUserUrl, { method: 'GET', cache: 'no-store' });
    if (byUserRes.ok) {
      const owned = pickAllUserProfiles(await byUserRes.json()).find((row) => profileMatchesClerkUser(row, userId));
      if (owned) {
        const updated = await patchNamesIfNeeded(apiBaseUrl, owned, firstName, lastName);
        return NextResponse.json({
          message: updated ? 'Profile names reconciled' : 'Profile is up-to-date',
          reconciliationNeeded: Boolean(updated),
          profile: updated || owned,
        });
      }
    }

    const emailUrl = `${apiBaseUrl}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${encodeURIComponent(tenantId)}&sort=id,asc&size=20`;
    const profileRes = await fetchWithJwtRetry(emailUrl, { method: 'GET', cache: 'no-store' });
    if (!profileRes.ok) {
      console.log('[PROFILE-RECONCILIATION-API] Failed to lookup profile by email:', profileRes.status);
      return NextResponse.json({ error: 'Failed to lookup profile' }, { status: 500 });
    }

    const emailRows = pickAllUserProfiles(await profileRes.json());
    const decision = decideClerkProfileIdentity(emailRows, userId);

    if (decision.action === 'use') {
      const owned = emailRows.find((row) => profileMatchesClerkUser(row, userId));
      if (!owned) {
        return NextResponse.json({ message: 'Profile is up-to-date', reconciliationNeeded: false });
      }
      const updated = await patchNamesIfNeeded(apiBaseUrl, owned, firstName, lastName);
      return NextResponse.json({
        message: updated ? 'Profile names reconciled' : 'Profile is up-to-date',
        reconciliationNeeded: Boolean(updated),
        profile: updated || owned,
      });
    }

    if (decision.action === 'patch') {
      const existingProfile = decision.row;
      const updatePayload: Partial<UserProfileDTO> = {
        id: existingProfile.id,
        userId,
        clerkUserId: userId,
        updatedAt: new Date().toISOString(),
      };
      if (firstName && (!existingProfile.firstName || existingProfile.firstName.trim() === '' || existingProfile.firstName === 'Pending')) {
        updatePayload.firstName = firstName;
      }
      if (lastName && (!existingProfile.lastName || existingProfile.lastName.trim() === '' || existingProfile.lastName === 'User')) {
        updatePayload.lastName = lastName;
      }

      const updateRes = await fetchWithJwtRetry(`${apiBaseUrl}/api/user-profiles/${existingProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(updatePayload),
      });
      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error('[PROFILE-RECONCILIATION-API] Profile update failed:', updateRes.status, errorText);
        return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
      }
      const updatedProfile = await updateRes.json();
      return NextResponse.json({
        message: 'Profile reconciled successfully',
        reconciliationNeeded: true,
        profile: updatedProfile,
      });
    }

    const payload = buildClerkProfileInsert({
      userId,
      email,
      tenantId,
      firstName,
      lastName,
      sibling: decision.sibling,
    });
    const createRes = await fetch(`${getAppUrl()}/api/proxy/user-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('[PROFILE-RECONCILIATION-API] Profile insert failed:', createRes.status, errorText);
      return NextResponse.json({ error: 'Profile insert failed' }, { status: 500 });
    }
    const createdProfile = await createRes.json().catch(() => payload);
    return NextResponse.json({
      message: 'Profile inserted for this Clerk user',
      reconciliationNeeded: true,
      profile: createdProfile,
    });
  } catch (error) {
    console.error('[PROFILE-RECONCILIATION-API] Error during profile reconciliation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function patchNamesIfNeeded(
  apiBaseUrl: string,
  profile: UserProfileDTO,
  firstName?: string,
  lastName?: string
): Promise<UserProfileDTO | null> {
  const updatePayload: Partial<UserProfileDTO> = {
    id: profile.id,
    updatedAt: new Date().toISOString(),
  };
  let changed = false;
  if (firstName && (!profile.firstName || profile.firstName.trim() === '' || profile.firstName === 'Pending')) {
    updatePayload.firstName = firstName;
    changed = true;
  }
  if (lastName && (!profile.lastName || profile.lastName.trim() === '' || profile.lastName === 'User')) {
    updatePayload.lastName = lastName;
    changed = true;
  }
  if (!changed || profile.id == null) {
    return null;
  }
  const updateRes = await fetchWithJwtRetry(`${apiBaseUrl}/api/user-profiles/${profile.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(updatePayload),
  });
  if (!updateRes.ok) {
    return null;
  }
  return (await updateRes.json()) as UserProfileDTO;
}
