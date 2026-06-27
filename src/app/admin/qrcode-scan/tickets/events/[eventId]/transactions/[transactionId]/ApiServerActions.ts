"use server";
import { QrCodeUsageDTO, EventTicketTransactionDTO } from '@/types';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';

const BASE_URL = getAppUrl();

export async function fetchQrCodeUsageDetails(eventId: string, transactionId: string): Promise<QrCodeUsageDTO | null> {
  const url = `${BASE_URL}/api/proxy/qrcode-scan/tickets/events/${eventId}/transactions/${transactionId}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function updateQrCodeCheckIn(
  eventId: string,
  transactionId: string,
  payload: Partial<QrCodeUsageDTO>,
  cookieHeader?: string
): Promise<QrCodeUsageDTO | null> {
  const url = `${BASE_URL}/api/proxy/qrcode-scan/tickets/events/${eventId}/transactions/${transactionId}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookieHeader) headers['Cookie'] = cookieHeader;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      ...payload,
      id: transactionId, // Include the id field as required by backend
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateEventTicketTransactionCheckIn(transactionId: string, payload: Partial<EventTicketTransactionDTO>) {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
  const url = `${getApiBase()}/api/event-ticket-transactions/${transactionId}`;
  let token = await getCachedApiJwt();
  if (!token) {
    token = await generateApiJwt();
  }
  const finalPayload = { ...payload, id: Number(transactionId) };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(finalPayload),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Failed to update event ticket transaction ${transactionId}:`, errorBody);
    throw new Error('Failed to update event ticket transaction');
  }
  return res.json();
}