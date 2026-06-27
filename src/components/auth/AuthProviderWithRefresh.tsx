'use client';

/**
 * Auth Provider with Token Refresh
 *
 * Combines AuthProvider with automatic token refresh
 */

import React from 'react';
import { AuthProvider } from '@/contexts';
import { useTokenRefresh } from '@/hooks';

interface AuthProviderWithRefreshProps {
  children: React.ReactNode;
}

function TokenRefreshWrapper({ children }: { children: React.ReactNode }) {
  // Auto-refresh tokens 5 minutes before expiry
  useTokenRefresh({
    enabled: true,
    refreshBeforeExpiry: 5,
    checkInterval: 60000, // Check every minute
  });

  return <>{children}</>;
}

export function AuthProviderWithRefresh({ children }: AuthProviderWithRefreshProps) {
  return (
    <AuthProvider>
      <TokenRefreshWrapper>
        {children}
      </TokenRefreshWrapper>
    </AuthProvider>
  );
}

export default AuthProviderWithRefresh;


