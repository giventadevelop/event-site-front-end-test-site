'use server';

import { getAppUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import type {
  WhatsAppAnalytics,
  WhatsAppUsageStats,
  WhatsAppMessageStatus,
  BulkMessageProgress
} from '@/types';

/**
 * Get comprehensive WhatsApp analytics for dashboard
 */
export async function getWhatsAppAnalyticsServer(
  period: string = '7d',
  startDate?: string,
  endDate?: string
): Promise<WhatsAppAnalytics | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

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
 * Get message history with filtering and pagination
 */
export async function getWhatsAppMessageHistoryServer(
  page: number = 1,
  limit: number = 20,
  filters: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    templateId?: string;
    campaignId?: string;
  } = {}
): Promise<{
  messages: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
} | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/messages?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch message history:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching message history:', error);
    return null;
  }
}

/**
 * Get real-time delivery status for messages
 */
export async function getWhatsAppDeliveryStatusServer(
  messageIds?: string[]
): Promise<WhatsAppMessageStatus[] | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams();

    if (messageIds && messageIds.length > 0) {
      messageIds.forEach(id => params.append('messageIds', id));
    }

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/delivery-status?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch delivery status:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    return null;
  }
}

/**
 * Get usage statistics and cost data
 */
export async function getWhatsAppUsageStatsServer(
  period: string = '30d'
): Promise<WhatsAppUsageStats | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({ period });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/usage-stats?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch usage stats:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }
}

/**
 * Get bulk message campaign progress
 */
export async function getBulkMessageProgressServer(
  campaignId?: string
): Promise<BulkMessageProgress[] | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams();

    if (campaignId) {
      params.append('campaignId', campaignId);
    }

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/bulk-progress?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch bulk message progress:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bulk message progress:', error);
    return null;
  }
}

/**
 * Retry failed message
 */
export async function retryFailedMessageServer(
  messageId: string
): Promise<{ success: boolean; messageId: string; error?: string }> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({ messageId });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/retry-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        messageId,
        error: errorData.message || 'Failed to retry message'
      };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.messageId || messageId
    };
  } catch (error) {
    console.error('Error retrying failed message:', error);
    return {
      success: false,
      messageId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get dashboard summary statistics
 */
export async function getWhatsAppDashboardSummaryServer(): Promise<{
  totalMessages: number;
  deliveryRate: number;
  activeCampaigns: number;
  failedMessages: number;
  lastUpdated: string;
} | null> {
  try {
    const baseUrl = getAppUrl();

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/dashboard-summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch dashboard summary:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return null;
  }
}

/**
 * Export message data to CSV
 */
export async function exportWhatsAppMessagesServer(
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    templateId?: string;
    campaignId?: string;
  } = {}
): Promise<{ downloadUrl: string; filename: string } | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId(filters);

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/export-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to export messages:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error exporting messages:', error);
    return null;
  }
}

/**
 * Get message templates statistics
 */
export async function getMessageTemplatesStatsServer(): Promise<{
  totalTemplates: number;
  activeTemplates: number;
  pendingTemplates: number;
  rejectedTemplates: number;
  templateUsage: Array<{
    templateId: string;
    name: string;
    usageCount: number;
    lastUsed: string;
  }>;
} | null> {
  try {
    const baseUrl = getAppUrl();

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/template-stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch template stats:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template stats:', error);
    return null;
  }
}

/**
 * Get error logs and troubleshooting data
 */
export async function getWhatsAppErrorLogsServer(
  limit: number = 50,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): Promise<{
  errors: Array<{
    id: string;
    timestamp: string;
    severity: string;
    message: string;
    component: string;
    details: any;
  }>;
  totalCount: number;
} | null> {
  try {
    const baseUrl = getAppUrl();
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(severity && { severity })
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/error-logs?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch error logs:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return null;
  }
}
















