'use client';

import React from 'react';
import { FaCheckCircle, FaSpinner, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveStatusDialogProps {
  isOpen: boolean;
  status: SaveStatus;
  message?: string;
  title?: string;
  onClose?: () => void;
}

export default function SaveStatusDialog({
  isOpen,
  status,
  message,
  title,
  onClose,
}: SaveStatusDialogProps) {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />,
          title: title || 'Saving...',
          message: message || 'Please wait while we save your changes.',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          textColor: 'text-blue-800',
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="w-12 h-12 text-green-600" />,
          title: title || 'Saved Successfully!',
          message: message || 'Your changes have been saved successfully.',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
        };
      case 'error':
        return {
          icon: <FaExclamationCircle className="w-12 h-12 text-red-600" />,
          title: title || 'Save Failed',
          message: message || 'An error occurred while saving. Please try again.',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative ${content.bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - only show for error state */}
        {status === 'error' && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`${content.iconBg} rounded-full p-4 flex items-center justify-center`}>
            {content.icon}
          </div>

          {/* Title */}
          <h3 className={`text-xl font-semibold ${content.textColor}`}>
            {content.title}
          </h3>

          {/* Message */}
          <p className={`text-sm ${content.textColor} leading-relaxed`}>
            {content.message}
          </p>

          {/* Loading indicator for saving state */}
          {status === 'saving' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


