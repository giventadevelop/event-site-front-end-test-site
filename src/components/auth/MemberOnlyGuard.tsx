'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { EventDetailsDTO } from '@/types';

interface MemberOnlyGuardProps {
  children: React.ReactNode;
  event: EventDetailsDTO;
  fallback?: React.ReactNode;
}

export default function MemberOnlyGuard({ children, event, fallback }: MemberOnlyGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const checkMemberStatus = async () => {
      try {
        // If user is not authenticated, redirect to login
        if (!user) {
          router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        // Check if user is a member by looking up their profile
        const response = await fetch(`/api/proxy/user-profiles/by-user/${user.id}`);
        if (response.ok) {
          const profile = await response.json();
          const isActiveMember = profile?.userStatus === 'ACTIVE' && profile?.userRole === 'MEMBER';
          setIsMember(isActiveMember);
        } else {
          // If no profile exists, user is not a member
          setIsMember(false);
        }
      } catch (error) {
        console.error('Error checking member status:', error);
        setIsMember(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkMemberStatus();
  }, [user, isLoaded, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Authentication Required</h2>
          <p className="text-yellow-700 mb-4">
            You need to be logged in to access this member-only event.
          </p>
          <button
            onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return fallback || (
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Members Only</h2>
          <p className="text-red-700 mb-4">
            This event is restricted to members only. You need to be an active member to register for this event.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold mr-4"
            >
              Become a Member
            </button>
            <button
              onClick={() => router.push('/events')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-semibold"
            >
              View Other Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
