/**
 * Token Management Service
 *
 * Handles JWT token storage, retrieval, and validation for the Clerk backend integration.
 * This service manages authentication tokens in a secure manner.
 */

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class TokenService {
  private static instance: TokenService;
  private static readonly ACCESS_TOKEN_KEY = 'clerk_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'clerk_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'clerk_token_expires_at';

  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Store authentication tokens
   */
  setTokens(tokenData: TokenData): void {
    if (typeof window === 'undefined') {
      console.warn('TokenService: Cannot store tokens on server side');
      return;
    }

    try {
      localStorage.setItem(TokenService.ACCESS_TOKEN_KEY, tokenData.accessToken);

      if (tokenData.refreshToken) {
        localStorage.setItem(TokenService.REFRESH_TOKEN_KEY, tokenData.refreshToken);
      }

      localStorage.setItem(TokenService.EXPIRES_AT_KEY, tokenData.expiresAt.toString());
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      const expiresAtStr = localStorage.getItem(TokenService.EXPIRES_AT_KEY);
      if (!expiresAtStr) {
        return true;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();

      // Consider expired if within 5 minutes of expiration
      return now >= (expiresAt - 5 * 60 * 1000);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
      localStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
      localStorage.removeItem(TokenService.EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }

  /**
   * Get token expiration time
   */
  getTokenExpiresAt(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const expiresAtStr = localStorage.getItem(TokenService.EXPIRES_AT_KEY);
      return expiresAtStr ? parseInt(expiresAtStr, 10) : null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }
}

export default TokenService.getInstance();


