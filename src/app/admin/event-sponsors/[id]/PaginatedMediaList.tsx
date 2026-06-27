'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner, FaImage, FaEdit, FaSave, FaBan, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';
import type { EventMediaDTO } from '@/types';
import { fetchSponsorMediaServer, updateMediaPriorityRankingServer, updateEventMediaServer, deleteEventMediaServer } from '../ApiServerActions';
import PriorityRankingEditor from '@/components/sponsors/PriorityRankingEditor';
import Modal, { ConfirmModal } from '@/components/ui/Modal';

interface PaginatedMediaListProps {
  sponsorId: number;
  initialMediaList: EventMediaDTO[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  refreshKey?: number;
  searchTerm?: string;
  filterBannerOnly?: boolean;
  filterLogoOnly?: boolean;
  filterHeroOnly?: boolean;
}

function matchesBanner(media: EventMediaDTO): boolean {
  const t = (media.eventMediaType || '').toUpperCase();
  return t.includes('BANNER');
}
function matchesLogo(media: EventMediaDTO): boolean {
  const t = (media.eventMediaType || '').toUpperCase();
  return t.includes('LOGO');
}
function matchesHero(media: EventMediaDTO): boolean {
  const t = (media.eventMediaType || '').toUpperCase();
  return t.includes('HERO') || Boolean(media.isHeroImage);
}

export default function PaginatedMediaList({
  sponsorId,
  initialMediaList,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  refreshKey = 0,
  searchTerm = '',
  filterBannerOnly = false,
  filterLogoOnly = false,
  filterHeroOnly = false,
}: PaginatedMediaListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allMedia, setAllMedia] = useState<EventMediaDTO[]>(initialMediaList);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<EventMediaDTO | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<number | null>(null);
  const [editingMedia, setEditingMedia] = useState<EventMediaDTO | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventMediaDTO>>({});
  const [saving, setSaving] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<EventMediaDTO | null>(null);

