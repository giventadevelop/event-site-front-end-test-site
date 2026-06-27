import { fetchEventsForMonthServer } from './ApiServerActions';
import CalendarClient from './CalendarClient';
import CalendarPageBackground from './CalendarPageBackground';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import pageStyles from './CalendarPage.module.css';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;

  const dateParam = typeof searchParams?.date === 'string' ? searchParams.date : undefined;
  if (dateParam) {
    try {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth() + 1;
      }
    } catch {
      // Invalid date, use today
    }
  }

  const focusGroup = typeof searchParams?.focusGroup === 'string' ? searchParams?.focusGroup : undefined;
  const initialView = typeof searchParams?.view === 'string' ? searchParams.view : 'month';
  const initialDate = dateParam ? new Date(dateParam) : today;
  const initialEvents = await fetchEventsForMonthServer(year, month, focusGroup);

  return (
    <>
      <CalendarPageBackground />
      <div
        className={`${pageStyles.calendarPage} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '120px', paddingBottom: '2rem' }}
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <HomeSectionTitle className="mb-4">Event Calendar</HomeSectionTitle>
            <p className={`${pageStyles.pageDescription} text-lg max-w-3xl mx-auto`}>
              Browse and explore upcoming events across all months
            </p>
          </div>

          <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8">
            <CalendarClient
              initialEvents={initialEvents}
              initialYear={year}
              initialMonth={month}
              focusGroup={focusGroup}
              initialView={initialView as 'month' | 'week' | 'day'}
              initialDate={initialDate}
              homepageDesign
            />
          </div>
        </div>
      </div>
    </>
  );
}
