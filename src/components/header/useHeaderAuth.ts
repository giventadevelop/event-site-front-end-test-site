'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { isPrimaryHostname, isSatelliteHostname } from '@/lib/clerkSatellite';
import { isAdminRole } from '@/lib/utils';

type UseHeaderAuthOptions = {
  isTenantAdmin?: boolean;
  logPrefix?: string;
};

export function useHeaderAuth({ isTenantAdmin, logPrefix = '[HeaderAuth]' }: UseHeaderAuthOptions = {}) {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(!!isTenantAdmin);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [pendingSignOut, setPendingSignOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const clerkSignedOut = urlParams.get('clerk_signout');

    if (clerkSignedOut === 'true') {
      setPendingSignOut(true);
      urlParams.delete('clerk_signout');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    if (!pendingSignOut || !isLoaded) return;

    const performSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error(`${logPrefix} signOut() error on satellite:`, error);
      }

      Object.keys(localStorage).forEach((key) => {
        if (key.includes('clerk') || key.includes('__clerk')) {
          localStorage.removeItem(key);
        }
      });

      setPendingSignOut(false);
      window.location.replace(window.location.pathname);
    };

    performSignOut();
  }, [pendingSignOut, isLoaded, signOut, logPrefix]);

  useEffect(() => {
    if (!isLoaded) {
      setIsAdmin(!!isTenantAdmin);
      return;
    }

    if (!userId || !user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    const checkAdminStatus = async (attempt = 1): Promise<void> => {
      try {
        const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        if (!tenantId) {
          if (!cancelled) {
            setIsAdmin(typeof isTenantAdmin === 'boolean' ? isTenantAdmin : false);
          }
          return;
        }

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;

        const resp = await fetch(url, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (resp.ok) {
          const data = await resp.json();
          let profile;
          if (Array.isArray(data)) {
            profile = data[0];
          } else if (data?.content && Array.isArray(data.content)) {
            profile = data.content[0];
          } else if (data && typeof data === 'object' && 'userId' in data) {
            profile = data;
          }
          const adminResult = profile ? isAdminRole(profile.userRole) : isTenantAdmin === true;
          if (!cancelled) setIsAdmin(adminResult);
        } else {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
            if (!cancelled) return checkAdminStatus(attempt + 1);
          }

          if (!cancelled) {
            if (typeof isTenantAdmin === 'boolean') {
              setIsAdmin(isTenantAdmin);
            } else {
              const publicRole = user.publicMetadata?.role as string;
              const orgRole = user.organizationMemberships?.[0]?.role;
              setIsAdmin(
                publicRole === 'admin' ||
                  publicRole === 'administrator' ||
                  orgRole === 'admin' ||
                  orgRole === 'org:admin'
              );
            }
          }
        }
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          if (!cancelled) return checkAdminStatus(attempt + 1);
        }
        if (!cancelled) {
          setIsAdmin(typeof isTenantAdmin === 'boolean' ? isTenantAdmin : false);
        }
      }
    };

    checkAdminStatus();

    const wasSynced = typeof window !== 'undefined' && sessionStorage.getItem('clerk_satellite_synced');
    if (wasSynced) {
      sessionStorage.removeItem('clerk_satellite_synced');
      const syncTimer = setTimeout(() => {
        if (!cancelled) checkAdminStatus();
      }, 1500);
      return () => {
        cancelled = true;
        clearTimeout(syncTimer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, user, isTenantAdmin]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    localStorage.setItem('clerk_signout_broadcast', Date.now().toString());

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';
    const primaryHost = primaryDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (isPrimaryHostname(hostname)) {
      try {
        await signOut();
        window.location.href = '/';
      } catch (error) {
        console.error(`${logPrefix} Error signing out:`, error);
        setIsSigningOut(false);
      }
      return;
    }

    if (isSatelliteHostname(hostname)) {
      const primarySignOutUrl = `https://${primaryHost}/auth/signout-redirect`;
      const returnUrl = encodeURIComponent(window.location.origin);
      window.location.href = `${primarySignOutUrl}?redirect_url=${returnUrl}`;
      return;
    }

    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error(`${logPrefix} Error signing out:`, error);
      setIsSigningOut(false);
    }
  }, [signOut, logPrefix]);

  return {
    userId,
    isLoaded,
    user,
    isAdmin,
    isSigningOut,
    handleSignOut,
  };
}
