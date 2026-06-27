'use client';

import { useState, useRef, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import { uploadTeamMemberProfileImage } from './ExecutiveCommitteeUploadActions';
import SuccessDialog from '@/components/SuccessDialog';
import ErrorDialog from '@/components/ErrorDialog';

interface ImageUploadDialogProps {
  member: ExecutiveCommitteeTeamMemberDTO;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
}

export default function ImageUploadDialog({
  member,
  isOpen,
  onClose,
  onUploadSuccess,
}: ImageUploadDialogProps) {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [userProfileId, setUserProfileId] = useState<number | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user profile ID when component mounts
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        if (userId) {
          // Fetch user profile to get the ID
          const response = await fetch('/api/proxy/user-profiles/by-user/' + userId);
          if (response.ok) {
            const profile = await response.json();
            setUserProfileId(profile.id);
          }
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
      }
    };

    if (isOpen && userId) {
      getUserProfile();
    }
  }, [isOpen, userId]);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (JPEG, PNG, GIF, etc.)');
      setShowErrorDialog(true);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB');
      setShowErrorDialog(true);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRefresh = () => {
    setShowSuccessDialog(false);
    window.location.reload();
  };

  const handleUpload = async () => {
    if (!selectedFile || !member.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate initial progress
      setUploadProgress(10);

      // Upload the image using the new function
      // 🎯 This function now relies ONLY on HTTP status codes for success/failure
      const imageUrl = await uploadTeamMemberProfileImage(
        member.id,
        selectedFile,
        userProfileId || undefined
      );

      // Handle different types of successful responses
      if (!imageUrl || imageUrl === 'upload-successful-no-url' || imageUrl === 'upload-successful-parse-error') {
        console.log('Upload succeeded but no URL returned. Image may still be uploaded successfully.');
        // For these cases, we'll treat it as success but show a different message
      }

      // Simulate completion progress
      setUploadProgress(100);

      // Call success handler with the actual image URL
      onUploadSuccess(imageUrl || 'upload-successful');

      // Close the upload dialog
      onClose();

      // Show appropriate success message
      // 🎯 Success determined by HTTP 2xx status code, not response content
      if (imageUrl && !imageUrl.startsWith('upload-successful')) {
        setSuccessMessage('Profile image uploaded successfully!');
      } else {
        setSuccessMessage('Profile image uploaded successfully! The upload completed but we couldn\'t retrieve the image URL.');
      }

      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorDialog(true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Profile Image
          </h2>
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isUploading}
            title="Close"
            aria-label="Close"
            type="button"
          >
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Member Info */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {member.profileImageUrl ? (
                <img
                  src={member.profileImageUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-teal-600 font-semibold text-2xl">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-gray-500">{member.title}</p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
              ? 'border-teal-500 bg-teal-50'
              : selectedFile
                ? 'border-teal-400 bg-teal-50'
                : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <div className="space-y-4">
                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-teal-600 hover:text-teal-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                  title="Select Image"
                  aria-label="Select Image"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-700">Select Image</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="mx-auto h-32 w-32 rounded-lg object-cover border border-gray-200"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Change"
                    aria-label="Change"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <span className="font-semibold text-blue-700">Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Remove"
                    aria-label="Remove"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-700">Remove</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isUploading}
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
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Upload Image"
              aria-label="Upload Image"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                {isUploading ? (
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
              <span className="font-semibold text-blue-700">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Upload Successful"
        message={successMessage}
        showRefreshButton={true}
        onRefresh={handleRefresh}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Upload Failed"
        message={errorMessage}
      />
    </div>
  );
}
