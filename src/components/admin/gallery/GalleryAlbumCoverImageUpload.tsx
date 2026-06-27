'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaSpinner, FaCheck } from 'react-icons/fa';
import ErrorDialog from '@/components/ErrorDialog';
import { uploadGalleryAlbumCoverFile } from '@/lib/gallery/uploadGalleryAlbumCoverClient';

interface GalleryAlbumCoverImageUploadProps {
  albumId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError: (error: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function formatErrorMessage(error: string, details: string, statusCode: number): string {
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

  const lowerError = error.toLowerCase();
  if (lowerError.includes('file size') || lowerError.includes('too large')) {
    return 'File size is too large. Please upload an image smaller than 10MB.';
  }
  if (lowerError.includes('file type') || lowerError.includes('unsupported') || lowerError.includes('invalid format')) {
    return 'Unsupported file type. Please upload a JPEG, PNG, or GIF image.';
  }
  if (details) {
    return `${error}\n\nDetails: ${details}`;
  }
  return error || 'An unexpected error occurred. Please try again.';
}

export default function GalleryAlbumCoverImageUpload({
  albumId,
  currentImageUrl,
  onImageUploaded,
  onError,
  onUploadingChange,
  disabled = false,
  className = '',
}: GalleryAlbumCoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || '');
  }, [currentImageUrl]);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const showUploadError = (title: string, message: string) => {
    setErrorDialog({ isOpen: true, title, message });
    onError(message);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const errorMessage = 'Unsupported file type. Please upload a JPEG, PNG, or GIF image.';
      showUploadError('Invalid File Type', errorMessage);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMessage = 'File size is too large. Please upload an image smaller than 10MB.';
      showUploadError('File Too Large', errorMessage);
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadGalleryAlbumCoverFile(albumId, file);
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      setShowSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload gallery album cover image';
      const userFriendlyMessage = formatErrorMessage(errorMessage, '', 0);
      showUploadError('Upload Failed', userFriendlyMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
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
              <p className="text-xs text-gray-500">Cover image saved to album</p>
            </div>
          ) : previewUrl ? (
            <div className="flex flex-col items-center w-full">
              <div className="relative mb-3 w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Album cover preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaImage className="text-purple-500" />
                <span>Click to replace cover image</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">or drag and drop a new image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <FaImage className="text-4xl mb-3 text-purple-500" />
              <p className="text-sm font-medium mb-1">Upload Album Cover Image</p>
              <p className="text-xs text-gray-400 mb-2 text-center">
                This image appears on gallery cards and album listings
              </p>
              <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">Recommended: 800×600 or 1200×800 JPG/PNG</p>
              <p className="text-xs text-gray-400 mt-1">(JPEG, PNG, GIF — Max 10MB)</p>
            </div>
          )}
        </div>

        {previewUrl && !isUploading && (
          <p className="mt-2 text-xs text-gray-500 break-all">
            Current URL: {previewUrl}
          </p>
        )}
      </div>
    </>
  );
}
