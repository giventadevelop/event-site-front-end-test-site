"use client";
import { useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday start
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

export function WeekView({
  events,
  anchorDate,
  theme = 'default',
  calendarBasePath = '/calendar',
}: {
  events: CalendarEvent[];
  anchorDate: Date;
  theme?: 'default' | 'syro';
  calendarBasePath?: string;
}) {
  const isSyro = theme === 'syro';
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const start = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const ev of events) {
    const dayNum = Number(ev.startDate.split('-')[2]);
    const arr = eventsByDay.get(dayNum) || [];
    arr.push(ev);
    eventsByDay.set(dayNum, arr);
  }

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };
  const today = new Date();
  const isToday = (d: Date) => {
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${isSyro ? 'border border-gray-200' : ''}`}>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((d, idx) => {
          const day = d.getDate();
          const evs = eventsByDay.get(day) || [];
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isTodayCell = isToday(d);

          return (
            <div
              key={idx}
              className={`min-h-[140px] sm:min-h-[160px] p-2 sm:p-3 bg-white ${
                isTodayCell ? (isSyro ? 'bg-syro-red/5' : 'bg-gradient-to-br from-green-50 to-green-100') : ''
              } hover:bg-gray-50 transition-colors`}
            >
              {/* Day Header */}
              <div className="mb-2">
                <div
                  className={`text-xs sm:text-sm font-bold ${
                    isTodayCell ? (isSyro ? 'text-syro-red' : 'text-green-700') : isSyro ? 'text-syro-dark-gray' : 'text-gray-700'
                  }`}
                >
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg sm:text-xl font-bold ${
                    isTodayCell
                      ? isSyro
                        ? 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-syro-red text-white'
                        : 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white'
                      : isSyro
                        ? 'text-syro-blue'
                        : 'text-gray-900'
                  }`}
                >
                  {day}
                </div>
                <div className={`text-xs ${isSyro ? 'text-[#798daf]' : 'text-gray-500'}`}>
                  {d.toLocaleDateString(undefined, { month: 'short' })}
                </div>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-1">
                {evs.slice(0, 5).map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className={
                      isSyro
                        ? 'group text-xs truncate px-2 py-1.5 rounded-lg bg-syro-red/10 hover:bg-syro-red/20 text-syro-red transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm'
                        : 'group text-xs truncate px-2 py-1.5 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-800 transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm'
                    }
                    onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                    onMouseLeave={handleEventMouseLeave}
                  >
                    <div className="flex items-center gap-1">
                      <svg
                        className={`w-3 h-3 flex-shrink-0 ${isSyro ? 'text-syro-red' : 'text-green-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  </Link>
                ))}
                {evs.length > 5 && (
                  <Link
                    href={`${calendarBasePath}?view=day&date=${dateStr}`}
                    className={
                      isSyro
                        ? 'text-xs px-2 py-1 text-syro-blue hover:text-syro-red font-semibold hover:underline transition-colors cursor-pointer flex items-center gap-1'
                        : 'text-xs px-2 py-1 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors cursor-pointer flex items-center gap-1'
                    }
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {evs.length - 5} more
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hoveredEvent && (
        <EventTooltip
          event={hoveredEvent}
          anchorRect={tooltipAnchor}
          onClose={handleEventMouseLeave}
        />
      )}
    </div>
  );
}


