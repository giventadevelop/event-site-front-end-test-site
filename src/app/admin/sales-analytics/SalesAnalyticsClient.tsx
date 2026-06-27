"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangeSelector, { type DateRange } from '@/components/admin/DateRangeSelector';
import EventSearchSelector from '@/components/admin/EventSearchSelector';
import { fetchSalesDataServer, calculateSalesMetricsServer, triggerStripeFeesTaxUpdateServer, fetchEventDetailsForPaymentFlow, type SalesMetrics, type StripeFeesTaxUpdateRequest, type StripeFeesTaxUpdateResponse } from './ApiServerActions';
import type { EventTicketTransactionDTO, EventDetailsDTO } from '@/types';
import { FaDollarSign, FaChartLine, FaSpinner, FaDownload, FaSearch, FaPercent, FaMoneyBillWave, FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface SalesAnalyticsClientProps {
  initialEventId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialMetrics?: SalesMetrics | null;
  initialError?: string | null;
}

export default function SalesAnalyticsClient({
  initialEventId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialMetrics = null,
  initialError = null,
}: SalesAnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get eventId from URL query params (source of truth)
  const urlEventId = searchParams.get('eventId') || '';
  const urlStartDate = searchParams.get('startDate') || '';
  const urlEndDate = searchParams.get('endDate') || '';
  
  const [eventId, setEventId] = useState(initialEventId || urlEventId);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || urlStartDate || null,
    endDate: initialEndDate || urlEndDate || null,
  });
  const [metrics, setMetrics] = useState<SalesMetrics | null>(initialMetrics);
  const [salesData, setSalesData] = useState<EventTicketTransactionDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [salesDataLoading, setSalesDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Event Details State (for payment flow detection)
  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | null>(null);
  const [eventDetailsLoading, setEventDetailsLoading] = useState(false);

  // Batch Job State
  const [batchJobLoading, setBatchJobLoading] = useState(false);
  const [batchJobSuccess, setBatchJobSuccess] = useState(false);
  const [batchJobError, setBatchJobError] = useState<string | null>(null);
  const [batchJobResponse, setBatchJobResponse] = useState<StripeFeesTaxUpdateResponse | null>(null);
  const [showBatchJobSection, setShowBatchJobSection] = useState(false);
  const [batchJobTenantId, setBatchJobTenantId] = useState<string>('');
  const [batchJobForceUpdate, setBatchJobForceUpdate] = useState(false);

  // Determine payment flow mode for batch job differentiation
  //
  // Payment Flow Modes:
  // - STRIPE_ONLY: All payments go through Stripe → Show Stripe batch job
  // - MANUAL_ONLY: All payments are manual (Zelle, Venmo, etc.) → Don't show Stripe batch job (no Stripe fees)
  // - HYBRID: Can use both Stripe and manual payments
  //   - If manualPaymentEnabled=true → Show message that Stripe batch job only applies to Stripe payments
  //   - If manualPaymentEnabled=false → Show Stripe batch job (effectively Stripe-only)
  //
  // Batch Job Logic:
  // - Stripe batch job (/api/cron/stripe-fees-tax-update) filters for stripe_payment_intent_id IS NOT NULL
  // - Manual payments don't have Stripe fees, so they don't need this batch job
  // - For hybrid events, the batch job will only process Stripe transactions (manual payments are filtered out)
  const isManualPaymentOnly = eventDetails?.paymentFlowMode === 'MANUAL_ONLY';
  const isHybridWithManual = eventDetails?.paymentFlowMode === 'HYBRID' && eventDetails?.manualPaymentEnabled === true;
  const isStripeOnly = eventDetails?.paymentFlowMode === 'STRIPE_ONLY';
  const isHybridStripeOnly = eventDetails?.paymentFlowMode === 'HYBRID' && !eventDetails?.manualPaymentEnabled;
  const shouldShowStripeBatchJob = isStripeOnly || isHybridStripeOnly;
  const shouldShowManualPaymentMessage = isManualPaymentOnly || isHybridWithManual;

  // Memoize date range strings to avoid unnecessary re-renders
  const startDateStr = useMemo(() => dateRange.startDate || '', [dateRange.startDate]);
  const endDateStr = useMemo(() => dateRange.endDate || '', [dateRange.endDate]);

  // Sync eventId with URL query params (when URL changes, update state)
  useEffect(() => {
    if (urlEventId !== eventId) {
      setEventId(urlEventId);
      // Update metrics from initialMetrics if URL has eventId (server-side fetch completed)
      if (urlEventId && initialMetrics) {
        setMetrics(initialMetrics);
        setError(initialError);
      } else if (!urlEventId) {
        // Clear data if eventId removed from URL
        setEventDetails(null);
        setMetrics(null);
        setSalesData([]);
        setTotalCount(0);
      }
    }
  }, [urlEventId, initialMetrics, initialError, eventId]);

  // Only fetch from client when date range or page changes (not when eventId changes via URL)
  // When eventId changes via URL, the server-side fetch in page.tsx handles it with maxDuration=120
  useEffect(() => {
    // Skip if no eventId
    if (!eventId) {
      return;
    }

    // Check if eventId changed via URL (not via state)
    const eventIdChangedViaUrl = urlEventId && urlEventId !== eventId;
    if (eventIdChangedViaUrl) {
      // EventId changed via URL - wait for server-side fetch, don't fetch from client
      console.log('[SalesAnalytics] EventId changed via URL, waiting for server-side fetch...');
      return;
    }

    // Only fetch from client if:
    // 1. Date range changed (different from URL params) - client-side filtering
    // 2. Page changed (pagination) - client-side pagination
    // 3. We have initialMetrics but date range is different - need to refetch with new dates
    const dateRangeChanged = startDateStr !== urlStartDate || endDateStr !== urlEndDate;
    const shouldFetchFromClient = dateRangeChanged || page > 0;

    if (shouldFetchFromClient) {
      // Client-side fetch for date/page changes
      loadMetrics();
      loadSalesData();
      loadEventDetails();
    } else if (initialMetrics) {
      // Use server-side fetched data (from page.tsx with maxDuration=120)
      setMetrics(initialMetrics);
      setError(initialError);
      // Still need to load sales data and event details (not provided by server)
      loadSalesData();
      loadEventDetails();
    } else if (urlEventId && !initialMetrics && !initialError) {
      // URL has eventId but no initial data yet - server-side fetch in progress
      // Don't fetch from client, wait for server-side fetch to complete
      // This prevents duplicate fetches and timeout issues
      console.log('[SalesAnalytics] URL has eventId but server-side fetch in progress, waiting...');
    }
    // Cleanup function to prevent race conditions
    return () => {
      // Cancel any pending operations if component unmounts
    };
  }, [startDateStr, endDateStr, page, urlEventId, urlStartDate, urlEndDate, initialMetrics, initialError, eventId]); // Removed eventId from main dependencies

  const loadEventDetails = async () => {
    if (!eventId) return;
    setEventDetailsLoading(true);
    try {
      const eventIdNum = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
      if (!isNaN(eventIdNum)) {
        const details = await fetchEventDetailsForPaymentFlow(eventIdNum);
        setEventDetails(details);
      }
    } catch (err: any) {
      console.error('[SalesAnalyticsClient] Error loading event details:', err);
      setEventDetails(null);
    } finally {
      setEventDetailsLoading(false);
    }
  };

  const loadMetrics = async () => {
    if (!eventId) return;
    setMetricsLoading(true);
    setError(null);
    
    // Timeout protection (120 seconds to match server-side maxDuration)
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timed out. Please try again.'));
      }, 120000); // Increased to 120 seconds to match server-side timeout
    });

    try {
      const data = await Promise.race([
        calculateSalesMetricsServer(
          eventId,
          dateRange.startDate || undefined,
          dateRange.endDate || undefined
        ),
        timeoutPromise
      ]);
      
      if (timeoutId) clearTimeout(timeoutId);
      setMetrics(data);
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('[SalesAnalyticsClient] Error loading metrics:', err);
      setError(err.message || 'Failed to load sales metrics');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setMetricsLoading(false);
    }
  };

  const loadSalesData = async () => {
    if (!eventId) return;
    setSalesDataLoading(true);
    setError(null);
    
    // Timeout protection (120 seconds to match server-side maxDuration)
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timed out. Please try again.'));
      }, 120000); // Increased to 120 seconds to match server-side timeout
    });

    try {
      // Fetch all transactions (no status filter) to include PENDING manual payments
      const result = await Promise.race([
        fetchSalesDataServer({
          eventId,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
          status: undefined, // Don't filter by status - include COMPLETED and PENDING manual payments
          page,
          pageSize,
          sort: 'purchaseDate,desc',
        }),
        timeoutPromise
      ]);

      // Filter to include COMPLETED transactions and PENDING manual payments
      //
      // STRIPE PAYMENT FLOW (preserved existing logic):
      // - Includes: All COMPLETED transactions (Stripe payments are always COMPLETED immediately)
      // - Stripe payments never have PENDING status, so they're caught by the COMPLETED check
      //
      // MANUAL PAYMENT FLOW (new support):
      // - Includes: PENDING transactions without Stripe fields (pending requests)
      // - Also includes: COMPLETED transactions (after admin confirmation)
      // - Manual payments are identified by transactionReference prefix:
      //   1. transaction_reference starting with "MANUAL-" (e.g., "MANUAL-7451"), OR
      //   2. transaction_reference starting with "TKTN" (e.g., "TKTN7508")
      //   (Stripe payments have different transactionReference formats or numeric IDs)
      //
      // This ensures:
      // 1. Existing Stripe payment analytics continue to work unchanged
      // 2. Manual payment transactions are included in analytics
      // 3. No breaking changes to existing functionality
      const filteredTransactions = result.transactions.filter(t => {
        // Include COMPLETED transactions (all payment types: Stripe + confirmed Manual payments)
        if (t.status === 'COMPLETED') return true;
        
        // Include PENDING transactions that are manual payments only
        // Stripe payments never have PENDING status (they're COMPLETED immediately)
        // Manual payments are identified by transactionReference prefix (MANUAL- or TKTN)
        const isManualPayment =
          t.transactionReference?.startsWith('MANUAL-') ||
          t.transactionReference?.startsWith('TKTN');

        if (t.status === 'PENDING' && isManualPayment) {
          return true;
        }
        return false;
      });

      if (timeoutId) clearTimeout(timeoutId);
      setSalesData(filteredTransactions);
      // Update total count to reflect filtered results
      setTotalCount(filteredTransactions.length);
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('[SalesAnalyticsClient] Error loading sales data:', err);
      setError(err.message || 'Failed to load sales data');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setSalesDataLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    if (range.startDate) {
      params.set('startDate', range.startDate);
    } else {
      params.delete('startDate');
    }
    if (range.endDate) {
      params.set('endDate', range.endDate);
    } else {
      params.delete('endDate');
    }
    router.push(`/admin/sales-analytics?${params.toString()}`);
  };

  const handleEventSelect = (selectedEventId: string) => {
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedEventId) {
      params.set('eventId', selectedEventId);
    } else {
      params.delete('eventId');
    }
    // Update URL - this will trigger server-side fetch via page.tsx with maxDuration=120
    // The server-side fetch will populate initialMetrics, which we'll use in the component
    router.push(`/admin/sales-analytics?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (!salesData.length) return;

    const headers = [
      'Transaction ID',
      'Name',
      'Email',
      'Quantity',
      'Gross Amount',
      'Discount',
      'Tax',
      'Platform Fee',
      'Final Amount',
      'Purchase Date',
      'Payment Method',
      'Status',
    ];
    const rows = salesData.map(t => [
      t.id?.toString() || '',
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.email || '',
      t.quantity?.toString() || '0',
      (t.totalAmount || 0).toFixed(2),
      (t.discountAmount || 0).toFixed(2),
      (t.taxAmount || 0).toFixed(2),
      (t.platformFeeAmount || 0).toFixed(2),
      (t.finalAmount || 0).toFixed(2),
      t.purchaseDate ? new Date(t.purchaseDate).toLocaleString() : '',
      t.paymentMethod || '',
      t.status || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!salesData.length) return;

    // Use xlsx library (already installed)
    const XLSX = await import('xlsx');
    const headers = [
      'Transaction ID',
      'Name',
      'Email',
      'Quantity',
      'Gross Amount',
      'Discount',
      'Tax',
      'Platform Fee',
      'Final Amount',
      'Purchase Date',
      'Payment Method',
      'Status',
    ];
    const rows = salesData.map(t => [
      t.id?.toString() || '',
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.email || '',
      t.quantity || 0,
      t.totalAmount || 0,
      t.discountAmount || 0,
      t.taxAmount || 0,
      t.platformFeeAmount || 0,
      t.finalAmount || 0,
      t.purchaseDate ? new Date(t.purchaseDate).toISOString() : '',
      t.paymentMethod || '',
      t.status || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    XLSX.writeFile(workbook, `sales-report-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleTriggerBatchJob = async () => {
    // Prevent calling Stripe batch job for manual-only payment events
    if (isManualPaymentOnly) {
      setBatchJobError('This batch job is only applicable to Stripe payments. Manual payment events do not require Stripe fee updates.');
      return;
    }

    setBatchJobLoading(true);
    setBatchJobError(null);
    setBatchJobSuccess(false);
    setBatchJobResponse(null);

    try {
      // Prepare request payload
      const request: StripeFeesTaxUpdateRequest = {};

      // Use tenant ID if provided, otherwise let backend process all tenants
      if (batchJobTenantId.trim()) {
        request.tenantId = batchJobTenantId.trim();
      } else {
        // If not provided, use current tenant from environment (optional - backend will process all if not provided)
        const currentTenantId = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_TENANT_ID : undefined;
        if (currentTenantId) {
          request.tenantId = currentTenantId;
        }
      }

      // Use date range from current filter if available
      if (dateRange.startDate) {
        // Convert to ISO 8601 format with milliseconds and timezone
        const startDate = new Date(dateRange.startDate);
        request.startDate = startDate.toISOString();
      }

      if (dateRange.endDate) {
        // Convert to ISO 8601 format, set to end of day
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        request.endDate = endDate.toISOString();
      }

      // Force update flag
      if (batchJobForceUpdate) {
        request.forceUpdate = true;
      }

      // Include eventId if available (from current event context)
      if (eventId) {
        const eventIdNum = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
        if (!isNaN(eventIdNum)) {
          request.eventId = eventIdNum;
        }
      }

      // Validate date range if both dates are provided
      if (request.startDate && request.endDate) {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        if (start > end) {
          setBatchJobError('Start date must be before or equal to end date');
          setBatchJobLoading(false);
          return;
        }
      }

      // Trigger batch job
      const response = await triggerStripeFeesTaxUpdateServer(request);

      setBatchJobResponse(response);
      setBatchJobSuccess(true);

      // Reload metrics after successful batch job trigger (optional - can be removed if not needed)
      // The batch job runs asynchronously, so metrics won't update immediately
      // setTimeout(() => {
      //   if (eventId) {
      //     loadMetrics();
      //   }
      // }, 5000); // Wait 5 seconds before reloading (optional)
    } catch (err: any) {
      console.error('[SalesAnalyticsClient] Batch job error:', err);
      setBatchJobError(err.message || 'Failed to trigger batch job. Please try again.');
    } finally {
      setBatchJobLoading(false);
    }
  };

  const filteredSalesData = searchQuery
    ? salesData.filter(t => {
      const searchLower = searchQuery.toLowerCase();
      return (
        t.email?.toLowerCase().includes(searchLower) ||
        t.firstName?.toLowerCase().includes(searchLower) ||
        t.lastName?.toLowerCase().includes(searchLower) ||
        t.id?.toString().includes(searchQuery)
      );
    })
    : salesData;

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Event Search Selector */}
      <EventSearchSelector
        onEventSelect={handleEventSelect}
        selectedEventId={eventId}
      />

      {/* Date Range Selector */}
      {eventId && (
        <DateRangeSelector
          onRangeChange={handleDateRangeChange}
          defaultRange={dateRange}
        />
      )}

      {/* Batch Job Trigger Section - Only show for Stripe payments */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {shouldShowStripeBatchJob ? 'Stripe Fees and Tax Update Batch Job' : 'Batch Job Options'}
            </h3>
            {shouldShowStripeBatchJob && (
              <button
                onClick={() => setShowBatchJobSection(!showBatchJobSection)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                type="button"
              >
                <FaSync className="w-4 h-4" />
                {showBatchJobSection ? 'Hide' : 'Show'} Batch Job Options
              </button>
            )}
          </div>

          {/* Manual Payment Message */}
          {shouldShowManualPaymentMessage && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-semibold mb-2">Manual Payment Event Detected</p>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>
                      This event is configured for <strong>{isManualPaymentOnly ? 'manual payments only' : 'hybrid payments (Stripe + Manual)'}</strong>.
                    </p>
                    <p>
                      The Stripe Fees and Tax Update batch job is <strong>only applicable to Stripe payments</strong>.
                      Manual payments (Zelle, Venmo, Cash App, etc.) do not have Stripe fees and do not require this batch job.
                    </p>
                    {isHybridWithManual && (
                      <p className="mt-2 text-xs">
                        <strong>Note:</strong> If this event has Stripe payments, you can still trigger the batch job to update Stripe fee data for those transactions.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Batch Job Section - Only show if applicable */}
          {shouldShowStripeBatchJob && showBatchJobSection && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This batch job retrieves missing Stripe fee and tax data from Stripe's API and updates transaction records.
                  The job runs asynchronously in the background and will return a job ID when started.
                </p>
              </div>

              {/* Tenant ID Input */}
              <div>
                <label htmlFor="batchJobTenantId" className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant ID (optional - leave empty to process all tenants)
                </label>
                <input
                  type="text"
                  id="batchJobTenantId"
                  value={batchJobTenantId}
                  onChange={(e) => setBatchJobTenantId(e.target.value)}
                  placeholder={typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TENANT_ID
                    ? `Current: ${process.env.NEXT_PUBLIC_TENANT_ID}`
                    : 'Leave empty to process all tenants'}
                  className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {dateRange.startDate && dateRange.endDate
                    ? `Date range from current filter will be applied: ${dateRange.startDate} to ${dateRange.endDate}`
                    : 'No date range filter will be applied (processes all dates)'}
                </p>
              </div>

              {/* Force Update Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="batchJobForceUpdate"
                  checked={batchJobForceUpdate}
                  onChange={(e) => setBatchJobForceUpdate(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="batchJobForceUpdate" className="text-sm font-medium text-gray-700">
                  Force update (reprocess transactions that already have Stripe fee data)
                </label>
              </div>

              {/* Batch Job Status Messages */}
              {batchJobSuccess && batchJobResponse && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-800 font-semibold mb-2">Batch job started successfully!</p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p><strong>Job ID:</strong> {batchJobResponse.jobId}</p>
                        <p><strong>Status:</strong> {batchJobResponse.status}</p>
                        {batchJobResponse.estimatedRecords !== null && (
                          <p><strong>Estimated Records:</strong> {batchJobResponse.estimatedRecords}</p>
                        )}
                        {batchJobResponse.estimatedCompletionTime && (
                          <p><strong>Estimated Completion:</strong> {new Date(batchJobResponse.estimatedCompletionTime).toLocaleString()}</p>
                        )}
                        <p className="mt-2 text-xs">{batchJobResponse.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {batchJobError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-800 font-semibold mb-1">Error</p>
                      <p className="text-sm text-red-700">{batchJobError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={handleTriggerBatchJob}
                disabled={batchJobLoading}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6"
                title="Trigger Stripe Fees and Tax Update Batch Job"
                aria-label="Trigger Stripe Fees and Tax Update Batch Job"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  {batchJobLoading ? (
                    <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <FaSync className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <span className="font-semibold text-blue-700">
                  {batchJobLoading ? 'Starting Batch Job...' : 'Trigger Batch Job'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {metricsLoading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading sales analytics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && !metricsLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ${metrics.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <FaDollarSign className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Gross Revenue */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Gross Revenue</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    ${metrics.grossRevenue.toFixed(2)}
                  </p>
                </div>
                <FaMoneyBillWave className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            {/* Net Revenue */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Net Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    ${metrics.netRevenue.toFixed(2)}
                  </p>
                </div>
                <FaChartLine className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            {/* Average Ticket Price */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium">Avg Ticket Price</p>
                  <p className="text-3xl font-bold text-teal-900 mt-2">
                    ${metrics.averageTicketPrice.toFixed(2)}
                  </p>
                </div>
                <FaDollarSign className="w-10 h-10 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <p className="text-orange-600 text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{metrics.totalTransactions}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-600 text-sm font-medium">Total Discounts</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">${metrics.totalDiscounts.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-medium">Total Refunds</p>
              <p className="text-2xl font-bold text-red-900 mt-1">${metrics.totalRefunds.toFixed(2)}</p>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-600 text-sm font-medium">Platform Fees</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">${metrics.platformFees.toFixed(2)}</p>
            </div>
          </div>

          {/* Net Revenue Before Tax Metric Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-600 text-sm font-medium">Net Revenue Before Tax</p>
                  <p className="text-3xl font-bold text-cyan-900 mt-2">
                    ${metrics.netRevenueBeforeTax?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-cyan-600 mt-1">
                    After Stripe fees, before tax
                  </p>
                </div>
                <FaMoneyBillWave className="w-10 h-10 text-cyan-500" />
              </div>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          {/* Only show for manual payment flows or hybrid flows with manual payments */}
          {/* For Stripe-only flows, payment methods are not meaningfully differentiated (showing as pm_xxx IDs) */}
          {metrics.revenueByPaymentMethod.length > 0 && !isStripeOnly && !isHybridStripeOnly && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.revenueByPaymentMethod.map((item, idx) => {
                  // Helper function to get payment method colors and icon
                  const getPaymentMethodStyle = (method: string) => {
                    const methodLower = method.toLowerCase();

                    // Zelle - Purple/Blue
                    if (methodLower.includes('zelle')) {
                      return {
                        bg: 'bg-purple-50',
                        border: 'border-purple-200',
                        text: 'text-purple-900',
                        label: 'text-purple-600',
                        iconBg: 'bg-purple-100',
                        icon: (
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.5 2C8.8 2 5 5.8 5 10.5c0 2.2.9 4.2 2.3 5.7L2 22l5.8-5.3c1.5 1.4 3.5 2.3 5.7 2.3 4.7 0 8.5-3.8 8.5-8.5S18.2 2 13.5 2zm0 15c-3.6 0-6.5-2.9-6.5-6.5S9.9 4 13.5 4 20 6.9 20 10.5 17.1 17 13.5 17z" />
                            <circle cx="10.5" cy="10.5" r="1.5" />
                            <circle cx="13.5" cy="10.5" r="1.5" />
                            <circle cx="16.5" cy="10.5" r="1.5" />
                          </svg>
                        ),
                      };
                    }

                    // Venmo - Blue
                    if (methodLower.includes('venmo')) {
                      return {
                        bg: 'bg-blue-50',
                        border: 'border-blue-200',
                        text: 'text-blue-900',
                        label: 'text-blue-600',
                        iconBg: 'bg-blue-100',
                        icon: (
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" />
                            <path d="M9 7h6v2H9zm0 3h6v2H9zm0 3h4v2H9z" />
                          </svg>
                        ),
                      };
                    }

                    // Cash App - Green
                    if (methodLower.includes('cash app')) {
                      return {
                        bg: 'bg-green-50',
                        border: 'border-green-200',
                        text: 'text-green-900',
                        label: 'text-green-600',
                        iconBg: 'bg-green-100',
                        icon: (
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.59 3.59c-.38-.38-.9-.59-1.41-.59H20V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2H9V1c0-.55-.45-1-1-1S7 .45 7 1v2H5V1c0-.55-.45-1-1-1S3 .45 3 1v2H1.82c-.51 0-1.02.21-1.41.59C.21 3.98 0 4.49 0 5v14c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V5c0-.51-.21-1.02-.41-1.41zM22 19H2V8h20v11z" />
                            <path d="M12 10.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
                          </svg>
                        ),
                      };
                    }

                    // PayPal - Blue
                    if (methodLower.includes('paypal')) {
                      return {
                        bg: 'bg-blue-50',
                        border: 'border-blue-300',
                        text: 'text-blue-900',
                        label: 'text-blue-700',
                        iconBg: 'bg-blue-100',
                        icon: (
                          <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.185zm.092-7.35l.868-5.565c.05-.32.33-.553.65-.553h3.88c3.135 0 5.586-1.677 6.48-4.818.007-.031.013-.062.02-.095.48-2.29.242-3.545-.64-4.21-.885-.664-2.366-1.01-4.287-1.01H6.6L5.098 13.987z" />
                          </svg>
                        ),
                      };
                    }

                    // Apple Pay - Black/Gray
                    if (methodLower.includes('apple pay')) {
                      return {
                        bg: 'bg-gray-50',
                        border: 'border-gray-300',
                        text: 'text-gray-900',
                        label: 'text-gray-700',
                        iconBg: 'bg-gray-100',
                        icon: (
                          <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                          </svg>
                        ),
                      };
                    }

                    // Google Pay - Multi-color
                    if (methodLower.includes('google pay')) {
                      return {
                        bg: 'bg-blue-50',
                        border: 'border-blue-200',
                        text: 'text-blue-900',
                        label: 'text-blue-600',
                        iconBg: 'bg-blue-100',
                        icon: (
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.983 14.988l1.407-5.136L1.406 8.05 17.903 0l1.41 5.136-3.653 1.314-1.407 5.136-1.407-5.136L9.42 6.45l1.406 5.136-5.843 2.103L3.983 14.988zm.822-5.245l2.849-1.025 1.406-5.136 2.85-1.024L7.06 7.718l-2.255.81zm12.992 9.132c-1.268 0-2.297-1.03-2.297-2.297s1.03-2.297 2.297-2.297 2.297 1.03 2.297 2.297-1.03 2.297-2.297 2.297zm-8.182 0c-1.268 0-2.297-1.03-2.297-2.297s1.03-2.297 2.297-2.297 2.297 1.03 2.297 2.297-1.03 2.297-2.297 2.297z" />
                          </svg>
                        ),
                      };
                    }

                    // Cash - Green
                    if (methodLower.includes('cash') && !methodLower.includes('cash app')) {
                      return {
                        bg: 'bg-green-50',
                        border: 'border-green-200',
                        text: 'text-green-900',
                        label: 'text-green-600',
                        iconBg: 'bg-green-100',
                        icon: (
                          <FaMoneyBillWave className="w-8 h-8 text-green-600" />
                        ),
                      };
                    }

                    // Check - Orange
                    if (methodLower.includes('check')) {
                      return {
                        bg: 'bg-orange-50',
                        border: 'border-orange-200',
                        text: 'text-orange-900',
                        label: 'text-orange-600',
                        iconBg: 'bg-orange-100',
                        icon: (
                          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ),
                      };
                    }

                    // Wire Transfer - Indigo
                    if (methodLower.includes('wire')) {
                      return {
                        bg: 'bg-indigo-50',
                        border: 'border-indigo-200',
                        text: 'text-indigo-900',
                        label: 'text-indigo-600',
                        iconBg: 'bg-indigo-100',
                        icon: (
                          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        ),
                      };
                    }

                    // ACH - Teal
                    if (methodLower.includes('ach')) {
                      return {
                        bg: 'bg-teal-50',
                        border: 'border-teal-200',
                        text: 'text-teal-900',
                        label: 'text-teal-600',
                        iconBg: 'bg-teal-100',
                        icon: (
                          <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        ),
                      };
                    }

                    // Stripe payment methods - Blue
                    if (methodLower.includes('card') || methodLower.includes('stripe') || methodLower.includes('visa') || methodLower.includes('mastercard') || methodLower.includes('amex') || methodLower.includes('discover')) {
                      return {
                        bg: 'bg-blue-50',
                        border: 'border-blue-300',
                        text: 'text-blue-900',
                        label: 'text-blue-700',
                        iconBg: 'bg-blue-100',
                        icon: (
                          <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        ),
                      };
                    }

                    // Default - Gray
                    return {
                      bg: 'bg-gray-50',
                      border: 'border-gray-200',
                      text: 'text-gray-900',
                      label: 'text-gray-600',
                      iconBg: 'bg-gray-100',
                      icon: (
                        <FaDollarSign className="w-8 h-8 text-gray-600" />
                      ),
                    };
                  };

                  const style = getPaymentMethodStyle(item.method);

                  return (
                    <div key={idx} className={`${style.bg} ${style.border} border-2 rounded-lg p-4 flex items-start gap-4 transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                      {/* Icon */}
                      <div className={`${style.iconBg} rounded-lg p-2 flex-shrink-0`}>
                        {style.icon}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${style.label} font-semibold mb-1 truncate`}>{item.method}</p>
                        <p className={`text-2xl font-bold ${style.text}`}>${item.revenue.toFixed(2)}</p>
                        <p className={`text-xs ${style.label} mt-1`}>{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Payment Status Breakdown */}
          {/* Only show for manual payment flows or hybrid flows with manual payments */}
          {/* Stripe-only flows don't have manual payments, so this section doesn't apply */}
          {metrics.manualPaymentStatusBreakdown && 
           metrics.manualPaymentStatusBreakdown.length > 0 && 
           !isStripeOnly && 
           !isHybridStripeOnly && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Payment Status Breakdown</h3>
              <p className="text-sm text-gray-600 mb-4">
                Breakdown of manual payment transactions (Zelle, Venmo, Cash, etc.) by status
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.manualPaymentStatusBreakdown.map((item, idx) => {
                  // Color coding based on status
                  const getStatusColor = (status: string) => {
                    const statusUpper = status.toUpperCase();
                    if (statusUpper === 'PENDING' || statusUpper === 'REQUESTED') {
                      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', label: 'text-yellow-600' };
                    } else if (statusUpper === 'RECEIVED' || statusUpper === 'CONFIRMED' || statusUpper === 'COMPLETED') {
                      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', label: 'text-green-600' };
                    } else if (statusUpper === 'CANCELLED' || statusUpper === 'VOIDED') {
                      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', label: 'text-red-600' };
                    } else if (statusUpper === 'REFUNDED') {
                      return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', label: 'text-orange-600' };
                    }
                    return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', label: 'text-gray-600' };
                  };
                  const colors = getStatusColor(item.status);
                  return (
                    <div key={idx} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4`}>
                      <p className={`text-sm ${colors.label} font-medium mb-1`}>{item.status}</p>
                      <p className={`text-2xl font-bold ${colors.text} mt-2`}>${item.revenue.toFixed(2)}</p>
                      <p className={`text-xs ${colors.label} mt-1`}>{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sales Trends by Day */}
          {metrics.salesByDay.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Day</h3>
              <div className="space-y-2">
                {metrics.salesByDay.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByDay.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Trends by Week */}
          {metrics.salesByWeek.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Week</h3>
              <div className="space-y-2">
                {metrics.salesByWeek.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      Week of {new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByWeek.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Trends by Month */}
          {metrics.salesByMonth.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Month</h3>
              <div className="space-y-2">
                {metrics.salesByMonth.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByMonth.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales by Hour */}
          {metrics.salesByHour.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Hour</h3>
              <div className="space-y-2">
                {metrics.salesByHour.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">{item.hour}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / Math.max(...metrics.salesByHour.map(i => i.count))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.count}</span>
                      </div>
                    </div>
                    <div className="w-24 text-sm text-gray-700 text-right">${item.revenue.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sales Data Table */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Transactions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              {/* Export Buttons */}
              {salesData.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    type="button"
                    title="Export to CSV"
                    aria-label="Export to CSV"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-green-700">CSV</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    type="button"
                    title="Export to Excel"
                    aria-label="Export to Excel"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-blue-700">Excel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          {filteredSalesData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Gross Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Final Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Purchase Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSalesData.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {`${transaction.firstName || ''} ${transaction.lastName || ''}`.trim() || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.email || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.quantity || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(transaction.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(transaction.discountAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${(transaction.finalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.purchaseDate
                            ? new Date(transaction.purchaseDate).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls - Always visible, matching admin page style */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || salesDataLoading}
                    className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    title="Previous Page"
                    aria-label="Previous Page"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  {/* Page Info */}
                  <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-blue-700">
                      Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{Math.max(1, totalPages)}</span>
                    </span>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || salesDataLoading}
                    className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    title="Next Page"
                    aria-label="Next Page"
                    type="button"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Item Count Text */}
                <div className="text-center mt-3">
                  {totalCount > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> transactions
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No transactions found</span>
                      <span className="text-sm text-orange-600">[No transactions match your criteria]</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {salesDataLoading ? 'Loading sales data...' : 'No sales data found for this event.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!eventId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm">
            Enter an Event ID above to view sales analytics and reports. You can filter by date range and export the data to CSV or Excel.
          </p>
        </div>
      )}
    </div>
  );
}
