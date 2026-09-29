'use server';

import { auth } from '@clerk/nextjs/server';
import { getAppUrl, getTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
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

function normalizeProfiles(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  if (data && typeof data === 'object') {
    const o = data as { content?: unknown; _embedded?: { userProfiles?: unknown } };
    if (Array.isArray(o.content)) return o.content as Array<Record<string, unknown>>;
    if (Array.isArray(o._embedded?.userProfiles)) {
      return o._embedded!.userProfiles as Array<Record<string, unknown>>;
    }
  }
  return [];
}

function normalizeMembers(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  if (data && typeof data === 'object') {
    const o = data as { content?: unknown; _embedded?: { focusGroupMembers?: unknown } };
    if (Array.isArray(o.content)) return o.content as Array<Record<string, unknown>>;
    if (Array.isArray(o._embedded?.focusGroupMembers)) {
      return o._embedded!.focusGroupMembers as Array<Record<string, unknown>>;
    }
  }
  return [];
}

/**
 * Guest interest: create/find user_profile by email, then PENDING membership (no Clerk account required).
 */
export async function submitFocusGroupGuestInterestServer(input: {
  focusGroupId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}): Promise<{ ok: true; alreadyMember?: boolean } | { ok: false; error: string }> {
  try {
    const focusGroupId = Number(input.focusGroupId);
    const firstName = (input.firstName || '').trim();
    const lastName = (input.lastName || '').trim();
    const email = (input.email || '').trim().toLowerCase();
    const phone = (input.phone || '').trim();
    const message = (input.message || '').trim();

    if (!focusGroupId) return { ok: false, error: 'Invalid focus group.' };
    if (!firstName || !lastName) return { ok: false, error: 'First and last name are required.' };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    const API_BASE = getApiBaseUrl();
    const tenantId = getTenantId();
    if (!API_BASE) return { ok: false, error: 'API is not configured.' };

    const findParams = new URLSearchParams({
      'email.equals': email,
      'tenantId.equals': tenantId,
      size: '1',
    });
    const findRes = await fetchWithJwtRetry(
      `${API_BASE}/api/user-profiles?${findParams.toString()}`,
      { cache: 'no-store' }
    );
    if (!findRes.ok) {
      const text = await findRes.text();
      return { ok: false, error: text || 'Could not look up profile.' };
    }
    const existing = normalizeProfiles(await findRes.json());
    let profileId = existing[0]?.id != null ? Number(existing[0].id) : null;

    if (!profileId) {
      const now = new Date().toISOString();
      const guestUserId = `guest_fg_${email.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80)}_${Date.now()}`;
      const notesParts = [
        `Focus group guest interest (group ${focusGroupId})`,
        message ? `Message: ${message}` : null,
      ].filter(Boolean);
      const createPayload = {
        userId: guestUserId,
        email,
        firstName,
        lastName,
        phone: phone || '',
        notes: notesParts.join(' — '),
        tenantId,
        userRole: 'MEMBER',
        userStatus: 'PENDING_APPROVAL',
        status: 'PENDING_COMPLETION',
        createdAt: now,
        updatedAt: now,
      };
      const createRes = await fetchWithJwtRetry(`${API_BASE}/api/user-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
        cache: 'no-store',
      });
      if (!createRes.ok) {
        const text = await createRes.text();
        return { ok: false, error: text || 'Could not create guest profile.' };
      }
      const created = await createRes.json();
      profileId = created?.id != null ? Number(created.id) : null;
      if (!profileId) return { ok: false, error: 'Guest profile was created without an id.' };
    } else if (message) {
      try {
        const prevNotes = String(existing[0]?.notes || '');
        const noteLine = `[FG ${focusGroupId} interest] ${message}`;
        if (!prevNotes.includes(noteLine)) {
          await fetchWithJwtRetry(`${API_BASE}/api/user-profiles/${profileId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({
              id: profileId,
              notes: prevNotes ? `${prevNotes}\n${noteLine}` : noteLine,
              updatedAt: new Date().toISOString(),
            }),
            cache: 'no-store',
          });
        }
      } catch {
        /* ignore note update failures */
      }
    }

    const memParams = new URLSearchParams({
      'focusGroupId.equals': String(focusGroupId),
      'userProfileId.equals': String(profileId),
      size: '1',
    });
    const memRes = await fetchWithJwtRetry(
      `${API_BASE}/api/focus-group-members?${memParams.toString()}`,
      { cache: 'no-store' }
    );
    if (memRes.ok) {
      const members = normalizeMembers(await memRes.json());
      if (members.length > 0) {
        return { ok: true, alreadyMember: true };
      }
    }

    const now = new Date().toISOString();
    const memberPayload = {
      focusGroupId,
      userProfileId: profileId,
      tenantId,
      role: 'MEMBER',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    const joinRes = await fetchWithJwtRetry(`${API_BASE}/api/focus-group-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberPayload),
      cache: 'no-store',
    });
    if (!joinRes.ok) {
      const text = await joinRes.text();
      if (text.toLowerCase().includes('duplicate') || joinRes.status === 409) {
        return { ok: true, alreadyMember: true };
      }
      return { ok: false, error: text || 'Could not submit interest.' };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
