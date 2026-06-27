/**
 * WhatsApp Error Boundary Component
 *
 * Catches and handles errors in WhatsApp integration components
 * with user-friendly error display and recovery options.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo, FaBug, FaHome, FaWhatsapp } from 'react-icons/fa';
import { WhatsAppError, WhatsAppErrorCode, createWhatsAppError, createErrorSummary } from '@/lib/whatsapp/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: WhatsAppError, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: WhatsAppError | null;
  errorInfo: ErrorInfo | null;
}

export class WhatsAppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Create WhatsApp error from the caught error
    const whatsappError = createWhatsAppError(WhatsAppErrorCode.UNKNOWN_ERROR, error, {
      component: 'WhatsAppErrorBoundary',
      timestamp: new Date().toISOString(),
    });

    return {
      hasError: true,
      error: whatsappError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('WhatsApp Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const errorSummary = this.state.error ? createErrorSummary(this.state.error) : null;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  WhatsApp Integration Error
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Something went wrong with the WhatsApp integration
                </p>
              </div>

              {/* Error Details */}
              {errorSummary && (
                <div className="mt-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaBug className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {errorSummary.title}
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{errorSummary.message}</p>
                          {errorSummary.suggestion && (
                            <p className="mt-1">
                              <strong>Suggestion:</strong> {errorSummary.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details (if enabled) */}
              {this.props.showErrorDetails && this.state.error && (
                <div className="mt-4">
                  <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                      Technical Details
                    </summary>
                    <div className="mt-2 text-xs text-gray-600 space-y-2">
                      <p><strong>Error Code:</strong> {this.state.error.code}</p>
                      <p><strong>Category:</strong> {this.state.error.category}</p>
                      <p><strong>Severity:</strong> {this.state.error.severity}</p>
                      <p><strong>Timestamp:</strong> {this.state.error.timestamp}</p>
                      {this.state.error.context && (
                        <p><strong>Context:</strong> {JSON.stringify(this.state.error.context, null, 2)}</p>
                      )}
                      {this.state.error.originalError?.stack && (
                        <p><strong>Stack Trace:</strong></p>
                      )}
                      {this.state.error.originalError?.stack && (
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                          {this.state.error.originalError.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <FaRedo />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <FaHome />
                  Go to Admin
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact support with the error details above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with WhatsApp error boundary
 */
export function withWhatsAppErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: WhatsAppError, errorInfo: ErrorInfo) => void;
    showErrorDetails?: boolean;
  }
) {
  const WrappedComponent = (props: P) => (
    <WhatsAppErrorBoundary
      fallback={options?.fallback}
      onError={options?.onError}
      showErrorDetails={options?.showErrorDetails}
    >
      <Component {...props} />
    </WhatsAppErrorBoundary>
  );

  WrappedComponent.displayName = `withWhatsAppErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Error display component for inline error messages
 */
interface ErrorDisplayProps {
  error: WhatsAppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function WhatsAppErrorDisplay({
  error,
  onRetry,
  onDismiss,
  compact = false
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorSummary = createErrorSummary(error);

  if (compact) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <div className="flex items-start">
          <FaExclamationTriangle className="h-4 w-4 text-red-400 mt-0.5" />
          <div className="ml-2 flex-1">
            <p className="text-sm text-red-800">{errorSummary.message}</p>
            {onRetry && errorSummary.canRetry && (
              <button
                onClick={onRetry}
                className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errorSummary.title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorSummary.message}</p>
            {errorSummary.suggestion && (
              <p className="mt-1">
                <strong>Suggestion:</strong> {errorSummary.suggestion}
              </p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {onRetry && errorSummary.canRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 flex items-center gap-1"
              >
                <FaRedo className="h-3 w-3" />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
















