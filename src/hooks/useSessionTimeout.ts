'use client';

/**
 * useSessionTimeout Hook
 *
 * Handles session timeout and inactivity detection
 * Automatically signs out users after period of inactivity
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

interface UseSessionTimeoutOptions {
  enabled?: boolean;
  timeoutMinutes?: number; // Minutes of inactivity before timeout
  warningMinutes?: number; // Minutes before timeout to show warning
  onWarning?: () => void;
  onTimeout?: () => void;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    enabled = true,
    timeoutMinutes = 30, // Default: 30 minutes
    warningMinutes = 5, // Default: 5 minutes warning
    onWarning,
    onTimeout,
  } = options;

  const { user, signOut } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  /**
   * Handle session timeout
   */
  const handleTimeout = useCallback(async () => {
    console.log('[SessionTimeout] Session timed out due to inactivity');

    // Call custom timeout handler
    onTimeout?.();

    // Sign out user
    await signOut();

    // Redirect to sign-in with timeout message
    router.push('/sign-in?reason=timeout');
  }, [signOut, router, onTimeout]);

  /**
   * Show warning before timeout
   */
  const handleWarning = useCallback(() => {
    console.log('[SessionTimeout] Warning: Session will timeout soon');
    onWarning?.();
  }, [onWarning]);

  /**
   * Reset inactivity timer
   */
  const resetTimer = useCallback(() => {
    if (!enabled || !user) return;

    lastActivityRef.current = Date.now();
    clearTimers();

    // Set warning timer
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningMs > 0) {
      warningRef.current = setTimeout(handleWarning, warningMs);
    }

    // Set timeout timer
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [enabled, user, timeoutMinutes, warningMinutes, handleWarning, handleTimeout, clearTimers]);

  /**
   * Track user activity
   */
  useEffect(() => {
    if (!enabled || !user) {
      clearTimers();
      return;
    }

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity tracking to avoid too many timer resets
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleActivity = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        resetTimer();
        throttleTimeout = null;
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [enabled, user, resetTimer, clearTimers]);

  /**
   * Get time until timeout
   */
  const getTimeUntilTimeout = useCallback((): number => {
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
    return Math.max(0, remaining);
  }, [timeoutMinutes]);

  return {
    isEnabled: enabled,
    timeUntilTimeout: getTimeUntilTimeout(),
    resetTimer,
  };
}

export default useSessionTimeout;


