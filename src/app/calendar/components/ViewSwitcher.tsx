"use client";
import type { CalendarView } from '../types/calendar.types';

export function ViewSwitcher({ view, onChange }: { view: CalendarView; onChange: (v: CalendarView) => void }) {
  const viewConfigs = [
    {
      value: 'month' as CalendarView,
      label: 'Month',
      color: 'blue',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      )
    },
    {
      value: 'week' as CalendarView,
      label: 'Week',
      color: 'green',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      )
    },
    {
      value: 'day' as CalendarView,
      label: 'Day',
      color: 'violet',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex">
        {viewConfigs.map((config) => {
          const isActive = view === config.value;
          const colorClasses = {
            blue: {
              active: 'bg-blue-100 text-blue-600 border-blue-500',
              inactive: 'bg-blue-50 text-blue-400 border-transparent hover:bg-blue-100 hover:text-blue-500',
              iconBgActive: 'bg-blue-100',
              iconBgInactive: 'bg-blue-50',
              iconTextActive: 'text-blue-500',
              iconTextInactive: 'text-blue-400',
              textActive: 'text-blue-700',
              textInactive: 'text-blue-500'
            },
            green: {
              active: 'bg-green-100 text-green-600 border-green-500',
              inactive: 'bg-green-50 text-green-400 border-transparent hover:bg-green-100 hover:text-green-500',
              iconBgActive: 'bg-green-100',
              iconBgInactive: 'bg-green-50',
              iconTextActive: 'text-green-500',
              iconTextInactive: 'text-green-400',
              textActive: 'text-green-700',
              textInactive: 'text-green-500'
            },
            violet: {
              active: 'bg-violet-100 text-violet-600 border-violet-500',
              inactive: 'bg-violet-50 text-violet-400 border-transparent hover:bg-violet-100 hover:text-violet-500',
              iconBgActive: 'bg-violet-100',
              iconBgInactive: 'bg-violet-50',
              iconTextActive: 'text-violet-500',
              iconTextInactive: 'text-violet-400',
              textActive: 'text-violet-700',
              textInactive: 'text-violet-500'
            }
          };

          const colors = colorClasses[config.color as keyof typeof colorClasses];

          return (
            <button
              key={config.value}
              onClick={() => onChange(config.value)}
              className={`py-3 px-3 sm:px-4 border-b-2 border-r border-r-gray-200 last:border-r-0 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3 rounded-t-lg transition-all duration-300 ${
                isActive ? colors.active : colors.inactive
              }`}
              title={config.label}
              aria-label={config.label}
              type="button"
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isActive ? colors.iconBgActive : colors.iconBgInactive
              }`}>
                <svg
                  className={`w-10 h-10 ${isActive ? colors.iconTextActive : colors.iconTextInactive}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  {config.icon}
                </svg>
              </div>
              <span className={isActive ? colors.textActive : colors.textInactive}>
                {config.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}


