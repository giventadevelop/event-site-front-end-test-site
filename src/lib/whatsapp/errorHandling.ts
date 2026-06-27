/**
 * WhatsApp Integration Error Handling Utilities
 *
 * Provides consistent error handling for WhatsApp integration components
 * with categorization, user-friendly messages, logging, and recovery suggestions.
 */

// Error categories for WhatsApp integration
export enum WhatsAppErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  TEMPLATE = 'template',
  MESSAGE = 'message',
  WEBHOOK = 'webhook',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown',
}

// Error codes for specific WhatsApp issues
export enum WhatsAppErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Validation errors
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_MESSAGE_FORMAT = 'INVALID_MESSAGE_FORMAT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Network errors
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Template errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_NOT_APPROVED = 'TEMPLATE_NOT_APPROVED',
  TEMPLATE_PARAM_MISMATCH = 'TEMPLATE_PARAM_MISMATCH',

  // Message errors
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  RECIPIENT_BLOCKED = 'RECIPIENT_BLOCKED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',

  // Webhook errors
  WEBHOOK_VALIDATION_FAILED = 'WEBHOOK_VALIDATION_FAILED',
  WEBHOOK_TIMEOUT = 'WEBHOOK_TIMEOUT',

  // Configuration errors
  MISSING_CONFIG = 'MISSING_CONFIG',
  INVALID_CONFIG = 'INVALID_CONFIG',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// WhatsApp error interface
export interface WhatsAppError {
  category: WhatsAppErrorCategory;
  code: WhatsAppErrorCode;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, any>;
  recovery?: {
    suggestion: string;
    action?: string;
    retryable: boolean;
    retryAfter?: number; // seconds
  };
  originalError?: Error;
}

// Error message templates
const ERROR_MESSAGES: Record<WhatsAppErrorCode, {
  userMessage: string;
  suggestion: string;
  action?: string;
  retryable: boolean;
  retryAfter?: number;
}> = {
  // Authentication errors
  [WhatsAppErrorCode.INVALID_CREDENTIALS]: {
    userMessage: 'Invalid Twilio credentials. Please check your Account SID and Auth Token.',
    suggestion: 'Verify your credentials in the Twilio Console and update them in the settings.',
    action: 'Check Twilio Console',
    retryable: false,
  },
  [WhatsAppErrorCode.EXPIRED_TOKEN]: {
    userMessage: 'Your authentication token has expired. Please refresh your credentials.',
    suggestion: 'Update your Auth Token in the WhatsApp settings.',
    action: 'Update Credentials',
    retryable: false,
  },
  [WhatsAppErrorCode.UNAUTHORIZED]: {
    userMessage: 'Access denied. Please check your permissions.',
    suggestion: 'Contact your administrator to verify your access rights.',
    retryable: false,
  },

  // Validation errors
  [WhatsAppErrorCode.INVALID_PHONE_NUMBER]: {
    userMessage: 'Invalid phone number format. Please use the format +1234567890.',
    suggestion: 'Ensure phone numbers include country code and are properly formatted.',
    retryable: false,
  },
  [WhatsAppErrorCode.INVALID_MESSAGE_FORMAT]: {
    userMessage: 'Message format is invalid. Please check your message content.',
    suggestion: 'Review the message template requirements and ensure all parameters are correct.',
    retryable: false,
  },
  [WhatsAppErrorCode.MISSING_REQUIRED_FIELD]: {
    userMessage: 'Required information is missing. Please fill in all required fields.',
    suggestion: 'Check the form for any missing required fields and try again.',
    retryable: false,
  },

  // Network errors
  [WhatsAppErrorCode.CONNECTION_TIMEOUT]: {
    userMessage: 'Connection timed out. Please check your internet connection.',
    suggestion: 'Verify your internet connection and try again.',
    retryable: true,
    retryAfter: 5,
  },
  [WhatsAppErrorCode.NETWORK_ERROR]: {
    userMessage: 'Network error occurred. Please try again.',
    suggestion: 'Check your internet connection and try again.',
    retryable: true,
    retryAfter: 3,
  },
  [WhatsAppErrorCode.SERVICE_UNAVAILABLE]: {
    userMessage: 'WhatsApp service is temporarily unavailable. Please try again later.',
    suggestion: 'The service may be under maintenance. Please try again in a few minutes.',
    retryable: true,
    retryAfter: 30,
  },

  // Rate limiting
  [WhatsAppErrorCode.RATE_LIMIT_EXCEEDED]: {
    userMessage: 'Rate limit exceeded. Please wait before sending more messages.',
    suggestion: 'Wait for the rate limit to reset before sending more messages.',
    retryable: true,
    retryAfter: 60,
  },
  [WhatsAppErrorCode.QUOTA_EXCEEDED]: {
    userMessage: 'Message quota exceeded. Please upgrade your plan or wait for quota reset.',
    suggestion: 'Consider upgrading your WhatsApp Business API plan or wait for the monthly quota to reset.',
    action: 'Upgrade Plan',
    retryable: true,
    retryAfter: 3600, // 1 hour
  },

  // Template errors
  [WhatsAppErrorCode.TEMPLATE_NOT_FOUND]: {
    userMessage: 'Message template not found. Please check your template name.',
    suggestion: 'Verify the template exists in your WhatsApp Business account.',
    retryable: false,
  },
  [WhatsAppErrorCode.TEMPLATE_NOT_APPROVED]: {
    userMessage: 'Message template is not approved. Please use an approved template.',
    suggestion: 'Wait for template approval or use a different approved template.',
    retryable: false,
  },
  [WhatsAppErrorCode.TEMPLATE_PARAM_MISMATCH]: {
    userMessage: 'Template parameters do not match. Please check your template parameters.',
    suggestion: 'Ensure all required template parameters are provided and correctly formatted.',
    retryable: false,
  },

  // Message errors
  [WhatsAppErrorCode.MESSAGE_TOO_LONG]: {
    userMessage: 'Message is too long. Please shorten your message.',
    suggestion: 'WhatsApp messages have a character limit. Please shorten your message.',
    retryable: false,
  },
  [WhatsAppErrorCode.RECIPIENT_BLOCKED]: {
    userMessage: 'Recipient has blocked WhatsApp messages. Message cannot be sent.',
    suggestion: 'The recipient has opted out of receiving WhatsApp messages.',
    retryable: false,
  },
  [WhatsAppErrorCode.DELIVERY_FAILED]: {
    userMessage: 'Message delivery failed. Please try again.',
    suggestion: 'Check the recipient\'s phone number and try again.',
    retryable: true,
    retryAfter: 10,
  },

  // Webhook errors
  [WhatsAppErrorCode.WEBHOOK_VALIDATION_FAILED]: {
    userMessage: 'Webhook validation failed. Please check your webhook configuration.',
    suggestion: 'Verify your webhook URL and token configuration.',
    retryable: false,
  },
  [WhatsAppErrorCode.WEBHOOK_TIMEOUT]: {
    userMessage: 'Webhook request timed out. Please check your webhook endpoint.',
    suggestion: 'Ensure your webhook endpoint responds within the timeout period.',
    retryable: true,
    retryAfter: 15,
  },

  // Configuration errors
  [WhatsAppErrorCode.MISSING_CONFIG]: {
    userMessage: 'Required configuration is missing. Please complete the setup.',
    suggestion: 'Fill in all required configuration fields in the WhatsApp settings.',
    retryable: false,
  },
  [WhatsAppErrorCode.INVALID_CONFIG]: {
    userMessage: 'Invalid configuration. Please check your settings.',
    suggestion: 'Review your WhatsApp configuration and ensure all values are correct.',
    retryable: false,
  },

  // Generic
  [WhatsAppErrorCode.UNKNOWN_ERROR]: {
    userMessage: 'An unexpected error occurred. Please try again.',
    suggestion: 'If the problem persists, please contact support.',
    retryable: true,
    retryAfter: 5,
  },
};

