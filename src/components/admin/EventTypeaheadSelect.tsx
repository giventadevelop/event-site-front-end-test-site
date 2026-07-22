'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';

const RESULT_LIMIT = 20;

interface EventTypeaheadSelectProps {
  /** Currently selected event (id + title used for display); null/undefined = cleared. */
  selectedEvent?: Pick<EventDetailsDTO, 'id' | 'title' | 'startDate'> | null;
  onSelect: (event: EventDetailsDTO | null) => void;
  /** Label for the clear option, e.g. "All Events" or "No Event (Global)". */
  clearLabel: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Server-backed event typeahead: fetches up to 20 events via title.contains
 * instead of loading the full event list into a <select>.
 */
export default function EventTypeaheadSelect({
  selectedEvent,
  onSelect,
  clearLabel,
  placeholder = 'Type to search events...',
  className = 'relative w-full',
  inputClassName = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
}: EventTypeaheadSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  const [inputValue, setInputValue] = useState(selectedEvent?.title || '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<EventDetailsDTO[]>([]);

  // Keep the visible text in sync with the selected event (edit forms, resets).
  useEffect(() => {
    setInputValue(selectedEvent?.title || '');
  }, [selectedEvent?.id, selectedEvent?.title]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setInputValue(selectedEvent?.title || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedEvent?.title]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { events } = await fetchEventsFilteredServer({
          title: term.trim() || undefined,
          pageSize: RESULT_LIMIT,
          sort: 'startDate,desc',
        });
        setOptions(events);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (event: EventDetailsDTO | null) => {
    onSelect(event);
    setInputValue(event?.title || '');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={className}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label={placeholder}
        autoComplete="off"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
          runSearch(e.target.value);
        }}
        onFocus={() => {
          setOpen(true);
          runSearch(inputValue);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className={inputClassName}
      />
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg"
        >
          <li role="option" aria-selected={!selectedEvent}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(null)}
              className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-blue-50 transition-colors"
            >
              {clearLabel}
            </button>
          </li>
          {loading && options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">Searching events...</li>
          ) : options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">
              {inputValue.trim() ? 'No matching events.' : 'Type to search events by title.'}
            </li>
          ) : (
            options.map((event) => (
              <li key={event.id} role="option" aria-selected={selectedEvent?.id === event.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(event)}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${
                    selectedEvent?.id === event.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <span className="block text-sm font-medium text-gray-900">
                    {event.title?.trim() || `Event #${event.id}`}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {[event.id != null ? `#${event.id}` : null, event.startDate].filter(Boolean).join(' · ')}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
