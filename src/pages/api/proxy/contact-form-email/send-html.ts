import type { NextApiRequest, NextApiResponse } from 'next';
import { sendContactFormHtmlEmail } from '@/lib/sendContactFormHtmlEmail';
import { CONTACT_FORM_EMAIL_TYPE } from '@/lib/contactForm';
import type { TenantEmailAddressDTO } from '@/types';

/**
 * Public contact-form HTML email sender.
 *
 * Saves composed HTML onto a newsletter shell template, then calls send-test
 * (same as /admin/newsletter-emails). send-test ignores bodyHtmlOverride — the
 * template body must be persisted first.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim() || 'N/A';
    const senderEmail = String(body.senderEmail || body.fromEmail || '').trim();
    const message = String(body.message || body.messageBody || '').trim();
    const headerImageUrl = String(body.headerImageUrl || '').trim();
    const footerImageUrl = String(body.footerImageUrl || '').trim();
    const bodyImageUrls = Array.isArray(body.bodyImageUrls)
      ? body.bodyImageUrls.map((u: unknown) => String(u || '').trim()).filter(Boolean)
      : [];
    const emailType = (body.emailType || CONTACT_FORM_EMAIL_TYPE) as TenantEmailAddressDTO['emailType'];

    if (!firstName || firstName.length < 1) {
      res.status(400).json({ error: 'firstName is required' });
      return;
    }
    if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      res.status(400).json({ error: 'A valid senderEmail is required' });
      return;
    }
    if (!message || message.length < 10) {
      res.status(400).json({ error: 'message must be at least 10 characters' });
      return;
    }

    // Reject accidental HTML-as-messageBody from older clients — we compose HTML server-side.
    if (/<\s*div[\s>]|<\s*img[\s>]/i.test(message) && message.includes('New contact form message')) {
      res.status(400).json({
        error:
          'Send plain message text with optional image URLs. Do not put pre-built HTML in message.',
      });
      return;
    }

    const result = await sendContactFormHtmlEmail({
      firstName,
      lastName,
      senderEmail,
      message,
      headerImageUrl: headerImageUrl || undefined,
      bodyImageUrls,
      footerImageUrl: footerImageUrl || undefined,
      emailType,
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      ...result,
    });
  } catch (err) {
    console.error('[contact-form-email/send-html]', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to send contact form email',
    });
  }
}
