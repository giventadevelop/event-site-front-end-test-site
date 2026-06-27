"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';
import type { EventDetailsDTO } from '@/types';

interface EventSearchSelectorProps {
  onEventSelect: (eventId: string) => void;
  selectedEventId?: string;
  className?: string;
}

export default function EventSearchSelector({
  onEventSelect,
  selectedEventId = '',
  className = '',
}: EventSearchSelectorProps) {
  const [searchField, setSearchField] = useState<'title' | 'id' | 'caption'>('title');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchCaption, setSearchCaption] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchAdmissionType, setSearchAdmissionType] = useState('');
  const [sort, setSort] = useState('startDate,desc');
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitializedFromSelectedId, setHasInitializedFromSelectedId] = useState(false);

  const loadEvents = useCallback(async () => {
    // Don't show loading if we're just initializing from selectedEventId
    if (selectedEventId && !hasInitializedFromSelectedId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const filterParams: any = {
        admissionType: searchAdmissionType,
        sort,
        pageNum: 0,
        pageSize: 50, // Show up to 50 events for selection
      };

      // Apply date filtering - show future events by default, but allow override
      // EXCEPTION: When searching by ID, don't apply date filter (we want to find the event regardless of date)
      const today = new Date().toISOString().split('T')[0];
      if (searchField === 'id' && searchId) {
        // When searching by ID, don't apply date filters - we want to find the event regardless of date
        // Only apply date filters if explicitly provided
        if (searchStartDate) filterParams.startDate = searchStartDate;
        if (searchEndDate) filterParams.endDate = searchEndDate;
      } else {
        // For other search types, default to future events
        if (!searchStartDate && !searchEndDate) {
          filterParams.startDate = today; // Default to future events
        }
        if (searchStartDate) filterParams.startDate = searchStartDate;
        if (searchEndDate) filterParams.endDate = searchEndDate;
      }

      // Add search filters based on selected field
      if (searchField === 'title' && searchTitle) filterParams.title = searchTitle;
      else if (searchField === 'id' && searchId) filterParams.id = searchId;
      else if (searchField === 'caption' && searchCaption) filterParams.caption = searchCaption;

      const { events: eventsResult } = await fetchEventsFilteredServer(filterParams);
      setEvents(eventsResult);
    } catch (e: any) {
      setError(e.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [searchField, searchId, searchTitle, searchCaption, searchStartDate, searchEndDate, searchAdmissionType, sort, selectedEventId, hasInitializedFromSelectedId]);

  // Initialize search fields when selectedEventId is provided (from URL query params)
  useEffect(() => {
    if (selectedEventId && !hasInitializedFromSelectedId) {
      // Auto-populate search fields when eventId comes from URL
      setSearchField('id');
      setSearchId(selectedEventId);
      setHasInitializedFromSelectedId(true);
      // Load the event immediately when eventId is provided from URL
      // This ensures the event appears in the list without showing "Loading events..." unnecessarily
      if (selectedEventId) {
        loadEvents();
      }
    }
  }, [selectedEventId, hasInitializedFromSelectedId, loadEvents]);

  useEffect(() => {
    // Skip if we're initializing from selectedEventId (handled by the effect above)
    if (selectedEventId && !hasInitializedFromSelectedId) {
      return;
    }

    // Only auto-load if there's at least one search parameter
    const hasSearchCriteria = searchTitle || searchId || searchCaption || searchStartDate || searchEndDate;

    if (hasSearchCriteria) {
      // Auto-load events when filters change (with debounce for text inputs)
      // No debounce for ID search (instant results)
      const debounceDelay = searchField === 'id' ? 0 : 300;
      const timer = setTimeout(() => {
        loadEvents();
      }, debounceDelay);

      return () => clearTimeout(timer);
    } else {
      // Clear events if no search criteria
      // BUT: If we have a selectedEventId, don't clear - we want to show it
      if (!selectedEventId) {
        setEvents([]);
      }
    }
  }, [searchField, searchTitle, searchId, searchCaption, searchStartDate, searchEndDate, searchAdmissionType, sort, selectedEventId, hasInitializedFromSelectedId, loadEvents]);

  const handleEventClick = (event: EventDetailsDTO) => {
    if (event.id) {
      onEventSelect(event.id.toString());
    }
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-lg font-semibold text-blue-800 mb-4">Search Events</div>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Search By</label>
            <select
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 w-40"
              value={searchField}
              onChange={e => setSearchField(e.target.value as 'title' | 'id' | 'caption')}
            >
              <option value="title">Title</option>
              <option value="id">ID</option>
              <option value="caption">Caption</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {searchField === 'id' ? 'Event ID' : searchField.charAt(0).toUpperCase() + searchField.slice(1)}
            </label>
            <input
              type={searchField === 'id' ? 'number' : 'text'}
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 w-48"
              value={searchField === 'title' ? searchTitle : searchField === 'id' ? searchId : searchCaption}
              onChange={e => {
                if (searchField === 'title') setSearchTitle(e.target.value);
                else if (searchField === 'id') setSearchId(e.target.value);
                else setSearchCaption(e.target.value);
              }}
              placeholder={`Search by ${searchField}`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Start Date</label>
            <input
              type="date"
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              value={searchStartDate}
              onChange={e => setSearchStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">End Date</label>
            <input
              type="date"
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              value={searchEndDate}
              onChange={e => setSearchEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Admission</label>
            <select
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 w-32"
              value={searchAdmissionType}
              onChange={e => setSearchAdmissionType(e.target.value)}
            >
              <option value="">All</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Sort</label>
            <select
              className="border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 w-40"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="startDate,asc">Date (Earliest)</option>
              <option value="startDate,desc">Date (Latest)</option>
              <option value="title,asc">Title (A-Z)</option>
              <option value="title,desc">Title (Z-A)</option>
              <option value="id,desc">ID (Newest)</option>
              <option value="id,asc">ID (Oldest)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <span className="text-gray-600">Loading events...</span>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Select an event to view analytics ({events.length} found)
            </div>
            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Start Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                        selectedEventId === event.id?.toString() ? 'bg-blue-100' : ''
                      }`}
                    >
                      <td className="px-4 py-2 text-sm text-gray-900">{event.id}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {event.startDate} {event.startTime}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{event.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && events.length === 0 && (searchTitle || searchId || searchCaption || searchStartDate || searchEndDate) && (
          <div className="mt-4 text-center py-4 text-gray-600">
            No events found matching your search criteria.
          </div>
        )}

        {!loading && events.length === 0 && !searchTitle && !searchId && !searchCaption && !searchStartDate && !searchEndDate && (
          <div className="mt-4 text-center py-4 text-gray-500">
            Enter search criteria to find events.
          </div>
        )}

        {selectedEventId && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-blue-800">
              Selected Event ID: {selectedEventId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
