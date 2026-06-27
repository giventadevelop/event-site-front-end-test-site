'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCalendarNav } from '@/app/calendar/hooks/useCalendarNav';
import { fetchLiturgyDaysForMonthServer } from './ApiServerActions';
import type { LiturgyCalendarItem, LiturgyCalendarView, LiturgyLanguage } from './types';
import { LiturgyViewSwitcher } from './components/LiturgyViewSwitcher';
import { LiturgyMonthView } from './components/LiturgyMonthView';
import { LiturgyWeekView } from './components/LiturgyWeekView';
import { LiturgyDayView } from './components/LiturgyDayView';

const BASE_PATH = '/mosc-redesign/liturgical-calendar';

export default function LiturgyCalendarClient({
  initialItems,
  initialYear,
  initialMonth,
  initialView = 'month',
  initialDate = new Date(),
  initialLng = 'en',
  configured,
}: {
  initialItems: LiturgyCalendarItem[];
  initialYear: number;
  initialMonth: number;
  initialView?: LiturgyCalendarView;
  initialDate?: Date;
  initialLng?: LiturgyLanguage;
  configured: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);

  const urlView = (searchParams.get('view') as LiturgyCalendarView | null) || initialView;
  const urlDateStr = searchParams.get('date');
  const urlLng = (searchParams.get('lng') as LiturgyLanguage | null) || initialLng;
  const lng: LiturgyLanguage = urlLng === 'ml' ? 'ml' : 'en';

  let currentDate = initialDate;
  if (urlDateStr) {
    const [year, month, day] = urlDateStr.split('-').map(Number);
    if (year && month && day) {
      currentDate = new Date(year, month - 1, day);
    }
  }
  if (isNaN(currentDate.getTime())) {
    currentDate = initialDate;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const nav = useCalendarNav(initialYear, initialMonth);

  useEffect(() => {
    if (urlView && urlView !== nav.view) {
      nav.setView(urlView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView, searchParams]);

  useEffect(() => {
    if (urlView === 'day' || urlView === 'week') {
      if (currentYear !== nav.year || currentMonth !== nav.month) {
        nav.setYear(currentYear);
        nav.setMonth(currentMonth);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, urlView, urlDateStr]);

  useEffect(() => {
    if (!configured) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchLiturgyDaysForMonthServer(nav.year, nav.month, lng);
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav.year, nav.month, lng, configured]);

  const buildUrl = (params: URLSearchParams) => `${BASE_PATH}?${params.toString()}`;

  const handleViewChange = (newView: LiturgyCalendarView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    if ((newView === 'day' || newView === 'week') && !params.has('date')) {
      const today = new Date();
      params.set(
        'date',
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      );
    }
    router.push(buildUrl(params));
  };

  const handleLngChange = (newLng: LiturgyLanguage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lng', newLng);
    router.push(buildUrl(params));
  };

  const handleDaySelect = (dateStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'day');
    params.set('date', dateStr);
    router.push(buildUrl(params));
  };

  const handlePrev = () => {
    if (nav.view === 'day') {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      router.push(`${BASE_PATH}?view=day&date=${dateStr}&lng=${lng}`);
    } else if (nav.view === 'week') {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 7);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      router.push(`${BASE_PATH}?view=week&date=${dateStr}&lng=${lng}`);
    } else {
      nav.prev();
    }
  };

  const handleNext = () => {
    if (nav.view === 'day') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      router.push(`${BASE_PATH}?view=day&date=${dateStr}&lng=${lng}`);
    } else if (nav.view === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      router.push(`${BASE_PATH}?view=week&date=${dateStr}&lng=${lng}`);
    } else {
      nav.next();
    }
  };

  const handleToday = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (nav.view === 'day') {
      router.push(`${BASE_PATH}?view=day&date=${dateStr}&lng=${lng}`);
    } else if (nav.view === 'week') {
      router.push(`${BASE_PATH}?view=week&date=${dateStr}&lng=${lng}`);
    } else {
      nav.today();
    }
  };

  const displayView = urlView || nav.view;

  if (!configured) {
    return (
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 text-center">
        <p className="text-sm font-medium text-orange-800 font-syro-primary">
          Liturgical calendar data is not configured. Ensure{' '}
          <code className="text-xs bg-orange-100 px-1 rounded">LITURGY_DATA_SOURCE=strapi</code>,{' '}
          <code className="text-xs bg-orange-100 px-1 rounded">NEXT_PUBLIC_STRAPI_URL</code>,{' '}
          <code className="text-xs bg-orange-100 px-1 rounded">STRAPI_API_TOKEN</code>, and{' '}
          <code className="text-xs bg-orange-100 px-1 rounded">NEXT_PUBLIC_TENANT_ID</code> are set,
          and liturgy days are published in Strapi for your tenant.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="text-lg sm:text-xl font-bold text-syro-blue font-syro-display">
          {displayView === 'day'
            ? currentDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : displayView === 'week'
              ? (() => {
                  const weekStart = new Date(currentDate);
                  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  return `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()
              : new Date(nav.year, nav.month - 1, 1).toLocaleString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => handleLngChange('en')}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                lng === 'en' ? 'bg-syro-red text-white' : 'bg-white text-[#798daf] hover:bg-gray-50'
              }`}
              title="English"
              aria-label="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLngChange('ml')}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                lng === 'ml' ? 'bg-syro-red text-white' : 'bg-white text-[#798daf] hover:bg-gray-50'
              }`}
              title="Malayalam"
              aria-label="Malayalam"
            >
              ML
            </button>
          </div>

          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-3 py-2 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-syro-blue rounded-lg shadow-sm transition-all duration-300 hover:scale-105"
            title="Previous"
            aria-label="Previous"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline font-semibold">Previous</span>
          </button>

          <button
            onClick={handleToday}
            className="flex items-center gap-2 px-3 py-2 bg-syro-red/10 hover:bg-syro-red/20 text-syro-red rounded-lg shadow-sm transition-all duration-300 hover:scale-105"
            title="Today"
            aria-label="Today"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline font-semibold">Today</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-3 py-2 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-syro-blue rounded-lg shadow-sm transition-all duration-300 hover:scale-105"
            title="Next"
            aria-label="Next"
            type="button"
          >
            <span className="hidden sm:inline font-semibold">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <LiturgyViewSwitcher view={displayView} onChange={handleViewChange} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-6 h-6 text-syro-red" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-[#798daf] font-medium font-syro-primary">Loading liturgy calendar...</span>
          </div>
        </div>
      ) : null}

      {!loading && (
        <div
          className={lng === 'ml' ? 'font-anek-malayalam' : undefined}
          lang={lng === 'ml' ? 'ml' : 'en'}
        >
          {displayView === 'month' && (
            <LiturgyMonthView
              items={items}
              year={nav.year}
              month={nav.month}
              onDaySelect={handleDaySelect}
            />
          )}
          {displayView === 'week' && (
            <LiturgyWeekView
              items={items}
              anchorDate={currentDate}
              onDaySelect={handleDaySelect}
            />
          )}
          {displayView === 'day' && <LiturgyDayView items={items} date={currentDate} lng={lng} />}
        </div>
      )}
    </div>
  );
}
