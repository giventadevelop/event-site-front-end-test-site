import { EventTicketTransactionDTO, EventTicketTransactionStatisticsDTO, EventDetailsDTO, EventTicketTypeDTO } from '@/types';
import { FaSearch, FaTicketAlt, FaEnvelope, FaUser, FaHashtag, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUsers, FaPhotoVideo, FaTags, FaPercent, FaHome, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import TicketTableClient from './TicketTableClient';
import { fetchEventDetailsServer } from '@/app/admin/ApiServerActions';
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Use 0-based page for API
  const page = Math.max(0, parseInt(searchParams.page || '0', 10));
  const pageSize = parseInt(searchParams.pageSize || PAGE_SIZE.toString(), 10);
  const query: Record<string, any> = {
    'eventId.equals': eventId,
    sort: 'createdAt,desc', // Use createdAt for proper sorting
    page,
    size: pageSize,
  };
  if (searchParams.email) query['email.contains'] = searchParams.email;
  if (searchParams.transactionId) query['id.equals'] = searchParams.transactionId;
  if (searchParams.name) query['firstName.contains'] = searchParams.name;
  const qs = buildQueryString(query);
  console.log('Fetching tickets with query:', qs);
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  const rows = await res.json();
  // Debug: Log purchase dates to verify sorting
  console.log('Purchase dates from response:', rows.map((row: any) => ({
    id: row.id,
    purchaseDate: row.purchaseDate,
    createdAt: row.createdAt
  })));

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions/statistics/${eventId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function fetchTicketTypes(eventId: string): Promise<EventTicketTypeDTO[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
    <div className="max-w-6xl mx-auto px-4 pb-8" style={{ paddingTop: '180px' }}>
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
            className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaHome className="w-10 h-10 text-gray-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="w-10 h-10 text-blue-500" />
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
              <FaPhotoVideo className="w-10 h-10 text-yellow-500" />
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
              <FaCalendarAlt className="w-10 h-10 text-green-500" />
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
              <FaTags className="w-10 h-10 text-purple-500" />
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
              <FaTicketAlt className="w-10 h-10 text-teal-500" />
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
              <FaPercent className="w-10 h-10 text-pink-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
        </div>
      </div>
      {/* Statistics Dashboard */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg shadow flex flex-wrap gap-6 p-4 items-center justify-between">
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">Total Tickets Sold</span>
            <span className="text-2xl font-bold text-teal-700">{statistics ? statistics.totalTicketsSold : '--'}</span>
          </div>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="text-2xl font-bold text-blue-700">{statistics ? `$${statistics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}</span>
          </div>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">Net Amount</span>
            <span className="text-2xl font-bold text-green-700">{statistics ? `$${statistics.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}</span>
          </div>
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-xs text-gray-500">By Status</span>
            {statistics ? (
              <div className="flex flex-col gap-1 text-sm mt-1">
                {Object.entries(statistics.ticketsByStatus).map(([status, count]) => (
                  <span key={status} className="text-gray-700">{status}: <span className="font-semibold">{count}</span> ({statistics.amountByStatus[status] !== undefined ? `$${statistics.amountByStatus[status].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'})</span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">--</span>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Type Breakdown */}
      {ticketTypes.length > 0 ? (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <FaTags className="text-purple-600 text-lg" />
              <h3 className="text-lg font-semibold text-purple-800">Ticket Type Breakdown</h3>
              <FaInfoCircle className="text-purple-500 text-sm" title="Detailed breakdown of each ticket type with remaining quantities and sales status" />
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

                      {ticketType.maxQuantityPerOrder && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max per Order:</span>
                          <span className="font-medium text-gray-800">{ticketType.maxQuantityPerOrder}</span>
                        </div>
                      )}

                      {ticketType.serviceFee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee:</span>
                          <span className="font-medium text-gray-800">
                            ${ticketType.serviceFee.toFixed(2)}
                            {ticketType.isServiceFeeIncluded && <span className="text-green-600 ml-1">(Included)</span>}
                          </span>
                        </div>
                      )}
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTicketAlt className="text-teal-500" /> Tickets Sold
        </h1>
        <form className="flex flex-wrap gap-2 items-center bg-white rounded-lg shadow px-4 py-2" method="get">
          <div className="flex items-center gap-1">
            <FaEnvelope className="text-gray-400" />
            <input name="email" placeholder="Search by email" defaultValue={email} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-1">
            <FaHashtag className="text-gray-400" />
            <input name="transactionId" placeholder="Transaction ID" defaultValue={transactionId} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-1">
            <FaUser className="text-gray-400" />
            <input name="name" placeholder="Name" defaultValue={name} className="border rounded px-2 py-1 text-sm" />
          </div>
          <button type="submit" className="ml-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm">
            <FaSearch /> Search
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        {error && (
          <div className="text-red-500 font-semibold mb-4">
            {error}
            {!hasTickets && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium ml-2">[No tickets sold yet]</span>
            )}
          </div>
        )}
        <div className="text-xs text-gray-500 mb-2">Hover over the <b>ID</b> or <b>Name</b> columns to see full ticket details.</div>
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
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
        {/* Pagination Controls */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <Link
              href={`?${buildQueryString({ ...sp, page: page - 1 })}`}
              className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors${!hasPrevPage ? ' pointer-events-none opacity-50' : ''}`}
              aria-disabled={!hasPrevPage}
              tabIndex={!hasPrevPage ? -1 : 0}
            >
              <FaChevronLeft /> Previous
            </Link>
            <div className="text-sm font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <Link
              href={`?${buildQueryString({ ...sp, page: page + 1 })}`}
              className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors${!hasNextPage ? ' pointer-events-none opacity-50' : ''}`}
              aria-disabled={!hasNextPage}
              tabIndex={!hasNextPage ? -1 : 0}
            >
              Next <FaChevronRight />
            </Link>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            {rows.length > 0 ? (
              <>Showing <span className="font-medium">{startItemControl}</span> to <span className="font-medium">{endItemControl}</span> of <span className="font-medium">{totalCount}</span> tickets</>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>No tickets found</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">[No tickets sold yet]</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
