/**
 * Error Recovery Component
 *
 * Provides user-friendly error recovery options with actionable suggestions
 * and automatic retry capabilities.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  FaRedo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaExternalLinkAlt,
  FaCog,
  FaQuestionCircle
} from 'react-icons/fa';
import { WhatsAppError, createErrorSummary } from '@/lib/whatsapp/errorHandling';
import { toast } from 'react-hot-toast';

interface ErrorRecoveryProps {
  error: WhatsAppError;
  onRetry: () => void;
  onDismiss?: () => void;
  autoRetry?: boolean;
  maxAutoRetries?: number;
  className?: string;
}

export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  autoRetry = false,
  maxAutoRetries = 3,
  className = ''
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const errorSummary = createErrorSummary(error);
  const canRetry = errorSummary.canRetry && retryCount < maxAutoRetries;

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && canRetry && errorSummary.retryDelay) {
      setCountdown(errorSummary.retryDelay);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoRetry, canRetry, errorSummary.retryDelay]);

  const handleRetry = async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      toast.success('Operation completed successfully!');
    } catch (retryError) {
      toast.error('Retry failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <FaExclamationTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <FaExclamationTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityTextColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'text-red-800';
      case 'high':
        return 'text-orange-800';
      case 'medium':
        return 'text-yellow-800';
      case 'low':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getSeverityIcon()}
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${getSeverityTextColor()}`}>
              {errorSummary.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {errorSummary.message}
            </p>
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestion */}
      {errorSummary.suggestion && (
        <div className="mt-3">
          <p className="text-sm text-gray-700">
            <strong>Suggestion:</strong> {errorSummary.suggestion}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Retry button */}
        {canRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying || (autoRetry && countdown > 0)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                Retrying...
              </>
            ) : autoRetry && countdown > 0 ? (
              <>
                <FaClock className="h-4 w-4 mr-2" />
                Retrying in {countdown}s
              </>
            ) : (
              <>
                <FaRedo className="h-4 w-4 mr-2" />
                {retryCount > 0 ? `Retry (${retryCount}/${maxAutoRetries})` : 'Try Again'}
              </>
            )}
          </button>
        )}

        {/* Custom action button */}
        {errorSummary.action && (
          <button
            onClick={() => {
              // Handle custom actions based on error type
              if (error.code === 'INVALID_CREDENTIALS') {
                window.location.href = '/admin/whatsapp-settings';
              } else if (error.code === 'QUOTA_EXCEEDED') {
                window.open('https://www.twilio.com/pricing', '_blank');
              } else {
                // Default action
                toast.info(`Action: ${errorSummary.action}`);
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaExternalLinkAlt className="h-4 w-4 mr-2" />
            {errorSummary.action}
          </button>
        )}

        {/* Details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaQuestionCircle className="h-4 w-4 mr-2" />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Technical details */}
      {showDetails && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p><strong>Error Code:</strong> {error.code}</p>
              <p><strong>Category:</strong> {error.category}</p>
              <p><strong>Severity:</strong> {error.severity}</p>
            </div>
            <div>
              <p><strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}</p>
              <p><strong>Retry Count:</strong> {retryCount}/{maxAutoRetries}</p>
              {error.recovery?.retryAfter && (
                <p><strong>Retry Delay:</strong> {error.recovery.retryAfter}s</p>
              )}
            </div>
          </div>

          {error.context && Object.keys(error.context).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Context:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}

          {error.originalError?.stack && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Stack Trace:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {error.originalError.stack}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Retry limit reached */}
      {retryCount >= maxAutoRetries && (
        <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-4 w-4 text-gray-500 mr-2" />
            <p className="text-sm text-gray-600">
              Maximum retry attempts reached. Please check your configuration or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Quick error notification component for toast-like display
 */
interface QuickErrorNotificationProps {
  error: WhatsAppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function QuickErrorNotification({
  error,
  onRetry,
  onDismiss
}: QuickErrorNotificationProps) {
  const errorSummary = createErrorSummary(error);

  return (
    <div className="fixed top-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {errorSummary.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {errorSummary.message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {onRetry && errorSummary.canRetry && (
          <button
            onClick={onRetry}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
















