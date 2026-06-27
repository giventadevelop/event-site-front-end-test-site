'use client';

import type { LiturgyCalendarItem } from '../types';
import { LiturgyReadingsList } from './LiturgyReadingsList';

export function LiturgyDayDetailPanel({
  item,
  onClose,
}: {
  item: LiturgyCalendarItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="liturgy-day-title"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h3 id="liturgy-day-title" className="text-lg font-semibold text-syro-blue font-syro-display">
              {item.title}
            </h3>
            {item.season && (
              <p className="text-sm text-[#798daf] mt-1 font-syro-primary">{item.season}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            title="Close"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <LiturgyReadingsList readings={item.readings} />
        </div>
      </div>
    </div>
  );
}
