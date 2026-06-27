import { EventTicketTransactionDTO, EventTicketTransactionStatisticsDTO, EventDetailsDTO, EventTicketTypeDTO } from '@/types';
import Link from 'next/link';
import TicketTableClient from './TicketTableClient';
import BatchRefundSection from './BatchRefundSection';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
import { getAppUrlFromRequestHeaders } from '@/lib/env';
import { formatInTimeZone } from 'date-fns-tz';

interface SearchParams {
  page?: string;
  pageSize?: string;
  email?: string;
  transactionId?: string;
  name?: string;
}

const PAGE_SIZE = 10;

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (typeof value !== 'undefined' && value !== null && value !== '') {
      params.append(key, value);
    }
  }
  return params.toString();
}

async function fetchTickets(eventId: string, searchParams: SearchParams) {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use 0-based page for API
  const page = Math.max(0, parseInt(searchParams.page || '0', 10));
  const pageSize = parseInt(searchParams.pageSize || PAGE_SIZE.toString(), 10);
  const query: Record<string, any> = {
    'eventId.equals': eventId,
    sort: 'createdAt,desc', // Use createdAt for proper sorting
    page,
    size: pageSize,
  };
  // Note: tenantId.equals is automatically added by the proxy handler
  // If tickets aren't showing, they might be associated with a different tenant
  if (searchParams.email) query['email.contains'] = searchParams.email;
  if (searchParams.transactionId) query['id.equals'] = searchParams.transactionId;
  if (searchParams.name) {
    // Search in both firstName and lastName fields
    query['firstName.contains'] = searchParams.name;
    // Note: Backend might need OR logic, but we'll try firstName first
    // If that doesn't work, we may need to search lastName separately or use a different approach
  }
  const qs = buildQueryString(query);
  console.log('Fetching tickets with query:', qs);
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?${qs}`, { cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch tickets:', res.status, res.statusText, errorText);
    throw new Error(`Failed to fetch tickets: ${res.status} ${res.statusText}`);
  }
  let rows = await res.json();
  console.log('Fetched tickets response (raw):', rows);
  console.log('Response type:', typeof rows, 'Is array:', Array.isArray(rows));

  // Handle case where backend returns a single object instead of an array
  if (!Array.isArray(rows)) {
    if (rows && typeof rows === 'object' && rows.id) {
      // Single ticket object - wrap in array
      console.log('Backend returned single ticket object, wrapping in array');
      rows = [rows];
    } else if (rows && typeof rows === 'object' && rows.content && Array.isArray(rows.content)) {
      // Paginated response with content array
      console.log('Backend returned paginated response with content array');
      rows = rows.content;
    } else {
      // Unexpected format - log and default to empty array
      console.warn('Unexpected response format, defaulting to empty array:', rows);
      rows = [];
    }
  }

  console.log('Fetched tickets response (processed):', { rowsCount: rows.length, totalCountHeader: res.headers.get('x-total-count') });
  // Debug: Log purchase dates to verify sorting
  if (rows.length > 0) {
    console.log('Purchase dates from response:', rows.map((row: any) => ({
      id: row.id,
      purchaseDate: row.purchaseDate,
      createdAt: row.createdAt
    })));
  }

  // Fallback: Sort consistently by createdAt (descending) if backend sorting doesn't work
  const sortedRows = Array.isArray(rows) ? rows.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime(); // Descending order
  }) : [];

  // Read total count from x-total-count header
  const totalCount = parseInt(res.headers.get('x-total-count') || '0', 10);
  return { rows: sortedRows, totalCount };
}

async function fetchStatistics(eventId: string): Promise<EventTicketTransactionStatisticsDTO | null> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions/statistics/${eventId}`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('Statistics fetch failed:', res.status, res.statusText);
    return null;
  }
  const stats = await res.json();
  console.log('Statistics response:', stats);
  return stats;
}

