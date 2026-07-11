/**
 * Send contact-form emails as rendered HTML (same pipeline as newsletter test emails).
 *
 * The backend `/api/contact-form-email/send` endpoint treats messageBody as plain text
 * (escapes HTML) and wraps it with the tenant emailHeaderImageUrl.
 *
 * Newsletter send-test only reads the *saved* template (recipientEmail only — overrides
 * like bodyHtmlOverride are ignored). So we PUT the full HTML onto a shell template,
 * clear header/footer image URLs, then call send-test.
 */

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import {
  buildContactFormEmailHtml,
  type ContactFormEmailTemplateInput,
} from '@/lib/contactFormEmailTemplate';
import type { PromotionEmailTemplateDTO, TenantEmailAddressDTO } from '@/types';
import { CONTACT_FORM_EMAIL_TYPE } from '@/lib/contactForm';

const SHELL_TEMPLATE_NAME = '__CONTACT_FORM_HTML_SHELL__';

/** 1x1 transparent GIF — used only if the backend refuses to clear headerImageUrl to "". */
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export interface SendContactFormHtmlEmailInput {
  firstName: string;
  lastName: string;
  senderEmail: string;
  message: string;
  headerImageUrl?: string;
  bodyImageUrls?: string[];
  footerImageUrl?: string;
  emailType?: TenantEmailAddressDTO['emailType'];
}

export interface SendContactFormHtmlEmailResult {
  success: boolean;
  adminRecipient?: string;
  senderRecipient?: string;
  templateId?: number;
}

function getApiBase() {
  return getApiBaseUrl();
}

function stripRelations(payload: Record<string, unknown>) {
  delete payload.event;
  delete payload.discountCode;
  delete payload.createdBy;
  return payload;
}

async function fetchContactEmailAddress(
  emailType: TenantEmailAddressDTO['emailType']
): Promise<TenantEmailAddressDTO | null> {
  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());
  params.append('emailType.equals', emailType);
  params.append('isActive.equals', 'true');
  params.append('size', '20');
  params.append('sort', 'isDefault,desc');

  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/tenant-email-addresses?${params.toString()}`,
    { cache: 'no-store' },
    'contact-form-html-tenant-emails'
  );

  if (!res.ok) {
    console.error('[ContactFormHtml] Failed to load tenant emails:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const list: TenantEmailAddressDTO[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : [];

  if (list.length === 0) return null;
  return list.find((e) => e.isDefault) || list[0];
}

async function fetchTemplateById(id: number): Promise<PromotionEmailTemplateDTO | null> {
  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/promotion-email-templates/${id}`,
    { cache: 'no-store' },
    'contact-form-html-template-by-id'
  );
  if (!res.ok) return null;
  return (await res.json()) as PromotionEmailTemplateDTO;
}

async function findShellTemplate(): Promise<PromotionEmailTemplateDTO | null> {
  const envId = process.env.CONTACT_FORM_HTML_TEMPLATE_ID;
  if (envId && /^\d+$/.test(envId)) {
    const byId = await fetchTemplateById(Number(envId));
    if (byId) return byId;
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());
  params.append('templateType.equals', 'NEWS_LETTER');
  params.append('size', '100');

  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/promotion-email-templates?${params.toString()}`,
    { cache: 'no-store' },
    'contact-form-html-find-shell'
  );

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error('[ContactFormHtml] Failed to find shell template:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const list: PromotionEmailTemplateDTO[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : [];

  // Exact name match in JS — do not take list[0] if the name filter is unsupported.
  return list.find((t) => t.templateName === SHELL_TEMPLATE_NAME) || null;
}

async function createShellTemplate(fromEmail: string): Promise<PromotionEmailTemplateDTO> {
  const now = new Date().toISOString();
  const payload = withTenantId({
    eventId: null,
    templateName: SHELL_TEMPLATE_NAME,
    templateType: 'NEWS_LETTER',
    subject: 'Contact form message',
    fromEmail,
    bodyHtml: '<div></div>',
    footerHtml: '',
    headerImageUrl: '',
    footerImageUrl: '',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/promotion-email-templates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'contact-form-html-create-shell'
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create contact HTML shell template: ${res.status} ${body}`);
  }

  return (await res.json()) as PromotionEmailTemplateDTO;
}

async function ensureShellTemplate(fromEmail: string): Promise<PromotionEmailTemplateDTO> {
  const existing = await findShellTemplate();
  if (existing?.id) return existing;
  return createShellTemplate(fromEmail);
}

/**
 * Persist full email HTML on the shell template, then send-test uses that saved content.
 * Header/footer image URL fields must stay empty so the Kerala tenant banner is not prepended;
 * uploaded images are already inlined inside bodyHtml.
 */
