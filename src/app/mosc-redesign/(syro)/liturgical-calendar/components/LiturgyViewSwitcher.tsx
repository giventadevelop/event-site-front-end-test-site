'use client';

import type { LiturgyCalendarView } from '../types';

export function LiturgyViewSwitcher({
  view,
  onChange,
}: {
  view: LiturgyCalendarView;
  onChange: (v: LiturgyCalendarView) => void;
}) {
  const views: { value: LiturgyCalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex">
        {views.map((config) => {
          const isActive = view === config.value;
          return (
            <button
              key={config.value}
              onClick={() => onChange(config.value)}
              className={`py-3 px-4 sm:px-6 border-b-2 font-semibold text-sm sm:text-base transition-all duration-300 ${
                isActive
                  ? 'border-syro-red text-syro-red bg-syro-red/5'
                  : 'border-transparent text-[#798daf] hover:text-syro-blue hover:border-syro-blue/30'
              }`}
              title={config.label}
              aria-label={config.label}
              type="button"
            >
              {config.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
