"use client";

import { useOrganization, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// Client-side hook to check if the current user is an admin (Clerk)
// Usage: const { isAdmin, isLoading } = useAdminCheck();
export function useAdminCheck() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!organization || !user) {
        setIsLoading(false);
        return;
      }
      try {
        const memberships = await user.getOrganizationMemberships();
        const currentMembership = memberships.find(
          (membership: any) => membership.organization.id === organization.id
        );
        setIsAdmin(
          currentMembership?.role === 'org:admin' ||
          currentMembership?.role === 'admin'
        );
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAdminStatus();
  }, [organization, user]);

  return { isAdmin, isLoading };
}