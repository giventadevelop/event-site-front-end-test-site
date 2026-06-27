'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GalleryAlbumDTO, GalleryCategoryDTO } from '@/types';
import { fetchAlbumsServer, deleteAlbumServer, createAlbumServer, resolveGalleryCategoryIdForSaveServer } from './ApiServerActions';
import { GalleryCategoryTypeahead } from '@/components/admin/gallery/GalleryCategoryTypeahead';
import { uploadGalleryAlbumCoverFile } from '@/lib/gallery/uploadGalleryAlbumCoverClient';
import Image from 'next/image';
import { Modal } from '@/components/Modal';

interface AdminAlbumListClientProps {
  initialAlbums: GalleryAlbumDTO[];
  initialTotalCount: number;
  initialPage: number;
  initialSearchTerm: string;
  categories: GalleryCategoryDTO[];
}

export default function AdminAlbumListClient({
  initialAlbums,
  initialTotalCount,
  initialPage,
  initialSearchTerm,
  categories,
}: AdminAlbumListClientProps) {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState<GalleryCategoryDTO[]>(categories);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);
  const [albums, setAlbums] = useState<GalleryAlbumDTO[]>(initialAlbums);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    displayOrder: 0,
    albumYear: null as number | null,
    galleryCategoryId: null as number | null,
    eventDateStart: '',
    eventDateEnd: '',
    eventLocation: '',
  });
  const pageSize = 12;

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

  // Load albums
  const loadAlbums = async (page: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAlbumsServer(page, pageSize, search);
      setAlbums(result.albums);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/gallery/albums?page=0&search=${encodeURIComponent(searchTerm)}`);
    loadAlbums(0, searchTerm);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    router.push(`/admin/gallery/albums?page=${newPage}&search=${encodeURIComponent(searchTerm)}`);
    loadAlbums(newPage, searchTerm);
  };

  // Handle delete
  const handleDelete = async (albumId: number) => {
    if (!confirm(`Are you sure you want to delete album "${albums.find(a => a.id === albumId)?.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAlbumServer(albumId);
      // Refresh the list
      loadAlbums(currentPage, searchTerm);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete album');
    }
  };

  // Handle create album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    const dateError = validateEventDates();
    if (dateError) {
      setCreateError(dateError);
      setCreateLoading(false);
      return;
    }

    try {
      const galleryCategoryId = await resolveGalleryCategoryIdForSaveServer(
        formData.galleryCategoryId,
        pendingCategoryName
      );

      const newAlbum = await createAlbumServer({
        title: formData.title,
        description: formData.description || undefined,
        isPublic: formData.isPublic,
        displayOrder: formData.displayOrder,
        albumYear: formData.albumYear,
        galleryCategoryId,
        ...buildEventDatePayload(),
      });

      if (pendingCoverFile && newAlbum.id != null) {
        try {
          await uploadGalleryAlbumCoverFile(newAlbum.id, pendingCoverFile);
        } catch (uploadErr) {
          setCreateError(
            uploadErr instanceof Error
              ? `Album created, but cover upload failed: ${uploadErr.message}`
              : 'Album created, but cover upload failed.'
          );
          await loadAlbums(currentPage, searchTerm);
          return;
        }
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        isPublic: true,
        displayOrder: 0,
        albumYear: null,
        galleryCategoryId: null,
        eventDateStart: '',
        eventDateEnd: '',
        eventLocation: '',
      });
      setPendingCoverFile(null);
      setPendingCategoryName(null);
      setIsCreateModalOpen(false);

      // Refresh the list
      await loadAlbums(currentPage, searchTerm);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create album');
    } finally {
      setCreateLoading(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      isPublic: true,
      displayOrder: 0,
      albumYear: null,
      galleryCategoryId: null,
      eventDateStart: '',
      eventDateEnd: '',
      eventLocation: '',
    });
    setPendingCoverFile(null);
    setPendingCategoryName(null);
    setCreateError(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;
  const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize + albums.length, totalCount);

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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Gallery</span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Albums</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery Albums</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage gallery albums and their associated media files
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Create New Album"
            aria-label="Create New Album"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Create New Album</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search albums by title..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </form>
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
              <h3 className="text-sm font-medium text-red-800">Error loading albums</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Albums Grid */}
      {loading && albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No albums found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new album.'}
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 border border-gray-600/30 shadow-2xl mb-8">
          {/* Medium Dark Radial Gradient Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent 55%)' }} />

          {/* Grid Content */}
          <div className="relative px-6 py-10 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {albums.map((album) => (
                <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col">
                  {/* Album Cover Image */}
                  <div className="relative h-48 bg-gray-200">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Album Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">{album.title}</h3>
                    {album.description && (
                      <p className="text-gray-600 text-sm h-10 overflow-hidden mb-3">{album.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className={`px-2 py-1 rounded-full ${album.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {album.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-3 flex justify-end gap-2">
                      <Link
                        href={`/admin/gallery/albums/${album.id}/media`}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Manage Media"
                        aria-label="Manage Media"
                      >
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/gallery/albums/${album.id}/edit`}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Edit Album"
                        aria-label="Edit Album"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => album.id && handleDelete(album.id)}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="Delete Album"
                        aria-label="Delete Album"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage || loading}
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
                Page <span className="text-blue-600">{currentPage + 1}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || loading}
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
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> albums
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create New Album"
      >
        <form onSubmit={handleCreateAlbum} className="space-y-6">
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error creating album</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{createError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-galleryCategoryId">
              Category
            </label>
            <GalleryCategoryTypeahead
              id="create-galleryCategoryId"
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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-albumYear">
              Album Year
            </label>
            <input
              id="create-albumYear"
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
              placeholder="e.g. 2023 (optional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-eventDateStart">
                Event Start Date
              </label>
              <input
                id="create-eventDateStart"
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
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-eventDateEnd">
                Event End Date
              </label>
              <input
                id="create-eventDateEnd"
                type="date"
                value={formData.eventDateEnd}
                onChange={(e) => setFormData((prev) => ({ ...prev, eventDateEnd: e.target.value }))}
                min={formData.eventDateStart || undefined}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-eventLocation">
              Event Location
            </label>
            <input
              id="create-eventLocation"
              type="text"
              maxLength={256}
              value={formData.eventLocation}
              onChange={(e) => setFormData((prev) => ({ ...prev, eventLocation: e.target.value }))}
              onBlur={(e) =>
                setFormData((prev) => ({ ...prev, eventLocation: e.target.value.trim() }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Indore, Beirut (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="create-coverImage">
              Cover Image (optional)
            </label>
            <input
              id="create-coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => setPendingCoverFile(e.target.files?.[0] ?? null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {pendingCoverFile
                ? `Selected: ${pendingCoverFile.name} — uploads to S3 after the album is created.`
                : 'JPEG, PNG, or GIF up to 10MB. Uploads after create, or add later on the edit page.'}
            </p>
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

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={createLoading}
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
              className="w-full flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={createLoading}
              title={createLoading ? 'Creating...' : 'Create Album'}
              aria-label={createLoading ? 'Creating...' : 'Create Album'}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                {createLoading ? (
                  <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-green-700">{createLoading ? 'Creating...' : 'Create Album'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

