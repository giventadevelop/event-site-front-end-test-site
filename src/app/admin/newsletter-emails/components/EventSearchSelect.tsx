'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';
import { FaSearch } from 'react-icons/fa';

interface EventSearchSelectProps {
  value?: number;
  onChange: (eventId: number | undefined) => void;
  required?: boolean;
}

export default function EventSearchSelect({
  value,
  onChange,
  required = false,
}: EventSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'id'>('title');
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventDetailsDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetailsDTO | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial events
    loadEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search term
    if (searchTerm.trim()) {
      const filtered = events.filter(event => {
        if (searchType === 'id') {
          return event.id?.toString().includes(searchTerm);
        } else {
          return event.title?.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      setFilteredEvents(filtered.slice(0, 7)); // Max 7 items
    } else {
      setFilteredEvents(events.slice(0, 7));
    }
  }, [searchTerm, searchType, events]);

  useEffect(() => {
    // Find selected event when value changes
    if (value) {
      const event = events.find(e => e.id === value);
      setSelectedEvent(event || null);
      if (event) {
        setSearchTerm(event.title || '');
      }
    } else {
      setSelectedEvent(null);
      setSearchTerm('');
    }
  }, [value, events]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await fetchEventsFilteredServer({
        pageNum: 0,
        pageSize: 100,
        sort: 'startDate,desc',
      });
      setEvents(result.events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
  };

  const handleSelectEvent = (event: EventDetailsDTO) => {
    if (!event.id) return;
    setSelectedEvent(event);
    setSearchTerm(event.title || '');
    onChange(event.id);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedEvent(null);
    setSearchTerm('');
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Event <span className="text-red-500">*</span>
      </label>

      {/* Search Type Toggle */}
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setSearchType('title');
            setSearchTerm('');
            setIsOpen(true);
          }}
          className={`px-3 py-1 text-xs rounded ${
            searchType === 'title'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Search by Title
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('id');
            setSearchTerm('');
            setIsOpen(true);
          }}
          className={`px-3 py-1 text-xs rounded ${
            searchType === 'id'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Search by ID
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type={searchType === 'id' ? 'number' : 'text'}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder={searchType === 'id' ? 'Enter Event ID...' : 'Search events by title...'}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10 px-4 py-2 text-base"
        />
        {selectedEvent && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (filteredEvents.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" style={{ maxHeight: 'calc(7 * 3.5rem)', overflowY: 'auto' }}>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No events found</div>
          ) : (
            <ul className="py-1">
              {filteredEvents.map((event) => (
                <li
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedEvent?.id === event.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {event.id} | {event.startDate}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected Event Display */}
      {selectedEvent && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">
            Selected: {selectedEvent.title}
          </div>
          <div className="text-xs text-blue-700">
            ID: {selectedEvent.id} | Date: {selectedEvent.startDate}
          </div>
        </div>
      )}
    </div>
  );
}

