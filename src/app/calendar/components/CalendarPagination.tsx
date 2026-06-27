"use client";

import pageStyles from '../CalendarPage.module.css';

export function CalendarPagination({
  totalCount,
  onPrevMonth,
  onNextMonth,
  view = 'month',
  theme = 'default',
  homepageDesign = false,
}: {
  totalCount: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  view?: 'month' | 'week' | 'day';
  theme?: 'default' | 'syro';
  homepageDesign?: boolean;
}) {
  const isSyro = theme === 'syro';
  const useHomepageStyles = homepageDesign && !isSyro;
  const page = 1;
  const totalPages = 1;
  const isPrevDisabled = false;
  const isNextDisabled = false;
  const startItem = totalCount > 0 ? 1 : 0;
  const endItem = totalCount;

  const buttonLabel = view === 'day' ? (view === 'day' ? 'Previous Day' : 'Previous') : 'Previous';
  const nextButtonLabel = view === 'day' ? 'Next Day' : 'Next';

  return (
    <div className="mt-8">
      {/* Item Count Text - Moved to top */}
      <div className="text-center mb-4">
        {totalCount > 0 ? (
          <div
            className={
              isSyro
                ? 'inline-flex items-center gap-2 px-4 py-2 bg-[#f0f4f8] border-2 border-gray-200 rounded-lg shadow-sm'
                : useHomepageStyles
                  ? `inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg shadow-sm ${pageStyles.paginationCount}`
                  : 'inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-sm'
            }
          >
            <svg
              className={`w-5 h-5 ${isSyro ? 'text-syro-red' : useHomepageStyles ? pageStyles.paginationCountAccent : 'text-indigo-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-sm ${isSyro ? 'text-syro-dark-gray font-syro-primary' : ''}`}>
              Showing{' '}
              <span
                className={`font-bold ${isSyro ? 'text-syro-blue' : useHomepageStyles ? pageStyles.paginationCountAccent : 'text-indigo-700'}`}
              >
                {totalCount}
              </span>{' '}
              {totalCount === 1 ? 'event' : 'events'}
            </span>
          </div>
        ) : (
          <div
            className={
              isSyro
                ? 'inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm'
                : useHomepageStyles
                  ? `inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg shadow-sm ${pageStyles.emptyEventsBadge}`
                  : 'inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm'
            }
          >
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className={`text-sm font-semibold ${isSyro ? 'text-orange-700 font-syro-primary' : useHomepageStyles ? '' : 'text-orange-700'}`}
            >
              No events found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


