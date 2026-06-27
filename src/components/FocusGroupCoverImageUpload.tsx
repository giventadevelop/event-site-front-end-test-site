'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaImage, FaTimes, FaSpinner, FaCheck, FaUsers } from 'react-icons/fa';
import ErrorDialog from '@/components/ErrorDialog';

interface FocusGroupCoverImageUploadProps {
  focusGroupId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function FocusGroupCoverImageUpload({
  focusGroupId,
  currentImageUrl,
  onImageUploaded,
  onError,
  disabled = false,
  className = ''
}: FocusGroupCoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMessage = 'Unsupported file type. Please upload a JPEG, PNG, or GIF image.';
      setErrorDialog({
        isOpen: true,
        title: 'Invalid File Type',
        message: errorMessage
      });
      onError(errorMessage);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMessage = 'File size is too large. Please upload an image smaller than 10MB.';
      setErrorDialog({
        isOpen: true,
        title: 'File Too Large',
        message: errorMessage
      });
      onError(errorMessage);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Build API URL for focus group cover image upload
      const apiUrl = `/api/proxy/event-medias/upload/focus-group-cover-image?focusGroupId=${focusGroupId}&title=Focus Group Cover Image&description=Cover image for focus group&isPublic=true`;

      console.log('📸 FocusGroupCoverImageUpload: Uploading to URL:', apiUrl);
      console.log('📸 FocusGroupCoverImageUpload: Focus Group ID:', focusGroupId);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('📸 FocusGroupCoverImageUpload: Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to upload focus group cover image';
        let errorDetails = '';

        // Read response body as text first (can always read as text)
        try {
          const responseText = await response.text();

          // Try to parse as JSON if it looks like JSON
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            try {
              const errorData = JSON.parse(responseText);
              // Handle different error formats from backend
              if (errorData.error) {
                errorMessage = errorData.error;
              }
              if (errorData.details) {
                errorDetails = errorData.details;
              }
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch {
              // If JSON parsing fails, use the text as-is
              if (responseText.trim()) {
                errorMessage = responseText.trim();
              }
            }
          } else {
            // Not JSON, use text directly
            if (responseText.trim()) {
              errorMessage = responseText.trim();
            }
          }
        } catch (parseError) {
          // If reading response fails, use default error message
          console.error('Failed to read error response:', parseError);
        }

        // Create user-friendly error message
        const userFriendlyMessage = formatErrorMessage(errorMessage, errorDetails, response.status);

        console.error('📸 FocusGroupCoverImageUpload: Upload failed:', errorMessage);

        // Show error dialog
        setErrorDialog({
          isOpen: true,
          title: 'Upload Failed',
          message: userFriendlyMessage
        });

        // Also call onError callback for backward compatibility
        onError(userFriendlyMessage);

        return;
      }

      const result = await response.json();
      const imageUrl = result.fileUrl || result.url || result.imageUrl;

      if (!imageUrl) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      console.log('📸 FocusGroupCoverImageUpload: Upload success, image URL:', imageUrl);
      onImageUploaded(imageUrl);

      // Show success message
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Focus group cover image upload error:', error);
      const errorMessage = error.message || 'Failed to upload focus group cover image';
      const userFriendlyMessage = formatErrorMessage(errorMessage, '', 0);

      // Show error dialog
      setErrorDialog({
        isOpen: true,
        title: 'Upload Failed',
        message: userFriendlyMessage
      });

      // Also call onError callback for backward compatibility
      onError(userFriendlyMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to format error messages in a user-friendly way
  const formatErrorMessage = (error: string, details: string, statusCode: number): string => {
    // Handle common HTTP status codes
    if (statusCode === 400) {
      return 'Invalid request. Please check that the file is a valid image and try again.';
    }
    if (statusCode === 401) {
      return 'Authentication failed. Please refresh the page and try again.';
    }
    if (statusCode === 403) {
      return 'You do not have permission to upload images. Please contact an administrator.';
    }
    if (statusCode === 413) {
      return 'File size is too large. Please upload an image smaller than 10MB.';
    }
    if (statusCode === 415) {
      return 'Unsupported file type. Please upload a JPEG, PNG, or GIF image.';
    }
    if (statusCode === 500) {
      return 'Server error occurred. Please try again later or contact support if the problem persists.';
    }

    // Try to extract user-friendly messages from error strings
    const lowerError = error.toLowerCase();
    if (lowerError.includes('file size') || lowerError.includes('too large')) {
      return 'File size is too large. Please upload an image smaller than 10MB.';
    }
    if (lowerError.includes('file type') || lowerError.includes('unsupported') || lowerError.includes('invalid format')) {
      return 'Unsupported file type. Please upload a JPEG, PNG, or GIF image.';
    }
    if (lowerError.includes('permission') || lowerError.includes('unauthorized') || lowerError.includes('forbidden')) {
      return 'You do not have permission to upload images. Please contact an administrator.';
    }
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return 'Network error occurred. Please check your internet connection and try again.';
    }

    // If we have details, include them
    if (details) {
      return `${error}\n\nDetails: ${details}`;
    }

    // Return the error message as-is if we can't format it
    return error || 'An unexpected error occurred. Please try again.';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
      />

      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${showSuccess ? 'border-green-500 bg-green-50' :
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <p className="text-sm">Uploading cover image...</p>
          </div>
        ) : showSuccess ? (
          <div className="flex flex-col items-center justify-center text-green-600">
            <FaCheck className="text-2xl mb-2" />
            <p className="text-sm font-medium">Upload successful!</p>
            <p className="text-xs text-gray-500">Cover image updated</p>
          </div>
        ) : currentImageUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src={currentImageUrl}
                alt="Focus group cover preview"
                className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaUsers className="text-blue-500" />
              <span>Click to change cover image</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">or drag and drop a new image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <FaUsers className="text-4xl mb-3 text-blue-500" />
            <p className="text-sm font-medium mb-1">Upload Focus Group Cover Image</p>
            <p className="text-xs text-gray-400 mb-2">This image will be displayed as the cover for the focus group</p>
            <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">Image should be 800 pixels wide by 480 pixels tall, aspect ratio 5:3.</p>
            <p className="text-xs text-gray-400 mt-1">(JPEG, PNG, GIF - Max 10MB)</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

