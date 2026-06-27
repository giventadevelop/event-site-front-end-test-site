import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SyroPageBanner from '../components/SyroPageBanner';
import { fetchEventsForMonthServer } from '@/app/calendar/ApiServerActions';
import MoscRedesignEventCalendarClient from './MoscRedesignEventCalendarClient';

export const metadata: Metadata = {
  title: 'MOSC Calendar',
  description:
    'Browse upcoming church events and activities on the Malankara Orthodox Syrian Church event calendar.',
  keywords: ['MOSC Calendar', 'Event Calendar', 'Church Events', 'Malankara Orthodox'],
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoscCalendarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;

  const dateParam = typeof resolvedParams?.date === 'string' ? resolvedParams.date : undefined;
  if (dateParam) {
    try {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth() + 1;
      }
    } catch {
      // use today
    }
  }

  const focusGroup =
    typeof resolvedParams?.focusGroup === 'string' ? resolvedParams.focusGroup : undefined;
  const initialView =
    typeof resolvedParams?.view === 'string' ? resolvedParams.view : 'month';
  const initialDate = dateParam ? new Date(dateParam) : today;
  const initialEvents = await fetchEventsForMonthServer(year, month, focusGroup);

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="MOSC Calendar"
        breadcrumbFrom="mosc-calendar"
        description="Browse and explore upcoming events and activities across the church calendar."
      />

      <section className="py-10 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-4 sm:p-6 lg:p-8">
            <Suspense
              fallback={
                <div className="py-16 text-center text-syro-dark-gray font-syro-primary">
                  Loading calendar…
                </div>
              }
            >
              <MoscRedesignEventCalendarClient
                initialEvents={initialEvents}
                initialYear={year}
                initialMonth={month}
                focusGroup={focusGroup}
                initialView={initialView as 'month' | 'week' | 'day'}
                initialDate={initialDate}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
