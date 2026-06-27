'use client';

import React from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';

export type DeleteStatus = 'idle' | 'confirming' | 'deleting' | 'activating' | 'success' | 'error';
export type DeleteMode = 'soft' | 'hard' | 'activate';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  status: DeleteStatus;
  eventTitle?: string;
  isRecurring?: boolean;
  hasChildren?: boolean;
  childCount?: number;
  deleteMode?: DeleteMode;
  message?: string | React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  onClose?: () => void;
}

export default function DeleteConfirmationDialog({
  isOpen,
  status,
  eventTitle,
  isRecurring = false,
  hasChildren = false,
  childCount = 0,
  deleteMode = 'soft',
  message,
  onConfirm,
  onCancel,
  onClose,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'confirming':
        const isHardDelete = deleteMode === 'hard';
        const isActivate = deleteMode === 'activate';

        if (isActivate) {
          return {
            icon: <FaCheckCircle className="w-12 h-12 text-green-500" />,
            title: 'Confirm Activate Event',
            message: message || (
              <>
                {hasChildren && childCount > 0 ? (
                  <>
                    <p className="mb-2">This is a <strong>parent event</strong> with <strong>{childCount} child event{childCount !== 1 ? 's' : ''}</strong> in its recurrence series.</p>
                    <p className="mb-2"><strong>The parent event and all {childCount} child event{childCount !== 1 ? 's' : ''} will be activated.</strong></p>
                    <p>They will be visible to the public and available for registration.</p>
                    <p className="mt-2">Are you sure you want to continue?</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">This is a <strong>single occurrence</strong> in a recurrence series.</p>
                    <p className="mb-2"><strong>Only this occurrence will be activated.</strong></p>
                    <p>The parent event and other occurrences will remain unchanged.</p>
                    <p className="mt-2">Are you sure you want to continue?</p>
                  </>
                )}
              </>
            ),
            bgColor: 'bg-green-50',
            iconBg: 'bg-green-100',
            textColor: 'text-green-800',
            showButtons: true,
          };
        }

        // Delete mode (soft or hard)
        return {
          icon: <FaExclamationTriangle className={`w-12 h-12 ${isHardDelete ? 'text-red-500' : 'text-orange-500'}`} />,
          title: isHardDelete ? 'Confirm Permanent Delete' : 'Confirm Deactivate Event',
          message: message || (
            <>
              {hasChildren && childCount > 0 ? (
                <>
                  <p className="mb-2">This is a <strong>parent event</strong> with <strong>{childCount} child event{childCount !== 1 ? 's' : ''}</strong> in its recurrence series.</p>
                  {isHardDelete ? (
                    <>
                      <p className="mb-2 text-red-700 font-semibold">⚠️ WARNING: This will <strong>permanently delete</strong> the parent event and all {childCount} child event{childCount !== 1 ? 's' : ''}.</p>
                      <p className="mb-2">This action <strong>cannot be undone</strong>. All event data, registrations, and related information will be permanently removed.</p>
                      <p>Are you absolutely sure you want to continue?</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2"><strong>The parent event and all {childCount} child event{childCount !== 1 ? 's' : ''} will be marked as inactive.</strong></p>
                      <p>They will be hidden from public view but can be reactivated later.</p>
                      <p className="mt-2">Are you sure you want to continue?</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <p className="mb-2">This is a <strong>single occurrence</strong> in a recurrence series.</p>
                  {isHardDelete ? (
                    <>
                      <p className="mb-2 text-red-700 font-semibold">⚠️ WARNING: This will <strong>permanently delete</strong> only this occurrence.</p>
                      <p className="mb-2">The parent event and other occurrences will remain unchanged.</p>
                      <p className="mb-2">This action <strong>cannot be undone</strong>.</p>
                      <p>Are you absolutely sure you want to continue?</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2"><strong>Only this occurrence will be marked as inactive.</strong></p>
                      <p>The parent event and other occurrences will remain unchanged.</p>
                      <p className="mt-2">Are you sure you want to continue?</p>
                    </>
                  )}
                </>
              )}
            </>
          ),
          bgColor: isHardDelete ? 'bg-red-50' : 'bg-orange-50',
          iconBg: isHardDelete ? 'bg-red-100' : 'bg-orange-100',
          textColor: isHardDelete ? 'text-red-800' : 'text-orange-800',
          showButtons: true,
        };
      case 'deleting':
        const isHardDeleteDeleting = deleteMode === 'hard';
        return {
          icon: <FaTrashAlt className={`w-12 h-12 ${isHardDeleteDeleting ? 'text-red-500' : 'text-blue-500'} animate-pulse`} />,
          title: isHardDeleteDeleting ? 'Permanently Deleting Event...' : 'Deactivating Event...',
          message: message || (isHardDeleteDeleting
            ? 'Please wait while we permanently delete this event and all related data...'
            : 'Please wait while we mark this event as inactive...'),
          bgColor: isHardDeleteDeleting ? 'bg-red-50' : 'bg-blue-50',
          iconBg: isHardDeleteDeleting ? 'bg-red-100' : 'bg-blue-100',
          textColor: isHardDeleteDeleting ? 'text-red-800' : 'text-blue-800',
          showButtons: false,
        };
      case 'activating':
        return {
          icon: <FaCheckCircle className="w-12 h-12 text-green-500 animate-pulse" />,
          title: 'Activating Event...',
          message: message || 'Please wait while we activate this event...',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
          showButtons: false,
        };
      case 'success':
        const isHardDeleteSuccess = deleteMode === 'hard';
        const isActivateSuccess = deleteMode === 'activate';
        return {
          icon: <FaTimes className="w-12 h-12 text-green-600" />,
          title: isActivateSuccess
            ? 'Event Activated Successfully!'
            : isHardDeleteSuccess
              ? 'Event Permanently Deleted!'
              : 'Event Deactivated Successfully!',
          message: message || (isActivateSuccess
            ? 'The event has been activated successfully.'
            : isHardDeleteSuccess
              ? 'The event and all related data have been permanently deleted.'
              : 'The event has been marked as inactive.'),
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
          showButtons: false,
        };
      case 'error':
        const isActivateError = deleteMode === 'activate';
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-red-600" />,
          title: isActivateError ? 'Activation Failed' : 'Delete Failed',
          message: message || (isActivateError
            ? 'An error occurred while activating the event. Please try again.'
            : 'An error occurred while deleting the event. Please try again.'),
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          showButtons: false,
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) {
    console.log('[DeleteConfirmationDialog] No content returned, status:', status, 'deleteMode:', deleteMode);
    return null;
  }

  console.log('[DeleteConfirmationDialog] Rendering dialog, status:', status, 'deleteMode:', deleteMode, 'showButtons:', content.showButtons, 'isOpen:', isOpen);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative ${content.bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - only show for error state */}
        {(status === 'error' || status === 'success') && onClose && (
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

          {/* Event Title (if provided) */}
          {eventTitle && status === 'confirming' && (
            <p className={`text-sm font-medium ${content.textColor}`}>
              Event: {eventTitle}
            </p>
          )}

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
          {content.showButtons ? (
            <div className="flex flex-row flex-wrap items-stretch gap-3 sm:gap-4 mt-6 w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                title="Cancel"
                aria-label="Cancel"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Cancel</span>
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    await onConfirm();
                  } catch (error) {
                    console.error('[DeleteConfirmationDialog] Error calling onConfirm:', error);
                  }
                }}
                className={`flex-1 flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 ${
                  deleteMode === 'activate'
                    ? 'bg-green-100 hover:bg-green-200'
                    : 'bg-red-100 hover:bg-red-200'
                }`}
                title={deleteMode === 'activate' ? 'Activate event' : deleteMode === 'hard' ? 'Permanently delete event' : 'Deactivate event'}
                aria-label={deleteMode === 'activate' ? 'Activate event' : deleteMode === 'hard' ? 'Permanently delete event' : 'Deactivate event'}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    deleteMode === 'activate' ? 'bg-green-200' : 'bg-red-200'
                  }`}
                >
                  {deleteMode === 'activate' ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </div>
                <span className={`font-semibold ${deleteMode === 'activate' ? 'text-green-700' : 'text-red-700'}`}>
                  {deleteMode === 'activate' ? 'Activate' : deleteMode === 'hard' ? 'Permanently Delete' : 'Deactivate'}
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-4 text-xs text-gray-500">
              [Debug] Buttons not shown - showButtons: {String(content.showButtons)}, status: {status}
            </div>
          )}

          {/* Close button for success/error */}
          {(status === 'success' || status === 'error') && onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

