"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

function getDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [] as { day: number | null }[];
  for (let i = 0; i < startDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

export function MonthView({
  events,
  year,
  month,
  theme = 'default',
  calendarBasePath = '/calendar',
}: {
  events: CalendarEvent[];
  year: number;
  month: number;
  theme?: 'default' | 'syro';
  calendarBasePath?: string;
}) {
  const isSyro = theme === 'syro';
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const cells = useMemo(() => getDays(year, month), [year, month]);
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const ev of events) {
      const day = Number(ev.startDate.split('-')[2]);
      if (!Number.isFinite(day)) continue;
      const arr = map.get(day) || [];
      arr.push(ev);
      map.set(day, arr);
    }
    return map;
  }, [events]);

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      month - 1 === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const dayHeaders = isSyro
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${isSyro ? 'border border-gray-200' : ''}`}>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {dayHeaders.map((h) => (
          <div
            key={h}
            className={
              isSyro
                ? 'bg-[#f0f4f8] text-xs sm:text-sm font-bold text-syro-blue text-center py-3 px-1'
                : 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-xs sm:text-sm font-bold text-indigo-700 text-center py-3 px-1'
            }
          >
            <span className="hidden sm:inline">
              {isSyro
                ? h === 'Sun'
                  ? 'Sunday'
                  : h === 'Mon'
                    ? 'Monday'
                    : h === 'Tue'
                      ? 'Tuesday'
                      : h === 'Wed'
                        ? 'Wednesday'
                        : h === 'Thu'
                          ? 'Thursday'
                          : h === 'Fri'
                            ? 'Friday'
                            : 'Saturday'
                : h}
            </span>
            <span className="sm:hidden">{isSyro ? h : h.slice(0, 3)}</span>
          </div>
        ))}

        {/* Calendar Days */}
        {cells.map((c, idx) => {
          const evs = c.day ? (eventsByDay.get(c.day) || []) : [];
          const dateStr = c.day ? `${year}-${String(month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}` : null;
          const isTodayCell = isToday(c.day);

          return (
            <div
              key={idx}
              className={`min-h-[100px] sm:min-h-[120px] p-2 bg-white ${
                !c.day ? 'bg-gray-50' : ''
              } ${isTodayCell ? (isSyro ? 'bg-syro-red/5' : 'bg-gradient-to-br from-blue-50 to-purple-50') : ''} hover:bg-gray-50 transition-colors`}
            >
              {c.day && (
                <>
                  <div className={`text-xs sm:text-sm font-bold mb-1 ${
                    isTodayCell
                      ? isSyro
                        ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-syro-red text-white'
                        : 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white'
                      : isSyro
                        ? 'text-syro-dark-gray'
                        : 'text-gray-700'
                  }`}>
                    {c.day}
                  </div>

                  {/* Events */}
                  <div className="flex flex-col gap-1">
                    {evs.slice(0, 3).map(event => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className={
                          isSyro
                            ? 'group text-xs truncate px-2 py-1.5 rounded-lg bg-syro-red/10 hover:bg-syro-red/20 text-syro-red transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm text-left'
                            : 'group text-xs truncate px-2 py-1.5 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-800 transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm'
                        }
                        onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                        onMouseLeave={handleEventMouseLeave}
                      >
                        <div className="flex items-center gap-1">
                          <svg
                            className={`w-3 h-3 flex-shrink-0 ${isSyro ? 'text-syro-red' : 'text-teal-600'}`}
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
                    {evs.length > 3 && dateStr && (
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
                        {evs.length - 3} more
                      </Link>
                    )}
                  </div>
                </>
              )}
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


