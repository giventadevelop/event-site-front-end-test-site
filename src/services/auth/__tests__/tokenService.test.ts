/**
 * Token Service Unit Tests
 *
 * Tests for JWT token management functionality
 */

import { TokenService } from '../tokenService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    localStorageMock.clear();
    tokenService = TokenService.getInstance();
  });

  describe('setTokens', () => {
    it('should store access token, refresh token, and expiry', () => {
      const tokenData = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        expiresAt: Date.now() + 3600000, // 1 hour
      };

      tokenService.setTokens(tokenData);

      expect(tokenService.getAccessToken()).toBe('access_token_123');
      expect(tokenService.getRefreshToken()).toBe('refresh_token_456');
      expect(tokenService.getTokenExpiresAt()).toBe(tokenData.expiresAt);
    });

    it('should handle missing refresh token', () => {
      const tokenData = {
        accessToken: 'access_token_123',
        expiresAt: Date.now() + 3600000,
      };

      tokenService.setTokens(tokenData);

      expect(tokenService.getAccessToken()).toBe('access_token_123');
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('should return stored access token', () => {
      localStorageMock.setItem('clerk_access_token', 'token_123');
      expect(tokenService.getAccessToken()).toBe('token_123');
    });

    it('should return null if no token stored', () => {
      expect(tokenService.getAccessToken()).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      localStorageMock.setItem('clerk_token_expires_at', futureExpiry.toString());

      expect(tokenService.isTokenExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastExpiry = Date.now() - 3600000; // 1 hour ago
      localStorageMock.setItem('clerk_token_expires_at', pastExpiry.toString());

      expect(tokenService.isTokenExpired()).toBe(true);
    });

    it('should return true if no expiry set', () => {
      expect(tokenService.isTokenExpired()).toBe(true);
    });

    it('should return true if token expires within 5 minutes', () => {
      const soonExpiry = Date.now() + 240000; // 4 minutes from now
      localStorageMock.setItem('clerk_token_expires_at', soonExpiry.toString());

      expect(tokenService.isTokenExpired()).toBe(true);
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens', () => {
      tokenService.setTokens({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresAt: Date.now() + 3600000,
      });

      tokenService.clearTokens();

      expect(tokenService.getAccessToken()).toBeNull();
      expect(tokenService.getRefreshToken()).toBeNull();
      expect(tokenService.getTokenExpiresAt()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid token', () => {
      tokenService.setTokens({
        accessToken: 'valid_token',
        expiresAt: Date.now() + 3600000,
      });

      expect(tokenService.isAuthenticated()).toBe(true);
    });

    it('should return false for expired token', () => {
      tokenService.setTokens({
        accessToken: 'expired_token',
        expiresAt: Date.now() - 3600000,
      });

      expect(tokenService.isAuthenticated()).toBe(false);
    });

    it('should return false when no token exists', () => {
      expect(tokenService.isAuthenticated()).toBe(false);
    });
  });
});


