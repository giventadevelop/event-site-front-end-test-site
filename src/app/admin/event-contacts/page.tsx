'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import AdminNavigation from '@/components/AdminNavigation';
import type { EventContactsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventContactsServer,
  createEventContactServer,
  updateEventContactServer,
  deleteEventContactServer,
} from './ApiServerActions';
import { fetchEventsFilteredServer } from '../ApiServerActions';

export default function EventContactsPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EventContactsDTO | null>(null);

  // Form state - Fixed to match DTO: name, phone, email only
  const [formData, setFormData] = useState<Partial<EventContactsDTO>>({
    name: '',
    phone: '',
    email: '',
    event: undefined,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      loadContacts();
      loadEvents();
    }
  }, [userId]);

  const loadEvents = async () => {
    try {
      const result = await fetchEventsFilteredServer({
        pageSize: 1000, // Load all events for dropdown
        sort: 'startDate,desc'
      });
      setEvents(result.events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEventContactsServer();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load contacts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      // Include event association if selected, ensure required fields
      const contactData = {
        name: formData.name || '',
        phone: formData.phone || '',
        email: formData.email || undefined,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const newContact = await createEventContactServer(contactData as any);
      setContacts(prev => [...prev, newContact]);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Contact created successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to create contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      // Include event association if selected
      const contactData = {
        ...formData,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const updatedContact = await updateEventContactServer(selectedContact.id!, contactData);
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

  const handleDelete = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      await deleteEventContactServer(selectedContact.id!);
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      setToastMessage({ type: 'success', message: 'Contact deleted successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete contact' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      event: undefined,
    });
  };

  const openEditModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      event: contact.event || undefined
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEventFilter = !eventFilter || contact.event?.id?.toString() === eventFilter;

    return matchesSearch && matchesEventFilter;
  });

  // Client-side pagination
  const totalCount = filteredContacts.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? Math.min((page + 1) * pageSize, totalCount) : 0;
  const paginatedContacts = filteredContacts.slice(page * pageSize, (page + 1) * pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, eventFilter]);

  const columns: Column<EventContactsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-'
    },
    {
      key: 'event',
      label: 'Event',
      sortable: false,
      render: (value, row) => {
        if (row.event?.id && row.event?.title) {
          return (
            <a
              href={`/admin/events/${row.event.id}`}
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {row.event.title}
            </a>
          );
        }
        return <span className="text-gray-400">-</span>;
      }
    }
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left mb-2">Global Contacts</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">(You can add or disassociate these items with any events. Please go to the corresponding event page to manage these associated entities.)</p>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-xs sm:text-sm ${toastMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
            {toastMessage.message}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="min-w-0 sm:min-w-48">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="">All Events</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id?.toString()}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
              title="Add Contact"
              aria-label="Add Contact"
              type="button"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs sm:text-sm lg:text-base whitespace-nowrap">Add Contact</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-xs sm:text-sm">
            {error}
          </div>
        )}

        <DataTable
          data={paginatedContacts}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No contacts found"
        />

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0 || loading}
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
                Page <span className="text-blue-600 dark:text-blue-400">{page + 1}</span> of <span className="text-blue-600 dark:text-blue-400">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= totalPages - 1 || loading}
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
                  Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{endItem}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount}</span> contacts
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-2 sm:px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">No contacts found</span>
                <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hidden sm:inline">[No contacts match your criteria]</span>
              </div>
            )}
          </div>
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
          events={events}
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
          events={events}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${selectedContact?.name?.trim() || selectedContact?.email?.trim() || 'this contact'}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// Contact Form Component - Fixed to match DTO: name, phone, email only
interface ContactFormProps {
  formData: Partial<EventContactsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventContactsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  events: EventDetailsDTO[];
}

function ContactForm({ formData, setFormData, onSubmit, loading, submitText, events }: ContactFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            Event (Optional)
          </label>
          <select
            name="event"
            value={formData.event?.id?.toString() || ''}
            onChange={(e) => {
              const eventId = e.target.value ? parseInt(e.target.value) : undefined;
              setFormData(prev => ({
                ...prev,
                event: eventId ? { id: eventId } as EventDetailsDTO : undefined
              }));
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Event (Global)</option>
            {events.map(event => (
              <option key={event.id} value={event.id?.toString()}>
                {event.title} {event.startDate ? `(${event.startDate})` : ''}
              </option>
            ))}
          </select>
        </div>

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
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Cancel"
          aria-label="Cancel"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold text-red-700">Cancel</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={loading ? 'Saving...' : submitText}
          aria-label={loading ? 'Saving...' : submitText}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            {loading ? (
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-blue-700">{loading ? 'Saving...' : submitText}</span>
        </button>
      </div>
    </form>
  );
}
