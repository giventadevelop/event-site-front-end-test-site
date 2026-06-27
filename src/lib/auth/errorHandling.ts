/**
 * Authentication Error Handling Utilities
 *
 * Centralized error handling for authentication-related operations
 */

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SOCIAL_AUTH_FAILED = 'SOCIAL_AUTH_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AuthError extends Error {
  public code: AuthErrorCode;
  public statusCode?: number;
  public originalError?: any;

  constructor(
    message: string,
    code: AuthErrorCode = AuthErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Parse error response and create AuthError
 */
export function parseAuthError(error: any): AuthError {
  // Handle AuthError instances
  if (error instanceof AuthError) {
    return error;
  }

  // Handle API errors with status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return new AuthError(
          error.data?.message || 'Invalid request',
          AuthErrorCode.INVALID_CREDENTIALS,
          400,
          error
        );
      case 401:
        return new AuthError(
          error.data?.message || 'Invalid credentials',
          AuthErrorCode.INVALID_CREDENTIALS,
          401,
          error
        );
      case 403:
        return new AuthError(
          error.data?.message || 'Access forbidden',
          AuthErrorCode.FORBIDDEN,
          403,
          error
        );
      case 404:
        return new AuthError(
          error.data?.message || 'User not found',
          AuthErrorCode.USER_NOT_FOUND,
          404,
          error
        );
      case 409:
        return new AuthError(
          error.data?.message || 'Email already exists',
          AuthErrorCode.EMAIL_ALREADY_EXISTS,
          409,
          error
        );
      case 500:
      case 502:
      case 503:
        return new AuthError(
          'Server error. Please try again later.',
          AuthErrorCode.SERVER_ERROR,
          error.status,
          error
        );
      default:
        return new AuthError(
          error.data?.message || error.message || 'An error occurred',
          AuthErrorCode.UNKNOWN_ERROR,
          error.status,
          error
        );
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AuthError(
      'Network error. Please check your connection.',
      AuthErrorCode.NETWORK_ERROR,
      undefined,
      error
    );
  }

  // Handle generic errors
  return new AuthError(
    error.message || 'An unexpected error occurred',
    AuthErrorCode.UNKNOWN_ERROR,
    undefined,
    error
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const authError = parseAuthError(error);

  switch (authError.code) {
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 'Invalid email or password. Please try again.';
    case AuthErrorCode.USER_NOT_FOUND:
      return 'No account found with this email.';
    case AuthErrorCode.EMAIL_ALREADY_EXISTS:
      return 'An account with this email already exists.';
    case AuthErrorCode.WEAK_PASSWORD:
      return 'Password must be at least 8 characters with uppercase, lowercase, and number.';
    case AuthErrorCode.TOKEN_EXPIRED:
      return 'Your session has expired. Please sign in again.';
    case AuthErrorCode.TOKEN_INVALID:
      return 'Invalid session. Please sign in again.';
    case AuthErrorCode.NETWORK_ERROR:
      return 'Network error. Please check your internet connection.';
    case AuthErrorCode.SERVER_ERROR:
      return 'Server error. Please try again later.';
    case AuthErrorCode.UNAUTHORIZED:
      return 'You are not authorized to perform this action.';
    case AuthErrorCode.FORBIDDEN:
      return 'Access denied. You do not have permission.';
    case AuthErrorCode.SOCIAL_AUTH_FAILED:
      return 'Social sign-in failed. Please try again.';
    default:
      return authError.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: any): boolean {
  return error instanceof AuthError ||
         error.status === 401 ||
         error.status === 403;
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: any): boolean {
  const authError = parseAuthError(error);
  return authError.code === AuthErrorCode.TOKEN_EXPIRED ||
         authError.code === AuthErrorCode.TOKEN_INVALID ||
         authError.code === AuthErrorCode.UNAUTHORIZED;
}

/**
 * Log authentication error with context
 */
export function logAuthError(error: any, context: string): void {
  const authError = parseAuthError(error);

  console.error(`[Auth Error] ${context}:`, {
    message: authError.message,
    code: authError.code,
    statusCode: authError.statusCode,
    timestamp: new Date().toISOString(),
  });

  // Log original error for debugging
  if (authError.originalError) {
    console.error('[Auth Error] Original error:', authError.originalError);
  }
}


