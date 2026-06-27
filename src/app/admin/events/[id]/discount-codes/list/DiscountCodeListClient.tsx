'use client';

import React, { useState, useTransition } from 'react';
import type { DiscountCodeDTO, EventDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaPhotoVideo, FaTicketAlt, FaTags, FaTrashAlt, FaTimes } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import { deleteDiscountCodeServer, patchDiscountCodeServer, createDiscountCodeServer } from './ApiServerActions';

interface DiscountCodeListClientProps {
  eventId: string;
  initialDiscountCodes: DiscountCodeDTO[];
  eventDetails: EventDetailsDTO | null;
}

export default function DiscountCodeListClient({
  eventId,
  initialDiscountCodes,
  eventDetails,
}: DiscountCodeListClientProps) {
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeDTO[]>(initialDiscountCodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeDTO | null>(null);
  const [deletingCode, setDeletingCode] = useState<DiscountCodeDTO | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 0-based for calculations
  const pageSize = 10;

  const handleAddNewClick = () => {
    setEditingCode(null);
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (code: DiscountCodeDTO) => {
    setEditingCode(code);
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (code: DiscountCodeDTO) => {
    setError(null);
    setDeletingCode(code);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
    setError(null);
  };

  const confirmDelete = () => {
    if (!deletingCode || typeof deletingCode.id !== 'number') return;

    const idToDelete = deletingCode.id;

    startTransition(async () => {
      try {
        setError(null);
        await deleteDiscountCodeServer(idToDelete);
        setDiscountCodes(prev => prev.filter(c => c.id !== idToDelete));
        setDeletingCode(null);
      } catch (err: any) {
        setError(err.message || 'Failed to delete discount code.');
      }
    });
  };

  const handleSave = (formData: Partial<DiscountCodeDTO>) => {
    startTransition(async () => {
      try {
        setError(null);
        setSuccessMessage(null);
        let updatedCode;
        if (editingCode) {
          // PATCH update via server action
          const payload = {
            ...formData,
            eventId: parseInt(eventId, 10),
            createdAt: editingCode.createdAt, // preserve original
            validFrom: formData.validFrom || undefined,
            validTo: formData.validTo || undefined,
          };
          updatedCode = await patchDiscountCodeServer(editingCode.id!, payload);
          setSuccessMessage(`Discount code "${updatedCode.code}" updated successfully!`);
        } else {
          // CREATE via server action (not direct fetch!)
          // Ensure all required fields are present for the DTO
          const payload = {
            code: formData.code ?? '',
            discountType: formData.discountType ?? '',
            discountValue: formData.discountValue ?? 0,
            eventId: parseInt(eventId, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Optional fields
            description: formData.description,
            maxUses: formData.maxUses,
            usesCount: formData.usesCount,
            isActive: formData.isActive,
            validFrom: formData.validFrom || undefined,
            validTo: formData.validTo || undefined,
          };
          updatedCode = await createDiscountCodeServer(payload, eventId);
          setSuccessMessage(`Discount code "${updatedCode.code}" created successfully!`);
        }

        setDiscountCodes(prev => {
          if (editingCode) {
            return prev.map(c => c.id === updatedCode.id ? updatedCode : c);
          }
          return [...prev, updatedCode];
        });

        handleCloseModal();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error("Save operation failed:", err);
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  // Pagination calculations
  const totalCount = discountCodes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = page + 1; // 1-based for display
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;
  const isPrevDisabled = page === 0;
  const isNextDisabled = page >= totalPages - 1 || totalCount === 0;
  const prevPage = Math.max(0, page - 1);
  const nextPage = page + 1 < totalPages ? page + 1 : page;
  const paginatedCodes = discountCodes.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="max-w-5xl mx-auto px-8" style={{ paddingTop: '118px', paddingBottom: '32px' }}>
      {/* Concise Event Summary */}
      {eventDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
            <div><span className="font-semibold text-gray-600">Event ID:</span> {eventDetails.id}</div>
            <div className="sm:col-span-2"><span className="font-semibold text-gray-600">Title:</span> {eventDetails.title}</div>
            <div><span className="font-semibold text-gray-600">Start Date:</span> {eventDetails.startDate}</div>
            <div><span className="font-semibold text-gray-600">End Date:</span> {eventDetails.endDate || eventDetails.startDate}</div>
            <div><span className="font-semibold text-gray-600">Time:</span> {eventDetails.startTime} {eventDetails.endTime ? `- ${eventDetails.endTime}` : ''}</div>
          </div>
        </div>
      )}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href={`/admin/events/${eventId}/media/list`}
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Media Files"
              aria-label="Manage Media Files"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaPhotoVideo className="w-8 h-8 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Media Files</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/ticket-types/list`}
              className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Ticket Types"
              aria-label="Manage Ticket Types"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaTicketAlt className="w-8 h-8 text-green-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/discount-codes/list`}
              className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Discount Codes"
              aria-label="Manage Discount Codes"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaTags className="w-8 h-8 text-yellow-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 break-words">
              Discount Codes for {eventDetails?.title}
            </h1>
            <p className="text-gray-600 mt-1">Manage discount codes for this event</p>
          </div>
          <button
            onClick={handleAddNewClick}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 w-full sm:w-auto whitespace-nowrap"
            title="Add New Discount Code"
            aria-label="Add New Discount Code"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add New Discount Code</span>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Rainbow Gradient Scrollbar CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .table-scroll-container {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: thin !important;
              scrollbar-color: #EC4899 #FCE7F3 !important; /* Pink thumb, pink track (Firefox) */
              -ms-overflow-style: -ms-autohiding-scrollbar !important;
            }

            /* WebKit browsers (Chrome, Safari, Edge) */
            .table-scroll-container::-webkit-scrollbar {
              height: 20px !important; /* Larger for visibility */
              display: block !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-track {
              background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
              border-radius: 10px !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
              border-radius: 10px !important;
              border: 4px solid #F3F4F6 !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              min-width: 50px !important; /* CRITICAL: Ensures thumb is always visible */
              background-clip: padding-box !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
              border-color: #E5E7EB !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:active {
              background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
              border-color: #D1D5DB !important;
            }

            .table-scroll-container::-webkit-scrollbar-button {
              display: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-corner {
              background: #E0E7FF !important;
            }

            /* Flexbox spacer for right-side centering */
            .table-scroll-container::after {
              content: '';
              display: block;
              width: 100vw; /* Full viewport width of scrollable space */
              height: 1px;
              flex-shrink: 0;
            }

            .table-scroll-container {
              display: flex !important;
            }
          `
        }} />

        {/* Outer wrapper with gradient border */}
        <div className="rounded-lg shadow w-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
          padding: '4px'
        }}>
          {/* Inner scroll container with gradient background */}
          <div
            className="w-full table-scroll-container"
            style={{
              overflowX: 'scroll',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              display: 'flex',
              position: 'relative',
              width: '100%',
              minHeight: '1px',
              scrollbarGutter: 'stable',
              background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
              borderRadius: '8px',
              padding: '20px'
            }}
          >
            {/* Table with semi-transparent white background */}
            <table
              className="divide-y divide-gray-200"
              style={{
                width: 'max-content',
                minWidth: 'fit-content', /* Responsive: fits content naturally */
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.95)', /* Semi-transparent white */
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCodes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{code.code}</div>
                    <div className="text-sm text-gray-500">{code.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.discountType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.discountValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.usesCount} / {code.maxUses || '∞'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEditClick(code)}
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Edit Discount Code"
                          aria-label="Edit Discount Code"
                          type="button"
                      >
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(code)}
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Delete Discount Code"
                          aria-label="Delete Discount Code"
                          type="button"
                      >
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setPage(prevPage)}
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
                Page <span className="text-blue-600">{currentPage}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage(nextPage)}
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
            {totalCount > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> discount codes
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No discount codes found</span>
                <span className="text-sm text-orange-600">[No discount codes match your criteria]</span>
              </div>
        )}
          </div>
        </div>
      </div>

      <DiscountCodeModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        code={editingCode}
        isPending={isPending}
        error={error}
      />

      {deletingCode && (
        <Modal open={!!deletingCode} onClose={() => setDeletingCode(null)} title="Confirm Deletion">
          <div className="text-center">
            <p className="text-lg">
              Are you sure you want to delete the discount code: <strong>{deletingCode.code}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            {error && <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setDeletingCode(null)}
                className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
                disabled={isPending}
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                disabled={isPending}
              >
                <FaTrashAlt /> {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DiscountCodeModal({ open, onClose, onSave, code, isPending, error }: {
  open: boolean,
  onClose: () => void,
  onSave: (code: Partial<DiscountCodeDTO>) => void,
  code: DiscountCodeDTO | null,
  isPending: boolean,
  error: string | null
}) {
  const [formData, setFormData] = useState<Partial<DiscountCodeDTO>>({});

  React.useEffect(() => {
    if (code) {
      // Edit mode - populate with existing data
      setFormData({
        code: code.code || '',
        description: code.description || '',
        discountType: code.discountType || 'PERCENTAGE',
        discountValue: code.discountValue || 0,
        maxUses: code.maxUses || 100,
        isActive: code.isActive !== undefined ? code.isActive : true,
        validFrom: code.validFrom || '',
        validTo: code.validTo || '',
      });
    } else {
      // Add new mode - set clean defaults
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUses: 100,
        isActive: true,
        validFrom: '',
        validTo: '',
      });
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  return (
    <Modal open={open} onClose={onClose} title={code ? 'Edit Discount Code' : 'Add New Discount Code'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

        {/* Code Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code *
            </label>
            <input
              type="text"
              name="code"
              id="code"
              value={formData.code || ''}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., SUMMER2024"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={generateRandomCode}
              className="w-full flex-shrink-0 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              title="Generate Code"
              aria-label="Generate Code"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Generate Code</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Summer sale discount"
          />
        </div>

        {/* Discount Type and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>
            <select
              name="discountType"
              id="discountType"
              value={formData.discountType || 'PERCENTAGE'}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
            </select>
          </div>
          <div>
            <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value *
            </label>
            <div className="relative">
              <input
                type="number"
                name="discountValue"
                id="discountValue"
                value={formData.discountValue || 0}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? 100 : 9999}
                step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {formData.discountType === 'PERCENTAGE' ? '%' : '$'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Max Uses */}
        <div>
          <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Uses
          </label>
          <input
            type="number"
            name="maxUses"
            id="maxUses"
            value={formData.maxUses || 100}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            min="1"
            placeholder="Leave empty for unlimited"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty or set to 0 for unlimited uses</p>
        </div>

        {/* Valid From and Valid To Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Valid From (Optional)
            </label>
            <input
              type="datetime-local"
              name="validFrom"
              id="validFrom"
              value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  validFrom: value ? new Date(value).toISOString() : ''
                }));
              }}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty for no start date restriction</p>
          </div>
          <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1">
              Valid To (Optional)
            </label>
            <input
              type="datetime-local"
              name="validTo"
              id="validTo"
              value={formData.validTo ? new Date(formData.validTo).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  validTo: value ? new Date(value).toISOString() : ''
                }));
              }}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty for no end date restriction</p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={!!formData.isActive}
            onChange={handleChange}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active (Available for use)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
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
            disabled={isPending}
            className="flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={isPending ? 'Saving...' : 'Save'}
            aria-label={isPending ? 'Saving...' : 'Save'}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              {isPending ? (
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
            <span className="font-semibold text-green-700">{isPending ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}