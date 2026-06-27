"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrlFromRequestHeaders, getTenantId, getApiBaseUrl } from '@/lib/env';
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
 * Fetch newsletter email templates with optional filtering
 */
export async function fetchNewsletterEmailTemplatesServer(params?: {
  eventId?: number;
  isActive?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<{ templates: PromotionEmailTemplateDTO[]; totalCount: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const queryParams = new URLSearchParams();

  // Always scope newsletter templates to NEWS_LETTER template type
  queryParams.append('templateType.equals', 'NEWS_LETTER');

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

  // IMPORTANT: Use the same backend resource as promotional emails; only templateType differs
  const url = `${baseUrl}/api/proxy/promotion-email-templates${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

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
    console.error(`[Server] Error fetching newsletter email templates: ${response.status} ${response.statusText}`, errorBody);
    throw new Error('Unable to load email templates. Please try again later.');
  }

  const totalCount = Number(response.headers.get('x-total-count')) || 0;
  const data = await response.json();
  const templates = Array.isArray(data) ? data : [];

  return { templates, totalCount };
}

/**
 * Fetch a single newsletter email template by ID
 */
export async function fetchNewsletterEmailTemplateServer(id: number): Promise<PromotionEmailTemplateDTO | null> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
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
    console.error(`[Server] Error fetching newsletter email template ${id}: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to fetch newsletter email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create a new newsletter email template
 */
export async function createNewsletterEmailTemplateServer(
  formData: PromotionEmailTemplateFormDTO
): Promise<PromotionEmailTemplateDTO> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
  const url = `${baseUrl}/api/proxy/promotion-email-templates`;

  // Remove id, createdAt, updatedAt - backend will set these
  const { id, createdAt, updatedAt, tenantId, ...cleanFormData } = formData as any;

  // Build payload with all required fields
  if (!formData.fromEmail || !formData.fromEmail.trim()) {
    throw new Error('fromEmail is required and cannot be empty');
  }

  const payload = {
    // Newsletter templates are not tied to a specific event; send null instead of 0/undefined
    eventId: formData.eventId ?? null,
    templateName: formData.templateName,
    // Newsletter templates are always NEWS_LETTER template type
    templateType: formData.templateType || 'NEWS_LETTER',
    subject: formData.subject,
    fromEmail: formData.fromEmail.trim(),
    bodyHtml: formData.bodyHtml,
    footerHtml: null,
    headerImageUrl: formData.headerImageUrl || '',
    footerImageUrl: formData.footerImageUrl || '',
    discountCodeId: formData.discountCodeId,
    isActive: formData.isActive !== undefined ? formData.isActive : true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Server] Error creating newsletter email template: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to create newsletter email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update an existing newsletter email template
 */
export async function updateNewsletterEmailTemplateServer(
  id: number,
  formData: Partial<PromotionEmailTemplateFormDTO>
): Promise<PromotionEmailTemplateDTO> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${id}`;

  const now = new Date().toISOString();
  const payload = withTenantId({
    ...formData,
    id,
    updatedAt: now,
    // Ensure templateType is always present for newsletter templates
    templateType: formData.templateType || 'NEWS_LETTER',
    // Always send eventId as null for newsletter templates (not event-scoped)
    eventId: formData.eventId ?? null,
    ...(formData.fromEmail !== undefined && { fromEmail: formData.fromEmail }),
    footerHtml: null,
  });

  if (!payload.tenantId) throw new Error('tenantId missing from payload');

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error updating newsletter email template: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to update newsletter email template. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a newsletter email template
 */
export async function deleteNewsletterEmailTemplateServer(id: number): Promise<void> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error deleting newsletter email template: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to delete newsletter email template. Status: ${response.status}`);
  }

  if (response.status !== 204 && response.status !== 200) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
}

/**
 * Send a test newsletter email using a template
 */
export async function sendTestNewsletterEmailServer(
  templateId: number,
  recipientEmail: string
): Promise<{ success: boolean; messageId?: string }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
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
    console.error(`[Server] Error sending test newsletter email: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send test newsletter email. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send bulk newsletter emails using a template
 */
export async function sendBulkNewsletterEmailServer(
  templateId: number,
  recipientEmails?: string[]
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
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
    console.error(`[Server] Error sending bulk newsletter email: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send bulk newsletter email. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send newsletter emails to all subscribed members using a template
 */
export async function sendBulkNewsletterEmailToSubscribedMembersServer(
  templateId: number
): Promise<{ success: boolean; sentCount?: number; failedCount?: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  // Use the same backend resource as promotional emails
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-to-subscribed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Server] Error sending newsletter email to subscribed members: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to send newsletter email to subscribed members. Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Upload newsletter email header image (client-side function)
 */
export async function uploadNewsletterEmailHeaderImageClient(
  eventId: number,
  newsletterId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('eventId', eventId.toString());
  formData.append('newsletterId', newsletterId.toString());

  if (title) {
    formData.append('title', title);
  }
  if (description) {
    formData.append('description', description);
  }

  // Reuse the promotional email header upload endpoint
  const url = `${baseUrl}/api/proxy/event-medias/upload/promotional-email-header-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading newsletter header image: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload newsletter header image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url || result.mediaUrl || '',
    mediaId: result.id || 0,
  };
}

/**
 * Upload newsletter email footer image (client-side function)
 */
export async function uploadNewsletterEmailFooterImageClient(
  eventId: number,
  newsletterId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('eventId', eventId.toString());
  formData.append('newsletterId', newsletterId.toString());

  if (title) {
    formData.append('title', title);
  }
  if (description) {
    formData.append('description', description);
  }

  // Reuse the promotional email footer upload endpoint
  const url = `${baseUrl}/api/proxy/event-medias/upload/promotional-email-footer-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading newsletter footer image: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload newsletter footer image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url || result.mediaUrl || '',
    mediaId: result.id || 0,
  };
}

