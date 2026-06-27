'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  searchEventsServer,
  linkEventToFocusGroupServer,
  unlinkEventFromFocusGroupServer,
  fetchLinkedEventsPaginatedServer,
} from './ApiServerActions';
import type { EventDetailsDTO } from '@/types';
import { FaSearch, FaCheckCircle, FaExclamationTriangle, FaLink } from 'react-icons/fa';
import Link from 'next/link';

const MAX_RECENT = 50;

interface ManageGroupEventsClientProps {
  focusGroupId: number;
  groupName: string;
  initialLinked: EventDetailsDTO[];
  initialTotalLinkedCount: number;
  linkedPageSize: number;
  recentEvents: EventDetailsDTO[];
}

export default function ManageGroupEventsClient({
  focusGroupId,
  groupName,
  initialLinked,
  initialTotalLinkedCount,
  linkedPageSize,
  recentEvents,
}: ManageGroupEventsClientProps) {
  const router = useRouter();
  const [linked, setLinked] = useState<EventDetailsDTO[]>(initialLinked);
  const [totalLinkedCount, setTotalLinkedCount] = useState(initialTotalLinkedCount);
  const [linkedPage, setLinkedPage] = useState(0);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [eventSearchType, setEventSearchType] = useState<'id' | 'name' | 'dateRange'>('id');
  const [eventSearchId, setEventSearchId] = useState('');
  const [eventSearchName, setEventSearchName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [searchResults, setSearchResults] = useState<EventDetailsDTO[]>([]);
  const [isSearchingEvents, setIsSearchingEvents] = useState(false);
  const [searchReturnedEmpty, setSearchReturnedEmpty] = useState(false);
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const [selectedRecentId, setSelectedRecentId] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadLinkedPage = useCallback(
    async (page: number) => {
      setLoadingLinked(true);
      try {
        const { linked: nextLinked, totalCount } = await fetchLinkedEventsPaginatedServer(
          focusGroupId,
          page,
          linkedPageSize
        );
        setLinked(nextLinked);
        setTotalLinkedCount(totalCount);
        setLinkedPage(page);
      } finally {
        setLoadingLinked(false);
      }
    },
    [focusGroupId, linkedPageSize]
  );

  useEffect(() => {
    setLinked(initialLinked);
    setTotalLinkedCount(initialTotalLinkedCount);
    setLinkedPage(0);
  }, [initialLinked, initialTotalLinkedCount]);

  const onPrevLinkedPage = () => {
    if (linkedPage <= 0 || loadingLinked) return;
    loadLinkedPage(linkedPage - 1);
  };

  const onNextLinkedPage = () => {
    const totalPages = Math.ceil(totalLinkedCount / linkedPageSize) || 1;
    if (linkedPage >= totalPages - 1 || loadingLinked) return;
    loadLinkedPage(linkedPage + 1);
  };

  const linkedIds = new Set(linked.map((e) => e.id).filter(Boolean));
  const candidatesFromSearch = searchResults.filter((e) => e.id != null && !linkedIds.has(e.id));
  const recentCandidates = recentEvents.filter((e) => e.id != null && !linkedIds.has(e.id));

  const handleEventSearch = async () => {
    setIsSearchingEvents(true);
    setSearchReturnedEmpty(false);
    setSearchResults([]);
    try {
      const results = await searchEventsServer(
        eventSearchType === 'name' ? eventSearchName : undefined,
        eventSearchType === 'id' ? eventSearchId : undefined,
        eventSearchType === 'dateRange' ? eventStartDate : undefined,
        eventSearchType === 'dateRange' ? eventEndDate : undefined
      );
      setSearchResults(results ?? []);
      if (!results || results.length === 0) {
        setSearchReturnedEmpty(true);
      }
    } catch {
      setSearchResults([]);
      setSearchReturnedEmpty(true);
    } finally {
      setIsSearchingEvents(false);
    }
  };

  const handleLink = async (eventId: number) => {
    if (linkedIds.has(eventId)) return;
    setLinkingId(eventId);
    setMessage(null);
    try {
      const out = await linkEventToFocusGroupServer(eventId, focusGroupId);
      if (out.ok) {
        setMessage({ type: 'success', text: 'Event linked successfully.' });
        router.refresh();
        loadLinkedPage(linkedPage);
      } else {
        setMessage({ type: 'error', text: out.error || 'Failed to link event.' });
      }
    } finally {
      setLinkingId(null);
    }
  };

  const handleUnlink = async (eventId: number) => {
    setUnlinkingId(eventId);
    setMessage(null);
    try {
      const out = await unlinkEventFromFocusGroupServer(eventId, focusGroupId);
      if (out.ok) {
        setMessage({ type: 'success', text: 'Event unlinked.' });
        router.refresh();
        loadLinkedPage(linkedPage);
      } else {
        setMessage({ type: 'error', text: out.error || 'Failed to unlink.' });
      }
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleLinkFromRecent = async () => {
    const id = selectedRecentId ? parseInt(selectedRecentId, 10) : NaN;
    if (Number.isNaN(id) || linkedIds.has(id)) return;
    await handleLink(id);
    setSelectedRecentId('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Manage Events for: {groupName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Search for an event, then link it to this focus group. Or select from recent events (max {MAX_RECENT}).
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked Events - table with pagination per design system */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Linked Events</h2>
          <div className="overflow-x-auto rounded-xl border-2 border-blue-200/60 shadow-sm">
            <table className="w-full min-w-[320px] border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">Event</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-900 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingLinked ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-gray-500 text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : linked.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 px-4 text-gray-500 text-sm">
                      No linked events. Search below to link one.
                    </td>
                  </tr>
                ) : (
                  linked.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={`border-b border-gray-200 transition-colors ${
                        idx % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/80 hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">{e.title}</span>
                        {e.startDate && (
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(e.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-shrink-0">
                          <Link
                            href={`/admin/events/${e.id}`}
                            className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            title="View event"
                            aria-label="View event"
                          >
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleUnlink(e.id!)}
                            disabled={unlinkingId === e.id}
                            className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Unlink event"
                            aria-label="Unlink event"
                          >
                            {unlinkingId === e.id ? (
                              <svg className="animate-spin w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - per pagination_footer_styling.mdc */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <button
                onClick={onPrevLinkedPage}
                disabled={linkedPage === 0 || loadingLinked}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Previous Page"
                aria-label="Previous Page"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm font-bold text-blue-700">
                  Page <span className="text-blue-600">{linkedPage + 1}</span> of{' '}
                  <span className="text-blue-600">{Math.ceil(totalLinkedCount / linkedPageSize) || 1}</span>
                </span>
              </div>
              <button
                onClick={onNextLinkedPage}
                disabled={linkedPage >= Math.ceil(totalLinkedCount / linkedPageSize) - 1 || loadingLinked}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Next Page"
                aria-label="Next Page"
                type="button"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-3">
              {totalLinkedCount > 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{totalLinkedCount === 0 ? 0 : linkedPage * linkedPageSize + 1}</span> to{' '}
                    <span className="font-bold text-blue-600">
                      {Math.min(linkedPage * linkedPageSize + linkedPageSize, totalLinkedCount)}
                    </span>{' '}
                    of <span className="font-bold text-blue-600">{totalLinkedCount}</span> events
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-700">No events found</span>
                  <span className="text-sm text-orange-600">[No events match your criteria]</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Link */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search for an Event</h2>
          <p className="text-gray-600 text-sm mb-4">
            Search by Event ID, Event Name, or Date Range. Only search results (max 50) are shown; use the dropdown for recent events.
          </p>

          <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-4">
            <div className="w-full sm:w-auto min-w-0 sm:min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search By</label>
              <select
                value={eventSearchType}
                onChange={(e) => {
                  setEventSearchType(e.target.value as 'id' | 'name' | 'dateRange');
                  setSearchReturnedEmpty(false);
                }}
                className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="id">Event ID</option>
                <option value="name">Event Name</option>
                <option value="dateRange">Date Range</option>
              </select>
            </div>

            {eventSearchType === 'id' && (
              <>
                <div className="flex-1 min-w-0 sm:min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event ID</label>
                  <input
                    type="number"
                    value={eventSearchId}
                    onChange={(e) => {
                      setEventSearchId(e.target.value);
                      setSearchReturnedEmpty(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && eventSearchId.trim()) handleEventSearch();
                    }}
                    placeholder="Enter Event ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventSearchId.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">
                    {isSearchingEvents ? 'Searching...' : 'Search Events'}
                  </span>
                </button>
              </>
            )}

            {eventSearchType === 'name' && (
              <>
                <div className="flex-1 min-w-0 sm:min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                  <input
                    type="text"
                    value={eventSearchName}
                    onChange={(e) => {
                      setEventSearchName(e.target.value);
                      setSearchReturnedEmpty(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && eventSearchName.trim()) handleEventSearch();
                    }}
                    placeholder="Enter Event Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventSearchName.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">
                    {isSearchingEvents ? 'Searching...' : 'Search Events'}
                  </span>
                </button>
              </>
            )}

            {eventSearchType === 'dateRange' && (
              <>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => {
                      setEventStartDate(e.target.value);
                      setSearchReturnedEmpty(false);
                    }}
                    className="w-full min-w-[140px] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => {
                      setEventEndDate(e.target.value);
                      setSearchReturnedEmpty(false);
                    }}
                    className="w-full min-w-[140px] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventStartDate || !eventEndDate}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">
                    {isSearchingEvents ? 'Searching...' : 'Search Events'}
                  </span>
                </button>
              </>
            )}
          </div>

          {searchReturnedEmpty && (
            <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3" role="alert">
              <FaExclamationTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">No events found</p>
                <p className="text-sm text-amber-700 mt-1">
                  Try a different Event ID, event name, or date range.
                </p>
              </div>
            </div>
          )}

          {candidatesFromSearch.length > 0 && (
            <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50/80 shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-emerald-200 bg-emerald-100/80">
                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                  <FaCheckCircle className="w-5 h-5 text-emerald-600" />
                  Search Results ({candidatesFromSearch.length} event{candidatesFromSearch.length !== 1 ? 's' : ''} to link)
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {candidatesFromSearch.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border-2 border-emerald-200 rounded-lg bg-white hover:bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900">{event.title}</div>
                      <div className="text-sm text-emerald-700 mt-1">
                        Event ID: {event.id} | {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLink(event.id!)}
                      disabled={linkingId === event.id}
                      className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-5 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      title="Link event to focus group"
                      aria-label="Link event to focus group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                        <FaLink className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-semibold text-green-700">
                        {linkingId === event.id ? 'Linking...' : 'Link'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent events dropdown (max 50) - only candidates not already linked */}
          <div className="mt-6 pt-6 border-t border-teal-200">
            <label className="block text-sm font-semibold text-teal-800 mb-2">
              Or select from recent events (max {MAX_RECENT})
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRecentId}
                onChange={(e) => setSelectedRecentId(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 border-2 border-teal-300 rounded-lg bg-teal-50/50 text-teal-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select an event to link...</option>
                {recentCandidates.slice(0, MAX_RECENT).map((event) => (
                  <option key={event.id} value={String(event.id)}>
                    {event.title} (ID: {event.id})
                  </option>
                ))}
                {recentCandidates.length === 0 && (
                  <option value="" disabled>No unlinked events in recent list</option>
                )}
              </select>
              <button
                type="button"
                onClick={handleLinkFromRecent}
                disabled={!selectedRecentId || linkingId !== null}
                className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                title="Link selected event"
                aria-label="Link selected event"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <FaLink className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-green-700">Link selected</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/admin/focus-groups/${focusGroupId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <span>← Back to Focus Group</span>
        </Link>
      </div>
    </div>
  );
}
