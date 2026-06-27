'use client';

import React, { useState, useTransition } from 'react';
import type { DiscountCodeDTO, EventDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaPhotoVideo, FaTicketAlt, FaTags, FaPlus, FaEdit, FaTrashAlt, FaSave, FaBan, FaTimes, FaHome, FaUsers, FaCalendarAlt, FaPercent } from 'react-icons/fa';
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
      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaHome className="w-10 h-10 text-gray-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="w-10 h-10 text-blue-500" />
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
              <FaPhotoVideo className="w-10 h-10 text-yellow-500" />
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
              <FaCalendarAlt className="w-10 h-10 text-green-500" />
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Discount Codes for {eventDetails?.title}
            </h1>
            <p className="text-gray-600 mt-1">Manage discount codes for this event</p>
          </div>
          <button
            onClick={handleAddNewClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus className="text-lg" /> Add New Discount Code
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              {discountCodes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{code.code}</div>
                    <div className="text-sm text-gray-500">{code.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.discountType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.discountValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.usesCount} / {code.maxUses || '∞'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(code)} className="text-indigo-600 hover:text-indigo-900 mr-4"><FaEdit className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteClick(code)} className="text-red-600 hover:text-red-900"><FaTrashAlt className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {discountCodes.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No discount codes found for this event.</p>
        )}
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md text-sm transition-colors"
            >
              Generate Code
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
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaBan /> Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'} <FaSave />
          </button>
        </div>
      </form>
    </Modal>
  );
}