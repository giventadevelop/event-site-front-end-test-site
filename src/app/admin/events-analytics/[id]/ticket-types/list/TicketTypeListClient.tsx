"use client";
import React, { useState, useTransition, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { FaUsers, FaCalendarAlt, FaEdit, FaTrashAlt, FaPlus, FaSave, FaTimes, FaBan, FaPhotoVideo, FaTicketAlt, FaTags } from 'react-icons/fa';
import type { EventDetailsDTO, EventTicketTypeDTO, EventTicketTypeFormDTO } from '@/types';
import { Modal } from '@/components/Modal';
import { createTicketTypeServer, updateTicketTypeServer, deleteTicketTypeServer } from './ApiServerActions';

interface ValidationErrors {
  name?: string;
  code?: string;
  description?: string;
  price?: string;
  availableQuantity?: string;
}

// DetailsTooltip component following the UI style guide
function TicketTypeDetailsTooltip({ ticketType, anchorRect, onClose }: { ticketType: EventTicketTypeDTO, anchorRect: DOMRect | null, onClose: () => void }) {
  if (!anchorRect) return null;

  const spacing = 8;
  const tooltipWidth = 320;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Clamp position to stay within the viewport
  const estimatedHeight = 200;
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    width: tooltipWidth,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '16px',
    maxHeight: '300px',
    overflowY: 'auto'
  };

  return ReactDOM.createPortal(
    <div style={style} className="admin-tooltip">
      {/* Sticky close button */}
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end mb-2">
        <button
          onClick={onClose}
          className="w-8 h-8 text-lg bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          &times;
        </button>
      </div>

      {/* Tooltip content */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{ticketType.name}</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Code:</span>
            <span className="font-medium">{ticketType.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">${ticketType.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium">{ticketType.availableQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sold:</span>
            <span className="font-medium">{ticketType.soldQuantity || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Fee:</span>
            <span className="font-medium">${(ticketType.serviceFee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fee Included:</span>
            <span className="font-medium">{ticketType.isServiceFeeIncluded ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticketType.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {ticketType.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {ticketType.description && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-600 text-xs">Description:</span>
              <p className="text-gray-900 text-xs mt-1">{ticketType.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface TicketTypeListClientProps {
  eventId: string;
  eventDetails: EventDetailsDTO | null;
  ticketTypes: EventTicketTypeDTO[];
}

export default function TicketTypeListClient({ eventId, eventDetails, ticketTypes: initialTicketTypes }: TicketTypeListClientProps) {
  const [ticketTypes, setTicketTypes] = useState<EventTicketTypeDTO[]>(initialTicketTypes || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const [editingTicketType, setEditingTicketType] = useState<EventTicketTypeDTO | null>(null);
  const [deletingTicketType, setDeletingTicketType] = useState<EventTicketTypeDTO | null>(null);

  const [formData, setFormData] = useState<Partial<EventTicketTypeFormDTO>>({});

  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Tooltip state management
  const [hoveredTicketType, setHoveredTicketType] = useState<EventTicketTypeDTO | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (editingTicketType) {
      setFormData({
        name: editingTicketType.name,
        code: editingTicketType.code,
        description: editingTicketType.description,
        price: editingTicketType.price,
        availableQuantity: editingTicketType.availableQuantity,
        isServiceFeeIncluded: editingTicketType.isServiceFeeIncluded,
        serviceFee: editingTicketType.serviceFee,
        isActive: editingTicketType.isActive,
      });
      setIsModalOpen(true);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        price: 0,
        availableQuantity: 0,
        isServiceFeeIncluded: false,
        serviceFee: 0,
        isActive: true,
      });
    }
  }, [editingTicketType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTicketType(null);
    setValidationErrors({});
    setError(null);
  };

  const handleAddNewClick = () => {
    setEditingTicketType(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      price: 0,
      availableQuantity: 100,
      isServiceFeeIncluded: false,
      serviceFee: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (ticketType: EventTicketTypeDTO) => {
    setEditingTicketType(ticketType);
  };

  const handleDeleteClick = (ticketType: EventTicketTypeDTO) => {
    setDeletingTicketType(ticketType);
  };

  const confirmDelete = () => {
    if (!deletingTicketType) return;
    startTransition(async () => {
      try {
        const result = await deleteTicketTypeServer(deletingTicketType.id!, eventId);
        if (result.success) {
          setTicketTypes(prev => prev.filter(tt => tt.id !== deletingTicketType.id));
          setDeletingTicketType(null);
        } else {
          setError(result.error || "Failed to delete ticket type.");
        }
      } catch (err) {
        setError("An unexpected error occurred during deletion.");
      }
    });
  };

  const checkDuplicateCode = (code: string, excludeId?: number): boolean => {
    return ticketTypes.some(tt =>
      tt.code.toLowerCase() === code.toLowerCase() &&
      tt.id !== excludeId
    );
  };

  const checkDuplicateName = (name: string, excludeId?: number): boolean => {
    return ticketTypes.some(tt =>
      tt.name.toLowerCase() === name.toLowerCase() &&
      tt.id !== excludeId
    );
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required.';
    if (!formData.code?.trim()) newErrors.code = 'Code is required.';
    if (!formData.description?.trim()) newErrors.description = 'Description is required.';
    if (Number(formData.price) <= 0) newErrors.price = 'Price must be greater than zero.';
    if (Number(formData.availableQuantity) <= 0) newErrors.availableQuantity = 'Available quantity must be greater than zero.';

    // Check for duplicate name
    if (formData.name?.trim()) {
      const isDuplicateName = checkDuplicateName(formData.name.trim(), editingTicketType?.id);
      if (isDuplicateName) {
        newErrors.name = 'A ticket type with this name already exists for this event.';
      }
    }

    // Check for duplicate code
    if (formData.code?.trim()) {
      const isDuplicate = checkDuplicateCode(formData.code.trim(), editingTicketType?.id);
      if (isDuplicate) {
        newErrors.code = 'A ticket type with this code already exists for this event.';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));

    // Clear existing name error when user starts typing
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleNameBlur = () => {
    // Validate name on blur for immediate feedback
    if (formData.name?.trim()) {
      setIsCheckingCode(true);

      // Simulate a brief delay for better UX
      setTimeout(() => {
        const isDuplicate = checkDuplicateName(formData.name?.trim() || '', editingTicketType?.id);
        if (isDuplicate) {
          setValidationErrors(prev => ({
            ...prev,
            name: 'A ticket type with this name already exists for this event.'
          }));
        }
        setIsCheckingCode(false);
      }, 300);
    }
  };

  const handleCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, code: value }));

    // Clear existing code error when user starts typing
    if (validationErrors.code) {
      setValidationErrors(prev => ({ ...prev, code: '' }));
    }
  };

  const handleCodeBlur = () => {
    // Validate code on blur for immediate feedback
    if (formData.code?.trim()) {
      setIsCheckingCode(true);

      // Simulate a brief delay for better UX
      setTimeout(() => {
        const isDuplicate = checkDuplicateCode(formData.code?.trim() || '', editingTicketType?.id);
        if (isDuplicate) {
          setValidationErrors(prev => ({
            ...prev,
            code: 'A ticket type with this code already exists for this event.'
          }));
        }
        setIsCheckingCode(false);
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);

    startTransition(async () => {
      const result = editingTicketType
        ? await updateTicketTypeServer(editingTicketType.id!, eventId, formData)
        : await createTicketTypeServer(eventId, formData as EventTicketTypeFormDTO);

      if (result.success && result.data) {
        if (editingTicketType) {
          setTicketTypes(prev => prev.map(tt => tt.id === result.data!.id ? result.data! : tt));
        } else {
          setTicketTypes(prev => [...prev, result.data!]);
        }
        handleModalClose();
      } else {
        setError(result.error || 'An unexpected error occurred.');
      }
    });
  };

  // Tooltip mouse event handlers
  const handleMouseEnter = (ticketType: EventTicketTypeDTO, e: React.MouseEvent<HTMLElement>) => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setHoveredTicketType(ticketType);
    setPopoverAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleMouseLeave = () => {
    tooltipTimer.current = setTimeout(() => {
      setHoveredTicketType(null);
    }, 200);
  };

  const closeTooltip = () => {
    setPopoverAnchor(null);
    setHoveredTicketType(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Ticket Types for {eventDetails?.title}</h2>
        <button
          onClick={handleAddNewClick}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add New Ticket Type
        </button>
      </div>

      {/* Hint message */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Ticket types may not be immediately deletable but you can make them inactive by clicking the edit button and unchecking the Active checkbox.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              <strong>Tip:</strong> Hover over the Name, Price, or Available columns to see detailed information about each ticket type.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ticketTypes && ticketTypes.length > 0 ? ticketTypes.map((ticketType) => (
              <tr key={ticketType.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onMouseEnter={(e) => handleMouseEnter(ticketType, e)} onMouseLeave={handleMouseLeave}>
                  {ticketType.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onMouseEnter={(e) => handleMouseEnter(ticketType, e)} onMouseLeave={handleMouseLeave}>
                  ${ticketType.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onMouseEnter={(e) => handleMouseEnter(ticketType, e)} onMouseLeave={handleMouseLeave}>
                  ${(ticketType.serviceFee || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onMouseEnter={(e) => handleMouseEnter(ticketType, e)} onMouseLeave={handleMouseLeave}>
                  {ticketType.availableQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticketType.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {ticketType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => handleEditClick(ticketType)} className="flex flex-col items-center text-blue-600 hover:text-blue-800 focus:outline-none">
                      <FaEdit className="w-7 h-7" />
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">Edit</span>
                    </button>
                    <button onClick={() => handleDeleteClick(ticketType)} className="flex flex-col items-center text-red-600 hover:text-red-800 focus:outline-none">
                      <FaTrashAlt className="w-7 h-7" />
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No ticket types found. Click "Add Ticket Type" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tooltip component */}
      {hoveredTicketType && (
        <div
          onMouseEnter={() => {
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
          }}
          onMouseLeave={() => {
            tooltipTimer.current = setTimeout(() => {
              setHoveredTicketType(null);
            }, 200);
          }}
        >
          <TicketTypeDetailsTooltip
            ticketType={hoveredTicketType}
            anchorRect={popoverAnchor}
            onClose={closeTooltip}
          />
        </div>
      )}

      {deletingTicketType && (
        <Modal
          open={!!deletingTicketType}
          onClose={() => setDeletingTicketType(null)}
          title="Confirm Deletion"
          preventBackdropClose={true}
        >
          <div className="text-center">
            <p className="text-lg">
              Are you sure you want to delete the ticket type: <strong>{deletingTicketType.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setDeletingTicketType(null)}
                className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
                disabled={isPending}
              >
                <FaBan /> Cancel
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

      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        title={editingTicketType ? "Edit Ticket Type" : "Add Ticket Type"}
        preventBackdropClose={true}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base pr-10"
                required
              />
              {isCheckingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <div className="relative">
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={handleCodeBlur}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base pr-10"
                required
              />
              {isCheckingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {validationErrors.code && <p className="text-red-500 text-xs mt-1">{validationErrors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              rows={3}
            />
            {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                min="0"
                step="0.01"
                required
              />
              {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Quantity</label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity || 0}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                min="0"
                required
              />
              {validationErrors.availableQuantity && <p className="text-red-500 text-xs mt-1">{validationErrors.availableQuantity}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Fee</label>
              <input
                type="number"
                name="serviceFee"
                value={formData.serviceFee ? Number(formData.serviceFee).toFixed(2) : '0.00'}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex items-center space-x-8 mt-4">
            <label className="flex flex-col items-center cursor-pointer">
              <span className="relative flex items-center justify-center">
                <input
                  id="isServiceFeeIncluded"
                  name="isServiceFeeIncluded"
                  type="checkbox"
                  checked={!!formData.isServiceFeeIncluded}
                  onChange={handleInputChange}
                  className="custom-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="custom-checkbox-tick">
                  {formData.isServiceFeeIncluded && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[10rem]">
                Service Fee Included
              </span>
            </label>

            <label className="flex flex-col items-center cursor-pointer">
              <span className="relative flex items-center justify-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={!!formData.isActive}
                  onChange={handleInputChange}
                  className="custom-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="custom-checkbox-tick">
                  {formData.isActive && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">
                Active
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
              disabled={isPending}
            >
              <FaBan />
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={isPending}
            >
              <FaSave />
              {isPending ? (editingTicketType ? 'Saving...' : 'Creating...') : (editingTicketType ? 'Save Changes' : 'Create Ticket Type')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}