'use server';

import { getAppUrlFromRequestHeaders } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';
import type { DonationTransactionDTO } from '@/types';

/**
 * Find donation transaction by transaction ID
 */
export async function findDonationTransactionByTransactionId(
  transactionId: string,
  eventId: string
): Promise<DonationTransactionDTO | null> {
  try {
    const baseUrl = await getAppUrlFromRequestHeaders();
    const response = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/donation-transactions/${transactionId}?eventId=${eventId}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
      'findDonationTransactionByTransactionId'
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('[findDonationTransactionByTransactionId] Failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('[findDonationTransactionByTransactionId] Error:', error);
    return null;
  }
}

/**
 * Find donation transaction by GiveButter donation ID
 */
export async function findDonationTransactionByDonationId(
  donationId: string,
  eventId: string
): Promise<DonationTransactionDTO | null> {
  try {
    const tenantId = getTenantId();
    const baseUrl = await getAppUrlFromRequestHeaders();
    
    // Query by givebutterDonationId
    const params = new URLSearchParams({
      'givebutterDonationId.equals': donationId,
      'eventId.equals': eventId,
      'tenantId.equals': tenantId,
    });

    const response = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/donation-transactions?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
      'findDonationTransactionByDonationId'
    );

    if (!response.ok) {
      console.error('[findDonationTransactionByDonationId] Failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error('[findDonationTransactionByDonationId] Error:', error);
    return null;
  }
}
