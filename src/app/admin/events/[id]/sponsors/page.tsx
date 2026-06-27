'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaUserPlus, FaHandshake, FaImage, FaImages, FaUpload, FaUnlink, FaHome, FaUsers, FaCalendarAlt, FaPhotoVideo, FaTags, FaTicketAlt, FaPercent, FaMicrophone, FaAddressBook, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ReactDOM from 'react-dom';
import { getApiBaseUrl } from '@/lib/env';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import EventSponsorPosterUploadDialog from '@/components/sponsors/EventSponsorPosterUploadDialog';
import EventSponsorMediaGallery from '@/components/sponsors/EventSponsorMediaGallery';
import type { EventSponsorsDTO, EventSponsorsJoinDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventSponsorsServer,
  fetchEventSponsorsJoinServer,
  fetchAvailableSponsorsServer,
  createEventSponsorServer,
  createEventSponsorJoinServer,
  updateEventSponsorJoinServer,
  updateEventSponsorServer,
  deleteEventSponsorJoinServer,
  deleteEventSponsorServer,
} from './ApiServerActions';

export default function EventSponsorsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [availableSponsors, setAvailableSponsors] = useState<EventSponsorsDTO[]>([]);
  const [eventSponsors, setEventSponsors] = useState<EventSponsorsJoinDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for main sponsors table
  const [sponsorsPage, setSponsorsPage] = useState(0);
  const sponsorsPageSize = 20;

  // Pagination state for available sponsors
  const [availableSponsorsPage, setAvailableSponsorsPage] = useState(0);
  const [availableSponsorsTotalPages, setAvailableSponsorsTotalPages] = useState(0);
  const [availableSponsorsTotalElements, setAvailableSponsorsTotalElements] = useState(0);
  const [availableSponsorsSearchTerm, setAvailableSponsorsSearchTerm] = useState('');

  // Modal states
  const [isCreateSponsorModalOpen, setIsCreateSponsorModalOpen] = useState(false);
  const [isEditSponsorModalOpen, setIsEditSponsorModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<EventSponsorsJoinDTO | null>(null);
  const [selectedAvailableSponsor, setSelectedAvailableSponsor] = useState<EventSponsorsDTO | null>(null);
  const [selectedSponsorForEdit, setSelectedSponsorForEdit] = useState<EventSponsorsDTO | null>(null);

  // Tooltip state
  const [tooltipSponsor, setTooltipSponsor] = useState<EventSponsorsJoinDTO | null>(null);
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Upload dialog and media gallery states
  const [posterUploadOpen, setPosterUploadOpen] = useState(false);
  const [selectedSponsorForPoster, setSelectedSponsorForPoster] = useState<{ eventId: number; sponsorId: number; eventSponsorsJoinId: number; currentPosterUrl?: string } | null>(null);
  const [selectedSponsorForMedia, setSelectedSponsorForMedia] = useState<{ eventId: number; sponsorId: number } | null>(null);

  // Form state for creating new sponsor join
  const [formData, setFormData] = useState<Partial<EventSponsorsJoinDTO>>({
    event: { id: parseInt(eventId) } as EventDetailsDTO,
    sponsor: undefined,
  });

  // Form state for creating new sponsor
  const [sponsorFormData, setSponsorFormData] = useState<Partial<EventSponsorsDTO>>({
    name: '',
    type: '',
    companyName: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    heroImageUrl: '',
    bannerImageUrl: '',
    priorityRanking: 1,
    isActive: true,
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndSponsors();
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndSponsors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load event sponsors for this specific event
      console.log('🔍 Loading event sponsors for event ID:', eventId);
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      console.log('✅ Loaded', eventSponsorsData.length, 'sponsors for event');
      console.log('🔍 Raw event sponsors data:', JSON.stringify(eventSponsorsData, null, 2));
      setEventSponsors(eventSponsorsData);

      // Load available sponsors (not assigned to this event) for assignment
      try {
        const availableSponsorsData = await fetchAvailableSponsorsServer(
          parseInt(eventId),
          availableSponsorsPage,
          10,
          availableSponsorsSearchTerm
        );
        setAvailableSponsors(availableSponsorsData.content);
        setAvailableSponsorsTotalPages(availableSponsorsData.totalPages);
        setAvailableSponsorsTotalElements(availableSponsorsData.totalElements);
      } catch (sponsorErr) {
        console.warn('Failed to load available sponsors:', sponsorErr);
        // Don't fail the whole page if available sponsors can't be loaded
        setAvailableSponsors([]);
        setAvailableSponsorsTotalPages(0);
        setAvailableSponsorsTotalElements(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event sponsors');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event sponsors' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSponsor = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!sponsorFormData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor name is required' });
        return;
      }

      if (!sponsorFormData.type?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor type is required' });
        return;
      }

      const sponsorData: Omit<EventSponsorsDTO, 'id' | 'createdAt' | 'updatedAt'> = {
        name: sponsorFormData.name!.trim(),
        type: sponsorFormData.type!.trim(),
        companyName: sponsorFormData.companyName?.trim() || undefined,
        tagline: sponsorFormData.tagline?.trim() || undefined,
        description: sponsorFormData.description?.trim() || undefined,
        websiteUrl: sponsorFormData.websiteUrl?.trim() || undefined,
        contactEmail: sponsorFormData.contactEmail?.trim() || undefined,
        contactPhone: sponsorFormData.contactPhone?.trim() || undefined,
        logoUrl: sponsorFormData.logoUrl?.trim() || undefined,
        heroImageUrl: sponsorFormData.heroImageUrl?.trim() || undefined,
        bannerImageUrl: sponsorFormData.bannerImageUrl?.trim() || undefined,
        isActive: sponsorFormData.isActive !== undefined ? sponsorFormData.isActive : true,
        priorityRanking: sponsorFormData.priorityRanking || 1, // Default to 1 if not provided
        facebookUrl: sponsorFormData.facebookUrl?.trim() || undefined,
        twitterUrl: sponsorFormData.twitterUrl?.trim() || undefined,
        linkedinUrl: sponsorFormData.linkedinUrl?.trim() || undefined,
        instagramUrl: sponsorFormData.instagramUrl?.trim() || undefined,
      };

      console.log('🔍 Creating new sponsor:', sponsorData);

      // Step 1: Create the sponsor
      const newSponsor = await createEventSponsorServer(sponsorData);
      setAvailableSponsors(prev => [...prev, newSponsor]);

      // Step 2: Automatically assign the sponsor to this event
      const sponsorJoinData = {
        event: { id: parseInt(eventId) } as EventDetailsDTO,
        sponsor: newSponsor
      };

      // Check if sponsor with same name is already assigned to this event
      const isDuplicate = eventSponsors.some(
        (es) => es.sponsor?.name?.toLowerCase() === sponsorData.name.toLowerCase()
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: `A sponsor with the name "${sponsorData.name}" is already assigned to this event. Duplicate assignments are not allowed.`
        });
        return;
      }

      console.log('🔍 Auto-assigning new sponsor to event:', {
        eventId: parseInt(eventId),
        sponsorId: newSponsor.id,
        sponsorName: newSponsor.name
      });

      const newSponsorJoin = await createEventSponsorJoinServer(sponsorJoinData);
      setEventSponsors(prev => [...prev, newSponsorJoin]);

      setIsCreateSponsorModalOpen(false);
      resetSponsorForm();
      // Reload event sponsors to get fresh data
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Sponsor created and assigned to event successfully' });
    } catch (err: any) {
      console.error('❌ Failed to create sponsor:', err);
      const errorMessage = err.message || 'Failed to create sponsor';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `A sponsor with the name "${sponsorFormData.name || 'this sponsor'}" is already assigned to this event. Duplicate assignments are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSponsor = async () => {
    if (!selectedAvailableSponsor) return;

    try {
      setLoading(true);

      // Check if sponsor is already assigned to this event
      const isAlreadyAssigned = eventSponsors.some(
        (es) => es.sponsor?.id === selectedAvailableSponsor.id
      );

      if (isAlreadyAssigned) {
        setToastMessage({
          type: 'error',
          message: `Sponsor "${selectedAvailableSponsor.name}" is already assigned to this event. Duplicate assignments are not allowed.`
        });
        setIsAssignModalOpen(false);
        setSelectedAvailableSponsor(null);
        return;
      }

      // Create sponsor join record
      const sponsorJoinData = {
        event: { id: parseInt(eventId) } as EventDetailsDTO,
        sponsor: selectedAvailableSponsor
      };

      console.log('🔍 Assigning sponsor to event:', {
        eventId: parseInt(eventId),
        sponsorId: selectedAvailableSponsor.id,
        sponsorName: selectedAvailableSponsor.name
      });

      await createEventSponsorJoinServer(sponsorJoinData);

      // Reload the event sponsors data to ensure we have the latest data with proper sponsor details
      console.log('🔄 Reloading event sponsors after assignment...');
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);

      // Also reload available sponsors to reflect the new assignment
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      setIsAssignModalOpen(false);
      setSelectedAvailableSponsor(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor assigned to event successfully' });
    } catch (err: any) {
      console.error('❌ Failed to assign sponsor:', err);
      const errorMessage = err.message || 'Failed to assign sponsor';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Sponsor "${selectedAvailableSponsor.name}" is already assigned to this event. Duplicate assignments are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      await updateEventSponsorJoinServer(selectedSponsor.id!, formData);

      // Reload the event sponsors data to ensure we have the latest data with proper sponsor details
      console.log('🔄 Reloading event sponsors after edit...');
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);

      // Also reload available sponsors to reflect any changes
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      setIsEditModalOpen(false);
      setSelectedSponsor(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor assignment updated successfully' });
    } catch (err: any) {
      console.error('❌ Failed to update sponsor assignment:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to update sponsor assignment' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      await deleteEventSponsorJoinServer(selectedSponsor.id!);

      // Reload the event sponsors data to ensure we have the latest data
      console.log('🔄 Reloading event sponsors after disassociation...');
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);

      // Also reload available sponsors to reflect the removed assignment
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      setIsDisassociateModalOpen(false);
      setSelectedSponsor(null);
      setToastMessage({ type: 'success', message: 'Sponsor disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Failed to disassociate sponsor from event:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate sponsor from event' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSponsor || !selectedSponsor.sponsor || !selectedSponsor.sponsor.id) return;

    try {
      setLoading(true);
      // Hard delete: Delete the sponsor entity itself (this will cascade delete all join records)
      await deleteEventSponsorServer(selectedSponsor.sponsor.id);

      // Reload the event sponsors data
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      setIsDeleteModalOpen(false);
      setSelectedSponsor(null);
      setToastMessage({ type: 'success', message: 'Sponsor permanently deleted from all events' });
    } catch (err: any) {
      console.error('❌ Failed to delete sponsor:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      event: { id: parseInt(eventId) } as EventDetailsDTO,
      sponsor: undefined,
    });
  };

  const resetSponsorForm = () => {
    setSponsorFormData({
      name: '',
      type: '',
      companyName: '',
      tagline: '',
      description: '',
      websiteUrl: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      heroImageUrl: '',
      bannerImageUrl: '',
      priorityRanking: 1,
      isActive: true,
      facebookUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
    });
  };

  // Load available sponsors with pagination and search
  const loadAvailableSponsors = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available sponsors for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableSponsorsData = await fetchAvailableSponsorsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available sponsors data received:', availableSponsorsData);
      setAvailableSponsors(availableSponsorsData.content);
      setAvailableSponsorsTotalPages(availableSponsorsData.totalPages);
      setAvailableSponsorsTotalElements(availableSponsorsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available sponsors:', err);
      setAvailableSponsors([]);
      setAvailableSponsorsTotalPages(0);
      setAvailableSponsorsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available sponsors
  const handleAvailableSponsorsSearch = (searchTerm: string) => {
    setAvailableSponsorsSearchTerm(searchTerm);
    setAvailableSponsorsPage(0);
    loadAvailableSponsors(0, searchTerm);
  };

  // Handle pagination for available sponsors
  const handleAvailableSponsorsPageChange = (page: number) => {
    setAvailableSponsorsPage(page);
    loadAvailableSponsors(page, availableSponsorsSearchTerm);
  };

  const testApiCall = async () => {
    console.log('🧪 Testing API call for event ID:', eventId);
    try {
      const data = await fetchEventSponsorsJoinServer(parseInt(eventId));
      console.log('🧪 Test API result:', data);
      console.log('🧪 Test API result structure:', JSON.stringify(data, null, 2));
      setToastMessage({ type: 'success', message: `API test successful. Found ${Array.isArray(data) ? data.length : 'unknown'} sponsors. Check console for full data structure.` });
    } catch (error: any) {
      console.error('🧪 Test API error:', error);
      setToastMessage({ type: 'error', message: `API test failed: ${error.message}` });
    }
  };

  const testDirectBackendCall = async () => {
    console.log('🔍 Testing direct backend call for event ID:', eventId);
    try {
      // Test the specific endpoint
      const specificUrl = `${getApiBaseUrl()}/api/event-sponsors-join/event/${eventId}`;
      console.log('🔍 Testing specific URL:', specificUrl);

      const specificResponse = await fetch(specificUrl, {
        headers: {
          'Authorization': `Bearer ${await import('@/lib/api/jwt').then(m => m.getCachedApiJwt())}`,
        },
      });

      console.log('🔍 Specific endpoint response status:', specificResponse.status);
      const specificData = await specificResponse.json();
      console.log('🔍 Specific endpoint data:', JSON.stringify(specificData, null, 2));

      // Test the generic endpoint with query parameters
      const genericUrl = `${getApiBaseUrl()}/api/event-sponsors-join?eventId.equals=${eventId}`;
      console.log('🔍 Testing generic URL:', genericUrl);

      const genericResponse = await fetch(genericUrl, {
        headers: {
          'Authorization': `Bearer ${await import('@/lib/api/jwt').then(m => m.getCachedApiJwt())}`,
        },
      });

      console.log('🔍 Generic endpoint response status:', genericResponse.status);
      const genericData = await genericResponse.json();
      console.log('🔍 Generic endpoint data:', JSON.stringify(genericData, null, 2));

      setToastMessage({
        type: 'success',
        message: `Backend test complete. Specific: ${specificResponse.status}, Generic: ${genericResponse.status}. Check console for details.`
      });
    } catch (error: any) {
      console.error('🔍 Direct backend test error:', error);
      setToastMessage({ type: 'error', message: `Backend test failed: ${error.message}` });
    }
  };

  const openEditModal = (sponsor: EventSponsorsJoinDTO) => {
    setSelectedSponsor(sponsor);
    setFormData({
      event: sponsor.event,
      sponsor: sponsor.sponsor,
    });
    setIsEditModalOpen(true);
  };

  const openDisassociateModal = (sponsor: EventSponsorsJoinDTO) => {
    setSelectedSponsor(sponsor);
    setIsDisassociateModalOpen(true);
  };

  const openDeleteModal = (sponsor: EventSponsorsJoinDTO) => {
    setSelectedSponsor(sponsor);
    setIsDeleteModalOpen(true);
  };

  const openAssignModal = (sponsor: EventSponsorsDTO) => {
    setSelectedAvailableSponsor(sponsor);
    setIsAssignModalOpen(true);
  };

  const openEditSponsorModal = (sponsor: EventSponsorsDTO) => {
    setSelectedSponsorForEdit(sponsor);
    setSponsorFormData(sponsor);
    setIsEditSponsorModalOpen(true);
  };

  const handleEditSponsor = async () => {
    if (!selectedSponsorForEdit) return;

    try {
      setLoading(true);

      // Validate required fields
      if (!sponsorFormData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor name is required' });
        return;
      }

      if (!sponsorFormData.type?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor type is required' });
        return;
      }

      await updateEventSponsorServer(selectedSponsorForEdit.id!, sponsorFormData);

      // Reload available sponsors to reflect changes
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      // Also reload event sponsors in case this sponsor was assigned to this event
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);

      setIsEditSponsorModalOpen(false);
      setSelectedSponsorForEdit(null);
      resetSponsorForm();
      setToastMessage({ type: 'success', message: 'Sponsor updated successfully' });
    } catch (err: any) {
      console.error('❌ Failed to update sponsor:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to update sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...eventSponsors].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (key === 'sponsorName') {
        aVal = a.sponsor?.name;
        bVal = b.sponsor?.name;
      } else if (key === 'sponsorType') {
        aVal = a.sponsor?.type;
        bVal = b.sponsor?.type;
      } else if (key === 'sponsorCompany') {
        aVal = a.sponsor?.companyName;
        bVal = b.sponsor?.companyName;
      } else if (key === 'sponsorEmail') {
        aVal = a.sponsor?.contactEmail;
        bVal = b.sponsor?.contactEmail;
      } else if (key === 'sponsorActive') {
        aVal = a.sponsor?.isActive;
        bVal = b.sponsor?.isActive;
      } else if (key === 'createdAt') {
        aVal = a.createdAt;
        bVal = b.createdAt;
      } else {
        aVal = a[key as keyof EventSponsorsJoinDTO];
        bVal = b[key as keyof EventSponsorsJoinDTO];
      }

      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return direction === 'asc' ? 1 : -1;
      if (bVal === undefined) return direction === 'asc' ? -1 : 1;

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setEventSponsors(sorted);
  };

  const filteredEventSponsors = eventSponsors.filter(sponsor => {
    // Add safety check for sponsor object
    if (!sponsor || !sponsor.sponsor) {
      return false;
    }

    return sponsor.sponsor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.sponsor?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.sponsor?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination calculations for main sponsors table
  const sponsorsTotalPages = Math.ceil(filteredEventSponsors.length / sponsorsPageSize) || 1;
  const paginatedSponsors = filteredEventSponsors.slice(
    sponsorsPage * sponsorsPageSize,
    (sponsorsPage + 1) * sponsorsPageSize
  );
  const sponsorsStartEntry = filteredEventSponsors.length > 0 ? sponsorsPage * sponsorsPageSize + 1 : 0;
  const sponsorsEndEntry = filteredEventSponsors.length > 0 ? Math.min((sponsorsPage + 1) * sponsorsPageSize, filteredEventSponsors.length) : 0;

  // Reset to first page when search term or sort changes
  useEffect(() => {
    setSponsorsPage(0);
  }, [searchTerm, sortKey, sortDirection]);

  // Ensure current page doesn't exceed total pages after filtering
  useEffect(() => {
    if (sponsorsPage >= sponsorsTotalPages && sponsorsTotalPages > 0) {
      setSponsorsPage(Math.max(0, sponsorsTotalPages - 1));
    }
  }, [sponsorsTotalPages, sponsorsPage]);

  // Tooltip handlers
  const handleSponsorNameCellMouseEnter = (sponsor: EventSponsorsJoinDTO, event: React.MouseEvent<HTMLDivElement>) => {
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
        setTooltipSponsor(sponsor);
      } catch (error) {
        console.error('Error getting bounding rect:', error);
      }
    }, 300); // 300ms delay to prevent flickering
  };

  const handleSponsorNameCellMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const closeTooltip = () => {
    setTooltipSponsor(null);
    setTooltipAnchorRect(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Tooltip component
  function SponsorDetailsTooltip({ sponsorJoin, anchorRect, onClose }: {
    sponsorJoin: EventSponsorsJoinDTO | null,
    anchorRect: DOMRect | null,
    onClose: () => void
  }) {
    if (!anchorRect || !sponsorJoin || !sponsorJoin.sponsor) return null;

    const sponsor = sponsorJoin.sponsor;
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

    const details = [
      { label: 'Name', value: sponsor.name },
      { label: 'Type', value: sponsor.type },
      { label: 'Company Name', value: sponsor.companyName },
      { label: 'Tagline', value: sponsor.tagline },
      { label: 'Description', value: sponsor.description },
      { label: 'Website URL', value: sponsor.websiteUrl },
      { label: 'Contact Email', value: sponsor.contactEmail },
      { label: 'Contact Phone', value: sponsor.contactPhone },
      { label: 'Logo URL', value: sponsor.logoUrl },
      { label: 'Hero Image URL', value: sponsor.heroImageUrl },
      { label: 'Banner Image URL', value: sponsor.bannerImageUrl },
      { label: 'Priority Ranking', value: sponsor.priorityRanking },
      { label: 'Active', value: sponsor.isActive },
      { label: 'Facebook URL', value: sponsor.facebookUrl },
      { label: 'Twitter URL', value: sponsor.twitterUrl },
      { label: 'LinkedIn URL', value: sponsor.linkedinUrl },
      { label: 'Instagram URL', value: sponsor.instagramUrl },
      { label: 'Assigned Date', value: sponsorJoin.createdAt ? new Date(sponsorJoin.createdAt).toLocaleDateString() : null },
    ].filter(detail => detail.value !== null && detail.value !== undefined && detail.value !== '');

    return ReactDOM.createPortal(
      <div style={style} tabIndex={-1} className="admin-tooltip">
        <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
          <button
            onClick={onClose}
            className="w-8 h-8 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
            aria-label="Close tooltip"
          >
            &times;
          </button>
        </div>
        <div className="font-semibold text-lg mb-4 pb-2 border-b border-gray-200">
          {sponsor.name || 'Sponsor Details'}
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

  const columns: Column<EventSponsorsJoinDTO>[] = [
    {
      key: 'sponsorName',
      label: 'Sponsor Name',
      sortable: true,
      render: (value, row) => (
        <div
          onMouseEnter={(e) => handleSponsorNameCellMouseEnter(row, e)}
          onMouseLeave={handleSponsorNameCellMouseLeave}
          className="cursor-pointer hover:text-blue-600 transition-colors"
          title="Hover to view full details"
        >
          {row?.sponsor?.name || '-'}
        </div>
      )
    },
    {
      key: 'sponsorType',
      label: 'Type',
      sortable: true,
      render: (value, row) => row?.sponsor?.type || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => {
        const sponsorId = row?.sponsor?.id;
        const eventIdNum = parseInt(eventId);
        const currentPosterUrl = row?.customPosterUrl;

        return (
          <div className="flex flex-wrap gap-3 items-start">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(row);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Edit"
                aria-label="Edit sponsor details"
                type="button"
              >
                <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <span className="text-xs text-gray-600 text-center whitespace-nowrap">Edit</span>
            </div>
            {sponsorId && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSponsorForPoster({
                        eventId: eventIdNum,
                        sponsorId,
                        eventSponsorsJoinId: row?.id || 0,
                        currentPosterUrl,
                      });
                      setPosterUploadOpen(true);
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="Upload"
                    aria-label="Upload banners in this particular event for this sponsor"
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
                      setSelectedSponsorForMedia({
                        eventId: eventIdNum,
                        sponsorId,
                      });
                    }}
                    className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    data-tooltip="View Media"
                    aria-label="View all the media files associated with this sponsor"
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
                  openDisassociateModal(row);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Disassociate"
                aria-label="Disassociate this sponsor with this event"
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
                  openDeleteModal(row);
                }}
                className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-tooltip="Delete"
                aria-label="Permanently delete this sponsor"
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Event Sponsors
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage sponsor assignments for this specific event only</p>
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
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaCalendarAlt className="w-8 h-8 text-green-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/ticket-types/list`}
            className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Ticket Types"
            aria-label="Manage Ticket Types"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaTags className="w-8 h-8 text-purple-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/tickets/list`}
            className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Tickets"
            aria-label="Manage Tickets"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaTicketAlt className="w-8 h-8 text-teal-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Tickets</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/discount-codes/list`}
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Discount Codes"
            aria-label="Manage Discount Codes"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaPercent className="w-8 h-8 text-pink-500" />
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
              className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Featured Performers"
              aria-label="Featured Performers"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaMicrophone className="w-8 h-8 text-pink-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Featured Performers</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/contacts`}
              className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Event Contacts"
              aria-label="Event Contacts"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaAddressBook className="w-8 h-8 text-emerald-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Contacts</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/sponsors`}
              className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Event Sponsors"
              aria-label="Event Sponsors"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="w-8 h-8 text-amber-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Sponsors</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/emails`}
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Event Emails"
              aria-label="Event Emails"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-8 h-8 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Emails</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/program-directors`}
              className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Program Directors"
              aria-label="Program Directors"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaUserTie className="w-8 h-8 text-indigo-500" />
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
                placeholder="Search event sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateSponsorModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Sponsor"
            aria-label="Add Sponsor"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add Sponsor</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Event Sponsors Section - Moved to top */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Event Sponsors ({filteredEventSponsors.length})
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Hover over a sponsor's name to view detailed information in a tooltip.
            </p>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Action Icons:</strong></p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-500 hover:bg-blue-600 text-white p-3 pointer-events-none" disabled>
                    <FaUpload className="text-lg" />
                  </button>
                  <span>Upload banners in this particular event for this sponsor</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-purple-500 hover:bg-purple-600 text-white p-3 pointer-events-none" disabled>
                    <FaImages className="text-lg" />
                  </button>
                  <span>View all the media files associated with this sponsor</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-yellow-500 hover:bg-yellow-600 text-white p-3 pointer-events-none" disabled>
                    <FaUnlink className="text-lg" />
                  </button>
                  <span>Disassociate this sponsor with this event</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            data={paginatedSponsors || []}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No sponsors assigned to this event yet. Assign sponsors from the available sponsors below."
          />
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setSponsorsPage(prev => Math.max(0, prev - 1))}
              disabled={sponsorsPage === 0 || loading}
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
                Page <span className="text-blue-600">{sponsorsPage + 1}</span> of <span className="text-blue-600">{sponsorsTotalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setSponsorsPage(prev => Math.min(sponsorsTotalPages - 1, prev + 1))}
              disabled={sponsorsPage >= sponsorsTotalPages - 1 || loading}
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
            {filteredEventSponsors.length > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{sponsorsStartEntry}</span> to <span className="font-bold text-blue-600">{sponsorsEndEntry}</span> of <span className="font-bold text-blue-600">{filteredEventSponsors.length}</span> sponsors
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No sponsors found</span>
                <span className="text-sm text-orange-600">[No sponsors match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Sponsors Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Available Sponsors to Assign</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select from existing sponsors to assign them to this event, or create a new sponsor.
              Showing {availableSponsors.length > 0 ? (availableSponsorsPage * 20) + 1 : 0} to {availableSponsors.length > 0 ? (availableSponsorsPage * 20) + availableSponsors.length : 0} of {availableSponsorsTotalElements} available sponsors
            </p>
          </div>
          <button
            onClick={() => setIsCreateSponsorModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Create New Sponsor"
            aria-label="Create New Sponsor"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">Create New Sponsor</span>
          </button>
        </div>

        {/* Search Bar for Available Sponsors */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available sponsors..."
                  value={availableSponsorsSearchTerm}
                  onChange={(e) => handleAvailableSponsorsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableSponsors.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableSponsors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available sponsors found. All tenant sponsors may already be mapped to this event.
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
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableSponsors.map((sponsor) => (
                      <tr key={sponsor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div
                            onMouseEnter={(e) => {
                              // Create a temporary join object for tooltip
                              const tempJoin: EventSponsorsJoinDTO = {
                                id: null,
                                sponsor: sponsor,
                                event: { id: parseInt(eventId) } as EventDetailsDTO,
                                createdAt: null,
                                updatedAt: null,
                              };
                              handleSponsorNameCellMouseEnter(tempJoin, e);
                            }}
                            onMouseLeave={handleSponsorNameCellMouseLeave}
                            className="cursor-pointer hover:text-blue-600 transition-colors"
                            title="Hover to view full details"
                          >
                            {sponsor.name || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sponsor.type || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditSponsorModal(sponsor)}
                              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                              data-tooltip="Edit"
                              aria-label="Edit sponsor"
                              type="button"
                            >
                              <svg className="text-blue-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openAssignModal(sponsor)}
                              className="instant-tooltip flex-shrink-0 w-14 h-14 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                              data-tooltip="Assign"
                              title="Assign sponsor to event"
                              aria-label="Assign sponsor to event"
                              type="button"
                            >
                              <svg className="text-green-600 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Available Sponsors - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableSponsorsPageChange(availableSponsorsPage - 1)}
                    disabled={availableSponsorsPage === 0 || loading}
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
                      Page <span className="text-blue-600">{availableSponsorsTotalPages === 0 ? 0 : availableSponsorsPage + 1}</span> of <span className="text-blue-600">{availableSponsorsTotalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleAvailableSponsorsPageChange(availableSponsorsPage + 1)}
                    disabled={availableSponsorsPage >= availableSponsorsTotalPages - 1 || loading}
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
                  {availableSponsorsTotalElements > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{(availableSponsorsPage * 20) + 1}</span> to <span className="font-bold text-blue-600">{Math.min((availableSponsorsPage * 20) + availableSponsors.length, availableSponsorsTotalElements)}</span> of <span className="font-bold text-blue-600">{availableSponsorsTotalElements}</span> available sponsors
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No available sponsors found</span>
                      <span className="text-sm text-orange-600">[All tenant sponsors are mapped to this event]</span>
                    </div>
                  )}
                </div>
              </div>

              {availableSponsors.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <FaUserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Sponsors</h3>
                    <p className="text-gray-500 mb-4">
                      {availableSponsorsSearchTerm
                        ? `No sponsors found matching "${availableSponsorsSearchTerm}".`
                        : 'All sponsors are already assigned to this event or no sponsors exist.'
                      }
                    </p>
                    <button
                      onClick={() => setIsCreateSponsorModalOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Create New Sponsor
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {/* Assign Sponsor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedAvailableSponsor(null);
          resetForm();
        }}
        title={`Assign Sponsor: ${selectedAvailableSponsor?.name}`}
        size="lg"
      >
        <SponsorJoinForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAssignSponsor}
          onCancel={() => {
            setIsAssignModalOpen(false);
            setSelectedAvailableSponsor(null);
            resetForm();
          }}
          loading={loading}
          submitText="Assign Sponsor"
          selectedSponsor={selectedAvailableSponsor}
        />
      </Modal>

      {/* Edit Sponsor Join Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSponsor(null);
          resetForm();
        }}
        title="Edit Sponsor Assignment"
        size="lg"
      >
        <SponsorJoinForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedSponsor(null);
            resetForm();
          }}
          loading={loading}
          submitText="Update Assignment"
          selectedSponsor={selectedSponsor?.sponsor}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSponsor(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Sponsor"
        message={`Are you sure you want to permanently delete "${selectedSponsor?.sponsor?.name || 'this sponsor'}"? This action cannot be undone and will remove the sponsor from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedSponsor(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Sponsor from Event"
        message={`Are you sure you want to remove "${selectedSponsor?.sponsor?.name || 'this sponsor'}" from this event? The sponsor will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Create New Sponsor Modal */}
      <Modal
        isOpen={isCreateSponsorModalOpen}
        onClose={() => {
          setIsCreateSponsorModalOpen(false);
          resetSponsorForm();
        }}
        title="Create New Sponsor"
        size="lg"
      >
        <SponsorForm
          formData={sponsorFormData}
          setFormData={setSponsorFormData}
          onSubmit={handleCreateSponsor}
          onCancel={() => {
            setIsCreateSponsorModalOpen(false);
            resetSponsorForm();
          }}
          loading={loading}
          submitText="Create Sponsor"
          eventId={eventId}
        />
      </Modal>

      {/* Edit Sponsor Modal */}
      <Modal
        isOpen={isEditSponsorModalOpen}
        onClose={() => {
          setIsEditSponsorModalOpen(false);
          setSelectedSponsorForEdit(null);
          resetSponsorForm();
        }}
        title={`Edit Sponsor: ${selectedSponsorForEdit?.name || ''}`}
        size="lg"
      >
        <SponsorForm
          formData={sponsorFormData}
          setFormData={setSponsorFormData}
          onSubmit={handleEditSponsor}
          onCancel={() => {
            setIsEditSponsorModalOpen(false);
            setSelectedSponsorForEdit(null);
            resetSponsorForm();
          }}
          loading={loading}
          submitText="Update Sponsor"
          eventId={eventId}
        />
      </Modal>

      {/* Tooltip */}
      <SponsorDetailsTooltip
        sponsorJoin={tooltipSponsor}
        anchorRect={tooltipAnchorRect}
        onClose={closeTooltip}
      />

      {/* Custom Poster Upload Dialog */}
      {selectedSponsorForPoster && (
        <EventSponsorPosterUploadDialog
          eventId={selectedSponsorForPoster.eventId}
          sponsorId={selectedSponsorForPoster.sponsorId}
          eventSponsorsJoinId={selectedSponsorForPoster.eventSponsorsJoinId}
          currentPosterUrl={selectedSponsorForPoster.currentPosterUrl}
          isOpen={posterUploadOpen}
          onClose={() => {
            setPosterUploadOpen(false);
            setSelectedSponsorForPoster(null);
          }}
          onUploadSuccess={async (imageUrl) => {
            // Refresh event sponsors to show updated poster
            await loadEventAndSponsors();
            setPosterUploadOpen(false);
            setSelectedSponsorForPoster(null);
          }}
        />
      )}

      {/* Media Gallery Modal */}
      {selectedSponsorForMedia && (
        <Modal
          isOpen={!!selectedSponsorForMedia}
          onClose={() => setSelectedSponsorForMedia(null)}
          title={`Media Gallery - ${eventSponsors.find(s => s.sponsor?.id === selectedSponsorForMedia.sponsorId)?.sponsor?.name || 'Sponsor'}`}
          size="xl"
        >
          <EventSponsorMediaGallery
            key={`${selectedSponsorForMedia.eventId}-${selectedSponsorForMedia.sponsorId}`}
            eventId={selectedSponsorForMedia.eventId}
            sponsorId={selectedSponsorForMedia.sponsorId}
            showPriorityControls={true}
            allowUpload={true}
            onUploadClick={() => {
              // Refresh gallery after upload by remounting component
              // The component will reload when key changes
              setSelectedSponsorForMedia({
                ...selectedSponsorForMedia,
                eventId: selectedSponsorForMedia.eventId, // Trigger re-render
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
    </div>
  );
}

// Sponsor Join Form Component
interface SponsorJoinFormProps {
  formData: Partial<EventSponsorsJoinDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsJoinDTO>>>;
  onSubmit: () => void;
  onCancel?: () => void;
  loading: boolean;
  submitText: string;
  selectedSponsor?: EventSponsorsDTO | null;
}

function SponsorJoinForm({ formData, setFormData, onSubmit, onCancel, loading, submitText, selectedSponsor }: SponsorJoinFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sponsor Information Display */}
      {selectedSponsor && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sponsor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-900">{selectedSponsor.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-900">{selectedSponsor.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <p className="text-sm text-gray-900">{selectedSponsor.companyName || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <p className="text-sm text-gray-900">{selectedSponsor.contactEmail || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaHandshake className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {selectedSponsor ? 'Assign Sponsor to Event' : 'Update Sponsor Assignment'}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              {selectedSponsor ? (
                <p>This will assign <strong>{selectedSponsor.name}</strong> to the current event. The sponsor will be visible on the event page and can be managed from this event's sponsor list.</p>
              ) : (
                <p>This will update the sponsor assignment for the current event.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
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
          <span className="font-semibold text-green-700">{loading ? 'Processing...' : submitText}</span>
        </button>
      </div>
    </form>
  );
}

// Sponsor Form Component
interface SponsorFormProps {
  formData: Partial<EventSponsorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsDTO>>>;
  onSubmit: () => void;
  onCancel?: () => void;
  loading: boolean;
  submitText: string;
  eventId: string;
}

function SponsorForm({ formData, setFormData, onSubmit, onCancel, loading, submitText, eventId }: SponsorFormProps) {
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

  const sponsorTypes = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
    'Community Partner',
    'Media Partner',
    'Food & Beverage',
    'Entertainment',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sponsor Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter sponsor name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select sponsor type</option>
            {sponsorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Ranking *
          </label>
          <input
            type="number"
            name="priorityRanking"
            value={formData.priorityRanking || 1}
            onChange={handleChange}
            min="1"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter priority ranking (1 = highest priority)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers indicate higher priority (1 = highest priority)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact phone"
          />
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
            placeholder="https://example.com"
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
            Active Sponsor
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tagline
        </label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline || ''}
          onChange={handleChange}
          maxLength={500}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter sponsor tagline (max 500 characters)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter detailed description about the sponsor"
        />
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
            placeholder="https://facebook.com/sponsor"
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
            placeholder="https://twitter.com/sponsor"
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
            placeholder="https://linkedin.com/company/sponsor"
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
            placeholder="https://instagram.com/sponsor"
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
                Logo Image
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="sponsor"
                imageType="logo"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.logoUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
                onError={(error) => console.error('Logo upload error:', error)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="sponsor"
                imageType="hero"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.heroImageUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, heroImageUrl: url }))}
                onError={(error) => console.error('Hero image upload error:', error)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <ImageUpload
                entityId={formData.id}
                entityType="sponsor"
                imageType="banner"
                eventId={parseInt(eventId)}
                currentImageUrl={formData.bannerImageUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, bannerImageUrl: url }))}
                onError={(error) => console.error('Banner upload error:', error)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
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