/**
 * Creates a WhatsApp error object with proper categorization and user-friendly messages
 */
export function createWhatsAppError(
  code: WhatsAppErrorCode,
  originalError?: Error,
  context?: Record<string, any>
): WhatsAppError {
  const errorTemplate = ERROR_MESSAGES[code];
  const category = getErrorCategory(code);
  const severity = getErrorSeverity(category, code);

  return {
    category,
    code,
    message: originalError?.message || errorTemplate.userMessage,
    userMessage: errorTemplate.userMessage,
    severity,
    timestamp: new Date().toISOString(),
    context,
    recovery: {
      suggestion: errorTemplate.suggestion,
      action: errorTemplate.action,
      retryable: errorTemplate.retryable,
      retryAfter: errorTemplate.retryAfter,
    },
    originalError,
  };
}

/**
 * Maps error codes to categories
 */
function getErrorCategory(code: WhatsAppErrorCode): WhatsAppErrorCategory {
  if (code.startsWith('INVALID_') || code.startsWith('MISSING_') || code.startsWith('TEMPLATE_PARAM_')) {
    return WhatsAppErrorCategory.VALIDATION;
  }
  if (code.includes('CREDENTIALS') || code.includes('TOKEN') || code.includes('UNAUTHORIZED')) {
    return WhatsAppErrorCategory.AUTHENTICATION;
  }
  if (code.includes('TIMEOUT') || code.includes('NETWORK') || code.includes('SERVICE_UNAVAILABLE')) {
    return WhatsAppErrorCategory.NETWORK;
  }
  if (code.includes('RATE_LIMIT') || code.includes('QUOTA')) {
    return WhatsAppErrorCategory.RATE_LIMIT;
  }
  if (code.startsWith('TEMPLATE_')) {
    return WhatsAppErrorCategory.TEMPLATE;
  }
  if (code.includes('MESSAGE_') || code.includes('RECIPIENT_') || code.includes('DELIVERY_')) {
    return WhatsAppErrorCategory.MESSAGE;
  }
  if (code.startsWith('WEBHOOK_')) {
    return WhatsAppErrorCategory.WEBHOOK;
  }
  if (code.includes('CONFIG')) {
    return WhatsAppErrorCategory.CONFIGURATION;
  }
  return WhatsAppErrorCategory.UNKNOWN;
}

