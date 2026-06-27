'use client';

import type { LiturgyCalendarItem, LiturgyLanguage } from '../types';
import { LiturgyReadingsList } from './LiturgyReadingsList';

export function LiturgyDayView({
  items,
  date,
  lng = 'en',
}: {
  items: LiturgyCalendarItem[];
  date: Date;
  lng?: LiturgyLanguage;
}) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dayItem = items.find((i) => i.startDate === dateStr);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-br from-syro-red/10 to-[#f0f4f8] px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-syro-red/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-syro-blue font-syro-display">
              {date.toLocaleDateString(undefined, { weekday: 'long' })}
            </h3>
            <p className="text-xs sm:text-sm text-[#798daf] font-syro-primary">
              {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6" lang={lng === 'ml' ? 'ml' : 'en'}>
        {!dayItem ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[#798daf] font-syro-primary">No liturgy readings for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-syro-blue font-syro-display">{dayItem.title}</h4>
              {dayItem.season && (
                <p className="text-sm text-[#798daf] mt-1 font-syro-primary">{dayItem.season}</p>
              )}
            </div>
            <LiturgyReadingsList readings={dayItem.readings} />
          </div>
        )}
      </div>
    </div>
  );
}
