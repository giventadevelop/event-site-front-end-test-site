'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfileDTO } from '@/types';
import { searchUsersForTypeaheadServer } from '@/app/admin/manage-usage/ApiServerActions';
import { addFocusGroupMemberServer } from './ApiServerActions';

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'MEMBER (regular)' },
  { value: 'ORGANISER', label: 'ORGANISER (contact organiser)' },
  { value: 'EXECUTIVE', label: 'EXECUTIVE (contact organiser)' },
  { value: 'LEAD', label: 'LEAD' },
  { value: 'ADMIN', label: 'ADMIN' },
] as const;

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'INACTIVE', label: 'INACTIVE' },
] as const;

function formatUser(user: UserProfileDTO): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Unnamed user';
  const email = user.email?.trim();
  return email ? `${name} · ${email}` : name;
}

type Props = {
  focusGroupId: number;
};

export default function AddMemberForm({ focusGroupId }: Props) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<UserProfileDTO[]>([]);
  const [selected, setSelected] = useState<UserProfileDTO | null>(null);

  const [role, setRole] = useState('MEMBER');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selected) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsersForTypeaheadServer(trimmed);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  const selectUser = (user: UserProfileDTO) => {
    if (user.id == null) return;
    setSelected(user);
    setQuery(formatUser(user));
    setOpen(false);
    setSuggestions([]);
    setError(null);
  };

  const clearSelection = () => {
    setSelected(null);
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selected?.id) {
      setError('Search and select a registered user (type a name or email).');
      return;
    }
    setLoading(true);
    try {
      const result = await addFocusGroupMemberServer({
        focusGroupId,
        userProfileId: selected.id,
        role,
        status,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(`Added ${formatUser(selected)}.`);
      clearSelection();
      setRole('MEMBER');
      setStatus('ACTIVE');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div className="md:col-span-2 relative" ref={containerRef}>
        <label htmlFor="member-user-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search user (name or email)
        </label>
        <div className="relative">
          <input
            type="text"
            id="member-user-search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 && !selected) setOpen(true);
            }}
            placeholder="Type name or email — e.g. Alexander"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base pr-10"
            autoComplete="off"
          />
          {(query || selected) && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              title="Clear"
              aria-label="Clear selected user"
            >
              ×
            </button>
          )}
        </div>
        {open && !selected && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            {searching && (
              <li className="px-4 py-3 text-sm text-gray-500">Searching…</li>
            )}
            {!searching && query.trim().length >= 2 && suggestions.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500">
                No users found. They must already have a profile (signed up / Manage Usage).
              </li>
            )}
            {!searching &&
              suggestions.map((user) => (
                <li key={user.id ?? user.email} role="option">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50"
                  >
                    <span className="font-medium text-gray-900">{formatUser(user)}</span>
                    {user.id != null && (
                      <span className="block text-xs text-gray-500">Profile ID {user.id}</span>
                    )}
                  </button>
                </li>
              ))}
          </ul>
        )}
        {selected?.id != null && (
          <p className="mt-1 text-xs text-green-700">Selected profile ID {selected.id}</p>
        )}
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !selected?.id}
        className="md:col-span-4 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Add member"
        aria-label="Add member"
      >
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <span className="font-semibold text-green-700">
          {loading ? 'Adding…' : 'Add'}
        </span>
      </button>
      {error && (
        <p className="md:col-span-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="md:col-span-4 text-sm text-green-700" role="status">
          {success}
        </p>
      )}
    </form>
  );
}
