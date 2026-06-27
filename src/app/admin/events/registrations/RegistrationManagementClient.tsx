'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RegistrationManagementData } from './ApiServerActions';
import { fetchAttendeeAttachments, searchEvents } from './ApiServerActions';
import type { EventAttendeeAttachmentDTO, EventDetailsDTO } from '@/types';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaEdit,
  FaTrash,
  FaTrashAlt,
  FaEye,
  FaUserFriends,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaUser,
  FaUsers,
  FaExclamationTriangle,
  FaStickyNote,
  FaInfoCircle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';

interface RegistrationManagementClientProps {
  data: RegistrationManagementData;
}

export default function RegistrationManagementClient({ data }: RegistrationManagementClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [viewingAttendee, setViewingAttendee] = useState<any>(null);
  const [editingAttendee, setEditingAttendee] = useState<any>(null);
  const [deletingAttendee, setDeletingAttendee] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [attendeeAttachments, setAttendeeAttachments] = useState<EventAttendeeAttachmentDTO[]>([]);
  const [isAttachmentsLoading, setIsAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);

  const {
    attendees,
    totalCount,
    currentPage,
    totalPages,
    events,
    selectedEvent,
    searchTerm,
    searchType: dataSearchType,
    statusFilter
  } = data;

  // Event search state
  const [eventSearchType, setEventSearchType] = useState<'id' | 'name' | 'dateRange'>('id');
  const [eventSearchId, setEventSearchId] = useState('');
  const [eventSearchName, setEventSearchName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [searchResults, setSearchResults] = useState<EventDetailsDTO[]>([]);
  const [isSearchingEvents, setIsSearchingEvents] = useState(false);
  const [eventSearchReturnedEmpty, setEventSearchReturnedEmpty] = useState(false);
  const [eventTypeaheadQuery, setEventTypeaheadQuery] = useState('');
  const [eventTypeaheadResults, setEventTypeaheadResults] = useState<EventDetailsDTO[]>([]);
  const [isTypeaheadLoading, setIsTypeaheadLoading] = useState(false);

  const [searchType, setSearchType] = useState<'name' | 'email' | 'eventId'>(dataSearchType as 'name' | 'email' | 'eventId' || 'name');
  const [searchValue, setSearchValue] = useState(searchTerm);

  // Only show registrants if an event is selected
  const hasSelectedEvent = !!selectedEvent;

  useEffect(() => {
    if (!hasSelectedEvent) return;
    const q = eventTypeaheadQuery.trim();
    if (q.length < 2) {
      setEventTypeaheadResults([]);
      setIsTypeaheadLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsTypeaheadLoading(true);
      try {
        const idSearch = /^\d+$/.test(q) ? q : undefined;
        const nameSearch = /^\d+$/.test(q) ? undefined : q;
        const results = await searchEvents(nameSearch, idSearch);
        setEventTypeaheadResults((results || []).slice(0, 12));
      } catch (error) {
        console.error('Error searching events (typeahead):', error);
        setEventTypeaheadResults([]);
      } finally {
        setIsTypeaheadLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [eventTypeaheadQuery, hasSelectedEvent]);

  // Event search handler
  const handleEventSearch = async () => {
    setIsSearchingEvents(true);
    setEventSearchReturnedEmpty(false);
    try {
      const results = await searchEvents(
        eventSearchType === 'name' ? eventSearchName : undefined,
        eventSearchType === 'id' ? eventSearchId : undefined,
        eventSearchType === 'dateRange' ? eventStartDate : undefined,
        eventSearchType === 'dateRange' ? eventEndDate : undefined
      );
      setSearchResults(results ?? []);
      if (!results || results.length === 0) {
        setEventSearchReturnedEmpty(true);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setSearchResults([]);
      setEventSearchReturnedEmpty(true);
    } finally {
      setIsSearchingEvents(false);
    }
  };

  const handleSelectEventFromSearch = (eventId: number) => {
    const params = new URLSearchParams(searchParams || undefined);
    params.set('eventId', eventId.toString());
    params.delete('page'); // Reset to first page
    params.delete('search'); // Clear search when changing event
    params.delete('searchType'); // Clear search type when changing event
    params.delete('status'); // Clear status filter when changing event
    startTransition(() => {
      router.push(`/admin/events/registrations?${params.toString()}`);
    });
  };

  const handleSearch = (search: string, type: 'name' | 'email' | 'eventId' = searchType) => {
    if (!hasSelectedEvent) return; // Don't search if no event selected
    const params = new URLSearchParams(searchParams || undefined);
    if (search) {
      params.set('search', search);
      params.set('searchType', type);
    } else {
      params.delete('search');
      params.delete('searchType');
    }
    params.delete('page'); // Reset to first page
    startTransition(() => {
    router.push(`/admin/events/registrations?${params.toString()}`);
    });
  };

  const handleSearchTypeChange = (type: 'name' | 'email' | 'eventId') => {
    setSearchType(type);
    if (searchValue && hasSelectedEvent) {
      handleSearch(searchValue, type);
    }
  };

  const handleEventFilter = (eventId: string) => {
    if (!eventId || eventId === '') {
      // Clear event selection
      const params = new URLSearchParams(searchParams || undefined);
      params.delete('eventId');
      params.delete('page');
      params.delete('search');
      params.delete('searchType');
      params.delete('status');
      startTransition(() => {
        router.push(`/admin/events/registrations?${params.toString()}`);
      });
      return;
    }

    // Set event ID and clear other filters
    const params = new URLSearchParams();
    params.set('eventId', eventId);
    params.delete('page'); // Reset to first page
    params.delete('search'); // Clear search when changing event
    params.delete('searchType'); // Clear search type when changing event
    params.delete('status'); // Clear status filter when changing event

    // Use startTransition for better UX
    startTransition(() => {
    router.push(`/admin/events/registrations?${params.toString()}`);
    });
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.delete('page'); // Reset to first page
    startTransition(() => {
    router.push(`/admin/events/registrations?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams || undefined);
    params.set('page', page.toString());
    startTransition(() => {
    router.push(`/admin/events/registrations?${params.toString()}`);
    });
  };

  const handleExportCSV = async () => {
    try {
      const eventId = searchParams?.get('eventId') || null;
      const search = searchParams?.get('search') || '';
      const searchType = searchParams?.get('searchType') || 'name';
      const status = searchParams?.get('status') || '';

      const { exportRegistrationsToCSV } = await import('./ApiServerActions');
      const csvContent = await exportRegistrationsToCSV(
        eventId ? parseInt(eventId) : null,
        search,
        searchType,
        status
      );

      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === attendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(attendees.map(a => a.id).filter(id => id !== null) as number[]);
    }
  };

  const handleSelectAttendee = (attendeeId: number) => {
    setSelectedAttendees((prev: number[]) =>
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'WAITLISTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEditStatusConfig = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return {
          label: 'Registered',
          cardClass: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          iconClass: 'text-emerald-600',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'PENDING':
        return {
          label: 'Pending',
          cardClass: 'bg-amber-100 border-amber-300 text-amber-800',
          iconClass: 'text-amber-600',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          cardClass: 'bg-red-100 border-red-300 text-red-800',
          iconClass: 'text-red-600',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'WAITLISTED':
        return {
          label: 'Waitlisted',
          cardClass: 'bg-blue-100 border-blue-300 text-blue-800',
          iconClass: 'text-blue-600',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        };
      default:
        return {
          label: status || 'Unknown',
          cardClass: 'bg-indigo-100 border-indigo-300 text-indigo-800',
          iconClass: 'text-indigo-600',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const statusOptions = ['REGISTERED', 'PENDING', 'WAITLISTED', 'CANCELLED'] as const;

  const handleViewAttendee = (attendee: any) => {
    setViewingAttendee(attendee);
    void loadAttendeeAttachments(attendee.id);
  };

  const handleEditAttendee = (attendee: any) => {
    setEditingAttendee(attendee);
    setEditForm({
      firstName: attendee.firstName || '',
      lastName: attendee.lastName || '',
      email: attendee.email || '',
      phone: attendee.phone || '',
      registrationStatus: attendee.registrationStatus || 'REGISTERED',
      specialRequirements: attendee.specialRequirements || '',
      dietaryRestrictions: attendee.dietaryRestrictions || '',
      accessibilityNeeds: attendee.accessibilityNeeds || '',
      emergencyContactName: attendee.emergencyContactName || '',
      emergencyContactPhone: attendee.emergencyContactPhone || '',
      emergencyContactRelationship: attendee.emergencyContactRelationship || '',
      totalNumberOfGuests: attendee.totalNumberOfGuests || 0,
      numberOfGuestsCheckedIn: attendee.numberOfGuestsCheckedIn || 0,
      notes: attendee.notes || '',
      adminNotes: attendee.adminNotes ?? (attendee as any).admin_notes ?? ''
    });
    void loadAttendeeAttachments(attendee.id);
  };

  const handleDeleteAttendee = (attendee: any) => {
    setDeletingAttendee(attendee);
  };

  const confirmDeleteAttendee = async () => {
    if (!deletingAttendee) return;

    setIsDeleting(true);
    try {
      const { deleteAttendeeRegistration } = await import('./ApiServerActions');
      const success = await deleteAttendeeRegistration(deletingAttendee.id);

      if (success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Failed to delete attendee registration. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting attendee:', error);
      alert('An error occurred while deleting the attendee registration.');
    } finally {
      setIsDeleting(false);
      setDeletingAttendee(null);
    }
  };

  const closeViewModal = () => {
    setViewingAttendee(null);
    setAttendeeAttachments([]);
    setAttachmentsError(null);
  };

  const closeDeleteModal = () => {
    setDeletingAttendee(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAttendee = async () => {
    if (!editingAttendee) return;

    setIsSaving(true);
    try {
      const { updateAttendeeRegistration } = await import('./ApiServerActions');
      const success = await updateAttendeeRegistration(editingAttendee.id, editForm);

      if (success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Failed to update attendee registration. Please try again.');
      }
    } catch (error) {
      console.error('Error updating attendee:', error);
      alert('An error occurred while updating the attendee registration.');
    } finally {
      setIsSaving(false);
      setEditingAttendee(null);
      setEditForm({});
    }
  };

  const closeEditModal = () => {
    setEditingAttendee(null);
    setEditForm({});
    setAttendeeAttachments([]);
    setAttachmentsError(null);
  };

  const loadAttendeeAttachments = async (attendeeId?: number) => {
    if (!attendeeId) {
      setAttendeeAttachments([]);
      return;
    }

    setIsAttachmentsLoading(true);
    setAttachmentsError(null);
    try {
      const attachments = await fetchAttendeeAttachments(attendeeId);
      setAttendeeAttachments(attachments);
    } catch (error) {
      console.error('Error loading attendee attachments:', error);
      setAttachmentsError('Unable to load attachments right now.');
      setAttendeeAttachments([]);
    } finally {
      setIsAttachmentsLoading(false);
    }
  };

  const formatAttachmentSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownloadAttachment = (attachment: EventAttendeeAttachmentDTO) => {
    if (!attachment.fileUrl) return;
    const anchor = document.createElement('a');
    anchor.href = attachment.fileUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    if (attachment.originalFilename) {
      anchor.download = attachment.originalFilename;
    }
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Calculate pagination display values
  const pageSize = 20;
  const startItem = hasSelectedEvent && totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = hasSelectedEvent && totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;

  // Calculate registration statistics
  const totalPeopleRegistered = totalCount; // Total number of primary registrants (all pages matching filter)
  const totalGuests = attendees.reduce((sum, attendee) => sum + (attendee.totalNumberOfGuests || 0), 0);
  // Estimate total guests based on average from current page
  const avgGuestsPerRegistrant = attendees.length > 0 && totalCount > 0
    ? totalGuests / attendees.length
    : 0;
  const estimatedTotalGuests = Math.round(totalCount * avgGuestsPerRegistrant);
  const totalAttendees = totalPeopleRegistered + estimatedTotalGuests; // Total people (registrants + estimated guests)

  // Status counts - estimate based on current page distribution
  const registeredRatio = attendees.length > 0
    ? attendees.filter(a => a.registrationStatus === 'REGISTERED').length / attendees.length
    : 0;
  const pendingRatio = attendees.length > 0
    ? attendees.filter(a => a.registrationStatus === 'PENDING').length / attendees.length
    : 0;
  const cancelledRatio = attendees.length > 0
    ? attendees.filter(a => a.registrationStatus === 'CANCELLED').length / attendees.length
    : 0;

  const registeredCount = Math.round(totalCount * registeredRatio);
  const pendingCount = Math.round(totalCount * pendingRatio);
  const cancelledCount = Math.round(totalCount * cancelledRatio);

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation currentPage="event-registrations" />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with back button - Moved to top, single line on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <Link
            href="/admin"
            className="flex-shrink-0 h-10 sm:h-12 md:h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900/70 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 transition-all duration-300 hover:scale-105 px-2 sm:px-3 md:px-6"
            title="Back to Admin"
            aria-label="Back to Admin"
          >
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-700 dark:text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700 dark:text-indigo-200 text-[10px] sm:text-xs md:text-sm lg:text-base hidden sm:inline">Back to Admin</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white truncate">Registration Management</h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate hidden sm:block">
              {selectedEvent ? (
                <>
                  Manage registrations for{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedEvent.title}</span>
                </>
              ) : (
                'Search by event to view registrations'
              )}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
            <Link
              href="/admin/manage-events"
              className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4 text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base transition-all group overflow-hidden"
              title="Manage Events"
              aria-label="Manage Events"
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-xl bg-green-100 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-center leading-tight px-1 break-words hyphens-auto">Manage Events</span>
            </Link>
            <Link
              href="/admin/manage-usage"
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4 text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base transition-all group overflow-hidden"
              title="Manage Usage"
              aria-label="Manage Usage"
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-semibold text-center leading-tight px-1 break-words hyphens-auto">Manage Usage<br />[Users]</span>
            </Link>
            <Link
              href="/admin/events/dashboard"
              className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4 text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base transition-all group overflow-hidden"
              title="Event Analytics Dashboard"
              aria-label="Event Analytics Dashboard"
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-semibold text-center leading-tight px-1 break-words hyphens-auto">Event Analytics<br />Dashboard</span>
            </Link>
            <Link
              href="/admin/communication"
              className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4 text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base transition-all group overflow-hidden"
              title="Communication Center"
              aria-label="Communication Center"
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-center leading-tight px-1 break-words hyphens-auto">Communication<br />Center</span>
            </Link>
        </div>
      </div>

      {/* Event Search Section - Show when no event selected */}
      {!hasSelectedEvent && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-lg font-semibold text-blue-800 mb-4">Search for an Event</div>
            <p className="text-gray-600 mb-6">
              Please search for an event by Event ID, Event Name, or Date Range to view its registrations.
            </p>

          {/* Event Search: Search By dropdown and search field(s) on one row */}
          <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-4">
            <div className="w-full sm:w-auto min-w-0 sm:min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search By</label>
              <select
                value={eventSearchType}
                onChange={(e) => {
                  setEventSearchType(e.target.value as 'id' | 'name' | 'dateRange');
                  setEventSearchReturnedEmpty(false);
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
                      setEventSearchReturnedEmpty(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && eventSearchId && eventSearchId.trim() !== '') {
                        handleEventSearch();
                      }
                    }}
                    placeholder="Enter Event ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventSearchId || eventSearchId.trim() === ''}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">{isSearchingEvents ? 'Searching...' : 'Search Events'}</span>
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
                      setEventSearchReturnedEmpty(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && eventSearchName && eventSearchName.trim() !== '') {
                        handleEventSearch();
                      }
                    }}
                    placeholder="Enter Event Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventSearchName || eventSearchName.trim() === ''}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">{isSearchingEvents ? 'Searching...' : 'Search Events'}</span>
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
                      setEventSearchReturnedEmpty(false);
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
                      setEventSearchReturnedEmpty(false);
                    }}
                    className="w-full min-w-[140px] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleEventSearch}
                  disabled={isSearchingEvents || !eventStartDate || !eventEndDate}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Search Events"
                  aria-label="Search Events"
                >
                  <FaSearch className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700 text-sm">{isSearchingEvents ? 'Searching...' : 'Search Events'}</span>
                </button>
              </>
            )}
          </div>

          {/* No results alert */}
          {eventSearchReturnedEmpty && (
            <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3" role="alert">
              <FaExclamationTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">No events found</p>
                <p className="text-sm text-amber-700 mt-1">
                  No events match your search. Try a different Event ID, event name, or date range.
                </p>
              </div>
            </div>
          )}

          {/* Search Results - colorful, prominent section */}
          {searchResults.length > 0 && (
            <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50/80 shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-emerald-200 bg-emerald-100/80">
                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                  <FaCheckCircle className="w-5 h-5 text-emerald-600" />
                  Search Results ({searchResults.length} event{searchResults.length !== 1 ? 's' : ''} found)
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border-2 border-emerald-200 rounded-lg bg-white hover:bg-emerald-50/50 cursor-pointer flex flex-wrap items-center justify-between gap-3 transition-colors"
                    onClick={() => handleSelectEventFromSearch(event.id!)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-emerald-700 mt-1">
                        Event ID: {event.id} | {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectEventFromSearch(event.id!);
                      }}
                      className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-5 transition-all duration-300 hover:scale-105"
                      title="View Registrations"
                      aria-label="View Registrations"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="font-semibold text-green-700">View Registrations</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Event Selection from Dropdown (recent events only, max 50) */}
          <div className="mt-6 pt-6 border-t border-teal-200">
            <label className="block text-sm font-semibold text-teal-800 mb-2">
              Or select from recent events (max 50)
            </label>
            <select
              value={data.selectedEvent && data.selectedEvent.id ? data.selectedEvent.id.toString() : ''}
              onChange={(e) => handleEventFilter(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border-2 border-teal-300 rounded-lg bg-teal-50/50 text-teal-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select an event...</option>
              {events.slice(0, 50).map(event => (
                <option key={event.id} value={event.id?.toString() || ''}>
                  {event.title} (ID: {event.id})
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>
      )}

      {/* Filters and Actions - Only show when event is selected */}
      {hasSelectedEvent && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 min-w-fit">
          {/* Search Type Dropdown */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value as 'name' | 'email' | 'eventId')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="name">Search by Name</option>
              <option value="email">Search by Email</option>
              <option value="eventId">Search by Event ID</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={searchType === 'eventId' ? 'number' : 'text'}
              placeholder={
                searchType === 'name'
                  ? 'Enter name to search...'
                  : searchType === 'email'
                    ? 'Enter email to search...'
                    : 'Enter Event ID...'
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchValue);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => handleSearch(searchValue)}
            className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 touch-manipulation"
            title="Search Registrations"
            aria-label="Search Registrations"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaSearch className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-blue-700 text-sm sm:text-base">Search</span>
          </button>

            {/* Event Filter - Change Event */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => handleEventFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
                <option value="">Change Event...</option>
                {events.slice(0, 50).map(event => (
                <option key={event.id} value={event.id}>
                    {event.title} (ID: {event.id})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="WAITLISTED">Waitlisted</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-green-100 hover:bg-green-200 transition-all duration-300 hover:scale-105 touch-manipulation"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <FaDownload className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-semibold text-green-700 text-sm sm:text-base">Export CSV</span>
          </button>
        </div>

        {/* Re-search Event (Type-Ahead for Large Event Lists) */}
        <div className="mt-2 mb-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-indigo-800 mb-2">
                Re-search Event by Name or ID
              </label>
              <input
                type="text"
                value={eventTypeaheadQuery}
                onChange={(e) => setEventTypeaheadQuery(e.target.value)}
                placeholder="Type at least 2 characters (e.g. 8321 or event name)"
                className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setEventTypeaheadQuery('');
                setEventTypeaheadResults([]);
              }}
              className="h-12 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold transition-all duration-300 hover:scale-105"
              title="Clear event search"
              aria-label="Clear event search"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-indigo-700 mt-2">
            Note: the dropdown loads recent 50 events for speed; this search helps find older events without loading everything.
          </p>
          {isTypeaheadLoading && (
            <p className="text-sm text-indigo-700 mt-3">Searching events...</p>
          )}
          {!isTypeaheadLoading && eventTypeaheadQuery.trim().length >= 2 && eventTypeaheadResults.length === 0 && (
            <p className="text-sm text-indigo-700 mt-3">No matching events found.</p>
          )}
          {eventTypeaheadResults.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
              {eventTypeaheadResults.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleEventFilter(String(event.id || ''))}
                  className="w-full text-left p-3 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-100 transition-colors"
                  title={`Switch to event ${event.title}`}
                  aria-label={`Switch to event ${event.title}`}
                >
                  <p className="text-sm font-semibold text-indigo-900">{event.title}</p>
                  <p className="text-xs text-indigo-700">Event ID: {event.id}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <span>
            Showing {attendees.length} of {totalCount} registrations
          </span>
          {selectedAttendees.length > 0 && (
            <span className="text-blue-600 font-semibold">
              {selectedAttendees.length} selected
            </span>
          )}
        </div>
          </div>
        </div>
      )}

      {/* Event Analytics - Only show when event is selected */}
      {hasSelectedEvent && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Event Registration Analytics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 lg:gap-4 w-full">
            {/* Total People Registered */}
            <div className="bg-blue-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaUsers className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">People Registered</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{totalPeopleRegistered.toLocaleString()}</p>
            </div>

            {/* Total Guests */}
            <div className="bg-green-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaUserFriends className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">Total Guests</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{totalGuests.toLocaleString()}</p>
            </div>

            {/* Total Attendees */}
            <div className="bg-purple-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaUsers className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">Total Attendees</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{totalAttendees.toLocaleString()}</p>
            </div>

            {/* Registered Status */}
            <div className="bg-emerald-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaCheckCircle className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">Registered</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{registeredCount.toLocaleString()}</p>
            </div>

            {/* Pending Status */}
            <div className="bg-yellow-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaClock className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-yellow-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">Pending</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{pendingCount.toLocaleString()}</p>
            </div>

            {/* Cancelled Status */}
            <div className="bg-red-50 rounded-md sm:rounded-lg p-1 sm:p-2 lg:p-4 min-w-0 flex flex-col">
              <div className="flex items-center mb-0.5 sm:mb-1 lg:mb-2">
                <FaTimes className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-600 flex-shrink-0" />
              </div>
              <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight truncate">Cancelled</p>
              <p className="text-xs sm:text-base lg:text-2xl font-bold text-gray-900 truncate">{cancelledCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        </div>
      )}

        {/* Registrations Table - Only show when event is selected */}
        {hasSelectedEvent && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="user-table-scroll-container">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border border-gray-300 dark:border-gray-600" style={{ minWidth: '800px', width: '100%' }}>
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left border border-gray-300 dark:border-gray-600">
                        <label className="inline-flex items-center justify-center">
                          <span className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedAttendees.length === attendees.length && attendees.length > 0}
                              onChange={handleSelectAll}
                              className="custom-checkbox"
                            />
                            <span className="custom-checkbox-tick">
                              {selectedAttendees.length === attendees.length && attendees.length > 0 && (
                                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                                </svg>
                              )}
                            </span>
                          </span>
                        </label>
                      </th>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                        Attendee
                      </th>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                        Contact
                      </th>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {attendees.length > 0 ? (
                      attendees.map((attendee, index) => (
                        <tr key={attendee.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'}`}>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                            <label className="inline-flex items-center justify-center">
                              <span className="relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={selectedAttendees.includes(attendee.id!)}
                                  onChange={() => handleSelectAttendee(attendee.id!)}
                                  className="custom-checkbox"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="custom-checkbox-tick">
                                  {selectedAttendees.includes(attendee.id!) && (
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                                    </svg>
                                  )}
                                </span>
                              </span>
                            </label>
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-1a4 4 0 00-5-3.87M9 20H4v-1a4 4 0 015-3.87m8-6.13a4 4 0 11-8 0 4 4 0 018 0zM5 8a4 4 0 118 0 4 4 0 01-8 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-4 min-w-0">
                                <div className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                                  {attendee.firstName} {attendee.lastName}
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                  ID: {attendee.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center">
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="break-all">{attendee.email}</span>
                            </div>
                            {attendee.phone && (
                              <div className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 font-medium flex items-center mt-1">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500 dark:text-teal-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.95 1.56l.57 2.57a2 2 0 01-.58 1.92l-1.27 1.27a16 16 0 006.59 6.59l1.27-1.27a2 2 0 011.92-.58l2.57.57A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z" />
                                </svg>
                                <span>{attendee.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                            <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendee.registrationStatus || '')}`}>
                              {attendee.registrationStatus || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-600">
                            <div className="flex space-x-1 sm:space-x-2">
                              <button
                                onClick={() => handleViewAttendee(attendee)}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                title="View Details"
                                aria-label="View Details"
                                type="button"
                              >
                                <FaEye className="w-6 h-6 sm:w-10 sm:h-10 text-green-600 dark:text-green-300" />
                              </button>
                              <button
                                onClick={() => handleEditAttendee(attendee)}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                title="Edit"
                                aria-label="Edit"
                                type="button"
                              >
                                <FaEdit className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-300" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttendee(attendee)}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                title="Delete Registration"
                                aria-label="Delete"
                                type="button"
                              >
                                <FaTrashAlt className="w-6 h-6 sm:w-10 sm:h-10 text-red-600 dark:text-red-300" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center border border-gray-300 dark:border-gray-600">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                            <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">No registrations found</span>
                            <span className="text-sm text-orange-600 dark:text-orange-400 hidden sm:inline">[No registrations match your criteria]</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls - Always visible, matching admin page style */}
            <div className="mt-6 sm:mt-8">
              <div className="flex justify-between items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isPending}
                  className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-semibold rounded-lg shadow-sm border-2 border-blue-400 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  title="Previous Page"
                  aria-label="Previous Page"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Info */}
                <div className="px-2 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-sm">
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                    Page <span className="text-blue-600 dark:text-blue-400">{currentPage}</span> of <span className="text-blue-600 dark:text-blue-400">{totalPages}</span>
                  </span>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isPending}
                  className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-semibold rounded-lg shadow-sm border-2 border-blue-400 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  title="Next Page"
                  aria-label="Next Page"
                  type="button"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Item Count Text */}
              <div className="text-center mt-3">
                {totalCount > 0 ? (
                  <div className="inline-flex items-center px-2 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-sm">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{endItem}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount}</span> registrations
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-2 sm:px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">No registrations found</span>
                    <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hidden sm:inline">[No registrations match your criteria]</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/admin/manage-events"
            className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-all duration-300 hover:scale-105"
            title="Back to Manage Events"
            aria-label="Back to Manage Events"
          >
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-green-700 dark:text-green-300 text-xs sm:text-sm lg:text-base whitespace-nowrap">Back to Manage Events</span>
          </Link>
          <Link
            href="/admin/events/dashboard"
            className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-teal-100 hover:bg-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800 transition-all duration-300 hover:scale-105"
            title="Event Analytics"
            aria-label="Event Analytics"
          >
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal-200 dark:bg-teal-800 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-teal-700 dark:text-teal-300 text-xs sm:text-sm lg:text-base whitespace-nowrap">Event Analytics</span>
          </Link>
        </div>
      </div>

      {/* View Attendee Modal */}
      {viewingAttendee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-blue-100 bg-blue-50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-blue-900">Attendee Details</h3>
              <button
                onClick={closeViewModal}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Close details"
                aria-label="Close details"
                type="button"
              >
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Identity & Personal Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaUser className="mr-2" />
                  Identity & Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Registration ID</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.id ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">First Name</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.firstName ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Name</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.lastName ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.email ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.phone ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Member</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.isMember != null ? (viewingAttendee.isMember ? 'Yes' : 'No') : '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Attendee Type</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.attendeeType ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Registration Source</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.registrationSource ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Event & Registration Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Event & Registration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Event ID</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.eventId ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Event Title</label>
                    <p className="text-sm text-gray-900">{(viewingAttendee as any).event?.title ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.registrationDate
                        ? new Date(viewingAttendee.registrationDate).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Confirmation Date</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.confirmationDate
                        ? new Date(viewingAttendee.confirmationDate).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingAttendee.registrationStatus || '')}`}>
                      {viewingAttendee.registrationStatus || '—'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Guests</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.totalNumberOfGuests ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Guests Checked In</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.numberOfGuestsCheckedIn ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cancellation Date</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.cancellationDate
                        ? new Date(viewingAttendee.cancellationDate).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cancellation Reason</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.cancellationReason ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Wait List Position</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.waitListPosition ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Priority Score</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.priorityScore ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Check-in / QR */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Check-in & QR
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Check-in Status</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.checkInStatus ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Check-in Time</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.checkInTime
                        ? new Date(viewingAttendee.checkInTime).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Check-out Time</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.checkOutTime
                        ? new Date(viewingAttendee.checkOutTime).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">QR Generated</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.qrCodeGenerated != null ? (viewingAttendee.qrCodeGenerated ? 'Yes' : 'No') : '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">QR Generated At</label>
                    <p className="text-sm text-gray-900">
                      {viewingAttendee.qrCodeGeneratedAt
                        ? new Date(viewingAttendee.qrCodeGeneratedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requirements (always show section, use — when empty) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Special Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Special Requirements</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.specialRequirements ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Dietary Restrictions</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.dietaryRestrictions ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Accessibility Needs</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.accessibilityNeeds ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Notes (always show) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaStickyNote className="mr-2 text-yellow-600" />
                  Additional Notes
                </h4>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {viewingAttendee.notes ?? '—'}
                </div>
              </div>

              {/* Admin notes (always show) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-600" />
                  Admin Notes
                </h4>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {viewingAttendee.adminNotes ?? (viewingAttendee as any).admin_notes ?? '—'}
                </div>
              </div>

              {/* Feedback & rating */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Feedback & Rating</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Attendance Rating</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.attendanceRating ?? '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Feedback</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingAttendee.feedback ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FaClock className="mr-2" />
                  Record Timestamps
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">
                      {(viewingAttendee as any).createdAt
                        ? new Date((viewingAttendee as any).createdAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Updated At</label>
                    <p className="text-sm text-gray-900">
                      {(viewingAttendee as any).updatedAt
                        ? new Date((viewingAttendee as any).updatedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828A4 4 0 0012.343 4.17L5.757 10.757a6 6 0 108.486 8.486L20 13" />
                  </svg>
                  Attachments
                </h4>

                {isAttachmentsLoading ? (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    Loading attachments...
                  </div>
                ) : attachmentsError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {attachmentsError}
                  </div>
                ) : attendeeAttachments.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    No attachments uploaded for this attendee.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendeeAttachments.map((attachment) => (
                      <div key={attachment.id} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {attachment.originalFilename || attachment.title || 'Attachment'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {attachment.contentType || 'Unknown type'} - {formatAttachmentSize(attachment.fileSize)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {attachment.fileUrl && (
                              <>
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                  title="View attachment"
                                  aria-label="View attachment"
                                >
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                                <button
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                  title="Download attachment"
                                  aria-label="Download attachment"
                                  type="button"
                                >
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Contact (all fields shown) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Name</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.emergencyContactName ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Phone</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.emergencyContactPhone ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relationship</label>
                    <p className="text-sm text-gray-900">{viewingAttendee.emergencyContactRelationship ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-blue-100">
              <button
                onClick={closeViewModal}
                className="flex-1 sm:flex-none sm:min-w-[200px] h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                title="Close attendee details"
                aria-label="Close attendee details"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendee Modal */}
      {editingAttendee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-green-100 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-green-100 bg-green-50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-green-900">Edit Attendee Registration</h3>
              <button
                onClick={closeEditModal}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Close edit dialog"
                aria-label="Close edit dialog"
                type="button"
              >
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-blue-600" />
                  </span>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaCalendarAlt className="w-6 h-6 text-green-600" />
                  </span>
                  Registration Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 ${getEditStatusConfig(editForm.registrationStatus || 'REGISTERED').cardClass}`}>
                      <span className={`w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center ${getEditStatusConfig(editForm.registrationStatus || 'REGISTERED').iconClass}`}>
                        {getEditStatusConfig(editForm.registrationStatus || 'REGISTERED').icon}
                      </span>
                      <span className="font-semibold text-base">
                        {getEditStatusConfig(editForm.registrationStatus || 'REGISTERED').label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {statusOptions.map((statusValue) => {
                        const cfg = getEditStatusConfig(statusValue);
                        const isActive = (editForm.registrationStatus || 'REGISTERED') === statusValue;
                        return (
                          <button
                            key={statusValue}
                            type="button"
                            onClick={() => handleFormChange('registrationStatus', statusValue)}
                            className={`h-16 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 ${cfg.cardClass} ${isActive ? 'ring-2 ring-offset-1 ring-indigo-500 shadow-md' : 'opacity-90 hover:opacity-100'}`}
                            title={`Set status to ${cfg.label}`}
                            aria-label={`Set status to ${cfg.label}`}
                          >
                            <span className={`w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center ${cfg.iconClass}`}>
                              {cfg.icon}
                            </span>
                            <span className="font-semibold text-sm">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Management */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-purple-600" />
                  </span>
                  Guest Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Number of Guests</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.totalNumberOfGuests || 0}
                      onChange={(e) => handleFormChange('totalNumberOfGuests', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests Checked In</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.numberOfGuestsCheckedIn || 0}
                      onChange={(e) => handleFormChange('numberOfGuestsCheckedIn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                  </span>
                  Special Requirements
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <textarea
                      value={editForm.specialRequirements || ''}
                      onChange={(e) => handleFormChange('specialRequirements', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                    <textarea
                      value={editForm.dietaryRestrictions || ''}
                      onChange={(e) => handleFormChange('dietaryRestrictions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any dietary restrictions or allergies..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Needs</label>
                    <textarea
                      value={editForm.accessibilityNeeds || ''}
                      onChange={(e) => handleFormChange('accessibilityNeeds', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any accessibility needs or accommodations..."
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <FaStickyNote className="w-6 h-6 text-yellow-600" />
                  </span>
                  Additional Notes
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes or comments about this attendee..."
                  />
                </div>
              </div>

              {/* Admin notes (internal use only; not visible to attendee) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FaInfoCircle className="w-6 h-6 text-indigo-600" />
                  </span>
                  Admin Notes
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin notes (internal use only)</label>
                  <textarea
                    value={editForm.adminNotes || ''}
                    onChange={(e) => handleFormChange('adminNotes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Internal notes about this registration (not visible to the attendee)..."
                  />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828A4 4 0 0012.343 4.17L5.757 10.757a6 6 0 108.486 8.486L20 13" />
                  </svg>
                  Attachments
                </h4>
                {isAttachmentsLoading ? (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    Loading attachments...
                  </div>
                ) : attachmentsError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {attachmentsError}
                  </div>
                ) : attendeeAttachments.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    No attachments uploaded for this attendee.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendeeAttachments.map((attachment) => (
                      <div key={attachment.id} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {attachment.originalFilename || attachment.title || 'Attachment'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {attachment.contentType || 'Unknown type'} - {formatAttachmentSize(attachment.fileSize)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {attachment.fileUrl && (
                              <>
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                  title="View attachment"
                                  aria-label="View attachment"
                                >
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                                <button
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                  title="Download attachment"
                                  aria-label="Download attachment"
                                  type="button"
                                >
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaPhone className="w-6 h-6 text-red-600" />
                  </span>
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactName || ''}
                      onChange={(e) => handleFormChange('emergencyContactName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={editForm.emergencyContactPhone || ''}
                      onChange={(e) => handleFormChange('emergencyContactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactRelationship || ''}
                      onChange={(e) => handleFormChange('emergencyContactRelationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 sm:gap-3 p-6 border-t">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cancel edit"
                aria-label="Cancel edit"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700 hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSaveAttendee}
                disabled={isSaving}
                className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save attendee changes"
                aria-label="Save attendee changes"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  {isSaving ? (
                    <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-green-700 hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAttendee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-red-100 shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Registration
                  </h3>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the registration for{' '}
                  <span className="font-semibold text-gray-900">
                    {deletingAttendee.firstName} {deletingAttendee.lastName}
                  </span>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone and will permanently remove the registration data.
                </p>
              </div>
              <div className="flex flex-row gap-2 sm:gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-700 hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={confirmDeleteAttendee}
                  disabled={isDeleting}
                  className="flex-1 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                    {isDeleting ? (
                      <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </div>
                  <span className="font-semibold text-red-700 hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete Registration'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
