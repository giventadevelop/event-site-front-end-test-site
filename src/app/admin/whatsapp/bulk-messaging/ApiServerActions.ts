"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import {
  WhatsAppMessageRequest,
  BulkWhatsAppRequest,
  WhatsAppMessageStatus,
  BulkMessageProgress,
  WhatsAppAnalytics
} from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Send a single WhatsApp message
 */
export async function sendWhatsAppMessageServer(messageData: WhatsAppMessageRequest): Promise<WhatsAppMessageStatus | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      ...messageData,
      sentAt: new Date().toISOString(),
      status: 'SENT',
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send WhatsApp message:', errorText);
      throw new Error(`Failed to send WhatsApp message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send bulk WhatsApp messages to multiple recipients
 */
export async function sendBulkWhatsAppMessagesServer(bulkData: BulkWhatsAppRequest): Promise<BulkMessageProgress> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      ...bulkData,
      scheduledAt: bulkData.scheduledAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send bulk WhatsApp messages:', errorText);
      throw new Error(`Failed to send bulk WhatsApp messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    throw error;
  }
}

/**
 * Get progress status of a bulk messaging campaign
 */
export async function getBulkMessageProgressServer(campaignId: string): Promise<BulkMessageProgress | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk/${campaignId}/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to get bulk message progress:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting bulk message progress:', error);
    return null;
  }
}

/**
 * Cancel a bulk messaging campaign
 */
export async function cancelBulkMessageCampaignServer(campaignId: string): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      campaignId,
      cancelledAt: new Date().toISOString(),
      status: 'CANCELLED',
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk/${campaignId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to cancel bulk message campaign:', errorText);
      return {
        success: false,
        message: `Failed to cancel campaign: ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Campaign cancelled successfully',
    };
  } catch (error) {
    console.error('Error cancelling bulk message campaign:', error);
    return {
      success: false,
      message: `Error cancelling campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Schedule a bulk WhatsApp message for later delivery
 */
export async function scheduleBulkWhatsAppMessagesServer(
  bulkData: BulkWhatsAppRequest,
  scheduledAt: string
): Promise<{ campaignId: string; scheduledAt: string } | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      ...bulkData,
      scheduledAt,
      createdAt: new Date().toISOString(),
      status: 'SCHEDULED',
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to schedule bulk WhatsApp messages:', errorText);
      throw new Error(`Failed to schedule bulk WhatsApp messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error scheduling bulk WhatsApp messages:', error);
    throw error;
  }
}

/**
 * Get message delivery status for a specific message
 */
export async function getMessageStatusServer(messageId: string): Promise<WhatsAppMessageStatus | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/${messageId}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to get message status:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting message status:', error);
    return null;
  }
}

/**
 * Get analytics for WhatsApp messaging
 */
export async function getWhatsAppAnalyticsServer(period: string = '7d'): Promise<WhatsAppAnalytics | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({ period });
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/analytics?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch WhatsApp analytics:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching WhatsApp analytics:', error);
    return null;
  }
}

/**
 * Retry failed messages from a bulk campaign
 */
export async function retryFailedMessagesServer(campaignId: string): Promise<{ success: boolean; retriedCount: number }> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      campaignId,
      retryAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk/${campaignId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to retry failed messages:', errorText);
      return {
        success: false,
        retriedCount: 0,
      };
    }

    const result = await response.json();
    return {
      success: true,
      retriedCount: result.retriedCount || 0,
    };
  } catch (error) {
    console.error('Error retrying failed messages:', error);
    return {
      success: false,
      retriedCount: 0,
    };
  }
}

/**
 * Get list of recent bulk messaging campaigns
 */
export async function getBulkMessageCampaignsServer(
  page: number = 0,
  pageSize: number = 10
): Promise<{ campaigns: any[]; totalCount: number }> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp-messages/bulk?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch bulk message campaigns:', response.status);
      return { campaigns: [], totalCount: 0 };
    }

    const data = await response.json();
    const totalCount = response.headers.get('X-Total-Count');

    return {
      campaigns: Array.isArray(data) ? data : [],
      totalCount: totalCount ? parseInt(totalCount, 10) : 0,
    };
  } catch (error) {
    console.error('Error fetching bulk message campaigns:', error);
    return { campaigns: [], totalCount: 0 };
  }
}

/**
 * Validate phone numbers before sending bulk messages
 */
export async function validatePhoneNumbersServer(phoneNumbers: string[]): Promise<{
  valid: string[];
  invalid: string[];
  suggestions: Record<string, string>;
}> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      phoneNumbers,
      validatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/validate-phone-numbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to validate phone numbers:', response.status);
      return {
        valid: [],
        invalid: phoneNumbers,
        suggestions: {},
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating phone numbers:', error);
    return {
      valid: [],
      invalid: phoneNumbers,
      suggestions: {},
    };
  }
}
















