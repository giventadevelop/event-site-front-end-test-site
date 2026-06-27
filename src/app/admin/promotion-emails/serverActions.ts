"use server";
import { PromotionEmailRequestDTO } from '@/types';
import { withTenantId } from '@/lib/withTenantId';
import { getTenantId, getAppUrl, getEmailHostUrlPrefix } from '@/lib/env';

export async function sendPromotionEmailServer(form: Partial<PromotionEmailRequestDTO>) {
  // Trim and validate all required fields
  const to = (form.to || '').trim();
  const subject = (form.subject || '').trim();
  const promoCode = (form.promoCode || '').trim();
  const bodyHtml = (form.bodyHtml || '').trim();
  if (!to || !subject || !promoCode || !bodyHtml) {
    throw new Error('All fields (recipient email, subject, promo code, body HTML) are required.');
  }

  // Get the email host URL prefix for email context
  const emailHostUrlPrefix = getEmailHostUrlPrefix();

  // Explicitly set isTestEmail to ensure it's preserved
  const isTestEmailValue = form.isTestEmail === true;

  // Create payload without spreading form to avoid any potential overwrites
  const payload = withTenantId({
    tenantId: form.tenantId || "",
    to,
    subject,
    promoCode,
    bodyHtml,
    emailHostUrlPrefix,
    headerImagePath: form.headerImagePath || null,
    footerPath: form.footerPath || null,
    isTestEmail: isTestEmailValue,  // Explicit assignment at the end
    testEmail: isTestEmailValue,    // Try alternative naming in case Java expects this
  });

  // Debug logging
  console.log('SendPromotionEmailServer - form.isTestEmail:', form.isTestEmail);
  console.log('SendPromotionEmailServer - isTestEmailValue:', isTestEmailValue);
  console.log('SendPromotionEmailServer - payload before fetch:', JSON.stringify(payload, null, 2));
  console.log('SendPromotionEmailServer - payload.isTestEmail specifically:', payload.isTestEmail);
  const baseUrl = getAppUrl();
  const requestBody = JSON.stringify(payload);
  console.log('SendPromotionEmailServer - Final request body:', requestBody);

  const res = await fetch(`${baseUrl}/api/proxy/send-promotion-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg = 'Failed to send promotion email';
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}