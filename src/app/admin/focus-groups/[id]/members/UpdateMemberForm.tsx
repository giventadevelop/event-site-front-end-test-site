'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFocusGroupMemberServer } from './ApiServerActions';

type Props = {
  memberId: number;
  focusGroupId: number;
  initialRole: string;
  initialStatus: string;
};

export default function UpdateMemberForm({
  memberId,
  focusGroupId,
  initialRole,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState((initialRole || 'MEMBER').toUpperCase());
  const [status, setStatus] = useState((initialStatus || 'ACTIVE').toUpperCase());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateFocusGroupMemberServer({
        memberId,
        focusGroupId,
        role,
        status,
      });
      if (!result.ok) {
        alert(`Failed to update member: ${result.error}`);
        return;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-flex flex-wrap items-center gap-2">
      <input
        type="text"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value.toUpperCase())}
        placeholder="MEMBER/ORGANISER"
        className="block w-28 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
        aria-label="Role"
      />
      <input
        type="text"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value.toUpperCase())}
        placeholder="ACTIVE/PENDING"
        className="block w-28 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
        aria-label="Status"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex-shrink-0 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3 disabled:opacity-50"
        title="Update member"
        aria-label="Update member"
      >
        <span className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </span>
        <span className="font-semibold text-blue-700 text-sm hidden sm:inline">
          {loading ? 'Saving…' : 'Update'}
        </span>
      </button>
    </form>
  );
}
