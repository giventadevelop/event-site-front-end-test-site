'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import type { EventEmailsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventEmailsServer,
  createEventEmailServer,
  updateEventEmailServer,
  deleteEventEmailServer,
  associateEmailWithEventServer,
  disassociateEmailFromEventServer,
  fetchAvailableEmailsServer,
} from './ApiServerActions';

export default function EventEmailsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [emails, setEmails] = useState<EventEmailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EventEmailsDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventEmailsDTO>>({
    email: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state for main emails table
  const [emailsPage, setEmailsPage] = useState(0);
  const emailsPageSize = 20;

  // Available emails state (tenant-level emails not mapped to this event)
  const [availableEmails, setAvailableEmails] = useState<EventEmailsDTO[]>([]);
  const [availableEmailsPage, setAvailableEmailsPage] = useState(0);
  const [availableEmailsTotalPages, setAvailableEmailsTotalPages] = useState(0);
  const [availableEmailsTotalElements, setAvailableEmailsTotalElements] = useState(0);
  const [availableEmailsSearchTerm, setAvailableEmailsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndEmails();
      loadAvailableEmails(0, '');
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load emails for this event
      const emailsData = await fetchEventEmailsServer(parseInt(eventId));
      setEmails(emailsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event emails');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event emails' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Check for duplicates before creating
      const isDuplicate = emails.some(
        (e) =>
          formData.email && e.email && e.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: `An email "${formData.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      const emailData = { ...formData, event: { id: parseInt(eventId) } as EventDetailsDTO };
      const newEmail = await createEventEmailServer(emailData as any);
      setEmails(prev => [...prev, newEmail]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case it should be removed from available list
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create email';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `An email "${formData.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEmail) return;

    try {
      setLoading(true);
      const updatedEmail = await updateEventEmailServer(selectedEmail.id!, formData);
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? updatedEmail : e));
      setIsEditModalOpen(false);
      setSelectedEmail(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update email' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedEmail) {
      console.log('❌ No selected email for disassociation');
      return;
    }

    console.log('🔗 Disassociating email from event:', selectedEmail);

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateEmailFromEventServer(selectedEmail.id!);

      console.log('✅ Email disassociated successfully, updating UI');
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      setIsDisassociateModalOpen(false);
      setSelectedEmail(null);
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case this email should now appear
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Disassociate error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate email' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmail) {
      console.log('❌ No selected email for deletion');
      return;
    }

    console.log('🗑️ Hard deleting email:', selectedEmail);

    try {
      setLoading(true);
      console.log('🔄 Calling deleteEventEmailServer with ID:', selectedEmail.id);
      await deleteEventEmailServer(selectedEmail.id!);

      console.log('✅ Email deleted successfully, updating UI');
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      setIsDeleteModalOpen(false);
      setSelectedEmail(null);
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case this email should now appear
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email permanently deleted' });
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete email' });
    } finally {
      setLoading(false);
    }
  };

  // Load available emails with pagination and search
  const loadAvailableEmails = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available emails for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableEmailsData = await fetchAvailableEmailsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available emails data received:', availableEmailsData);
      setAvailableEmails(availableEmailsData.content);
      setAvailableEmailsTotalPages(availableEmailsData.totalPages);
      setAvailableEmailsTotalElements(availableEmailsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available emails:', err);
      setAvailableEmails([]);
      setAvailableEmailsTotalPages(0);
      setAvailableEmailsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available emails
  const handleAvailableEmailsSearch = (searchTerm: string) => {
    setAvailableEmailsSearchTerm(searchTerm);
    setAvailableEmailsPage(0);
    loadAvailableEmails(0, searchTerm);
  };

  // Handle pagination for available emails
  const handleAvailableEmailsPageChange = (page: number) => {
    setAvailableEmailsPage(page);
    loadAvailableEmails(page, availableEmailsSearchTerm);
  };

  // Handle adding an available email to this event
  const handleAddEmailToEvent = async (email: EventEmailsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding email to event:', email);

      // Check if email is already associated with this event
      const isAlreadyAssociated = emails.some(
        (e) => e.id === email.id ||
        (e.email && email.email && e.email.toLowerCase() === email.email.toLowerCase())
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Email "${email.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing email to associate with this event (don't create duplicate)
      if (!email.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add email "${email.email}" - email ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the email with the event
      console.log('🔄 Associating email', email.id, 'with event', eventId);
      await associateEmailWithEventServer(email.id, parseInt(eventId));

      // Reload event emails to get fresh data from database
      await loadEventAndEmails();
      // Reload available emails to remove the added one
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);

      setToastMessage({ type: 'success', message: `Email "${email.email}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add email to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add email to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Email "${email.email}" is already associated with this event. Duplicate entries are not allowed.`
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
      email: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (email: EventEmailsDTO) => {
    setSelectedEmail(email);
    setFormData(email);
    setIsEditModalOpen(true);
  };

  const openDisassociateModal = (email: EventEmailsDTO) => {
    console.log('🔗 Opening disassociate modal for email:', email);
    setSelectedEmail(email);
    setIsDisassociateModalOpen(true);
  };

  const openDeleteModal = (email: EventEmailsDTO) => {
    console.log('🗑️ Opening delete modal for email:', email);
    setSelectedEmail(email);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...emails].sort((a, b) => {
      const aVal = a[key as keyof EventEmailsDTO];
      const bVal = b[key as keyof EventEmailsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setEmails(sorted);
  };

  const filteredEmails = emails.filter(email =>
    email.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations for main emails table
  const emailsTotalPages = Math.ceil(filteredEmails.length / emailsPageSize) || 1;
  const paginatedEmails = filteredEmails.slice(
    emailsPage * emailsPageSize,
    (emailsPage + 1) * emailsPageSize
  );
  const emailsStartEntry = filteredEmails.length > 0 ? emailsPage * emailsPageSize + 1 : 0;
  const emailsEndEntry = filteredEmails.length > 0 ? Math.min((emailsPage + 1) * emailsPageSize, filteredEmails.length) : 0;

  // Reset to first page when search term or sort changes
  useEffect(() => {
    setEmailsPage(0);
  }, [searchTerm, sortKey, sortDirection]);

  // Ensure current page doesn't exceed total pages after filtering
  useEffect(() => {
    if (emailsPage >= emailsTotalPages && emailsTotalPages > 0) {
      setEmailsPage(Math.max(0, emailsTotalPages - 1));
    }
  }, [emailsTotalPages, emailsPage]);

  const columns: Column<EventEmailsDTO>[] = [
    { key: 'email', label: 'Email Address', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, email) => (
        <div className="flex flex-wrap gap-3 items-start" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(email);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Edit"
              aria-label="Edit"
              type="button"
            >
              <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <span className="text-xs text-gray-600 text-center whitespace-nowrap">Edit</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDisassociateModal(email);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Disassociate"
              aria-label="Disassociate from Event"
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
                openDeleteModal(email);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Delete"
              aria-label="Permanently Delete"
              type="button"
            >
              <svg className="text-red-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <span className="text-xs text-gray-600 text-center whitespace-nowrap">Delete</span>
          </div>
        </div>
      )
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
            📧 Event Emails
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage emails for this event</p>
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
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
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
                <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                </svg>
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
                <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 sm:py-3 w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-4 sm:px-6"
              title="Add Email"
              aria-label="Add Email"
              type="button"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700 text-sm sm:text-base">Add Email</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Emails Table */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Event Emails ({filteredEmails.length})
          </h2>
          <div className="overflow-x-auto user-table-scroll-container">
          <DataTable
            data={paginatedEmails}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No emails found for this event"
          />
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setEmailsPage(prev => Math.max(0, prev - 1))}
              disabled={emailsPage === 0 || loading}
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
                Page <span className="text-blue-600">{emailsPage + 1}</span> of <span className="text-blue-600">{emailsTotalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setEmailsPage(prev => Math.min(emailsTotalPages - 1, prev + 1))}
              disabled={emailsPage >= emailsTotalPages - 1 || loading}
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
            {filteredEmails.length > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{emailsStartEntry}</span> to <span className="font-bold text-blue-600">{emailsEndEntry}</span> of <span className="font-bold text-blue-600">{filteredEmails.length}</span> emails
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No emails found</span>
                <span className="text-sm text-orange-600">[No emails match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Available Emails Section */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Available Emails to Add</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              Tenant-level emails that are not yet mapped to this event. Click "Add" to associate them with this event.
              <span className="hidden sm:inline"> Showing {availableEmails.length > 0 ? (availableEmailsPage * 20) + 1 : 0} to {availableEmails.length > 0 ? (availableEmailsPage * 20) + availableEmails.length : 0} of {availableEmailsTotalElements} available emails</span>
            </p>
          </div>

        {/* Search Bar for Available Emails */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available emails..."
                  value={availableEmailsSearchTerm}
                  onChange={(e) => handleAvailableEmailsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 sm:py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Emails Table */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {loading && availableEmails.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available emails found. All tenant emails may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto user-table-scroll-container">
                <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px', width: '100%' }}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableEmails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {email.email || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddEmailToEvent(email)}
                            className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            data-tooltip="Add"
                            aria-label="Add email to event"
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

              {/* Pagination for Available Emails - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableEmailsPageChange(availableEmailsPage - 1)}
                    disabled={availableEmailsPage === 0 || loading}
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
                      Page <span className="text-blue-600">{availableEmailsTotalPages === 0 ? 0 : availableEmailsPage + 1}</span> of <span className="text-blue-600">{availableEmailsTotalPages}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleAvailableEmailsPageChange(availableEmailsPage + 1)}
                    disabled={availableEmailsPage >= availableEmailsTotalPages - 1 || loading}
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
                  {availableEmailsTotalElements > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{(availableEmailsPage * 20) + 1}</span> to <span className="font-bold text-blue-600">{Math.min((availableEmailsPage * 20) + availableEmails.length, availableEmailsTotalElements)}</span> of <span className="font-bold text-blue-600">{availableEmailsTotalElements}</span> available emails
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No available emails found</span>
                      <span className="text-sm text-orange-600">[All tenant emails are mapped to this event]</span>
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
        title="Add Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Email"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmail(null);
          resetForm();
        }}
        title="Edit Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Email"
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedEmail(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Email from Event"
        message={`Are you sure you want to remove "${selectedEmail?.email || 'this email'}" from this event? The email will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmail(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Email"
        message={`Are you sure you want to permanently delete "${selectedEmail?.email || 'this email'}"? This action cannot be undone and will remove the email from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

// Email Form Component
interface EmailFormProps {
  formData: Partial<EventEmailsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventEmailsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function EmailForm({ formData, setFormData, onSubmit, loading, submitText }: EmailFormProps) {
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email address"
        />
      </div>

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
