/**
 * Error Handling Unit Tests
 *
 * Tests for authentication error handling utilities
 */

import {
  AuthError,
  AuthErrorCode,
  parseAuthError,
  getErrorMessage,
  isAuthError,
  requiresReauth,
} from '../errorHandling';

describe('Error Handling Utilities', () => {
  describe('AuthError', () => {
    it('should create AuthError with all properties', () => {
      const error = new AuthError(
        'Test error',
        AuthErrorCode.INVALID_CREDENTIALS,
        401,
        { original: 'error' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(error.statusCode).toBe(401);
      expect(error.originalError).toEqual({ original: 'error' });
      expect(error.name).toBe('AuthError');
    });
  });

  describe('parseAuthError', () => {
    it('should return AuthError as-is', () => {
      const error = new AuthError('Test', AuthErrorCode.TOKEN_EXPIRED);
      const result = parseAuthError(error);
      expect(result).toBe(error);
    });

    it('should parse 401 error', () => {
      const error = {
        status: 401,
        data: { message: 'Invalid credentials' },
      };

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(result.statusCode).toBe(401);
    });

    it('should parse 404 error', () => {
      const error = {
        status: 404,
        data: { message: 'User not found' },
      };

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.USER_NOT_FOUND);
    });

    it('should parse 409 conflict as email exists', () => {
      const error = {
        status: 409,
        data: { message: 'Email already exists' },
      };

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    });

    it('should parse 500 as server error', () => {
      const error = {
        status: 500,
        data: { message: 'Internal server error' },
      };

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.SERVER_ERROR);
    });

    it('should parse network errors', () => {
      const error = new TypeError('Failed to fetch');

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.NETWORK_ERROR);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      const result = parseAuthError(error);
      expect(result.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('getErrorMessage', () => {
    it('should return friendly message for INVALID_CREDENTIALS', () => {
      const error = new AuthError('Test', AuthErrorCode.INVALID_CREDENTIALS);
      expect(getErrorMessage(error)).toBe('Invalid email or password. Please try again.');
    });

    it('should return friendly message for EMAIL_ALREADY_EXISTS', () => {
      const error = new AuthError('Test', AuthErrorCode.EMAIL_ALREADY_EXISTS);
      expect(getErrorMessage(error)).toBe('An account with this email already exists.');
    });

    it('should return friendly message for NETWORK_ERROR', () => {
      const error = new AuthError('Test', AuthErrorCode.NETWORK_ERROR);
      expect(getErrorMessage(error)).toBe('Network error. Please check your internet connection.');
    });

    it('should return original message for unknown errors', () => {
      const error = new Error('Custom error message');
      expect(getErrorMessage(error)).toBe('Custom error message');
    });
  });

  describe('isAuthError', () => {
    it('should return true for AuthError instances', () => {
      const error = new AuthError('Test', AuthErrorCode.TOKEN_EXPIRED);
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 401 status', () => {
      const error = { status: 401 };
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 403 status', () => {
      const error = { status: 403 };
      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Generic error');
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('requiresReauth', () => {
    it('should return true for TOKEN_EXPIRED', () => {
      const error = new AuthError('Test', AuthErrorCode.TOKEN_EXPIRED);
      expect(requiresReauth(error)).toBe(true);
    });

    it('should return true for TOKEN_INVALID', () => {
      const error = new AuthError('Test', AuthErrorCode.TOKEN_INVALID);
      expect(requiresReauth(error)).toBe(true);
    });

    it('should return true for UNAUTHORIZED', () => {
      const error = new AuthError('Test', AuthErrorCode.UNAUTHORIZED);
      expect(requiresReauth(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new AuthError('Test', AuthErrorCode.NETWORK_ERROR);
      expect(requiresReauth(error)).toBe(false);
    });
  });
});


