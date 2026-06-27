'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

function useModalEscapeAndBodyLock(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
}

function ModalFrame({
  isOpen,
  onClose,
  title,
  size,
  className,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: NonNullable<ModalProps['size']>;
  className: string;
  children: React.ReactNode;
}) {
  useModalEscapeAndBodyLock(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div
          className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              title="Close"
              aria-label="Close"
              type="button"
            >
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={title} size={size} className={className}>
      <div className="p-6">{children}</div>
    </ModalFrame>
  );
}

// Confirmation Modal Component
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmModalProps) {
  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={title} size="sm" className="">
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                variant === 'danger'
                  ? 'bg-red-100 text-red-600'
                  : variant === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-blue-100 text-blue-600'
              }`}
            >
              {variant === 'danger' ? '⚠️' : variant === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
          <div className="flex flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              onClick={() => onClose()}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              title={cancelText}
              aria-label={cancelText}
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">{cancelText}</span>
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 ${
                variant === 'danger'
                  ? 'bg-red-100 hover:bg-red-200'
                  : variant === 'warning'
                    ? 'bg-orange-100 hover:bg-orange-200'
                    : 'bg-green-100 hover:bg-green-200'
              }`}
              title={confirmText}
              aria-label={confirmText}
              type="button"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  variant === 'danger' ? 'bg-red-200' : variant === 'warning' ? 'bg-orange-200' : 'bg-green-200'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-orange-600' : 'text-green-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {variant === 'danger' ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
              </div>
              <span
                className={`font-semibold ${
                  variant === 'danger' ? 'text-red-700' : variant === 'warning' ? 'text-orange-700' : 'text-green-700'
                }`}
              >
                {confirmText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}
