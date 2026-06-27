'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';

interface AdminHelpDialogProps {
  title: string;
  documentationUrl?: string;
  customContent?: React.ReactNode;
  ariaLabel?: string;
  iconClassName?: string;
  headerGradientClass?: string;
  borderClass?: string;
}

/**
 * Reusable admin help dialog (click-to-open), patterned after EventFormHelpTooltip.
 */
export default function AdminHelpDialog({
  title,
  documentationUrl,
  customContent,
  ariaLabel,
  iconClassName = 'text-blue-500 hover:text-blue-700',
  headerGradientClass = 'from-blue-500 to-blue-600',
  borderClass = 'border-blue-500',
}: AdminHelpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || customContent || !documentationUrl || htmlContent || loading || error) {
      return;
    }
    setLoading(true);
    fetch(documentationUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documentation');
        return res.text();
      })
      .then((html) => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AdminHelpDialog] fetch error:', err);
        setError('Unable to load help documentation');
        setLoading(false);
      });
  }, [isOpen, customContent, documentationUrl, htmlContent, loading, error]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        className={`inline-flex items-center justify-center w-5 h-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 rounded-full transition-colors ${iconClassName}`}
        title={ariaLabel ?? title}
        aria-label={ariaLabel ?? title}
        aria-expanded={isOpen}
      >
        <FaQuestionCircle className="w-5 h-5" />
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40">
            <div
              ref={dialogRef}
              className={`bg-white rounded-lg shadow-2xl border-2 ${borderClass} overflow-hidden w-full max-w-[min(90vw,800px)] max-h-[min(80vh,600px)] flex flex-col`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-help-dialog-title"
            >
              <div
                className={`sticky top-0 bg-gradient-to-r ${headerGradientClass} text-white px-4 py-3 flex items-center justify-between border-b border-teal-700 z-10 shrink-0`}
              >
                <h3
                  id="admin-help-dialog-title"
                  className="text-lg font-bold text-yellow-200 drop-shadow-md pr-4"
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close help dialog"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0">
                {loading && (
                  <div className="p-8 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-2" />
                    <p>Loading help documentation...</p>
                  </div>
                )}

                {error && (
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                      {error}
                      {documentationUrl && (
                        <p className="mt-2 text-xs">
                          Expected: <code>{documentationUrl}</code>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {customContent && <div className="p-6">{customContent}</div>}

                {!loading && !error && !customContent && htmlContent && (
                  <div
                    className="p-6 admin-help-dialog-body"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
