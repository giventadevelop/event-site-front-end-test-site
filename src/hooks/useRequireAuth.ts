'use client';

/**
 * useRequireAuth Hook
 *
 * Custom hook to require authentication in components
 * Redirects to sign-in if user is not authenticated
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireRole?: string;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/sign-in', requireRole } = options;
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to sign-in
    if (!user) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirect_after_login', pathname || '/dashboard');
      router.push(redirectTo);
      return;
    }

    // Check role-based access if required
    if (requireRole && !(user as any).roles?.includes(requireRole)) {
      console.warn(`User does not have required role: ${requireRole}`);
      router.push('/unauthorized');
    }
  }, [user, loading, router, redirectTo, pathname, requireRole]);

  return { user, loading };
}

export default useRequireAuth;


