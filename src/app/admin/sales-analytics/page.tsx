import { Suspense } from 'react';
import SalesAnalyticsClient from './SalesAnalyticsClient';
import { calculateSalesMetricsServer } from './ApiServerActions';

// Increase route timeout to 120 seconds for complex calculations
export const maxDuration = 120;

export default async function SalesAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId || '';
  const startDate = sp.startDate || '';
  const endDate = sp.endDate || '';

  // Fetch metrics if eventId is provided
  let metrics = null;
  let error = null;
  if (eventId) {
    try {
      metrics = await calculateSalesMetricsServer(eventId, startDate || undefined, endDate || undefined);
    } catch (err: any) {
      error = err.message || 'Failed to load sales metrics';
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Sales Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            View and analyze sales data for your events
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500">Loading sales analytics...</p>
            </div>
          </div>
        }>
          <SalesAnalyticsClient
            initialEventId={eventId}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialMetrics={metrics}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
