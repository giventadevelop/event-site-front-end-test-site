"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrlFromRequestHeaders, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { rewriteEmailHtmlLinksToPublic } from '@/lib/publicEmailLinks';
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

/** Backend ignores null/empty on merge-patch for these fields; use PUT with "". */
function normalizeClearableString(value: string | null | undefined): string {
  if (value == null) return '';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
}

function buildNewsletterTemplatePutPayload(
  id: number,
  existing: PromotionEmailTemplateDTO,
  formData: Partial<PromotionEmailTemplateFormDTO>
): Record<string, unknown> {
  const hasEventId =
    formData.eventId !== undefined
      ? formData.eventId != null && formData.eventId > 0
      : existing.eventId != null && existing.eventId > 0;

  const payload: Record<string, unknown> = withTenantId({
    ...existing,
    ...formData,
    id,
    updatedAt: new Date().toISOString(),
    templateType: formData.templateType || existing.templateType || 'NEWS_LETTER',
    eventId: hasEventId
      ? (formData.eventId !== undefined ? formData.eventId : existing.eventId)
      : null,
    fromEmail:
      formData.fromEmail !== undefined
        ? formData.fromEmail
        : existing.fromEmail,
  });

  if (formData.footerHtml !== undefined) {
    payload.footerHtml = rewriteEmailHtmlLinksToPublic(normalizeClearableString(formData.footerHtml));
  }
  if (formData.headerImageUrl !== undefined) {
    payload.headerImageUrl = normalizeClearableString(formData.headerImageUrl);
  }
  if (formData.footerImageUrl !== undefined) {
    payload.footerImageUrl = normalizeClearableString(formData.footerImageUrl);
  }

  delete payload.event;
  delete payload.discountCode;
  delete payload.createdBy;

  return payload;
}

async function ensureNewsletterFooterLinksArePublic(templateId: number): Promise<void> {
  const apiBase = getApiBaseUrl();
  const templateUrl = `${apiBase}/api/promotion-email-templates/${templateId}`;

  const getResponse = await fetchWithJwtRetry(
    templateUrl,
    { cache: 'no-store' },
    'newsletter-email-footer-link-fetch'
  );
  if (!getResponse.ok) {
    const errorBody = await getResponse.text();
    throw new Error(`Failed to load newsletter template before sending. Status: ${getResponse.status}. ${errorBody}`);
  }

  const template = (await getResponse.json()) as PromotionEmailTemplateDTO;
  const currentFooterHtml = normalizeClearableString(template.footerHtml);
  const rewrittenFooterHtml = rewriteEmailHtmlLinksToPublic(currentFooterHtml);

  if (currentFooterHtml === rewrittenFooterHtml) {
    return;
  }

  const payload = buildNewsletterTemplatePutPayload(templateId, template, {
    footerHtml: rewrittenFooterHtml,
  });

  const putResponse = await fetchWithJwtRetry(
    templateUrl,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
    'newsletter-email-footer-link-update'
  );

  if (!putResponse.ok) {
    const errorBody = await putResponse.text();
    throw new Error(`Failed to update newsletter footer links before sending. Status: ${putResponse.status}. ${errorBody}`);
  }
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
    footerHtml: formData.footerHtml?.trim()
      ? rewriteEmailHtmlLinksToPublic(formData.footerHtml)
      : null,
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
  const apiBase = getApiBaseUrl();
  const getUrl = `${apiBase}/api/promotion-email-templates/${id}`;

  const getResponse = await fetchWithJwtRetry(getUrl, { cache: 'no-store' });
  if (!getResponse.ok) {
    const errorBody = await getResponse.text();
    console.error(
      `[Server] Error loading newsletter email template ${id} before update: ${getResponse.status}`,
      errorBody
    );
    throw new Error(`Failed to load newsletter email template before update. Status: ${getResponse.status}`);
  }

  const existing = (await getResponse.json()) as PromotionEmailTemplateDTO;
  const payload = buildNewsletterTemplatePutPayload(id, existing, formData);

  if (!payload.tenantId) throw new Error('tenantId missing from payload');

  // Backend merge-patch ignores clearing headerImageUrl/footerImageUrl/footerHtml; PUT with "" works.
  const response = await fetchWithJwtRetry(getUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
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
  await ensureNewsletterFooterLinksArePublic(templateId);

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
  await ensureNewsletterFooterLinksArePublic(templateId);

  const baseUrl = await getAppUrlFromRequestHeaders();
  const hasExplicitRecipients = Array.isArray(recipientEmails) && recipientEmails.length > 0;
  // The send-bulk endpoint requires explicit recipients. The page-level bulk
  // button does not collect recipients, so default it to the subscribed list.
  const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/${
    hasExplicitRecipients ? 'send-bulk' : 'send-to-subscribed'
  }`;

  const payload: any = {};
  if (hasExplicitRecipients) {
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

  const result = await response.json();
  return {
    success: Boolean(result.success ?? true),
    sentCount: Number(result.sentCount ?? 0),
    failedCount: Number(result.failedCount ?? 0),
  };
}

/**
 * Send newsletter emails to all subscribed members using a template
 */
export async function sendBulkNewsletterEmailToSubscribedMembersServer(
  templateId: number
): Promise<{ success: boolean; sentCount?: number; failedCount?: number }> {
  await ensureNewsletterFooterLinksArePublic(templateId);

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

function parseUploadedImageResult(result: Record<string, unknown>): { url: string; mediaId: number } {
  const url = String(
    result.fileUrl ||
      result.url ||
      result.mediaUrl ||
      result.emailFooterImageUrl ||
      result.emailHeaderImageUrl ||
      ''
  );
  return {
    url,
    mediaId: Number(result.id || 0),
  };
}

async function postNewsletterImageUpload(
  uploadUrl: string,
  file: File,
  errorLabel: string
): Promise<{ url: string; mediaId: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading ${errorLabel}: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload ${errorLabel}. Status: ${response.status}`);
  }

  const result = (await response.json()) as Record<string, unknown>;
  return parseUploadedImageResult(result);
}

