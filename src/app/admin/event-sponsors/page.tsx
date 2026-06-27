'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import AdminNavigation from '@/components/AdminNavigation';
import SponsorImageUploadDialog from '@/components/sponsors/SponsorImageUploadDialog';
import SponsorMediaGallery from '@/components/sponsors/SponsorMediaGallery';
import type { EventSponsorsDTO } from '@/types';
import {
  fetchEventSponsorsServer,
  createEventSponsorServer,
  updateEventSponsorServer,
  deleteEventSponsorServer,
} from './ApiServerActions';
import { fetchAdminProfileServer } from '../manage-usage/ApiServerActions';

export default function EventSponsorsPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // User role state
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewDetailsSponsor, setViewDetailsSponsor] = useState<EventSponsorsDTO | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<EventSponsorsDTO | null>(null);

  // Form state - aligned with DTO schema
  const [formData, setFormData] = useState<Partial<EventSponsorsDTO>>({
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
    isActive: true,
    priorityRanking: 1,
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
  });

  // Upload dialog states
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [heroUploadOpen, setHeroUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      checkUserRole();
      loadSponsors();
    }
  }, [userId, page]);

  const checkUserRole = async () => {
    if (!userId) return;
    try {
      const profile = await fetchAdminProfileServer(userId);
      setIsAdmin(profile?.userRole === 'ADMIN');
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchEventSponsorsServer(page, pageSize);
      setSponsors(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load sponsors');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load sponsors' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor name is required' });
        return;
      }
      if (!formData.type?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor type is required' });
        return;
      }

      setLoading(true);
      const sponsorData: Omit<EventSponsorsDTO, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name!.trim(),
        type: formData.type!.trim(),
        companyName: formData.companyName?.trim() || undefined,
        tagline: formData.tagline?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        websiteUrl: formData.websiteUrl?.trim() || undefined,
        contactEmail: formData.contactEmail?.trim() || undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        logoUrl: formData.logoUrl?.trim() || undefined,
        heroImageUrl: formData.heroImageUrl?.trim() || undefined,
        bannerImageUrl: formData.bannerImageUrl?.trim() || undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        priorityRanking: formData.priorityRanking || 1,
        facebookUrl: formData.facebookUrl?.trim() || undefined,
        twitterUrl: formData.twitterUrl?.trim() || undefined,
        linkedinUrl: formData.linkedinUrl?.trim() || undefined,
        instagramUrl: formData.instagramUrl?.trim() || undefined,
      };

      const newSponsor = await createEventSponsorServer(sponsorData);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor created successfully. You can now upload images when editing the sponsor.' });
      // Reload sponsors to ensure fresh data
      await loadSponsors();
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to create sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      const updatedSponsor = await updateEventSponsorServer(selectedSponsor.id!, formData);
      setSponsors(prev => prev.map(s => s.id === selectedSponsor.id ? updatedSponsor : s));
      setIsEditModalOpen(false);
      setSelectedSponsor(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      await deleteEventSponsorServer(selectedSponsor.id!);
      setSponsors(prev => prev.filter(s => s.id !== selectedSponsor.id));
      setIsDeleteModalOpen(false);
      setSelectedSponsor(null);
      setToastMessage({ type: 'success', message: 'Sponsor deleted successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
      isActive: true,
      priorityRanking: 1,
      facebookUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
    });
  };

  const openDeleteModal = (sponsor: EventSponsorsDTO) => {
    setSelectedSponsor(sponsor);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  // Filter sponsors based on search and filters
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = !searchTerm ||
      sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || sponsor.type === filterType;
    const matchesActive = filterActive === 'all' ||
      (filterActive === 'active' && sponsor.isActive) ||
      (filterActive === 'inactive' && !sponsor.isActive);

    return matchesSearch && matchesType && matchesActive;
  });

  // Sort filtered sponsors
  const sortedSponsors = [...filteredSponsors].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey as keyof EventSponsorsDTO];
    const bVal = b[sortKey as keyof EventSponsorsDTO];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Get unique sponsor types for filter
  const sponsorTypes = Array.from(new Set(sponsors.map(s => s.type).filter(Boolean))).sort();

  const columns: Column<EventSponsorsDTO>[] = [
    {
      key: 'name',
      label: 'Sponsor Name',
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'priorityRanking',
      label: 'Priority',
      sortable: true,
      render: (value) => value || 0
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="font-body text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Page Title - Above admin group buttons */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Global Sponsors</h1>
      </div>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation currentPage="event-sponsors" />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Info tip: how to associate sponsors with an event */}
        <div className="mb-4 sm:mb-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <svg className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Associating sponsors with an event</p>
            <p className="text-blue-700 dark:text-blue-300">
              To associate a sponsor with a particular event, go to <strong>Manage Events</strong>, open the event, then click the <strong>Event Sponsors</strong> button in the event&apos;s admin button group. There you can add or remove sponsors for that event. This page only manages <strong>global sponsors</strong> (the master list).
            </p>
          </div>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-xs sm:text-sm ${
            toastMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {toastMessage.message}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search sponsors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-center">
              <FaFilter className="text-gray-400 dark:text-gray-500 hidden sm:block" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="">All Types</option>
                {sponsorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
              title="Add Sponsor"
              aria-label="Add Sponsor"
              type="button"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs sm:text-sm lg:text-base whitespace-nowrap">Add Sponsor</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-xs sm:text-sm">
            {error}
          </div>
        )}

        <DataTable
          data={sortedSponsors}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          onView={(s) => setViewDetailsSponsor(s)}
          getEditHref={(s) => `/admin/event-sponsors/${s.id}`}
          onDelete={openDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No sponsors found"
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
                Page <span className="text-blue-600 dark:text-blue-400">{page + 1}</span> of <span className="text-blue-600 dark:text-blue-400">{Math.max(1, Math.ceil(totalCount / pageSize))}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(totalCount / pageSize) - 1 || loading}
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
                  Showing <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount > 0 ? page * pageSize + 1 : 0}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount}</span> sponsors
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-2 sm:px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">No sponsors found</span>
                <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hidden sm:inline">[No sponsors match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
          setLogoUploadOpen(false);
          setHeroUploadOpen(false);
          setBannerUploadOpen(false);
        }}
        title="Add Event Sponsor"
        size="xl"
      >
        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Sponsor"
          onLogoUploadClick={() => setLogoUploadOpen(true)}
          onHeroUploadClick={() => setHeroUploadOpen(true)}
          onBannerUploadClick={() => setBannerUploadOpen(true)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSponsor(null);
          resetForm();
          setLogoUploadOpen(false);
          setHeroUploadOpen(false);
          setBannerUploadOpen(false);
        }}
        title="Edit Event Sponsor"
        size="xl"
      >
        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Sponsor"
          onLogoUploadClick={() => setLogoUploadOpen(true)}
          onHeroUploadClick={() => setHeroUploadOpen(true)}
          onBannerUploadClick={() => setBannerUploadOpen(true)}
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
        title="Delete Sponsor"
        message={`Are you sure you want to delete "${selectedSponsor?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* View details modal - same style as admin/media Media Details */}
      {viewDetailsSponsor && (
        <Modal
          isOpen={true}
          onClose={() => setViewDetailsSponsor(null)}
          title={viewDetailsSponsor.id != null ? `Sponsor Details #${viewDetailsSponsor.id}` : 'Sponsor Details'}
          size="lg"
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.entries(viewDetailsSponsor)
              .filter(([key]) => !key.startsWith('_'))
              .map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 py-3 first:pt-0">
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-600">
                    {typeof value === 'boolean' ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    ) : value instanceof Date ? value.toLocaleString() : (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) && value ? new Date(String(value)).toLocaleString() : value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)}
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {/* Upload Dialogs */}
      {formData.id && (
        <>
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="logo"
            isOpen={logoUploadOpen}
            onClose={() => setLogoUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="hero"
            isOpen={heroUploadOpen}
            onClose={() => setHeroUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, heroImageUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="banner"
            isOpen={bannerUploadOpen}
            onClose={() => setBannerUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, bannerImageUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
        </>
      )}
    </div>
  );
}

// Sponsor Form Component
interface SponsorFormProps {
  formData: Partial<EventSponsorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  onLogoUploadClick?: () => void;
  onHeroUploadClick?: () => void;
  onBannerUploadClick?: () => void;
}

// Map non-standard input names to formData keys to avoid browser "Saved info" autofill (Chrome matches name="name", "email", "tel", etc.)
const SPONSOR_FORM_FIELD_MAP: Record<string, string> = {
  sn: 'name',
  ct: 'type',
  cn: 'companyName',
  pr: 'priorityRanking',
  ce: 'contactEmail',
  cp: 'contactPhone',
  wu: 'websiteUrl',
  ia: 'isActive',
  tl: 'tagline',
  dc: 'description',
  fu: 'facebookUrl',
  tu: 'twitterUrl',
  lu: 'linkedinUrl',
  iu: 'instagramUrl',
};

function SponsorForm({ formData, setFormData, onSubmit, loading, submitText, onLogoUploadClick, onHeroUploadClick, onBannerUploadClick }: SponsorFormProps) {
  // Prevent browser "Saved info" autofill: all fillable fields start readOnly; first focus anywhere unlocks form
  const [formAutofillLock, setFormAutofillLock] = React.useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const formKey = SPONSOR_FORM_FIELD_MAP[name] ?? name;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [formKey]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [formKey]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [formKey]: value }));
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

  // Note: ImageUpload requires eventId. For main sponsors page, we'll use a default eventId of 0
  // or only show image uploads after sponsor is created (when formData.id exists)
  // For now, we'll show image uploads only when editing (formData.id exists)
  const canUploadImages = !!formData.id;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      autoComplete="off"
      onFocusCapture={() => setFormAutofillLock(false)}
    >
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Sponsor Name *
          </label>
          <input
            type="text"
            name="sn"
            value={formData.name || ''}
            onChange={handleChange}
            required
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter sponsor name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Type *
          </label>
          <select
            name="ct"
            value={formData.type || ''}
            onChange={handleChange}
            required
            autoComplete="off"
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          >
            <option value="">Select sponsor type</option>
            {sponsorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="f-cn">
            Company Name
          </label>
          <input
            id="f-cn"
            type="text"
            name="cn"
            value={formData.companyName || ''}
            onChange={handleChange}
            autoComplete="one-time-code"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="e.g. Acme Inc."
            aria-label="Company or organization name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Priority Ranking *
          </label>
          <input
            type="number"
            name="pr"
            value={formData.priorityRanking || 1}
            onChange={handleChange}
            min="1"
            required
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter priority ranking (1 = highest priority)"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers indicate higher priority (1 = highest priority)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="f-ce">
            Contact Email
          </label>
          <input
            id="f-ce"
            type="text"
            inputMode="email"
            name="ce"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            autoComplete="one-time-code"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="e.g. name@company.com"
            aria-label="Contact email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="f-cp">
            Contact Phone
          </label>
          <input
            id="f-cp"
            type="text"
            inputMode="tel"
            name="cp"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            autoComplete="one-time-code"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="e.g. +1 234 567 8900"
            aria-label="Contact phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Website URL
          </label>
          <input
            type="text"
            inputMode="url"
            name="wu"
            value={formData.websiteUrl || ''}
            onChange={handleChange}
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="ia"
            checked={formData.isActive || false}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
          />
          <label className="ml-2 block text-sm text-foreground">
            Active Sponsor
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Tagline
        </label>
        <input
          type="text"
          name="tl"
          value={formData.tagline || ''}
          onChange={handleChange}
          maxLength={500}
          autoComplete="off"
          readOnly={formAutofillLock}
          className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          placeholder="Enter sponsor tagline (max 500 characters)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          name="dc"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          autoComplete="off"
          readOnly={formAutofillLock}
          className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          placeholder="Enter detailed description about the sponsor"
        />
      </div>

      {/* Social Media Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Facebook URL
          </label>
          <input
            type="url"
            name="fu"
            value={formData.facebookUrl || ''}
            onChange={handleChange}
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://facebook.com/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Twitter URL
          </label>
          <input
            type="url"
            name="tu"
            value={formData.twitterUrl || ''}
            onChange={handleChange}
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://twitter.com/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="lu"
            value={formData.linkedinUrl || ''}
            onChange={handleChange}
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://linkedin.com/company/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Instagram URL
          </label>
          <input
            type="url"
            name="iu"
            value={formData.instagramUrl || ''}
            onChange={handleChange}
            autoComplete="off"
            readOnly={formAutofillLock}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://instagram.com/sponsor"
          />
        </div>
      </div>

      {/* Image Upload Section - Only show when editing (sponsor ID exists) */}
      {canUploadImages && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-heading font-medium text-foreground mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo Image
              </label>
              {formData.logoUrl && (
                <div className="mb-2">
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onLogoUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hero Image
              </label>
              {formData.heroImageUrl && (
                <div className="mb-2">
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onHeroUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.heroImageUrl ? 'Change Hero Image' : 'Upload Hero Image'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Banner Image
              </label>
              {formData.bannerImageUrl && (
                <div className="mb-2">
                  <img
                    src={formData.bannerImageUrl}
                    alt="Banner"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onBannerUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.bannerImageUrl ? 'Change Banner' : 'Upload Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!canUploadImages && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Image uploads will be available after the sponsor is created. Save the sponsor first, then edit it to upload images.
          </p>
        </div>
      )}

      {/* Media Gallery Section */}
      {canUploadImages && formData.id && (
        <div className="border-t border-border pt-6 mt-6">
          <h3 className="text-lg font-heading font-medium text-foreground mb-4">Media Gallery</h3>
          <p className="text-sm font-body text-muted-foreground mb-4">
            Upload and manage multiple media files for this sponsor. Files are sorted by priority ranking (lower = higher priority).
          </p>
          <SponsorMediaGallery
            sponsorId={formData.id}
            showPriorityControls={true}
            allowUpload={false}
            onPriorityChange={async (mediaId, priorityRanking) => {
              // Priority change handled by component
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 px-6 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-6 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={loading ? 'Saving...' : submitText}
          aria-label={loading ? 'Saving...' : submitText}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
            {loading ? (
              <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
