'use client';

/**
 * Authentication Context
 *
 * Provides authentication state and methods to all components
 * Manages user state, loading, and errors
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticationService, type SignUpData, type SignInData, type SocialSignInData } from '@/services/auth';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  socialSignIn: (data: SocialSignInData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  /**
   * Load current user on mount
   */
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Load current user from backend
   */
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prevent infinite retry loops - max 3 attempts
      if (loadAttempts >= 3) {
        console.warn('[AuthProvider] Max load attempts reached. Forcing logout.');
        if (authenticationService.isAuthenticated()) {
          await authenticationService.signOut();
        }
        setUser(null);
        return;
      }

      setLoadAttempts(prev => prev + 1);

      // Check if we have authentication tokens before making API call
      // This prevents unnecessary 401 errors when user is not logged in
      if (!authenticationService.isAuthenticated()) {
        // No tokens - user is not logged in (this is normal, not an error)
        setUser(null);
        setLoadAttempts(0); // Reset counter on successful logout state
        return;
      }

      // Has tokens - try to get user info
      const currentUser = await authenticationService.getCurrentUser();

      // If getCurrentUser returns null, it means either:
      // 1. User is not authenticated (401) - tokens were cleared by service
      // 2. Backend error occurred
      // In both cases, ensure tokens are cleared to prevent infinite loops
      if (!currentUser) {
        // Double-check tokens are cleared (getCurrentUser should have done this on 401)
        if (authenticationService.isAuthenticated()) {
          console.warn('[AuthProvider] getCurrentUser returned null but tokens still exist. Clearing tokens.');
          await authenticationService.signOut();
        }
        setUser(null);
        setLoadAttempts(0); // Reset counter after clearing tokens
      } else {
        // Success - reset attempt counter
        setLoadAttempts(0);
        setUser(currentUser);
      }
    } catch (err: any) {
      // Only log unexpected errors in development (not 401 Unauthorized)
      if (process.env.NODE_ENV === 'development' && err?.status !== 401) {
        console.error('[AuthProvider] Error loading user:', err);
      }

      // Clear tokens on any error to prevent infinite redirect loops
      if (authenticationService.isAuthenticated()) {
        console.warn('[AuthProvider] Error occurred with valid tokens. Clearing tokens to prevent loop.');
        await authenticationService.signOut();
      }

      setUser(null);
      setLoadAttempts(0); // Reset counter after error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticationService.signUp(data);
      setUser(response.user);
    } catch (err: any) {
      // Only log technical errors in development (excluding expected API errors)
      if (process.env.NODE_ENV === 'development' && err?.name !== 'ApiError') {
        console.error('Sign up error:', err);
      }

      // Import error handling utility dynamically
      const { formatErrorForDisplay } = await import('@/lib/errorMessages');
      const errorMessage = formatErrorForDisplay(err);

      setError(errorMessage);

      // Re-throw the original error to preserve error name
      // This prevents Next.js error overlay from showing
      err.message = errorMessage;
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (data: SignInData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticationService.signIn(data);
      setUser(response.user);
    } catch (err: any) {
      // Only log technical errors in development (excluding expected API errors)
      if (process.env.NODE_ENV === 'development' && err?.name !== 'ApiError') {
        console.error('Sign in error:', err);
      }

      // Import error handling utility dynamically
      const { formatErrorForDisplay } = await import('@/lib/errorMessages');
      const errorMessage = formatErrorForDisplay(err);

      setError(errorMessage);

      // Re-throw the original error to preserve error name
      // This prevents Next.js error overlay from showing
      err.message = errorMessage;
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with social provider
   */
  const socialSignIn = useCallback(async (data: SocialSignInData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticationService.socialSignIn(data);
      setUser(response.user);
    } catch (err: any) {
      // Only log technical errors in development (excluding expected API errors)
      if (process.env.NODE_ENV === 'development' && err?.name !== 'ApiError') {
        console.error('Social sign in error:', err);
      }

      // Import error handling utility dynamically
      const { formatErrorForDisplay } = await import('@/lib/errorMessages');
      const errorMessage = formatErrorForDisplay(err);

      setError(errorMessage);

      // Re-throw the original error to preserve error name
      // This prevents Next.js error overlay from showing
      err.message = errorMessage;
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out (logout)
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await authenticationService.signOut();
      setUser(null);
    } catch (err: any) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out error:', err);
      }
      // Still clear user even if backend call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    socialSignIn,
    signOut,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


