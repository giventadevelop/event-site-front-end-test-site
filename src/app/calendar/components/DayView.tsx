"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

export function DayView({
  events,
  date,
  theme = 'default',
}: {
  events: CalendarEvent[];
  date: Date;
  theme?: 'default' | 'syro';
}) {
  const isSyro = theme === 'syro';
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format date as YYYY-MM-DD for comparison
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const todays = events.filter(e => e.startDate === dateStr);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    // Add a small delay before hiding to prevent flickering when moving to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredEvent(null);
      setTooltipAnchor(null);
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    // Clear hide timeout when mouse enters tooltip
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };
  return (
    <div
      className={`bg-white overflow-hidden ${
        isSyro ? 'rounded-lg border border-gray-200 shadow-sm' : 'rounded-xl shadow-md'
      }`}
    >
      <div
        className={
          isSyro
            ? 'bg-syro-red/5 px-6 py-4 border-b border-syro-red/20'
            : 'bg-gradient-to-br from-violet-50 to-violet-100 px-6 py-4 border-b border-violet-200'
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              isSyro ? 'bg-syro-red/10' : 'bg-violet-100'
            }`}
          >
            <svg
              className={`w-7 h-7 ${isSyro ? 'text-syro-red' : 'text-violet-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3
              className={`text-base sm:text-lg font-bold ${
                isSyro ? 'text-syro-blue font-syro-display' : 'text-violet-900'
              }`}
            >
              {date.toLocaleDateString(undefined, { weekday: 'long' })}
            </h3>
            <p className={`text-xs sm:text-sm ${isSyro ? 'text-[#798daf] font-syro-primary' : 'text-violet-600'}`}>
              {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 sm:p-6">
        {todays.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm ${isSyro ? 'text-[#798daf] font-syro-primary' : 'text-gray-500'}`}>
              No events scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todays.map(event => (
              <div
                key={event.id}
                className={`border rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isSyro ? 'border-gray-200 hover:border-syro-red/30' : 'border-gray-200'
                }`}
                onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                onMouseLeave={handleEventMouseLeave}
              >
                <Link href={`/events/${event.id}`} className="block">
                  <div
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      isSyro ? 'hover:bg-syro-red/5' : 'hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center border-2 ${
                          isSyro
                            ? 'bg-syro-red/10 border-syro-red/30'
                            : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSyro ? 'text-syro-red' : 'text-indigo-600'}`}>
                          {event.startTime?.split(':').slice(0, 2).join(':') || 'TBA'}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm sm:text-base font-bold mb-1 truncate ${
                          isSyro ? 'text-syro-blue' : 'text-gray-900'
                        }`}
                      >
                        {event.title}
                      </h4>
                      <div
                        className={`flex flex-col gap-1 text-xs ${
                          isSyro ? 'text-syro-dark-gray font-syro-primary' : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 self-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {hoveredEvent && (
        <EventTooltip
          event={hoveredEvent}
          anchorRect={tooltipAnchor}
          onClose={handleTooltipMouseLeave}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </div>
  );
}


