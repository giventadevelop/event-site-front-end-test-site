"use client";
import React from 'react';
import { createPortal } from 'react-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import type { CalendarEvent } from '../types/calendar.types';

interface EventTooltipProps {
  event: CalendarEvent | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function EventTooltip({ event, anchorRect, onClose, onMouseEnter, onMouseLeave }: EventTooltipProps) {
  if (!event || !anchorRect) return null;
  if (typeof window === 'undefined' || !document.body) return null;

  const tooltipWidth = 320;
  const spacing = 12;
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;
  const estimatedHeight = 200;

  // Clamp position to stay within viewport
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth) {
    left = anchorRect.left - tooltipWidth - spacing;
  }
  if (left < spacing) {
    left = spacing;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    // Handle formats like "05:00 PM" or "17:00:00"
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr;
    }
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    width: tooltipWidth,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    padding: '1rem',
    fontSize: '0.875rem',
    pointerEvents: 'auto',
    transition: 'opacity 0.2s ease-in-out',
  };

  return createPortal(
    <div
      style={style}
      className="event-tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      {/* Close button */}
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end mb-2">
        <button
          onClick={onClose}
          className="w-6 h-6 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>

      {/* Event Title */}
      <h3 className="font-semibold text-gray-900 text-base mb-3 pr-6">
        {event.title}
      </h3>

      {/* Event Caption (if available) */}
      {event.caption && (
        <p className="text-sm text-gray-600 mb-3 italic">
          {event.caption}
        </p>
      )}

      {/* Event Details */}
      <div className="space-y-2">
        {/* Date */}
        <div className="flex items-start gap-2 text-gray-700">
          <FaCalendarAlt className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">{formatDate(event.startDate)}</div>
            {event.endDate && event.endDate !== event.startDate && (
              <div className="text-xs text-gray-500">to {formatDate(event.endDate)}</div>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-2 text-gray-700">
          <FaClock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {formatTime(event.startTime)}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </div>
            {event.timezone && (
              <div className="text-xs text-gray-500">{event.timezone}</div>
            )}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-2 text-gray-700">
            <FaMapMarkerAlt className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium">{event.location}</div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