/**
 * Upload newsletter email header image (server action invoked from client)
 */
export async function uploadNewsletterEmailHeaderImageClient(
  eventId: number | null | undefined,
  _newsletterId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const hasEvent = eventId != null && eventId > 0;
  const imageTitle = title || 'Newsletter Email Header Image';
  const imageDescription = description || 'Newsletter email header image';

  const queryParams = new URLSearchParams({
    tenantId: getTenantId(),
    title: imageTitle,
    description: imageDescription,
    isPublic: 'true',
  });

  const uploadPath = hasEvent
    ? 'email-header-image'
    : 'newsletter-email-image';

  if (hasEvent) {
    queryParams.set('eventId', String(eventId));
  }

  const url = `${baseUrl}/api/proxy/event-medias/upload/${uploadPath}?${queryParams.toString()}`;
  return postNewsletterImageUpload(url, file, 'newsletter header image');
}

/**
 * Upload newsletter email footer image (server action invoked from client)
 */
export async function uploadNewsletterEmailFooterImageClient(
  eventId: number | null | undefined,
  _newsletterId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const hasEvent = eventId != null && eventId > 0;
  const imageTitle = title || 'Newsletter Email Footer Image';
  const imageDescription = description || 'Newsletter email footer image';

  const queryParams = new URLSearchParams({
    tenantId: getTenantId(),
    title: imageTitle,
    description: imageDescription,
    isPublic: 'true',
  });

  const uploadPath = hasEvent
    ? 'email-header-image'
    : 'newsletter-email-image';

  if (hasEvent) {
    queryParams.set('eventId', String(eventId));
  }

  const url = `${baseUrl}/api/proxy/event-medias/upload/${uploadPath}?${queryParams.toString()}`;
  return postNewsletterImageUpload(url, file, 'newsletter footer image');
}

/**
 * Upload newsletter email body image (embedded in body HTML only — does not set headerImageUrl)
 */
export async function uploadNewsletterEmailBodyImageClient(
  file: File,
  title?: string,
  description?: string
): Promise<{ url: string; mediaId: number }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const queryParams = new URLSearchParams({
    tenantId: getTenantId(),
    title: title || 'Newsletter Email Body Image',
    description: description || 'Newsletter email body image',
    isPublic: 'true',
  });

  const url = `${baseUrl}/api/proxy/event-medias/upload/newsletter-email-image?${queryParams.toString()}`;
  return postNewsletterImageUpload(url, file, 'newsletter body image');
}

