import { Suspense } from 'react';
import ManualPaymentsClient from './ManualPaymentsClient';
import { fetchManualPaymentsServer, fetchManualPaymentSummaryServer } from './ApiServerActions';

// Increase route timeout to 120 seconds for complex calculations
export const maxDuration = 120;

export default async function ManualPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId || '';
  const startDate = sp.startDate || '';
  const endDate = sp.endDate || '';

  // Fetch payments and summary if eventId is provided
  let payments = null;
  let summary = null;
  let error = null;
  if (eventId) {
    try {
      console.log('[ManualPaymentsPage SERVER] Fetching initial data for eventId:', eventId);
      const [paymentsResult, summaryResult] = await Promise.all([
        fetchManualPaymentsServer({ eventId, page: 0, pageSize: 20 }),
        fetchManualPaymentSummaryServer(eventId, startDate || undefined, endDate || undefined),
      ]);
      console.log('[ManualPaymentsPage SERVER] Initial data fetched:', {
        paymentsCount: paymentsResult?.payments?.length || 0,
        totalCount: paymentsResult?.totalCount || 0,
        summaryCount: Array.isArray(summaryResult) ? summaryResult.length : 0
      });
      payments = paymentsResult;
      summary = summaryResult;
    } catch (err: any) {
      console.error('[ManualPaymentsPage SERVER] Error fetching initial data:', err);
      error = err.message || 'Failed to load manual payments';
    }
  } else {
    console.log('[ManualPaymentsPage SERVER] No eventId provided, skipping initial fetch');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Manual Payments</h1>
        <Suspense fallback={<div className="text-center py-8">Loading manual payments...</div>}>
          <ManualPaymentsClient
            initialEventId={eventId}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialPayments={payments}
            initialSummary={summary}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
