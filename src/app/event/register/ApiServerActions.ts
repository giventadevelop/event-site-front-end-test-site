import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventAttendeeDTO, EventAttendeeGuestDTO, UserProfileDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Look up user profile by email for event registration
 */
export async function lookupUserProfileByEmail(email: string): Promise<UserProfileDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({ 'email.equals': email });
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to lookup user profile:', response.statusText);
      return null;
    }

    const profiles = await response.json();
    return Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error looking up user profile:', error);
    return null;
  }
}

/**
 * Look up user profile by Clerk user ID
 */
export async function lookupUserProfileByClerkId(clerkUserId: string): Promise<UserProfileDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({ 'userId.equals': clerkUserId });
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to lookup user profile by Clerk ID:', response.statusText);
      return null;
    }

    const profiles = await response.json();
    return Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error looking up user profile by Clerk ID:', error);
    return null;
  }
}

/**
 * Check if user is an active member
 */
export async function checkMemberStatus(clerkUserId: string): Promise<boolean> {
  try {
    const profile = await lookupUserProfileByClerkId(clerkUserId);
    return profile?.userStatus === 'ACTIVE' && profile?.userRole === 'MEMBER';
  } catch (error) {
    console.error('Error checking member status:', error);
    return false;
  }
}

/**
 * Create event attendee
 */
export async function createEventAttendeeAction(attendeeData: Partial<EventAttendeeDTO>): Promise<EventAttendeeDTO> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendeeData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee:', error);
    throw error;
  }
}

/**
 * Create event attendee guest
 */
export async function createEventAttendeeGuestAction(attendeeId: number, guestData: Partial<EventAttendeeGuestDTO>): Promise<EventAttendeeGuestDTO> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-attendee-guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...guestData,
        eventAttendee: { id: attendeeId }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event attendee guest: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event attendee guest:', error);
    throw error;
  }
}

/**
 * Create user profile for new users
 */
export async function createUserProfileAction(profileData: Partial<UserProfileDTO>): Promise<UserProfileDTO> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user profile: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Get event attendee by ID
 */
export async function getEventAttendee(attendeeId: number): Promise<EventAttendeeDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-attendees/${attendeeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event attendee: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event attendee:', error);
    return null;
  }
}

/**
 * Get event attendee guests by attendee ID
 */
export async function getEventAttendeeGuests(attendeeId: number): Promise<EventAttendeeGuestDTO[]> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({ 'eventAttendeeId.equals': attendeeId.toString() });
    const response = await fetch(`${baseUrl}/api/proxy/event-attendee-guests?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event attendee guests: ${response.status}`);
    }

    const guests = await response.json();
    return Array.isArray(guests) ? guests : [];
  } catch (error) {
    console.error('Error fetching event attendee guests:', error);
    return [];
  }
}