async function fetchTicketTypes(eventId: string): Promise<EventTicketTypeDTO[]> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-types?eventId.equals=${eventId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TicketListPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<SearchParams> }) {
  const { id: eventId } = await params;
  const sp = await searchParams;
  // Use 0-based page for API, 1-based for display
  const page = Math.max(0, parseInt(sp.page || '0', 10));
  const pageSize = parseInt(sp.pageSize || PAGE_SIZE.toString(), 10);
  const email = (sp.email || '').trim();
  const transactionId = (sp.transactionId || '').trim();
  const name = (sp.name || '').trim();

  let rows: EventTicketTransactionDTO[] = [];
  let totalCount = 0;
  let error: string | null = null;
  let statistics: EventTicketTransactionStatisticsDTO | null = null;
  let eventDetails: EventDetailsDTO | null = null;
  let ticketTypes: EventTicketTypeDTO[] = [];
  try {
    const result = await fetchTickets(eventId, { page: page.toString(), pageSize: pageSize.toString(), email, transactionId, name });
    rows = Array.isArray(result.rows) ? result.rows : [];
    totalCount = result.totalCount;
    statistics = await fetchStatistics(eventId);
    eventDetails = await fetchEventDetailsServer(Number(eventId));
    ticketTypes = await fetchTicketTypes(eventId);
  } catch (err: any) {
    error = err.message || 'Failed to load tickets';
  }

  // Fix: If there are rows but totalCount is 0, set totalCount as fallback
  if (rows.length > 0 && totalCount === 0) {
    totalCount = page * pageSize + rows.length;
  }

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = page + 1; // 1-based for display
  const hasTickets = rows.length > 0;
  const startItem = hasTickets ? page * pageSize + 1 : 0;
  const endItem = hasTickets ? page * pageSize + rows.length : 0;
  const prevPage = Math.max(0, page - 1);
  const nextPage = page + 1 < totalPages ? page + 1 : page;
  const isPrevDisabled = page === 0;
  const isNextDisabled = page >= totalPages - 1 || !hasTickets || endItem >= totalCount;

  // Debug output for pagination
  console.log('Pagination debug:', { totalCount, pageSize, currentPage, page, totalPages, rowsLength: rows.length });

  // Pagination math for controls
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItemControl = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItemControl = (currentPage - 1) * pageSize + rows.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Tickets Sold
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Manage and view all ticket transactions for this event
        </p>
      </div>

      {/* Concise Event Summary */}
      {eventDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
            <div><span className="font-semibold text-gray-600">Event ID:</span> {eventDetails.id}</div>
            <div className="sm:col-span-2"><span className="font-semibold text-gray-600">Title:</span> {eventDetails.title}</div>
            <div><span className="font-semibold text-gray-600">Start Date:</span> {formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'EEEE, MMMM d, yyyy')}</div>
            <div><span className="font-semibold text-gray-600">End Date:</span> {formatInTimeZone(eventDetails.endDate || eventDetails.startDate, eventDetails.timezone, 'EEEE, MMMM d, yyyy')}</div>
            <div><span className="font-semibold text-gray-600">Time:</span> {eventDetails.startTime} {eventDetails.endTime ? `- ${eventDetails.endTime}` : ''} ({formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'zzz')})</div>
          </div>
        </div>
      )}
      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/media/list`}
            className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Media Files"
            aria-label="Manage Media Files"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Media Files</span>
          </Link>
          <Link
            href="/admin/manage-events"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/ticket-types/list`}
            className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Ticket Types"
            aria-label="Manage Ticket Types"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/tickets/list`}
            className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Tickets"
            aria-label="Manage Tickets"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Tickets</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/discount-codes/list`}
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Discount Codes"
            aria-label="Manage Discount Codes"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
          <Link
            href={`/admin/check-in-analytics?eventId=${eventId}`}
            className="flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Check-In Analytics"
            aria-label="Check-In Analytics"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Check-In Analytics</span>
          </Link>
          <Link
            href={`/admin/sales-analytics?eventId=${eventId}`}
            className="flex flex-col items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Sales Analytics"
            aria-label="Sales Analytics"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Sales Analytics</span>
          </Link>
        </div>
      </div>
      {/* Statistics Dashboard - Stats Cards Pattern */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Tickets Sold */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets Sold</dt>
                    <dd className="text-lg font-medium text-gray-900">{statistics.totalTicketsSold}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">${statistics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Net Amount */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Net Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">${statistics.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets By Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate mb-2">By Status</dt>
                    <dd className="text-sm text-gray-900 space-y-1">
                      {Object.entries(statistics.ticketsByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span className="text-gray-600">{status}:</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Type Breakdown */}
      {ticketTypes.length > 0 ? (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-semibold text-purple-800">Ticket Type Breakdown</h3>
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Detailed breakdown of each ticket type with remaining quantities and sales status">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketTypes.map((ticketType) => {
                const remainingQuantity = ticketType.remainingQuantity ?? 0;
                const soldQuantity = ticketType.soldQuantity ?? 0;
                const availableQuantity = ticketType.availableQuantity ?? 0;
                // Calculate total quantity, but don't use availableQuantity as fallback to avoid confusion
                const totalQuantity = remainingQuantity + soldQuantity;
                const soldPercentage = totalQuantity > 0 ? (soldQuantity / totalQuantity) * 100 : 0;

                // Determine status color and text
                let statusColor = 'text-green-600';
                let statusText = 'Available';
                let bgColor = 'bg-green-50';
                let borderColor = 'border-green-200';

                if (remainingQuantity === 0) {
                  statusColor = 'text-red-600';
                  statusText = 'Sold Out';
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                } else if (remainingQuantity <= Math.ceil(totalQuantity * 0.1)) {
                  statusColor = 'text-orange-600';
                  statusText = 'Low Stock';
                  bgColor = 'bg-orange-50';
                  borderColor = 'border-orange-200';
                } else if (remainingQuantity <= Math.ceil(totalQuantity * 0.25)) {
                  statusColor = 'text-yellow-600';
                  statusText = 'Limited';
                  bgColor = 'bg-yellow-50';
                  borderColor = 'border-yellow-200';
                }

                return (
                  <div key={ticketType.id} className={`${bgColor} ${borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{ticketType.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{ticketType.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-purple-700">${ticketType.price.toFixed(2)}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgColor} ${statusColor} border ${borderColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-mono font-medium text-gray-800">{ticketType.code}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Quantity:</span>
                        <span className="font-semibold text-gray-800">
                          {totalQuantity > 0 ? totalQuantity : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-semibold text-green-700">{soldQuantity}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className={`font-semibold ${remainingQuantity === 0 ? 'text-red-600' : remainingQuantity <= Math.ceil(totalQuantity * 0.1) ? 'text-orange-600' : 'text-blue-600'}`}>
                          {remainingQuantity}
                        </span>
                      </div>

                      {ticketType.minQuantityPerOrder && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min per Order:</span>
                          <span className="font-medium text-gray-800">{ticketType.minQuantityPerOrder}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Max per Order:</span>
                        <span className="font-medium text-gray-800">{ticketType.maxQuantityPerOrder ?? 0}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee:</span>
                        <span className="font-medium text-gray-800">
                          ${(ticketType.serviceFee ?? 0).toFixed(2)}
                          {ticketType.isServiceFeeIncluded && <span className="text-green-600 ml-1">(Included)</span>}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar for sales */}
                    {totalQuantity > 0 ? (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Sales Progress</span>
                          <span>{soldPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 text-center py-2 bg-gray-100 rounded">
                          No inventory data available
                        </div>
                      </div>
                    )}

                    {/* Sale dates if available */}
                    {(ticketType.saleStartDate || ticketType.saleEndDate) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                        {ticketType.saleStartDate && (
                          <div className="mb-1">
                            <span className="font-medium">Sale Start:</span> {new Date(ticketType.saleStartDate).toLocaleDateString()}
                          </div>
                        )}
                        {ticketType.saleEndDate && (
                          <div>
                            <span className="font-medium">Sale End:</span> {new Date(ticketType.saleEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Batch Refund Section */}
      <BatchRefundSection eventId={Number(eventId)} />

      {/* Search Form */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <form className="flex flex-col sm:flex-row flex-wrap gap-4 items-end" method="get">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Search by email"
                defaultValue={email}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 text-base"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <input
                id="transactionId"
                name="transactionId"
                type="text"
                placeholder="Transaction ID"
                defaultValue={transactionId}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 text-base"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Search by name"
                defaultValue={name}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Search"
            aria-label="Search"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="font-semibold text-teal-700 hidden sm:inline">Search</span>
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {/* Rainbow Gradient Scrollbar CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .table-scroll-container {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: thin !important;
              scrollbar-color: #EC4899 #FCE7F3 !important; /* Pink thumb, pink track (Firefox) */
              -ms-overflow-style: -ms-autohiding-scrollbar !important;
            }

            /* WebKit browsers (Chrome, Safari, Edge) */
            .table-scroll-container::-webkit-scrollbar {
              height: 20px !important; /* Larger for visibility */
              display: block !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-track {
              background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
              border-radius: 10px !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
              border-radius: 10px !important;
              border: 4px solid #F3F4F6 !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              min-width: 50px !important; /* CRITICAL: Ensures thumb is always visible */
              background-clip: padding-box !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
              border-color: #E5E7EB !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:active {
              background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
              border-color: #D1D5DB !important;
            }

            .table-scroll-container::-webkit-scrollbar-button {
              display: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-corner {
              background: #E0E7FF !important;
            }

            /* Flexbox spacer for right-side centering */
            .table-scroll-container::after {
              content: '';
              display: block;
              width: 100vw; /* Full viewport width of scrollable space */
              height: 1px;
              flex-shrink: 0;
            }

            .table-scroll-container {
              display: flex !important;
            }
          `
        }} />

        {error && (
          <div className="text-red-500 font-semibold mb-4">
            {error}
            {!hasTickets && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium ml-2">[No tickets sold yet]</span>
            )}
          </div>
        )}
        {!error && statistics && statistics.totalTicketsSold > 0 && rows.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-semibold mb-1">Data Mismatch Detected</p>
                <p className="text-yellow-700 text-sm">
                  Statistics show <strong>{statistics.totalTicketsSold} ticket(s)</strong> sold, but the list query returned no results.
                  This may indicate a tenantId mismatch or the tickets may be associated with a different event/tenant.
                  Check the browser console for detailed query logs.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="text-xs text-gray-500 mb-2">Hover over the <b>ID</b> or <b>Name</b> columns to see full ticket details.</div>

        {/* Outer wrapper with gradient border */}
        <div className="rounded-lg shadow w-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
          padding: '4px'
        }}>
          {/* Inner scroll container with gradient background */}
          <div
            className="w-full table-scroll-container"
            style={{
              overflowX: 'scroll',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              display: 'flex',
              position: 'relative',
              width: '100%',
              minHeight: '1px',
              scrollbarGutter: 'stable',
              background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
              borderRadius: '8px',
              padding: '20px'
            }}
          >
            {/* Table with semi-transparent white background */}
            <table
              className="divide-y divide-gray-300 border border-gray-300"
              style={{
                width: 'max-content',
                minWidth: 'fit-content', /* Responsive: fits content naturally */
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.95)', /* Semi-transparent white */
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Total</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-r border-gray-300">Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 bg-white">
            <TicketTableClient rows={rows} />
          </tbody>
        </table>
          </div>
        </div>
        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            {hasPrevPage ? (
            <Link
                href={`?${buildQueryString({ ...sp, page: prevPage })}`}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
            </Link>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 bg-blue-100 border-2 border-blue-300 text-blue-500 font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all duration-300 disabled:cursor-not-allowed"
                title="Previous Page"
                aria-label="Previous Page"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
            )}

            {/* Page Info */}
            <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{currentPage}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            {hasNextPage ? (
            <Link
                href={`?${buildQueryString({ ...sp, page: nextPage })}`}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Next Page"
                aria-label="Next Page"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 bg-blue-100 border-2 border-blue-300 text-blue-500 font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all duration-300 disabled:cursor-not-allowed"
                title="Next Page"
                aria-label="Next Page"
                type="button"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Item Count Text */}
          <div className="text-center mt-3">
            {totalCount > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{startItemControl}</span> to <span className="font-bold text-blue-600">{endItemControl}</span> of <span className="font-bold text-blue-600">{totalCount}</span> tickets
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No tickets found</span>
                <span className="text-sm text-orange-600">[No tickets match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
