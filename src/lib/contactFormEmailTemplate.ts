/**
 * Build HTML for contact-form emails with optional header / body / footer images.
 * Mirrors the newsletter email template layout (~600px email width).
 */

export interface ContactFormEmailTemplateInput {
  firstName: string;
  lastName: string;
  senderEmail: string;
  message: string;
  headerImageUrl?: string;
  bodyImageUrls?: string[];
  footerImageUrl?: string;
  /** Defaults to "New contact form message" */
  title?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function imgBlock(url: string, alt: string, maxWidth = 600): string {
  const safeUrl = escapeHtml(url.trim());
  const safeAlt = escapeHtml(alt);
  return `<p style="text-align:center;margin:16px 0;"><img src="${safeUrl}" alt="${safeAlt}" width="${maxWidth}" style="max-width:100%;width:${maxWidth}px;height:auto;display:block;margin:0 auto;border:0;" /></p>`;
}

/** Convert plain-text message into simple HTML paragraphs. */
export function formatMessageAsHtml(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para
        .split('\n')
        .map((line) => escapeHtml(line))
        .join('<br />');
      return `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#333;">${lines}</p>`;
    })
    .join('');
}

/**
 * Compose a full contact-form email HTML body with header, message, body images, and footer.
 */
export function buildContactFormEmailHtml(input: ContactFormEmailTemplateInput): string {
  const displayName = [input.firstName, input.lastName === 'N/A' ? '' : input.lastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ');

  const header = input.headerImageUrl?.trim()
    ? imgBlock(input.headerImageUrl, 'Email header')
    : '';

  const bodyImages = (input.bodyImageUrls || [])
    .filter((u) => u?.trim())
    .map((u, i) => imgBlock(u, `Message image ${i + 1}`))
    .join('');

  const footer = input.footerImageUrl?.trim()
    ? imgBlock(input.footerImageUrl, 'Email footer')
    : '';

  const messageHtml = formatMessageAsHtml(input.message);
  const title = (input.title || 'New contact form message').trim();

  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#333;">
${header}
  <div style="padding:24px 20px;">
    <h2 style="color:#1a237e;margin:0 0 16px;font-size:20px;">${escapeHtml(title)}</h2>
    <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong>From:</strong> ${escapeHtml(displayName || 'Visitor')}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;"><strong>Email:</strong> ${escapeHtml(input.senderEmail)}</p>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;">
${messageHtml}
${bodyImages}
    </div>
  </div>
${footer}
</div>`;
}

/**
 * Upload an image for contact-form email sections via the public media proxy.
 */
export async function uploadContactFormEmailImage(
  file: File,
  title: string,
  description: string
): Promise<{ url: string; mediaId: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const queryParams = new URLSearchParams({
    title,
    description,
    isPublic: 'true',
  });

  const response = await fetch(
    `/api/proxy/event-medias/upload/newsletter-email-image?${queryParams.toString()}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[ContactForm] Image upload failed:', response.status, errorBody);
    throw new Error(`Failed to upload image. Status: ${response.status}`);
  }

  const result = (await response.json()) as Record<string, unknown>;
  const url = String(result.fileUrl || result.url || result.mediaUrl || '');
  if (!url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }

  return {
    url,
    mediaId: Number(result.id || 0),
  };
}
