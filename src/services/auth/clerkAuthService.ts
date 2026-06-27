/**
 * Clerk Authentication Service
 *
 * This service handles all authentication operations with the Clerk backend API.
 * It replaces the previous client-side Clerk integration.
 *
 * Key Features:
 * - Server-side authentication with Clerk backend API
 * - JWT token management
 * - Session handling
 * - User authentication state management
 */

import { getClerkBackendUrl, getClerkSecretKey } from '@/lib/env';

interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification: {
      status: string;
    };
  }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  hasImage: boolean;
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  username: string | null;
  createdAt: number;
  updatedAt: number;
}

interface ClerkSession {
  id: string;
  userId: string;
  status: string;
  expireAt: number;
  abandonAt: number;
  lastActiveAt: number;
  createdAt: number;
  updatedAt: number;
}

export class ClerkAuthService {
  private static instance: ClerkAuthService;
  private backendUrl: string;
  private secretKey: string;

  private constructor() {
    this.backendUrl = getClerkBackendUrl();
    this.secretKey = getClerkSecretKey();
  }

  public static getInstance(): ClerkAuthService {
    if (!ClerkAuthService.instance) {
      ClerkAuthService.instance = new ClerkAuthService();
    }
    return ClerkAuthService.instance;
  }

  /**
   * Get user by ID from Clerk backend
   */
  async getUserById(userId: string): Promise<ClerkUser | null> {
    try {
      const response = await fetch(`${this.backendUrl}/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return null;
    }
  }

  /**
   * Get session by ID from Clerk backend
   */
  async getSessionById(sessionId: string): Promise<ClerkSession | null> {
    try {
      const response = await fetch(`${this.backendUrl}/v1/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch session: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching session from Clerk:', error);
      return null;
    }
  }

  /**
   * Verify session token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      const response = await fetch(`${this.backendUrl}/v1/sessions/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      return { valid: true, userId: data.userId };
    } catch (error) {
      console.error('Error verifying token with Clerk:', error);
      return { valid: false };
    }
  }

  /**
   * Revoke session (logout)
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/v1/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error revoking session with Clerk:', error);
      return false;
    }
  }
}

export default ClerkAuthService.getInstance();


