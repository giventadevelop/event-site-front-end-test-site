'use client';

/**
 * Protected Route Component
 *
 * Wrapper component that ensures only authenticated users can access content
 * Redirects to sign-in page if user is not authenticated
 */

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = '/sign-in',
  requireRole,
  fallback
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

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
  }, [user, loading, mounted, router, redirectTo, pathname, requireRole]);

  // Show loading state
  if (!mounted || loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Check role-based access
  if (requireRole && !(user as any).roles?.includes(requireRole)) {
    return null; // Will redirect in useEffect
  }

  // Authenticated - render children
  return <>{children}</>;
}

export default ProtectedRoute;


