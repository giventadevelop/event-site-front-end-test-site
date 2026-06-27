"use client";
import React, { useRef, useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EventMediaDTO } from "@/types";
import { FaUsers, FaPhotoVideo, FaCalendarAlt, FaTimes, FaChevronLeft, FaChevronRight, FaTicketAlt, FaUpload, FaTags, FaHome, FaFolderOpen } from 'react-icons/fa';
import AdminNavigation from '@/components/AdminNavigation';
import { Modal } from "@/components/Modal";
import { formatInTimeZone } from 'date-fns-tz';
import EventFormHelpTooltip from '@/components/EventFormHelpTooltip';
import MediaImageSpecHelpContent from '@/components/MediaImageSpecHelpContent';
import { getClientTenantId } from '@/lib/env';
import { normalizeEventMediasList } from '@/lib/homepage/homepageApiNormalize';
import {
  buildOfficialDocumentThumbnailCacheKey,
  getEventMediaDisplayThumbnailUrl,
  getOfficialDocumentCardThumbnailSrc,
  getOfficialDocumentPlaceholderKind,
  hasStoredOfficialDocumentThumbnail,
  placeholderGradient,
  placeholderLabel,
} from '@/lib/officialDocumentThumbnail';
import {
  compareHeroMediaByDisplayOrder,
  isHeroFlaggedMedia,
  isHeroMediaDisplayDateValid,
} from '@/lib/hero/heroSliderMedia';
import { HOMEPAGE_CACHE_INVALIDATE_CHANNEL } from '@/lib/homepageCacheKeys';

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

const MAX_MEDIA_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB per file (matches other admin upload UIs)

async function parseMediaUploadError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { details?: string; message?: string; error?: string };
    if (json.details && typeof json.details === 'string' && json.details.trim()) {
      return json.details;
    }
    if (json.message) return json.message;
    if (json.error) return json.error;
  } catch {
    /* not JSON */
  }
  if (res.status === 413) {
    return 'File is too large. Use images under 10MB each, or upload fewer files at once.';
  }
  return text.trim() || `Upload failed (HTTP ${res.status})`;
}

interface EditMediaModalProps {
  media: EventMediaDTO;
  onClose: () => void;
  onSave: (updated: Partial<EventMediaDTO>) => void;
  loading: boolean;
}

type MediaCheckboxName = 'isPublic' | 'eventFlyer' | 'isEventManagementOfficialDocument' | 'isHeroImage' | 'isActiveHeroImage' | 'isFeaturedVideo' | 'isHomePageHeroImage' | 'isFeaturedEventImage' | 'isLiveEventImage';

