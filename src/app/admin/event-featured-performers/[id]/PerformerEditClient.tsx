'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import AdminNavigation from '@/components/AdminNavigation';
import PerformerImageUploadArea from '@/components/performers/PerformerImageUploadArea';
import type { EventFeaturedPerformersDTO, EventMediaDTO } from '@/types';
import { updateEventFeaturedPerformerServer } from '../ApiServerActions';
import PaginatedMediaList from './PaginatedMediaList';
import Modal from '@/components/ui/Modal';

interface PerformerEditClientProps {
  performer: EventFeaturedPerformersDTO;
  initialMediaList: EventMediaDTO[];
  totalMediaCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export default function PerformerEditClient({
  performer: initialPerformer,
  initialMediaList,
  totalMediaCount,
  currentPage,
  pageSize,
  totalPages,
}: PerformerEditClientProps) {
  const router = useRouter();
  const [performer, setPerformer] = useState<EventFeaturedPerformersDTO>(initialPerformer);
  const [formData, setFormData] = useState<Partial<EventFeaturedPerformersDTO>>(initialPerformer);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!performer.id) return;

    try {
      setLoading(true);
      const updatedPerformer = await updateEventFeaturedPerformerServer(performer.id, formData);
      setPerformer(updatedPerformer);
      setToastMessage({ type: 'success', message: 'Performer updated successfully' });
      setMediaRefreshKey(prev => prev + 1);
      setSaveSuccessModalOpen(true);
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update performer' });
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => router.push('/admin/event-featured-performers')}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Performers"
            aria-label="Back to Performers"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Performers</span>
          </button>
        </div>
      </div>

      <h1 className="font-heading font-semibold text-3xl text-foreground mb-2">Edit Performer</h1>
      <p className="font-body text-muted-foreground mb-8">
        {performer.name || 'Performer Details'}
      </p>

      <AdminNavigation currentPage="event-featured-performers" />

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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Stage Name
              </label>
              <input
                type="text"
                name="stageName"
                value={formData.stageName || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Performance Order
              </label>
              <input
                type="number"
                name="performanceOrder"
                value={formData.performanceOrder || 0}
                onChange={handleChange}
                min="0"
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Performance Duration (minutes)
              </label>
              <input
                type="number"
                name="performanceDurationMinutes"
                value={formData.performanceDurationMinutes || 0}
                onChange={handleChange}
                min="1"
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isHeadliner"
                checked={formData.isHeadliner || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
              />
              <label className="ml-2 block text-sm text-foreground">
                Is Headliner
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
              />
              <label className="ml-2 block text-sm text-foreground">
                Active
              </label>
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
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              placeholder="Enter performer biography"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Performance Description
            </label>
            <textarea
              name="performanceDescription"
              value={formData.performanceDescription || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              placeholder="Enter performance description"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                value={formData.twitterUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl || ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>
          </div>

          {/* Image Upload Section with Drag-and-Drop */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-medium text-foreground mb-4">Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload multiple images per type. Drag and drop images directly or click to browse. All images will appear in the Overview section below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PerformerImageUploadArea
                performerId={performer.id!}
                imageType="portrait"
                currentImageUrl={performer.portraitImageUrl}
                onUploadSuccess={handleImageUploadSuccess}
                disabled={loading || !performer.id}
              />
              <PerformerImageUploadArea
                performerId={performer.id!}
                imageType="performance"
                currentImageUrl={performer.performanceImageUrl}
                onUploadSuccess={handleImageUploadSuccess}
                disabled={loading || !performer.id}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/event-featured-performers')}
              className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Cancel"
              aria-label="Cancel"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-red-700">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Update Performer"
              aria-label="Update Performer"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                {loading ? (
                  <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-blue-700">
                {loading ? 'Saving...' : 'Update Performer'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Overview Section with Paginated Media Files */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">Overview</h2>
        <p className="font-body text-muted-foreground mb-6">
          Media files associated with this performer. Files are sorted by priority ranking (lower = higher priority).
        </p>

        <PaginatedMediaList
          performerId={performer.id!}
          initialMediaList={initialMediaList}
          totalCount={totalMediaCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          refreshKey={mediaRefreshKey}
        />
      </div>

      <Modal
        isOpen={saveSuccessModalOpen}
        onClose={() => setSaveSuccessModalOpen(false)}
        title="Changes Saved"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Performer information has been updated successfully.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setSaveSuccessModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