  // Filter and search: apply to allMedia to get filtered list, then paginate
  const filteredMedia = useMemo(() => {
    let list = allMedia;
    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      list = list.filter((m) => (m.title || '').toLowerCase().includes(term));
    }
    const anyTypeFilter = filterBannerOnly || filterLogoOnly || filterHeroOnly;
    if (anyTypeFilter) {
      list = list.filter((m) => {
        if (filterBannerOnly && matchesBanner(m)) return true;
        if (filterLogoOnly && matchesLogo(m)) return true;
        if (filterHeroOnly && matchesHero(m)) return true;
        return false;
      });
    }
    return list.sort((a, b) => (a.priorityRanking ?? 0) - (b.priorityRanking ?? 0));
  }, [allMedia, searchTerm, filterBannerOnly, filterLogoOnly, filterHeroOnly]);

  const filteredCount = filteredMedia.length;
  const filteredTotalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const safePage = Math.min(currentPage, Math.max(0, filteredTotalPages - 1));
  const displayList = useMemo(
    () => filteredMedia.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [filteredMedia, safePage, pageSize]
  );

  // Load all media when refreshKey or page changes (store full list; filtering is client-side)
  const loadMedia = useCallback(async () => {
    if (!sponsorId) return;

    setLoading(true);
    try {
      const all = await fetchSponsorMediaServer(sponsorId);
      setAllMedia(all);
    } catch (error) {
      console.error('Failed to fetch sponsor media:', error);
      setAllMedia(initialMediaList);
    } finally {
      setLoading(false);
    }
  }, [sponsorId, initialMediaList]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia, refreshKey]);

  // When search or filters are applied and current page would be out of range, reset to page 0
  useEffect(() => {
    if (!searchTerm && !filterBannerOnly && !filterLogoOnly && !filterHeroOnly) return;
    if (currentPage > 0 && filteredTotalPages <= currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '0');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchTerm, filterBannerOnly, filterLogoOnly, filterHeroOnly, currentPage, filteredTotalPages, searchParams, router]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= filteredTotalPages || loading) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePriorityUpdate = async (mediaId: number, priorityRanking: number) => {
    try {
      await updateMediaPriorityRankingServer(mediaId, priorityRanking);
      setAllMedia(prev =>
        prev.map(m =>
          m.id === mediaId ? { ...m, priorityRanking } : m
        ).sort((a, b) => (a.priorityRanking || 0) - (b.priorityRanking || 0))
      );
      setEditingPriority(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to update priority:', error);
      alert(`Failed to update priority: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMediaClick = (media: EventMediaDTO, e?: React.MouseEvent) => {
    // If clicking on edit button, don't open lightbox
    if (e?.target && (e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedMedia(media);
    setLightboxOpen(true);
  };

  const handleEditClick = (media: EventMediaDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLButtonElement).blur();
    setEditingMedia(media);
    setEditForm({
      id: media.id,
      tenantId: media.tenantId,
      title: media.title || '',
      description: media.description || '',
      eventMediaType: media.eventMediaType || '',
      altText: media.altText || '',
      priorityRanking: media.priorityRanking ?? 0,
      startDisplayingFromDate: media.startDisplayingFromDate
        ? (typeof media.startDisplayingFromDate === 'string'
            ? media.startDisplayingFromDate
            : new Date(media.startDisplayingFromDate).toISOString().split('T')[0])
        : '',
      isPublic: Boolean(media.isPublic),
      eventFlyer: Boolean(media.eventFlyer),
      isEventManagementOfficialDocument: Boolean(media.isEventManagementOfficialDocument),
      isHeroImage: Boolean(media.isHeroImage),
      isActiveHeroImage: Boolean(media.isActiveHeroImage),
      isHomePageHeroImage: Boolean(media.isHomePageHeroImage),
      isFeaturedEventImage: Boolean(media.isFeaturedEventImage),
      isLiveEventImage: Boolean(media.isLiveEventImage),
      isFeaturedVideo: Boolean(media.isFeaturedVideo),
      featuredVideoUrl: media.featuredVideoUrl || '',
    });
  };

  const handleDelete = async (mediaId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      (e.currentTarget as HTMLButtonElement).blur();
    }
    const media = allMedia.find(m => m.id === mediaId) ?? displayList.find(m => m.id === mediaId);
    if (media) {
      setMediaToDelete(media);
    }
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete?.id) return;

    setDeletingMediaId(mediaToDelete.id);
    setLoading(true);
    try {
      await deleteEventMediaServer(mediaToDelete.id);
      // Refresh the media list
      await loadMedia();
      // Refresh the page to update pagination
      router.refresh();
      setMediaToDelete(null);
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setDeletingMediaId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMedia?.id) return;

    setSaving(true);
    try {
      const merged: Partial<EventMediaDTO> = {
        ...editingMedia,
        ...editForm,
        updatedAt: new Date().toISOString(),
      };

      merged.createdAt = merged.createdAt || editingMedia.createdAt || new Date().toISOString();
      merged.storageType = merged.storageType || editingMedia.storageType || 'S3';
      merged.eventMediaType = merged.eventMediaType || editingMedia.eventMediaType || 'gallery';
      merged.title = (merged.title ?? editingMedia.title ?? 'Untitled Media').trim() || 'Untitled Media';
      merged.priorityRanking =
        typeof merged.priorityRanking === 'number'
          ? merged.priorityRanking
          : editingMedia.priorityRanking ?? 0;
      merged.tenantId = merged.tenantId || editingMedia.tenantId;

      const booleanFields: (keyof EventMediaDTO)[] = [
        'isHomePageHeroImage',
        'isFeaturedEventImage',
        'isLiveEventImage',
        'isPublic',
        'eventFlyer',
        'isEventManagementOfficialDocument',
        'isHeroImage',
        'isActiveHeroImage',
        'isFeaturedVideo',
      ];

      booleanFields.forEach((field) => {
        (merged as any)[field] = (merged as any)[field] ?? (editingMedia as any)?.[field] ?? false;
      });

      if (merged.startDisplayingFromDate === '') {
        delete merged.startDisplayingFromDate;
      }

      await updateEventMediaServer(editingMedia.id, merged);
      await loadMedia();
      setEditingMedia(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to update media:', error);
      alert(`Failed to update media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Pagination: use filtered counts when search/filters are active
  const effectiveTotal = filteredCount;
  const effectivePages = filteredTotalPages;
  const effectivePage = safePage;
  const startItem = effectiveTotal > 0 ? effectivePage * pageSize + 1 : 0;
  const endItem = effectiveTotal > 0 ? Math.min((effectivePage + 1) * pageSize, effectiveTotal) : 0;
  const isPrevDisabled = effectivePage === 0 || loading;
  const isNextDisabled = effectivePage >= effectivePages - 1 || loading;

  if (loading && allMedia.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Media Grid - use displayList (filtered + paginated) */}
      {displayList.length === 0 ? (
        <div className="text-center py-12">
          <FaImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {allMedia.length === 0
              ? 'No media files found for this sponsor.'
              : 'No media match the current search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {displayList.map((media) => (
            <div
              key={media.id}
              className="bg-muted/50 rounded-lg overflow-hidden border border-border reverent-hover"
            >
              {media.fileUrl && (
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={(e) => handleMediaClick(media, e)}
                >
                  <Image
                    src={media.fileUrl}
                    alt={media.altText || media.title || 'Media'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-foreground truncate flex-1" title={media.title || 'Untitled'}>
                    {media.title || 'Untitled'}
                  </h4>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleEditClick(media, e)}
                      className="icon-btn icon-btn-edit bg-blue-700 hover:bg-blue-800 text-white p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Edit media details"
                    >
                      <FaEdit className="text-lg text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        if (media.id) handleDelete(media.id, e);
                      }}
                      disabled={deletingMediaId === media.id || loading}
                      className="icon-btn icon-btn-delete bg-red-700 hover:bg-red-800 text-white p-3 shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete media file"
                    >
                      {deletingMediaId === media.id ? (
                        <FaSpinner className="text-lg text-white animate-spin" />
                      ) : (
                        <FaTrashAlt className="text-lg text-white" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Type: {media.eventMediaType || 'N/A'}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Priority: {media.priorityRanking ?? 0}
                  </span>
                  {editingPriority === media.id ? (
                    <PriorityRankingEditor
                      currentPriority={media.priorityRanking ?? 0}
                      onSave={(priority) => handlePriorityUpdate(media.id!, priority)}
                      onCancel={() => setEditingPriority(null)}
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPriority(media.id!);
                      }}
                      className="text-xs text-primary hover:text-primary/80 reverent-transition"
                    >
                      Edit Priority
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls - per pagination_footer_styling.mdc */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => handlePageChange(effectivePage - 1)}
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
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{effectivePage + 1}</span> of <span className="text-blue-600">{effectivePages}</span>
            </span>
          </div>
          <button
            onClick={() => handlePageChange(effectivePage + 1)}
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
        <div className="text-center mt-3">
          {effectiveTotal > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{effectiveTotal}</span> {effectiveTotal === 1 ? 'item' : 'items'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No items found</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={() => {
            setLightboxOpen(false);
            setSelectedMedia(null);
          }}
        >
          <div className="relative max-w-7xl max-h-[90vh] p-4">
            {selectedMedia.fileUrl && (
              <Image
                src={selectedMedia.fileUrl}
                alt={selectedMedia.altText || selectedMedia.title || 'Media'}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
            {selectedMedia.title && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/75 text-white p-3 rounded-lg">
                <h3 className="font-semibold">{selectedMedia.title}</h3>
                {selectedMedia.description && (
                  <p className="text-sm mt-1">{selectedMedia.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Media Modal */}
      {editingMedia && (
        <Modal
          isOpen={true}
          onClose={() => {
            setEditingMedia(null);
            setEditForm({});
          }}
          title="Edit Media Details"
          size="xl"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editForm.altText || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, altText: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority Ranking
                </label>
                <input
                  type="number"
                  value={editForm.priorityRanking ?? 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priorityRanking: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers indicate higher priority (0 = highest priority)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Displaying From Date
                </label>
                <input
                  type="date"
                  value={editForm.startDisplayingFromDate || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startDisplayingFromDate: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div className="border border-border rounded-lg p-4">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Media Properties
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'isPublic' as const, label: 'Public' },
                    { name: 'eventFlyer' as const, label: 'Event Flyer' },
                    { name: 'isEventManagementOfficialDocument' as const, label: 'Official Doc' },
                    { name: 'isHeroImage' as const, label: 'Hero Image' },
                    { name: 'isActiveHeroImage' as const, label: 'Active Hero' },
                    { name: 'isFeaturedVideo' as const, label: 'Featured Video' },
                    { name: 'isHomePageHeroImage' as const, label: 'Home Page Hero' },
                    { name: 'isFeaturedEventImage' as const, label: 'Featured Event' },
                    { name: 'isLiveEventImage' as const, label: 'Live Event' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={Boolean(editForm[name])}
                        onChange={(e) => setEditForm(prev => ({ ...prev, [name]: e.target.checked }))}
                        className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editForm.isFeaturedVideo && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Featured Video URL
                  </label>
                  <input
                    type="url"
                    value={editForm.featuredVideoUrl || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, featuredVideoUrl: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setEditingMedia(null);
                  setEditForm({});
                }}
                className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted reverent-transition"
                disabled={saving}
              >
                <FaBan className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 reverent-transition disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 inline mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!mediaToDelete}
        onClose={() => setMediaToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Media File"
        message={`Are you sure you want to delete "${mediaToDelete?.title || 'this media file'}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

