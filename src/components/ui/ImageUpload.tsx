'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaImage, FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';

interface ImageUploadProps {
  entityId: number;
  entityType: 'sponsor' | 'featured-performer' | 'program-director';
  imageType: string;
  eventId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  entityId,
  entityType,
  imageType,
  eventId,
  currentImageUrl,
  onImageUploaded,
  onError,
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
      onError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Build the correct API URL based on entity type using proxy pattern
      let apiUrl: string;
      const defaultTenantId = 'tenant_demo_001'; // Default fallback

      if (entityType === 'program-director') {
        // Program director uses specific endpoint with entityId in path
        apiUrl = `/api/proxy/event-medias/upload/${entityType}/${entityId}/photo?entityId=${entityId}&eventId=${eventId}&title=${imageType}&description=Uploaded image&tenantId=${defaultTenantId}&isPublic=true`;
      } else if (entityType === 'featured-performer') {
        // Featured performer uses dedicated proxy endpoint
        apiUrl = `/api/proxy/event-medias/upload/${entityType}?eventId=${eventId}&entityId=${entityId}&imageType=${imageType}&title=${imageType}&description=Uploaded image&tenantId=${defaultTenantId}&isPublic=true`;
      } else if (entityType === 'sponsor') {
        // Sponsor uses dedicated proxy endpoint
        // Note: eventId can be 0 for main sponsors page (sponsors not yet associated with events)
        // The backend should handle eventId=0 gracefully
        apiUrl = `/api/proxy/event-medias/upload/${entityType}?eventId=${eventId || 0}&entityId=${entityId}&imageType=${imageType}&title=${imageType}&description=Uploaded image&tenantId=${defaultTenantId}&isPublic=true`;
      } else {
        // Fallback for other entity types (if any)
        apiUrl = `/api/proxy/event-medias/upload/${entityType}/${entityId}/${imageType}?eventId=${eventId}&title=${imageType}&description=Uploaded image&tenantId=${defaultTenantId}&isPublic=true`;
      }

      // Call the backend API directly for image upload
      console.log('🖼️ ImageUpload: Uploading to URL:', apiUrl);
      console.log('🖼️ ImageUpload: Entity info:', { entityType, entityId, imageType, eventId });

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('🖼️ ImageUpload: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🖼️ ImageUpload: Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      onImageUploaded(result.url || result.imageUrl);

      // Show success message
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Upload error:', error);
      onError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
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
          relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all
          ${showSuccess ? 'border-green-500 bg-green-50' :
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : showSuccess ? (
          <div className="flex flex-col items-center justify-center text-green-600">
            <FaCheck className="text-2xl mb-2" />
            <p className="text-sm font-medium">Upload successful!</p>
            <p className="text-xs text-gray-500">Image updated</p>
          </div>
        ) : currentImageUrl ? (
          <div className="flex flex-col items-center">
            <img
              src={currentImageUrl}
              alt={`${imageType} preview`}
              className="w-20 h-20 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-gray-600">Click to change image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <FaImage className="text-3xl mb-2" />
            <p className="text-sm">Click to upload {imageType}</p>
            <p className="text-xs text-gray-400">or drag and drop</p>
          </div>
        )}
      </div>
    </div>
  );
}
