'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { EventDetailsDTO } from '@/types';
import { searchEventsForTypeaheadServer } from '../ApiServerActions';

const SUGGESTION_LIMIT = 20;

export type ManageEventsSearchField = 'title' | 'caption';

function formatEventSuggestion(event: EventDetailsDTO): string {
  const title = event.title?.trim() || 'Untitled event';
  const idPart = event.id != null ? `#${event.id}` : null;
  return idPart ? `${title} · ${idPart}` : title;
}

function commitValueForField(
  event: EventDetailsDTO,
  searchField: ManageEventsSearchField,
): string {
  if (searchField === 'caption' && event.caption?.trim()) {
    return event.caption.trim();
  }
  if (event.title?.trim()) return event.title.trim();
  if (event.id != null) return String(event.id);
  return '';
}

function filterEventsLocally(events: EventDetailsDTO[], query: string): EventDetailsDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) return events.slice(0, SUGGESTION_LIMIT);
  return events
    .filter((event) =>
      [event.title, event.caption, event.id != null ? String(event.id) : ''].some((v) =>
        (v ?? '').toLowerCase().includes(q),
      ),
    )
    .slice(0, SUGGESTION_LIMIT);
}

function mergeEvents(primary: EventDetailsDTO[], secondary: EventDetailsDTO[]): EventDetailsDTO[] {
  const byKey = new Map<string, EventDetailsDTO>();
  for (const event of [...primary, ...secondary]) {
    const key =
      event.id != null
        ? `id:${event.id}`
        : event.title
          ? `title:${event.title}`
          : null;
    if (!key || byKey.has(key)) continue;
    byKey.set(key, event);
  }
  return Array.from(byKey.values()).slice(0, SUGGESTION_LIMIT);
}

interface ManageEventsSearchComboboxProps {
  searchField: ManageEventsSearchField;
  /** Committed filter value that drives the event list fetch — not updated on every keystroke. */
  committedValue: string;
  onCommit: (value: string) => void;
  localEvents?: EventDetailsDTO[];
  disabled?: boolean;
}

export default function ManageEventsSearchCombobox({
  searchField,
  committedValue,
  onCommit,
  localEvents = [],
  disabled = false,
}: ManageEventsSearchComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();
  const inputId = 'manage-events-search';

  const [inputValue, setInputValue] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<EventDetailsDTO[]>([]);
  const [cachedEvents, setCachedEvents] = useState<EventDetailsDTO[]>(localEvents);

  const fieldLabel =
    searchField === 'caption' ? 'Caption' : 'Title';

  useEffect(() => {
    setInputValue(committedValue);
  }, [committedValue]);

  useEffect(() => {
    if (localEvents.length === 0) return;
    setCachedEvents((prev) => mergeEvents(localEvents, prev));
  }, [localEvents]);

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
      const localMatches = filterEventsLocally(
        mergeEvents(localEvents, cachedEvents),
        trimmed,
      );
      setSuggestions(localMatches);

      if (!trimmed) {
        setSuggestions(mergeEvents(localEvents, cachedEvents).slice(0, SUGGESTION_LIMIT));
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const remote = await searchEventsForTypeaheadServer(trimmed);
          const merged = mergeEvents(remote, localMatches);
          setSuggestions(merged);
          if (remote.length > 0) {
            setCachedEvents((prev) => mergeEvents(remote, prev));
          }
        } catch {
          setSuggestions(localMatches);
        } finally {
          setLoading(false);
        }
      }, 280);
    },
    [cachedEvents, localEvents],
  );

  const commitTypedOrSelected = (value: string) => {
    const next = value.trim();
    onCommit(next);
    setInputValue(next);
    setOpen(false);
  };

  const handleSelect = (event: EventDetailsDTO) => {
    const value = commitValueForField(event, searchField);
    commitTypedOrSelected(value);
  };

  const handleClear = () => {
    setInputValue('');
    onCommit('');
    setSuggestions(mergeEvents(localEvents, cachedEvents).slice(0, SUGGESTION_LIMIT));
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
    <div ref={containerRef} className="relative w-48 min-w-[12rem]">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={`Search events by ${fieldLabel}, caption, or event ID`}
          autoComplete="off"
          placeholder={`Search by ${searchField}`}
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
          className="border px-3 py-2 pr-8 rounded w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {inputValue ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
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
          className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg min-w-[18rem]"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">Searching events...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              {inputValue.trim()
                ? 'No matching events. Press Enter to filter the list by this text.'
                : 'Type a title, caption, or event ID'}
            </li>
          ) : (
            suggestions.map((event) => {
              const key = event.id ?? event.title ?? formatEventSuggestion(event);
              return (
                <li key={String(key)} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(event)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                  >
                    <span className="block text-sm font-medium text-gray-900">
                      {formatEventSuggestion(event)}
                    </span>
                    <span className="block text-xs text-gray-500 truncate mt-0.5">
                      {[
                        event.startDate,
                        event.caption?.trim(),
                        event.admissionType,
                      ]
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
