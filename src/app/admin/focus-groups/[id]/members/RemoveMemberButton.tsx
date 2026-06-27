'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RemoveMemberButtonProps {
  memberId: number;
}

export default function RemoveMemberButton({ memberId }: RemoveMemberButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm('Remove this member from the focus group?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/focus-group-members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const text = await res.text();
        alert(`Failed to remove member: ${res.status} ${text || res.statusText}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="flex-shrink-0 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Remove member"
      aria-label="Remove member"
    >
      <span className="w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </span>
      <span className="font-semibold text-red-700 text-sm hidden sm:inline">
        {loading ? 'Removing...' : 'Remove'}
      </span>
    </button>
  );
}
