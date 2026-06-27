'use client';

import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ValidationErrorDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ValidationErrorDialog({
  isOpen,
  title = 'Validation Error',
  message,
  onClose,
}: ValidationErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative bg-red-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="bg-red-100 rounded-full p-4 flex items-center justify-center">
            <FaExclamationTriangle className="w-12 h-12 text-red-500" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-heading font-semibold text-red-800">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-red-800 leading-relaxed">
            {message}
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

