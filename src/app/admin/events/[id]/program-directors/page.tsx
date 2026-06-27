'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaEdit, FaTrashAlt, FaUpload, FaImages, FaUnlink, FaHome, FaUsers, FaCalendarAlt, FaPhotoVideo, FaTags, FaTicketAlt, FaPercent, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import type { EventProgramDirectorsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventProgramDirectorsServer,
  createEventProgramDirectorServer,
  updateEventProgramDirectorServer,
  deleteEventProgramDirectorServer,
  associateDirectorWithEventServer,
  disassociateDirectorFromEventServer,
  fetchAvailableProgramDirectorsServer,
} from './ApiServerActions';
import EventDirectorPosterUploadDialog from '@/components/directors/EventDirectorPosterUploadDialog';
import EventDirectorMediaGallery from '@/components/directors/EventDirectorMediaGallery';

export default function EventProgramDirectorsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [programDirectors, setProgramDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<EventProgramDirectorsDTO | null>(null);
  const [selectedDirectorForPoster, setSelectedDirectorForPoster] = useState<{ eventId: number; directorId: number; currentPosterUrl?: string } | null>(null);
  const [posterUploadOpen, setPosterUploadOpen] = useState(false);
  const [selectedDirectorForMedia, setSelectedDirectorForMedia] = useState<{ eventId: number; directorId: number } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventProgramDirectorsDTO>>({
    name: '',
    photoUrl: '',
    bio: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state for main program directors table
  const [directorsPage, setDirectorsPage] = useState(0);
  const directorsPageSize = 20;

  // Available program directors state (tenant-level directors not mapped to this event)
  const [availableDirectors, setAvailableDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [availableDirectorsPage, setAvailableDirectorsPage] = useState(0);
  const [availableDirectorsTotalPages, setAvailableDirectorsTotalPages] = useState(0);
  const [availableDirectorsTotalElements, setAvailableDirectorsTotalElements] = useState(0);
  const [availableDirectorsSearchTerm, setAvailableDirectorsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndProgramDirectors();
      loadAvailableDirectors(0, '');
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndProgramDirectors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load program directors for this event
      const directorsData = await fetchEventProgramDirectorsServer(parseInt(eventId));
      setProgramDirectors(directorsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event program directors');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event program directors' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Check for duplicates before creating
      const isDuplicate = programDirectors.some(
        (d) =>
          formData.name && d.name && d.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: 'A program director with this name is already associated with this event. Duplicate entries are not allowed.'
        });
        return;
      }

      const directorData = { ...formData, event: { id: parseInt(eventId) } as EventDetailsDTO };
      const newDirector = await createEventProgramDirectorServer(directorData as any);
      setProgramDirectors(prev => [...prev, newDirector]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case it should be removed from available list
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create program director';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: 'A program director with this name is already associated with this event. Duplicate entries are not allowed.'
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      const updatedDirector = await updateEventProgramDirectorServer(selectedDirector.id!, formData);
      setProgramDirectors(prev => prev.map(d => d.id === selectedDirector.id ? updatedDirector : d));
      setIsEditModalOpen(false);
      setSelectedDirector(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Program director updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update program director' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateDirectorFromEventServer(selectedDirector.id!);
      setProgramDirectors(prev => prev.filter(d => d.id !== selectedDirector.id));
      setIsDisassociateModalOpen(false);
      setSelectedDirector(null);
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case this director should now appear
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director disassociated from event successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate program director' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      await deleteEventProgramDirectorServer(selectedDirector.id!);
      setProgramDirectors(prev => prev.filter(d => d.id !== selectedDirector.id));
      setIsDeleteModalOpen(false);
      setSelectedDirector(null);
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case this director should now appear
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director permanently deleted' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete program director' });
    } finally {
      setLoading(false);
    }
  };

  // Load available program directors with pagination and search
  const loadAvailableDirectors = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available program directors for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableDirectorsData = await fetchAvailableProgramDirectorsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available program directors data received:', availableDirectorsData);
      setAvailableDirectors(availableDirectorsData.content);
      setAvailableDirectorsTotalPages(availableDirectorsData.totalPages);
      setAvailableDirectorsTotalElements(availableDirectorsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available program directors:', err);
      setAvailableDirectors([]);
      setAvailableDirectorsTotalPages(0);
      setAvailableDirectorsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available program directors
  const handleAvailableDirectorsSearch = (searchTerm: string) => {
    setAvailableDirectorsSearchTerm(searchTerm);
    setAvailableDirectorsPage(0);
    loadAvailableDirectors(0, searchTerm);
  };

  // Handle pagination for available program directors
  const handleAvailableDirectorsPageChange = (page: number) => {
    setAvailableDirectorsPage(page);
    loadAvailableDirectors(page, availableDirectorsSearchTerm);
  };

  // Handle adding an available program director to this event
  const handleAddDirectorToEvent = async (director: EventProgramDirectorsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding program director to event:', director);

      // Check if director is already associated with this event
      const isAlreadyAssociated = programDirectors.some(
        (d) => d.id === director.id ||
        (d.name && director.name && d.name.toLowerCase() === director.name.toLowerCase())
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Program director "${director.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing director to associate with this event (don't create duplicate)
      if (!director.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add program director "${director.name}" - director ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the director with the event
      console.log('🔄 Associating program director', director.id, 'with event', eventId);
      await associateDirectorWithEventServer(director.id, parseInt(eventId));

      // Reload event program directors to get fresh data from database
      await loadEventAndProgramDirectors();
      // Reload available directors to remove the added one
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);

      setToastMessage({ type: 'success', message: `Program director "${director.name}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add program director to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add program director to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Program director "${director.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      photoUrl: '',
      bio: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setFormData(director);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setIsDeleteModalOpen(true);
  };

  const openDisassociateModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setIsDisassociateModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...programDirectors].sort((a, b) => {
      const aVal = a[key as keyof EventProgramDirectorsDTO];
      const bVal = b[key as keyof EventProgramDirectorsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setProgramDirectors(sorted);
  };

  const filteredDirectors = programDirectors.filter(director =>
    director.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    director.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations for main program directors table
  const directorsTotalPages = Math.ceil(filteredDirectors.length / directorsPageSize) || 1;
  const paginatedDirectors = filteredDirectors.slice(
    directorsPage * directorsPageSize,
    (directorsPage + 1) * directorsPageSize
  );
  const directorsStartEntry = filteredDirectors.length > 0 ? directorsPage * directorsPageSize + 1 : 0;
  const directorsEndEntry = filteredDirectors.length > 0 ? Math.min((directorsPage + 1) * directorsPageSize, filteredDirectors.length) : 0;

  // Reset to first page when search term or sort changes
  useEffect(() => {
    setDirectorsPage(0);
  }, [searchTerm, sortKey, sortDirection]);

  // Ensure current page doesn't exceed total pages after filtering
  useEffect(() => {
    if (directorsPage >= directorsTotalPages && directorsTotalPages > 0) {
      setDirectorsPage(Math.max(0, directorsTotalPages - 1));
    }
  }, [directorsTotalPages, directorsPage]);

  const columns: Column<EventProgramDirectorsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'bio',
      label: 'Bio',
      render: (value) => value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, director) => {
        const directorId = director?.id;
        const eventIdNum = parseInt(eventId);
        const currentPosterUrl = director?.photoUrl; // Use photoUrl as current poster URL

        return (
          <div className="flex flex-wrap gap-3 items-start" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(director);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Edit"
                aria-label="Edit director details"
                type="button"
              >
                <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Edit</span>
            </div>
            {directorId && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDirectorForPoster({
                        eventId: eventIdNum,
                        directorId,
                        currentPosterUrl,
                      });
                      setPosterUploadOpen(true);
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="Upload"
                    aria-label="Upload banners in this particular event for this director"
                    type="button"
                  >
                    <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-600 text-center whitespace-nowrap">Upload</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDirectorForMedia({
                        eventId: eventIdNum,
                        directorId,
                      });
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="View Media"
                    aria-label="View all the media files associated with this director"
                    type="button"
                  >
                    <svg className="text-purple-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-600 text-center whitespace-nowrap">View Media</span>
                </div>
              </>
            )}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDisassociateModal(director);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Disassociate"
                aria-label="Disassociate this director with this event"
                type="button"
              >
                <svg className="text-yellow-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Disassociate</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(director);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Delete"
                aria-label="Permanently delete this director"
                type="button"
              >
                <svg className="text-red-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Delete</span>
            </div>
          </div>
        );
      }
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Event ID not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link
          href={`/admin/events/${eventId}/edit`}
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Event"
          aria-label="Back to Event"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Back to Event</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🎭 Event Program Directors
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage program directors for this event</p>
        </div>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-4 p-4 rounded-lg ${toastMessage.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/media/list`}
            className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Media Files"
            aria-label="Manage Media Files"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Media Files</span>
          </Link>
          <Link
            href="/admin/manage-events"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/ticket-types/list`}
            className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Ticket Types"
            aria-label="Manage Ticket Types"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaTags className="w-10 h-10 text-purple-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/tickets/list`}
            className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Tickets"
            aria-label="Manage Tickets"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaTicketAlt className="w-10 h-10 text-teal-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Tickets</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/discount-codes/list`}
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Discount Codes"
            aria-label="Manage Discount Codes"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaPercent className="w-10 h-10 text-pink-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
        </div>
      </div>

      {/* Special Event Management Features Card */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-purple-800 mb-2">🎭 Event Management Features</h2>
            <p className="text-sm text-purple-600">Manage performers, contacts, sponsors, emails, and program directors for this event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              href={`/admin/events/${eventId}/performers`}
              className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Featured Performers"
              aria-label="Featured Performers"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaMicrophone className="w-10 h-10 text-pink-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Featured Performers</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/contacts`}
              className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Event Contacts"
              aria-label="Event Contacts"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaAddressBook className="w-10 h-10 text-emerald-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Contacts</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/sponsors`}
              className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Event Sponsors"
              aria-label="Event Sponsors"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="w-10 h-10 text-amber-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Sponsors</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/emails`}
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Event Emails"
              aria-label="Event Emails"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-10 h-10 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Emails</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/program-directors`}
              className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Program Directors"
              aria-label="Program Directors"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaUserTie className="w-10 h-10 text-indigo-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Program Directors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search program directors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Program Director"
            aria-label="Add Program Director"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add Program Director</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Program Directors Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Event Program Directors ({filteredDirectors.length})
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Hover over a director's name to view detailed information in a tooltip.
            </p>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Action Icons:</strong></p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-700 hover:bg-blue-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaEdit className="text-lg text-white" />
                  </button>
                  <span>Edit director details</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-500 hover:bg-blue-600 text-white p-3 pointer-events-none" disabled>
                    <FaUpload className="text-lg" />
                  </button>
                  <span>Upload banners in this particular event for this director</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-purple-500 hover:bg-purple-600 text-white p-3 pointer-events-none" disabled>
                    <FaImages className="text-lg" />
                  </button>
                  <span>View all the media files associated with this director</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-yellow-500 hover:bg-yellow-600 text-white p-3 pointer-events-none" disabled>
                    <FaUnlink className="text-lg" />
                  </button>
                  <span>Disassociate this director with this event</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-red-700 hover:bg-red-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaTrashAlt className="text-lg text-white" />
                  </button>
                  <span>Permanently delete this director</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            data={paginatedDirectors}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No program directors found for this event"
          />
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setDirectorsPage(prev => Math.max(0, prev - 1))}
              disabled={directorsPage === 0 || loading}
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

            {/* Page Info */}
            <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{directorsPage + 1}</span> of <span className="text-blue-600">{directorsTotalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setDirectorsPage(prev => Math.min(directorsTotalPages - 1, prev + 1))}
              disabled={directorsPage >= directorsTotalPages - 1 || loading}
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

          {/* Item Count Text */}
          <div className="text-center mt-3">
            {filteredDirectors.length > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{directorsStartEntry}</span> to <span className="font-bold text-blue-600">{directorsEndEntry}</span> of <span className="font-bold text-blue-600">{filteredDirectors.length}</span> program directors
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No program directors found</span>
                <span className="text-sm text-orange-600">[No program directors match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Program Directors Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Program Directors to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level program directors that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availableDirectors.length > 0 ? (availableDirectorsPage * 20) + 1 : 0} to {availableDirectors.length > 0 ? (availableDirectorsPage * 20) + availableDirectors.length : 0} of {availableDirectorsTotalElements} available program directors
          </p>
        </div>

        {/* Search Bar for Available Program Directors */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available program directors..."
                  value={availableDirectorsSearchTerm}
                  onChange={(e) => handleAvailableDirectorsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Program Directors Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableDirectors.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableDirectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available program directors found. All tenant program directors may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableDirectors.map((director) => (
                      <tr key={director.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {director.name || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {director.bio ? (director.bio.length > 50 ? director.bio.substring(0, 50) + '...' : director.bio) : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddDirectorToEvent(director)}
                            className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            data-tooltip="Add"
                            aria-label="Add program director to event"
                            type="button"
                          >
                            <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Available Program Directors - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableDirectorsPageChange(availableDirectorsPage - 1)}
                    disabled={availableDirectorsPage === 0 || loading}
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
                      Page <span className="text-blue-600">{availableDirectorsTotalPages === 0 ? 0 : availableDirectorsPage + 1}</span> of <span className="text-blue-600">{availableDirectorsTotalPages}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleAvailableDirectorsPageChange(availableDirectorsPage + 1)}
                    disabled={availableDirectorsPage >= availableDirectorsTotalPages - 1 || loading}
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
                  {availableDirectorsTotalElements > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{(availableDirectorsPage * 20) + 1}</span> to <span className="font-bold text-blue-600">{Math.min((availableDirectorsPage * 20) + availableDirectors.length, availableDirectorsTotalElements)}</span> of <span className="font-bold text-blue-600">{availableDirectorsTotalElements}</span> available program directors
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No available program directors found</span>
                      <span className="text-sm text-orange-600">[All tenant program directors are mapped to this event]</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Program Director"
        size="lg"
      >
        <ProgramDirectorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Program Director"
          eventId={eventId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDirector(null);
          resetForm();
        }}
        title="Edit Program Director"
        size="lg"
      >
        <ProgramDirectorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Program Director"
          eventId={eventId}
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedDirector(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Program Director from Event"
        message={`Are you sure you want to remove "${selectedDirector?.name || 'this program director'}" from this event? The program director will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDirector(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Program Director"
        message={`Are you sure you want to permanently delete "${selectedDirector?.name || 'this program director'}"? This action cannot be undone and will remove the program director from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />

      {/* Poster Upload Dialog */}
      {selectedDirectorForPoster && (
        <EventDirectorPosterUploadDialog
          eventId={selectedDirectorForPoster.eventId}
          directorId={selectedDirectorForPoster.directorId}
          currentPosterUrl={selectedDirectorForPoster.currentPosterUrl}
          isOpen={posterUploadOpen}
          onClose={() => {
            setPosterUploadOpen(false);
            setSelectedDirectorForPoster(null);
          }}
          onUploadSuccess={async (imageUrl) => {
            // Refresh program directors to show updated poster
            await loadEventAndProgramDirectors();
            setPosterUploadOpen(false);
            setSelectedDirectorForPoster(null);
          }}
        />
      )}

      {/* Media Gallery Modal */}
      {selectedDirectorForMedia && (
        <Modal
          isOpen={!!selectedDirectorForMedia}
          onClose={() => setSelectedDirectorForMedia(null)}
          title={`Media Gallery - ${programDirectors.find(d => d.id === selectedDirectorForMedia.directorId)?.name || 'Director'}`}
          size="xl"
        >
          <EventDirectorMediaGallery
            key={`${selectedDirectorForMedia.eventId}-${selectedDirectorForMedia.directorId}`}
            eventId={selectedDirectorForMedia.eventId}
            directorId={selectedDirectorForMedia.directorId}
            showPriorityControls={true}
            allowUpload={true}
            onUploadClick={() => {
              // Refresh gallery after upload by remounting component
              // The component will reload when key changes
              setSelectedDirectorForMedia({
                ...selectedDirectorForMedia,
                eventId: selectedDirectorForMedia.eventId, // Trigger re-render
              });
            }}
            onPriorityChange={async (mediaId, priorityRanking) => {
              // Component handles its own refresh via useEffect
              // This callback is for external notifications if needed
              console.log(`Priority updated for media ${mediaId}: ${priorityRanking}`);
            }}
            onMediaDelete={async (mediaId) => {
              // Component handles its own refresh after delete
              console.log(`Media deleted: ${mediaId}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Program Director Form Component
interface ProgramDirectorFormProps {
  formData: Partial<EventProgramDirectorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventProgramDirectorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  eventId: string;
}

function ProgramDirectorForm({ formData, setFormData, onSubmit, loading, submitText, eventId }: ProgramDirectorFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL (Optional)
          </label>
          <input
            type="url"
            name="photoUrl"
            value={formData.photoUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/photo.jpg (optional)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter director's bio and background information"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      {formData.id && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Profile Photo
            </label>
            <ImageUpload
              entityId={formData.id}
              entityType="program-director"
              imageType="photo"
              eventId={parseInt(eventId)}
              currentImageUrl={formData.photoUrl}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
              onError={(error) => console.error('Profile photo upload error:', error)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      <div className="flex flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={loading}
          title="Cancel"
          aria-label="Cancel"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Cancel</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={submitText}
          aria-label={submitText}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
            {loading ? (
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
          <span className="font-semibold text-green-700">{loading ? 'Saving...' : submitText}</span>
        </button>
      </div>
    </form>
  );
}
