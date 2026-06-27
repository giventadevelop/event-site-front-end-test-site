'use server';

import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { withTenantId } from '@/lib/withTenantId';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventAttendeeDTO, EventAttendeeGuestDTO, UserProfileDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  let token = await getCachedApiJwt();
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    token = await generateApiJwt();
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  return response;
}

/**
 * Create a new user profile
 */
export async function createUserProfileAction(profileData: Partial<UserProfileDTO>): Promise<UserProfileDTO> {
  try {
    const payload = withTenantId({
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/user-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createUserProfile');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user profile: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Create a new event attendee
 */
export async function createEventAttendeeAction(attendeeData: Partial<EventAttendeeDTO>): Promise<EventAttendeeDTO> {
  try {
    const payload = withTenantId({
      ...attendeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createEventAttendee');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee:', error);
    throw error;
  }
}

/**
 * Create a new event attendee guest
 */
export async function createEventAttendeeGuestAction(
  primaryAttendeeId: number, 
  guestData: Partial<EventAttendeeGuestDTO>
): Promise<EventAttendeeGuestDTO> {
  try {
    const payload = withTenantId({
      ...guestData,
      primaryAttendee: { id: primaryAttendeeId },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-attendee-guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 'createEventAttendeeGuest');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee guest: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee guest:', error);
    throw error;
  }
}

/**
 * Lookup user profile by email
 */
export async function lookupUserProfileByEmailAction(email: string): Promise<UserProfileDTO | null> {
  try {
    const tenantId = getTenantId();
    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`,
      { method: 'GET' },
      'lookupUserProfileByEmail'
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to lookup user profile: ${response.status} ${errorText}`);
    }

    const profiles = await response.json();
    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error looking up user profile:', error);
    throw error;
  }
}
