'use client';

import { useMemo, useState } from 'react';
import type { LiturgyCalendarItem } from '../types';
import { LiturgyDayDetailPanel } from './LiturgyDayDetailPanel';

function getDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: { day: number | null }[] = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

export function LiturgyMonthView({
  items,
  year,
  month,
  onDaySelect,
}: {
  items: LiturgyCalendarItem[];
  year: number;
  month: number;
  onDaySelect?: (date: string) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<LiturgyCalendarItem | null>(null);

  const cells = useMemo(() => getDays(year, month), [year, month]);
  const itemsByDate = useMemo(() => {
    const map = new Map<string, LiturgyCalendarItem>();
    for (const item of items) {
      map.set(item.startDate, item);
    }
    return map;
  }, [items]);

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      month - 1 === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const handleDayClick = (dateStr: string, item: LiturgyCalendarItem | undefined) => {
    if (item) {
      setSelectedDay(item);
    }
    onDaySelect?.(dateStr);
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((h) => (
            <div
              key={h}
              className="bg-[#f0f4f8] text-xs sm:text-sm font-bold text-syro-blue text-center py-3 px-1"
            >
              <span className="hidden sm:inline">{h === 'Sun' ? 'Sunday' : h === 'Mon' ? 'Monday' : h === 'Tue' ? 'Tuesday' : h === 'Wed' ? 'Wednesday' : h === 'Thu' ? 'Thursday' : h === 'Fri' ? 'Friday' : 'Saturday'}</span>
              <span className="sm:hidden">{h}</span>
            </div>
          ))}

          {cells.map((c, idx) => {
            const dateStr = c.day
              ? `${year}-${String(month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`
              : null;
            const item = dateStr ? itemsByDate.get(dateStr) : undefined;
            const isTodayCell = isToday(c.day);

            return (
              <div
                key={idx}
                className={`min-h-[100px] sm:min-h-[120px] p-2 bg-white ${
                  !c.day ? 'bg-gray-50' : ''
                } ${isTodayCell ? 'bg-syro-red/5' : ''} hover:bg-gray-50 transition-colors`}
              >
                {c.day && dateStr && (
                  <>
                    <div
                      className={`text-xs sm:text-sm font-bold mb-1 ${
                        isTodayCell
                          ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-syro-red text-white'
                          : 'text-syro-dark-gray'
                      }`}
                    >
                      {c.day}
                    </div>

                    {item ? (
                      <button
                        type="button"
                        onClick={() => handleDayClick(dateStr, item)}
                        className="w-full text-left text-xs truncate px-2 py-1.5 rounded-lg bg-syro-red/10 hover:bg-syro-red/20 text-syro-blue transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm"
                        title={item.title}
                      >
                        <span className="block truncate font-medium">{item.title}</span>
                        {item.season && (
                          <span className="block truncate text-[10px] text-[#798daf] mt-0.5">
                            {item.season}
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">—</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <LiturgyDayDetailPanel item={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}
