import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAppUrl } from '@/lib/env';
import { safeAuth } from '@/lib/safe-auth';
import type { EventDetailsDTO, EventAttendeeDTO, EventAttendeeGuestDTO } from '@/types';
import EventDashboardClient from './EventDashboardClient';
import { fetchEventDashboardData } from './ApiServerActions';

interface DashboardPageProps {
  searchParams: {
    eventId?: string;
  };
}

function LoadingSkeleton() {
  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section Skeleton */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content Section Skeleton */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EventDashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await safeAuth();

  if (!userId) {
    notFound();
  }

  const eventId = searchParams.eventId ? parseInt(searchParams.eventId) : null;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EventDashboardContent eventId={eventId} />
    </Suspense>
  );
}

async function EventDashboardContent({ eventId }: { eventId: number | null }) {
  // Add timeout wrapper to prevent hanging
  const dashboardData = await Promise.race([
    fetchEventDashboardData(eventId),
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn('[EventDashboard] Data fetch timeout after 25 seconds');
        resolve(null);
      }, 25000)
    )
  ]);

  // If data fetch failed or timed out, show empty dashboard instead of 404
  if (!dashboardData) {
    // Return empty dashboard data structure instead of calling notFound()
    // This allows the page to render with empty state
    return <EventDashboardClient data={{
      eventDetails: null,
      totalAttendees: 0,
      totalGuests: 0,
      capacityUtilization: 0,
      registrationTrends: [],
      ageGroupStats: [],
      relationshipStats: [],
      specialRequirements: [],
      recentRegistrations: [],
      topEvents: [],
    }} />;
  }

  return <EventDashboardClient data={dashboardData} />;
}
