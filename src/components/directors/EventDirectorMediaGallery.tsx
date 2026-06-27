'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSpinner, FaImage } from 'react-icons/fa';
import Image from 'next/image';
import type { EventMediaDTO } from '@/types';
import { fetchEventDirectorMediaServer, updateMediaPriorityRankingServer, deleteEventMediaServer } from '@/app/admin/events/[id]/program-directors/ApiServerActions';
import PriorityRankingEditor from '../sponsors/PriorityRankingEditor';
import ErrorDialog from '@/components/ErrorDialog';

interface EventDirectorMediaGalleryProps {
  eventId: number;
  directorId: number;
  onMediaSelect?: (media: EventMediaDTO) => void;
  onMediaDelete?: (mediaId: number) => void;
  onPriorityChange?: (mediaId: number, priorityRanking: number) => void;
  showPriorityControls?: boolean;
  allowUpload?: boolean;
  onUploadClick?: () => void;
}

export default function EventDirectorMediaGallery({
  eventId,
  directorId,
  onMediaSelect,
  onMediaDelete,
  onPriorityChange,
  showPriorityControls = true,
  allowUpload = false,
  onUploadClick,
}: EventDirectorMediaGalleryProps) {
  const [mediaList, setMediaList] = useState<EventMediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<EventMediaDTO | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<number | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadMedia = async () => {
      if (!eventId || !directorId) return;

      setLoading(true);
      try {
        const media = await fetchEventDirectorMediaServer(eventId, directorId);
        setMediaList(media);
      } catch (error) {
        console.error('Failed to fetch event-director media:', error);
        setErrorMessage(`Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [eventId, directorId]);

  const handlePriorityUpdate = async (mediaId: number, priorityRanking: number) => {
    try {
      await updateMediaPriorityRankingServer(mediaId, priorityRanking);

      // Update local state
      setMediaList(prev =>
        prev.map(m =>
          m.id === mediaId
            ? { ...m, priorityRanking }
            : m
        ).sort((a, b) => (a.priorityRanking || 0) - (b.priorityRanking || 0))
      );

      if (onPriorityChange) {
        onPriorityChange(mediaId, priorityRanking);
      }

      setEditingPriority(null);
    } catch (error) {
      console.error('Failed to update priority:', error);
      setErrorMessage(`Failed to update priority: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorDialog(true);
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      // Call server action to delete media
      await deleteEventMediaServer(mediaId);

      // Call optional callback if provided
      if (onMediaDelete) {
        onMediaDelete(mediaId);
      }

      // Refresh media list
      const media = await fetchEventDirectorMediaServer(eventId, directorId);
      setMediaList(media);
    } catch (error) {
      console.error('Failed to delete media:', error);
      setErrorMessage(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorDialog(true);
    }
  };

  const openLightbox = (media: EventMediaDTO) => {
    setSelectedMedia(media);
    setLightboxOpen(true);
    if (onMediaSelect) {
      onMediaSelect(media);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 font-body text-muted-foreground">Loading media...</span>
      </div>
    );
  }

  if (mediaList.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border border-border">
        <FaImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="font-body text-muted-foreground mb-4">No media files found for this event-director combination.</p>
        {allowUpload && onUploadClick && (
          <button
            onClick={onUploadClick}
            className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
            title="Upload Media"
            aria-label="Upload Media"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Upload Media</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mediaList.map((media) => (
            <div
              key={media.id}
              className="bg-card rounded-lg sacred-shadow overflow-hidden group relative"
            >
              {/* Image */}
              <div
                className="relative h-48 bg-muted cursor-pointer"
                onClick={() => openLightbox(media)}
              >
                {media.fileUrl ? (
                  <Image
                    src={media.fileUrl}
                    alt={media.title || 'Media'}
                    fill
                    className="object-cover group-hover:scale-105 reverent-transition"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaImage className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Priority Badge */}
                {showPriorityControls && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    Priority: {media.priorityRanking ?? 0}
                  </div>
                )}

                {/* Delete Button - Always Visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (media.id) handleDelete(media.id);
                  }}
                  className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-full reverent-transition shadow-lg z-10"
                  title="Delete Media"
                >
                  <FaTrash className="w-3 h-3" />
                </button>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 reverent-transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {showPriorityControls && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPriority(media.id || null);
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded reverent-transition"
                      title="Edit Priority"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-3">
                <h4 className="text-sm font-heading font-medium text-foreground truncate">
                  {media.title || 'Untitled'}
                </h4>
                {media.description && (
                  <p className="text-xs font-body text-muted-foreground truncate mt-1">
                    {media.description}
                  </p>
                )}
              </div>

              {/* Priority Editor */}
              {editingPriority === media.id && (
                <div className="p-3 border-t border-border">
                  <PriorityRankingEditor
                    mediaId={media.id!}
                    currentPriority={media.priorityRanking || 0}
                    onSave={handlePriorityUpdate}
                    onCancel={() => setEditingPriority(null)}
                    isInline={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upload Button */}
        {allowUpload && onUploadClick && (
          <div className="flex justify-center">
            <button
              onClick={onUploadClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md reverent-transition inline-flex items-center gap-2 font-heading"
            >
              <FaPlus className="w-5 h-5" />
              Upload More Media
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 reverent-transition"
            >
              <FaImage className="w-6 h-6" />
            </button>
            {selectedMedia.fileUrl && (
              <img
                src={selectedMedia.fileUrl}
                alt={selectedMedia.title || 'Media'}
                className="max-w-full max-h-[90vh] object-contain mx-auto"
              />
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded">
              <h3 className="font-heading font-semibold">{selectedMedia.title || 'Untitled'}</h3>
              {selectedMedia.description && (
                <p className="font-body text-sm mt-1">{selectedMedia.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        message={errorMessage}
      />
    </>
  );
}

