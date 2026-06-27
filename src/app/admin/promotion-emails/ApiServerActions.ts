"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type {
  PromotionEmailTemplateDTO,
  PromotionEmailTemplateFormDTO,
  SendPromotionEmailDTO,
  PromotionEmailSentLogDTO,
} from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch promotion email templates with optional filtering
 */
export async function fetchPromotionEmailTemplatesServer(params?: {
  eventId?: number;
  isActive?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<{ templates: PromotionEmailTemplateDTO[]; totalCount: number }> {
  const baseUrl = getAppUrl();
  const queryParams = new URLSearchParams();

  // Always scope promotion emails to EVENT_PROMOTION template type
  queryParams.append('templateType.equals', 'EVENT_PROMOTION');

  if (params?.eventId) {
    queryParams.append('eventId.equals', params.eventId.toString());
  }
  if (params?.isActive !== undefined) {
    queryParams.append('isActive.equals', params.isActive.toString());
  }
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.size !== undefined) {
    queryParams.append('size', params.size.toString());
  }

  const url = `${baseUrl}/api/proxy/promotion-email-templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    // Handle 404 as empty list (no templates found)
    if (response.status === 404) {
      return { templates: [], totalCount: 0 };
    }
    const errorBody = await response.text();
    console.error(`[Server] Error fetching promotion email templates: ${response.status} ${response.statusText}`, errorBody);
    throw new Error('Unable to load email templates. Please try again later.');
  }

  const totalCount = Number(response.headers.get('x-total-count')) || 0;
  const data = await response.json();
  const templates = Array.isArray(data) ? data : [];

  return { templates, totalCount };
}

/**
 * Fetch a single promotion email template by ID
 */
export async function fetchPromotionEmailTemplateServer(id: number): Promise<PromotionEmailTemplateDTO | null> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorBody = await response.text();
    console.error(`[Server] Error fetching promotion email template ${id}: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to fetch promotion email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create a new promotion email template
 */
export async function createPromotionEmailTemplateServer(
  formData: PromotionEmailTemplateFormDTO
): Promise<PromotionEmailTemplateDTO> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates`;

  // Remove id, createdAt, updatedAt - backend will set these
  // Only include fields from PromotionEmailTemplateFormDTO
  const { id, createdAt, updatedAt, tenantId, ...cleanFormData } = formData as any;

  // Build payload with all required fields
  // Note: Proxy handler will inject tenantId automatically via withTenantId
  // CRITICAL: Explicitly include fromEmail - backend requires this field (@NotNull @Size(max = 255))
  // Ensure it's not empty string (backend validation requires non-empty)
  if (!formData.fromEmail || !formData.fromEmail.trim()) {
    throw new Error('fromEmail is required and cannot be empty');
  }

  const payload = {
    eventId: formData.eventId,
    templateName: formData.templateName,
    // Promotion emails are always EVENT_PROMOTION template type
    templateType: formData.templateType || 'EVENT_PROMOTION',
    subject: formData.subject,
    fromEmail: formData.fromEmail.trim(), // Explicitly include and trim
    bodyHtml: formData.bodyHtml,
    footerHtml: null, // Footer HTML is hidden, pass as null
    headerImageUrl: formData.headerImageUrl || '',
    footerImageUrl: formData.footerImageUrl || '',
    discountCodeId: formData.discountCodeId,
    isActive: formData.isActive !== undefined ? formData.isActive : true,
  };

  console.log('[DEBUG] Creating promotion email template with payload:', payload);
  console.log('[DEBUG] fromEmail value:', payload.fromEmail);
  console.log('[DEBUG] fromEmail type:', typeof payload.fromEmail);
  console.log('[DEBUG] fromEmail length:', payload.fromEmail?.length);
  console.log('[DEBUG] Payload keys:', Object.keys(payload));
  console.log('[DEBUG] Payload has fromEmail:', 'fromEmail' in payload);
  console.log('[DEBUG] JSON stringified payload:', JSON.stringify(payload));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error creating promotion email template: ${response.status} ${response.statusText}`, errorBody);

    // Provide more helpful error message for 404
    if (response.status === 404) {
      throw new Error('Backend API endpoint not found. Please ensure the backend service is running and the promotion email template endpoints are implemented.');
    }

    throw new Error(`Failed to create promotion email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update an existing promotion email template
 */
export async function updatePromotionEmailTemplateServer(
  id: number,
  formData: Partial<PromotionEmailTemplateFormDTO>
): Promise<PromotionEmailTemplateDTO> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${id}`;

  const now = new Date().toISOString();
  const payload = withTenantId({
    ...formData,
    id,
    updatedAt: now,
    // Ensure templateType is always present for promotion emails
    templateType: formData.templateType || 'EVENT_PROMOTION',
    // Explicitly include fromEmail if provided to ensure it's sent to backend
    ...(formData.fromEmail !== undefined && { fromEmail: formData.fromEmail }),
    // Footer HTML is hidden, pass as null
    footerHtml: null,
  });

  console.log('[DEBUG] Updating promotion email template with payload:', payload);
  if (!payload.tenantId) throw new Error('tenantId missing from payload');

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error updating promotion email template: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to update promotion email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a promotion email template
 */
export async function deletePromotionEmailTemplateServer(id: number): Promise<void> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error deleting promotion email template: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to delete promotion email template. Status: ${response.status}`);
  }

  // DELETE requests typically return 204 No Content, so no need to parse JSON
  if (response.status !== 204 && response.status !== 200) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
}

/**
 * Send a test email using a template
 */
export async function sendTestEmailServer(
  templateId: number,
  recipientEmail: string
): Promise<{ success: boolean; messageId?: string }> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-test`;

  const payload = {
    recipientEmail,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error sending test email: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send test email. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send bulk emails using a template
 */
export async function sendBulkEmailServer(
  templateId: number,
  recipientEmails?: string[]
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-bulk`;

  const payload: any = {};
  if (recipientEmails && recipientEmails.length > 0) {
    payload.recipientEmails = recipientEmails;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error sending bulk email: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send bulk email. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send emails to all subscribed members using a template
 */
export async function sendBulkEmailToSubscribedMembersServer(
  templateId: number
): Promise<{ success: boolean; sentCount?: number; failedCount?: number }> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-to-subscribed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error sending email to subscribed members: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send email to subscribed members. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch promotion email sent logs with optional filtering
 */
export async function fetchPromotionEmailSentLogsServer(params?: {
  eventId?: number;
  templateId?: number;
  sentAtGreaterThanOrEqual?: string;
  sentAtLessThanOrEqual?: string;
  emailStatus?: 'SENT' | 'FAILED' | 'BOUNCED';
  sort?: string;
  page?: number;
  size?: number;
}): Promise<{ logs: PromotionEmailSentLogDTO[]; totalCount: number }> {
  const baseUrl = getAppUrl();
  const queryParams = new URLSearchParams();

  if (params?.eventId) {
    queryParams.append('eventId.equals', params.eventId.toString());
  }
  if (params?.templateId) {
    queryParams.append('templateId.equals', params.templateId.toString());
  }
  if (params?.sentAtGreaterThanOrEqual) {
    queryParams.append('sentAt.greaterThanOrEqual', params.sentAtGreaterThanOrEqual);
  }
  if (params?.sentAtLessThanOrEqual) {
    queryParams.append('sentAt.lessThanOrEqual', params.sentAtLessThanOrEqual);
  }
  if (params?.emailStatus) {
    queryParams.append('emailStatus.equals', params.emailStatus);
  }
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.size !== undefined) {
    queryParams.append('size', params.size.toString());
  }

  const url = `${baseUrl}/api/proxy/promotion-email-sent-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error fetching promotion email sent logs: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to fetch promotion email sent logs. Status: ${response.status}`);
  }

  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);
  const logs = await response.json();

  return { logs, totalCount };
}

/**
 * Upload promotional email header image (client-side function)
 * Note: This must be called from client components, not server actions
 */
export async function uploadPromotionalEmailHeaderImageClient(
  eventId: number,
  promotionId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('eventId', eventId.toString());
  formData.append('promotionId', promotionId.toString());

  if (title) {
    formData.append('title', title);
  }
  if (description) {
    formData.append('description', description);
  }

  const url = `${baseUrl}/api/proxy/event-medias/upload/promotional-email-header-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading header image: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload header image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url || result.mediaUrl || '',
    mediaId: result.id || 0,
  };
}

/**
 * Upload promotional email footer image (client-side function)
 * Note: This must be called from client components, not server actions
 */
export async function uploadPromotionalEmailFooterImageClient(
  eventId: number,
  promotionId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('eventId', eventId.toString());
  formData.append('promotionId', promotionId.toString());

  if (title) {
    formData.append('title', title);
  }
  if (description) {
    formData.append('description', description);
  }

  const url = `${baseUrl}/api/proxy/event-medias/upload/promotional-email-footer-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading footer image: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload footer image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url || result.mediaUrl || '',
    mediaId: result.id || 0,
  };
}

