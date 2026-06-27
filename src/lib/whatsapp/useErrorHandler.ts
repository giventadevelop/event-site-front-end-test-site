/**
 * React hooks for WhatsApp error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  WhatsAppError,
  WhatsAppErrorCode,
  createWhatsAppError,
  logWhatsAppError,
  shouldRetryError,
  getRetryDelay,
  createErrorSummary,
  ErrorSeverity,
} from './errorHandling';

// Error state interface
export interface ErrorState {
  error: WhatsAppError | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error handler options
export interface UseErrorHandlerOptions {
  maxRetries?: number;
  showToast?: boolean;
  logErrors?: boolean;
  onError?: (error: WhatsAppError) => void;
  onRetry?: (error: WhatsAppError, retryCount: number) => void;
  onMaxRetriesReached?: (error: WhatsAppError) => void;
}

/**
 * Hook for handling WhatsApp errors with retry logic
 */
export function useWhatsAppErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    showToast = true,
    logErrors = true,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    maxRetries,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      error: null,
      isRetrying: false,
      retryCount: 0,
    }));
  }, []);

  // Handle error
  const handleError = useCallback((
    error: Error | WhatsAppError,
    code?: WhatsAppErrorCode,
    context?: Record<string, any>
  ) => {
    const whatsappError = error instanceof Error
      ? createWhatsAppError(code || WhatsAppErrorCode.UNKNOWN_ERROR, error, context)
      : error;

    // Log error if enabled
    if (logErrors) {
      logWhatsAppError(whatsappError);
    }

    // Update error state
    setErrorState(prev => ({
      ...prev,
      error: whatsappError,
      isRetrying: false,
    }));

    // Show toast notification if enabled
    if (showToast) {
      const summary = createErrorSummary(whatsappError);
      const toastMessage = `${summary.title}: ${summary.message}`;

      if (whatsappError.severity === ErrorSeverity.CRITICAL) {
        toast.error(toastMessage, { duration: 10000 });
      } else if (whatsappError.severity === ErrorSeverity.HIGH) {
        toast.error(toastMessage, { duration: 8000 });
      } else if (whatsappError.severity === ErrorSeverity.MEDIUM) {
        toast.warning(toastMessage, { duration: 6000 });
      } else {
        toast.info(toastMessage, { duration: 4000 });
      }
    }

    // Call custom error handler
    onError?.(whatsappError);
  }, [logErrors, showToast, onError]);

  // Retry error
  const retryError = useCallback(async (retryFn: () => Promise<any>) => {
    const { error, retryCount } = errorState;

    if (!error || retryCount >= maxRetries) {
      if (retryCount >= maxRetries) {
        onMaxRetriesReached?.(error!);
        if (showToast) {
          toast.error('Maximum retry attempts reached. Please try again later.');
        }
      }
      return;
    }

    if (!shouldRetryError(error)) {
      if (showToast) {
        toast.error('This error cannot be retried automatically.');
      }
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    // Call custom retry handler
    onRetry?.(error, retryCount + 1);

    try {
      await retryFn();
      clearError();
    } catch (retryError) {
      handleError(retryError as Error, error.code, { ...error.context, retryAttempt: retryCount + 1 });
    }
  }, [errorState, maxRetries, clearError, handleError, onRetry, onMaxRetriesReached, showToast]);

  // Auto-retry with delay
  const autoRetryError = useCallback(async (retryFn: () => Promise<any>) => {
    const { error } = errorState;

    if (!error || !shouldRetryError(error)) {
      return;
    }

    const delay = getRetryDelay(error);

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Set new timeout
    retryTimeoutRef.current = setTimeout(async () => {
      await retryError(retryFn);
    }, delay * 1000);

    // Show retry notification
    if (showToast) {
      toast.info(`Retrying in ${delay} seconds...`, { duration: delay * 1000 });
    }
  }, [errorState, retryError, showToast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    errorState,
    handleError,
    retryError,
    autoRetryError,
    clearError,
    hasError: errorState.error !== null,
    canRetry: errorState.error ? shouldRetryError(errorState.error) && errorState.retryCount < maxRetries : false,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    maxRetries,
  };
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncErrorHandler<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: UseErrorHandlerOptions = {}
) {
  const errorHandler = useWhatsAppErrorHandler(options);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setIsLoading(true);
    errorHandler.clearError();

    try {
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      errorHandler.handleError(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, errorHandler]);

  const executeWithRetry = useCallback(async (...args: T): Promise<R | null> => {
    const executeOnce = () => execute(...args);
    return await errorHandler.retryError(executeOnce);
  }, [execute, errorHandler]);

  return {
    execute,
    executeWithRetry,
    isLoading,
    ...errorHandler,
  };
}

/**
 * Hook for form validation errors
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const setFormErrors = useCallback((errors: Record<string, string>) => {
    setFieldErrors(errors);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setFormErrors,
    hasErrors,
  };
}

/**
 * Hook for connection testing with error handling
 */
export function useConnectionTestErrorHandler() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const errorHandler = useWhatsAppErrorHandler({
    showToast: false, // We'll handle toast notifications manually
  });

  const testConnection = useCallback(async (testFn: () => Promise<any>) => {
    setConnectionStatus('testing');
    setTestResult(null);
    errorHandler.clearError();

    try {
      const result = await testFn();
      setTestResult(result);
      setConnectionStatus(result.success ? 'success' : 'error');

      if (result.success) {
        toast.success('Connection test successful!');
      } else {
        errorHandler.handleError(new Error(result.message), WhatsAppErrorCode.CONNECTION_TIMEOUT);
      }
    } catch (error) {
      setConnectionStatus('error');
      errorHandler.handleError(error as Error, WhatsAppErrorCode.CONNECTION_TIMEOUT);
    }
  }, [errorHandler]);

  return {
    connectionStatus,
    testResult,
    testConnection,
    error: errorHandler.errorState.error,
    clearError: errorHandler.clearError,
  };
}
















