import type { UserProfileDTO } from '@/types';

/**
 * Normalize user-profile list/detail API payloads into a single profile.
 * Handles bare arrays, Spring Page `{ content }`, and HAL `_embedded.userProfiles`.
 */
export function pickFirstUserProfile(data: unknown): UserProfileDTO | null {
  if (Array.isArray(data)) {
    return (data[0] as UserProfileDTO | undefined) ?? null;
  }

  if (data && typeof data === 'object') {
    const obj = data as {
      content?: unknown[];
      _embedded?: { userProfiles?: unknown[] };
      userId?: string;
      email?: string;
    };

    if (Array.isArray(obj.content)) {
      return (obj.content[0] as UserProfileDTO | undefined) ?? null;
    }

    if (Array.isArray(obj._embedded?.userProfiles)) {
      return (obj._embedded.userProfiles[0] as UserProfileDTO | undefined) ?? null;
    }

    if ('userId' in obj || 'email' in obj) {
      return obj as UserProfileDTO;
    }
  }

  return null;
}

/**
 * Normalize user-profile list/detail API payloads into an array of profiles.
 * Used for cross-tenant admin allowlisting (same Clerk user, many tenant rows).
 */
export function pickAllUserProfiles(data: unknown): UserProfileDTO[] {
  if (Array.isArray(data)) {
    return data as UserProfileDTO[];
  }

  if (data && typeof data === 'object') {
    const obj = data as {
      content?: unknown[];
      _embedded?: { userProfiles?: unknown[] };
      userId?: string;
      email?: string;
    };

    if (Array.isArray(obj.content)) {
      return obj.content as UserProfileDTO[];
    }

    if (Array.isArray(obj._embedded?.userProfiles)) {
      return obj._embedded.userProfiles as UserProfileDTO[];
    }

    if ('userId' in obj || 'email' in obj) {
      return [obj as UserProfileDTO];
    }
  }

  return [];
}
