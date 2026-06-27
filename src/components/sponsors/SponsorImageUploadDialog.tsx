'use client';

import { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa';
import type { EventSponsorsDTO } from '@/types';
import { uploadSponsorImageServer } from '@/app/admin/event-sponsors/ApiServerActions';
import SuccessDialog from '@/components/SuccessDialog';
import ErrorDialog from '@/components/ErrorDialog';

interface SponsorImageUploadDialogProps {
  sponsor: EventSponsorsDTO;
  imageType: 'logo' | 'hero' | 'banner';
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
  eventId?: number; // Optional, for event-specific context
}

export default function SponsorImageUploadDialog({
  sponsor,
  imageType,
  isOpen,
  onClose,
  onUploadSuccess,
  eventId,
}: SponsorImageUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    if (!selectedFile || !sponsor.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate initial progress
      setUploadProgress(10);

      // Upload the image
      const eventIdToUse = eventId || 0; // Use provided eventId or 0 for sponsor-level images
      const media = await uploadSponsorImageServer(
        sponsor.id,
        eventIdToUse,
        imageType,
        selectedFile
      );

      // Simulate completion progress
      setUploadProgress(100);

      // Call success handler with the image URL
      const imageUrl = media.fileUrl || '';
      onUploadSuccess(imageUrl);

      // Close the upload dialog
      onClose();

      // Show success message
      setSuccessMessage(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image uploaded successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(`Failed to upload ${imageType} image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get current image URL based on image type
  const getCurrentImageUrl = () => {
    switch (imageType) {
      case 'logo':
        return sponsor.logoUrl;
      case 'hero':
        return sponsor.heroImageUrl;
      case 'banner':
        return sponsor.bannerImageUrl;
      default:
        return undefined;
    }
  };

  const currentImageUrl = getCurrentImageUrl();
  const imageTypeLabel = imageType.charAt(0).toUpperCase() + imageType.slice(1).replace(/([A-Z])/g, ' $1');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg sacred-shadow max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Upload {imageTypeLabel} Image
            </h2>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground reverent-transition"
              disabled={isUploading}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Sponsor Info */}
            <div className="text-center">
              <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                {sponsor.name}
              </h3>
              {sponsor.companyName && (
                <p className="text-sm font-body text-muted-foreground">{sponsor.companyName}</p>
              )}
            </div>

            {/* Current Image Preview */}
            {currentImageUrl && (
              <div className="text-center">
                <p className="text-sm font-body text-muted-foreground mb-2">Current {imageTypeLabel}:</p>
                <img
                  src={currentImageUrl}
                  alt={`Current ${imageTypeLabel}`}
                  className="mx-auto h-32 w-auto rounded-lg object-contain border border-border"
                />
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center reverent-transition ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : selectedFile
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div className="space-y-4">
                  <FaImage className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-body text-foreground">
                      <span className="font-medium text-primary hover:text-primary/80">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs font-body text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition"
                  >
                    <FaUpload className="w-4 h-4 inline mr-2" />
                    Select Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="mx-auto h-32 w-auto rounded-lg object-contain border border-border"
                  />
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 py-2 rounded-md text-sm reverent-transition"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-md text-sm reverent-transition"
                    >
                      Remove
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
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-foreground">Uploading...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full reverent-transition"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md reverent-transition"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground text-primary-foreground px-4 py-2 rounded-md reverent-transition flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Upload Successful"
        message={successMessage}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Upload Failed"
        message={errorMessage}
      />
    </>
  );
}

