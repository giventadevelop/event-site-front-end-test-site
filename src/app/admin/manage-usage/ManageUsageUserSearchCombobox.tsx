'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { UserProfileDTO } from '@/types';
import { searchUsersForTypeaheadServer } from './ApiServerActions';

const SUGGESTION_LIMIT = 20;

export type ManageUsageSearchField = 'firstName' | 'lastName' | 'email' | 'phone';

function formatUserSuggestion(user: UserProfileDTO): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Unnamed user';
  const email = user.email?.trim();
  return email ? `${name} · ${email}` : name;
}

function commitValueForField(user: UserProfileDTO, searchField: ManageUsageSearchField): string {
  const raw = user[searchField];
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (user.email?.trim()) return user.email.trim();
  if (user.userId?.trim()) return user.userId.trim();
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

function filterUsersLocally(users: UserProfileDTO[], query: string): UserProfileDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) return users.slice(0, SUGGESTION_LIMIT);
  return users
    .filter((user) =>
      [user.firstName, user.lastName, user.email, user.userId, user.phone].some((v) =>
        (v ?? '').toLowerCase().includes(q),
      ),
    )
    .slice(0, SUGGESTION_LIMIT);
}

function mergeUsers(primary: UserProfileDTO[], secondary: UserProfileDTO[]): UserProfileDTO[] {
  const byKey = new Map<string, UserProfileDTO>();
  for (const user of [...primary, ...secondary]) {
    const key =
      user.id != null
        ? `id:${user.id}`
        : user.userId
          ? `userId:${user.userId}`
          : user.email
            ? `email:${user.email}`
            : null;
    if (!key || byKey.has(key)) continue;
    byKey.set(key, user);
  }
  return Array.from(byKey.values()).slice(0, SUGGESTION_LIMIT);
}

interface ManageUsageUserSearchComboboxProps {
  searchField: ManageUsageSearchField | string;
  /** Committed filter value that drives the user list fetch — not updated on every keystroke. */
  committedValue: string;
  onCommit: (value: string) => void;
  localUsers?: UserProfileDTO[];
  statusFilter?: string;
  roleFilter?: string;
  fieldLabel?: string;
}

export default function ManageUsageUserSearchCombobox({
  searchField,
  committedValue,
  onCommit,
  localUsers = [],
  statusFilter = '',
  roleFilter = '',
  fieldLabel = 'user',
}: ManageUsageUserSearchComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();
  const inputId = 'manage-usage-user-search';

  const [inputValue, setInputValue] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<UserProfileDTO[]>([]);
  const [cachedUsers, setCachedUsers] = useState<UserProfileDTO[]>(localUsers);

  useEffect(() => {
    setInputValue(committedValue);
  }, [committedValue]);

  useEffect(() => {
    if (localUsers.length === 0) return;
    setCachedUsers((prev) => mergeUsers(localUsers, prev));
  }, [localUsers]);

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
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      const localMatches = filterUsersLocally(
        mergeUsers(localUsers, cachedUsers),
        trimmed,
      );
      setSuggestions(localMatches);

      if (!trimmed) {
        setSuggestions(mergeUsers(localUsers, cachedUsers).slice(0, SUGGESTION_LIMIT));
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const remote = await searchUsersForTypeaheadServer(trimmed, {
            status: statusFilter || undefined,
            role: roleFilter || undefined,
          });
          const merged = mergeUsers(remote, localMatches);
          setSuggestions(merged);
          if (remote.length > 0) {
            setCachedUsers((prev) => mergeUsers(remote, prev));
          }
        } catch {
          setSuggestions(localMatches);
        } finally {
          setLoading(false);
        }
      }, 280);
    },
    [cachedUsers, localUsers, roleFilter, statusFilter],
  );

  const commitTypedOrSelected = (value: string) => {
    const next = value.trim();
    onCommit(next);
    setInputValue(next);
    setOpen(false);
  };

  const handleSelect = (user: UserProfileDTO) => {
    const field = (searchField || 'firstName') as ManageUsageSearchField;
    const value = commitValueForField(user, field);
    commitTypedOrSelected(value);
  };

  const handleClear = () => {
    setInputValue('');
    onCommit('');
    setSuggestions(mergeUsers(localUsers, cachedUsers).slice(0, SUGGESTION_LIMIT));
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      if (suggestions.length === 0) runSearch(inputValue);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (suggestions.length === 1) {
        handleSelect(suggestions[0]);
        return;
      }
      commitTypedOrSelected(inputValue);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={`Search users by ${fieldLabel}, email, or user ID`}
          autoComplete="off"
          placeholder={`Search by ${fieldLabel}, email, or user ID...`}
          value={inputValue}
          onChange={(e) => {
            const next = e.target.value;
            setInputValue(next);
            setOpen(true);
            runSearch(next);
          }}
          onFocus={() => {
            setOpen(true);
            runSearch(inputValue);
          }}
          onKeyDown={handleKeyDown}
          className="block w-full border border-gray-400 rounded-r-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 pr-10 text-base min-h-[48px]"
        />
        {inputValue ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Clear search"
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">Searching users...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              {inputValue.trim()
                ? 'No matching users. Press Enter to filter the list by this text.'
                : 'Type a name, email, phone, or user ID'}
            </li>
          ) : (
            suggestions.map((user) => {
              const key = user.id ?? user.userId ?? user.email ?? formatUserSuggestion(user);
              return (
                <li key={String(key)} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(user)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                  >
                    <span className="block text-sm font-medium text-gray-900">
                      {formatUserSuggestion(user)}
                    </span>
                    <span className="block text-xs text-gray-500 truncate mt-0.5">
                      {[user.userId, user.phone, user.userRole, user.userStatus]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
