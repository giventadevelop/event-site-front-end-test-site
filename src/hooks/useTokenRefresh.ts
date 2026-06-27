'use client';

/**
 * useTokenRefresh Hook
 *
 * Custom hook to handle automatic token refresh before expiration
 * Sets up an interval to check and refresh tokens proactively
 */

import { useEffect, useRef } from 'react';
import { tokenService, authenticationService } from '@/services/auth';
import { useAuth } from '@/contexts';

interface UseTokenRefreshOptions {
  enabled?: boolean;
  refreshBeforeExpiry?: number; // Minutes before expiry to refresh
  checkInterval?: number; // Milliseconds between checks
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    enabled = true,
    refreshBeforeExpiry = 5, // 5 minutes before expiry
    checkInterval = 60000, // Check every minute
  } = options;

  const { refreshUser } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const checkAndRefreshToken = async () => {
      // Skip if not authenticated
      if (!tokenService.isAuthenticated()) {
        return;
      }

      const expiresAt = tokenService.getTokenExpiresAt();
      if (!expiresAt) {
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const refreshThreshold = refreshBeforeExpiry * 60 * 1000; // Convert to milliseconds

      // Refresh if within threshold
      if (timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0) {
        console.log('[TokenRefresh] Token expiring soon, refreshing...');

        try {
          const newToken = await authenticationService.refreshToken();

          if (newToken) {
            console.log('[TokenRefresh] Token refreshed successfully');
            // Refresh user data to ensure sync
            await refreshUser();
          } else {
            console.warn('[TokenRefresh] Token refresh failed');
          }
        } catch (error) {
          console.error('[TokenRefresh] Error refreshing token:', error);
        }
      }
    };

    // Initial check
    checkAndRefreshToken();

    // Set up interval
    intervalRef.current = setInterval(checkAndRefreshToken, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refreshBeforeExpiry, checkInterval, refreshUser]);

  return {
    isEnabled: enabled,
  };
}

export default useTokenRefresh;


