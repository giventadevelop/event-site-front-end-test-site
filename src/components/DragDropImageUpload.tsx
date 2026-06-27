"use client";
import React, { useState, useRef, useCallback } from 'react';
import { FaUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa';

interface DragDropImageUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function DragDropImageUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  previewUrl,
  isUploading = false,
  uploadProgress = 0,
  accept = "image/*",
  maxSize = 10, // 10MB default
  className = ""
}: DragDropImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPEG, PNG, GIF, etc.)';
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, maxSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    onFileRemove();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Profile Photo
      </label>

      {/* Drag and Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
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
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 mx-auto"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {isUploading ? (
              <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            ) : (
              <FaImage className="w-8 h-8 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600 mb-1">
              {isUploading ? 'Uploading...' : 'Drag & drop an image here'}
            </p>
            <p className="text-xs text-gray-500">
              or <span className="text-blue-600 hover:text-blue-800">browse files</span>
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p><strong>File:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p><strong>Type:</strong> {selectedFile.type}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        PNG, JPG, GIF up to {maxSize}MB. Recommended: 400x400 pixels (4:5 ratio).
      </p>
    </div>
  );
}
