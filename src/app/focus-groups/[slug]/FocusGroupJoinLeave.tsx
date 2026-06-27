'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { joinFocusGroupServer, leaveFocusGroupServer } from './ApiServerActions';

interface FocusGroupJoinLeaveProps {
  focusGroupId: number;
  isLoggedIn: boolean;
  isMember: boolean;
  membershipId: number | null;
  /** When isMember and status is PENDING, show "Requested" instead of Leave */
  membershipStatus?: string | null;
  groupName: string;
  /** Redirect back here after sign-in (e.g. /focus-groups/my-slug) */
  redirectUrl?: string;
}

export default function FocusGroupJoinLeave({
  focusGroupId,
  isLoggedIn,
  isMember,
  membershipId,
  membershipStatus,
  groupName,
  redirectUrl = '/focus-groups',
}: FocusGroupJoinLeaveProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!isLoggedIn || isMember) return;
    setLoading(true);
    try {
      const result = await joinFocusGroupServer(focusGroupId);
      if (result.ok) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to join');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!isMember || membershipId == null) return;
    if (!confirm('Leave this focus group?')) return;
    setLoading(true);
    try {
      const result = await leaveFocusGroupServer(membershipId);
      if (result.ok) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to leave');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Link
        href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
        className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition-all duration-300 hover:scale-105 border-2 border-indigo-300 hover:border-indigo-400"
        title="Sign in to join"
        aria-label="Sign in to join this focus group"
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </span>
        <span>Sign in to join</span>
      </Link>
    );
  }

  if (isMember && membershipId != null) {
    const isPending = membershipStatus === 'PENDING';
    const label = isPending ? 'Requested' : (loading ? 'Leaving...' : 'Leave');
    return (
      <button
        type="button"
        onClick={handleLeave}
        disabled={loading || isPending}
        className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-all duration-300 hover:scale-105 border-2 border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        title={isPending ? 'Request pending' : 'Leave focus group'}
        aria-label={isPending ? 'Request pending' : 'Leave this focus group'}
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-semibold transition-all duration-300 hover:scale-105 border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      title="Join focus group"
      aria-label={`Join ${groupName}`}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </span>
      <span>{loading ? 'Joining...' : 'Join'}</span>
    </button>
  );
}
