import { formatAddressBlock } from '@/lib/formatAddress';
import { getPublicEmailBaseUrl, toPublicEmailUrl } from '@/lib/publicEmailLinks';
import type { TenantOrganizationDTO, TenantSettingsDTO } from '@/types';
import type { TenantOrganizationIdentity } from '@/lib/resolveTenantOrganizationIdentity';

const DEFAULT_LOGO_URL =
  'https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800';

const DEFAULT_ORG_NAME = 'Malayalees US Charity Organization';
const DEFAULT_DESCRIPTION =
  'Making a difference in communities worldwide through compassionate action and sustainable impact.';

export interface SiteFooterEmailOptions {
  organizationName?: string;
  description?: string;
  address?: string | null;
  email?: string;
  phone?: string;
  logoUrl?: string;
  homeUrl?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function linkRow(href: string, label: string, color = '#d1d5db'): string {
  return `<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;">
    <a href="${escapeHtml(href)}" style="color:${color};text-decoration:none;">${escapeHtml(label)}</a>
  </td></tr>`;
}

/**
 * Email-safe HTML matching the public site footer (table layout, ~600px wide).
 */
export function buildSiteFooterEmailHtml(options: SiteFooterEmailOptions = {}): string {
  const orgName = options.organizationName?.trim() || DEFAULT_ORG_NAME;
  const description = options.description?.trim() || DEFAULT_DESCRIPTION;
  const logoUrl = options.logoUrl?.trim() || DEFAULT_LOGO_URL;
  const baseUrl = getPublicEmailBaseUrl(options.homeUrl);
  const charityHome = baseUrl.endsWith('/charity-theme') ? baseUrl : `${baseUrl}/charity-theme`;
  const charityEvents = toPublicEmailUrl('/events', baseUrl);
  const charitySectionUrl = (section: string) =>
    `${charityHome}?scrollTo=${encodeURIComponent(section)}`;

  const addressBlock = options.address?.trim()
    ? options.address
        .split('\n')
        .map((line) => escapeHtml(line.trim()))
        .join('<br />')
    : '';

  const contactRows: string[] = [];
  if (addressBlock) {
    contactRows.push(
      `<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#9ca3af;">${addressBlock}</td></tr>`
    );
  }
  if (options.phone?.trim()) {
    const phone = options.phone.trim();
    contactRows.push(
      `<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
        <a href="tel:${phone.replace(/\s/g, '')}" style="color:#d1d5db;text-decoration:none;">${escapeHtml(phone)}</a>
      </td></tr>`
    );
  }
  if (options.email?.trim()) {
    const email = options.email.trim();
    contactRows.push(
      `<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
        <a href="mailto:${escapeHtml(email)}" style="color:#60a5fa;text-decoration:none;">${escapeHtml(email)}</a>
      </td></tr>`
    );
  }

  const year = new Date().getFullYear();

  return `<!-- Site footer (email-safe, max-width 600px) -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#111827;">
  <tr>
    <td style="padding:32px 24px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="50%" valign="top" style="padding:0 8px 16px 0;">
            <a href="${escapeHtml(charityHome)}" style="text-decoration:none;">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(orgName)}" width="150" height="48" style="display:block;height:48px;width:auto;max-width:150px;border:0;" />
            </a>
            <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9ca3af;">${escapeHtml(description)}</p>
          </td>
          <td width="50%" valign="top" style="padding:0 0 16px 8px;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;">Get in Touch</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${contactRows.join('\n              ')}
            </table>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top" style="padding:8px 8px 0 0;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;">Quick Links</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${linkRow(charityHome, 'Home')}
              ${linkRow(charitySectionUrl('about-us'), 'About Us')}
              ${linkRow(charitySectionUrl('causes'), 'Our Causes')}
              ${linkRow(charityEvents, 'Events')}
              ${linkRow(charitySectionUrl('contact'), 'Contact')}
            </table>
          </td>
          <td width="50%" valign="top" style="padding:8px 0 0 8px;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;">Ways to Help</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${linkRow(charitySectionUrl('donate'), 'Make a Donation', '#93c5fd')}
              ${linkRow(charitySectionUrl('volunteer'), 'Become a Volunteer', '#93c5fd')}
              ${linkRow(charitySectionUrl('fundraise'), 'Start a Fundraiser', '#93c5fd')}
              ${linkRow(charitySectionUrl('sponsor'), 'Corporate Sponsorship', '#93c5fd')}
              ${linkRow(charitySectionUrl('newsletter'), 'Newsletter Signup', '#93c5fd')}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="border-top:1px solid #1f2937;padding:20px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;text-align:center;">
            &copy; ${year} <a href="${escapeHtml(charityHome)}" style="color:#ffffff;text-decoration:none;">${escapeHtml(orgName)}</a>. All rights reserved. Making hope happen.
          </td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;text-align:center;">
            <a href="${escapeHtml(charityHome)}" style="color:#9ca3af;text-decoration:none;margin:0 8px;">Privacy Policy</a>
            <a href="${escapeHtml(charityHome)}" style="color:#9ca3af;text-decoration:none;margin:0 8px;">Terms of Service</a>
            <a href="${escapeHtml(charityHome)}" style="color:#9ca3af;text-decoration:none;margin:0 8px;">Accessibility</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function buildSiteFooterEmailHtmlFromTenant(
  settings: TenantSettingsDTO | null | undefined,
  organization: TenantOrganizationDTO | null | undefined,
  organizationIdentity: TenantOrganizationIdentity,
  homeUrl?: string
): string {
  const resolvedHome =
    homeUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    '';

  return buildSiteFooterEmailHtml({
    organizationName: organization?.organizationName || DEFAULT_ORG_NAME,
    description:
      organizationIdentity.description?.trim() ||
      settings?.description?.trim() ||
      DEFAULT_DESCRIPTION,
    address: formatAddressBlock(organizationIdentity),
    email: settings?.email?.trim() || organization?.contactEmail?.trim() || '',
    phone: settings?.phoneNumber?.trim() || organization?.contactPhone?.trim() || '',
    logoUrl: organization?.logoUrl?.trim() || DEFAULT_LOGO_URL,
    homeUrl: organizationIdentity.websiteUrl?.trim() || resolvedHome,
  });
}

/** Default example (static) for copy-to-clipboard when tenant data is not loaded yet. */
export const EXAMPLE_SITE_FOOTER_EMAIL_HTML = buildSiteFooterEmailHtml();
