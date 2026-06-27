"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangeSelector, { type DateRange } from '@/components/admin/DateRangeSelector';
import EventSearchSelector from '@/components/admin/EventSearchSelector';
import {
  fetchManualPaymentsServer,
  fetchManualPaymentSummaryServer,
  updateManualPaymentStatusServer,
  triggerManualPaymentSummaryBatchJobServer,
  type ManualPaymentListResponse,
  type ManualPaymentSummaryBatchJobRequest,
  type ManualPaymentSummaryBatchJobResponse,
} from './ApiServerActions';
import type { ManualPaymentRequestDTO, ManualPaymentSummaryReportDTO } from '@/types';
import { FaDollarSign, FaSpinner, FaSearch, FaCheckCircle, FaTimesCircle, FaBan, FaDownload, FaEye, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

interface ManualPaymentsClientProps {
  initialEventId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialPayments?: ManualPaymentListResponse | null;
  initialSummary?: ManualPaymentSummaryReportDTO[] | null;
  initialError?: string | null;
}

export default function ManualPaymentsClient({
  initialEventId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialPayments = null,
  initialSummary = null,
  initialError = null,
}: ManualPaymentsClientProps) {
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
  const [payments, setPayments] = useState<ManualPaymentListResponse | null>(initialPayments);
  const [summary, setSummary] = useState<ManualPaymentSummaryReportDTO[] | null>(initialSummary);
  // Don't show loading if we have initial data (even if empty array - means server already fetched)
  const [loading, setLoading] = useState(!initialPayments);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const isFetchingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const prevFiltersRef = useRef<string>('');
  const currentlyLoadingFilterKeyRef = useRef<string>('');

  // Batch Job State
  const [batchJobLoading, setBatchJobLoading] = useState(false);
  const [batchJobSuccess, setBatchJobSuccess] = useState(false);
  const [batchJobError, setBatchJobError] = useState<string | null>(null);
  const [batchJobResponse, setBatchJobResponse] = useState<ManualPaymentSummaryBatchJobResponse | null>(null);
  const [showBatchJobSection, setShowBatchJobSection] = useState(false);
  const [batchJobTenantId, setBatchJobTenantId] = useState<string>('');
  const [batchJobForceUpdate, setBatchJobForceUpdate] = useState(false);

  // Store latest values in refs to avoid dependency issues
  const eventIdRef = useRef(eventId);
  const statusFilterRef = useRef(statusFilter);
  const methodFilterRef = useRef(methodFilter);
  const pageRef = useRef(page);
  const dateRangeRef = useRef(dateRange);
  const startDateRef = useRef(dateRange.startDate);
  const endDateRef = useRef(dateRange.endDate);

  // Update refs when values change (use stringified date values to avoid object reference issues)
  useEffect(() => {
    eventIdRef.current = eventId;
    statusFilterRef.current = statusFilter;
    methodFilterRef.current = methodFilter;
    pageRef.current = page;
    dateRangeRef.current = dateRange;
    startDateRef.current = dateRange.startDate;
    endDateRef.current = dateRange.endDate;
  }, [eventId, statusFilter, methodFilter, page, dateRange.startDate, dateRange.endDate]);

  const loadPayments = useCallback(async (filterKey?: string) => {
    const currentEventId = eventIdRef.current;
    const currentStatusFilter = statusFilterRef.current;
    const currentMethodFilter = methodFilterRef.current;
    const currentPage = pageRef.current;

    if (!currentEventId) {
      setPayments(null);
      setLoading(false);
      isFetchingRef.current = false;
      currentlyLoadingFilterKeyRef.current = '';
      return;
    }

    // Create filter key if not provided
    const currentFilterKey = filterKey || `${currentEventId}-${currentStatusFilter}-${currentMethodFilter}-${currentPage}`;

    // Prevent loading the same filter key twice
    if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
      console.log('[ManualPayments] Already loading this filter key, skipping...', currentFilterKey);
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[ManualPayments] Already fetching, skipping...');
      return;
    }

    console.log('[ManualPayments] Loading payments for filterKey:', currentFilterKey);
    isFetchingRef.current = true;
    currentlyLoadingFilterKeyRef.current = currentFilterKey;
    setLoading(true);
    setError(null);

    // Track if response was received
    const responseReceivedRef = { current: false };

    // Safety timeout to ensure loading is cleared even if fetch hangs
    const timeoutId = setTimeout(() => {
      if (!responseReceivedRef.current) {
        console.warn('[ManualPayments] Load timeout - clearing loading state (response not received)');
        setLoading(false);
        isFetchingRef.current = false;
        if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
          currentlyLoadingFilterKeyRef.current = '';
        }
      } else {
        console.log('[ManualPayments] Timeout fired but response already received, ignoring');
      }
    }, 30000); // 30 second timeout

    try {
      console.log('[ManualPayments] Calling fetchManualPaymentsServer...');
      const data = await fetchManualPaymentsServer({
        eventId: currentEventId,
        status: currentStatusFilter || undefined,
        manualPaymentMethodType: currentMethodFilter || undefined,
        page: currentPage,
        pageSize,
        sort: 'createdAt,desc',
      });
      responseReceivedRef.current = true;
      console.log('[ManualPayments] Payments loaded:', {
        paymentsCount: data?.payments?.length || 0,
        totalCount: data?.totalCount || 0,
        dataStructure: data ? Object.keys(data) : 'null',
        firstPayment: data?.payments?.[0] ? { id: data.payments[0].id, eventId: data.payments[0].eventId, status: data.payments[0].status } : 'none'
      });

      // Only update state if we got valid data
      if (data && (data.payments || data.totalCount !== undefined)) {
        setPayments(data);
        console.log('[ManualPayments] State updated with payments:', data?.payments?.length || 0);
      } else {
        console.warn('[ManualPayments] Invalid data structure received:', data);
        setError('Invalid data structure received from server');
      }
    } catch (err: any) {
      responseReceivedRef.current = true;
      console.error('[ManualPayments] Error loading payments:', err);
      setError(err.message || 'Failed to load manual payments');
    } finally {
      // Clear timeout
      clearTimeout(timeoutId);
      // Always clear loading state and fetch flag
      setLoading(false);
      isFetchingRef.current = false;
      // Clear the filter key when done
      if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
        currentlyLoadingFilterKeyRef.current = '';
      }
    }
  }, [pageSize]);

  const loadSummary = useCallback(async () => {
    const currentEventId = eventIdRef.current;
    const currentDateRange = dateRangeRef.current;

    if (!currentEventId) return;
    try {
      const data = await fetchManualPaymentSummaryServer(
        currentEventId,
        currentDateRange.startDate || undefined,
        currentDateRange.endDate || undefined
      );
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  // Create stable date string values to avoid object reference issues
  const startDateStr = useMemo(() => dateRange.startDate || '', [dateRange.startDate]);
  const endDateStr = useMemo(() => dateRange.endDate || '', [dateRange.endDate]);

  // Sync eventId with URL query params (when URL changes, update state)
  useEffect(() => {
    if (urlEventId !== eventId) {
      setEventId(urlEventId);
      // Update data from initial props if URL has eventId (server-side fetch completed)
      if (urlEventId && initialPayments) {
        setPayments(initialPayments);
        setSummary(initialSummary);
        setError(initialError);
      } else if (!urlEventId) {
        // Clear data if eventId removed from URL
        setPayments(null);
        setSummary(null);
      }
    }
  }, [urlEventId, initialPayments, initialSummary, initialError, eventId]);

  // Track if we should skip the initial load (because we have server-side data)
  const skipInitialLoadRef = useRef(!!(initialPayments || initialSummary));

  useEffect(() => {
    // Prevent running if already fetching
    if (isFetchingRef.current) {
      console.log('[ManualPayments] useEffect: Already fetching, skipping...');
      return;
    }

    if (!eventId) {
      // Only clear if we don't have initial data to preserve
      if (!initialPayments) {
        setPayments(null);
        setSummary(null);
      }
      setLoading(false);
      skipInitialLoadRef.current = false;
      prevFiltersRef.current = '';
      isFetchingRef.current = false;
      return;
    }

    // Create a filter key to detect actual changes (use stable date strings)
    const filterKey = `${eventId}-${statusFilter}-${methodFilter}-${page}-${startDateStr}-${endDateStr}`;

    // On first mount: use initial data if available, otherwise load
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevFiltersRef.current = filterKey;

      // If initialPayments is not null, server already fetched (even if empty)
      // We should use it and not reload on mount
      if (initialPayments !== null) {
        // Server already fetched data, use it (even if empty)
        console.log('[ManualPayments] Using initial data from server', {
          paymentsCount: initialPayments?.payments?.length || 0,
          summaryCount: initialSummary?.length || 0,
          totalCount: initialPayments?.totalCount || 0
        });
        // Ensure loading is false since we have initial data
        setLoading(false);
        isFetchingRef.current = false;
        return;
      } else if (urlEventId && !initialPayments && !initialError) {
        // URL has eventId but no initial data yet - server-side fetch in progress
        // Don't fetch from client, wait for server-side fetch to complete
        // This prevents duplicate fetches and timeout issues
        console.log('[ManualPayments] URL has eventId but server-side fetch in progress, waiting...');
        return;
      } else {
        // No initial data from server, load it
        console.log('[ManualPayments] No initial data from server, loading...', {
          hasInitialPayments: !!initialPayments,
          hasInitialSummary: !!initialSummary
        });
        loadPayments(filterKey);
        loadSummary();
        return;
      }
    }

    // After mount: only reload if filters actually changed (not when eventId changes via URL)
    // When eventId changes via URL, the server-side fetch in page.tsx handles it with maxDuration=120
    const eventIdChangedViaUrl = urlEventId && urlEventId !== eventId;
    if (eventIdChangedViaUrl) {
      // EventId changed via URL - wait for server-side fetch, don't fetch from client
      console.log('[ManualPayments] EventId changed via URL, waiting for server-side fetch...');
      return;
    }

    if (prevFiltersRef.current !== filterKey) {
      console.log('[ManualPayments] Filters changed, reloading...', { old: prevFiltersRef.current, new: filterKey });
      prevFiltersRef.current = filterKey;
      // Only load if not already loading this filter key
      if (currentlyLoadingFilterKeyRef.current !== filterKey && !isFetchingRef.current) {
        loadPayments(filterKey);
        loadSummary();
      } else {
        console.log('[ManualPayments] Already loading this filter key, skipping...', filterKey);
      }
    } else {
      console.log('[ManualPayments] Filters unchanged, skipping reload. Current filterKey:', filterKey, 'Has payments:', !!payments, 'Payments count:', payments?.payments?.length || 0);
      // If filters unchanged but we don't have data, load it
      if (!payments && !isFetchingRef.current && currentlyLoadingFilterKeyRef.current !== filterKey) {
        console.log('[ManualPayments] Filters unchanged but no data, loading...');
        loadPayments(filterKey);
        loadSummary();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, methodFilter, page, startDateStr, endDateStr, urlEventId, initialPayments, initialSummary, initialError, eventId]); // Removed eventId from main trigger, added urlEventId

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
    router.push(`/admin/manual-payments?${params.toString()}`);
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
    // The server-side fetch will populate initialPayments/initialSummary, which we'll use in the component
    router.push(`/admin/manual-payments?${params.toString()}`);
  };

  const handleStatusUpdate = async (paymentId: number, newStatus: 'RECEIVED' | 'VOIDED' | 'CANCELLED', voidReason?: string) => {
    if (!confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(paymentId);
    try {
      await updateManualPaymentStatusServer(paymentId, newStatus, undefined, voidReason);
      // Reload payments after status update
      await loadPayments();
      await loadSummary();
    } catch (err: any) {
      alert(`Failed to update payment status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleTriggerBatchJob = async () => {
    setBatchJobLoading(true);
    setBatchJobError(null);
    setBatchJobSuccess(false);
    setBatchJobResponse(null);

    try {
      // Prepare request payload
      const request: ManualPaymentSummaryBatchJobRequest = {};

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
      const response = await triggerManualPaymentSummaryBatchJobServer(request);

      setBatchJobResponse(response);
      setBatchJobSuccess(true);

      // Reload summary after successful batch job trigger
      // The batch job runs asynchronously, so wait a bit before reloading
      setTimeout(() => {
        if (eventId) {
          console.log('[ManualPayments] Reloading summary after batch job trigger');
          loadSummary();
        }
      }, 3000); // Wait 3 seconds before reloading to allow batch job to start processing
    } catch (err: any) {
      console.error('[ManualPaymentsClient] Batch job error:', err);
      setBatchJobError(err.message || 'Failed to trigger batch job. Please try again.');
    } finally {
      setBatchJobLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'VOIDED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'REQUESTED':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getMethodDisplayName = (method: string) => {
    const methodMap: Record<string, string> = {
      ZELLE_MANUAL: 'Zelle',
      VENMO_MANUAL: 'Venmo',
      CASH_APP_MANUAL: 'Cash App',
      CASH: 'Cash',
      CHECK: 'Check',
      OTHER_MANUAL: 'Other',
    };
    return methodMap[method] || method;
  };

  const filteredPayments = searchQuery && payments
    ? payments.payments.filter(p => {
        const searchLower = searchQuery.toLowerCase();
        return (
          p.id?.toString().includes(searchQuery) ||
          p.paymentHandle?.toLowerCase().includes(searchLower) ||
          p.paymentInstructions?.toLowerCase().includes(searchLower)
        );
      })
    : payments?.payments || [];

  // Debug logging for render
  useEffect(() => {
    console.log('[ManualPayments] Render state:', {
      hasPayments: !!payments,
      paymentsCount: payments?.payments?.length || 0,
      totalCount: payments?.totalCount || 0,
      filteredCount: filteredPayments.length,
      loading,
      eventId,
      searchQuery
    });
  }, [payments, filteredPayments.length, loading, eventId, searchQuery]);

  const totalPages = payments ? Math.ceil(payments.totalCount / pageSize) : 0;
  const startItem = payments && payments.totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = payments ? Math.min((page + 1) * pageSize, payments.totalCount) : 0;

  // Calculate summary totals
  const summaryTotals = summary
    ? summary.reduce(
        (acc, item) => {
          if (item.status === 'RECEIVED') {
            acc.received += item.totalAmount;
            acc.receivedCount += item.requestCount;
          } else if (item.status === 'REQUESTED') {
            acc.requested += item.totalAmount;
            acc.requestedCount += item.requestCount;
          } else {
            acc.voided += item.totalAmount;
            acc.voidedCount += item.requestCount;
          }
          return acc;
        },
        { received: 0, requested: 0, voided: 0, receivedCount: 0, requestedCount: 0, voidedCount: 0 }
      )
    : { received: 0, requested: 0, voided: 0, receivedCount: 0, requestedCount: 0, voidedCount: 0 };

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

      {/* Batch Job Trigger Section - Always show when eventId is present */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Manual Payment Summary Batch Job
            </h3>
            <button
              onClick={() => setShowBatchJobSection(!showBatchJobSection)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
              type="button"
            >
              <FaSync className="w-4 h-4" />
              {showBatchJobSection ? 'Hide' : 'Show'} Batch Job Options
            </button>
          </div>

          {/* Info Message */}
          {!summary || summary.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-semibold mb-2">No Summary Records Found</p>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>
                      The manual payment summary report table is empty for this event. Trigger the batch job to aggregate manual payment data into the summary table for analytics and reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-800 font-semibold mb-2">Summary Records Available</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      Found {summary.length} summary record{summary.length !== 1 ? 's' : ''} for this event. You can trigger the batch job to update or regenerate the summary data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Batch Job Section */}
          {showBatchJobSection && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This batch job aggregates manual payment data from the <code className="bg-blue-100 px-1 rounded">manual_payment_request</code> table into the <code className="bg-blue-100 px-1 rounded">manual_payment_summary_report</code> table for analytics and reporting.
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
                  Force update (reprocess transactions that already have summary data)
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
                        {batchJobResponse.estimatedRecords !== null && batchJobResponse.estimatedRecords !== undefined && (
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
                title="Trigger Manual Payment Summary Batch Job"
                aria-label="Trigger Manual Payment Summary Batch Job"
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
      {loading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading manual payments...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Summary Cards and Breakdown - Show ALL records regardless of status */}
      {summary && summary.length > 0 && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Received */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Received</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ${summaryTotals.received.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">{summaryTotals.receivedCount} payments</p>
                </div>
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Requested */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">
                    ${summaryTotals.requested.toFixed(2)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">{summaryTotals.requestedCount} payments</p>
                </div>
                <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
            </div>

            {/* Voided/Cancelled */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Voided/Cancelled</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    ${summaryTotals.voided.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{summaryTotals.voidedCount} payments</p>
                </div>
                <FaBan className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Detailed Summary Breakdown Table - Shows ALL records regardless of status */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Payment Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-300">Total Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-300">Transaction Count</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Snapshot Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {getMethodDisplayName(item.manualPaymentMethodType)}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right border-b border-gray-200 font-semibold">
                        ${item.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right border-b border-gray-200">
                        {item.requestCount || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                        {item.snapshotDate ? new Date(item.snapshotDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900 border-t-2 border-gray-400">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t-2 border-gray-400">
                      ${summary.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t-2 border-gray-400">
                      {summary.reduce((sum, item) => sum + (item.requestCount || 0), 0)}
                    </td>
                    <td className="px-4 py-3 border-t-2 border-gray-400"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payments Table */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manual Payment Requests</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, handle, or instructions..."
                  className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="REQUESTED">Requested</option>
                <option value="RECEIVED">Received</option>
                <option value="VOIDED">Voided</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(0);
                }}
                className="border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              >
                <option value="">All Methods</option>
                <option value="ZELLE_MANUAL">Zelle</option>
                <option value="VENMO_MANUAL">Venmo</option>
                <option value="CASH_APP_MANUAL">Cash App</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="OTHER_MANUAL">Other</option>
              </select>
            </div>
          </div>

          {/* Debug Info - Remove after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
              <p>Debug: payments={payments ? 'exists' : 'null'}, payments.payments={payments?.payments?.length || 0}, totalCount={payments?.totalCount || 0}, filteredCount={filteredPayments.length}, loading={loading ? 'true' : 'false'}</p>
            </div>
          )}

          {/* Payments Table */}
          {filteredPayments.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Handle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {getMethodDisplayName(payment.manualPaymentMethodType)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(payment.amountDue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {payment.paymentHandle || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {/* View Details Link */}
                            <Link
                              href={`/admin/manual-payments/${payment.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                              View
                            </Link>

                            {/* Status Update Buttons */}
                            {payment.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(payment.id!, 'RECEIVED')}
                                  disabled={updatingStatus === payment.id}
                                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Mark as Received"
                                  type="button"
                                >
                                  {updatingStatus === payment.id ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Mark Received'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter cancellation reason (optional):');
                                    handleStatusUpdate(payment.id!, 'CANCELLED', reason || undefined);
                                  }}
                                  disabled={updatingStatus === payment.id}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Cancel Payment"
                                  type="button"
                                >
                                  {updatingStatus === payment.id ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Cancel'
                                  )}
                                </button>
                              </>
                            )}

                            {/* Proof of Payment Link */}
                            {payment.proofOfPaymentFileUrl && (
                              <a
                                href={payment.proofOfPaymentFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
                                title="View Proof of Payment"
                              >
                                <FaDownload className="w-4 h-4" />
                                Proof
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || loading}
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

                  <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-blue-700">
                      Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{Math.max(1, totalPages)}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || loading}
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

                <div className="text-center mt-3">
                  {payments && payments.totalCount > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{payments.totalCount}</span> payments
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No payments found</span>
                      <span className="text-sm text-orange-600">[No payments match your criteria]</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading payments...' : 'No manual payments found for this event.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!eventId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm">
            Enter an Event ID above to view manual payment requests and summaries. You can filter by date range, status, and payment method.
          </p>
        </div>
      )}
    </div>
  );
}
