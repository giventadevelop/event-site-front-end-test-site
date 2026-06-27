'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';

// Add CSS animation for smooth fade-in
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  if (!document.head.querySelector('style[data-tooltip-animations]')) {
    style.setAttribute('data-tooltip-animations', 'true');
    document.head.appendChild(style);
  }
}

interface EventFormHelpTooltipProps {
  /** Field name this tooltip is associated with */
  fieldName: string;
  /** Optional custom content to display instead of fetching HTML */
  customContent?: React.ReactNode;
  /** Optional tooltip title (used when customContent is set; default for event form) */
  title?: string;
}

/**
 * Help Tooltip Component for Event Form
 * Displays HTML documentation content in a tooltip when hovering over a question mark icon
 */
const DEFAULT_TITLE = 'Events Page Filtering and Display Rules';

export default function EventFormHelpTooltip({ fieldName, customContent, title }: EventFormHelpTooltipProps) {
  const tooltipTitle = title ?? DEFAULT_TITLE;
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringIconRef = useRef(false);
  const isHoveringTooltipRef = useRef(false);
  /** When true, tooltip was opened by click — stay open until user closes (no close on mouse leave). */
  const openedByClickRef = useRef(false);

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!iconRef.current) return { top: 0, left: 0 };

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipWidth = 800;
    const tooltipHeight = 600;
    const spacing = 12;
    /* Overlap so there's no dead zone when moving mouse from icon to tooltip */
    const overlap = 12;

    let top = iconRect.bottom - overlap;
    let left = iconRect.left;

    // Adjust if tooltip would go off right edge
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 20;
    }

    // Adjust if tooltip would go off bottom edge
    if (top + tooltipHeight > window.innerHeight) {
      top = iconRect.top - tooltipHeight - spacing;
    }

    // Ensure tooltip doesn't go off left edge
    if (left < 20) {
      left = 20;
    }

    // Ensure tooltip doesn't go off top edge
    if (top < 20) {
      top = 20;
    }

    return { top, left };
  }, []);

  // Fetch HTML content when tooltip opens
  useEffect(() => {
    if (isOpen && !customContent && !htmlContent && !loading && !error) {
      setLoading(true);
      fetch('/documentation/event_details_redesign/events_page_filtering_display_rules.html')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch documentation');
          return res.text();
        })
        .then(html => {
          setHtmlContent(html);
          setLoading(false);
        })
        .catch(err => {
          console.error('[EventFormHelpTooltip] Error fetching documentation:', err);
          setError('Unable to load help documentation');
          setLoading(false);
        });
    }
  }, [isOpen, customContent, htmlContent, loading, error]);

  // Update position when tooltip opens
  useEffect(() => {
    if (isOpen) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
  }, [isOpen, calculatePosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        isHoveringIconRef.current = false;
        isHoveringTooltipRef.current = false;
        openedByClickRef.current = false;
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        isHoveringIconRef.current = false;
        isHoveringTooltipRef.current = false;
        openedByClickRef.current = false;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMouseEnter = useCallback(() => {
    isHoveringIconRef.current = true;

    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // If already open, keep it open
    if (isOpen) {
      return;
    }

    // Clear any existing open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    // Delay opening to prevent shaky behavior
    openTimeoutRef.current = setTimeout(() => {
      if (isHoveringIconRef.current || isHoveringTooltipRef.current) {
        openedByClickRef.current = false; // opened by hover — close on leave after delay
        setIsOpen(true);
      }
      openTimeoutRef.current = null;
    }, 700);
  }, [isOpen]);

  const handleMouseLeave = useCallback(() => {
    isHoveringIconRef.current = false;

    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // When opened by click, do not close on mouse leave — user must close explicitly
    if (openedByClickRef.current) return;

    // Delay closing to allow moving mouse to tooltip
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringIconRef.current && !isHoveringTooltipRef.current) {
        setIsOpen(false);
      }
      closeTimeoutRef.current = null;
    }, 900);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    isHoveringTooltipRef.current = true;

    // Clear any pending close timeout when mouse enters tooltip
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    isHoveringTooltipRef.current = false;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // When opened by click, do not close on mouse leave
    if (openedByClickRef.current) return;

    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringIconRef.current && !isHoveringTooltipRef.current) {
        setIsOpen(false);
      }
      closeTimeoutRef.current = null;
    }, 900);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        isHoveringIconRef.current = true;
        openedByClickRef.current = true; // stay open until user closes
      } else {
        isHoveringIconRef.current = false;
        isHoveringTooltipRef.current = false;
        openedByClickRef.current = false;
      }
      return newState;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    isHoveringIconRef.current = false;
    isHoveringTooltipRef.current = false;
    openedByClickRef.current = false;

    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  return (
    <>
      {/* Question Mark Icon */}
      <button
        ref={iconRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-flex items-center justify-center w-5 h-5 ml-2 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full transition-colors"
        title={`Help for ${fieldName}`}
        aria-label={`Show help for ${fieldName}`}
        aria-expanded={isOpen}
      >
        <FaQuestionCircle className="w-5 h-5" />
      </button>

      {/* Tooltip Content */}
      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className="fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-blue-500 overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: 'min(90vw, 800px)',
            maxHeight: 'min(80vh, 600px)',
            animation: 'fadeIn 0.3s ease-in-out forwards',
            opacity: 0,
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex items-center justify-between border-b border-blue-700 z-10">
            <h3 className="text-lg font-bold text-yellow-200 drop-shadow-md">
              {tooltipTitle}
            </h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Close help tooltip"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(min(80vh, 600px) - 60px)' }}>
            {loading && (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p>Loading help documentation...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                  <p className="text-sm text-red-600 mt-2">
                    Documentation file not found. Please ensure the file exists at:
                    <br />
                    <code className="text-xs">/documentation/event_details_redesign/events_page_filtering_display_rules.html</code>
                  </p>
                </div>
              </div>
            )}

            {customContent && (
              <div className="p-6">
                {customContent}
              </div>
            )}

            {!loading && !error && !customContent && htmlContent && (
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              />
            )}

            {!loading && !error && !customContent && !htmlContent && (
              <div className="p-8 text-center text-gray-500">
                <p>No help content available for this field.</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
