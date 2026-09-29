'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FocusGroupCoverImageUpload from '@/components/FocusGroupCoverImageUpload';
import FocusGroupEventSearch from './components/FocusGroupEventSearch';
import AssociatedEventsTable from './components/AssociatedEventsTable';
import { parseFocusGroupDescription } from '@/lib/focusGroupExtras';
import type { FocusGroupDTO, EventDetailsDTO } from '@/types';

/** Initial active state for the form (used for custom-checkbox and hidden input). */
const initialIsActive = (group: FocusGroupDTO | null) => !!group?.isActive;

interface FocusGroupEditFormProps {
  group: FocusGroupDTO | null;
  focusGroupId: number;
  updateFocusGroup: (formData: FormData) => Promise<void>;
  initialEvents?: EventDetailsDTO[];
  initialTotalCount?: number;
}

export default function FocusGroupEditForm({
  group,
  focusGroupId,
  updateFocusGroup,
  initialEvents = [],
  initialTotalCount = 0,
}: FocusGroupEditFormProps) {
  const router = useRouter();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(group?.coverImageUrl);
  const [isActive, setIsActive] = useState(initialIsActive(group));
  const parsed = parseFocusGroupDescription(group?.description);
  const [showMemberGalleryPublic, setShowMemberGalleryPublic] = useState(
    !!parsed.extras.showMemberGalleryPublic
  );

  const handleImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
    const hiddenInput = document.getElementById('coverImageUrl') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = imageUrl;
    }
  };

  const handleError = (error: string) => {
    console.error('Focus group cover image upload error:', error);
  };

  const handleEventAssociated = () => {
    router.refresh();
  };

  const handleEventUnlinked = () => {
    router.refresh();
  };

  return (
    <div>
      <FocusGroupEventSearch
        focusGroupId={focusGroupId}
        onEventAssociated={handleEventAssociated}
      />

      <form action={updateFocusGroup} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" defaultValue={group?.name} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={group?.slug}
            pattern="[a-z0-9-]+"
            title="lowercase letters, numbers, hyphens only"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={parsed.description}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Announcements</label>
          <textarea
            name="announcements"
            rows={3}
            defaultValue={parsed.extras.announcements || ''}
            placeholder="Public announcements shown on the focus group page"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting schedule</label>
          <textarea
            name="meetingSchedule"
            rows={3}
            defaultValue={parsed.extras.meetingSchedule || ''}
            placeholder="e.g. Every Saturday 10am at Kerala Center"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <FocusGroupCoverImageUpload
            focusGroupId={focusGroupId}
            currentImageUrl={coverImageUrl}
            onImageUploaded={handleImageUploaded}
            onError={handleError}
          />
          <input
            type="hidden"
            id="coverImageUrl"
            name="coverImageUrl"
            value={coverImageUrl || ''}
          />
        </div>
        <div className="flex items-center gap-3">
          <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
          <label htmlFor="isActive-edit" className="flex items-center gap-3 cursor-pointer">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="isActive-edit"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="custom-checkbox"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="custom-checkbox-tick">
                {isActive && (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                  </svg>
                )}
              </span>
            </span>
            <span className="text-sm font-medium text-gray-700 select-none">Active</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="hidden"
            name="showMemberGalleryPublic"
            value={showMemberGalleryPublic ? 'true' : 'false'}
          />
          <label htmlFor="showMemberGalleryPublic-edit" className="flex items-center gap-3 cursor-pointer">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="showMemberGalleryPublic-edit"
                checked={showMemberGalleryPublic}
                onChange={(e) => setShowMemberGalleryPublic(e.target.checked)}
                className="custom-checkbox"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="custom-checkbox-tick">
                {showMemberGalleryPublic && (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                  </svg>
                )}
              </span>
            </span>
            <span className="text-sm font-medium text-gray-700 select-none">
              Show member gallery publicly
            </span>
          </label>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
            title="Save Focus Group"
            aria-label="Save Focus Group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Save Focus Group</span>
          </button>
        </div>
      </form>

      <AssociatedEventsTable
        focusGroupId={focusGroupId}
        initialEvents={initialEvents}
        initialTotalCount={initialTotalCount}
        onUnlinked={handleEventUnlinked}
      />
    </div>
  );
}
