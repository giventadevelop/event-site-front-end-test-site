'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

const SUGGESTION_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 280;

export type AdminListSearchItem = Record<string, unknown> & { id?: number | string | null };

export interface AdminListSearchComboboxProps<T extends AdminListSearchItem> {
  /** Items used for local multi-field suggestions (typically the loaded list). */
  items: T[];
  /** Committed filter value that drives list filtering / refetch — not updated on every keystroke. */
  committedValue: string;
  onCommit: (value: string) => void;
  /** Return all strings that should match the query for an item. */
  getSearchFields: (item: T) => Array<string | number | null | undefined>;
  /** Value written into the input / committed filter when an suggestion is selected. */
  getCommitValue: (item: T) => string;
  formatPrimary: (item: T) => string;
  formatSecondary?: (item: T) => string;
  getItemKey?: (item: T) => string;
  placeholder?: string;
  inputId?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  /** Optional remote search; results are merged with local matches. */
  searchRemote?: (query: string) => Promise<T[]>;
  /** Show clear (×) when there is input text. Default true. */
  showClear?: boolean;
}

function normalizeFields(fields: Array<string | number | null | undefined>): string[] {
  return fields
    .map((v) => (v == null ? '' : String(v)).trim())
    .filter(Boolean);
}

function filterLocally<T extends AdminListSearchItem>(
  items: T[],
  query: string,
  getSearchFields: (item: T) => Array<string | number | null | undefined>,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, SUGGESTION_LIMIT);
  return items
    .filter((item) =>
      normalizeFields(getSearchFields(item)).some((v) => v.toLowerCase().includes(q)),
    )
    .slice(0, SUGGESTION_LIMIT);
}

function mergeItems<T extends AdminListSearchItem>(
  primary: T[],
  secondary: T[],
  getItemKey: (item: T) => string,
): T[] {
  const byKey = new Map<string, T>();
  for (const item of [...primary, ...secondary]) {
    const key = getItemKey(item);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, item);
  }
  return Array.from(byKey.values()).slice(0, SUGGESTION_LIMIT);
}

/**
 * Smooth multi-field typeahead for admin list filters.
 * Typing updates suggestions only; commit on select / Enter / clear.
 */
export default function AdminListSearchCombobox<T extends AdminListSearchItem>({
  items,
  committedValue,
  onCommit,
  getSearchFields,
  getCommitValue,
  formatPrimary,
  formatSecondary,
  getItemKey,
  placeholder = 'Search...',
  inputId,
  ariaLabel,
  disabled = false,
  className = 'relative w-full',
  inputClassName = 'block w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  searchRemote,
  showClear = true,
}: AdminListSearchComboboxProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const resolvedInputId = inputId ?? `${reactId}-input`;

  const keyFn =
    getItemKey ??
    ((item: T) =>
      item.id != null
        ? `id:${item.id}`
        : `row:${formatPrimary(item)}`);

  const [inputValue, setInputValue] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [cachedItems, setCachedItems] = useState<T[]>(items);

  useEffect(() => {
    setInputValue(committedValue);
  }, [committedValue]);

  useEffect(() => {
    if (items.length === 0) return;
    setCachedItems((prev) => mergeItems(items, prev, keyFn));
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps -- keyFn stable enough via getItemKey

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
      const pool = mergeItems(items, cachedItems, keyFn);
      const localMatches = filterLocally(pool, trimmed, getSearchFields);
      setSuggestions(localMatches);

      if (!trimmed) {
        setSuggestions(pool.slice(0, SUGGESTION_LIMIT));
        return;
      }

      if (!searchRemote) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const remote = await searchRemote(trimmed);
          const merged = mergeItems(remote, localMatches, keyFn);
          setSuggestions(merged);
          if (remote.length > 0) {
            setCachedItems((prev) => mergeItems(remote, prev, keyFn));
          }
        } catch {
          setSuggestions(localMatches);
        } finally {
          setLoading(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [cachedItems, getSearchFields, items, keyFn, searchRemote],
  );

  const commitTypedOrSelected = (value: string) => {
    const next = value.trim();
    onCommit(next);
    setInputValue(next);
    setOpen(false);
  };

  const handleSelect = (item: T) => {
    commitTypedOrSelected(getCommitValue(item));
  };

  const handleClear = () => {
    setInputValue('');
    onCommit('');
    setSuggestions(mergeItems(items, cachedItems, keyFn).slice(0, SUGGESTION_LIMIT));
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
    <div ref={containerRef} className={className}>
      <div className="relative">
        <input
          id={resolvedInputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={ariaLabel ?? placeholder}
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
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
          className={inputClassName}
        />
        {showClear && inputValue ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none z-10"
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
            <li className="px-4 py-3 text-sm text-gray-500">Searching...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              {inputValue.trim()
                ? 'No matches. Press Enter to filter by this text.'
                : 'Start typing to see suggestions'}
            </li>
          ) : (
            suggestions.map((item) => {
              const key = keyFn(item);
              const secondary = formatSecondary?.(item);
              return (
                <li key={key} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                  >
                    <span className="block text-sm font-medium text-gray-900">
                      {formatPrimary(item)}
                    </span>
                    {secondary ? (
                      <span className="block text-xs text-gray-500 truncate mt-0.5">
                        {secondary}
                      </span>
                    ) : null}
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
