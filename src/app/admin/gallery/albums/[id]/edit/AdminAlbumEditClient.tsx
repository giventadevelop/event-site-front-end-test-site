'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { GalleryAlbumDTO, GalleryCategoryDTO } from '@/types';
import { updateAlbumServer, deleteAlbumServer, resolveGalleryCategoryIdForSaveServer } from '../../ApiServerActions';
import { GalleryCategoryTypeahead } from '@/components/admin/gallery/GalleryCategoryTypeahead';
import GalleryAlbumCoverImageUpload from '@/components/admin/gallery/GalleryAlbumCoverImageUpload';
import { Modal } from '@/components/Modal';

interface AdminAlbumEditClientProps {
  initialAlbum: GalleryAlbumDTO;
  categories: GalleryCategoryDTO[];
}

export default function AdminAlbumEditClient({ initialAlbum, categories }: AdminAlbumEditClientProps) {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState<GalleryCategoryDTO[]>(categories);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showAdvancedCoverUrl, setShowAdvancedCoverUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: initialAlbum.title || '',
    description: initialAlbum.description || '',
    coverImageUrl: initialAlbum.coverImageUrl || '',
    isPublic: initialAlbum.isPublic ?? true,
    displayOrder: initialAlbum.displayOrder || 0,
    albumYear: initialAlbum.albumYear ?? null as number | null,
    galleryCategoryId: initialAlbum.galleryCategoryId ?? null as number | null,
    eventDateStart: initialAlbum.eventDateStart?.slice(0, 10) ?? '',
    eventDateEnd: initialAlbum.eventDateEnd?.slice(0, 10) ?? '',
    eventLocation: initialAlbum.eventLocation ?? '',
  });

  const validateEventDates = (): string | null => {
    const start = formData.eventDateStart.trim();
    const end = formData.eventDateEnd.trim();
    if (end && !start) {
      return 'Event start date is required when an end date is set.';
    }
    if (start && end && end < start) {
      return 'Event end date must be on or after the start date.';
    }
    return null;
  };

  const buildEventDatePayload = () => ({
    eventDateStart: formData.eventDateStart.trim() || null,
    eventDateEnd: formData.eventDateEnd.trim() || null,
    eventLocation: formData.eventLocation.trim() || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dateError = validateEventDates();
    if (dateError) {
      setError(dateError);
      setLoading(false);
      return;
    }

    try {
      const galleryCategoryId = await resolveGalleryCategoryIdForSaveServer(
        formData.galleryCategoryId,
        pendingCategoryName
      );

      await updateAlbumServer(initialAlbum.id!, {
        title: formData.title,
        description: formData.description || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        isPublic: formData.isPublic,
        displayOrder: formData.displayOrder,
        albumYear: formData.albumYear,
        galleryCategoryId,
        ...buildEventDatePayload(),
      });

      // Redirect to album list
      router.push('/admin/gallery/albums');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update album');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialAlbum.id) return;

    try {
      await deleteAlbumServer(initialAlbum.id);
      router.push('/admin/gallery/albums');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete album');
    }
  };

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
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Edit Album</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Album</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update album details and settings
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error updating album</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter album title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter album description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            {initialAlbum.id != null && (
              <GalleryAlbumCoverImageUpload
                albumId={initialAlbum.id}
                currentImageUrl={formData.coverImageUrl || undefined}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, coverImageUrl: url }))}
                onError={() => {}}
                onUploadingChange={setCoverUploading}
                disabled={loading}
              />
            )}
            <p className="mt-2 text-xs text-gray-500">
              Upload saves the cover immediately (S3). You can also set a cover from the{' '}
              <Link href={`/admin/gallery/albums/${initialAlbum.id}/media`} className="text-blue-600 hover:underline">
                media management page
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={() => setShowAdvancedCoverUrl((v) => !v)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              {showAdvancedCoverUrl ? 'Hide' : 'Show'} advanced: paste cover URL
            </button>
            {showAdvancedCoverUrl && (
              <div className="mt-2">
                <input
                  id="coverImageUrl"
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg (optional)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Manual URL is saved when you click Update Album below.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="galleryCategoryId">
              Category
            </label>
            <GalleryCategoryTypeahead
              id="galleryCategoryId"
              categories={categoryList}
              value={formData.galleryCategoryId}
              onChange={(galleryCategoryId) => setFormData((prev) => ({ ...prev, galleryCategoryId }))}
              onCategoryCreated={(category) =>
                setCategoryList((prev) =>
                  prev.some((c) => c.id === category.id) ? prev : [...prev, category]
                )
              }
              onPendingDisplayNameChange={setPendingCategoryName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="albumYear">
              Album Year
            </label>
            <input
              id="albumYear"
              type="number"
              value={formData.albumYear ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  albumYear: raw === '' ? null : parseInt(raw, 10),
                }));
              }}
              min={1900}
              max={2100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 2023"
            />
            <p className="mt-1 text-xs text-gray-500">
              Year shown on public gallery cards (1900–2100).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="eventDateStart">
                Event Start Date
              </label>
              <input
                id="eventDateStart"
                type="date"
                value={formData.eventDateStart}
                onChange={(e) => setFormData((prev) => ({ ...prev, eventDateStart: e.target.value }))}
                onBlur={() => {
                  const start = formData.eventDateStart.trim();
                  if (start && formData.albumYear == null) {
                    const year = parseInt(start.slice(0, 4), 10);
                    if (!Number.isNaN(year)) {
                      setFormData((prev) => ({ ...prev, albumYear: year }));
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="eventDateEnd">
                Event End Date
              </label>
              <input
                id="eventDateEnd"
                type="date"
                value={formData.eventDateEnd}
                onChange={(e) => setFormData((prev) => ({ ...prev, eventDateEnd: e.target.value }))}
                min={formData.eventDateStart || undefined}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Optional — for multi-day events.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="eventLocation">
              Event Location
            </label>
            <input
              id="eventLocation"
              type="text"
              maxLength={256}
              value={formData.eventLocation}
              onChange={(e) => setFormData((prev) => ({ ...prev, eventLocation: e.target.value }))}
              onBlur={(e) =>
                setFormData((prev) => ({ ...prev, eventLocation: e.target.value.trim() }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Indore, Beirut"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="displayOrder">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower values appear first in the gallery. Default: 0.
            </p>
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this album public (visible in gallery)
            </label>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete Album
            </button>
            <div className="flex gap-3">
              <Link
                href="/admin/gallery/albums"
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || coverUploading}
              >
                {loading ? 'Saving...' : coverUploading ? 'Uploading cover...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Album"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete album <strong>"{initialAlbum.title}"</strong>? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-600">
            Media files associated with this album will not be deleted, but they will be removed from the album.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                handleDelete();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Album
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

