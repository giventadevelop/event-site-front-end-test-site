const FALLBACK_PUBLIC_BASE_URL = 'https://www.mosc-temp.com';
const DEV_PORTS = new Set(['3000', '3001', '3002', '3003', '3004', '3005']);

function withHttps(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '0.0.0.0' || hostname.startsWith('127.');
}

function stripDevPort(url: URL): void {
  if (DEV_PORTS.has(url.port)) {
    url.port = '';
  }
}

function normalizeCharityThemeSectionUrl(url: URL): void {
  const section = url.hash.replace(/^#/, '').trim();
  if (!section || !url.pathname.replace(/\/$/, '').endsWith('/charity-theme')) {
    return;
  }

  const sectionMap: Record<string, string> = {
    about: 'about-us',
    'about-us': 'about-us',
    causes: 'causes',
    events: 'events',
    contact: 'contact',
    donate: 'donate',
    volunteer: 'volunteer',
    fundraise: 'fundraise',
    sponsor: 'sponsor',
    newsletter: 'newsletter',
    privacy: 'contact',
    terms: 'contact',
    accessibility: 'contact',
  };

  url.hash = '';
  url.searchParams.set('scrollTo', sectionMap[section] || section);
}

function normalizePublicBaseUrl(candidate?: string | null): string {
  const trimmed = candidate?.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(withHttps(trimmed));
    if (isLocalHost(url.hostname)) return '';
    url.hash = '';
    url.search = '';
    stripDevPort(url);
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function getPublicEmailBaseUrl(preferredBaseUrl?: string | null): string {
  const candidates = [
    preferredBaseUrl,
    process.env.AMPLIFY_NEXT_PUBLIC_EMAIL_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_EMAIL_PUBLIC_BASE_URL,
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AMPLIFY_NEXT_PUBLIC_CLERK_DOMAIN,
    process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePublicBaseUrl(candidate);
    if (normalized) return normalized;
  }

  return FALLBACK_PUBLIC_BASE_URL;
}

export function toPublicEmailUrl(pathOrUrl: string, preferredBaseUrl?: string | null): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed || /^(mailto:|tel:|sms:|cid:|data:|#)/i.test(trimmed)) {
    return trimmed;
  }

  const baseUrl = getPublicEmailBaseUrl(preferredBaseUrl);

  try {
    const absolute = new URL(withHttps(trimmed));
    if (!isLocalHost(absolute.hostname)) {
      stripDevPort(absolute);
      normalizeCharityThemeSectionUrl(absolute);
      return absolute.toString();
    }

    const publicBase = new URL(baseUrl);
    absolute.protocol = publicBase.protocol;
    absolute.host = publicBase.host;
    stripDevPort(absolute);
    normalizeCharityThemeSectionUrl(absolute);
    return absolute.toString();
  } catch {
    const relative = new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, baseUrl);
    stripDevPort(relative);
    normalizeCharityThemeSectionUrl(relative);
    return relative.toString();
  }
}

export function rewriteEmailHtmlLinksToPublic(
  html: string | null | undefined,
  preferredBaseUrl?: string | null
): string {
  if (!html) return '';

  return html.replace(/\bhref\s*=\s*(["'])(.*?)\1/gi, (_match, quote: string, href: string) => {
    const rewritten = toPublicEmailUrl(href, preferredBaseUrl);
    return `href=${quote}${rewritten}${quote}`;
  });
}
