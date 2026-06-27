'use client';

import type { LiturgyCalendarItem } from '../types';
import { LiturgyReadingsList } from './LiturgyReadingsList';

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

export function LiturgyWeekView({
  items,
  anchorDate,
  onDaySelect,
}: {
  items: LiturgyCalendarItem[];
  anchorDate: Date;
  onDaySelect?: (date: string) => void;
}) {
  const start = startOfWeek(anchorDate);
  const days = Array.from(
    { length: 7 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
  );

  const itemsByDate = new Map<string, LiturgyCalendarItem>();
  for (const item of items) {
    itemsByDate.set(item.startDate, item);
  }

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-px bg-gray-200">
        {days.map((d, idx) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const item = itemsByDate.get(dateStr);
          const isTodayCell = isToday(d);

          return (
            <div
              key={idx}
              className={`min-h-[140px] p-3 bg-white ${
                isTodayCell ? 'bg-syro-red/5 ring-1 ring-syro-red/20' : ''
              }`}
            >
              <div className="mb-2">
                <div className={`text-xs font-bold ${isTodayCell ? 'text-syro-red' : 'text-[#798daf]'}`}>
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isTodayCell
                      ? 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-syro-red text-white'
                      : 'text-syro-blue'
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>

              {item ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onDaySelect?.(dateStr)}
                    className="w-full text-left text-xs font-medium text-syro-blue hover:text-syro-red transition-colors line-clamp-2"
                    title={item.title}
                  >
                    {item.title}
                  </button>
                  {item.season && (
                    <p className="text-[10px] text-[#798daf] line-clamp-2">{item.season}</p>
                  )}
                  {item.readings.length > 0 && (
                    <LiturgyReadingsList readings={item.readings.slice(0, 2)} compact />
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No liturgy data</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
