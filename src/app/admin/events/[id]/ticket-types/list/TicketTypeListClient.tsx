"use client";
import React, { useState, useTransition, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { FaUsers, FaCalendarAlt, FaTimes, FaPhotoVideo, FaTicketAlt, FaTags } from 'react-icons/fa';
import type { EventDetailsDTO, EventTicketTypeDTO, EventTicketTypeFormDTO } from '@/types';
import { Modal } from '@/components/Modal';
import SaveStatusDialog, { SaveStatus } from '@/components/SaveStatusDialog';
import { createTicketTypeServer, updateTicketTypeServer, deleteTicketTypeServer } from './ApiServerActions';

interface ValidationErrors {
  name?: string;
  code?: string;
  description?: string;
  price?: string;
  availableQuantity?: string;
  maxQuantityPerOrder?: string;
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
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Order Required:</span>
            <span className="font-medium">{ticketType.minQuantityPerOrder ?? 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Maximum Order Required:</span>
            <span className="font-medium">{ticketType.maxQuantityPerOrder != null ? ticketType.maxQuantityPerOrder : 'Unlimited'}</span>
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveStatusMessage, setSaveStatusMessage] = useState<string>('');
  const [saveStatusTitle, setSaveStatusTitle] = useState<string>('');

  const [editingTicketType, setEditingTicketType] = useState<EventTicketTypeDTO | null>(null);
  const [deletingTicketType, setDeletingTicketType] = useState<EventTicketTypeDTO | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Reset page if current page is out of bounds (e.g., after deletion)
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(ticketTypes.length / pageSize));
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [ticketTypes.length, page, pageSize]);

  const [formData, setFormData] = useState<Partial<EventTicketTypeFormDTO>>({});
  const [displayPrice, setDisplayPrice] = useState<string>('');

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
        minQuantityPerOrder: editingTicketType.minQuantityPerOrder,
        maxQuantityPerOrder: editingTicketType.maxQuantityPerOrder,
      });
      setDisplayPrice(editingTicketType.price ? editingTicketType.price.toFixed(2) : '0.00');
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
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 10,
      });
      setDisplayPrice('');
    }
  }, [editingTicketType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

    // Special handling for price field: prefix decimal values with 0
    let processedValue: string | number = value;
    if (name === 'price' && type === 'number') {
      // Convert to string to check if it starts with decimal point
      const stringValue = String(value);
      // If value starts with a decimal point (e.g., ".70"), prefix with "0"
      if (stringValue.startsWith('.')) {
        processedValue = '0' + stringValue;
        // Update the input's value immediately for visual feedback
        e.target.value = processedValue;
        // Convert to number for formData
        processedValue = parseFloat(processedValue) || 0;
      } else if (stringValue === '' || stringValue === '-') {
        // Allow empty or negative sign during typing
        processedValue = stringValue;
      } else {
        // Convert to number for formData
        processedValue = parseFloat(stringValue) || 0;
      }
    }

    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : processedValue }));

    // Clear validation errors when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Real-time validation for maxQuantityPerOrder vs availableQuantity
    if (name === 'maxQuantityPerOrder' || name === 'availableQuantity') {
      const availableQty = Number(name === 'availableQuantity' ? processedValue : formData.availableQuantity);
      const maxQtyPerOrder = Number(name === 'maxQuantityPerOrder' ? processedValue : formData.maxQuantityPerOrder);

      if (availableQty > 0 && maxQtyPerOrder > 0 && maxQtyPerOrder > availableQty) {
        setValidationErrors(prev => ({
          ...prev,
          maxQuantityPerOrder: `Maximum quantity per order (${maxQtyPerOrder}) cannot exceed available quantity (${availableQty}).`
        }));
      } else if (validationErrors.maxQuantityPerOrder?.includes('cannot exceed')) {
        // Clear the error if it's now valid
        setValidationErrors(prev => ({ ...prev, maxQuantityPerOrder: undefined }));
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTicketType(null);
    setValidationErrors({});
    setError(null);
    setSaveStatus('idle');
    setSaveStatusMessage('');
    setSaveStatusTitle('');
  };

  const handleCloseSaveStatus = () => {
    setSaveStatus('idle');
    setSaveStatusMessage('');
    setSaveStatusTitle('');
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
      minQuantityPerOrder: 1,
      maxQuantityPerOrder: 10,
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

  // Validate a single field on blur
  const validateField = (fieldName: keyof ValidationErrors) => {
    const newErrors: ValidationErrors = { ...validationErrors };

    switch (fieldName) {
      case 'name':
        if (!formData.name?.trim()) {
          newErrors.name = 'Name is required.';
        } else {
          // Check for duplicate name
          const isDuplicateName = checkDuplicateName(formData.name.trim(), editingTicketType?.id);
          if (isDuplicateName) {
            newErrors.name = 'A ticket type with this name already exists for this event.';
          } else {
            delete newErrors.name;
          }
        }
        break;

      case 'code':
        if (!formData.code?.trim()) {
          newErrors.code = 'Code is required.';
        } else {
          // Check for duplicate code
          const isDuplicate = checkDuplicateCode(formData.code.trim(), editingTicketType?.id);
          if (isDuplicate) {
            newErrors.code = 'A ticket type with this code already exists for this event.';
          } else {
            delete newErrors.code;
          }
        }
        break;

      case 'description':
        if (!formData.description?.trim()) {
          newErrors.description = 'Description is required.';
        } else {
          delete newErrors.description;
        }
        break;

      case 'price':
        if (Number(formData.price) <= 0) {
          newErrors.price = 'Price must be greater than zero.';
        } else {
          delete newErrors.price;
        }
        break;

      case 'availableQuantity': {
        const availableQty = Number(formData.availableQuantity);
        if (!formData.availableQuantity || availableQty <= 0) {
          newErrors.availableQuantity = 'Available quantity is required and must be greater than zero.';
        } else {
          delete newErrors.availableQuantity;
          // Re-validate maxQuantityPerOrder if it exists
          const maxQtyPerOrder = Number(formData.maxQuantityPerOrder);
          if (maxQtyPerOrder > 0 && maxQtyPerOrder > availableQty) {
            newErrors.maxQuantityPerOrder = `Maximum quantity per order (${maxQtyPerOrder}) cannot exceed available quantity (${availableQty}).`;
          }
        }
        break;
      }

      case 'maxQuantityPerOrder': {
        const maxQtyPerOrder = Number(formData.maxQuantityPerOrder);
        const availableQtyForMax = Number(formData.availableQuantity);
        if (!formData.maxQuantityPerOrder || maxQtyPerOrder <= 0) {
          newErrors.maxQuantityPerOrder = 'Maximum quantity per order is required and must be greater than zero.';
        } else if (availableQtyForMax > 0 && maxQtyPerOrder > availableQtyForMax) {
          newErrors.maxQuantityPerOrder = `Maximum quantity per order (${maxQtyPerOrder}) cannot exceed available quantity (${availableQtyForMax}).`;
        } else {
          delete newErrors.maxQuantityPerOrder;
        }
        break;
      }
    }

    setValidationErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required.';
    if (!formData.code?.trim()) newErrors.code = 'Code is required.';
    if (!formData.description?.trim()) newErrors.description = 'Description is required.';
    if (Number(formData.price) <= 0) newErrors.price = 'Price must be greater than zero.';

    // Available Quantity: Required and must be greater than zero
    const availableQty = Number(formData.availableQuantity);
    if (!formData.availableQuantity || availableQty <= 0) {
      newErrors.availableQuantity = 'Available quantity is required and must be greater than zero.';
    }

    // Maximum Quantity Per Order: Required and must be less than available quantity
    const maxQtyPerOrder = Number(formData.maxQuantityPerOrder);
    if (!formData.maxQuantityPerOrder || maxQtyPerOrder <= 0) {
      newErrors.maxQuantityPerOrder = 'Maximum quantity per order is required and must be greater than zero.';
    } else if (availableQty > 0 && maxQtyPerOrder > availableQty) {
      newErrors.maxQuantityPerOrder = `Maximum quantity per order (${maxQtyPerOrder}) cannot exceed available quantity (${availableQty}).`;
    }

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
    validateField('name');

    // Also check for duplicates if name is not empty
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
        } else {
          // Only clear error if it's not a required field error
          if (validationErrors.name !== 'Name is required.') {
            setValidationErrors(prev => ({ ...prev, name: undefined }));
          }
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
    validateField('code');

    // Also check for duplicates if code is not empty
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
        } else {
          // Only clear error if it's not a required field error
          if (validationErrors.code !== 'Code is required.') {
            setValidationErrors(prev => ({ ...prev, code: undefined }));
          }
        }
        setIsCheckingCode(false);
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[TicketTypeListClient] handleSubmit called');
    console.log('[TicketTypeListClient] Form data:', formData);
    console.log('[TicketTypeListClient] Editing ticket type:', editingTicketType);

    if (!validateForm()) {
      console.log('[TicketTypeListClient] Form validation failed');
      return;
    }

    setError(null);
    setSaveStatus('saving');
    setSaveStatusTitle(editingTicketType ? 'Updating Ticket Type...' : 'Creating Ticket Type...');
    setSaveStatusMessage(editingTicketType ? 'Please wait while we update the ticket type...' : 'Please wait while we create the ticket type...');

    startTransition(async () => {
      console.log('[TicketTypeListClient] Starting transition, isEdit:', !!editingTicketType);

      try {
        const result = editingTicketType
          ? await updateTicketTypeServer(editingTicketType.id!, eventId, formData)
          : await createTicketTypeServer(eventId, formData as EventTicketTypeFormDTO);

        console.log('[TicketTypeListClient] Server action result:', result);

        if (result.success && result.data) {
          console.log('[TicketTypeListClient] Update/create successful, updating state');
          if (editingTicketType) {
            setTicketTypes(prev => prev.map(tt => tt.id === result.data!.id ? result.data! : tt));
            setSaveStatus('success');
            setSaveStatusTitle('Ticket Type Updated!');
            setSaveStatusMessage(`Ticket type "${result.data!.name}" has been updated successfully!`);
          } else {
            setTicketTypes(prev => [...prev, result.data!]);
            setSaveStatus('success');
            setSaveStatusTitle('Ticket Type Created!');
            setSaveStatusMessage(`Ticket type "${result.data!.name}" has been created successfully!`);
          }

          // Close the form modal
          setIsModalOpen(false);
          setEditingTicketType(null);
          setValidationErrors({});
          setError(null);

          // Auto-close success dialog after 2 seconds
          setTimeout(() => {
            setSaveStatus('idle');
            setSaveStatusMessage('');
            setSaveStatusTitle('');
          }, 2000);
        } else {
          console.error('[TicketTypeListClient] Update/create failed:', result.error);
          setError(result.error || 'An unexpected error occurred.');
          setSaveStatus('error');
          setSaveStatusTitle('Save Failed');
          setSaveStatusMessage(result.error || 'Failed to save ticket type. Please try again.');
        }
      } catch (err) {
        console.error('[TicketTypeListClient] Exception in handleSubmit:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while saving.';
        setError(errorMessage);
        setSaveStatus('error');
        setSaveStatusTitle('Save Failed');
        setSaveStatusMessage(errorMessage);
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

  // Pagination calculations
  const totalCount = ticketTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = page + 1; // 1-based for display
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;
  const isPrevDisabled = page === 0;
  const isNextDisabled = page >= totalPages - 1 || totalCount === 0;
  const prevPage = Math.max(0, page - 1);
  const nextPage = page + 1 < totalPages ? page + 1 : page;
  const paginatedTicketTypes = ticketTypes.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800 break-words flex-1 min-w-0">Ticket Types for {eventDetails?.title}</h2>
        <button
          onClick={handleAddNewClick}
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 w-full sm:w-auto whitespace-nowrap"
          title="Add New Ticket Type"
          aria-label="Add New Ticket Type"
          type="button"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Add New Ticket Type</span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTicketTypes && paginatedTicketTypes.length > 0 ? paginatedTicketTypes.map((ticketType) => (
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
                  <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${ticketType.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {ticketType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleEditClick(ticketType)}
                      className="flex flex-col items-center focus:outline-none transition-all duration-300 hover:scale-110"
                      title="Edit Ticket Type"
                      aria-label="Edit Ticket Type"
                      type="button"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ticketType)}
                      className="flex flex-col items-center focus:outline-none transition-all duration-300 hover:scale-110"
                      title="Delete Ticket Type"
                      aria-label="Delete Ticket Type"
                      type="button"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
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
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> ticket types
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No ticket types found</span>
              <span className="text-sm text-orange-600">[Click "Add New Ticket Type" to create one]</span>
            </div>
          )}
        </div>
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
            <div className="mt-6 flex flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setDeletingTicketType(null)}
                disabled={isPending}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Cancel"
                aria-label="Cancel"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Cancel</span>
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Confirm Delete"
                aria-label="Confirm Delete"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  {isPending ? (
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
                <span className="font-semibold text-red-700">{isPending ? 'Deleting...' : 'Confirm Delete'}</span>
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
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base pr-10 ${
                  validationErrors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
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
            <label className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={handleCodeBlur}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base pr-10 ${
                  validationErrors.code
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
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
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              onBlur={() => validateField('description')}
              className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                validationErrors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              rows={3}
            />
            {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price"
                inputMode="decimal"
                value={displayPrice}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  // Update display value immediately to allow free typing
                  setDisplayPrice(inputValue);

                  // If value starts with a decimal point (e.g., ".70"), prefix with "0"
                  let processedValue = inputValue;
                  if (inputValue.startsWith('.')) {
                    processedValue = '0' + inputValue;
                    setDisplayPrice(processedValue);
                  }

                  // Parse and update formData with numeric value
                  if (inputValue === '' || inputValue === '.') {
                    setFormData(prev => ({ ...prev, price: 0 }));
                  } else {
                    const numValue = parseFloat(processedValue);
                    if (!isNaN(numValue)) {
                      setFormData(prev => ({ ...prev, price: numValue }));
                    } else {
                      setFormData(prev => ({ ...prev, price: 0 }));
                    }
                  }

                  // Clear validation errors when user starts typing
                  if (validationErrors.price) {
                    setValidationErrors(prev => ({ ...prev, price: undefined }));
                  }
                }}
                onBlur={(e) => {
                  // Ensure decimal values are properly formatted on blur
                  const value = e.target.value;
                  let finalValue = value;

                  if (value && value.startsWith('.')) {
                    finalValue = '0' + value;
                  }

                  const numValue = parseFloat(finalValue) || 0;
                  setFormData(prev => ({ ...prev, price: numValue }));
                  setDisplayPrice(numValue.toFixed(2));

                  // Validate price on blur
                  validateField('price');
                }}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  validationErrors.price
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                pattern="[0-9]*\.?[0-9]*"
                placeholder="0.00"
                required
              />
              {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Quantity <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity || ''}
                onChange={handleInputChange}
                onBlur={() => validateField('availableQuantity')}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  validationErrors.availableQuantity
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                min="1"
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
          {/* Tip message for min/max quantity */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  <strong className="font-semibold">Tip:</strong> Specify the minimum and maximum number of tickets customers can purchase per order. This helps control ticket sales and prevents bulk purchases.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Quantity Per Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minQuantityPerOrder"
                value={formData.minQuantityPerOrder ?? 1}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                min="1"
                required
              />
              {validationErrors.minQuantityPerOrder && <p className="text-red-500 text-xs mt-1">{validationErrors.minQuantityPerOrder}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Quantity Per Order <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="maxQuantityPerOrder"
                value={formData.maxQuantityPerOrder ?? ''}
                onChange={handleInputChange}
                onBlur={() => validateField('maxQuantityPerOrder')}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  validationErrors.maxQuantityPerOrder
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                min="1"
                required
              />
              {validationErrors.maxQuantityPerOrder && <p className="text-red-500 text-xs mt-1">{validationErrors.maxQuantityPerOrder}</p>}
            </div>
          </div>
          {/* Tip message for Active checkbox */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-amber-700">
                  <strong className="font-semibold">Important:</strong> The <strong>"Active"</strong> checkbox controls whether this ticket type is displayed or hidden on the checkout page. Uncheck to hide it from customers.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  <strong className="font-semibold">Note:</strong> If the remaining quantity is less than 20, the ticket type will automatically be shown as "Sold Out" on the checkout page to avoid race conditions and overselling.
                </p>
              </div>
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

          <div className="flex flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
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
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={editingTicketType ? 'Save Changes' : 'Create Ticket Type'}
              aria-label={editingTicketType ? 'Save Changes' : 'Create Ticket Type'}
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
              <span className="font-semibold text-green-700">{isPending ? (editingTicketType ? 'Saving...' : 'Creating...') : (editingTicketType ? 'Save Changes' : 'Create Ticket Type')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        title={saveStatusTitle}
        message={saveStatusMessage}
        onClose={saveStatus === 'error' ? handleCloseSaveStatus : undefined}
      />
    </div>
  );
}