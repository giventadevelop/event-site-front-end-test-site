/**
 * Authentication Service
 *
 * Handles all authentication operations including:
 * - Sign up
 * - Sign in (email/password and social)
 * - Sign out
 * - Token refresh
 * - Current user retrieval
 */

import { apiClient } from '../api';
import tokenService from './tokenService';

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SocialSignInData {
  provider: 'google' | 'facebook' | 'github';
  token: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

export class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup', data, {
        skipAuth: true, // Don't require auth for signup
      });

      // Store tokens
      this.storeAuthResponse(response);

      return response;
    } catch (error: any) {
      // Only log unexpected errors in development (not expected API errors)
      if (process.env.NODE_ENV === 'development' && error?.name !== 'ApiError') {
        console.error('Sign up error:', error);
      }
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signin', data, {
        skipAuth: true, // Don't require auth for signin
      });

      // Store tokens
      this.storeAuthResponse(response);

      return response;
    } catch (error: any) {
      // Only log unexpected errors in development (not expected API errors)
      if (process.env.NODE_ENV === 'development' && error?.name !== 'ApiError') {
        console.error('Sign in error:', error);
      }
      throw error;
    }
  }

  /**
   * Sign in with social provider (Google, Facebook, etc.)
   */
  async socialSignIn(data: SocialSignInData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/social', data, {
        skipAuth: true, // Don't require auth for social signin
      });

      // Store tokens
      this.storeAuthResponse(response);

      return response;
    } catch (error: any) {
      // Only log unexpected errors in development (not expected API errors)
      if (process.env.NODE_ENV === 'development' && error?.name !== 'ApiError') {
        console.error('Social sign in error:', error);
      }
      throw error;
    }
  }

  /**
   * Sign out (logout)
   */
  async signOut(): Promise<void> {
    try {
      // Call backend to invalidate session
      await apiClient.post('/api/auth/signout', {});
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear local tokens
      tokenService.clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    if (!tokenService.isAuthenticated()) {
      return null;
    }

    try {
      const response = await apiClient.get<AuthResponse['user']>('/api/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      // If unauthorized, clear tokens
      if ((error as any).status === 401) {
        tokenService.clearTokens();
      }
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken?: string; expiresIn: number }>(
        '/api/auth/refresh',
        { refreshToken },
        { skipAuth: true }
      );

      // Store new tokens
      tokenService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || refreshToken,
        expiresAt: Date.now() + response.expiresIn * 1000,
      });

      return response.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      tokenService.clearTokens();
      return null;
    }
  }

  /**
   * Verify if a token is valid
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiClient.post(
        '/api/auth/verify',
        { token },
        { skipAuth: true }
      );
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Store authentication response tokens
   */
  private storeAuthResponse(response: AuthResponse): void {
    tokenService.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + response.expiresIn * 1000,
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenService.isAuthenticated();
  }
}

export default AuthenticationService.getInstance();

