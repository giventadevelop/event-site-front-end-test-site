"use client";
import React, { useRef, useState, useEffect } from "react";
import { EventMediaDTO, EventDetailsDTO } from "@/types";
import { FaEdit, FaTrashAlt, FaUpload, FaFolderOpen, FaSpinner, FaBan, FaTimes, FaCheckCircle, FaPhotoVideo } from 'react-icons/fa';
import { deleteMediaServer, editMediaServer } from './ApiServerActions';
import { createPortal } from "react-dom";
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/Modal';

interface MediaClientPageProps {
  eventId: string;
  mediaList: EventMediaDTO[];
  eventDetails: EventDetailsDTO | null;
  officialDocsList: EventMediaDTO[];
  userProfileId: number | null;
  /** Options for optional focus group on upload (association id -> name) */
  focusGroupOptions?: { id: number; name: string }[];
}

// Tooltip component (matches /admin/manage-usage)
function MediaDetailsTooltip({ media, anchorRect, onClose, onTooltipMouseEnter, onTooltipMouseLeave, tooltipType }: { media: EventMediaDTO | null, anchorRect: DOMRect | null, onClose: () => void, onTooltipMouseEnter: () => void, onTooltipMouseLeave: () => void, tooltipType: 'officialDocs' | 'uploadedMedia' | null }) {
  useEffect(() => {
    console.log('MediaDetailsTooltip rendered', { media, anchorRect });
  }, [media, anchorRect]);
  if (!media || !anchorRect) return null;
  // Exclude fileUrl and preSignedUrl
  const entries = Object.entries(media).filter(([key]) => key !== 'fileUrl' && key !== 'preSignedUrl');
  const tooltipWidth = 480;
  const thWidth = 168;
  const style: React.CSSProperties = {
    position: 'fixed',
    top: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    minWidth: tooltipWidth,
    maxWidth: '90vw',
    maxHeight: '40vh',
    overflowY: 'auto',
    pointerEvents: 'auto',
    background: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    fontSize: '0.95rem',
    padding: '1rem',
    paddingBottom: 16,
  };
  return createPortal(
    <div
      className="admin-tooltip"
      style={style}
      tabIndex={-1}
      onMouseEnter={onTooltipMouseEnter}
      onMouseLeave={onTooltipMouseLeave}
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
        onClick={onClose}
        aria-label="Close tooltip"
        style={{ position: 'absolute', top: 8, right: 12 }}
      >
        &times;
      </button>
      <table className="admin-tooltip-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <th style={{ textAlign: 'left', width: thWidth, minWidth: thWidth, maxWidth: thWidth, fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'normal', boxSizing: 'border-box' }}>{key}</th>
              <td style={{ textAlign: 'left', width: 'auto' }}>{
                typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                  value instanceof Date ? value.toLocaleString() :
                    (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) && value ? new Date(value).toLocaleString() :
                      value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)
              }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

export function MediaClientPage({ eventId, mediaList: initialMediaList, eventDetails, officialDocsList: initialOfficialDocsList, userProfileId, focusGroupOptions = [] }: MediaClientPageProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<EventMediaDTO[]>(initialMediaList);
  const [mediaPage, setMediaPage] = useState(0);
  const mediaPageSize = 10;
  const [showOnlyEventFlyers, setShowOnlyEventFlyers] = useState(false);
  const filteredMediaList = showOnlyEventFlyers ? mediaList.filter(m => m.eventFlyer) : mediaList;
  const pagedMedia = filteredMediaList.slice(mediaPage * mediaPageSize, (mediaPage + 1) * mediaPageSize);
  const hasNextMediaPage = (mediaPage + 1) * mediaPageSize < filteredMediaList.length;
  const [eventFlyer, setEventFlyer] = useState(false);
  const [isEventManagementOfficialDocument, setIsEventManagementOfficialDocument] = useState(false);
  const [officialDocsList, setOfficialDocsList] = useState<EventMediaDTO[]>(initialOfficialDocsList);
  const [officialDocsPage, setOfficialDocsPage] = useState(0);
  const officialDocsPageSize = 10;
  const pagedOfficialDocs = officialDocsList.slice(officialDocsPage * officialDocsPageSize, (officialDocsPage + 1) * officialDocsPageSize);
  const hasNextOfficialDocsPage = (officialDocsPage + 1) * officialDocsPageSize < officialDocsList.length;
  const [hoveredOfficialDocId, setHoveredOfficialDocId] = useState<string | number | null>(null);
  const [hoveredOfficialDocCol, setHoveredOfficialDocCol] = useState<number | null>(null);
  const [popoverOfficialDocAnchor, setPopoverOfficialDocAnchor] = useState<DOMRect | null>(null);
  const [popoverOfficialDocMedia, setPopoverOfficialDocMedia] = useState<EventMediaDTO | null>(null);
  const [hoveredUploadedMediaId, setHoveredUploadedMediaId] = useState<string | number | null>(null);
  const [hoveredUploadedMediaCol, setHoveredUploadedMediaCol] = useState<number | null>(null);
  const [popoverUploadedMediaAnchor, setPopoverUploadedMediaAnchor] = useState<DOMRect | null>(null);
  const [popoverUploadedMediaMedia, setPopoverUploadedMediaMedia] = useState<EventMediaDTO | null>(null);
  const [isHeroImage, setIsHeroImage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<EventMediaDTO | null>(null);
  const [isActiveHeroImage, setIsActiveHeroImage] = useState(false);
  const [isFeaturedEventImage, setIsFeaturedEventImage] = useState(false);
  const [isLiveEventImage, setIsLiveEventImage] = useState(false);
  const [isHomePageHeroImage, setIsHomePageHeroImage] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [altText, setAltText] = useState("");
  const [eventFocusGroupId, setEventFocusGroupId] = useState<number | null>(null);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);
  const [startDisplayingFromDate, setStartDisplayingFromDate] = useState("");
  // Home page hero display duration (minutes and seconds)
  const [heroDisplayDurationMinutes, setHeroDisplayDurationMinutes] = useState<number | ''>('');
  const [heroDisplayDurationSeconds, setHeroDisplayDurationSeconds] = useState<number | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormDivRef = useRef<HTMLDivElement>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const [officialDocTooltipPosition0, setOfficialDocTooltipPosition0] = useState<'right' | 'above'>('right');
  const [officialDocTooltipPosition1, setOfficialDocTooltipPosition1] = useState<'right' | 'above'>('right');
  const [officialDocTooltipPosition2, setOfficialDocTooltipPosition2] = useState<'right' | 'above'>('right');
  const [uploadedMediaTooltipPosition0, setUploadedMediaTooltipPosition0] = useState<'right' | 'above'>('right');
  const [uploadedMediaTooltipPosition1, setUploadedMediaTooltipPosition1] = useState<'right' | 'above'>('right');
  const [uploadedMediaTooltipPosition2, setUploadedMediaTooltipPosition2] = useState<'right' | 'above'>('right');
  // Tooltip state for robust portal-based tooltip
  const [tooltipMedia, setTooltipMedia] = useState<EventMediaDTO | null>(null);
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [editMedia, setEditMedia] = useState<EventMediaDTO | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [tooltipType, setTooltipType] = useState<'officialDocs' | 'uploadedMedia' | null>(null);
  const uploadedMediaSectionRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Helper to infer eventMediaType from file extension
  function inferEventMediaType(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return 'other';
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "gallery";
    if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "document";
    if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "document";
    if (["svg"].includes(ext)) return "image";
    return "other";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      // Also update the main file input if it's a folder input
      if (fileInputRef.current && e.target !== fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(e.target.files).forEach(file => {
          dataTransfer.items.add(file);
        });
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      // Also update the main file input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(e.target.files).forEach(file => {
          dataTransfer.items.add(file);
        });
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles(droppedFiles);
      // Also update the file input
      if (fileInputRef.current) {
        fileInputRef.current.files = droppedFiles;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before upload
    if (!title.trim()) {
      setMessage("Title is required. Please provide a title for your media files.");
      return;
    }

    if (!startDisplayingFromDate.trim()) {
      setMessage("Start Displaying From date is required. Please select a date when the media should start being displayed.");
      return;
    }

    if (!files || files.length === 0) {
      setMessage("Please select at least one file to upload.");
      return;
    }

    if (!eventId) {
      setMessage("Event ID is missing. Please ensure you're on the correct event page.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage(null);
    try {
      // Create FormData directly in the component to avoid any Server Action issues
      const formData = new FormData();

      // Append each file with the 'files' parameter (plural as expected by backend)
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Get tenant ID from environment variable (available on client)
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      if (!tenantId) {
        throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables');
      }

      // Append other parameters as form data
      formData.append('eventId', eventId);
      formData.append('eventFlyer', String(eventFlyer));
      formData.append('isEventManagementOfficialDocument', String(isEventManagementOfficialDocument));
      formData.append('isHeroImage', String(isHeroImage));
      formData.append('isActiveHeroImage', String(isActiveHeroImage));
      formData.append('isFeaturedEventImage', String(isFeaturedEventImage));
      formData.append('isLiveEventImage', String(isLiveEventImage));
      formData.append('isHomePageHeroImage', String(isHomePageHeroImage));
      formData.append('isPublic', String(isPublic));
      formData.append('isTeamMemberProfileImage', 'false');
      formData.append('tenantId', tenantId);

      // Append title and description for each file (backend expects arrays)
      Array.from(files).forEach(() => {
        formData.append('titles', title);
        formData.append('descriptions', description || '');
      });

      if (userProfileId) {
        formData.append('upLoadedById', String(userProfileId));
      }

      if (altText) {
        formData.append('altText', altText);
      }

      if (displayOrder !== undefined) {
        formData.append('displayOrder', String(displayOrder));
      }

      if (startDisplayingFromDate) {
        formData.append('startDisplayingFromDate', startDisplayingFromDate);
      }

      if (eventFocusGroupId != null) {
        formData.append('eventFocusGroupId', String(eventFocusGroupId));
      }

      // Home page hero display duration (convert minutes + seconds to total seconds)
      if (isHomePageHeroImage) {
        const minutes = typeof heroDisplayDurationMinutes === 'number' ? heroDisplayDurationMinutes : 0;
        const seconds = typeof heroDisplayDurationSeconds === 'number' ? heroDisplayDurationSeconds : 0;
        const totalSeconds = minutes * 60 + seconds;
        // Only append if value is provided and valid (1-600 seconds)
        if (totalSeconds > 0 && totalSeconds <= 600) {
          formData.append('homePageHeroDisplayDurationSeconds', String(totalSeconds));
        }
      }

      // Same-origin relative URL — avoids wrong port when NEXT_PUBLIC_APP_URL is unset (e.g. dev on :3001)
      const res = await fetch('/api/proxy/event-medias/upload-multiple', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = text;
        try {
          const json = JSON.parse(text) as { details?: string; message?: string; error?: string };
          errMsg = json.details?.trim() || json.message || json.error || text;
        } catch {
          /* not JSON */
        }
        if (res.status === 413) {
          errMsg = 'File is too large. Use images under 10MB each, or upload one file at a time.';
        }
        throw new Error(errMsg || `Upload failed (HTTP ${res.status})`);
      }

      const result = await res.json();

      // Show success dialog
      setShowSuccessDialog(true);

      // Clear form
      setFiles(null);
      setTitle("");
      setDescription("");
      setEventFlyer(false);
      setIsEventManagementOfficialDocument(false);
      setIsFeaturedEventImage(false);
      setIsLiveEventImage(false);
      setIsHomePageHeroImage(false);
      setStartDisplayingFromDate("");
      setHeroDisplayDurationMinutes('');
      setHeroDisplayDurationSeconds('');
      setEventFocusGroupId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh the page after dialog is shown (user can close it manually or wait for auto-close)
      setTimeout(() => {
        setShowSuccessDialog(false);
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setMessage(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const handleDelete = (mediaId: number | string) => {
    if (!mediaId) return;
    const media = mediaList.find((m) => m.id === mediaId);
    if (media) {
      setSelectedMedia(media);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMedia || !selectedMedia.id) return;
    try {
      await deleteMediaServer(selectedMedia.id);
      setMediaList((prev) => prev.filter((m) => m.id !== selectedMedia.id));
      setMessage('Media deleted successfully.');
      setIsDeleteModalOpen(false);
      setSelectedMedia(null);
    } catch (err: any) {
      setMessage(`Delete error: ${err.message}`);
      setIsDeleteModalOpen(false);
      setSelectedMedia(null);
    }
  };

  // Helper to extract file name from URL robustly and truncate hash after last _
  function getFileName(url?: string): string {
    if (!url) return '';
    const path = url.split('?')[0].split('#')[0];
    let fileName = path.substring(path.lastIndexOf('/') + 1);
    // Truncate hash after last _ before extension
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot > 0) {
      const base = fileName.substring(0, lastDot);
      const ext = fileName.substring(lastDot);
      const lastUnderscore = base.lastIndexOf('_');
      if (lastUnderscore > 0) {
        return base.substring(0, lastUnderscore) + ext;
      }
    }
    return fileName;
  }

  // Tooltip handlers (robust, shared for both tables)
  function handleCellMouseEnter(media: EventMediaDTO, e: React.MouseEvent<HTMLTableCellElement>, type: 'officialDocs' | 'uploadedMedia') {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltipMedia(media);
    setTooltipAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect());
    setIsTooltipHovered(true);
    setTooltipType(type);
  }
  function handleCellMouseLeave() {
    tooltipTimer.current = setTimeout(() => {
      setIsTooltipHovered(false);
    }, 300);
  }
  function handleTooltipMouseEnter() {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setIsTooltipHovered(true);
  }
  function handleTooltipMouseLeave() {
    tooltipTimer.current = setTimeout(() => {
      setIsTooltipHovered(false);
    }, 300);
  }
  // Hide tooltip when isTooltipHovered becomes false
  useEffect(() => {
    if (!isTooltipHovered) {
      setTooltipMedia(null);
      setTooltipAnchorRect(null);
    }
  }, [isTooltipHovered]);

  async function handleEditSave(updated: Partial<EventMediaDTO>) {
    if (!editMedia || !editMedia.id) return;
    setEditLoading(true);
    try {
      await editMediaServer(editMedia.id, updated);
      setMediaList((prev) =>
        prev.map((m) => (m.id === editMedia.id ? { ...m, ...updated } : m))
      );
      setOfficialDocsList((prev) =>
        prev.map((m) => (m.id === editMedia.id ? { ...m, ...updated } : m))
      );
      setEditMedia(null); // Close modal on success
      setMessage('Media updated successfully.');
    } catch (err: any) {
      setMessage(`Error updating media: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  }

  function EditMediaModal({ media, onClose, onSave }: {
    media: EventMediaDTO,
    onClose: () => void,
    onSave: (updated: Partial<EventMediaDTO>) => void,
  }) {
    // Helper to convert total seconds to minutes and seconds
    const secondsToMinutesAndSeconds = (totalSeconds: number | null | undefined): { minutes: number | ''; seconds: number | '' } => {
      if (!totalSeconds || totalSeconds <= 0) return { minutes: '', seconds: '' };
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return { minutes, seconds };
    };

    const initialDuration = secondsToMinutesAndSeconds(media.homePageHeroDisplayDurationSeconds);
    const [heroDisplayDurationMinutes, setHeroDisplayDurationMinutes] = useState<number | ''>(initialDuration.minutes);
    const [heroDisplayDurationSeconds, setHeroDisplayDurationSeconds] = useState<number | ''>(initialDuration.seconds);

    const [formData, setFormData] = useState<Partial<EventMediaDTO>>({
      title: media.title || '',
      description: media.description || '',
      eventFlyer: media.eventFlyer || false,
      isHeroImage: media.isHeroImage || false,
      isActiveHeroImage: media.isActiveHeroImage || false,
      isFeaturedEventImage: media.isFeaturedEventImage || false,
      isLiveEventImage: media.isLiveEventImage || false,
      isHomePageHeroImage: media.isHomePageHeroImage || false,
      isPublic: media.isPublic === false ? false : true,
      altText: media.altText || '',
      displayOrder: media.displayOrder || undefined,
      isFeaturedVideo: media.isFeaturedVideo || false,
      featuredVideoUrl: media.featuredVideoUrl || '',
      startDisplayingFromDate: media.startDisplayingFromDate || '',
      homePageHeroDisplayDurationSeconds: media.homePageHeroDisplayDurationSeconds || undefined,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const duration = secondsToMinutesAndSeconds(media.homePageHeroDisplayDurationSeconds);
      setHeroDisplayDurationMinutes(duration.minutes);
      setHeroDisplayDurationSeconds(duration.seconds);
      setFormData({
        title: media.title || '',
        description: media.description || '',
        eventFlyer: media.eventFlyer || false,
        isHeroImage: media.isHeroImage || false,
        isActiveHeroImage: media.isActiveHeroImage || false,
        isFeaturedEventImage: media.isFeaturedEventImage || false,
        isLiveEventImage: media.isLiveEventImage || false,
        isHomePageHeroImage: media.isHomePageHeroImage || false,
        isPublic: media.isPublic === false ? false : true,
        altText: media.altText || '',
        displayOrder: media.displayOrder || undefined,
        isFeaturedVideo: media.isFeaturedVideo || false,
        featuredVideoUrl: media.featuredVideoUrl || '',
        startDisplayingFromDate: media.startDisplayingFromDate || '',
        homePageHeroDisplayDurationSeconds: media.homePageHeroDisplayDurationSeconds || undefined,
        // Include required fields for backend validation
        eventMediaType: media.eventMediaType || 'gallery',
        storageType: media.storageType || 's3',
        createdAt: media.createdAt || new Date().toISOString(),
        updatedAt: media.updatedAt || new Date().toISOString(),
      });
    }, [media]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };

    const handleSaveClick = async () => {
      setIsSubmitting(true);
      try {
        // Convert minutes + seconds to total seconds for homePageHeroDisplayDurationSeconds
        const minutes = typeof heroDisplayDurationMinutes === 'number' ? heroDisplayDurationMinutes : 0;
        const seconds = typeof heroDisplayDurationSeconds === 'number' ? heroDisplayDurationSeconds : 0;
        const totalSeconds = minutes * 60 + seconds;
        
        const payload = {
          ...formData,
          homePageHeroDisplayDurationSeconds: totalSeconds > 0 && totalSeconds <= 600 ? totalSeconds : (formData.isHomePageHeroImage ? null : undefined),
        };
        
        await onSave(payload);
      } catch (error) {
        // Handle error if onSave throws
        console.error("Failed to save media:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
    };

    if (!media) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
          {/* Close button in top-right corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
            aria-label="Close dialog"
          >
            <FaTimes />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800 pr-12">Edit Media Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Title */}
            <div className="md:col-span-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            {/* Display Order */}
            <div className="md:col-span-1">
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                id="displayOrder"
                value={formData.displayOrder || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            {/* Alt Text */}
            <div className="md:col-span-2">
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                name="altText"
                id="altText"
                value={formData.altText || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            {/* Featured Video URL */}
            <div className="md:col-span-2">
              <label htmlFor="featuredVideoUrl" className="block text-sm font-medium text-gray-700 mb-1">Featured Video URL</label>
              <input
                type="text"
                name="featuredVideoUrl"
                id="featuredVideoUrl"
                value={formData.featuredVideoUrl || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            {/* Start Displaying From */}
            <div className="md:col-span-2">
              <label htmlFor="startDisplayingFromDate" className="block text-sm font-medium text-gray-700 mb-1">Start Displaying From</label>
              <input
                type="date"
                name="startDisplayingFromDate"
                id="startDisplayingFromDate"
                value={formData.startDisplayingFromDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
              <p className="text-sm text-gray-500 mt-1">When should this media start being displayed?</p>
            </div>

            {/* Home Page Hero Display Duration (shown only when isHomePageHeroImage is checked) */}
            {formData.isHomePageHeroImage && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Page Hero Display Duration</label>
                <p className="text-xs text-gray-600 mb-3">
                  How long should this image be displayed in the homepage hero slider? Leave empty to use default (8 seconds).
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="editHeroDisplayDurationMinutes" className="block text-xs font-medium text-gray-600 mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      id="editHeroDisplayDurationMinutes"
                      name="editHeroDisplayDurationMinutes"
                      min="0"
                      max="10"
                      value={heroDisplayDurationMinutes}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0));
                        setHeroDisplayDurationMinutes(val);
                      }}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="editHeroDisplayDurationSeconds" className="block text-xs font-medium text-gray-600 mb-1">
                      Seconds
                    </label>
                    <input
                      type="number"
                      id="editHeroDisplayDurationSeconds"
                      name="editHeroDisplayDurationSeconds"
                      min="0"
                      max="59"
                      value={heroDisplayDurationSeconds}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                        setHeroDisplayDurationSeconds(val);
                      }}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Valid range: 1 second to 10 minutes (600 seconds). Example: 1 min 20 secs = 80 seconds total.
                </p>
                {(typeof heroDisplayDurationMinutes === 'number' && heroDisplayDurationMinutes > 0) || (typeof heroDisplayDurationSeconds === 'number' && heroDisplayDurationSeconds > 0) ? (
                  <div className="mt-2 text-sm text-blue-700 font-medium">
                    Total: {(() => {
                      const min = typeof heroDisplayDurationMinutes === 'number' ? heroDisplayDurationMinutes : 0;
                      const sec = typeof heroDisplayDurationSeconds === 'number' ? heroDisplayDurationSeconds : 0;
                      const total = min * 60 + sec;
                      if (total === 0) return '0 seconds (will use default)';
                      if (total < 60) return `${total} secs`;
                      const m = Math.floor(total / 60);
                      const s = total % 60;
                      return s === 0 ? `${m} min` : `${m} min ${s} secs`;
                    })()}
                  </div>
                ) : null}
              </div>
            )}

            {/* Checkboxes - Using proper UI style guide implementation */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-4">Media Options</label>
              <div className="custom-grid-table mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['eventFlyer', 'isHeroImage', 'isActiveHeroImage', 'isPublic', 'isFeaturedVideo', 'isFeaturedEventImage', 'isLiveEventImage', 'isHomePageHeroImage'].map(key => (
                  <label key={key} className="flex flex-col items-center">
                    <span className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name={key}
                        className="custom-checkbox"
                        checked={!!formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        onClick={handleCheckboxClick}
                      />
                      <span className="custom-checkbox-tick">
                        {formData[key as keyof typeof formData] && (
                          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                          </svg>
                        )}
                      </span>
                    </span>
                    <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end items-center gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isSubmitting}
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
                type="button"
                onClick={handleSaveClick}
                disabled={isSubmitting}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title={isSubmitting ? 'Saving...' : 'Save Changes'}
                aria-label={isSubmitting ? 'Saving...' : 'Save Changes'}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  {isSubmitting ? (
                    <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-blue-700">{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded shadow" style={{ paddingTop: '118px' }}>
      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/media/list`}
            className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Media Files"
            aria-label="Manage Media Files"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
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
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
              </svg>
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
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
        </div>
      </div>
      {/* Upload Files and Go to Uploaded Media buttons at the top */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          type="button"
          className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          onClick={() => uploadFormDivRef.current?.scrollIntoView({ behavior: 'smooth' })}
          title="Upload Files"
          aria-label="Upload Files"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="font-semibold text-green-700">Upload Files</span>
        </button>
        <button
          type="button"
          className="flex-shrink-0 h-14 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          onClick={() => uploadedMediaSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          title="Go to Uploaded Media Files"
          aria-label="Go to Uploaded Media Files"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-yellow-700">Go to Uploaded Media Files</span>
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        Upload Media Files for Event
        <div className="mt-3 mb-2 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 shadow-sm text-lg font-semibold text-blue-900">
          {eventDetails ? (
            <div className="mt-2 w-full max-w-2xl">
              <table className="min-w-full border border-blue-200 rounded bg-blue-50 text-xs md:text-sm">
                <tbody>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2 w-32">Event ID</td>
                    <td className="border border-blue-200 px-3 py-2 font-mono text-blue-800 bg-blue-100">{eventDetails.id}</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2">Title</td>
                    <td className="border border-blue-200 px-3 py-2 text-blue-900 bg-blue-100 font-bold">{eventDetails.title}</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2">Start Date</td>
                    <td className="border border-blue-200 px-3 py-2">{eventDetails.startDate}</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2">End Date</td>
                    <td className="border border-blue-200 px-3 py-2">{eventDetails.endDate}</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2">Start Time</td>
                    <td className="border border-blue-200 px-3 py-2">{eventDetails.startTime || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2">End Time</td>
                    <td className="border border-blue-200 px-3 py-2">{eventDetails.endTime || 'N/A'}</td>
                  </tr>
                  {eventDetails.description && (
                    <tr>
                      <td className="border border-blue-200 font-semibold text-blue-700 px-3 py-2 align-top">Description</td>
                      <td className="border border-blue-200 px-3 py-2 text-blue-800 bg-blue-100 whitespace-pre-line">{eventDetails.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="text-red-600 text-base font-medium">Event not found</span>
          )}
        </div>
      </h1>

      {/* Upload form */}
      <div ref={uploadFormDivRef} className="mt-8 mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-xl font-bold mb-4">Media File Upload Form</div>

        {/* Image Resizing Guidelines */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">📏 Image Resizing Guidelines</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>Need to resize your image before uploading?</strong> You can use the online image resizer tool:</p>
                <p className="font-medium text-yellow-800">Steps to resize images:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                  <li>Visit <a href="https://imageresizer.com/resize/editor" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://imageresizer.com/resize/editor</a></li>
                  <li>Upload your image to the tool</li>
                  <li><strong>Uncheck</strong> the checkbox labeled <strong>'Lock Aspect Ratio'</strong></li>
                  <li><strong>Uncheck</strong> the checkbox labeled <strong>'Background Fill'</strong></li>
                  <li>Enter the desired width and height in the text fields</li>
                  <li>Click <strong>Export</strong> to download the resized image</li>
                </ol>
                <p className="text-xs text-yellow-600 mt-2 italic">
                  <strong>Important:</strong> If you want your image to be displayed as a hero image in the home page Hero section, please make sure to check the <strong>'Home Page Hero Image'</strong> checkbox in the form below after uploading.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image Specifications Tip */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📸 Hero Image Specifications</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>For Hero Images:</strong> Use <strong>1200×800px (3:2 landscape)</strong> for optimal display in the home page hero rotation. Portrait (e.g. 800×1200) will make the hero section excessively tall.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="font-medium text-blue-800">Optimal Dimensions:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• <strong>Desktop:</strong> 1200×800px (3:2 ratio)</li>
                      <li>• <strong>Mobile:</strong> 900×600px (3:2 ratio)</li>
                      <li>• <strong>Format:</strong> WebP preferred, JPG acceptable</li>
                      <li>• <strong>Quality:</strong> 80-85%</li>
                      <li>• <strong>File Size:</strong> Under 300KB</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Content Guidelines:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• Main subject in center or upper 60% of frame</li>
                      <li>• Text readable at 50% scale</li>
                      <li>• High contrast for overlay visibility</li>
                      <li>• Professional, culturally relevant style</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 italic">Landscape 3:2 fits the hero display area; portrait images are not recommended.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Event Image Specifications Tip - Home page event strip card (see documentation/HOME_PAGE_EVENT_STRIP_IMAGE_SPEC.md) */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Featured Event Image — Home Page Event Strip</h3>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>Where it appears:</strong> Home page → Live and Featured event strips → left column of each event card (70% width × 200px on desktop; full width × 192px on mobile). Image fills the slot and may be cropped (object-cover).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="font-medium text-green-800">Recommended specs:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• <strong>Aspect:</strong> Landscape 4∶1 to 2∶1</li>
                      <li>• <strong>Size:</strong> 1200×600px or 1600×400px (min 1200×400px)</li>
                      <li>• <strong>Format:</strong> WebP preferred, JPEG acceptable</li>
                      <li>• <strong>File size:</strong> Under 300 KB</li>
                      <li>• <strong>Retina:</strong> 2400px on long side if possible</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Content & safe zone:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• Keep important content in the <strong>center 60%</strong></li>
                      <li>• <strong>Top-left</strong> and <strong>bottom-right</strong> can be covered by &quot;Featured Event&quot; badge and Buy Tickets/Donate button</li>
                      <li>• Event photo, flyer, or promotional graphic; good contrast beside the light right panel</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 italic">Landscape 2∶1 or 4∶1 ensures the image fills the strip card without heavy cropping; center composition stays visible on all screen sizes.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${title.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'
              }`}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            rows={2}
          />
          <div className="flex flex-col gap-4 mt-2 mb-2">
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                ? 'border-blue-500 bg-blue-50'
                : files && files.length > 0
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                {isDragOver ? (
                  <div className="text-blue-600">
                    <FaUpload className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Drop files here to upload</p>
                  </div>
                ) : files && files.length > 0 ? (
                  <div className="text-green-600">
                    <FaPhotoVideo className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">{files.length} file(s) selected</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {Array.from(files).map((file, idx) => (
                        <span key={idx} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-xs truncate max-w-xs" title={file.name}>
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <FaFolderOpen className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold mb-2">Drag & drop files here</p>
                    <p className="text-sm">or click the button below to browse</p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
              />
            </div>

            {/* Choose Files Buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              <label className="relative cursor-pointer">
                <span className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-700">Browse Files</span>
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
                />
              </label>

              <label className="relative cursor-pointer">
                <span className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">Upload Folder</span>
                </span>
                <input
                  type="file"
                  {...({ webkitdirectory: '' } as any)}
                  onChange={handleFolderChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
                />
              </label>
            </div>

            {/* Info message about folder upload */}
            {files && files.length > 0 && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">{files.length} file{files.length !== 1 ? 's' : ''}</span> selected for upload
                </p>
              </div>
            )}
          </div>

          {/* Start Displaying From Date Field */}
          <div className="mt-4 mb-4">
            <label htmlFor="startDisplayingFromDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Displaying From Date *
            </label>
            <input
              type="date"
              id="startDisplayingFromDate"
              name="startDisplayingFromDate"
              value={startDisplayingFromDate}
              onChange={e => setStartDisplayingFromDate(e.target.value)}
              className={`border rounded px-3 py-2 w-48 ${startDisplayingFromDate.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'}`}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Select the date when this media should start being displayed</p>
          </div>

          {focusGroupOptions.length > 0 && (
            <div className="mt-4 mb-4">
              <label htmlFor="upload-focus-group" className="block text-sm font-medium text-gray-700 mb-2">
                Focus group (optional)
              </label>
              <select
                id="upload-focus-group"
                value={eventFocusGroupId ?? ''}
                onChange={e => setEventFocusGroupId(e.target.value === '' ? null : Number(e.target.value))}
                className="border rounded px-3 py-2 border-gray-300"
              >
                <option value="">None</option>
                {focusGroupOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Associate this media with a focus group for this event</p>
            </div>
          )}

          <div className="custom-grid-table mt-2 mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={eventFlyer} onChange={e => setEventFlyer(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {eventFlyer && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Event Flyer</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isEventManagementOfficialDocument} onChange={e => setIsEventManagementOfficialDocument(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isEventManagementOfficialDocument && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Official Document</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isHeroImage} onChange={e => setIsHeroImage(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isHeroImage && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Hero Image</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isActiveHeroImage} onChange={e => setIsActiveHeroImage(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isActiveHeroImage && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Active Hero Image</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isFeaturedEventImage} onChange={e => setIsFeaturedEventImage(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isFeaturedEventImage && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Featured Event Image</span>
                {isFeaturedEventImage && (
                  <p className="mt-1.5 text-[10px] text-green-700 text-center max-w-[6rem] leading-tight" title="Home event strip: Use a landscape image (e.g. 1200×600px). Center important content; corners may be cropped or covered by overlays.">
                    Tip: Landscape 1200×600px; center content; corners may be covered.
                  </p>
                )}
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isLiveEventImage} onChange={e => setIsLiveEventImage(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isLiveEventImage && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Live Event Image</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isPublic && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Public</span>
              </label>
            </div>
            <div className="custom-grid-cell">
              <label className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input type="checkbox" className="custom-checkbox" checked={isHomePageHeroImage} onChange={e => setIsHomePageHeroImage(e.target.checked)} />
                  <span className="custom-checkbox-tick">
                    {isHomePageHeroImage && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Home Page Hero Image</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-2">
            <input
              type="text"
              placeholder="Alt Text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={displayOrder ?? ''}
              onChange={e => setDisplayOrder(e.target.value ? Number(e.target.value) : undefined)}
              className="border border-gray-300 rounded px-3 py-2 w-40 appearance-auto"
              style={{ MozAppearance: 'textfield', appearance: 'auto' }}
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={uploading}
            title={uploading ? 'Uploading...' : 'Upload Images'}
            aria-label={uploading ? 'Uploading...' : 'Upload Images'}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              {uploading ? (
                <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <span className="font-semibold text-blue-700">{uploading ? 'Uploading...' : 'Upload Images'}</span>
          </button>
          {message && (
            <div className={`mt-4 text-2xl font-extrabold italic drop-shadow-sm tracking-wide ${message.includes('successful') ? 'text-green-600' : 'text-blue-700'}`}
              style={{ background: 'none', border: 'none' }}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Uploaded Media Table */}
      <div ref={uploadedMediaSectionRef} className="mt-8">
        <div className="mb-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-4 py-2">
          Mouse over the first 2 columns (Title, Type) to see full details about the item. Use the × button to close the tooltip.
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Uploaded Media Files</h2>
            <Link
              href={`/admin/events/${eventId}/media/list`}
              className="flex-shrink-0 h-14 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="View Full Files List"
              aria-label="View Full Files List"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-yellow-700">View Full Files List</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyEventFlyers}
                onChange={e => setShowOnlyEventFlyers(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Show only Event Flyers</span>
            </label>
          </div>
        </div>

        {mediaList.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No media files uploaded yet.</div>
        ) : (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pagedMedia.map((media, index) => {
                const serialNumber = mediaPage * mediaPageSize + index + 1;
                return (
                  <div
                    key={media.id}
                    data-serial-number={serialNumber}
                    className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="relative h-48 bg-gray-200 cursor-pointer"
                        onMouseEnter={e => handleCellMouseEnter(media, e as any, 'uploadedMedia')}
                        onMouseLeave={handleCellMouseLeave}
                      >
                        {/* Serial number overlay */}
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                          #{serialNumber}
                        </div>
                        {media.fileUrl && (
                          <img
                            src={media.fileUrl.startsWith('http') ? media.fileUrl : `https://placehold.co/600x400?text=${media.title}`}
                            alt={media.altText || media.title || ''}
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
                        <h3 className="font-semibold text-lg truncate" title={media.title || ''}>{media.title}</h3>
                        <p className="text-gray-600 text-sm h-10 overflow-hidden" title={media.description || ''}>{media.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {media.createdAt ? new Date(media.createdAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          console.log('Edit icon clicked', media);
                          setEditMedia(media);
                        }}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Edit Media"
                        aria-label="Edit Media"
                      >
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(media.id!)}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Delete Media"
                        aria-label="Delete Media"
                      >
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls - Always visible, matching admin page style */}
            {(() => {
              const totalCount = filteredMediaList.length;
              const totalPages = Math.ceil(totalCount / mediaPageSize) || 1;
              const displayPage = mediaPage + 1; // Convert 0-based to 1-based for display
              const currentPageZeroBased = mediaPage;
              const startItem = totalCount > 0 ? currentPageZeroBased * mediaPageSize + 1 : 0;
              const endItem = totalCount > 0 ? currentPageZeroBased * mediaPageSize + Math.min(mediaPageSize, totalCount - currentPageZeroBased * mediaPageSize) : 0;
              const isPrevDisabled = currentPageZeroBased === 0;
              const isNextDisabled = currentPageZeroBased >= totalPages - 1;

              return (
                <div className="mt-8">
                  <div className="flex justify-between items-center">
                    {/* Previous Button */}
              <button
                onClick={() => setMediaPage(p => Math.max(0, p - 1))}
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
                        Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
                    </div>

                    {/* Next Button */}
              <button
                onClick={() => setMediaPage(p => p + 1)}
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
                          Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> media items
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-orange-700">No media found</span>
                        <span className="text-sm text-orange-600">[No media items match your criteria]</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      {mounted && (
        <MediaDetailsTooltip
          media={tooltipMedia}
          anchorRect={tooltipAnchorRect}
          onClose={handleTooltipMouseLeave}
          onTooltipMouseEnter={handleTooltipMouseEnter}
          onTooltipMouseLeave={handleTooltipMouseLeave}
          tooltipType={tooltipType}
        />
      )}
      {editMedia && (
        <EditMediaModal
          media={editMedia}
          onClose={() => setEditMedia(null)}
          onSave={handleEditSave}
        />
      )}
      {/* Success Dialog */}
      {showSuccessDialog && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative bg-green-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowSuccessDialog(false);
                window.location.reload();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="bg-green-100 rounded-full p-4 flex items-center justify-center">
                <FaCheckCircle className="w-12 h-12 text-green-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-green-800">
                Upload Successful!
              </h3>

              {/* Message */}
              <div className="text-sm text-green-800 leading-relaxed">
                <p>Your media files have been uploaded successfully.</p>
                <p className="mt-2">The page will refresh automatically to show the new files.</p>
              </div>

              {/* OK Button */}
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  window.location.reload();
                }}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMedia(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Media"
        message={`Are you sure you want to delete "${selectedMedia?.title || 'this media item'}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}