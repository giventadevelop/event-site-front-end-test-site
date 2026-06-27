"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { EventTicketTransactionDTO } from '@/types';
import { getApiBaseUrl } from '@/lib/env';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

if (!getApiBase()) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export interface CheckInHistoryOptions {
  eventId?: string;
  startDate?: string;
  endDate?: string;
  checkInStatus?: 'CHECKED_IN' | 'NOT_CHECKED_IN';
  page?: number;
  pageSize?: number;
  sort?: string; // e.g., "checkInTime,desc"
}

export interface CheckInHistoryResponse {
  transactions: EventTicketTransactionDTO[];
  totalCount: number;
}

/**
 * Fetch check-in history with pagination and filtering
 */
export async function fetchCheckInHistoryServer(
  options: CheckInHistoryOptions = {}
): Promise<CheckInHistoryResponse> {
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append('eventId.equals', options.eventId);
  }

  if (options.checkInStatus) {
    params.append('checkInStatus.equals', options.checkInStatus);
  }

  if (options.startDate) {
    params.append('checkInTime.greaterThanOrEqual', options.startDate);
  }

  if (options.endDate) {
    params.append('checkInTime.lessThanOrEqual', options.endDate);
  }

  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 20;
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  if (options.sort) {
    params.append('sort', options.sort);
  } else {
    // Default sort by check-in time descending
    params.append('sort', 'checkInTime,desc');
  }

  const url = `${getApiBase()}/api/event-ticket-transactions?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch check-in history: ${response.status} ${response.statusText}`);
  }

  const transactions = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  return {
    transactions: Array.isArray(transactions) ? transactions : [],
    totalCount,
  };
}

export interface CheckInAnalytics {
  eventId?: number;
  totalTickets: number;
  checkedInCount: number;
  totalGuestsCheckedIn: number;
  checkInPercentage: number;
  checkInsByHour: Array<{ hour: string; count: number }>;
  checkInsByTicketType: Array<{ ticketTypeName: string; checkedIn: number; total: number }>;
}

/**
 * Fetch check-in analytics for an event
 */
export async function fetchCheckInAnalyticsServer(
  eventId: string
): Promise<CheckInAnalytics> {
  // Fetch all transactions for the event
  const allParams = new URLSearchParams({
    'eventId.equals': eventId,
    'size': '1000', // Get all for analytics
  });

  const allUrl = `${getApiBase()}/api/event-ticket-transactions?${allParams.toString()}`;
  const allResponse = await fetchWithJwtRetry(allUrl, { cache: 'no-store' });

  if (!allResponse.ok) {
    throw new Error(`Failed to fetch check-in analytics: ${allResponse.status} ${allResponse.statusText}`);
  }

  const allTransactions: EventTicketTransactionDTO[] = await allResponse.json();
  const transactions = Array.isArray(allTransactions) ? allTransactions : [];

  // Fetch checked-in transactions
  const checkedInParams = new URLSearchParams({
    'eventId.equals': eventId,
    'checkInStatus.equals': 'CHECKED_IN',
    'size': '1000',
  });

  const checkedInUrl = `${getApiBase()}/api/event-ticket-transactions?${checkedInParams.toString()}`;
  const checkedInResponse = await fetchWithJwtRetry(checkedInUrl, { cache: 'no-store' });

  if (!checkedInResponse.ok) {
    throw new Error(`Failed to fetch checked-in transactions: ${checkedInResponse.status}`);
  }

  const checkedInTransactions: EventTicketTransactionDTO[] = await checkedInResponse.json();
  const checkedIn = Array.isArray(checkedInTransactions) ? checkedInTransactions : [];

  // Calculate analytics
  const totalTickets = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const checkedInCount = checkedIn.length;
  const totalGuestsCheckedIn = checkedIn.reduce((sum, t) => sum + (t.numberOfGuestsCheckedIn || 0), 0);

  // Group by hour
  const checkInsByHourMap: Record<string, number> = {};
  checkedIn.forEach(t => {
    if (t.checkInTime) {
      const date = new Date(t.checkInTime);
      const hour = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      checkInsByHourMap[hour] = (checkInsByHourMap[hour] || 0) + 1;
    }
  });

  const checkInsByHour = Object.entries(checkInsByHourMap)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Group by ticket type (would need to fetch transaction items for this)
  // For now, return empty array - can be enhanced later
  const checkInsByTicketType: Array<{ ticketTypeName: string; checkedIn: number; total: number }> = [];

  return {
    eventId: parseInt(eventId, 10),
    totalTickets,
    checkedInCount,
    totalGuestsCheckedIn,
    checkInPercentage: totalTickets > 0 ? (checkedInCount / totalTickets) * 100 : 0,
    checkInsByHour,
    checkInsByTicketType,
  };
}
