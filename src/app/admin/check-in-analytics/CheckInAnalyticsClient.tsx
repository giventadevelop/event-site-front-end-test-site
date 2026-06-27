"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangeSelector, { DateRange } from '@/components/admin/DateRangeSelector';
import EventSearchSelector from '@/components/admin/EventSearchSelector';
import { fetchCheckInHistoryServer, fetchCheckInAnalyticsServer, type CheckInAnalytics } from './ApiServerActions';
import type { EventTicketTransactionDTO } from '@/types';
import { FaCheckCircle, FaUsers, FaChartLine, FaSpinner, FaDownload, FaSearch } from 'react-icons/fa';
import Link from 'next/link';

interface CheckInAnalyticsClientProps {
  initialEventId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialAnalytics?: CheckInAnalytics | null;
  initialError?: string | null;
}

export default function CheckInAnalyticsClient({
  initialEventId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialAnalytics = null,
  initialError = null,
}: CheckInAnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState(initialEventId);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null,
  });
  const [analytics, setAnalytics] = useState<CheckInAnalytics | null>(initialAnalytics);
  const [history, setHistory] = useState<EventTicketTransactionDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (eventId) {
      loadAnalytics();
      loadHistory();
    }
  }, [eventId, dateRange, page]);

  const loadAnalytics = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCheckInAnalyticsServer(eventId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCheckInHistoryServer({
        eventId,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        checkInStatus: 'CHECKED_IN',
        page,
        pageSize,
        sort: 'checkInTime,desc',
      });
      setHistory(result.transactions);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to load check-in history');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(0); // Reset to first page
    // Update URL params
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
    router.push(`/admin/check-in-analytics?${params.toString()}`);
  };

  const handleEventSelect = (selectedEventId: string) => {
    setEventId(selectedEventId);
    setPage(0);
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (selectedEventId) {
      params.set('eventId', selectedEventId);
    } else {
      params.delete('eventId');
    }
    router.push(`/admin/check-in-analytics?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (!history.length) return;

    const headers = ['Transaction ID', 'Name', 'Email', 'Quantity', 'Check-In Time', 'Guests Checked In'];
    const rows = history.map(t => [
      t.id?.toString() || '',
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.email || '',
      t.quantity?.toString() || '0',
      t.checkInTime ? new Date(t.checkInTime).toLocaleString() : '',
      t.numberOfGuestsCheckedIn?.toString() || '0',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `check-in-history-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = searchQuery
    ? history.filter(t => {
        const searchLower = searchQuery.toLowerCase();
        return (
          t.email?.toLowerCase().includes(searchLower) ||
          t.firstName?.toLowerCase().includes(searchLower) ||
          t.lastName?.toLowerCase().includes(searchLower) ||
          t.id?.toString().includes(searchQuery)
        );
      })
    : history;

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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Tickets</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{analytics.totalTickets}</p>
                </div>
                <FaUsers className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            {/* Checked In Count */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Checked In</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{analytics.checkedInCount}</p>
                </div>
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Check-In Percentage */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Check-In Rate</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {analytics.checkInPercentage.toFixed(1)}%
                  </p>
                </div>
                <FaChartLine className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            {/* Total Guests Checked In */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium">Total Guests</p>
                  <p className="text-3xl font-bold text-teal-900 mt-2">{analytics.totalGuestsCheckedIn}</p>
                </div>
                <FaUsers className="w-10 h-10 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Check-Ins by Hour Chart */}
          {analytics.checkInsByHour.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-Ins by Hour</h3>
              <div className="space-y-2">
                {analytics.checkInsByHour.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">{item.hour}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / Math.max(...analytics.checkInsByHour.map(i => i.count))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Check-In History */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Check-In History</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="pl-12 pr-4 py-3 border-2 border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full sm:w-64 text-base transition-all"
                />
              </div>
              {/* Export Button */}
              {history.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                  title="Export to CSV"
                  aria-label="Export to CSV"
                  type="button"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                    <FaDownload className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-700">Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* History Table */}
          {filteredHistory.length > 0 ? (
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
                        Check-In Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Guests Checked In
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.map((transaction) => (
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
                          {transaction.checkInTime
                            ? new Date(transaction.checkInTime).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.numberOfGuestsCheckedIn || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startItem} to {endItem} of {totalCount} check-ins
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading check-in history...' : 'No check-ins found for this event.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!eventId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm">
            Enter an Event ID above to view check-in analytics and history. You can filter by date range and export the data to CSV.
          </p>
        </div>
      )}
    </div>
  );
}
