'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEdit, FaTrashAlt, FaUpload, FaImages, FaUnlink, FaTicketAlt, FaPercent, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ReactDOM from 'react-dom';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import EventPerformerPosterUploadDialog from '@/components/performers/EventPerformerPosterUploadDialog';
import EventPerformerMediaGallery from '@/components/performers/EventPerformerMediaGallery';
import type { EventFeaturedPerformersDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventFeaturedPerformersServer,
  createEventFeaturedPerformerServer,
  updateEventFeaturedPerformerServer,
  deleteEventFeaturedPerformerServer,
  fetchAvailablePerformersServer,
  associatePerformerWithEventServer,
  disassociatePerformerFromEventServer,
} from './ApiServerActions';

export default function EventPerformersPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [performers, setPerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<EventFeaturedPerformersDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventFeaturedPerformersDTO>>({
    name: '',
    stageName: '',
    role: '',
    bio: '',
    nationality: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    websiteUrl: '',
    portraitImageUrl: '',
    performanceImageUrl: '',
    galleryImageUrls: '',
    performanceDurationMinutes: 1,
    performanceOrder: 0,
    isHeadliner: false,
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    tiktokUrl: '',
    isActive: true,
    priorityRanking: 0,
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state for main performers table
  const [performersPage, setPerformersPage] = useState(0);
  const performersPageSize = 20;

  // Available performers state (tenant-level performers not mapped to this event)
  const [availablePerformers, setAvailablePerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [availablePerformersPage, setAvailablePerformersPage] = useState(0);
  const [availablePerformersTotalPages, setAvailablePerformersTotalPages] = useState(0);
  const [availablePerformersTotalElements, setAvailablePerformersTotalElements] = useState(0);
  const [availablePerformersSearchTerm, setAvailablePerformersSearchTerm] = useState('');

  // Modal states
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);

  // Upload dialog and media gallery states
  const [posterUploadOpen, setPosterUploadOpen] = useState(false);
  const [selectedPerformerForPoster, setSelectedPerformerForPoster] = useState<{ eventId: number; performerId: number; currentPosterUrl?: string } | null>(null);
  const [selectedPerformerForMedia, setSelectedPerformerForMedia] = useState<{ eventId: number; performerId: number } | null>(null);

  // Tooltip state
  const [tooltipPerformer, setTooltipPerformer] = useState<EventFeaturedPerformersDTO | null>(null);
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndPerformers();
      loadAvailablePerformers(0, '');
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndPerformers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load performers for this event
      const performersData = await fetchEventFeaturedPerformersServer(parseInt(eventId));
      setPerformers(performersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event performers');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event performers' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Check for duplicates before creating
      const isDuplicate = performers.some(
        (p) =>
          (formData.email && p.email && p.email.toLowerCase() === formData.email.toLowerCase()) ||
          (formData.name && p.name && formData.name.toLowerCase() === p.name.toLowerCase() &&
           formData.stageName && p.stageName && formData.stageName.toLowerCase() === p.stageName.toLowerCase())
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: 'A performer with this email or name/stage name combination is already associated with this event. Duplicate entries are not allowed.'
        });
        return;
      }

      const performerData = { ...formData, event: { id: parseInt(eventId) } as EventDetailsDTO };
      const newPerformer = await createEventFeaturedPerformerServer(performerData as any);
      setPerformers(prev => [...prev, newPerformer]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload available performers in case this was a duplicate
      await loadAvailablePerformers(availablePerformersPage, availablePerformersSearchTerm);
      // Reload event performers to get fresh data
      await loadEventAndPerformers();
      setToastMessage({ type: 'success', message: 'Performer created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create performer';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: 'A performer with this email or name/stage name combination is already associated with this event. Duplicate entries are not allowed.'
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPerformer) return;

    try {
      setLoading(true);
      const updatedPerformer = await updateEventFeaturedPerformerServer(selectedPerformer.id!, formData);
      setPerformers(prev => prev.map(p => p.id === selectedPerformer.id ? updatedPerformer : p));
      setIsEditModalOpen(false);
      setSelectedPerformer(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Performer updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update performer' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedPerformer) {
      console.log('❌ No selected performer for disassociation');
      return;
    }

    console.log('🔗 Disassociating performer from event:', selectedPerformer);

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociatePerformerFromEventServer(selectedPerformer.id!);

      console.log('✅ Performer disassociated successfully, updating UI');
      setPerformers(prev => prev.filter(p => p.id !== selectedPerformer.id));
      setIsDisassociateModalOpen(false);
      setSelectedPerformer(null);
      // Reload available performers so this performer appears in the available list
      await loadAvailablePerformers(availablePerformersPage, availablePerformersSearchTerm);
      setToastMessage({ type: 'success', message: 'Performer disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Disassociate error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate performer' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerformer) {
      console.log('❌ No selected performer for deletion');
      return;
    }

    console.log('🗑️ Hard deleting performer:', selectedPerformer);

    try {
      setLoading(true);
      console.log('🔄 Calling deleteEventFeaturedPerformerServer with ID:', selectedPerformer.id);
      await deleteEventFeaturedPerformerServer(selectedPerformer.id!);

      console.log('✅ Performer deleted successfully, updating UI');
      setPerformers(prev => prev.filter(p => p.id !== selectedPerformer.id));
      setIsDeleteModalOpen(false);
      setSelectedPerformer(null);
      // Reload available performers in case this performer should now appear
      await loadAvailablePerformers(availablePerformersPage, availablePerformersSearchTerm);
      setToastMessage({ type: 'success', message: 'Performer permanently deleted' });
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete performer' });
    } finally {
      setLoading(false);
    }
  };

  // Load available performers with pagination and search
  const loadAvailablePerformers = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available performers for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availablePerformersData = await fetchAvailablePerformersServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available performers data received:', availablePerformersData);
      setAvailablePerformers(availablePerformersData.content);
      setAvailablePerformersTotalPages(availablePerformersData.totalPages);
      setAvailablePerformersTotalElements(availablePerformersData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available performers:', err);
      setAvailablePerformers([]);
      setAvailablePerformersTotalPages(0);
      setAvailablePerformersTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available performers
  const handleAvailablePerformersSearch = (searchTerm: string) => {
    setAvailablePerformersSearchTerm(searchTerm);
    setAvailablePerformersPage(0);
    loadAvailablePerformers(0, searchTerm);
  };

  // Handle pagination for available performers
  const handleAvailablePerformersPageChange = (page: number) => {
    setAvailablePerformersPage(page);
    loadAvailablePerformers(page, availablePerformersSearchTerm);
  };

  // Handle adding an available performer to this event
  const handleAddPerformerToEvent = async (performer: EventFeaturedPerformersDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding performer to event:', performer);

      // Check if performer is already associated with this event
      const isAlreadyAssociated = performers.some(
        (p) => p.id === performer.id ||
        (p.email && performer.email && p.email.toLowerCase() === performer.email.toLowerCase()) ||
        (p.name && performer.name && p.name.toLowerCase() === performer.name.toLowerCase() &&
         p.stageName && performer.stageName && p.stageName.toLowerCase() === performer.stageName.toLowerCase())
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Performer "${performer.name || performer.stageName}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing performer to associate with this event (don't create duplicate)
      if (!performer.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add performer "${performer.name || performer.stageName}" - performer ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the performer with the event
      console.log('🔄 Associating performer', performer.id, 'with event', eventId);
      await associatePerformerWithEventServer(performer.id, parseInt(eventId));

      // Reload available performers to remove the added one
      await loadAvailablePerformers(availablePerformersPage, availablePerformersSearchTerm);
      // Reload event performers to get fresh data
      await loadEventAndPerformers();

      setToastMessage({ type: 'success', message: `Performer "${performer.name || performer.stageName}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add performer to event:', err);
      const errorMessage = err.message || 'Failed to add performer to event';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Performer "${performer.name || performer.stageName}" is already associated with this event. Duplicate entries are not allowed.`
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
      stageName: '',
      role: '',
      bio: '',
      performanceDescription: '',
      socialMediaLinks: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      performanceOrder: 0,
      isHeadliner: false,
      performanceDuration: 0,
      specialRequirements: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (performer: EventFeaturedPerformersDTO) => {
    setSelectedPerformer(performer);
    setFormData(performer);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (performer: EventFeaturedPerformersDTO) => {
    console.log('🗑️ Opening delete modal for performer:', performer);
    setSelectedPerformer(performer);
    setIsDeleteModalOpen(true);
  };

  const openDisassociateModal = (performer: EventFeaturedPerformersDTO) => {
    console.log('🔗 Opening disassociate modal for performer:', performer);
    setSelectedPerformer(performer);
    setIsDisassociateModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...performers].sort((a, b) => {
      const aVal = a[key as keyof EventFeaturedPerformersDTO];
      const bVal = b[key as keyof EventFeaturedPerformersDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setPerformers(sorted);
  };

  const filteredPerformers = performers.filter(performer =>
    performer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations for main performers table
  const performersTotalPages = Math.ceil(filteredPerformers.length / performersPageSize) || 1;
  const paginatedPerformers = filteredPerformers.slice(
    performersPage * performersPageSize,
    (performersPage + 1) * performersPageSize
  );
  const performersStartEntry = filteredPerformers.length > 0 ? performersPage * performersPageSize + 1 : 0;
  const performersEndEntry = filteredPerformers.length > 0 ? Math.min((performersPage + 1) * performersPageSize, filteredPerformers.length) : 0;

  // Reset to first page when search term or sort changes
  useEffect(() => {
    setPerformersPage(0);
  }, [searchTerm, sortKey, sortDirection]);

  // Ensure current page doesn't exceed total pages after filtering
  useEffect(() => {
    if (performersPage >= performersTotalPages && performersTotalPages > 0) {
      setPerformersPage(Math.max(0, performersTotalPages - 1));
    }
  }, [performersTotalPages]);

  // Tooltip handlers
  const handleNameCellMouseEnter = (performer: EventFeaturedPerformersDTO, event: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const targetElement = event.currentTarget;
    hoverTimeoutRef.current = setTimeout(() => {
      // Check if element still exists and is mounted
      if (!targetElement || !document.body.contains(targetElement)) {
        return;
      }
      try {
        const rect = targetElement.getBoundingClientRect();
        setTooltipAnchorRect(rect);
        setTooltipPerformer(performer);
      } catch (error) {
        console.error('Error getting bounding rect:', error);
      }
    }, 300); // 300ms delay to prevent flickering
  };

  const handleNameCellMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const closeTooltip = () => {
    setTooltipPerformer(null);
    setTooltipAnchorRect(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Tooltip component
  function PerformerDetailsTooltip({ performer, anchorRect, onClose }: {
    performer: EventFeaturedPerformersDTO | null,
    anchorRect: DOMRect | null,
    onClose: () => void
  }) {
    if (!anchorRect || !performer) return null;

    const tooltipWidth = 450;
    const spacing = 12;

    // Always show tooltip to the right of the anchor cell, never above the columns
    let top = anchorRect.top;
    let left = anchorRect.right + spacing;

    // Clamp position to stay within the viewport
    const estimatedHeight = 400;
    if (top + estimatedHeight > window.innerHeight) {
      top = window.innerHeight - estimatedHeight - spacing;
    }
    if (top < spacing) {
      top = spacing;
    }
    if (left + tooltipWidth > window.innerWidth - spacing) {
      left = window.innerWidth - tooltipWidth - spacing;
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
      background: 'white',
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      padding: '16px',
      width: `${tooltipWidth}px`,
      fontSize: '14px',
      maxHeight: '500px',
      overflowY: 'auto',
      transition: 'opacity 0.1s ease-in-out',
    };

    const formatFieldName = (key: string): string => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    };

    const formatValue = (key: string, value: any): string => {
      if (value === null || value === undefined || value === '') return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (key.toLowerCase().includes('date') && value) {
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      }
      return String(value);
    };

    const details = [
      { label: 'Name', value: performer.name },
      { label: 'Stage Name', value: performer.stageName },
      { label: 'Role', value: performer.role },
      { label: 'Email', value: performer.email },
      { label: 'Phone', value: performer.phone },
      { label: 'Nationality', value: performer.nationality },
      { label: 'Date of Birth', value: performer.dateOfBirth },
      { label: 'Bio', value: performer.bio },
      { label: 'Website URL', value: performer.websiteUrl },
      { label: 'Headliner', value: performer.isHeadliner },
      { label: 'Performance Order', value: performer.performanceOrder },
      { label: 'Performance Duration (min)', value: performer.performanceDurationMinutes },
      { label: 'Priority Ranking', value: performer.priorityRanking },
      { label: 'Active', value: performer.isActive },
      { label: 'Facebook URL', value: performer.facebookUrl },
      { label: 'Twitter URL', value: performer.twitterUrl },
      { label: 'Instagram URL', value: performer.instagramUrl },
      { label: 'YouTube URL', value: performer.youtubeUrl },
      { label: 'LinkedIn URL', value: performer.linkedinUrl },
      { label: 'TikTok URL', value: performer.tiktokUrl },
      { label: 'Portrait Image URL', value: performer.portraitImageUrl },
      { label: 'Performance Image URL', value: performer.performanceImageUrl },
      { label: 'Gallery Image URLs', value: performer.galleryImageUrls },
    ].filter(detail => detail.value !== null && detail.value !== undefined && detail.value !== '');

    return ReactDOM.createPortal(
      <div style={style} tabIndex={-1} className="admin-tooltip">
        <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
          <button
            onClick={onClose}
            className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
            aria-label="Close tooltip"
          >
            &times;
          </button>
        </div>
        <div className="font-semibold text-lg mb-4 pb-2 border-b border-gray-200">
          {performer.name || performer.stageName || 'Performer Details'}
        </div>
        <table className="admin-tooltip-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index} className="border-b border-gray-100">
                <th style={{
                  textAlign: 'left',
                  width: '40%',
                  minWidth: '150px',
                  fontWeight: 600,
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  boxSizing: 'border-box',
                  padding: '12px 16px 12px 0',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  {detail.label}
                </th>
                <td style={{
                  textAlign: 'left',
                  width: '60%',
                  padding: '12px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                  wordBreak: 'break-word'
                }}>
                  {typeof detail.value === 'boolean' ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${detail.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {detail.value ? 'Yes' : 'No'}
                    </span>
                  ) : detail.value === null || detail.value === undefined || detail.value === '' ? (
                    <span className="text-gray-400 italic">(empty)</span>
                  ) : (
                    String(detail.value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
      document.body
    );
  }

  const columns: Column<EventFeaturedPerformersDTO>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, performer) => (
        <div
          onMouseEnter={(e) => handleNameCellMouseEnter(performer, e)}
          onMouseLeave={handleNameCellMouseLeave}
          className="cursor-pointer hover:text-blue-600 transition-colors"
          title="Hover to view full details"
        >
          {value || performer.stageName || '-'}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, performer) => {
        const performerId = performer?.id;
        const eventIdNum = parseInt(eventId);
        const currentPosterUrl = performer?.portraitImageUrl || performer?.performanceImageUrl;

        return (
          <div className="flex flex-wrap gap-3 items-start">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(performer);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Edit"
                aria-label="Edit performer details"
                type="button"
              >
                <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Edit</span>
            </div>
            {performerId && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPerformerForPoster({
                        eventId: eventIdNum,
                        performerId,
                        currentPosterUrl,
                      });
                      setPosterUploadOpen(true);
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="Upload"
                    aria-label="Upload banners in this particular event for this performer"
                    type="button"
                  >
                    <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-600 text-center whitespace-nowrap">Upload</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPerformerForMedia({
                        eventId: eventIdNum,
                        performerId,
                      });
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="View Media"
                    aria-label="View all the media files associated with this performer"
                    type="button"
                  >
                    <svg className="text-purple-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-600 text-center whitespace-nowrap">View Media</span>
                </div>
              </>
            )}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDisassociateModal(performer);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Disassociate"
                aria-label="Disassociate this performer with this event"
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
                  openDeleteModal(performer);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Delete"
                aria-label="Permanently delete this performer"
                type="button"
              >
                <svg className="text-red-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Delete</span>
            </div>
          </div>
        );
      }
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
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Event Performers
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage featured performers for this event</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search performers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Performer"
            aria-label="Add Performer"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add Performer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Performers Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Event Performers ({filteredPerformers.length})
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Hover over a performer's name to view detailed information in a tooltip.
            </p>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Action Icons:</strong></p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-700 hover:bg-blue-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaEdit className="text-lg text-white" />
                  </button>
                  <span>Edit performer details</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-500 hover:bg-blue-600 text-white p-3 pointer-events-none" disabled>
                    <FaUpload className="text-lg" />
                  </button>
                  <span>Upload banners in this particular event for this performer</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-purple-500 hover:bg-purple-600 text-white p-3 pointer-events-none" disabled>
                    <FaImages className="text-lg" />
                  </button>
                  <span>View all the media files associated with this performer</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-yellow-500 hover:bg-yellow-600 text-white p-3 pointer-events-none" disabled>
                    <FaUnlink className="text-lg" />
                  </button>
                  <span>Disassociate this performer with this event</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-red-700 hover:bg-red-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaTrashAlt className="text-lg text-white" />
                  </button>
                  <span>Permanently delete this performer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            data={paginatedPerformers}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No performers found for this event"
          />
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setPerformersPage(prev => Math.max(0, prev - 1))}
              disabled={performersPage === 0 || loading}
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
                Page <span className="text-blue-600">{performersPage + 1}</span> of <span className="text-blue-600">{performersTotalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPerformersPage(prev => Math.min(performersTotalPages - 1, prev + 1))}
              disabled={performersPage >= performersTotalPages - 1 || loading}
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
            {filteredPerformers.length > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{performersStartEntry}</span> to <span className="font-bold text-blue-600">{performersEndEntry}</span> of <span className="font-bold text-blue-600">{filteredPerformers.length}</span> performers
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No performers found</span>
                <span className="text-sm text-orange-600">[No performers match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Performers Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Performers to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level performers that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availablePerformers.length > 0 ? (availablePerformersPage * 20) + 1 : 0} to {availablePerformers.length > 0 ? (availablePerformersPage * 20) + availablePerformers.length : 0} of {availablePerformersTotalElements} available performers
          </p>
        </div>

        {/* Search Bar for Available Performers */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available performers..."
                  value={availablePerformersSearchTerm}
                  onChange={(e) => handleAvailablePerformersSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Performers Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availablePerformers.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availablePerformers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available performers found. All tenant performers may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availablePerformers.map((performer) => (
                      <tr key={performer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div
                            onMouseEnter={(e) => handleNameCellMouseEnter(performer, e)}
                            onMouseLeave={handleNameCellMouseLeave}
                            className="cursor-pointer hover:text-blue-600 transition-colors"
                            title="Hover to view full details"
                          >
                            {performer.name || performer.stageName || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {performer.role || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddPerformerToEvent(performer)}
                            className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            data-tooltip="Add"
                            aria-label="Add performer to event"
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

              {/* Pagination for Available Performers - Always visible, matching admin page style */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => handleAvailablePerformersPageChange(availablePerformersPage - 1)}
                    disabled={availablePerformersPage === 0 || loading}
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
                      Page <span className="text-blue-600">{availablePerformersTotalPages === 0 ? 0 : availablePerformersPage + 1}</span> of <span className="text-blue-600">{availablePerformersTotalPages}</span>
                    </span>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handleAvailablePerformersPageChange(availablePerformersPage + 1)}
                    disabled={availablePerformersPage >= availablePerformersTotalPages - 1 || loading}
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
                  {availablePerformersTotalElements > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{(availablePerformersPage * 20) + 1}</span> to <span className="font-bold text-blue-600">{Math.min((availablePerformersPage * 20) + availablePerformers.length, availablePerformersTotalElements)}</span> of <span className="font-bold text-blue-600">{availablePerformersTotalElements}</span> available performers
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No available performers found</span>
                      <span className="text-sm text-orange-600">[All tenant performers are mapped to this event]</span>
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
        title="Add Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Performer"
          eventId={eventId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPerformer(null);
          resetForm();
        }}
        title="Edit Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Performer"
          eventId={eventId}
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedPerformer(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Performer from Event"
        message={`Are you sure you want to remove "${selectedPerformer?.name || selectedPerformer?.stageName || 'this performer'}" from this event? The performer will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPerformer(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Performer"
        message={`Are you sure you want to permanently delete "${selectedPerformer?.name || selectedPerformer?.stageName || 'this performer'}"? This action cannot be undone and will remove the performer from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />

      {/* Poster Upload Dialog */}
      {selectedPerformerForPoster && (
        <EventPerformerPosterUploadDialog
          eventId={selectedPerformerForPoster.eventId}
          performerId={selectedPerformerForPoster.performerId}
          currentPosterUrl={selectedPerformerForPoster.currentPosterUrl}
          isOpen={posterUploadOpen}
          onClose={() => {
            setPosterUploadOpen(false);
            setSelectedPerformerForPoster(null);
          }}
          onUploadSuccess={async (imageUrl) => {
            // Refresh performers to show updated poster
            await loadEventAndPerformers();
            setPosterUploadOpen(false);
            setSelectedPerformerForPoster(null);
          }}
        />
      )}

      {/* Media Gallery Modal */}
      {selectedPerformerForMedia && (
        <Modal
          isOpen={!!selectedPerformerForMedia}
          onClose={() => setSelectedPerformerForMedia(null)}
          title={`Media Gallery - ${performers.find(p => p.id === selectedPerformerForMedia.performerId)?.name || performers.find(p => p.id === selectedPerformerForMedia.performerId)?.stageName || 'Performer'}`}
          size="xl"
        >
          <EventPerformerMediaGallery
            key={`${selectedPerformerForMedia.eventId}-${selectedPerformerForMedia.performerId}`}
            eventId={selectedPerformerForMedia.eventId}
            performerId={selectedPerformerForMedia.performerId}
            showPriorityControls={true}
            allowUpload={true}
            onUploadClick={() => {
              // Refresh gallery after upload by remounting component
              // The component will reload when key changes
              setSelectedPerformerForMedia({
                ...selectedPerformerForMedia,
                eventId: selectedPerformerForMedia.eventId, // Trigger re-render
              });
            }}
            onPriorityChange={async (mediaId, priorityRanking) => {
              // Component handles its own refresh via useEffect
              // This callback is for external notifications if needed
              console.log(`Priority updated for media ${mediaId}: ${priorityRanking}`);
            }}
            onMediaDelete={async (mediaId) => {
              // Component handles its own refresh after delete
              console.log(`Media deleted: ${mediaId}`);
            }}
          />
        </Modal>
      )}

      {/* Tooltip */}
      <PerformerDetailsTooltip
        performer={tooltipPerformer}
        anchorRect={tooltipAnchorRect}
        onClose={closeTooltip}
      />
    </div>
  );
}

// Performer Form Component
interface PerformerFormProps {
  formData: Partial<EventFeaturedPerformersDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventFeaturedPerformersDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  eventId: string;
}

function PerformerForm({ formData, setFormData, onSubmit, loading, submitText, eventId }: PerformerFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
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
            Stage Name
          </label>
          <input
            type="text"
            name="stageName"
            value={formData.stageName || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Order
          </label>
          <input
            type="number"
            name="performanceOrder"
            value={formData.performanceOrder || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Duration (minutes)
          </label>
          <input
            type="number"
            name="performanceDurationMinutes"
            value={formData.performanceDurationMinutes || 1}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isHeadliner"
            checked={formData.isHeadliner || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Is Headliner
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website URL
        </label>
        <input
          type="url"
          name="websiteUrl"
          value={formData.websiteUrl || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Ranking
          </label>
          <input
            type="number"
            name="priorityRanking"
            value={formData.priorityRanking || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Is Active
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facebook URL
          </label>
          <input
            type="url"
            name="facebookUrl"
            value={formData.facebookUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twitter URL
          </label>
          <input
            type="url"
            name="twitterUrl"
            value={formData.twitterUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram URL
          </label>
          <input
            type="url"
            name="instagramUrl"
            value={formData.instagramUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube URL
          </label>
          <input
            type="url"
            name="youtubeUrl"
            value={formData.youtubeUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TikTok URL
          </label>
          <input
            type="url"
            name="tiktokUrl"
            value={formData.tiktokUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      {formData.id && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portrait Image
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="featured-performer"
                imageType="portrait"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.portraitImageUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, portraitImageUrl: url }))}
                onError={(error) => console.error('Portrait upload error:', error)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Image
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="featured-performer"
                imageType="performance"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.performanceImageUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, performanceImageUrl: url }))}
                onError={(error) => console.error('Performance image upload error:', error)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="featured-performer"
                imageType="gallery"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.galleryImageUrls}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, galleryImageUrls: url }))}
                onError={(error) => console.error('Gallery upload error:', error)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
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

