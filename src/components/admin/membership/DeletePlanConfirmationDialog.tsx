'use client';

import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';

type DeleteStatus = 'confirming' | 'deleting' | 'success' | 'error';

interface DeletePlanConfirmationDialogProps {
  isOpen: boolean;
  status: DeleteStatus;
  planName?: string;
  message?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  onClose: () => void;
}

export function DeletePlanConfirmationDialog({
  isOpen,
  status,
  planName,
  message,
  onConfirm,
  onCancel,
  onClose,
}: DeletePlanConfirmationDialogProps) {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'confirming':
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-red-500" />,
          title: 'Delete Membership Plan',
          message: message || (
            <>
              <p className="mb-2">
                Are you sure you want to delete <strong>{planName || 'this plan'}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The plan will be permanently removed from the system.
              </p>
            </>
          ),
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          showButtons: true,
        };
      case 'deleting':
        return {
          icon: <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />,
          title: 'Deleting Plan...',
          message: 'Please wait while we delete the plan.',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          textColor: 'text-blue-800',
          showButtons: false,
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="w-12 h-12 text-green-500" />,
          title: 'Plan Deleted Successfully',
          message: `The plan "${planName || 'plan'}" has been successfully deleted.`,
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
          showButtons: false,
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-red-500" />,
          title: 'Delete Failed',
          message: message || 'Failed to delete the plan. Please try again.',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          showButtons: false,
        };
      default:
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-red-500" />,
          title: 'Delete Plan',
          message: 'Are you sure you want to delete this plan?',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          showButtons: true,
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative ${content.bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - only show for success/error states */}
        {(status === 'error' || status === 'success') && (
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
          <h3 className={`text-xl font-heading font-semibold ${content.textColor}`}>
            {content.title}
          </h3>

          {/* Message */}
          <div className={`text-sm ${content.textColor} leading-relaxed`}>
            {typeof content.message === 'string' ? (
              <p>{content.message}</p>
            ) : (
              content.message
            )}
          </div>

          {/* Loading indicator for deleting state */}
          {status === 'deleting' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Action Buttons */}
          {content.showButtons && (
            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                Delete Plan
              </button>
            </div>
          )}

          {/* Close button for success/error */}
          {(status === 'success' || status === 'error') && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

