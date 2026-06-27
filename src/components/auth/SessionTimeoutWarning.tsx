'use client';

/**
 * Session Timeout Warning Component
 *
 * Displays a warning modal when session is about to timeout
 */

import React, { useState, useEffect } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuth } from '@/contexts';

interface SessionTimeoutWarningProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function SessionTimeoutWarning({
  timeoutMinutes = 30,
  warningMinutes = 5,
}: SessionTimeoutWarningProps) {
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { resetTimer } = useSessionTimeout({
    enabled: !!user,
    timeoutMinutes,
    warningMinutes,
    onWarning: () => {
      setShowWarning(true);
      setCountdown(warningMinutes * 60);
    },
  });

  /**
   * Countdown timer for warning
   */
  useEffect(() => {
    if (!showWarning || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, countdown]);

  /**
   * Handle continue session
   */
  const handleContinue = () => {
    resetTimer();
    setShowWarning(false);
    setCountdown(0);
  };

  /**
   * Format countdown time
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Warning Message */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Expiring Soon
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Your session will expire in <span className="font-semibold text-yellow-600">{formatTime(countdown)}</span> due to inactivity.
          </p>

          <p className="text-sm text-gray-600 mb-6">
            Click "Continue Session" to remain signed in, or you will be automatically signed out.
          </p>

          {/* Actions */}
          <button
            onClick={handleContinue}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeoutWarning;


