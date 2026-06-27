'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchAssociatedEvents, unlinkEventFromFocusGroup } from '../ApiServerActions';
import { FaUnlink } from 'react-icons/fa';
import { formatDateLocal } from '@/lib/date';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface AssociatedEventsTableProps {
  focusGroupId: number;
  initialEvents?: EventDetailsDTO[];
  initialTotalCount?: number;
  onUnlinked?: () => void;
}

export default function AssociatedEventsTable({
  focusGroupId,
  initialEvents = [],
  initialTotalCount = 0,
  onUnlinked,
}: AssociatedEventsTableProps) {
  const [events, setEvents] = useState<EventDetailsDTO[]>(initialEvents);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const [eventToUnlink, setEventToUnlink] = useState<EventDetailsDTO | null>(null);
  const isInitialMount = useRef(true);
  const justSyncedFromInitial = useRef(false);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const displayPage = currentPage + 1;
  const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? Math.min((currentPage + 1) * pageSize, totalCount) : 0;

  const isPrevDisabled = currentPage === 0 || loading;
  const isNextDisabled = currentPage >= totalPages - 1 || loading;

  const loadEvents = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const sort = 'startDate,desc';
      const result = await fetchAssociatedEvents(focusGroupId, page, pageSize, sort, showPastEvents);
      setEvents(result.events);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      console.error('Failed to load associated events:', err);
      setError('Failed to load events. Please try again.');
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Sync from server when initial data changes (e.g. after router.refresh() following link)
  useEffect(() => {
    setEvents(initialEvents);
    setTotalCount(initialTotalCount);
    setCurrentPage(0);
    justSyncedFromInitial.current = true;
  }, [initialEvents, initialTotalCount]);

  // Load events when user changes page or toggles Upcoming/Past; skip on first mount and right after sync so we keep server list
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (justSyncedFromInitial.current) {
      justSyncedFromInitial.current = false;
      return;
    }
    loadEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusGroupId, currentPage, showPastEvents]);

  const handlePrevPage = () => {
    if (!isPrevDisabled) {
      setCurrentPage(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (!isNextDisabled) {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    }
  };

  const openUnlinkDialog = (event: EventDetailsDTO) => {
    if (!event.id) return;
    setError(null);
    setEventToUnlink(event);
  };

  const closeUnlinkDialog = () => {
    if (!unlinkingId) setEventToUnlink(null);
  };

  const handleConfirmUnlink = async () => {
    if (!eventToUnlink?.id) return;

    setUnlinkingId(eventToUnlink.id);
    setError(null);
    try {
      await unlinkEventFromFocusGroup(eventToUnlink.id, focusGroupId);
      setEventToUnlink(null);
      onUnlinked?.();
    } catch (err: any) {
      console.error('Failed to unlink event:', err);
      setError(err?.message || 'Failed to unlink event. Please try again.');
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Associated Events</h2>
        
        {/* Filter Toggle - two distinct colors: blue (upcoming) and purple (past), no gray */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(false);
              setCurrentPage(0);
            }}
            className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 px-3 transition-all duration-300 hover:scale-105 ${
              !showPastEvents
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'bg-purple-100 hover:bg-purple-200'
            }`}
            title="Upcoming Events"
            aria-label="Upcoming Events"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              !showPastEvents ? 'bg-blue-200' : 'bg-purple-200'
            }`}>
              <svg className={`w-6 h-6 ${!showPastEvents ? 'text-blue-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`font-semibold ${!showPastEvents ? 'text-blue-700' : 'text-purple-700'}`}>
              Upcoming Events
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(true);
              setCurrentPage(0);
            }}
            className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 px-3 transition-all duration-300 hover:scale-105 ${
              showPastEvents
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'bg-purple-100 hover:bg-purple-200'
            }`}
            title="Past Events"
            aria-label="Past Events"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              showPastEvents ? 'bg-blue-200' : 'bg-purple-200'
            }`}>
              <svg className={`w-6 h-6 ${showPastEvents ? 'text-blue-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`font-semibold ${showPastEvents ? 'text-blue-700' : 'text-purple-700'}`}>
              Past Events
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No events found</p>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
            [No events match your criteria]
          </span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.startDate ? formatDateLocal(event.startDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.endDate ? formatDateLocal(event.endDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => openUnlinkDialog(event)}
                        disabled={unlinkingId !== null}
                        className="flex-shrink-0 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Unlink event from focus group"
                        aria-label="Unlink event from focus group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
                          <FaUnlink className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-semibold text-red-700 text-sm">Unlink</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - matching admin pagination footer style */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={isPrevDisabled}
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
                  Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages || 1}</span>
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
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
              {totalCount > 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> events
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
        </>
      )}

      {/* Unlink confirmation dialog - per dialog_button_styling.mdc */}
      <AlertDialog open={!!eventToUnlink} onOpenChange={(open) => !open && closeUnlinkDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink event from focus group</AlertDialogTitle>
            <AlertDialogDescription>
              {eventToUnlink ? (
                <>
                  Are you sure you want to unlink <strong>{eventToUnlink.title}</strong> from this focus group? The event will no longer be associated with this focus group.
                </>
              ) : (
                'Confirm unlink'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 sm:gap-4">
            <AlertDialogCancel
              onClick={closeUnlinkDialog}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              title="Cancel"
              aria-label="Cancel"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">Cancel</span>
            </AlertDialogCancel>
            <button
              type="button"
              onClick={handleConfirmUnlink}
              disabled={!!unlinkingId}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Unlink event"
              aria-label="Unlink event"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                {unlinkingId ? (
                  <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-red-700">{unlinkingId ? 'Unlinking...' : 'Unlink'}</span>
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

