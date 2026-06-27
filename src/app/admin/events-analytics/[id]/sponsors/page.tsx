'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaUserPlus, FaHandshake, FaBan, FaFolderOpen, FaHome, FaUsers, FaCalendarAlt, FaPhotoVideo, FaTags, FaTicketAlt, FaPercent } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import type { EventSponsorsDTO, EventSponsorsJoinDTO, EventDetailsDTO } from '@/types';
import { getApiBaseUrl } from '@/lib/env';
import {
  fetchEventSponsorsServer,
  fetchEventSponsorsJoinServer,
  fetchAvailableSponsorsServer,
  createEventSponsorServer,
  createEventSponsorJoinServer,
  updateEventSponsorJoinServer,
  updateEventSponsorServer,
  deleteEventSponsorJoinServer,
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<EventSponsorsJoinDTO | null>(null);
  const [selectedAvailableSponsor, setSelectedAvailableSponsor] = useState<EventSponsorsDTO | null>(null);
  const [selectedSponsorForEdit, setSelectedSponsorForEdit] = useState<EventSponsorsDTO | null>(null);

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

      console.log('🔍 Auto-assigning new sponsor to event:', {
        eventId: parseInt(eventId),
        sponsorId: newSponsor.id,
        sponsorName: newSponsor.name
      });

      const newSponsorJoin = await createEventSponsorJoinServer(sponsorJoinData);
      setEventSponsors(prev => [...prev, newSponsorJoin]);

      setIsCreateSponsorModalOpen(false);
      resetSponsorForm();
      setToastMessage({ type: 'success', message: 'Sponsor created and assigned to event successfully' });
    } catch (err: any) {
      console.error('❌ Failed to create sponsor:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to create sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSponsor = async () => {
    if (!selectedAvailableSponsor) return;

    try {
      setLoading(true);

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
      setToastMessage({ type: 'error', message: err.message || 'Failed to assign sponsor' });
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

  const handleDelete = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      await deleteEventSponsorJoinServer(selectedSponsor.id!);

      // Reload the event sponsors data to ensure we have the latest data
      console.log('🔄 Reloading event sponsors after deletion...');
      const eventSponsorsData = await fetchEventSponsorsJoinServer(parseInt(eventId));
      setEventSponsors(eventSponsorsData);

      // Also reload available sponsors to reflect the removed assignment
      await loadAvailableSponsors(availableSponsorsPage, availableSponsorsSearchTerm);

      setIsDeleteModalOpen(false);
      setSelectedSponsor(null);
      setToastMessage({ type: 'success', message: 'Sponsor removed from event successfully' });
    } catch (err: any) {
      console.error('❌ Failed to remove sponsor from event:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to remove sponsor from event' });
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

  const columns: Column<EventSponsorsJoinDTO>[] = [
    {
      key: 'sponsorName',
      label: 'Sponsor Name',
      sortable: true,
      render: (value, row) => row?.sponsor?.name || '-'
    },
    {
      key: 'sponsorType',
      label: 'Type',
      sortable: true,
      render: (value, row) => row?.sponsor?.type || '-'
    },
    {
      key: 'sponsorCompany',
      label: 'Company',
      sortable: true,
      render: (value, row) => row?.sponsor?.companyName || '-'
    },
    {
      key: 'sponsorEmail',
      label: 'Contact Email',
      sortable: true,
      render: (value, row) => row?.sponsor?.contactEmail || '-'
    },
    {
      key: 'sponsorActive',
      label: 'Active',
      sortable: true,
      render: (value, row) => row?.sponsor?.isActive ? 'Yes' : 'No'
    },
    {
      key: 'createdAt',
      label: 'Assigned Date',
      sortable: true,
      render: (value, row) => row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'
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
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href={`/admin/events/${eventId}/edit`}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Event
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event Sponsors
              {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
            </h1>
            <p className="text-gray-600">Manage sponsor assignments for this specific event only</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={testApiCall}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 hover:bg-purple-700 transition"
          >
            🧪 Test API
          </button>
          <button
            onClick={testDirectBackendCall}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 hover:bg-orange-700 transition"
          >
            🔍 Test Backend
          </button>
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
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Event Sponsors Section - Moved to top */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Event Sponsors for this Event Event ID {eventId} ({filteredEventSponsors.length})
        </h2>
        <DataTable
          data={filteredEventSponsors || []}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No sponsors assigned to this event yet. Assign sponsors from the available sponsors below."
        />
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow font-bold flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FaPlus />
            Create New Sponsor
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSponsors.map((sponsor) => (
                  <div key={sponsor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{sponsor.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditSponsorModal(sponsor)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openAssignModal(sponsor)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{sponsor.type || 'No type set'}</p>
                    <p className="text-sm text-gray-500">{sponsor.companyName || 'No company name'}</p>
                    <p className="text-sm text-gray-500">{sponsor.contactEmail || 'No contact email'}</p>
                  </div>
                ))}
              </div>

              {/* Pagination for Available Sponsors */}
              {availableSponsorsTotalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAvailableSponsorsPageChange(availableSponsorsPage - 1)}
                      disabled={availableSponsorsPage === 0}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, availableSponsorsTotalPages) }, (_, i) => {
                        const pageNum = availableSponsorsPage < 3 ? i : availableSponsorsPage - 2 + i;
                        if (pageNum >= availableSponsorsTotalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleAvailableSponsorsPageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === availableSponsorsPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleAvailableSponsorsPageChange(availableSponsorsPage + 1)}
                      disabled={availableSponsorsPage >= availableSponsorsTotalPages - 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

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
        title="Remove Sponsor"
        message={`Are you sure you want to remove "${selectedSponsor?.sponsor?.name || 'this sponsor'}" from this event? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
          className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
          disabled={loading}
        >
          <FaBan />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <FaFolderOpen />
          {loading ? 'Processing...' : submitText}
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
          className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
          disabled={loading}
        >
          <FaBan />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <FaFolderOpen />
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}