/**
 * Determines error severity based on category and code
 */
function getErrorSeverity(category: WhatsAppErrorCategory, code: WhatsAppErrorCode): ErrorSeverity {
  // Critical errors that prevent functionality
  if (code === WhatsAppErrorCode.INVALID_CREDENTIALS ||
      code === WhatsAppErrorCode.MISSING_CONFIG ||
      code === WhatsAppErrorCode.UNAUTHORIZED) {
    return ErrorSeverity.CRITICAL;
  }

  // High severity errors that significantly impact functionality
  if (category === WhatsAppErrorCategory.AUTHENTICATION ||
      code === WhatsAppErrorCode.QUOTA_EXCEEDED ||
      code === WhatsAppErrorCode.TEMPLATE_NOT_APPROVED) {
    return ErrorSeverity.HIGH;
  }

  // Medium severity errors that affect specific features
  if (category === WhatsAppErrorCategory.RATE_LIMIT ||
      category === WhatsAppErrorCategory.TEMPLATE ||
      code === WhatsAppErrorCode.DELIVERY_FAILED) {
    return ErrorSeverity.MEDIUM;
  }

  // Low severity errors that are recoverable
  return ErrorSeverity.LOW;
}

/**
 * Parses HTTP status codes and maps them to WhatsApp error codes
 */
export function parseHttpError(status: number, message?: string): WhatsAppErrorCode {
  switch (status) {
    case 400:
      if (message?.includes('phone')) return WhatsAppErrorCode.INVALID_PHONE_NUMBER;
      if (message?.includes('template')) return WhatsAppErrorCode.TEMPLATE_NOT_FOUND;
      if (message?.includes('message')) return WhatsAppErrorCode.INVALID_MESSAGE_FORMAT;
      return WhatsAppErrorCode.INVALID_CONFIG;
    case 401:
      return WhatsAppErrorCode.INVALID_CREDENTIALS;
    case 403:
      return WhatsAppErrorCode.UNAUTHORIZED;
    case 404:
      return WhatsAppErrorCode.TEMPLATE_NOT_FOUND;
    case 408:
      return WhatsAppErrorCode.CONNECTION_TIMEOUT;
    case 429:
      return WhatsAppErrorCode.RATE_LIMIT_EXCEEDED;
    case 500:
    case 502:
    case 503:
    case 504:
      return WhatsAppErrorCode.SERVICE_UNAVAILABLE;
    default:
      return WhatsAppErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Logs WhatsApp errors with appropriate level based on severity
 */
export function logWhatsAppError(error: WhatsAppError): void {
  const logMessage = `[WhatsApp ${error.category.toUpperCase()}] ${error.code}: ${error.message}`;
  const logContext = {
    code: error.code,
    category: error.category,
    severity: error.severity,
    timestamp: error.timestamp,
    context: error.context,
    stack: error.originalError?.stack,
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error(logMessage, logContext);
      break;
    case ErrorSeverity.HIGH:
      console.error(logMessage, logContext);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn(logMessage, logContext);
      break;
    case ErrorSeverity.LOW:
      console.info(logMessage, logContext);
      break;
  }
}

/**
 * Determines if an error should be retried
 */
export function shouldRetryError(error: WhatsAppError): boolean {
  return error.recovery?.retryable === true;
}

/**
 * Gets the retry delay for an error
 */
export function getRetryDelay(error: WhatsAppError): number {
  return error.recovery?.retryAfter || 5; // Default 5 seconds
}

/**
 * Creates a user-friendly error summary for display
 */
export function createErrorSummary(error: WhatsAppError): {
  title: string;
  message: string;
  suggestion: string;
  action?: string;
  canRetry: boolean;
  retryDelay?: number;
} {
  const severityLabels = {
    [ErrorSeverity.LOW]: 'Notice',
    [ErrorSeverity.MEDIUM]: 'Warning',
    [ErrorSeverity.HIGH]: 'Error',
    [ErrorSeverity.CRITICAL]: 'Critical Error',
  };

  return {
    title: severityLabels[error.severity],
    message: error.userMessage,
    suggestion: error.recovery?.suggestion || 'Please try again or contact support.',
    action: error.recovery?.action,
    canRetry: shouldRetryError(error),
    retryDelay: getRetryDelay(error),
  };
}
















