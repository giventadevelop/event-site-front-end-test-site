'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import AdminNavigation from '@/components/AdminNavigation';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import type { TenantEmailAddressDTO } from '@/types';
import {
  fetchTenantEmailAddressesServer,
  createTenantEmailAddressServer,
  updateTenantEmailAddressServer,
  deleteTenantEmailAddressServer,
  fetchTenantEmailAddressesCountServer,
} from './ApiServerActions';

type FormState = Partial<TenantEmailAddressDTO>;

export default function TenantEmailAddressesPage() {
  const { userId } = useAuth();

  const [items, setItems] = useState<TenantEmailAddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TenantEmailAddressDTO | null>(null);

  const [formData, setFormData] = useState<FormState>({
    emailAddress: '',
    copyToEmailAddress: '',
    replyToEmailAddress: '',
    emailType: 'INFO',
    displayName: '',
    isActive: true,
    isDefault: false,
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('emailType');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(0); // Zero-based page index
  const [pageSize] = useState(10); // Items per page

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createFormMessage, setCreateFormMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editFormMessage, setEditFormMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, count] = await Promise.all([
        fetchTenantEmailAddressesServer(currentPage, pageSize),
        fetchTenantEmailAddressesCountServer().catch(() => null),
      ]);
      setItems(list);
      if (typeof count === 'number') setTotalCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant email addresses');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (userId) {
      void loadData();
    }
  }, [userId, loadData]);

  const resetForm = () => {
    setFormData({
      emailAddress: '',
      copyToEmailAddress: '',
      replyToEmailAddress: '',
      emailType: 'INFO',
      displayName: '',
      isActive: true,
      isDefault: false,
      description: '',
    });
    setCreateFormMessage(null);
    setEditFormMessage(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.emailAddress?.trim()) {
        setCreateFormMessage({ type: 'error', message: 'Email address is required' });
        return;
      }
      const copyToTrimmed = formData.copyToEmailAddress?.trim() || '';
      const replyToTrimmed = formData.replyToEmailAddress?.trim() || '';
      if (
        copyToTrimmed &&
        formData.emailAddress.trim().toLowerCase() === copyToTrimmed.toLowerCase()
      ) {
        setCreateFormMessage({
          type: 'error',
          message: 'From email and Copy-To email address must be different when both are provided',
        });
        return;
      }
      if (
        replyToTrimmed &&
        formData.emailAddress.trim().toLowerCase() === replyToTrimmed.toLowerCase()
      ) {
        setCreateFormMessage({
          type: 'error',
          message: 'From email and Reply-To email address must be different when both are provided',
        });
        return;
      }
      if (!formData.emailType) {
        setCreateFormMessage({ type: 'error', message: 'Email type is required' });
        return;
      }

      setLoading(true);
      const payload = {
        emailAddress: formData.emailAddress!.trim(),
        copyToEmailAddress: copyToTrimmed || null,
        replyToEmailAddress: replyToTrimmed || null,
        emailType: formData.emailType! as TenantEmailAddressDTO['emailType'],
        displayName: formData.displayName?.trim() || undefined,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        description: formData.description?.trim() || undefined,
      };

      const created = await createTenantEmailAddressServer(payload as any);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email address created successfully' });
      setCurrentPage(0); // Reset to first page after creation
      void loadData();
    } catch (err: any) {
      setCreateFormMessage({ type: 'error', message: err.message || 'Failed to create email address' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      if (!formData.emailAddress?.trim()) {
        setEditFormMessage({ type: 'error', message: 'Email address is required' });
        return;
      }
      const copyToTrimmed = formData.copyToEmailAddress?.trim() || '';
      const replyToTrimmed = formData.replyToEmailAddress?.trim() || '';
      if (
        copyToTrimmed &&
        formData.emailAddress.trim().toLowerCase() === copyToTrimmed.toLowerCase()
      ) {
        setEditFormMessage({
          type: 'error',
          message: 'From email and Copy-To email address must be different when both are provided',
        });
        return;
      }
      if (
        replyToTrimmed &&
        formData.emailAddress.trim().toLowerCase() === replyToTrimmed.toLowerCase()
      ) {
        setEditFormMessage({
          type: 'error',
          message: 'From email and Reply-To email address must be different when both are provided',
        });
        return;
      }
      if (!formData.emailType) {
        setEditFormMessage({ type: 'error', message: 'Email type is required' });
        return;
      }

      setLoading(true);
      const patch: Partial<TenantEmailAddressDTO> = {
        emailAddress: formData.emailAddress!.trim(),
        copyToEmailAddress: copyToTrimmed || null,
        replyToEmailAddress: replyToTrimmed || null,
        emailType: formData.emailType as TenantEmailAddressDTO['emailType'],
        displayName: formData.displayName?.trim() || undefined,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        description: formData.description?.trim() || undefined,
      };

      await updateTenantEmailAddressServer(selectedItem.id, patch);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email address updated successfully' });
      void loadData();
    } catch (err: any) {
      setEditFormMessage({ type: 'error', message: err.message || 'Failed to update email address' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      setLoading(true);
      await deleteTenantEmailAddressServer(selectedItem.id);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setToastMessage({ type: 'success', message: 'Email address deleted successfully' });
      // Reset to first page if current page becomes empty after deletion
      const remainingCount = (totalCount ?? 0) - 1;
      const newTotalPages = Math.ceil(remainingCount / pageSize) || 1;
      if (currentPage >= newTotalPages && currentPage > 0) {
        setCurrentPage(newTotalPages - 1);
      }
      void loadData();
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete email address' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedItem(null);
    setCreateFormMessage(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (item: TenantEmailAddressDTO) => {
    setSelectedItem(item);
    setFormData({
      emailAddress: item.emailAddress,
      copyToEmailAddress: item.copyToEmailAddress,
      replyToEmailAddress: item.replyToEmailAddress,
      emailType: item.emailType,
      displayName: item.displayName,
      isActive: item.isActive,
      isDefault: item.isDefault,
      description: item.description,
    });
    setEditFormMessage(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item: TenantEmailAddressDTO) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setCurrentPage(0);
    }
  }, [searchTerm]);

  const filteredAndSortedItems = useMemo(() => {
    let data = [...items];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.emailAddress.toLowerCase().includes(q) ||
        (item.displayName?.toLowerCase().includes(q) ?? false) ||
        item.emailType.toLowerCase().includes(q)
      );
    }

    if (sortKey) {
      data.sort((a, b) => {
        const aValue = (a as any)[sortKey];
        const bValue = (b as any)[sortKey];
        if (aValue == null && bValue != null) return sortDirection === 'asc' ? -1 : 1;
        if (aValue != null && bValue == null) return sortDirection === 'asc' ? 1 : -1;
        if (aValue == null && bValue == null) return 0;
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [items, searchTerm, sortKey, sortDirection]);

  const columns: Column<TenantEmailAddressDTO>[] = [
    { key: 'emailType', label: 'Type', sortable: true },
    { key: 'emailAddress', label: 'From Email Address', sortable: true },
    { key: 'copyToEmailAddress', label: 'Copy-To Address', sortable: true },
    { key: 'replyToEmailAddress', label: 'Reply-To Address', sortable: true },
    { key: 'displayName', label: 'Display Name', sortable: true },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <AdminNavigation currentPage="tenant-email-addresses" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tenant email addresses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="tenant-email-addresses" />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Email Addresses</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Configure the verified “From” email addresses for this tenant, categorized by type (info, sales,
              support, noreply, etc.). These addresses are used when sending emails from the platform.
            </p>
            <div className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 space-y-2">
              <p className="font-semibold text-blue-900">Email configuration guide</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <span className="font-semibold">From (required)</span> — The verified sender address shown in the
                  &quot;From&quot; field when the platform sends email for this type (e.g. CONTACT, INFO). Must be an
                  AWS SES verified address.
                </li>
                <li>
                  <span className="font-semibold">Copy-To (optional)</span> — Leave empty if no extra copy is needed.
                  When set, that address receives a duplicate of outbound messages (for example, a manager CC on contact
                  form submissions). If provided, it must differ from the From address.
                </li>
                <li>
                  <span className="font-semibold">Reply-To (optional)</span> — Leave empty to use the visitor&apos;s
                  email as Reply-To on inbound notifications (typical for contact forms). When set, staff who click
                  &quot;Reply&quot; in their mail client write to this address instead—for example a shared inbox like{' '}
                  <span className="font-mono">support@yourorg.org</span>. If provided, it must differ from the From
                  address.
                </li>
              </ul>
              <p>
                Contact the platform administrator to add or verify sender addresses in AWS SES before use.
              </p>
            </div>
            {totalCount !== null && (
              <p className="text-gray-500 text-xs mt-1">Total addresses: {totalCount}</p>
            )}
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Email Address"
            aria-label="Add Email Address"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaPlus className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-blue-700">Add Email Address</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by email, display name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <DataTable<TenantEmailAddressDTO>
          data={filteredAndSortedItems}
          columns={columns}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          emptyMessage="No tenant email addresses configured yet."
        />

        {/* Pagination Controls - Always visible, matching admin page style */}
        {(() => {
          const totalPages = Math.ceil((totalCount ?? 0) / pageSize) || 1;
          const displayPage = currentPage + 1; // Display as 1-based
          const isPrevDisabled = currentPage === 0 || loading;
          const isNextDisabled = currentPage >= totalPages - 1 || loading;
          const startItem = (totalCount ?? 0) > 0 ? currentPage * pageSize + 1 : 0;
          const endItem = (totalCount ?? 0) > 0 ? Math.min(currentPage * pageSize + pageSize, totalCount ?? 0) : 0;

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

          return (
            <div className="mt-8">
              <div className="flex justify-between items-center">
                {/* Previous Button */}
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

                {/* Page Info */}
                <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-blue-700">
                    Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
                  </span>
                </div>

                {/* Next Button */}
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

              {/* Item Count Text */}
              <div className="text-center mt-3">
                {(totalCount ?? 0) > 0 ? (
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-700">
                      Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> email addresses
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-orange-700">No email addresses found</span>
                    <span className="text-sm text-orange-600">[No email addresses match your criteria]</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toastMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toastMessage.message}
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Tenant Email Address"
        size="lg"
      >
        <TenantEmailAddressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Email Address"
          message={createFormMessage}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          resetForm();
        }}
        title="Edit Tenant Email Address"
        size="lg"
      >
        <TenantEmailAddressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Save Changes"
          message={editFormMessage}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="Delete Tenant Email Address"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this email address{' '}
            <span className="font-semibold">{selectedItem?.emailAddress}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface TenantEmailAddressFormProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  message: { type: 'success' | 'error'; message: string } | null;
}

function TenantEmailAddressForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  submitText,
  message,
}: TenantEmailAddressFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target as any;
    let next: any = value;
    if (type === 'checkbox') {
      next = checked;
    }
    setFormData(prev => ({
      ...prev,
      [name]: next,
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tenant-email-from-address" className="block text-sm font-medium text-gray-700 mb-1">
            [From] Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="tenant-email-from-address"
            type="email"
            name="emailAddress"
            value={formData.emailAddress || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Copy-To Email Address
          </label>
          <input
            type="email"
            name="copyToEmailAddress"
            value={formData.copyToEmailAddress || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional CC / copy-to address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reply-To Email Address
          </label>
          <input
            type="email"
            name="replyToEmailAddress"
            value={formData.replyToEmailAddress || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional reply-to address"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-xs ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.message}
        </div>
      )}

      <div className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 space-y-1.5">
        <p>
          <span className="font-semibold">From</span> is required and must be SES-verified.{' '}
          <span className="font-semibold">Copy-To</span> and <span className="font-semibold">Reply-To</span> are
          optional—leave either blank or fill in as needed (see the guide on this page). When set, Copy-To receives a
          copy of sent mail; Reply-To controls where &quot;Reply&quot; goes. From must differ from any optional address
          you provide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Type <span className="text-red-500">*</span>
          </label>
          <select
            name="emailType"
            value={formData.emailType || 'INFO'}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INFO">INFO</option>
            <option value="SALES">SALES</option>
            <option value="TICKETS">TICKETS</option>
            <option value="CONTACT">CONTACT</option>
            <option value="SUPPORT">SUPPORT</option>
            <option value="MARKETING">MARKETING</option>
            <option value="NOREPLY">NOREPLY</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Customer Support, Sales Team"
          />
        </div>
        <div className="flex items-center gap-6 mt-6">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2">Active</span>
          </label>
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault ?? false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2">Default for this type</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional notes about how this address is used"
        />
      </div>

      <div className="flex flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100 mt-4">
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



