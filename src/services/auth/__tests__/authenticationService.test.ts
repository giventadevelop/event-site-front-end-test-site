/**
 * Authentication Service Unit Tests
 *
 * Tests for authentication operations
 */

import { AuthenticationService } from '../authenticationService';
import { apiClient } from '../../api';
import { tokenService } from '../tokenService';

// Mock dependencies
jest.mock('../../api');
jest.mock('../tokenService');

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const mockTokenService = tokenService as jest.Mocked<typeof tokenService>;

  beforeEach(() => {
    authService = AuthenticationService.getInstance();
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up user and store tokens', async () => {
      const signUpData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockResponse = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        expiresIn: 3600,
        user: {
          id: 'user_123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.signUp(signUpData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/signup',
        signUpData,
        { skipAuth: true }
      );
      expect(mockTokenService.setTokens).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on sign up failure', async () => {
      const signUpData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockApiClient.post.mockRejectedValue(new Error('Email already exists'));

      await expect(authService.signUp(signUpData)).rejects.toThrow();
    });
  });

  describe('signIn', () => {
    it('should sign in user and store tokens', async () => {
      const signInData = {
        email: 'test@example.com',
        password: 'Password123',
        rememberMe: true,
      };

      const mockResponse = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        expiresIn: 3600,
        user: {
          id: 'user_123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.signIn(signInData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/signin',
        signInData,
        { skipAuth: true }
      );
      expect(mockTokenService.setTokens).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('socialSignIn', () => {
    it('should authenticate with social provider', async () => {
      const socialData = {
        provider: 'google' as const,
        token: 'google_token_123',
      };

      const mockResponse = {
        accessToken: 'access_token_123',
        expiresIn: 3600,
        user: {
          id: 'user_123',
          email: 'test@example.com',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.socialSignIn(socialData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/social',
        socialData,
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signOut', () => {
    it('should sign out and clear tokens', async () => {
      mockApiClient.post.mockResolvedValue({});

      await authService.signOut();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/signout', {});
      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if backend call fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await authService.signOut();

      expect(mockTokenService.clearTokens).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockTokenService.isAuthenticated.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      mockTokenService.isAuthenticated.mockReturnValue(false);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should delegate to tokenService', () => {
      mockTokenService.isAuthenticated.mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);

      mockTokenService.isAuthenticated.mockReturnValue(false);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});


