'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUpload, FaTimes, FaSpinner, FaTrash } from 'react-icons/fa';
import type { ExecutiveCommitteeTeamMemberDTO, ExecutiveCommitteeTeamMemberFormData } from '@/types/executiveCommitteeTeamMember';
import { createExecutiveCommitteeMember, updateExecutiveCommitteeMember } from './ApiServerActions';
import { uploadTeamMemberProfileImage } from './ExecutiveCommitteeUploadActions';
import DragDropImageUpload from '@/components/DragDropImageUpload';
import SuccessDialog from '@/components/SuccessDialog';
import ErrorDialog from '@/components/ErrorDialog';

interface ExecutiveCommitteeFormProps {
  member?: ExecutiveCommitteeTeamMemberDTO | null;
  onSuccess: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onCancel: () => void;
}

export default function ExecutiveCommitteeForm({
  member,
  onSuccess,
  onCancel,
}: ExecutiveCommitteeFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(member?.profileImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expertiseItems, setExpertiseItems] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExecutiveCommitteeTeamMemberFormData>({
    defaultValues: {
      firstName: member?.firstName || '',
      lastName: member?.lastName || '',
      title: member?.title || '',
      designation: member?.designation || '',
      bio: member?.bio || '',
      email: member?.email || '',
      expertise: [''],
      imageBackground: member?.imageBackground || '',
      imageStyle: member?.imageStyle || '',
      department: member?.department || '',
      joinDate: member?.joinDate ? member.joinDate.split('T')[0] : '',
      isActive: member?.isActive ?? true,
      linkedinUrl: member?.linkedinUrl || '',
      twitterUrl: member?.twitterUrl || '',
      priorityOrder: member?.priorityOrder || 0,
      websiteUrl: member?.websiteUrl || '',
    },
  });

  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (member) {
      setValue('firstName', member.firstName);
      setValue('lastName', member.lastName);
      setValue('title', member.title);
      setValue('designation', member.designation || '');
      setValue('bio', member.bio || '');
      setValue('email', member.email || '');
      // Handle expertise field - convert from JSON array or space-separated string to array
      let expertiseArray: string[] = [''];
      if (member.expertise) {
        if (Array.isArray(member.expertise)) {
          expertiseArray = member.expertise.length > 0 ? member.expertise : [''];
        } else if (typeof member.expertise === 'string' && member.expertise.startsWith('[')) {
          try {
            const parsed = JSON.parse(member.expertise);
            expertiseArray = Array.isArray(parsed) && parsed.length > 0 ? parsed : [''];
          } catch {
            expertiseArray = member.expertise.trim() ? [member.expertise] : [''];
          }
        } else if (member.expertise.trim()) {
          expertiseArray = member.expertise.split(/\s+/).filter(s => s.trim());
        }
      }
      setExpertiseItems(expertiseArray);
      setValue('expertise', expertiseArray);
      setValue('imageBackground', member.imageBackground || '');
      setValue('imageStyle', member.imageStyle || '');
      setValue('department', member.department || '');
      setValue('joinDate', member.joinDate ? member.joinDate.split('T')[0] : '');
      setValue('isActive', member.isActive ?? true);
      setValue('linkedinUrl', member.linkedinUrl || '');
      setValue('twitterUrl', member.twitterUrl || '');
      setValue('priorityOrder', member.priorityOrder || 0);
      setValue('websiteUrl', member.websiteUrl || '');
    }
  }, [member, setValue]);

  // Handle expertise items changes
  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertiseItems = [...expertiseItems];
    newExpertiseItems[index] = value;
    setExpertiseItems(newExpertiseItems);
    setValue('expertise', newExpertiseItems);
  };

  const addExpertiseItem = () => {
    const newExpertiseItems = [...expertiseItems, ''];
    setExpertiseItems(newExpertiseItems);
    setValue('expertise', newExpertiseItems);
  };

  const removeExpertiseItem = (index: number) => {
    if (expertiseItems.length > 1) {
      const newExpertiseItems = expertiseItems.filter((_, i) => i !== index);
      setExpertiseItems(newExpertiseItems);
      setValue('expertise', newExpertiseItems);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (memberId: number): Promise<string | null> => {
    if (!imageFile) return member?.profileImageUrl || null;

    try {
      // Use the actual upload API for team member profile images
      const imageUrl = await uploadTeamMemberProfileImage(memberId, imageFile);
      return imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ExecutiveCommitteeTeamMemberFormData) => {
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Filter out empty expertise items and convert to JSON string for backend
      const filteredExpertise = data.expertise.filter(item => item.trim());
      const expertiseString = filteredExpertise.length > 0 ?
        JSON.stringify(filteredExpertise) : undefined;

      // Step 1: Save member data first (without image)
      const memberData = {
        ...data,
        profileImageUrl: member?.profileImageUrl || undefined, // Keep existing or undefined for new
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : undefined,
        expertise: expertiseString
      };

      let result: ExecutiveCommitteeTeamMemberDTO | null = null;

      if (member?.id) {
        // Update existing member
        result = await updateExecutiveCommitteeMember(member.id, memberData);
      } else {
        // Create new member
        result = await createExecutiveCommitteeMember(memberData);
      }

      if (!result) {
        throw new Error('Failed to save member');
      }

      // Step 2: Upload image if there's a new image file
      if (imageFile && result.id) {
        setUploadProgress(30);
        try {
          const imageUrl = await uploadImage(result.id);
          if (imageUrl) {
            // Update the member with the new image URL
            const updatedMemberData = {
              ...memberData,
              profileImageUrl: imageUrl
            };

            setUploadProgress(70);
            const updatedResult = await updateExecutiveCommitteeMember(result.id, updatedMemberData);
            if (updatedResult) {
              result = updatedResult;
            }
          }
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Don't fail the entire process if image upload fails
          setErrorMessage('Member saved successfully, but image upload failed. You can upload the image later.');
          setShowErrorDialog(true);
        }
      }

      setUploadProgress(100);

      // Show success message
      setSuccessMessage('Team member saved successfully!');
      setShowSuccessDialog(true);

      // Call success handler
      onSuccess(result);

    } catch (error) {
      console.error('Form submission failed:', error);
      setErrorMessage(`Failed to save member: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-blue-600 text-xs font-bold">ℹ</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Profile Image Guidelines</p>
            <p className="text-blue-700">
              Profile size or dimensions image guidelines are given in the parent page.
              Please refer to the parent page for the same.
            </p>
          </div>
        </div>
      </div>

      {/* Drag and Drop Image Upload */}
      <DragDropImageUpload
        onFileSelect={handleImageSelect}
        onFileRemove={handleImageRemove}
        selectedFile={imageFile}
        previewUrl={imagePreview}
        isUploading={isSubmitting && uploadProgress > 0}
        uploadProgress={uploadProgress}
        maxSize={10}
      />

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">First Name *</label>
          <input
            type="text"
            {...register('firstName', { required: 'First name is required' })}
            className={`w-full border rounded p-2 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.firstName && (
            <div className="text-red-500 text-sm mt-1">{errors.firstName.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Last Name *</label>
          <input
            type="text"
            {...register('lastName', { required: 'Last name is required' })}
            className={`w-full border rounded p-2 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.lastName && (
            <div className="text-red-500 text-sm mt-1">{errors.lastName.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Title *</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className={`w-full border rounded p-2 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.title && (
            <div className="text-red-500 text-sm mt-1">{errors.title.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Designation</label>
          <input
            type="text"
            {...register('designation')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Department</label>
          <input
            type="text"
            {...register('department')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Join Date</label>
          <input
            type="date"
            {...register('joinDate')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block font-medium">Priority Order</label>
            <span
              className="text-blue-600 cursor-help"
              title="Lower number = higher rank (0 first, 10 later). Row 1 on the homepage shows only the single highest-priority member (rank 1); row 2+ show 3 per row."
              aria-label="Priority order help"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="mb-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            <strong>Tip:</strong> Lower number = higher rank (0 is first, 10 is later). List and homepage are sorted by this value ascending. <strong>Homepage layout:</strong> Row 1 shows only the single highest-priority member (rank 1); row 2 and below show 3 members per row.
          </div>
          <input
            type="number"
            {...register('priorityOrder', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            title="Lower number = higher rank (0 first, 10 later). Row 1 on homepage = one member only (rank 1)."
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bio and Expertise */}
      <div>
        <label className="block font-medium">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief biography of the team member..."
        />
      </div>

      <div>
        <label className="block font-medium">Expertise</label>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">
            Add expertise areas one by one. Examples: Leadership, Strategic Planning, Finance, Marketing, Team Building
          </p>
          {expertiseItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleExpertiseChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Leadership"
              />
              {expertiseItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExpertiseItem(index)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove expertise item"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExpertiseItem}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Expertise"
            aria-label="Add Expertise"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add Expertise</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Each expertise area will be stored as a separate item in the system.
        </p>
      </div>

      {/* Image Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Image Background</label>
          <input
            type="text"
            {...register('imageBackground')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., teal, blue, gradient"
          />
        </div>

        <div>
          <label className="block font-medium">Image Style</label>
          <input
            type="text"
            {...register('imageStyle')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., modern, classic, corporate"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium">LinkedIn URL</label>
          <input
            type="url"
            {...register('linkedinUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className="block font-medium">Twitter URL</label>
          <input
            type="url"
            {...register('twitterUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://twitter.com/..."
          />
        </div>

        <div>
          <label className="block font-medium">Website URL</label>
          <input
            type="url"
            {...register('websiteUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active member
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isSubmitting}
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
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isSubmitting}
          title={isSubmitting ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
          aria-label={isSubmitting ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            {isSubmitting ? (
              <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-blue-700">
            {isSubmitting ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
          </span>
        </button>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success"
        message={successMessage}
        showRefreshButton={false}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        message={errorMessage}
      />
    </form>
  );
}
