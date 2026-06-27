import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import type { EventAttendeeDTO, EventAttendeeGuestDTO, EventDetailsDTO } from '@/types';
import RegistrationManagementClient from './RegistrationManagementClient';
import { fetchRegistrationManagementData } from './ApiServerActions';

type SearchParamsShape = {
  eventId?: string;
  search?: string;
  searchType?: string;
  status?: string;
  page?: string;
};

interface RegistrationPageProps {
  searchParams: SearchParamsShape | Promise<SearchParamsShape>;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function RegistrationManagementPage({ searchParams }: RegistrationPageProps) {
  const params = typeof searchParams?.then === 'function' ? await searchParams : searchParams;

  const { userId } = await safeAuth();

  if (!userId) {
    notFound();
  }

  const eventId = params.eventId ? parseInt(params.eventId) : null;
  const search = params.search || '';
  const searchType = params.searchType || 'name';
  const status = params.status || '';
  const page = parseInt(params.page || '1');

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RegistrationManagementContent
        eventId={eventId}
        search={search}
        searchType={searchType}
        status={status}
        page={page}
      />
    </Suspense>
  );
}

async function RegistrationManagementContent({
  eventId,
  search,
  searchType,
  status,
  page
}: {
  eventId: number | null;
  search: string;
  searchType: string;
  status: string;
  page: number;
}) {
  // Add timeout wrapper to prevent hanging
  const data = await Promise.race([
    fetchRegistrationManagementData(eventId, search, searchType, status, page),
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn('[RegistrationManagement] Data fetch timeout after 25 seconds');
        resolve(null);
      }, 25000)
    )
  ]);

  // If data fetch failed or timed out, show empty state instead of 404
  if (!data) {
    // Return empty data structure instead of calling notFound()
    // This allows the page to render with empty state
    return <RegistrationManagementClient data={{
      attendees: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      events: [],
      selectedEvent: null,
      searchTerm: search,
      searchType: searchType,
      statusFilter: status,
    }} />;
  }

  return <RegistrationManagementClient data={data} />;
}
