import React from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  open,
  onClose,
  children,
  title,
  preventBackdropClose = false
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  preventBackdropClose?: boolean;
}) {
  console.log('[MODAL] Component called with open:', open, 'title:', title);
  
  if (!open) {
    console.log('[MODAL] Not rendering because open is false');
    return null;
  }
  
  console.log('[MODAL] Rendering modal');

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[350px] max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <button
          className="absolute top-4 right-4 flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
          onClick={handleCloseClick}
          title="Close"
          aria-label="Close"
          type="button"
        >
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-6 pr-8">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}