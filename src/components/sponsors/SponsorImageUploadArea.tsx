'use client';

import { useState, useRef, useCallback } from 'react';
import { FaUpload, FaSpinner, FaImage, FaTimes } from 'react-icons/fa';
import { uploadSponsorImageServer } from '@/app/admin/event-sponsors/ApiServerActions';

interface SponsorImageUploadAreaProps {
  sponsorId: number;
  imageType: 'logo' | 'hero' | 'banner';
  currentImageUrl?: string | null;
  onUploadSuccess: (imageUrl: string) => void;
  disabled?: boolean;
}

export default function SponsorImageUploadArea({
  sponsorId,
  imageType,
  currentImageUrl,
  onUploadSuccess,
  disabled = false,
}: SponsorImageUploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypeLabel = imageType.charAt(0).toUpperCase() + imageType.slice(1);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPEG, PNG, GIF, etc.)';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile || !sponsorId || disabled) return;

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      const media = await uploadSponsorImageServer(
        sponsorId,
        0, // eventId = 0 for sponsor-level images
        imageType,
        selectedFile
      );

      setUploadProgress(100);
      const imageUrl = media.fileUrl || '';
      onUploadSuccess(imageUrl);

      // Reset form after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(`Failed to upload ${imageType} image: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {imageTypeLabel} Image
      </label>

      {/* Current Primary Image Preview */}
      {currentImageUrl && !selectedFile && (
        <div className="mb-2">
          <img
            src={currentImageUrl}
            alt={`Current ${imageTypeLabel}`}
            className="h-20 w-auto rounded border border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">Primary {imageTypeLabel.toLowerCase()}</p>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center reverent-transition cursor-pointer
          ${dragActive
            ? 'border-primary bg-primary/10'
            : selectedFile
              ? 'border-primary/50 bg-primary/5'
              : 'border-border hover:border-primary/50'
          }
          ${disabled || isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {selectedFile && previewUrl ? (
          <div className="space-y-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto h-24 w-auto rounded-lg object-contain border border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {isUploading ? (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full reverent-transition"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-sm reverent-transition"
                >
                  <FaUpload className="w-3 h-3 inline mr-1" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-md text-sm reverent-transition"
                >
                  <FaTimes className="w-3 h-3 inline mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <>
                <FaSpinner className="mx-auto h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <FaImage className="mx-auto h-8 w-8 text-muted-foreground" />
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded">
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground mt-2">
        Upload multiple {imageTypeLabel.toLowerCase()} images. All images will appear in the Overview section.
      </p>
    </div>
  );
}

