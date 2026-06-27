import { NextRequest, NextResponse } from 'next/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { EventTicketTransactionDTO } from '@/types';
import { getApiBaseUrl } from '@/lib/env';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Parse QR code data to extract transaction ID and event ID
 * Supports multiple formats:
 * 1. URL format: /admin/qrcode-scan/tickets/events/{eventId}/transactions/{transactionId}
 * 2. Pipe-delimited: ATTENDEE:{id}|EVENT:{eventId}|TENANT:{tenantId}|...
 * 3. JSON format: {"transactionId": 123, "eventId": 456}
 * 4. Direct transaction ID: "12345"
 */
function parseQrCodeData(qrData: string): { transactionId?: string; eventId?: string } | null {
  if (!qrData || typeof qrData !== 'string') {
    return null;
  }

  const trimmed = qrData.trim();

  // Format 1: URL format
  const urlMatch = trimmed.match(/\/admin\/qrcode-scan\/tickets\/events\/(\d+)\/transactions\/(\d+)/);
  if (urlMatch) {
    return {
      eventId: urlMatch[1],
      transactionId: urlMatch[2],
    };
  }

  // Format 2: Pipe-delimited format (ATTENDEE:{id}|EVENT:{eventId}|...)
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|');
    const eventMatch = parts.find(p => p.startsWith('EVENT:'));
    const attendeeMatch = parts.find(p => p.startsWith('ATTENDEE:'));
    const transactionMatch = parts.find(p => p.startsWith('TRANSACTION:'));

    if (transactionMatch) {
      const transactionId = transactionMatch.replace('TRANSACTION:', '').trim();
      const eventId = eventMatch ? eventMatch.replace('EVENT:', '').trim() : undefined;
      return { transactionId, eventId };
    }

    if (attendeeMatch && eventMatch) {
      // For attendee-based QR codes, we'll need to look up the transaction
      const eventId = eventMatch.replace('EVENT:', '').trim();
      return { eventId };
    }
  }

  // Format 3: JSON format
  try {
    const json = JSON.parse(trimmed);
    if (json.transactionId || json.transaction_id) {
      return {
        transactionId: String(json.transactionId || json.transaction_id),
        eventId: json.eventId || json.event_id ? String(json.eventId || json.event_id) : undefined,
      };
    }
  } catch (e) {
    // Not JSON, continue
  }

  // Format 4: Direct transaction ID (numeric string)
  if (/^\d+$/.test(trimmed)) {
    return { transactionId: trimmed };
  }

  return null;
}

/**
 * Fetch transaction by ID from backend
 */
async function fetchTransaction(transactionId: string): Promise<EventTicketTransactionDTO | null> {
  if (!getApiBase()) {
    throw new Error('API_BASE_URL not configured');
  }

  try {
    const url = `${getApiBase()}/api/event-ticket-transactions/${transactionId}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch transaction: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error('[QR-VERIFY] Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Validate transaction status
 */
function validateTransaction(transaction: EventTicketTransactionDTO | null): { valid: boolean; reason?: string } {
  if (!transaction) {
    return { valid: false, reason: 'Transaction not found' };
  }

  // Check if transaction is refunded or cancelled
  if (transaction.status === 'REFUNDED' || transaction.status === 'CANCELLED') {
    return {
      valid: false,
      reason: `Ticket is ${transaction.status.toLowerCase()}. Cannot check in.`
    };
  }

  // Check if transaction is confirmed/paid
  if (transaction.status !== 'CONFIRMED' && transaction.status !== 'PAID' && transaction.status !== 'SUCCEEDED') {
    return {
      valid: false,
      reason: `Ticket status is ${transaction.status}. Only confirmed/paid tickets can be checked in.`
    };
  }

  return { valid: true };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrData = searchParams.get('data');

    if (!qrData) {
      return NextResponse.json(
        { valid: false, error: 'QR code data is required' },
        { status: 400 }
      );
    }

    console.log('[QR-VERIFY] Received QR data:', qrData);

    // Parse QR code data
    const parsed = parseQrCodeData(qrData);
    if (!parsed || !parsed.transactionId) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid QR code format. Could not extract transaction ID.',
          parsed
        },
        { status: 400 }
      );
    }

    console.log('[QR-VERIFY] Parsed QR data:', parsed);

    // Fetch transaction
    const transaction = await fetchTransaction(parsed.transactionId);

    // Validate transaction
    const validation = validateTransaction(transaction);

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        error: validation.reason,
        transaction: transaction ? {
          id: transaction.id,
          status: transaction.status,
          email: transaction.email,
        } : null,
      });
    }

    // Return valid transaction
    return NextResponse.json({
      valid: true,
      transaction: {
        id: transaction!.id,
        eventId: transaction!.eventId,
        email: transaction!.email,
        firstName: transaction!.firstName,
        lastName: transaction!.lastName,
        phone: transaction!.phone,
        quantity: transaction!.quantity,
        status: transaction!.status,
        checkInStatus: transaction!.checkInStatus,
        checkInTime: transaction!.checkInTime,
        numberOfGuestsCheckedIn: transaction!.numberOfGuestsCheckedIn,
        purchaseDate: transaction!.purchaseDate,
        totalAmount: transaction!.totalAmount,
        finalAmount: transaction!.finalAmount,
      },
    });

  } catch (error: any) {
    console.error('[QR-VERIFY] Error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'Failed to verify QR code',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
