'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { GalleryAlbumDTO, EventMediaDTO } from '@/types';
import { setAlbumCoverImageServer } from '../../ApiServerActions';
import { Modal } from '@/components/Modal';

interface AlbumMediaClientPageProps {
  albumId: number;
  album: GalleryAlbumDTO;
  initialMediaList: EventMediaDTO[];
  userProfileId: number | null;
}

export default function AlbumMediaClientPage({
  albumId,
  album,
  initialMediaList,
  userProfileId,
}: AlbumMediaClientPageProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<EventMediaDTO[]>(initialMediaList);
  const [coverImageUrl, setCoverImageUrl] = useState(album.coverImageUrl || '');
  const [settingCoverMediaId, setSettingCoverMediaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(initialMediaList.length);
  const [isPublic, setIsPublic] = useState(true);
  const [altText, setAltText] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);
  const [startDisplayingFromDate, setStartDisplayingFromDate] = useState('');
  const [editMedia, setEditMedia] = useState<EventMediaDTO | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const uploadFormDivRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Load media when component mounts, albumId changes, or page changes
  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, page]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      // Fetch media from API proxy endpoint with pagination
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      const params = new URLSearchParams();
      params.append('tenantId.equals', tenantId || '');
      params.append('albumId.equals', albumId.toString());
      params.append('page', page.toString());
      params.append('size', pageSize.toString());
      params.append('sort', 'displayOrder,asc');
      params.append('sort', 'updatedAt,desc');

      const url = `/api/proxy/event-medias?${params.toString()}`;
      console.log('Loading media from:', url);
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const media: EventMediaDTO[] = await res.json();
        console.log('Loaded media:', media.length, 'items');
        setMediaList(Array.isArray(media) ? media : []);

        // Get total count from header
        const totalCountHeader = res.headers.get('X-Total-Count');
        if (totalCountHeader) {
          const count = parseInt(totalCountHeader, 10);
          console.log('Total count from header:', count);
          setTotalCount(count);
        } else {
          // Fallback: if no header, use array length (might be inaccurate for pagination)
          const fallbackCount = Array.isArray(media) ? media.length : 0;
          console.log('Total count fallback (from array length):', fallbackCount);
          setTotalCount(fallbackCount);
        }
      } else {
        console.error('Failed to fetch media:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage('Title is required. Please provide a title for your media files.');
      return;
    }

    if (!startDisplayingFromDate.trim()) {
      setMessage('Start Displaying From date is required.');
      return;
    }

    if (!files || files.length === 0) {
      setMessage('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      // Append each file
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Get tenant ID from environment variable (available on client)
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      if (!tenantId) {
        throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables');
      }

      // Get app URL from environment variable (available on client)

      // Append album-specific parameters
      formData.append('albumId', String(albumId));
      formData.append('eventId', ''); // Empty string to indicate no event association
      formData.append('isPublic', String(isPublic));
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

      formData.append('startDisplayingFromDate', startDisplayingFromDate);

      // Use the proxy endpoint directly from client
      const url = `/api/proxy/event-medias/upload-multiple`;

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const result = await res.json();
      console.log('Upload successful, result:', result);

      // Extract media from the upload response
      const uploadedMedia: EventMediaDTO[] = Array.isArray(result) ? result : [];

      // CRITICAL: Update each uploaded media to set albumId
      // The backend upload endpoint doesn't accept albumId, so we need to update it after upload
      // Use the full media data from upload response to include all required fields
      if (uploadedMedia.length > 0) {
        try {
          console.log(`Updating ${uploadedMedia.length} media items with albumId=${albumId}`);

          // Update each media item via PATCH request using the full data from upload response
          const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
          for (const media of uploadedMedia) {
            if (!media.id) continue;

            const updateUrl = `/api/proxy/event-medias/${media.id}`;
            // Use the full media object from upload response, ensuring all required fields are properly typed
            // CRITICAL: Backend requires all these fields to be non-null, so we must include them explicitly
            const updatePayload: Partial<EventMediaDTO> = {
              // Required fields - must be non-null
              id: media.id!,
              title: media.title || '',
              eventMediaType: media.eventMediaType || 'image/jpeg',
              storageType: media.storageType || 'S3',
              createdAt: media.createdAt || new Date().toISOString(),
              isHomePageHeroImage: Boolean(media.isHomePageHeroImage ?? false),
              isFeaturedEventImage: Boolean(media.isFeaturedEventImage ?? false),
              isLiveEventImage: Boolean(media.isLiveEventImage ?? false),
              // Fields we're updating
              albumId, // Set albumId
              eventId: null, // Clear event association
              tenantId: tenantId || media.tenantId,
              updatedAt: new Date().toISOString(),
              // Include all other fields from upload response
              description: media.description,
              fileUrl: media.fileUrl,
              contentType: media.contentType,
              fileSize: media.fileSize,
              isPublic: media.isPublic !== undefined ? Boolean(media.isPublic) : undefined,
              eventFlyer: media.eventFlyer !== undefined ? Boolean(media.eventFlyer) : undefined,
              isEventManagementOfficialDocument: media.isEventManagementOfficialDocument !== undefined ? Boolean(media.isEventManagementOfficialDocument) : undefined,
              preSignedUrl: media.preSignedUrl,
              preSignedUrlExpiresAt: media.preSignedUrlExpiresAt,
              altText: media.altText,
              displayOrder: media.displayOrder,
              downloadCount: media.downloadCount,
              isFeaturedVideo: media.isFeaturedVideo !== undefined ? Boolean(media.isFeaturedVideo) : undefined,
              featuredVideoUrl: media.featuredVideoUrl,
              isHeroImage: media.isHeroImage !== undefined ? Boolean(media.isHeroImage) : undefined,
              isActiveHeroImage: media.isActiveHeroImage !== undefined ? Boolean(media.isActiveHeroImage) : undefined,
              uploadedById: media.uploadedById,
              startDisplayingFromDate: media.startDisplayingFromDate,
              sponsorId: media.sponsorId,
              eventSponsorsJoinId: media.eventSponsorsJoinId,
              performerId: media.performerId,
              directorId: media.directorId,
              priorityRanking: media.priorityRanking,
            };

            const updateRes = await fetch(updateUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/merge-patch+json' },
              body: JSON.stringify(updatePayload),
            });

            if (!updateRes.ok) {
              const errorText = await updateRes.text();
              console.error(`Failed to update media ${media.id} with albumId:`, errorText);
              throw new Error(`Failed to update media ${media.id}: ${errorText}`);
            }
          }
          console.log('Successfully updated all media with albumId');
        } catch (updateError: any) {
          console.error('Failed to update media with albumId:', updateError);
          setMessage(`Upload successful but failed to associate with album: ${updateError.message}`);
        }
      }

      setShowSuccessDialog(true);
      setFiles(null);
      setTitle('');
      setDescription('');
      setAltText('');
      setDisplayOrder(undefined);
      setStartDisplayingFromDate('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';

      // Reset to page 0 to show the newly uploaded media (newest first)
      // The useEffect will trigger loadMedia() when page changes
      setPage(0);

      // Also immediately reload to ensure we see the new media
      // Add a small delay to ensure backend has processed the update
      setTimeout(async () => {
        await loadMedia();
      }, 500);

      // Auto-close success dialog after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (err: any) {
      setMessage(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (updated: Partial<EventMediaDTO>) => {
    if (!editMedia || !editMedia.id) return;
    setEditLoading(true);
    try {
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      const payload = {
        ...updated,
        id: editMedia.id,
        tenantId,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/proxy/event-medias/${editMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      await loadMedia();
      setEditMedia(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    try {
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      const res = await fetch(`/api/proxy/event-medias/${mediaId}?tenantId.equals=${tenantId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      // Reload media and reset to page 0 if current page is empty
      await loadMedia();

      // If current page is empty after deletion, go to previous page
      if (mediaList.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveFromAlbum = async (mediaId: number) => {
    if (!confirm('Remove this media from the album? The media file will not be deleted.')) return;
    try {
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      const payload = {
        id: mediaId,
        albumId: null,
        tenantId,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/proxy/event-medias/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      // Reload media and reset to page 0 if current page is empty
      await loadMedia();

      // If current page is empty after removal, go to previous page
      if (mediaList.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSetCoverImage = async (media: EventMediaDTO) => {
    if (!media.fileUrl) {
      alert('Media does not have a file URL');
      return;
    }
    if (media.id == null) {
      alert('Media does not have a valid ID');
      return;
    }
    setSettingCoverMediaId(media.id);
    try {
      await setAlbumCoverImageServer(albumId, media.fileUrl);
      setCoverImageUrl(media.fileUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to set cover image';
      alert(`Error: ${message}`);
    } finally {
      setSettingCoverMediaId(null);
    }
  };

  const isCoverMedia = (media: EventMediaDTO) =>
    Boolean(media.fileUrl && coverImageUrl && media.fileUrl === coverImageUrl);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-semibold text-indigo-700">Admin Dashboard</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/admin/gallery/albums" className="ml-1 text-sm font-medium text-gray-500 md:ml-2 hover:text-gray-700">
                Albums
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{album.title}</span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Media</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{album.title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage media files for this album
            </p>
          </div>
          <Link
            href={`/admin/gallery/albums/${albumId}/edit`}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Edit Album"
            aria-label="Edit Album"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Edit Album</span>
          </Link>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter title for media files"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description (optional)"
            />
          </div>

          {/* Drag and Drop Area */}
          <div
            ref={uploadFormDivRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {uploading ? (
              <div className="text-blue-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-lg font-semibold">Uploading...</p>
              </div>
            ) : files && files.length > 0 ? (
              <div className="text-green-600">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {Array.from(files).slice(0, 10).map((file, idx) => (
                    <span key={idx} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-xs truncate max-w-xs" title={file.name}>
                      {file.name}
                    </span>
                  ))}
                  {files.length > 10 && <span className="text-sm text-gray-600">...and {files.length - 10} more</span>}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-lg font-semibold mb-2">Drag & drop files here</p>
                <p className="text-sm">or click the buttons below to browse</p>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
            />
            <input
              type="file"
              {...({ webkitdirectory: '' } as any)}
              ref={folderInputRef}
              onChange={handleFolderChange}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.svg"
            />
          </div>

          {/* File Selection Buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded shadow-sm border border-blue-700 transition-colors inline-block text-center min-w-[160px] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Browse Files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow-sm border border-green-700 transition-colors inline-block text-center min-w-[160px] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Upload Folder
            </button>
          </div>

          {/* Start Displaying From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDisplayingFromDate">
              Start Displaying From Date *
            </label>
            <input
              id="startDisplayingFromDate"
              type="date"
              value={startDisplayingFromDate}
              onChange={(e) => setStartDisplayingFromDate(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Select the date when this media should start being displayed</p>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="altText">
                Alt Text
              </label>
              <input
                id="altText"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alt text for images (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="displayOrder">
                Display Order
              </label>
              <input
                id="displayOrder"
                type="number"
                value={displayOrder || ''}
                onChange={(e) => setDisplayOrder(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Public Checkbox */}
          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make media public (visible in gallery)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !files || files.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>

          {/* Error Message */}
          {message && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media...</p>
        </div>
      )}

      {/* Media Grid */}
      {!loading && mediaList.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 border border-gray-600/30 shadow-2xl mb-8">
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent 55%)' }} />
          <div className="relative px-6 py-10 sm:px-10 lg:px-14">
            <h2 className="text-2xl font-bold text-white mb-6">Album Media ({totalCount} total)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media) => (
                <div key={media.id} className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col">
                  {/* Media Preview */}
                  <div className="relative h-48 bg-gray-200">
                    {isCoverMedia(media) && (
                      <span className="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-purple-600 text-white shadow-md">
                        Album Cover
                      </span>
                    )}
                    {media.fileUrl ? (
                      media.fileUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i) ? (
                        <video
                          src={media.fileUrl}
                          className="w-full h-full object-cover"
                          controls={false}
                        />
                      ) : (
                        <Image
                          src={media.fileUrl}
                          alt={media.altText || media.title || 'Media'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-lg truncate mb-1">{media.title || 'Untitled'}</h3>
                    {media.description && (
                      <p className="text-gray-600 text-sm h-10 overflow-hidden">{media.description}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0 flex justify-end gap-2">
                    <button
                      onClick={() => handleSetCoverImage(media)}
                      disabled={settingCoverMediaId === media.id || isCoverMedia(media)}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title={isCoverMedia(media) ? 'Current album cover' : 'Set as Cover Image'}
                      aria-label={isCoverMedia(media) ? 'Current album cover' : 'Set as Cover Image'}
                      type="button"
                    >
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditMedia(media)}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Edit Media"
                      aria-label="Edit Media"
                      type="button"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveFromAlbum(media.id!)}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Remove from Album"
                      aria-label="Remove from Album"
                      type="button"
                    >
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(media.id!)}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Delete Media"
                      aria-label="Delete Media"
                      type="button"
                    >
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalCount > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
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
                Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1 || loading}
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
            {totalCount > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{Math.min(page * pageSize + 1, totalCount)}</span> to <span className="font-bold text-blue-600">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-bold text-blue-600">{totalCount}</span> media files
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && mediaList.length === 0 && totalCount === 0 && !uploading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media files yet</h3>
          <p className="text-gray-600">Upload media files using the form above</p>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <Modal
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          title="Upload Successful"
        >
          <div className="text-center py-4">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-900 mb-2">Media uploaded successfully!</p>
            <p className="text-sm text-gray-600">The media files have been added to this album.</p>
          </div>
        </Modal>
      )}

      {/* Edit Media Modal */}
      {editMedia && (
        <EditMediaModal
          media={editMedia}
          onClose={() => setEditMedia(null)}
          onSave={handleEdit}
          loading={editLoading}
        />
      )}
    </div>
  );
}

// Edit Media Modal Component
function EditMediaModal({
  media,
  onClose,
  onSave,
  loading,
}: {
  media: EventMediaDTO;
  onClose: () => void;
  onSave: (updated: Partial<EventMediaDTO>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    title: media.title || '',
    description: media.description || '',
    altText: media.altText || '',
    isPublic: media.isPublic ?? true,
    displayOrder: media.displayOrder || 0,
    startDisplayingFromDate: media.startDisplayingFromDate ?
      (typeof media.startDisplayingFromDate === 'string' ?
        media.startDisplayingFromDate.split('T')[0] :
        new Date(media.startDisplayingFromDate).toISOString().split('T')[0]) : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const payload: Partial<EventMediaDTO> = {
      ...form,
      id: media.id,
      updatedAt: new Date().toISOString(),
      startDisplayingFromDate: form.startDisplayingFromDate ? new Date(form.startDisplayingFromDate).toISOString().split('T')[0] : undefined,
      eventMediaType: media.eventMediaType || 'gallery',
      storageType: media.storageType || 's3',
    };
    await onSave(payload);
  };

  return (
    <Modal open={true} onClose={onClose} title="Edit Media">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-title">
            Title *
          </label>
          <input
            id="edit-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-description">
            Description
          </label>
          <textarea
            id="edit-description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-altText">
            Alt Text
          </label>
          <input
            id="edit-altText"
            type="text"
            value={form.altText}
            onChange={(e) => setForm(prev => ({ ...prev, altText: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-displayOrder">
            Display Order
          </label>
          <input
            id="edit-displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-startDisplayingFromDate">
            Start Displaying From Date
          </label>
          <input
            id="edit-startDisplayingFromDate"
            type="date"
            value={form.startDisplayingFromDate}
            onChange={(e) => setForm(prev => ({ ...prev, startDisplayingFromDate: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="edit-isPublic"
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="edit-isPublic" className="ml-2 block text-sm text-gray-700">
            Make media public (visible in gallery)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

