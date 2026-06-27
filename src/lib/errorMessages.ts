/**
 * Error Message Mapping Utility
 *
 * Maps backend error codes and HTTP status codes to user-friendly messages
 */

export interface ErrorDetail {
  title: string;
  message: string;
  actionable?: string;
}

/**
 * Map of error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, ErrorDetail> = {
  // Authentication Errors (AUTH_xxx)
  AUTH_001: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    actionable: 'Please check your credentials and try again.',
  },
  AUTH_002: {
    title: 'Session Expired',
    message: 'Your session has expired.',
    actionable: 'Please sign in again to continue.',
  },
  AUTH_003: {
    title: 'Invalid Token',
    message: 'Your authentication token is invalid.',
    actionable: 'Please sign in again.',
  },
  AUTH_004: {
    title: 'User Not Found',
    message: 'We couldn\'t find an account with that email.',
    actionable: 'Please check your email or create a new account.',
  },
  AUTH_005: {
    title: 'Account Already Exists',
    message: 'An account with this email already exists.',
    actionable: 'Try signing in instead, or use a different email.',
  },
  AUTH_006: {
    title: 'Configuration Error',
    message: 'There\'s a problem with the authentication setup.',
    actionable: 'Please contact support.',
  },
  AUTH_007: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    actionable: 'Contact an administrator if you believe this is an error.',
  },
  AUTH_008: {
    title: 'Too Many Attempts',
    message: 'You\'ve made too many requests.',
    actionable: 'Please wait a few minutes and try again.',
  },
  AUTH_009: {
    title: 'Verification Failed',
    message: 'We couldn\'t verify your request.',
    actionable: 'Please try again.',
  },
  AUTH_010: {
    title: 'Social Login Failed',
    message: 'We couldn\'t sign you in with your social account.',
    actionable: 'Please try again or use email/password instead.',
  },
};

/**
 * HTTP status code to error detail mapping
 */
export const HTTP_STATUS_MESSAGES: Record<number, ErrorDetail> = {
  400: {
    title: 'Invalid Request',
    message: 'The information you provided is invalid.',
    actionable: 'Please check your input and try again.',
  },
  401: {
    title: 'Authentication Required',
    message: 'You need to be signed in to access this.',
    actionable: 'Please sign in to continue.',
  },
  403: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    actionable: 'Contact an administrator if you need access.',
  },
  404: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    actionable: 'Please check the URL and try again.',
  },
  409: {
    title: 'Conflict',
    message: 'This action conflicts with existing data.',
    actionable: 'The email might already be in use. Try signing in instead.',
  },
  422: {
    title: 'Validation Error',
    message: 'Some of the information you provided is invalid.',
    actionable: 'Please check the form for errors.',
  },
  429: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests.',
    actionable: 'Please wait a few minutes before trying again.',
  },
  500: {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    actionable: 'We\'re working on it. Please try again in a few minutes.',
  },
  502: {
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable.',
    actionable: 'Please try again in a few minutes.',
  },
  503: {
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable.',
    actionable: 'Please try again in a few minutes.',
  },
  504: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    actionable: 'Please try again.',
  },
};

/**
 * Default error messages for unknown errors
 */
export const DEFAULT_ERROR: ErrorDetail = {
  title: 'Something Went Wrong',
  message: 'An unexpected error occurred.',
  actionable: 'Please try again. If the problem persists, contact support.',
};

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: any): ErrorDetail {
  // Special case: Check for "Invalid credentials" in detail field
  // Backend sometimes returns 500 with "Invalid credentials" detail
  const detail = error?.data?.detail || error?.response?.data?.detail;
  if (detail && typeof detail === 'string') {
    const detailLower = detail.toLowerCase();

    if (detailLower.includes('invalid credentials') ||
        detailLower.includes('invalid email') ||
        detailLower.includes('invalid password') ||
        detailLower.includes('user not found')) {
      return ERROR_MESSAGES.AUTH_001; // Invalid Credentials
    }

    if (detailLower.includes('email already exists') ||
        detailLower.includes('user already exists')) {
      return ERROR_MESSAGES.AUTH_005; // Account Already Exists
    }

    if (detailLower.includes('token expired') ||
        detailLower.includes('session expired')) {
      return ERROR_MESSAGES.AUTH_002; // Session Expired
    }

    if (detailLower.includes('invalid token')) {
      return ERROR_MESSAGES.AUTH_003; // Invalid Token
    }
  }

  // Check for error code first (AUTH_001, etc.)
  if (error?.data?.errorCode && ERROR_MESSAGES[error.data.errorCode]) {
    return ERROR_MESSAGES[error.data.errorCode];
  }

  // Check for response data error code
  if (error?.response?.data?.errorCode && ERROR_MESSAGES[error.response.data.errorCode]) {
    return ERROR_MESSAGES[error.response.data.errorCode];
  }

  // Check for HTTP status code (but only if no specific detail found)
  if (error?.status && HTTP_STATUS_MESSAGES[error.status]) {
    return HTTP_STATUS_MESSAGES[error.status];
  }

  // Check for response status
  if (error?.response?.status && HTTP_STATUS_MESSAGES[error.response.status]) {
    return HTTP_STATUS_MESSAGES[error.response.status];
  }

  // Check for detail or message in error (generic fallback)
  if (detail) {
    return {
      title: error.data?.title || 'Error',
      message: detail,
      actionable: 'Please try again.',
    };
  }

  if (error?.data?.message) {
    return {
      title: error.data.title || 'Error',
      message: error.data.message,
      actionable: 'Please try again.',
    };
  }

  // Check for error message string
  if (error?.message) {
    // Don't show technical error messages to users
    if (error.message.includes('API Error') || error.message.includes('500')) {
      return HTTP_STATUS_MESSAGES[500];
    }

    return {
      title: 'Error',
      message: error.message,
      actionable: 'Please try again.',
    };
  }

  return DEFAULT_ERROR;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: any): string {
  const errorDetail = getErrorMessage(error);
  let message = errorDetail.message;

  if (errorDetail.actionable) {
    message += ` ${errorDetail.actionable}`;
  }

  return message;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  const errorCode = error?.data?.errorCode || error?.response?.data?.errorCode;
  if (errorCode && errorCode.startsWith('AUTH_')) {
    return true;
  }

  const status = error?.status || error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: any): boolean {
  const status = error?.status || error?.response?.status;
  return status >= 500 && status < 600;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: any): boolean {
  const status = error?.status || error?.response?.status;
  return status >= 400 && status < 500;
}
