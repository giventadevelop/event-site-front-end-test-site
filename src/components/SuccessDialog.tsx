"use client";
import React from 'react';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  showRefreshButton = false,
  onRefresh,
}: SuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-dialog-title"
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 transition-all duration-300 hover:scale-110 hover:bg-green-200"
          title="Close"
          aria-label="Close"
          type="button"
        >
          <svg className="h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pb-6 pt-8 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-sm ring-4 ring-green-200/60">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h3 id="success-dialog-title" className="font-heading mb-3 text-2xl font-semibold text-green-800">
            {title}
          </h3>

          {/* Message */}
          <div className="mb-6 rounded-xl border-2 border-green-200 bg-green-100/80 px-4 py-3">
            <p className="font-body text-base leading-relaxed text-green-800">{message}</p>
          </div>

          {showRefreshButton && onRefresh && (
            <div className="mb-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left">
              <p className="mb-3 text-sm font-medium text-green-800">
                The page will refresh to show the updated content.
              </p>
              <button
                onClick={onRefresh}
                className="flex h-14 w-full flex-shrink-0 items-center justify-center gap-3 rounded-xl bg-green-100 px-6 transition-all duration-300 hover:scale-105 hover:bg-green-200"
                title="Refresh Page"
                aria-label="Refresh Page"
                type="button"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-200">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700">Refresh Page</span>
              </button>
            </div>
          )}

          {/* Primary OK button — admin dialog pattern (green) */}
          <button
            onClick={onClose}
            className="flex h-14 w-full flex-shrink-0 items-center justify-center gap-3 rounded-xl bg-green-100 px-6 transition-all duration-300 hover:scale-105 hover:bg-green-200"
            title={buttonText}
            aria-label={buttonText}
            type="button"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-200">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
