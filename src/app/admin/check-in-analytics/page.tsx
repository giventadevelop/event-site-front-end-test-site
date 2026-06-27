import { Suspense } from 'react';
import CheckInAnalyticsClient from './CheckInAnalyticsClient';
import { fetchCheckInAnalyticsServer } from './ApiServerActions';

export default async function CheckInAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId || '';
  const startDate = sp.startDate || '';
  const endDate = sp.endDate || '';

  // Fetch analytics if eventId is provided
  let analytics = null;
  let error = null;
  if (eventId) {
    try {
      analytics = await fetchCheckInAnalyticsServer(eventId);
    } catch (err: any) {
      error = err.message || 'Failed to load analytics';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Check-In Analytics</h1>
        <Suspense fallback={<div className="text-center py-8">Loading analytics...</div>}>
          <CheckInAnalyticsClient
            initialEventId={eventId}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialAnalytics={analytics}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