async function putShellContent(params: {
  template: PromotionEmailTemplateDTO;
  fromEmail: string;
  subject: string;
  bodyHtml: string;
}): Promise<PromotionEmailTemplateDTO> {
  const { template, fromEmail, subject, bodyHtml } = params;
  if (!template.id) {
    throw new Error('Contact HTML shell template is missing an id');
  }

  const payload = stripRelations(
    withTenantId({
      ...template,
      id: template.id,
      fromEmail,
      subject,
      templateName: SHELL_TEMPLATE_NAME,
      templateType: 'NEWS_LETTER',
      eventId: null,
      bodyHtml,
      footerHtml: '',
      headerImageUrl: '',
      footerImageUrl: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
    }) as Record<string, unknown>
  );

  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/promotion-email-templates/${template.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'contact-form-html-put-shell'
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Failed to update contact HTML shell template: ${res.status} ${errBody}`);
  }

  let saved = (await res.json()) as PromotionEmailTemplateDTO;

  // If backend still keeps a stale header image (empty string ignored), force a transparent pixel.
  const staleHeader = (saved.headerImageUrl || '').trim();
  if (staleHeader) {
    console.warn('[ContactFormHtml] headerImageUrl still set after PUT; forcing transparent pixel', {
      headerImageUrl: staleHeader.slice(0, 120),
    });
    const clearPayload = stripRelations(
      withTenantId({
        ...saved,
        id: template.id,
        fromEmail,
        subject,
        templateName: SHELL_TEMPLATE_NAME,
        templateType: 'NEWS_LETTER',
        eventId: null,
        bodyHtml,
        footerHtml: '',
        headerImageUrl: TRANSPARENT_PIXEL,
        footerImageUrl: '',
        isActive: true,
        updatedAt: new Date().toISOString(),
      }) as Record<string, unknown>
    );

    const clearRes = await fetchWithJwtRetry(
      `${getApiBase()}/api/promotion-email-templates/${template.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clearPayload),
      },
      'contact-form-html-clear-header'
    );

    if (!clearRes.ok) {
      throw new Error(
        `Failed to clear shell headerImageUrl: ${clearRes.status} ${await clearRes.text()}`
      );
    }
    saved = (await clearRes.json()) as PromotionEmailTemplateDTO;
  }

  // Verify body was actually persisted (send-test only uses saved template fields).
  const verify = await fetchTemplateById(template.id);
  if (!verify) {
    throw new Error('Contact HTML shell template disappeared after update');
  }
  if (!(verify.bodyHtml || '').includes('font-family:Arial')) {
    throw new Error(
      'Contact HTML shell bodyHtml was not saved. Refusing to send an incomplete template email.'
    );
  }

  const headerAfter = (verify.headerImageUrl || '').trim();
  if (headerAfter && !headerAfter.startsWith('data:image/gif')) {
    // Still a real banner URL — would produce the Kerala-only email again.
    throw new Error(
      `Cannot clear promotion template headerImageUrl (still: ${headerAfter.slice(0, 80)}…). ` +
        'Update or delete the __CONTACT_FORM_HTML_SHELL__ newsletter template in admin, then retry.'
    );
  }

  return verify;
}

async function sendTestFromSavedTemplate(templateId: number, recipientEmail: string): Promise<void> {
  const res = await fetchWithJwtRetry(
    `${getApiBase()}/api/promotion-email-templates/${templateId}/send-test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
      }),
    },
    `contact-form-html-send-test-${templateId}`
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send HTML contact email to ${recipientEmail}: ${res.status} ${body}`);
  }
}

function buildThankYouHtml(input: ContactFormEmailTemplateInput): string {
  const messageWithThanks = `Thank you for contacting us. We received your message and will get back to you as soon as possible.\n\n---\n\nYour message:\n${input.message}`;
  return buildContactFormEmailHtml({
    ...input,
    title: 'We received your message',
    message: messageWithThanks,
  });
}

/**
 * Send rendered HTML contact emails to the tenant CONTACT inbox and the visitor.
 */
export async function sendContactFormHtmlEmail(
  input: SendContactFormHtmlEmailInput
): Promise<SendContactFormHtmlEmailResult> {
  const emailType = input.emailType || CONTACT_FORM_EMAIL_TYPE;
  const contactAddr = await fetchContactEmailAddress(emailType);

  if (!contactAddr?.emailAddress?.trim()) {
    throw new Error(
      `No active ${emailType} tenant email address configured. Add one under Admin → Tenant Email Addresses.`
    );
  }

  const fromEmail = contactAddr.emailAddress.trim();
  const adminRecipient =
    contactAddr.copyToEmailAddress?.trim() || contactAddr.emailAddress.trim();
  const senderRecipient = input.senderEmail.trim();

  const templateInput: ContactFormEmailTemplateInput = {
    firstName: input.firstName,
    lastName: input.lastName,
    senderEmail: senderRecipient,
    message: input.message,
    headerImageUrl: input.headerImageUrl,
    bodyImageUrls: input.bodyImageUrls,
    footerImageUrl: input.footerImageUrl,
  };

  const adminHtml = buildContactFormEmailHtml(templateInput);
  const senderHtml = buildThankYouHtml(templateInput);
  const displayName = [input.firstName, input.lastName === 'N/A' ? '' : input.lastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ');

  const shell = await ensureShellTemplate(fromEmail);
  if (!shell.id) {
    throw new Error('Contact HTML shell template is missing an id');
  }

  // Admin notification: persist full HTML, then send-test (no overrides).
  await putShellContent({
    template: shell,
    fromEmail,
    subject: `Contact form: ${displayName || 'Visitor'}`,
    bodyHtml: adminHtml,
  });
  await sendTestFromSavedTemplate(shell.id, adminRecipient);

  if (senderRecipient && senderRecipient.toLowerCase() !== adminRecipient.toLowerCase()) {
    const refreshed = (await fetchTemplateById(shell.id)) || shell;
    await putShellContent({
      template: refreshed,
      fromEmail,
      subject: 'We received your message',
      bodyHtml: senderHtml,
    });
    await sendTestFromSavedTemplate(shell.id, senderRecipient);
  }

  console.log('[ContactFormHtml] Sent HTML contact emails', {
    templateId: shell.id,
    adminRecipient,
    senderRecipient,
    bodyHtmlLength: adminHtml.length,
  });

  return {
    success: true,
    adminRecipient,
    senderRecipient,
    templateId: shell.id,
  };
}
