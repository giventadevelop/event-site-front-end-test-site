'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import AdminNavigation from '@/components/AdminNavigation';
import type { EventEmailsDTO } from '@/types';
import {
  fetchEventEmailsServer,
  createEventEmailServer,
  updateEventEmailServer,
  deleteEventEmailServer,
} from './ApiServerActions';

export default function GlobalEventEmailsPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [emails, setEmails] = useState<EventEmailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EventEmailsDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventEmailsDTO>>({
    email: '',
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      loadEmails();
    }
  }, [userId]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const emailsData = await fetchEventEmailsServer();
      setEmails(emailsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('🚀 Global handleCreate called!');
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.email?.trim()) {
        setToastMessage({ type: 'error', message: 'Email is required' });
        return;
      }

      const emailData = {
        email: formData.email.trim(),
      };

      // Debug logging
      console.log('🔍 Global Frontend Event Email Debug:');
      console.log('📝 Form data:', formData);
      console.log('📤 Email data being sent:', emailData);

      const newEmail = await createEventEmailServer(emailData);
      setEmails(prev => [...prev, newEmail]);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email created successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to create email' });
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

  const handleDelete = async () => {
    if (!selectedEmail) return;

    try {
      setLoading(true);
      await deleteEventEmailServer(selectedEmail.id!);
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      setIsDeleteModalOpen(false);
      setSelectedEmail(null);
      setToastMessage({ type: 'success', message: 'Email deleted successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete email' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
    });
  };

  const openEditModal = (email: EventEmailsDTO) => {
    setSelectedEmail(email);
    setFormData({
      email: email.email || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (email: EventEmailsDTO) => {
    setSelectedEmail(email);
    setIsDeleteModalOpen(true);
  };

  // Filter and sort emails
  const filteredEmails = emails.filter(email =>
    email.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey as keyof EventEmailsDTO];
    const bValue = b[sortKey as keyof EventEmailsDTO];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Client-side pagination
  const totalCount = sortedEmails.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? Math.min((page + 1) * pageSize, totalCount) : 0;
  const paginatedEmails = sortedEmails.slice(page * pageSize, (page + 1) * pageSize);

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const columns: Column<EventEmailsDTO>[] = [
    { key: 'email', label: 'Email', sortable: true },
  ];

  if (loading && emails.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '180px' }}
        >
          <AdminNavigation currentPage="event-emails" />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading emails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '180px' }}
      >
        <AdminNavigation currentPage="event-emails" />

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Global Emails</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">(You can add or disassociate these items with any events. Please go to the corresponding event page to manage these associated entities.)</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
                title="Add Email"
                aria-label="Add Email"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <FaPlus className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-blue-700 hidden sm:inline">Add Email</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              data={paginatedEmails}
              columns={columns}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={(key, direction) => {
                setSortKey(key);
                setSortDirection(direction);
              }}
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
                      Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{endItem}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount}</span> emails
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-2 sm:px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">No emails found</span>
                    <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hidden sm:inline">[No emails match your criteria]</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${toastMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {toastMessage.message}
            <button
              onClick={() => setToastMessage(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Global Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onCancel={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
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
        title="Edit Global Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedEmail(null);
            resetForm();
          }}
          loading={loading}
          submitText="Update Email"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmail(null);
        }}
        onConfirm={handleDelete}
        title="Delete Email"
        message={`Are you sure you want to delete "${selectedEmail?.email}"? This action cannot be undone.`}
        confirmText="Delete"
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
  onCancel: () => void;
  loading: boolean;
  submitText: string;
}

function EmailForm({ formData, setFormData, onSubmit, onCancel, loading, submitText }: EmailFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={loading}
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
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={loading}
          title={loading ? 'Processing...' : submitText}
          aria-label={loading ? 'Processing...' : submitText}
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
          <span className="font-semibold text-blue-700">{loading ? 'Processing...' : submitText}</span>
        </button>
      </div>
    </form>
  );
}
