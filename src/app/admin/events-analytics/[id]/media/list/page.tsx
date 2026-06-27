"use client";
import React, { useRef, useState, useEffect, useCallback, useTransition } from "react";
import { EventMediaDTO, EventDetailsDTO } from "@/types";
import { FaEdit, FaTrashAlt, FaUsers, FaPhotoVideo, FaCalendarAlt, FaSave, FaTimes, FaChevronLeft, FaChevronRight, FaTicketAlt, FaUpload, FaBan, FaTags, FaHome, FaPercent } from 'react-icons/fa';
import { deleteMediaServer, editMediaServer, fetchMediaFilteredServer } from '../ApiServerActions';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
import { createPortal } from "react-dom";
import Link from 'next/link';
import { useRouter, useParams } from "next/navigation";
import { Modal } from "@/components/Modal";
import { getTenantId } from '@/lib/env';
import { formatInTimeZone } from 'date-fns-tz';

// Helper function for timezone-aware date formatting
function formatDateInTimezone(dateString: string, timezone: string = 'America/New_York'): string {
  if (!dateString) return 'N/A';
  try {
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  } catch {
    // Fallback to simple date formatting if timezone parsing fails
    return new Date(dateString).toLocaleDateString();
  }
}

// Tooltip component with improved functionality
function MediaDetailsTooltip({ media, anchorRect, onClose, onTooltipMouseEnter, onTooltipMouseLeave, tooltipType, serialNumber }: {
  media: EventMediaDTO | null,
  anchorRect: DOMRect | null,
  onClose: () => void,
  onTooltipMouseEnter: () => void,
  onTooltipMouseLeave: () => void,
  tooltipType: 'officialDocs' | 'uploadedMedia' | null,
  serialNumber?: number
}) {
  if (!media || !anchorRect) return null;
  const entries = Object.entries(media).filter(([key]) => key !== 'fileUrl' && key !== 'preSignedUrl');
  const tooltipWidth = 600; // Increased width
  const thWidth = 200; // Increased column width
  const spacing = 16; // Increased spacing

  // Mobile responsive positioning
  const isMobile = window.innerWidth <= 768;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Mobile positioning - center the tooltip
  if (isMobile) {
    left = Math.max(spacing, (window.innerWidth - tooltipWidth) / 2);
    top = Math.max(spacing, anchorRect.top - 50);
  } else {
    // Desktop positioning - to the right of the anchor
    if (left + tooltipWidth > window.innerWidth) {
      left = anchorRect.left - tooltipWidth - spacing;
    }
  }

  // Clamp position to stay within the viewport
  const estimatedHeight = 400; // Increased height
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left < spacing) {
    left = spacing;
  }
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    width: isMobile ? Math.min(tooltipWidth, window.innerWidth - 32) : tooltipWidth,
    maxWidth: isMobile ? '90vw' : 600,
    maxHeight: isMobile ? '70vh' : 500, // Increased height
    overflowY: 'auto',
    pointerEvents: 'auto',
    background: '#fff',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#3b82f6', // Blue border for better visibility
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)', // Enhanced shadow
    fontSize: 16, // Increased font size
    padding: 20, // Increased padding
    paddingBottom: 20,
  };

  return createPortal(
    <div
      className="admin-tooltip"
      style={style}
      tabIndex={-1}
      onMouseEnter={onTooltipMouseEnter}
      onMouseLeave={onTooltipMouseLeave}
    >
      {/* Header with close button and hint */}
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {serialNumber && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              #{serialNumber}
            </div>
          )}
          <span className="text-sm text-gray-600 font-medium">
            Click the × button to close this dialog
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          <FaTimes />
        </button>
      </div>

      <table className="admin-tooltip-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-gray-100">
              <th style={{
                textAlign: 'left',
                width: thWidth,
                minWidth: thWidth,
                maxWidth: thWidth,
                fontWeight: 600,
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                boxSizing: 'border-box',
                padding: '12px 16px 12px 0',
                fontSize: '14px',
                color: '#374151'
              }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </th>
              <td style={{
                textAlign: 'left',
                width: 'auto',
                padding: '12px 0',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {typeof value === 'boolean' ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value ? 'Yes' : 'No'}
                  </span>
                ) : value instanceof Date ? value.toLocaleString() :
                  (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) && value ? formatDateInTimezone(value, 'America/New_York') :
                    value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

function EventDetailsTable({ event }: { event: EventDetailsDTO | null }) {
  if (!event) {
    return null;
  }

  const details = [
    { label: 'Event ID', value: event.id },
    { label: 'Title', value: event.title },
    { label: 'Start Date', value: formatDateInTimezone(event.startDate, event.timezone) },
    { label: 'End Date', value: formatDateInTimezone(event.endDate, event.timezone) },
    { label: 'Start Time', value: event.startTime || 'N/A' },
    { label: 'End Time', value: event.endTime || 'N/A' },
    { label: 'Description', value: event.description },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {details.map((detail, index) => (
              <tr key={index} className="bg-blue-50 odd:bg-blue-100">
                <td className="px-6 py-3 w-1/4 text-sm font-semibold text-gray-800">{detail.label}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface EditMediaModalProps {
  media: EventMediaDTO;
  onClose: () => void;
  onSave: (updated: Partial<EventMediaDTO>) => void;
  loading: boolean;
}

type MediaCheckboxName = 'isPublic' | 'eventFlyer' | 'isEventManagementOfficialDocument' | 'isHeroImage' | 'isActiveHeroImage' | 'isFeaturedVideo' | 'isHomePageHeroImage' | 'isFeaturedEventImage' | 'isLiveEventImage';

function EditMediaModal({ media, onClose, onSave, loading }: EditMediaModalProps) {
  const [form, setForm] = useState<Partial<EventMediaDTO>>(() => ({
    id: media.id,
    tenantId: media.tenantId,
    title: media.title || '',
    description: media.description || '',
    eventMediaType: media.eventMediaType || '',
    storageType: media.storageType || '',
    fileUrl: media.fileUrl || '',
    contentType: media.contentType,
    fileSize: media.fileSize,
    isPublic: Boolean(media.isPublic),
    eventFlyer: Boolean(media.eventFlyer),
    isEventManagementOfficialDocument: Boolean(media.isEventManagementOfficialDocument),
    preSignedUrl: media.preSignedUrl || '',
    preSignedUrlExpiresAt: media.preSignedUrlExpiresAt,
    altText: media.altText || '',
    displayOrder: media.displayOrder,
    downloadCount: media.downloadCount,
    isFeaturedVideo: Boolean(media.isFeaturedVideo),
    featuredVideoUrl: media.featuredVideoUrl || '',
    isHeroImage: Boolean(media.isHeroImage),
    isActiveHeroImage: Boolean(media.isActiveHeroImage),
    isHomePageHeroImage: Boolean(media.isHomePageHeroImage),
    isFeaturedEventImage: Boolean(media.isFeaturedEventImage),
    isLiveEventImage: Boolean(media.isLiveEventImage),
    eventId: media.eventId,
    uploadedById: media.uploadedById,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
    startDisplayingFromDate: media.startDisplayingFromDate ?
      (typeof media.startDisplayingFromDate === 'string' ?
        media.startDisplayingFromDate :
        new Date(media.startDisplayingFromDate).toISOString().split('T')[0]) : '',
  }));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      const payload = {
        ...form,
        updatedAt: new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(form)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [
              k,
              k === 'startDisplayingFromDate' && (v === '' || v === 'null') ? null :
                k === 'startDisplayingFromDate' && v ? new Date(v as string).toISOString().split('T')[0] :
                  typeof v === 'boolean' ? Boolean(v) : v
            ])
        ),
      };
      await onSave(payload);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  }, [form, onSave, loading]);

  const handleCheckboxChange = useCallback((name: MediaCheckboxName) => {
    setForm(prev => {
      const newValue = !prev[name];
      let updates: Partial<EventMediaDTO> = { [name]: newValue };

      if (name === 'isHeroImage' && !newValue) {
        updates.isActiveHeroImage = false;
      }
      if (name === 'isActiveHeroImage' && newValue) {
        updates.isHeroImage = true;
      }
      if (name === 'isEventManagementOfficialDocument' && newValue) {
        updates.eventFlyer = false;
      }
      if (name === 'eventFlyer' && newValue) {
        updates.isEventManagementOfficialDocument = false;
      }
      if (name === 'isFeaturedVideo' && !newValue) {
        updates.featuredVideoUrl = '';
      }
      return { ...prev, ...updates };
    });
  }, []);

  return (
    <Modal open={true} onClose={onClose} title="Edit Media">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="altText">
              Alt Text
            </label>
            <input
              id="altText"
              type="text"
              value={form.altText || ''}
              onChange={(e) => setForm(prev => ({ ...prev, altText: e.target.value }))}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="startDisplayingFromDate">
              Start Displaying From Date
            </label>
            <input
              id="startDisplayingFromDate"
              type="date"
              value={form.startDisplayingFromDate || ''}
              onChange={(e) => setForm(prev => ({ ...prev, startDisplayingFromDate: e.target.value }))}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to display immediately, or set a future date to schedule when this media should start being displayed.
            </p>
          </div>

          {form.isFeaturedVideo && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="featuredVideoUrl">
                Featured Video URL
              </label>
              <input
                id="featuredVideoUrl"
                type="text"
                value={form.featuredVideoUrl || ''}
                onChange={(e) => setForm(prev => ({ ...prev, featuredVideoUrl: e.target.value }))}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700">
              Media Properties
            </label>
            <div className="custom-grid-table mt-4 p-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[
                { name: 'isPublic' as const, label: 'Public' },
                { name: 'eventFlyer' as const, label: 'Event Flyer' },
                { name: 'isEventManagementOfficialDocument' as const, label: 'Official Doc' },
                { name: 'isHeroImage' as const, label: 'Hero Image' },
                { name: 'isActiveHeroImage' as const, label: 'Active Hero' },
                { name: 'isFeaturedVideo' as const, label: 'Featured Video' },
                { name: 'isHomePageHeroImage' as const, label: 'Home Page Hero' },
                { name: 'isFeaturedEventImage' as const, label: 'Featured Event Image' },
                { name: 'isLiveEventImage' as const, label: 'Live Event Image' },
              ].map(({ name, label }) => (
                <label key={name} className="flex flex-col items-center">
                  <span className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={Boolean(form[name])}
                      onChange={() => handleCheckboxChange(name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="custom-checkbox-tick">
                      {Boolean(form[name]) && (
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                        </svg>
                      )}
                    </span>
                  </span>
                  <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-base font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            title="Cancel"
            aria-label="Cancel"
          >
            <FaBan className="mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            title={loading ? 'Saving...' : 'Save Changes'}
            aria-label={loading ? 'Saving...' : 'Save Changes'}
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function EventMediaListPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params ? (params.id as string) : null;

  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMedia, setEditMedia] = useState<EventMediaDTO | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<EventMediaDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFlyerOnly, setEventFlyerOnly] = useState(false);
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const totalPages = Math.ceil(totalCount / pageSize);

  const [activeTooltip, setActiveTooltip] = useState<{ media: EventMediaDTO, type: 'officialDocs' | 'uploadedMedia', serialNumber: number } | null>(null);
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<DOMRect | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [isCellHovered, setIsCellHovered] = useState(false);
  const [isTooltipClosed, setIsTooltipClosed] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaGridRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchData() {
        if (!eventId) return;
        setLoading(true);
        try {
          const details = await fetchEventDetailsServer(parseInt(eventId, 10));
          setEventDetails(details);

          const mediaResponse = await fetchMediaFilteredServer(eventId, page, pageSize, searchTerm, eventFlyerOnly);
          setMedia(mediaResponse.data);
          setTotalCount(mediaResponse.totalCount);

        } catch (err: any) {
          setError(err.message || 'Failed to fetch data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [eventId, page, pageSize, searchTerm, eventFlyerOnly]);

  function handleCellMouseEnter(media: EventMediaDTO, e: React.MouseEvent<HTMLTableCellElement>, type: 'officialDocs' | 'uploadedMedia', serialNumber: number) {
    // Don't show tooltip if it was recently closed
    if (isTooltipClosed) return;

    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setIsCellHovered(true);
    setTooltipAnchorRect(e.currentTarget.getBoundingClientRect());
    setActiveTooltip({ media, type, serialNumber });
  }

  function handleCellMouseLeave() {
    setIsCellHovered(false);
    // Don't auto-close tooltip - only close on button click
  }

  function handleTooltipMouseEnter() {
    setIsTooltipHovered(true);
  }

  function handleTooltipMouseLeave() {
    setIsTooltipHovered(false);
    // Don't auto-close tooltip - only close on button click
  }

  function handleCloseTooltip() {
    setActiveTooltip(null);
    setTooltipAnchorRect(null);
    setIsTooltipHovered(false);
    setIsCellHovered(false);
    setIsTooltipClosed(true);

    // Scroll to the top of the page to move away from the tooltip area
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // Fallback: scroll to top of window
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Reset the closed state after a delay to allow tooltips again
    setTimeout(() => {
      setIsTooltipClosed(false);
    }, 1500); // 1.5 second delay before allowing tooltips again
  }

  const handleScrollToSerialNumber = () => {
    const serialNumber = parseInt(serialNumberInput, 10);
    if (isNaN(serialNumber) || serialNumber < 1) {
      alert('Please enter a valid serial number (1 or greater)');
      return;
    }

    // Calculate which page the serial number is on
    const targetPage = Math.floor((serialNumber - 1) / pageSize);

    if (targetPage !== page) {
      // If the serial number is on a different page, navigate to that page first
      setPage(targetPage);
      // Wait for the page to load, then scroll to the specific item
      setTimeout(() => {
        scrollToSerialNumberOnPage(serialNumber);
      }, 500);
    } else {
      // If on the same page, scroll directly to the item
      scrollToSerialNumberOnPage(serialNumber);
    }
  }

  const scrollToSerialNumberOnPage = (serialNumber: number) => {
    // Find the element with the specific serial number
    const targetElement = document.querySelector(`[data-serial-number="${serialNumber}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      // Highlight the element briefly
      targetElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        targetElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
      }, 3000);
    } else {
      alert(`Serial number #${serialNumber} not found on the current page. Please check the number and try again.`);
    }
  }

  const handleEditClick = (media: EventMediaDTO) => {
    setEditMedia(media);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditMedia(null);
  };

  const handleSave = async (updated: Partial<EventMediaDTO>) => {
    if (!editMedia || !editMedia.id) return;
    setEditLoading(true);
    try {
      const result = await editMediaServer(editMedia.id, updated);
      setMedia(prev => prev.map(m => m.id === editMedia.id ? { ...m, ...result } : m));
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save media:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (media: EventMediaDTO) => {
    setDeletingMedia(media);
  };

  const confirmDelete = async () => {
    if (!deletingMedia) return;
    startTransition(async () => {
      try {
        await deleteMediaServer(deletingMedia.id!);
        setMedia(prev => prev.filter(m => m.id !== deletingMedia.id));
        setDeletingMedia(null);
      } catch (error: any) {
        alert(`Failed to delete media: ${error.message}`);
        setDeletingMedia(null);
      }
    });
  };

  const sortedMedia = media.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div ref={pageTopRef} className="w-[80%] mx-auto py-8" style={{ paddingTop: '118px' }}>
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
          {eventDetails?.admissionType === 'ticketed' && (
            <>
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
            </>
          )}
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Media Files for Event</h1>
        <div className="flex space-x-2">
          <Link href={`/admin/events/${eventId}/media`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
            <FaUpload />
            Upload New Media
          </Link>
        </div>
      </div>

      <EventDetailsTable event={eventDetails} />

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Search Media</h2>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search by title */}
          <div className="flex-grow">
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Title
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Enter media title to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scroll to serial number */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <label htmlFor="serial-input" className="block text-sm font-medium text-gray-700 mb-1">
                Go to Serial #
              </label>
              <input
                id="serial-input"
                type="number"
                placeholder="e.g., 5"
                value={serialNumberInput}
                onChange={(e) => setSerialNumberInput(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <button
              onClick={handleScrollToSerialNumber}
              className="mt-6 sm:mt-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaUsers />
              Go to Image
            </button>
          </div>

          {/* Event flyers filter */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={eventFlyerOnly}
                  onChange={(e) => setEventFlyerOnly(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="custom-checkbox-tick">
                  {eventFlyerOnly && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-700 select-none">Event Flyers Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className={`mb-4 text-sm border rounded-lg px-4 py-3 ${isTooltipClosed ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{isTooltipClosed ? '⏳' : '💡'} Tip:</span>
          <span>
            {isTooltipClosed
              ? 'Tooltips temporarily disabled. Please wait a moment before hovering over images again.'
              : 'Mouse over an image to see full details. Click the × button to close the tooltip dialog.'
            }
          </span>
        </div>
      </div>

      {loading && <div className="text-center p-8">Loading media...</div>}
      {!loading && sortedMedia.length === 0 && <div className="text-center p-8">No media found for this event.</div>}
      {!loading && sortedMedia.length > 0 && (
        <div ref={mediaGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMedia.map((item, index) => {
            const serialNumber = page * pageSize + index + 1;
            return (
              <div
                key={item.id}
                data-serial-number={serialNumber}
                className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative h-48 bg-gray-200 cursor-pointer"
                    onMouseEnter={(e) => handleCellMouseEnter(item, e as any, 'uploadedMedia', serialNumber)}
                    onMouseLeave={handleCellMouseLeave}
                  >
                    {/* Serial number overlay */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                      #{serialNumber}
                    </div>
                    {item.fileUrl && (
                      <img
                        src={item.fileUrl.startsWith('http') ? item.fileUrl : `https://placehold.co/600x400?text=${item.title}`}
                        alt={item.altText || item.title || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/600x400?text=No+Image`;
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate" title={item.title || ''}>{item.title}</h3>
                    <p className="text-gray-600 text-sm h-10 overflow-hidden" title={item.description || ''}>{item.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full"
                    aria-label="Edit Media"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full"
                    aria-label="Delete Media"
                  >
                    <FaTrashAlt size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FaChevronLeft />
              Previous
            </button>
            <div className="text-sm font-semibold text-gray-700">
              Page {page + 1} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </div>
        </div>
      )}

      {deletingMedia && (
        <Modal open={!!deletingMedia} onClose={() => setDeletingMedia(null)} title="Confirm Deletion">
          <div className="text-center">
            <p className="text-lg">
              Are you sure you want to delete this media item: <strong>{deletingMedia.title}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setDeletingMedia(null)}
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

      {isEditModalOpen && editMedia && (
        <EditMediaModal
          media={editMedia}
          onClose={handleCloseModal}
          onSave={handleSave}
          loading={editLoading}
        />
      )}
      <MediaDetailsTooltip
        media={activeTooltip?.media || null}
        anchorRect={tooltipAnchorRect}
        onClose={handleCloseTooltip}
        onTooltipMouseEnter={handleTooltipMouseEnter}
        onTooltipMouseLeave={handleTooltipMouseLeave}
        tooltipType={activeTooltip?.type || null}
        serialNumber={activeTooltip?.serialNumber}
      />
    </div>
  );
}