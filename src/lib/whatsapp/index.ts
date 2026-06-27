/**
 * WhatsApp Integration Library
 *
 * Centralized exports for WhatsApp integration utilities
 */

// Error handling
export * from './errorHandling';
export * from './useErrorHandler';

// Re-export commonly used types and utilities
export {
  WhatsAppError,
  WhatsAppErrorCode,
  WhatsAppErrorCategory,
  ErrorSeverity,
  createWhatsAppError,
  createErrorSummary,
  logWhatsAppError,
  shouldRetryError,
  getRetryDelay,
  parseHttpError,
} from './errorHandling';

export {
  useWhatsAppErrorHandler,
  useAsyncErrorHandler,
  useFormErrorHandler,
  useConnectionTestErrorHandler,
} from './useErrorHandler';
















