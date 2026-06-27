'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import AdminNavigation from '@/components/AdminNavigation';
import DirectorImageUploadArea from '@/components/directors/DirectorImageUploadArea';
import type { EventProgramDirectorsDTO, EventMediaDTO } from '@/types';
import { updateEventProgramDirectorServer } from '../ApiServerActions';
import PaginatedMediaList from './PaginatedMediaList';

interface DirectorEditClientProps {
  director: EventProgramDirectorsDTO;
  initialMediaList: EventMediaDTO[];
  totalMediaCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export default function DirectorEditClient({
  director: initialDirector,
  initialMediaList,
  totalMediaCount,
  currentPage,
  pageSize,
  totalPages,
}: DirectorEditClientProps) {
  const router = useRouter();
  const [director, setDirector] = useState<EventProgramDirectorsDTO>(initialDirector);
  const [formData, setFormData] = useState<Partial<EventProgramDirectorsDTO>>(initialDirector);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!director.id) return;

    try {
      setLoading(true);
      const updatedDirector = await updateEventProgramDirectorServer(director.id, formData);
      setDirector(updatedDirector);
      setToastMessage({ type: 'success', message: 'Director updated successfully' });
      setMediaRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update director' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUploadSuccess = () => {
    setToastMessage({ type: 'success', message: 'Image uploaded successfully' });
    setMediaRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/event-program-directors')}
            className="flex items-center space-x-2 text-foreground hover:text-primary reverent-transition"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>Back to Directors</span>
          </button>
        </div>
      </div>

      <h1 className="font-heading font-semibold text-3xl text-foreground mb-2">Edit Director</h1>
      <p className="font-body text-muted-foreground mb-8">
        {director.name || 'Director Details'}
      </p>

      <AdminNavigation currentPage="event-program-directors" />

      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-4 p-4 rounded-lg sacred-shadow ${
          toastMessage.type === 'success'
            ? 'bg-success/10 border border-success/20 text-success-foreground'
            : 'bg-destructive/10 border border-destructive/20 text-destructive-foreground'
        }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={6}
              className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              placeholder="Enter director biography"
            />
          </div>

          {/* Image Upload Section with Drag-and-Drop */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-medium text-foreground mb-4">Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload multiple photo images. Drag and drop images directly or click to browse. All images will appear in the Overview section below.
            </p>
            <div className="max-w-md">
              <DirectorImageUploadArea
                directorId={director.id!}
                currentImageUrl={director.photoUrl}
                onUploadSuccess={handleImageUploadSuccess}
                disabled={loading || !director.id}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/event-program-directors')}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </span>
              ) : (
                'Update Director'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Overview Section with Paginated Media Files */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">Overview</h2>
        <p className="font-body text-muted-foreground mb-6">
          Media files associated with this director. Files are sorted by priority ranking (lower = higher priority).
        </p>

        <PaginatedMediaList
          directorId={director.id!}
          initialMediaList={initialMediaList}
          totalCount={totalMediaCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          refreshKey={mediaRefreshKey}
        />
      </div>
    </div>
  );
}