function EditMediaModal({ media, onClose, onSave, loading }: EditMediaModalProps) {
  console.log('EditMediaModal - media object:', media);
  
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
    homePageHeroDisplayDurationSeconds: media.homePageHeroDisplayDurationSeconds || undefined,
  }));

  // Sync duration fields when media changes
  useEffect(() => {
    const duration = secondsToMinutesAndSeconds(media.homePageHeroDisplayDurationSeconds);
    setHeroDisplayDurationMinutes(duration.minutes);
    setHeroDisplayDurationSeconds(duration.seconds);
  }, [media]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      // Convert minutes + seconds to total seconds for homePageHeroDisplayDurationSeconds
      const minutes = typeof heroDisplayDurationMinutes === 'number' ? heroDisplayDurationMinutes : 0;
      const seconds = typeof heroDisplayDurationSeconds === 'number' ? heroDisplayDurationSeconds : 0;
      const totalSeconds = minutes * 60 + seconds;
      
      const payload = {
        ...form,
        updatedAt: new Date().toISOString(),
        homePageHeroDisplayDurationSeconds: totalSeconds > 0 && totalSeconds <= 600 ? totalSeconds : (form.isHomePageHeroImage ? null : undefined),
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
      console.log('EditMediaModal - payload being sent:', payload);
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
            <label className="block text-sm font-medium text-gray-700" htmlFor="displayOrder">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              value={form.displayOrder ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  displayOrder: raw === '' ? undefined : Math.max(0, parseInt(raw, 10) || 0),
                }));
              }}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers appear first in the homepage hero slider (0 = highest priority). Used when Home Page Hero or Hero Image is enabled.
            </p>
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

          {/* Home Page Hero Display Duration (shown only when isHomePageHeroImage is checked) */}
          {form.isHomePageHeroImage && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Page Hero Display Duration
              </label>
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
                      className="custom-checkbox custom-checkbox--yellow"
                      checked={Boolean(form[name])}
                      onChange={() => handleCheckboxChange(name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="custom-checkbox-tick">
                      {Boolean(form[name]) && (
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                        </svg>
                      )}
                    </span>
                  </span>
                  <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">{label}</span>
                </label>
              ))}
            </div>
            {/* Homepage hero slider tip: only standalone media (no event) appear as slides */}
            {(form.isHomePageHeroImage || form.isHeroImage) && (
              <div className="mt-4 p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                <p className="text-sm font-semibold text-amber-800 mb-1">Homepage hero slider</p>
                {media.eventId != null && media.eventId !== undefined ? (
                  <p className="text-sm text-amber-800">
                    This media is linked to <strong>Event ID {media.eventId}</strong>. The homepage hero slider only shows media that are <strong>not linked to any event</strong> (standalone). So this image will not appear as a slide until it has no event link. To have images in the slider, upload them from <strong>Admin → Media</strong> (upload there creates standalone media), then check Hero Image and Home Page Hero.
                  </p>
                ) : (
                  <p className="text-sm text-amber-800">
                    This media is standalone (no event). It can appear in the homepage hero slider. Leave display duration at 0 to use the default 8 seconds. Use a lower <strong>Display Order</strong> (e.g. 0–5) so it appears before others. Leave <strong>Start displaying from date</strong> empty so it shows immediately.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-4 sm:gap-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex-shrink-0 h-24 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-12"
            disabled={loading}
            title="Cancel"
            aria-label="Cancel"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700 text-xl">Cancel</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="flex-1 flex-shrink-0 h-24 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-12"
            disabled={loading}
            title={loading ? 'Saving...' : 'Save Changes'}
            aria-label={loading ? 'Saving...' : 'Save Changes'}
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-green-200 flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin w-20 h-20 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-20 h-20 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="font-semibold text-green-700 text-xl">{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Upload modal for /admin/media: uploads media without an event (event_id NULL). Backend/DB support null event_id. */
function UploadMediaModal({
  isOpen,
  onClose,
  onSuccess,
  onUploadStart,
  onUploadEnd,
  loading: externalLoading,
  message: externalMessage,
  setMessage: setExternalMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  loading: boolean;
  message: string | null;
  setMessage: (m: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [eventFlyer, setEventFlyer] = useState(false);
  const [isEventManagementOfficialDocument, setIsEventManagementOfficialDocument] = useState(false);
  const [isHeroImage, setIsHeroImage] = useState(false);
  const [isActiveHeroImage, setIsActiveHeroImage] = useState(false);
  const [isFeaturedEventImage, setIsFeaturedEventImage] = useState(false);
  const [isLiveEventImage, setIsLiveEventImage] = useState(false);
  const [isHomePageHeroImage, setIsHomePageHeroImage] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [startDisplayingFromDate, setStartDisplayingFromDate] = useState("");
  const [heroDisplayDurationMinutes, setHeroDisplayDurationMinutes] = useState<number | "">("");
  const [heroDisplayDurationSeconds, setHeroDisplayDurationSeconds] = useState<number | "">("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Pending folder selection: show app modal to confirm before accepting (replaces reliance on browser dialog)
  const [pendingFolder, setPendingFolder] = useState<{ files: FileList; folderName: string } | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      if (fileInputRef.current && e.target !== fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(e.target.files).forEach(file => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list && list.length > 0) {
      const first = list[0] as File & { webkitRelativePath?: string };
      const folderName = first.webkitRelativePath
        ? first.webkitRelativePath.split("/")[0]
        : "selected folder";
      setPendingFolder({ files: list, folderName });
    }
    e.target.value = "";
  };

  const confirmFolderUpload = () => {
    if (!pendingFolder) return;
    const dataTransfer = new DataTransfer();
    Array.from(pendingFolder.files).forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
    setPendingFolder(null);
  };

  const cancelFolderUpload = () => {
    setPendingFolder(null);
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  type FileHandle = { kind: "file"; getFile(): Promise<File> };
  type DirHandle = {
    kind: "directory";
    name: string;
    entries(): AsyncIterableIterator<[string, FileHandle | DirHandle]>;
  };

  /** Recursively get all File objects from a File System Access API directory handle (avoids browser "Upload X files?" dialog). */
  const getAllFilesFromHandle = async (dirHandle: DirHandle): Promise<File[]> => {
    const files: File[] = [];
    for await (const [, handle] of dirHandle.entries()) {
      if (handle.kind === "file") {
        files.push(await handle.getFile());
      } else if (handle.kind === "directory") {
        files.push(...(await getAllFilesFromHandle(handle)));
      }
    }
    return files;
  };

  const handleUploadFolderClick = async () => {
    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      folderInputRef.current?.click();
      return;
    }
    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker(): Promise<DirHandle> }).showDirectoryPicker();
      const fileList = await getAllFilesFromHandle(dirHandle);
      if (fileList.length === 0) {
        setExternalMessage("The selected folder contains no files.");
        return;
      }
      const dt = new DataTransfer();
      fileList.forEach((f) => dt.items.add(f));
      setPendingFolder({ files: dt.files, folderName: dirHandle.name });
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setExternalMessage(err instanceof Error ? err.message : "Could not read folder.");
      }
    }
  };

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

  /** Recursively read all files from a directory entry (used when user drops a folder). */
  const readDirectoryFiles = (dirEntry: FileSystemDirectoryEntry): Promise<File[]> => {
    const files: File[] = [];
    const reader = dirEntry.createReader();
    const readBatch = (): Promise<void> =>
      new Promise((resolve, reject) => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve();
            return;
          }
          Promise.all(
            entries.map((entry) => {
              if (entry.isFile) {
                return new Promise<void>((res, rej) => {
                  (entry as FileSystemFileEntry).file((file) => {
                    files.push(file);
                    res();
                  }, rej);
                });
              }
              return readDirectoryFiles(entry as FileSystemDirectoryEntry).then((sub) => files.push(...sub));
            })
          ).then(() => readBatch()).then(resolve).catch(reject);
        }, reject);
      });
    return readBatch().then(() => files);
  };

  /** Get flat list of File objects from drop; expands dropped folders so we never send directory placeholders (which cause ERR_ACCESS_DENIED). */
  const getFilesFromDrop = (dataTransfer: DataTransfer): Promise<File[]> => {
    const items = dataTransfer.items;
    if (!items || !items.length) {
      const list = dataTransfer.files ? Array.from(dataTransfer.files) : [];
      return Promise.resolve(list.filter((f) => f.size > 0 || f.type !== ""));
    }
    const files: File[] = [];
    let index = 0;
    const processNext = (): Promise<void> => {
      if (index >= items.length) return Promise.resolve();
      const item = items[index];
      index += 1;
      const entry = item.webkitGetAsEntry?.();
      if (!entry) {
        const file = item.getAsFile();
        if (file && (file.size > 0 || file.type !== "")) files.push(file);
        return processNext();
      }
      if (entry.isFile) {
        return new Promise<void>((resolve, reject) => {
          (entry as FileSystemFileEntry).file((file) => {
            files.push(file);
            resolve();
          }, reject);
        }).then(processNext);
      }
      if (entry.isDirectory) {
        return readDirectoryFiles(entry as FileSystemDirectoryEntry).then((dirFiles) => {
          files.push(...dirFiles);
          return processNext();
        });
      }
      return processNext();
    };
    return processNext().then(() => files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    getFilesFromDrop(e.dataTransfer).then((fileList) => {
      if (fileList.length === 0) {
        setExternalMessage("No valid files in the drop. Use \"Upload Folder\" to select a folder.");
        return;
      }
      const dt = new DataTransfer();
      fileList.forEach((f) => dt.items.add(f));
      setFiles(dt.files);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }).catch((err) => {
      setExternalMessage(err?.message || "Could not read dropped files. Try \"Upload Folder\" instead.");
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExternalMessage(null);
    if (!files || files.length === 0) {
      setExternalMessage("Please select at least one file to upload.");
      return;
    }
    // Exclude directory placeholders (size 0, no type) to avoid net::ERR_ACCESS_DENIED when sending FormData
    const validFiles = Array.from(files).filter((file) => file.size > 0 || file.type !== "");
    if (validFiles.length === 0) {
      setExternalMessage("No valid files to upload. Dropped folders are expanded automatically; if you still see this, use the \"Upload Folder\" button.");
      return;
    }
    const oversized = validFiles.filter((f) => f.size > MAX_MEDIA_UPLOAD_BYTES);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(', ');
      setExternalMessage(`File(s) exceed 10MB limit: ${names}. Compress or resize before uploading.`);
      return;
    }
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (!tenantId) {
      setExternalMessage("NEXT_PUBLIC_TENANT_ID is not set.");
      return;
    }
    onUploadStart();
    setUploadProgress(null);
    const total = validFiles.length;
    const buildOneFileFormData = (file: File) => {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("eventFlyer", String(eventFlyer));
      fd.append("isEventManagementOfficialDocument", String(isEventManagementOfficialDocument));
      fd.append("isHeroImage", String(isHeroImage));
      fd.append("isActiveHeroImage", String(isActiveHeroImage));
      fd.append("isFeaturedEventImage", String(isFeaturedEventImage));
      fd.append("isLiveEventImage", String(isLiveEventImage));
      fd.append("isHomePageHeroImage", String(isHomePageHeroImage));
      fd.append("isPublic", String(isPublic));
      fd.append("tenantId", tenantId);
      fd.append("isTeamMemberProfileImage", "false");
      fd.append("titles", title);
      fd.append("descriptions", description || "");
      if (startDisplayingFromDate) fd.append("startDisplayingFromDate", startDisplayingFromDate);
      if (isHomePageHeroImage) {
        const min = typeof heroDisplayDurationMinutes === "number" ? heroDisplayDurationMinutes : 0;
        const sec = typeof heroDisplayDurationSeconds === "number" ? heroDisplayDurationSeconds : 0;
        const totalSec = min * 60 + sec;
        if (totalSec > 0 && totalSec <= 600) fd.append("homePageHeroDisplayDurationSeconds", String(totalSec));
      }
      return fd;
    };
    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${total}…`);
        const formData = buildOneFileFormData(validFiles[i]);
        const res = await fetch("/api/proxy/event-medias/upload-multiple", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await parseMediaUploadError(res);
          throw new Error(err || `Upload failed for file ${i + 1} (${res.status})`);
        }
      }
      onSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setFiles(null);
      setEventFlyer(false);
      setIsEventManagementOfficialDocument(false);
      setIsHeroImage(false);
      setIsActiveHeroImage(false);
      setIsFeaturedEventImage(false);
      setIsLiveEventImage(false);
      setIsHomePageHeroImage(false);
      setStartDisplayingFromDate("");
      setHeroDisplayDurationMinutes("");
      setHeroDisplayDurationSeconds("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      setExternalMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadProgress(null);
      onUploadEnd();
    }
  };

  if (!isOpen) return null;
  return (
    <Modal open={true} onClose={onClose} title="Upload New Media (no event)" preventBackdropClose>
      <p className="text-sm text-gray-600 mb-4">
        This media will not be linked to an event. You can link it to an event later from the edit page.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3"
          />
        </div>

        {/* Drag and Drop Area - same as /admin/events/[id]/media */}
        <div className="flex flex-col gap-4 mt-2 mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Files *</label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
              ? "border-blue-500 bg-blue-50"
              : files && files.length > 0
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50"
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
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
            />
          </div>

          {/* Browse Files + Upload Folder buttons */}
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
            <button
              type="button"
              onClick={handleUploadFolderClick}
              className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Upload Folder"
              aria-label="Upload Folder"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-green-700">Upload Folder</span>
            </button>
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
              onChange={handleFolderChange}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
              tabIndex={-1}
              aria-hidden
            />
          </div>
          {files && files.length > 0 && (
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{files.length} file{files.length !== 1 ? "s" : ""}</span> selected for upload
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Displaying From Date</label>
          <input
            type="date"
            value={startDisplayingFromDate}
            onChange={e => setStartDisplayingFromDate(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3"
          />
        </div>
        {isHomePageHeroImage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Page Hero Display Duration (seconds)</label>
            <div className="flex gap-4">
              <input
                type="number"
                min={0}
                max={10}
                value={heroDisplayDurationMinutes}
                onChange={e => setHeroDisplayDurationMinutes(e.target.value === "" ? "" : Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)))}
                placeholder="Min"
                className="w-24 border border-gray-400 rounded-lg px-3 py-2"
              />
              <input
                type="number"
                min={0}
                max={59}
                value={heroDisplayDurationSeconds}
                onChange={e => setHeroDisplayDurationSeconds(e.target.value === "" ? "" : Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                placeholder="Sec"
                className="w-24 border border-gray-400 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { state: eventFlyer, set: setEventFlyer, label: "Event Flyer" },
            { state: isEventManagementOfficialDocument, set: setIsEventManagementOfficialDocument, label: "Official Doc" },
            { state: isHeroImage, set: setIsHeroImage, label: "Hero Image" },
            { state: isActiveHeroImage, set: setIsActiveHeroImage, label: "Active Hero" },
            { state: isFeaturedEventImage, set: setIsFeaturedEventImage, label: "Featured Event" },
            { state: isLiveEventImage, set: setIsLiveEventImage, label: "Live Event" },
            { state: isHomePageHeroImage, set: setIsHomePageHeroImage, label: "Home Page Hero" },
            { state: isPublic, set: setIsPublic, label: "Public" },
          ].map(({ state, set, label }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <span className="relative flex items-center justify-center flex-shrink-0">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={e => set(e.target.checked)}
                  className="custom-checkbox custom-checkbox--yellow"
                />
                <span className="custom-checkbox-tick">
                  {state && (
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm select-none">{label}</span>
            </label>
          ))}
        </div>
        {externalMessage && (
          <div className={`p-3 rounded-lg text-sm ${externalMessage.startsWith("Please") || externalMessage.includes("not set") ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800"}`}>
            {externalMessage}
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={externalLoading}
            title={externalLoading ? (uploadProgress || "Uploading…") : "Upload"}
            aria-label={externalLoading ? (uploadProgress || "Uploading…") : "Upload"}
            className="flex-1 h-12 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {externalLoading ? (uploadProgress || "Uploading…") : "Upload"}
          </button>
        </div>
      </form>

      {pendingFolder && (
        <Modal open={true} onClose={cancelFolderUpload} title={`Upload ${pendingFolder.files.length} files to this site?`}>
          <div className="text-center">
            <p className="text-lg text-gray-700">
              This will upload all files from <strong>&quot;{pendingFolder.folderName}&quot;</strong>. Do this only if you trust the site.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={cancelFolderUpload}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Cancel"
                aria-label="Cancel"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-teal-700">Cancel</span>
              </button>
              <button
                type="button"
                onClick={confirmFolderUpload}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Upload"
                aria-label="Upload"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Upload</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<EventMediaDTO[]>([]);
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
  const [heroImagesOnly, setHeroImagesOnly] = useState(false);
  /** Enabled after first paginated load with no filters, so initial load always shows all media. */
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const totalPages = Math.ceil(totalCount / pageSize);
  const router = useRouter();

  const [activeTooltip, setActiveTooltip] = useState<{ media: EventMediaDTO, type: 'uploadedMedia', serialNumber: number } | null>(null);
  const [isCellHovered, setIsCellHovered] = useState(false);
  const [isTooltipClosed, setIsTooltipClosed] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaGridRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);

  // Upload modal state (media without event - upload from /admin/media)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Bulk selection and delete
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);

  // Message popup (replaces window.alert)
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchMedia() {
        setLoading(true);
        setError(null);
        try {
          const tenantId = getClientTenantId();
          const tenantQuery = tenantId ? `&tenantId.equals=${encodeURIComponent(tenantId)}` : '';

          if (filtersEnabled && heroImagesOnly) {
            // Match homepage hero slider: merge isHeroImage + isHomePageHeroImage, sort by displayOrder.
            const [resHero, resHome] = await Promise.all([
              fetch(`/api/proxy/event-medias?size=100&sort=displayOrder,asc&isHeroImage.equals=true${tenantQuery}`),
              fetch(`/api/proxy/event-medias?size=100&sort=displayOrder,asc&isHomePageHeroImage.equals=true${tenantQuery}`),
            ]);
            if (!resHero.ok && !resHome.ok) {
              throw new Error(await parseMediaUploadError(resHero.ok ? resHome : resHero));
            }
            const seenIds = new Set<number>();
            const merged: EventMediaDTO[] = [];
            for (const res of [resHero, resHome]) {
              if (!res.ok) continue;
              const data = await res.json();
              for (const item of normalizeEventMediasList(data)) {
                if (
                  !isHeroFlaggedMedia(item) ||
                  !isHeroMediaDisplayDateValid(item) ||
                  item.id == null ||
                  seenIds.has(item.id)
                ) {
                  continue;
                }
                seenIds.add(item.id);
                merged.push(item);
              }
            }
            merged.sort(compareHeroMediaByDisplayOrder);
            const filtered = searchTerm
              ? merged.filter((m) => m.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              : merged;
            const start = page * pageSize;
            setMediaList(filtered.slice(start, start + pageSize));
            setTotalCount(filtered.length);
          } else {
          let url = `/api/proxy/event-medias?page=${page}&size=${pageSize}&sort=updatedAt,desc`;
          if (tenantId) {
            url += `&tenantId.equals=${encodeURIComponent(tenantId)}`;
          }

          if (searchTerm) {
            url += `&title.contains=${encodeURIComponent(searchTerm)}`;
          }

          if (filtersEnabled && eventFlyerOnly) {
            url += `&eventFlyer.equals=true`;
          }

          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(await parseMediaUploadError(res));
          }

          const data = await res.json();
          const list = normalizeEventMediasList(data);
          setMediaList(list);

          // Get total count from header or response (camelCase or snake_case); required for pagination
          const totalCountHeader = res.headers.get('x-total-count');
          let total = 0;
          if (totalCountHeader) {
            total = parseInt(totalCountHeader, 10) || 0;
          } else if (data?.totalElements != null) {
            total = Number(data.totalElements);
          } else if (data?.total_elements != null) {
            total = Number(data.total_elements);
          } else if (data?.totalCount != null) {
            total = Number(data.totalCount);
          } else if (data?.total_count != null) {
            total = Number(data.total_count);
          } else if (data?.totalPages != null && typeof data?.size === 'number') {
            total = Number(data.totalPages) * Number(data.size);
          } else if (data?.total_pages != null && typeof data?.size === 'number') {
            total = Number(data.total_pages) * Number(data.size);
          } else if (Array.isArray(data)) {
            total = data.length;
          } else {
            total = list.length;
          }
          setTotalCount(total);
          if (process.env.NODE_ENV === 'development' && total <= pageSize && list.length === pageSize) {
            console.warn('[Admin Media] Total count may be wrong (only one page). Response keys:', data && typeof data === 'object' ? Object.keys(data) : [], 'total:', total, 'list.length:', list.length);
          }
          }

          // Enable filter checkboxes after first successful load (no checkbox filters applied)
          if (!filtersEnabled && !eventFlyerOnly && !heroImagesOnly) {
            setFiltersEnabled(true);
          }
        } catch (e: any) {
          setError(e.message || "Failed to load media files");
          setMediaList([]);
          setTotalCount(0);
        } finally {
          setLoading(false);
        }
      }
      fetchMedia();
    }, searchTerm ? 500 : 0); // Debounce only when searching; first load immediate
    return () => clearTimeout(timer);
  }, [page, pageSize, searchTerm, eventFlyerOnly, heroImagesOnly, refreshKey]);

  function handleViewClick(media: EventMediaDTO, e: React.MouseEvent<HTMLButtonElement>, serialNumber: number) {
    e.stopPropagation();
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setActiveTooltip({ media, type: 'uploadedMedia', serialNumber });
    setIsTooltipClosed(false);
  }

  function handleCloseTooltip() {
    setActiveTooltip(null);
    setIsCellHovered(false);
    setIsTooltipClosed(true);

    // Reset the closed state after a delay to allow tooltips again
    setTimeout(() => {
      setIsTooltipClosed(false);
    }, 1500); // 1.5 second delay before allowing tooltips again
  }

  const handleScrollToSerialNumber = () => {
    const serialNumber = parseInt(serialNumberInput, 10);
    if (isNaN(serialNumber) || serialNumber < 1) {
      setAlertMessage('Please enter a valid serial number (1 or greater).');
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
      setAlertMessage(`Serial number #${serialNumber} not found on the current page. Please check the number and try again.`);
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
      const res = await fetch(`/api/proxy/event-medias/${editMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to update media');
      const result = await res.json();
      setMediaList(prev => prev.map(m => m.id === editMedia.id ? { ...m, ...result } : m));
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel(HOMEPAGE_CACHE_INVALIDATE_CHANNEL).postMessage('invalidate');
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save media:', error);
      setAlertMessage(`Error: ${error.message}`);
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
        const res = await fetch(`/api/proxy/event-medias/${deletingMedia.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete media');
        setMediaList(prev => prev.filter(m => m.id !== deletingMedia.id));
        setDeletingMedia(null);
      } catch (error: any) {
        setAlertMessage(`Failed to delete media: ${error.message}`);
        setDeletingMedia(null);
      }
    });
  };

  const toggleSelection = (id: number | undefined) => {
    if (id == null) return;
    setSelectedMediaIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedMediaIds(new Set());

  const confirmBulkDelete = async () => {
    if (selectedMediaIds.size === 0) return;
    setBulkDeletePending(true);
    try {
      const ids = Array.from(selectedMediaIds);
      for (const id of ids) {
        const res = await fetch(`/api/proxy/event-medias/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete media ${id}`);
      }
      setMediaList(prev => prev.filter(m => m.id == null || !selectedMediaIds.has(m.id)));
      setSelectedMediaIds(new Set());
      setBulkDeleteConfirmOpen(false);
    } catch (err: unknown) {
      setAlertMessage(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setBulkDeletePending(false);
    }
  };

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

  const sortedMedia = heroImagesOnly
    ? [...mediaList]
    : [...mediaList].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  const pageItemIds = sortedMedia.filter((m): m is EventMediaDTO & { id: number } => m.id != null).map(m => m.id);
  const allOnPageSelected = pageItemIds.length > 0 && pageItemIds.every(id => selectedMediaIds.has(id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedMediaIds(prev => {
        const next = new Set(prev);
        pageItemIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedMediaIds(prev => new Set([...prev, ...pageItemIds]));
    }
  };

  return (
    <div ref={pageTopRef} className="w-[80%] mx-auto py-8" style={{ paddingTop: '118px' }}>
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-items-center mx-auto max-w-6xl">
            <Link href="/admin" className="w-full max-w-xs flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:shadow-md p-2 sm:p-3 text-xs sm:text-sm transition-all duration-200">
              <FaHome className="text-base sm:text-lg mb-1.5 text-blue-600" />
              <span className="font-semibold text-center leading-tight">Admin Home</span>
            </Link>
            <Link href="/admin/manage-usage" className="w-full max-w-xs flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-sm hover:shadow-md p-2 sm:p-3 text-xs sm:text-sm transition-all duration-200">
              <FaUsers className="text-base sm:text-lg mb-1.5 text-indigo-600" />
              <span className="font-semibold text-center leading-tight">Manage Users [Usage]</span>
            </Link>
            <Link href="/admin/manage-events" className="w-full max-w-xs flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-sm hover:shadow-md p-2 sm:p-3 text-xs sm:text-sm transition-all duration-200">
              <FaCalendarAlt className="text-base sm:text-lg mb-1.5 text-green-600" />
              <span className="font-semibold text-center leading-tight">Manage Events</span>
            </Link>
            <Link href="/admin/media" className="w-full max-w-xs flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-sm hover:shadow-md p-2 sm:p-3 text-xs sm:text-sm transition-all duration-200">
              <FaPhotoVideo className="text-base sm:text-lg mb-1.5 text-cyan-600" />
              <span className="font-semibold text-center leading-tight">Manage Media</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1 min-w-0">Manage Media Files</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => { setIsUploadModalOpen(true); setUploadMessage(null); }}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
            title="Upload New Media (no event)"
            aria-label="Upload New Media"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaUpload className="w-10 h-10 text-blue-600 p-2" />
            </div>
            <span className="font-semibold text-blue-700 hidden sm:inline">Upload New Media</span>
          </button>
        </div>
      </div>

      {/* Info tip: point to ? button for image specification */}
      <div className="mb-4 px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50 shadow-sm">
        <p className="text-sm font-semibold text-amber-800">
          Image size and dimensions
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Click <strong>?</strong> button to see the image specification. Recommended sizes and aspect ratios for hero images, event flyers, and gallery media.
        </p>
      </div>

      {/* Image spec guidance - same as edit events help tip */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Image specifications for hero and event media (Section 1–3). Mouse over for details.
        </span>
        <EventFormHelpTooltip fieldName="Image specifications" title="Image specifications for hero and event media" customContent={<MediaImageSpecHelpContent />} />
      </div>

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
              className="mt-6 sm:mt-0 flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 mx-auto"
              title="Go to Image"
              aria-label="Go to Image"
              type="button"
            >
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Event flyers and hero images filters — enabled only after first load (paginated list of all media) */}
          <div className="flex flex-wrap items-center gap-4">
            <label className={`flex items-center gap-2 ${filtersEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`} title={filtersEnabled ? 'Filter by event flyers' : 'Filters enable after the list loads'}>
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="custom-checkbox custom-checkbox--yellow"
                  checked={eventFlyerOnly}
                  disabled={!filtersEnabled}
                  onChange={(e) => setEventFlyerOnly(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="custom-checkbox-tick">
                  {eventFlyerOnly && (
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-700 select-none">Event Flyers Only</span>
            </label>
            <label className={`flex items-center gap-2 ${filtersEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`} title={filtersEnabled ? 'Filter by hero images' : 'Filters enable after the list loads'}>
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="custom-checkbox custom-checkbox--yellow"
                  checked={heroImagesOnly}
                  disabled={!filtersEnabled}
                  onChange={(e) => setHeroImagesOnly(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="custom-checkbox-tick">
                  {heroImagesOnly && (
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-700 select-none">Hero Images Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm border rounded-lg px-4 py-3 text-blue-700 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold">💡 Tip:</span>
          <span>
            Click the <strong>View</strong> button on a card to see full details. Click the × button to close the dialog.
            {heroImagesOnly && (
              <> Hero list matches the homepage slider (Hero or Home Page Hero flags), sorted by <strong>Display Order</strong> (lower = first). The default poster image at the end of the slider is not stored in media.</>
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg border-2 border-red-300 bg-red-50 shadow-sm" role="alert">
          <p className="text-sm font-semibold text-red-800">Could not load media files</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {loading && <div className="text-center p-8">Loading media...</div>}
      {!loading && !error && sortedMedia.length === 0 && <div className="text-center p-8">No media found.</div>}
      {!loading && sortedMedia.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 border border-gray-600/30 shadow-2xl mb-8">
          {/* Medium Dark Radial Gradient Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent 55%)' }} />

          {/* Bulk action bar: Select all checkbox to the left of Delete selected; button always visible, enabled when at least one selected */}
          <div className="relative px-6 pt-6 sm:px-10 lg:px-14">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none order-first">
                <span className="relative flex items-center justify-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    className="custom-checkbox custom-checkbox--yellow"
                    aria-label="Select all on this page"
                  />
                  <span className="custom-checkbox-tick">
                    {allOnPageSelected && (
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="text-sm font-medium text-white">Select all on page</span>
              </label>
              <button
                type="button"
                onClick={() => selectedMediaIds.size > 0 && setBulkDeleteConfirmOpen(true)}
                disabled={selectedMediaIds.size === 0}
                className="flex-shrink-0 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold px-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                title={selectedMediaIds.size === 0 ? "Select at least one item to delete" : "Delete selected"}
                aria-label="Delete selected"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete selected
              </button>
              {selectedMediaIds.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-sm font-medium text-blue-200 hover:text-white underline"
                  >
                    Clear selection
                  </button>
                  <span className="text-sm text-white/90">
                    <span className="font-bold text-white">{selectedMediaIds.size}</span> selected
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Grid Content */}
          <div className="relative px-6 py-10 sm:px-10 lg:px-14">
            <div ref={mediaGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMedia.map((item, index) => {
            const serialNumber = page * pageSize + index + 1;
            const isSelected = item.id != null && selectedMediaIds.has(item.id);
            const displayThumbnailUrl =
              item.isEventManagementOfficialDocument && item.id != null
                ? getOfficialDocumentCardThumbnailSrc(
                    item.id,
                    {
                      fileUrl: item.fileUrl,
                      thumbnailUrl: item.thumbnailUrl,
                      thumbnailPreSignedUrl: item.thumbnailPreSignedUrl,
                      fileDataContentType: item.fileDataContentType || item.contentType,
                      title: item.title,
                      fileName: item.fileUrl?.split('/').pop(),
                    },
                    {
                      cacheKey: buildOfficialDocumentThumbnailCacheKey(item),
                      hasStoredThumbnail: hasStoredOfficialDocumentThumbnail(item),
                      thumbnailExpiresAtIso: item.thumbnailPreSignedUrlExpiresAt,
                      fileExpiresAtIso: item.preSignedUrlExpiresAt,
                    }
                  )
                : getEventMediaDisplayThumbnailUrl(item, {
                    thumbnailExpiresAtIso: item.thumbnailPreSignedUrlExpiresAt,
                    fileExpiresAtIso: item.preSignedUrlExpiresAt,
                  });
            const placeholderKind = getOfficialDocumentPlaceholderKind(item);
            return (
              <div
                key={item.id ?? `media-${serialNumber}`}
                data-serial-number={serialNumber}
                className="relative bg-white rounded-lg shadow-md overflow-hidden group flex flex-col justify-between"
              >
                {/* Checkbox: top right corner of card */}
                {item.id != null && (
                  <label className="absolute top-2 right-2 z-20 flex flex-col items-center cursor-pointer" title="Select media">
                    <span className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="custom-checkbox custom-checkbox--yellow"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select media"
                      />
                      <span className="custom-checkbox-tick">
                        {isSelected && (
                          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                          </svg>
                        )}
                      </span>
                    </span>
                  </label>
                )}
                <div>
                  <div className="relative h-48 bg-gray-200">
                    {/* Serial number overlay */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                      #{serialNumber}
                    </div>
                    {heroImagesOnly && item.displayOrder != null && (
                      <div className="absolute top-2 left-14 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg" title="Homepage hero display order">
                        Order {item.displayOrder}
                      </div>
                    )}
                    {displayThumbnailUrl ? (
                      <img
                        key={displayThumbnailUrl}
                        src={displayThumbnailUrl}
                        alt={item.altText || item.title || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/600x400?text=No+Image`;
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${placeholderGradient(placeholderKind)}`}>
                        <span className="text-2xl font-bold text-gray-600">{placeholderLabel(placeholderKind)}</span>
                        <span className="text-xs text-gray-500 mt-1 px-2 text-center truncate max-w-full">{item.eventMediaType || 'Media'}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate" title={item.title || ''}>{item.title}</h3>
                    <p className="text-gray-600 text-sm h-10 overflow-hidden" title={item.description || ''}>{item.description}</p>
                  </div>
                </div>
                {/* Action Buttons: View, Edit, Delete */}
                <div className="p-4 pt-0 flex items-center justify-start gap-1.5">
                  {/* View Button */}
                  <button
                    onClick={(e) => handleViewClick(item, e, serialNumber)}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="View details"
                    aria-label="View details"
                    type="button"
                  >
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="Edit Media"
                    aria-label="Edit Media"
                    type="button"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="Delete Media"
                    aria-label="Delete Media"
                    type="button"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={page === 0 || loading}
            className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-2 sm:px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm flex-shrink-0">
            <span className="text-xs sm:text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{totalPages}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || loading}
            className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> results
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No media found</span>
              <span className="text-sm text-orange-600">[No media match your criteria]</span>
            </div>
          )}
        </div>
      </div>

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
                className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-teal-100 disabled:border-teal-300 disabled:text-teal-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isPending}
                title="Cancel"
                aria-label="Cancel"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                  <svg className="text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-teal-700">Cancel</span>
              </button>
              <button
                onClick={confirmDelete}
                className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-red-100 disabled:border-red-300 disabled:text-red-500 disabled:cursor-not-allowed"
                disabled={isPending}
                title="Confirm Delete"
                aria-label="Confirm Delete"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">{isPending ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {bulkDeleteConfirmOpen && (
        <Modal open={bulkDeleteConfirmOpen} onClose={() => !bulkDeletePending && setBulkDeleteConfirmOpen(false)} title="Confirm bulk deletion">
          <div className="text-center">
            <p className="text-lg">
              Delete <strong>{selectedMediaIds.size}</strong> selected item{selectedMediaIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setBulkDeleteConfirmOpen(false)}
                disabled={bulkDeletePending}
                className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cancel"
                aria-label="Cancel"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                  <svg className="text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-teal-700">Cancel</span>
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeletePending}
                className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete selected"
                aria-label="Delete selected"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">{bulkDeletePending ? 'Deleting...' : 'Delete selected'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {alertMessage !== null && (
        <Modal open={true} onClose={() => setAlertMessage(null)} title="Notice">
          <div className="text-center">
            <p className="text-lg text-gray-700">{alertMessage}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setAlertMessage(null)}
                className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="OK"
                aria-label="OK"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">OK</span>
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

      {isUploadModalOpen && (
        <UploadMediaModal
          isOpen={isUploadModalOpen}
          onClose={() => { setIsUploadModalOpen(false); setUploadMessage(null); }}
          onSuccess={() => setRefreshKey(k => k + 1)}
          onUploadStart={() => setUploadLoading(true)}
          onUploadEnd={() => setUploadLoading(false)}
          loading={uploadLoading}
          message={uploadMessage}
          setMessage={setUploadMessage}
        />
      )}
      {/* View details: same Modal style as Confirm Deletion */}
      {activeTooltip?.media && (
        <Modal
          open={true}
          onClose={handleCloseTooltip}
          title={activeTooltip.serialNumber != null ? `Media Details #${activeTooltip.serialNumber}` : 'Media Details'}
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.entries(activeTooltip.media)
              .filter(([key]) => key !== 'fileUrl' && key !== 'preSignedUrl')
              .map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 py-3 first:pt-0">
                  <div className="text-sm font-semibold text-gray-700 mb-0.5">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-600">
                    {typeof value === 'boolean' ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    ) : value instanceof Date ? value.toLocaleString() :
                      (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) && value != null && value !== '' ? formatDateInTimezone(String(value), 'America/New_York') :
                        value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)}
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
}