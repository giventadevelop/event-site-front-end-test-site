'use client';

import React, { useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

const TOOLTIP_WIDTH = 450;
const TOOLTIP_SPACING = 12;

function formatTooltipValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">(empty)</span>;
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function AdminHoverTooltipPortal({
  entries,
  anchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  entries: Record<string, unknown>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  if (!anchorRect) return null;

  let top = anchorRect.top;
  let left = anchorRect.right + TOOLTIP_SPACING;

  const estimatedHeight = 300;
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - TOOLTIP_SPACING;
  }
  if (top < TOOLTIP_SPACING) {
    top = TOOLTIP_SPACING;
  }
  if (left + TOOLTIP_WIDTH > window.innerWidth - TOOLTIP_SPACING) {
    left = window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_SPACING;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    width: `${TOOLTIP_WIDTH}px`,
    fontSize: '14px',
    maxHeight: '400px',
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };

  return ReactDOM.createPortal(
    <div
      style={style}
      tabIndex={-1}
      className="admin-tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
          type="button"
        >
          &times;
        </button>
      </div>
      <table className="admin-tooltip-table">
        <tbody>
          {Object.entries(entries).map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{formatTooltipValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

export function useAdminHoverTooltip<T>() {
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipItem, setTooltipItem] = React.useState<T | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = React.useState<DOMRect | null>(null);

  const clearTooltipTimer = useCallback(() => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback((item: T, e: React.MouseEvent) => {
    clearTooltipTimer();
    setTooltipItem(item);
    setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
  }, [clearTooltipTimer]);

  const handleMouseLeave = useCallback(() => {
    tooltipTimer.current = setTimeout(() => {
      setTooltipItem(null);
      setTooltipAnchor(null);
    }, 200);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    clearTooltipTimer();
  }, [clearTooltipTimer]);

  const handleTooltipMouseLeave = useCallback(() => {
    handleMouseLeave();
  }, [handleMouseLeave]);

  const closeTooltip = useCallback(() => {
    clearTooltipTimer();
    setTooltipItem(null);
    setTooltipAnchor(null);
  }, [clearTooltipTimer]);

  return {
    tooltipItem,
    tooltipAnchor,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    closeTooltip,
  };
}
