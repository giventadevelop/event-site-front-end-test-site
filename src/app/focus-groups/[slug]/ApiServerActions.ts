'use server';

import { auth } from '@clerk/nextjs/server';
import { getAppUrl, getTenantId } from '@/lib/env';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';

/**
 * Join the current user to a focus group (self-service).
 * Resolves user profile by Clerk userId, then POSTs to proxy.
 * Per nextjs_api_routes.mdc: mutations from server actions; do not add tenantId when calling proxy (proxy injects).
 */
export async function joinFocusGroupServer(focusGroupId: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { ok: false, error: 'Not signed in' };
    }
    const profile = await fetchUserProfileServer(userId);
    if (!profile?.id) {
      return { ok: false, error: 'Profile not found' };
    }
    const baseUrl = getAppUrl();
    const tenantId = getTenantId();
    const now = new Date().toISOString();
    const body = {
      focusGroupId,
      userProfileId: profile.id,
      tenantId,
      role: 'MEMBER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const res = await fetch(`${baseUrl}/api/proxy/focus-group-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Leave a focus group (delete current user's membership).
 * Caller must pass the membership id (from my-membership fetch).
 */
export async function leaveFocusGroupServer(membershipId: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = getAppUrl();
    const res = await fetch(`${baseUrl}/api/proxy/focus-group-members/${membershipId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
