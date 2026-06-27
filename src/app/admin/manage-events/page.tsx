'use client';
import { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { EventList } from '@/components/EventList';
import { useAuth } from "@clerk/nextjs";
// Icons removed - using inline SVGs instead
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import Image from 'next/image';
import DeleteConfirmationDialog, { type DeleteStatus } from '@/components/DeleteConfirmationDialog';
import {
  fetchEventsFilteredServer,
  fetchEventTypesServer,
  fetchCalendarEventsServer,
  cancelEventServer,
  deleteCalendarEventForEventServer,
  fetchChildEventsBySeriesIdServer,
  softDeleteEventWithChildrenServer,
  hardDeleteEventWithChildrenServer,
  activateEventWithChildrenServer,
} from '../ApiServerActions';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';

const MANAGE_EVENTS_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes, same as homepage

export default function ManageEventsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendarEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  // Search/filter state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCaption, setSearchCaption] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchAdmissionType, setSearchAdmissionType] = useState('');
  const [sort, setSort] = useState('startDate,asc');
  const [searchField, setSearchField] = useState<'title' | 'id' | 'caption'>('title');
  const [searchId, setSearchId] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  // Track event counts for both future and past to determine auto-switch and messages
  const [futureEventCount, setFutureEventCount] = useState<number | null>(null);
  const [pastEventCount, setPastEventCount] = useState<number | null>(null);
  const [hasCheckedInitialLoad, setHasCheckedInitialLoad] = useState(false);
  const [isAutoSwitching, setIsAutoSwitching] = useState(false);
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('idle');
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const [eventToDelete, setEventToDelete] = useState<EventDetailsDTO | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');
  const [childEventCount, setChildEventCount] = useState(0);

  // Activate confirmation dialog state
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [activateStatus, setActivateStatus] = useState<DeleteStatus>('idle');
  const [activateMessage, setActivateMessage] = useState<string>('');
  const [eventToActivate, setEventToActivate] = useState<EventDetailsDTO | null>(null);
  const [activateChildEventCount, setActivateChildEventCount] = useState(0);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const cacheKeyForView = getHomepageCacheKey(showPastEvents ? 'manage_events_cache_past' : 'manage_events_cache_future');

  function clearManageEventsCache() {
    try {
      sessionStorage.removeItem(getHomepageCacheKey('manage_events_cache_future'));
      sessionStorage.removeItem(getHomepageCacheKey('manage_events_cache_past'));
    } catch (_) {
      /* ignore */
    }
  }

  async function handleRefreshFromDb() {
    setRefreshLoading(true);
    clearManageEventsCache();
    await loadAll(0, false);
    setRefreshLoading(false);
  }

  useLayoutEffect(() => {
    if (!userId || page !== 0 || searchTitle || searchId || searchCaption || searchStartDate || searchEndDate) return;
    try {
      const raw = sessionStorage.getItem(cacheKeyForView);
      if (!raw) return;
      const { events: cachedEvents, totalCount: cachedTotal, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < MANAGE_EVENTS_CACHE_DURATION_MS && Array.isArray(cachedEvents)) {
        setEvents(cachedEvents);
        setTotalCount(typeof cachedTotal === 'number' ? cachedTotal : cachedEvents.length);
        setLoading(false);
      }
    } catch (_) {
      /* ignore */
    }
  }, [userId, cacheKeyForView, page, searchTitle, searchId, searchCaption, searchStartDate, searchEndDate]);

  async function loadAll(pageNum = 0, checkInitialLoad = false) {
    const isDefaultView = pageNum === 0 && !searchTitle && !searchId && !searchCaption && !searchStartDate && !searchEndDate;
    if (!isDefaultView) setLoading(true);
    setError(null);
    try {
      // Build date filtering based on toggle
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Determine which view we're loading (future or past)
      let loadingPastEvents = showPastEvents;

      // On initial load, check both future and past event counts in parallel
      if (checkInitialLoad && !hasCheckedInitialLoad && pageNum === 0 && !searchTitle && !searchId && !searchCaption && !searchStartDate && !searchEndDate) {
        const futureParams: any = {
          admissionType: searchAdmissionType,
          sort: 'startDate,asc',
          pageNum: 0,
          pageSize: 1,
          startDate: today,
        };
        const pastParams: any = {
          admissionType: searchAdmissionType,
          sort: 'startDate,desc',
          pageNum: 0,
          pageSize: 1,
          endDate: today,
        };

        // Parallel count checks instead of sequential
        const [{ totalCount: futureCount }, { totalCount: pastCount }] = await Promise.all([
          fetchEventsFilteredServer(futureParams),
          fetchEventsFilteredServer(pastParams),
        ]);
        setFutureEventCount(futureCount);
        setPastEventCount(pastCount);
        setHasCheckedInitialLoad(true);

        // Auto-switch to past events if no future events but past events exist
        if (futureCount === 0 && pastCount > 0) {
          setIsAutoSwitching(true);
          setShowPastEvents(true);
          loadingPastEvents = true;
        }
      }

      const filterParams: any = {
        admissionType: searchAdmissionType,
        sort: loadingPastEvents ? 'startDate,desc' : 'startDate,asc', // Override sort based on toggle
        pageNum,
        pageSize,
      };

      // Apply date filtering based on toggle (use loadingPastEvents which respects auto-switch)
      if (loadingPastEvents) {
        // Show events that ended before today
        filterParams.endDate = today;
      } else {
        // Show events that start today or later (future events including today)
        filterParams.startDate = today;
      }

      // Override with manual date filters if provided
      if (searchStartDate) filterParams.startDate = searchStartDate;
      if (searchEndDate) filterParams.endDate = searchEndDate;

      // Add search filters based on selected field
      if (searchField === 'title') filterParams.title = searchTitle;
      else if (searchField === 'id') filterParams.id = searchId;
      else if (searchField === 'caption') filterParams.caption = searchCaption;

      // Parallel data fetches instead of sequential
      const [eventsData, types, calendarEventsResult] = await Promise.all([
        fetchEventsFilteredServer(filterParams),
        fetchEventTypesServer(),
        fetchCalendarEventsServer(),
      ]);
      setEvents(eventsData.events);
      setTotalCount(eventsData.totalCount);
      setEventTypes(types);
      setCalendarEvents(calendarEventsResult);
      if (pageNum === 0 && !searchTitle && !searchId && !searchCaption && !searchStartDate && !searchEndDate) {
        try {
          sessionStorage.setItem(
            getHomepageCacheKey(loadingPastEvents ? 'manage_events_cache_past' : 'manage_events_cache_future'),
            JSON.stringify({
              events: eventsData.events,
              totalCount: eventsData.totalCount,
              timestamp: Date.now(),
            })
          );
        } catch (_) {
          /* ignore */
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      // Skip reload if we're currently auto-switching (prevents double-load)
      if (isAutoSwitching) {
        setIsAutoSwitching(false); // Reset flag after skipping
        return;
      }
      // On initial load (first render), check both future and past counts
      const isInitialLoad = !hasCheckedInitialLoad && page === 0 && !searchTitle && !searchId && !searchCaption && !searchStartDate && !searchEndDate;
      loadAll(page, isInitialLoad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page, searchTitle, searchId, searchCaption, searchField, searchStartDate, searchEndDate, searchAdmissionType, sort, showPastEvents]);

  async function handleDeleteClick(event: EventDetailsDTO, mode: 'soft' | 'hard' = 'soft') {
    setEventToDelete(event);
    setDeleteMode(mode);
    setDeleteStatus('confirming');

    // Check if this is a parent event (parentEventId is null/undefined)
    const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

    if (isParentEvent) {
      // Parent event: check how many children it has
      const seriesId = event.recurrenceSeriesId || event.id;
      if (seriesId) {
        try {
          const childEvents = await fetchChildEventsBySeriesIdServer(seriesId);
          console.log(`[handleDeleteClick] Fetched events for series ${seriesId}:`, childEvents.map(e => ({ id: e.id, parentEventId: e.parentEventId, isActive: e.isActive })));
          // Exclude the parent event itself from the count
          // Also filter to only count active child events (children with parentEventId set)
          const children = childEvents.filter(e =>
            e.id !== event.id &&
            e.parentEventId != null &&
            e.parentEventId === event.id
          );
          console.log(`[handleDeleteClick] Filtered children (excluding parent ${event.id}):`, children.map(e => ({ id: e.id, parentEventId: e.parentEventId })));
          console.log(`[handleDeleteClick] Child count: ${children.length}`);
          setChildEventCount(children.length);
        } catch (err) {
          console.error('Failed to fetch child events:', err);
          setChildEventCount(0);
        }
      } else {
        setChildEventCount(0);
      }
    } else {
      // Child event: no children, only delete this one
      setChildEventCount(0);
    }

    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    console.log('[handleConfirmDelete] Function called', { eventToDelete, deleteMode, childEventCount });

    if (!eventToDelete || !eventToDelete.id) {
      console.error('[handleConfirmDelete] No event to delete');
      return;
    }

    console.log(`[handleConfirmDelete] Starting ${deleteMode} delete for event ${eventToDelete.id}, parentEventId: ${eventToDelete.parentEventId}, childCount: ${childEventCount}`);

    setDeleteStatus('deleting');
    setDeleteMessage(
      deleteMode === 'hard'
        ? `Please wait while we permanently delete this event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''}` : ''}...`
        : `Please wait while we deactivate this event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''}` : ''}...`
    );

    try {
      setLoading(true);

      if (deleteMode === 'hard') {
        console.log(`[handleConfirmDelete] Hard deleting event ${eventToDelete.id}`);
        await hardDeleteEventWithChildrenServer(eventToDelete);
        setDeleteStatus('success');
        setDeleteMessage(
          `The event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''} have` : ' has'} been permanently deleted.`
        );
      } else {
        // Soft delete: always use softDeleteEventWithChildrenServer (it handles parent/child logic internally)
        console.log(`[handleConfirmDelete] Soft deleting event ${eventToDelete.id}, isParent: ${eventToDelete.parentEventId == null}, childCount: ${childEventCount}`);
        await softDeleteEventWithChildrenServer(eventToDelete);
        setDeleteStatus('success');
        if (childEventCount > 0) {
          setDeleteMessage(
            `The event and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''} have been marked as inactive successfully.`
          );
        } else {
          setDeleteMessage('The event has been marked as inactive successfully.');
        }
      }

      console.log(`[handleConfirmDelete] Successfully ${deleteMode === 'hard' ? 'deleted' : 'deactivated'} event ${eventToDelete.id}`);
      await loadAll(page);

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setDeleteStatus('idle');
        setEventToDelete(null);
        setChildEventCount(0);
      }, 1500);
    } catch (e: any) {
      console.error(`[handleConfirmDelete] Error ${deleteMode === 'hard' ? 'deleting' : 'deactivating'} event ${eventToDelete.id}:`, e);
      setDeleteStatus('error');
      setDeleteMessage(e.message || `Failed to ${deleteMode === 'hard' ? 'delete' : 'deactivate'} event. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelDelete() {
    setDeleteDialogOpen(false);
    setDeleteStatus('idle');
    setEventToDelete(null);
    setDeleteMessage('');
    setChildEventCount(0);
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
    setDeleteStatus('idle');
    setEventToDelete(null);
    setDeleteMessage('');
    setChildEventCount(0);
  }

  async function handleActivateClick(event: EventDetailsDTO) {
    setEventToActivate(event);
    setActivateStatus('confirming');

    // Check if this is a parent event (parentEventId is null/undefined)
    const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

    if (isParentEvent) {
      // Parent event: check how many children it has
      const seriesId = event.recurrenceSeriesId || event.id;
      if (seriesId) {
        try {
          const childEvents = await fetchChildEventsBySeriesIdServer(seriesId);
          // Exclude the parent event itself from the count
          const children = childEvents.filter(e => e.id !== event.id);
          setActivateChildEventCount(children.length);
        } catch (err) {
          console.error('Failed to fetch child events:', err);
          setActivateChildEventCount(0);
        }
      } else {
        setActivateChildEventCount(0);
      }
    } else {
      // Child event: no children, only activate this one
      setActivateChildEventCount(0);
    }

    setActivateDialogOpen(true);
  }

  async function handleConfirmActivate() {
    if (!eventToActivate || !eventToActivate.id) return;

    setActivateStatus('activating');
    setActivateMessage(
      activateChildEventCount > 0
        ? `Please wait while we activate this event and ${activateChildEventCount} child event${activateChildEventCount !== 1 ? 's' : ''}...`
        : 'Please wait while we activate this event...'
    );

    try {
      setLoading(true);
      await activateEventWithChildrenServer(eventToActivate);
      setActivateStatus('success');
      setActivateMessage(
        activateChildEventCount > 0
          ? `The event and ${activateChildEventCount} child event${activateChildEventCount !== 1 ? 's' : ''} have been activated successfully.`
          : 'The event has been activated successfully.'
      );

      await loadAll(page);
      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setActivateDialogOpen(false);
        setActivateStatus('idle');
        setEventToActivate(null);
        setActivateChildEventCount(0);
      }, 1500);
    } catch (e: any) {
      setActivateStatus('error');
      setActivateMessage(e.message || 'Failed to activate event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancelActivate() {
    setActivateDialogOpen(false);
    setActivateStatus('idle');
    setEventToActivate(null);
    setActivateMessage('');
    setActivateChildEventCount(0);
  }

  function handleCloseActivateDialog() {
    setActivateDialogOpen(false);
    setActivateStatus('idle');
    setEventToActivate(null);
    setActivateMessage('');
    setActivateChildEventCount(0);
  }

  async function handleCancelEvent(eventId: number) {
    // This function is kept for backward compatibility but should not be called directly
    // Use handleDeleteClick instead
    try {
      setLoading(true);
      await cancelEventServer(eventId);
      await loadAll(page);
    } catch (e: any) {
      setError(e.message || 'Failed to cancel event');
    } finally {
      setLoading(false);
    }
  }

  // Pagination controls
  function handlePrevPage() {
    setPage((p) => Math.max(0, p - 1));
  }
  function handleNextPage() {
    setPage((p) => p + 1);
  }

  // Render page content even if userId is not yet available (client-side auth loading)
  // This prevents the page from hanging during Playwright tests
  if (!userId) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <div className="flex items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
            <p className="text-gray-600">
              Create, edit, and manage all events in the system.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center mb-8 gap-4">
        <Link
          href="/admin"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
          title="Back to Admin"
          aria-label="Back to Admin"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700 hidden sm:inline">Back to Admin</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create, edit, and manage all events in the system.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="manage-events" />

      {/* Create Event Button */}
      <div className="flex justify-end mb-6">
        <Link
          href="/admin/events/new"
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Create Event"
          aria-label="Create Event"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Create Event</span>
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/events/new"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Create New Event"
            aria-label="Create New Event"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Create New<br />Event</span>
          </Link>
          <Link
            href="/admin/events/dashboard"
            className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Event Analytics Dashboard"
            aria-label="Event Analytics Dashboard"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Event Analytics<br />Dashboard</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage<br />[Users]</span>
          </Link>
          <Link
            href="/admin/communication"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Communication Center"
            aria-label="Communication Center"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Communication<br />Center</span>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-lg font-semibold text-blue-800 mb-4">Search Events</div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1">Search By</label>
              <select className="border px-3 py-2 rounded w-40" value={searchField} onChange={e => setSearchField(e.target.value as 'title' | 'id' | 'caption')}>
                <option value="title">Title</option>
                <option value="id">ID</option>
                <option value="caption">Caption</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{searchField === 'id' ? 'Event ID' : searchField.charAt(0).toUpperCase() + searchField.slice(1)}</label>
              <input
                type={searchField === 'id' ? 'number' : 'text'}
                className="border px-3 py-2 rounded w-48"
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
              <input type="date" className="border px-3 py-2 rounded" value={searchStartDate} onChange={e => setSearchStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input type="date" className="border px-3 py-2 rounded" value={searchEndDate} onChange={e => setSearchEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Admission</label>
              <select className="border px-3 py-2 rounded w-32" value={searchAdmissionType} onChange={e => setSearchAdmissionType(e.target.value)}>
                <option value="">All</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sort</label>
              <select className="border px-3 py-2 rounded w-40" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="startDate,asc">Date (Earliest)</option>
                <option value="startDate,desc">Date (Latest)</option>
                <option value="title,asc">Title (A-Z)</option>
                <option value="title,desc">Title (Z-A)</option>
                <option value="id,desc">ID (Newest)</option>
                <option value="id,asc">ID (Oldest)</option>
              </select>
            </div>
          </div>

          {/* Event Filter Toggle */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <span className={`text-lg font-semibold transition-colors duration-300 ${!showPastEvents ? 'text-purple-600' : 'text-purple-300'}`}>
              Future Events
            </span>
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 ${
                showPastEvents
                  ? 'bg-blue-500 focus:ring-blue-500'
                  : 'bg-purple-500 focus:ring-purple-500'
              }`}
              title={showPastEvents ? 'Show Future Events' : 'Show Past Events'}
              aria-label={showPastEvents ? 'Show Future Events' : 'Show Past Events'}
            >
              <span
                className={`inline-flex items-center justify-center h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-md ${showPastEvents ? 'translate-x-7' : 'translate-x-1'}`}
              >
                {showPastEvents ? (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </button>
            <span className={`text-lg font-semibold transition-colors duration-300 ${showPastEvents ? 'text-blue-600' : 'text-blue-300'}`}>
              Past Events
            </span>
            <button
              type="button"
              onClick={handleRefreshFromDb}
              disabled={refreshLoading || loading}
              className="flex-shrink-0 h-14 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Refresh events from database (clears cache)"
              aria-label="Refresh events from database"
            >
              {refreshLoading || loading ? (
                <>
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                    <svg className="animate-spin w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-amber-700">Refreshing…</span>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="font-semibold text-amber-700">Refresh from database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Info box when there are no events at all (both future and past) */}
      {!loading && hasCheckedInitialLoad && futureEventCount === 0 && pastEventCount === 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-blue-800 mb-1">
                There are no events listed yet.
              </h3>
              <p className="text-sm text-blue-700">
                Please check back again. New events will appear here once they are created. Please use future / past events switch above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message above table when showing past events because no future events exist */}
      {!loading && hasCheckedInitialLoad && showPastEvents && futureEventCount === 0 && pastEventCount > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-amber-800">
                Here is the list of recent events. New future events will be added soon. Please use future / past events switch above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info box when showing future events but there are no future events */}
      {!loading && hasCheckedInitialLoad && !showPastEvents && futureEventCount === 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-medium text-blue-800 mb-1">
                No future events created.
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Please use future / past events switch above.
              </p>
              {/* Create New Event Button */}
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-2 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Create Event"
                aria-label="Create Event"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Create New Event</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <EventList
        events={events}
        eventTypes={eventTypes}
        calendarEvents={calendarEvents}
        loading={loading}
        onCancel={(event) => handleDeleteClick(event, 'soft')}
        onHardDelete={(event) => handleDeleteClick(event, 'hard')}
        onActivate={(event) => handleActivateClick(event)}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        status={deleteStatus}
        eventTitle={eventToDelete?.title}
        isRecurring={eventToDelete?.isRecurring || false}
        hasChildren={childEventCount > 0}
        childCount={childEventCount}
        deleteMode={deleteMode}
        message={deleteMessage}
        onConfirm={async () => {
          console.log('[ManageEventsPage] onConfirm callback called, calling handleConfirmDelete');
          try {
            await handleConfirmDelete();
            console.log('[ManageEventsPage] handleConfirmDelete completed');
          } catch (err) {
            console.error('[ManageEventsPage] Error in handleConfirmDelete:', err);
          }
        }}
        onCancel={handleCancelDelete}
        onClose={handleCloseDeleteDialog}
      />

      {/* Activate Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={activateDialogOpen}
        status={activateStatus}
        eventTitle={eventToActivate?.title}
        isRecurring={eventToActivate?.isRecurring || false}
        hasChildren={activateChildEventCount > 0}
        childCount={activateChildEventCount}
        deleteMode="activate"
        message={activateMessage}
        onConfirm={handleConfirmActivate}
        onCancel={handleCancelActivate}
        onClose={handleCloseActivateDialog}
      />
    </div>
  );
}

