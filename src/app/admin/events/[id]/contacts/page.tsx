'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import type { EventContactsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventContactsServer,
  createEventContactServer,
  updateEventContactServer,
  deleteEventContactServer,
  fetchAvailableContactsServer,
  associateContactWithEventServer,
  disassociateContactFromEventServer,
} from './ApiServerActions';

export default function EventContactsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EventContactsDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventContactsDTO>>({
    name: '',
    phone: '',
    email: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state for main contacts table
  const [contactsPage, setContactsPage] = useState(0);
  const contactsPageSize = 20;

  // Available contacts state (tenant-level contacts not mapped to this event)
  const [availableContacts, setAvailableContacts] = useState<EventContactsDTO[]>([]);
  const [availableContactsPage, setAvailableContactsPage] = useState(0);
  const [availableContactsTotalPages, setAvailableContactsTotalPages] = useState(0);
  const [availableContactsTotalElements, setAvailableContactsTotalElements] = useState(0);
  const [availableContactsSearchTerm, setAvailableContactsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndContacts();
      loadAvailableContacts(0, '');
    }
  }, [userId, eventId]);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', {
      isDeleteModalOpen,
      selectedContact: selectedContact?.name,
      hasSelectedContact: !!selectedContact
    });
  }, [isDeleteModalOpen, selectedContact]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading event and contacts for eventId:', eventId);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        console.log('✅ Event loaded:', eventData);
        setEvent(eventData);
      }

      // Load contacts for this event
      console.log('🔄 Fetching contacts...');
      const contactsData = await fetchEventContactsServer(parseInt(eventId));
      console.log('✅ Contacts loaded:', contactsData);
      setContacts(contactsData);
    } catch (err: any) {
      console.error('❌ Error loading event and contacts:', err);
      setError(err.message || 'Failed to load event contacts');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event contacts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('🚀 handleCreate called!');
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Name is required' });
        return;
      }

      if (!formData.phone?.trim()) {
        setToastMessage({ type: 'error', message: 'Phone is required' });
        return;
      }

      // Check for duplicates before creating
      const isDuplicate = contacts.some(
        (c) =>
          (formData.email && c.email && c.email.toLowerCase() === formData.email.toLowerCase()) ||
          (formData.phone && c.phone && c.phone === formData.phone)
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: 'A contact with this email or phone number is already associated with this event. Duplicate entries are not allowed.'
        });
        return;
      }

      const contactData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        event: { id: parseInt(eventId) } as EventDetailsDTO,
      };

      // Debug logging
      console.log('🔍 Frontend Event Contact Debug:');
      console.log('📝 Form data:', formData);
      console.log('📤 Contact data being sent:', contactData);
      console.log('🎯 Event ID:', eventId);

      const newContact = await createEventContactServer(contactData);
      setContacts(prev => [...prev, newContact]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload available contacts in case this was a duplicate
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      // Reload event contacts to get fresh data
      await loadEventAndContacts();
      setToastMessage({ type: 'success', message: 'Contact created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contact';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: 'A contact with this email or phone number is already associated with this event. Duplicate entries are not allowed.'
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      const updatedContact = await updateEventContactServer(selectedContact.id!, formData);
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
      setIsEditModalOpen(false);
      setSelectedContact(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Contact updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedContact) {
      console.log('❌ No selected contact for disassociation');
      return;
    }

    console.log('🔗 Disassociating contact from event:', selectedContact);

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateContactFromEventServer(selectedContact.id!);

      console.log('✅ Contact disassociated successfully, updating UI');
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDisassociateModalOpen(false);
      setSelectedContact(null);
      // Reload available contacts so this contact appears in the available list
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      setToastMessage({ type: 'success', message: 'Contact disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Disassociate error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) {
      console.log('❌ No selected contact for deletion');
      return;
    }

    console.log('🗑️ Hard deleting contact:', selectedContact);

    try {
      setLoading(true);
      console.log('🔄 Calling deleteEventContactServer with ID:', selectedContact.id);
      await deleteEventContactServer(selectedContact.id!);

      console.log('✅ Contact deleted successfully, updating UI');
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      // Reload available contacts in case this contact should now appear
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      setToastMessage({ type: 'success', message: 'Contact permanently deleted' });
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete contact' });
    } finally {
      setLoading(false);
    }
  };

  // Load available contacts with pagination and search
  const loadAvailableContacts = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available contacts for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableContactsData = await fetchAvailableContactsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available contacts data received:', availableContactsData);
      setAvailableContacts(availableContactsData.content);
      setAvailableContactsTotalPages(availableContactsData.totalPages);
      setAvailableContactsTotalElements(availableContactsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available contacts:', err);
      setAvailableContacts([]);
      setAvailableContactsTotalPages(0);
      setAvailableContactsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available contacts
  const handleAvailableContactsSearch = (searchTerm: string) => {
    setAvailableContactsSearchTerm(searchTerm);
    setAvailableContactsPage(0);
    loadAvailableContacts(0, searchTerm);
  };

  // Handle pagination for available contacts
  const handleAvailableContactsPageChange = (page: number) => {
    setAvailableContactsPage(page);
    loadAvailableContacts(page, availableContactsSearchTerm);
  };

  // Handle adding an available contact to this event
  const handleAddContactToEvent = async (contact: EventContactsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding contact to event:', contact);

      // Check if contact is already associated with this event
      const isAlreadyAssociated = contacts.some(
        (c) => c.id === contact.id ||
        (c.email && contact.email && c.email.toLowerCase() === contact.email.toLowerCase()) ||
        (c.phone && contact.phone && c.phone === contact.phone)
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Contact "${contact.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing contact to associate with this event (don't create duplicate)
      if (!contact.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add contact "${contact.name}" - contact ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the contact with the event
      console.log('🔄 Associating contact', contact.id, 'with event', eventId);
      await associateContactWithEventServer(contact.id, parseInt(eventId));

      // Reload event contacts to get fresh data from database
      await loadEventAndContacts();
      // Reload available contacts to remove the added one
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);

      setToastMessage({ type: 'success', message: `Contact "${contact.name}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add contact to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add contact to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Contact "${contact.name}" is already associated with this event. Duplicate entries are not allowed.`
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
      phone: '',
      email: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setFormData(contact);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contact: EventContactsDTO) => {
    console.log('🗑️ Opening delete modal for contact:', contact);
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const openDisassociateModal = (contact: EventContactsDTO) => {
    console.log('🔗 Opening disassociate modal for contact:', contact);
    setSelectedContact(contact);
    setIsDisassociateModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...contacts].sort((a, b) => {
      const aVal = a[key as keyof EventContactsDTO];
      const bVal = b[key as keyof EventContactsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setContacts(sorted);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations for main contacts table
  const contactsTotalPages = Math.ceil(filteredContacts.length / contactsPageSize) || 1;
  const paginatedContacts = filteredContacts.slice(
    contactsPage * contactsPageSize,
    (contactsPage + 1) * contactsPageSize
  );
  const contactsStartEntry = filteredContacts.length > 0 ? contactsPage * contactsPageSize + 1 : 0;
  const contactsEndEntry = filteredContacts.length > 0 ? Math.min((contactsPage + 1) * contactsPageSize, filteredContacts.length) : 0;

  // Reset to first page when search term or sort changes
  useEffect(() => {
    setContactsPage(0);
  }, [searchTerm, sortKey, sortDirection]);

  // Ensure current page doesn't exceed total pages after filtering
  useEffect(() => {
    if (contactsPage >= contactsTotalPages && contactsTotalPages > 0) {
      setContactsPage(Math.max(0, contactsTotalPages - 1));
    }
  }, [contactsTotalPages, contactsPage]);

  const columns: Column<EventContactsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, contact) => (
        <div className="flex flex-wrap gap-3 items-start" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(contact);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Edit"
              aria-label="Edit contact details"
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
                openDisassociateModal(contact);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Disassociate"
              aria-label="Disassociate contact from event"
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
                openDeleteModal(contact);
              }}
              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              data-tooltip="Delete"
              aria-label="Permanently delete contact"
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
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
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
            📞 Event Contacts
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage contacts for this event</p>
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
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Contact"
            aria-label="Add Contact"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add Contact</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Event Contacts ({filteredContacts.length})
        </h2>
        <DataTable
          data={paginatedContacts}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No contacts found for this event"
        />

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setContactsPage(prev => Math.max(0, prev - 1))}
              disabled={contactsPage === 0 || loading}
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
                Page <span className="text-blue-600">{contactsPage + 1}</span> of <span className="text-blue-600">{contactsTotalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setContactsPage(prev => Math.min(contactsTotalPages - 1, prev + 1))}
              disabled={contactsPage >= contactsTotalPages - 1 || loading}
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
            {filteredContacts.length > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{contactsStartEntry}</span> to <span className="font-bold text-blue-600">{contactsEndEntry}</span> of <span className="font-bold text-blue-600">{filteredContacts.length}</span> contacts
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No contacts found</span>
                <span className="text-sm text-orange-600">[No contacts match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Contacts Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Contacts to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level contacts that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availableContacts.length > 0 ? (availableContactsPage * 20) + 1 : 0} to {availableContacts.length > 0 ? (availableContactsPage * 20) + availableContacts.length : 0} of {availableContactsTotalElements} available contacts
          </p>
        </div>

        {/* Search Bar for Available Contacts */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available contacts..."
                  value={availableContactsSearchTerm}
                  onChange={(e) => handleAvailableContactsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Contacts Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableContacts.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available contacts found. All tenant contacts may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contact.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contact.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contact.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddContactToEvent(contact)}
                            className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            data-tooltip="Add"
                            aria-label="Add contact to event"
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

              {/* Pagination for Available Contacts - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableContactsPageChange(availableContactsPage - 1)}
                    disabled={availableContactsPage === 0 || loading}
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
                      Page <span className="text-blue-600">{availableContactsTotalPages === 0 ? 0 : availableContactsPage + 1}</span> of <span className="text-blue-600">{availableContactsTotalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleAvailableContactsPageChange(availableContactsPage + 1)}
                    disabled={availableContactsPage >= availableContactsTotalPages - 1 || loading}
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
                  {availableContactsTotalElements > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{(availableContactsPage * 20) + 1}</span> to <span className="font-bold text-blue-600">{Math.min((availableContactsPage * 20) + availableContacts.length, availableContactsTotalElements)}</span> of <span className="font-bold text-blue-600">{availableContactsTotalElements}</span> available contacts
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No available contacts found</span>
                      <span className="text-sm text-orange-600">[All tenant contacts are mapped to this event]</span>
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
        title="Add Event Contact"
        size="lg"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Contact"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContact(null);
          resetForm();
        }}
        title="Edit Event Contact"
        size="lg"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Contact"
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Contact from Event"
        message={`Are you sure you want to remove "${selectedContact?.name || 'this contact'}" from this event? The contact will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Contact"
        message={`Are you sure you want to permanently delete "${selectedContact?.name || 'this contact'}"? This action cannot be undone and will remove the contact from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

// Contact Form Component
interface ContactFormProps {
  formData: Partial<EventContactsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventContactsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function ContactForm({ formData, setFormData, onSubmit, loading, submitText }: ContactFormProps) {
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
          <label className="block text-sm font-medium text-gray-700">
            👤 Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            📧 Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            📞 Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>


      <div className="flex flex-row gap-3 sm:gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
