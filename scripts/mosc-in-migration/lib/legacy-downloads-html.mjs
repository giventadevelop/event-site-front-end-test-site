/**
 * Shared helpers for parsing mosc.in downloads legacy HTML mirrors.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const ORIGIN = 'https://mosc.in';
export const EXT_RE = /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv)(\?|$)/i;

export function htmlDecode(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([a-f0-9]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

export function stripTags(text) {
  return htmlDecode(String(text || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function filenameFromUrl(url) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() || 'file.bin';
    return decodeURIComponent(seg);
  } catch {
    return 'file.bin';
  }
}

export function pageUrlFromLegacyPath(legacyRoot, htmlPath) {
  const rel = path.relative(legacyRoot, htmlPath).replace(/\\/g, '/');
  if (rel.endsWith('/index.html')) {
    return `${ORIGIN}/downloads/${rel.replace(/\/index\.html$/, '/')}`;
  }
  if (rel.endsWith('.html')) {
    return `${ORIGIN}/downloads/${rel}`;
  }
  return `${ORIGIN}/downloads/${rel}/`;
}

/** Fix relative links resolved from wrong base (…/downloads/uploads/ → …/uploads/). */
export function normalizeMoscFileUrl(url) {
  try {
    const u = new URL(url);
    if (u.pathname.includes('/downloads/uploads/')) {
      u.pathname = u.pathname.replace('/downloads/uploads/', '/uploads/');
      return u.href.split('#')[0];
    }
  } catch {
    /* ignore */
  }
  return url;
}

export function toAbsoluteUrl(href, pageUrl) {
  try {
    const u = new URL(href, pageUrl);
    if (!u.hostname.endsWith('mosc.in')) return null;
    return u.href.split('#')[0];
  } catch {
    return null;
  }
}

export function yearFromUploadUrl(url) {
  const m = String(url).match(/\/uploads\/(\d{4})\//);
  if (m) return parseInt(m[1], 10);
  return new Date().getFullYear();
}

export function extractPageTitle(html) {
  const m = String(html).match(/<title>([^<]+)<\/title>/i);
  if (!m) return '';
  return stripTags(m[1].replace(/\s*\|\s*Malankara Orthodox Syrian Church.*/i, ''));
}

export function extractPageHeroImage(html, pageUrl) {
  const m = String(html).match(
    /<img\b[^>]*\bclass=["'][^"']*\bwp-post-image\b[^"']*["'][^>]*\bsrc=["']([^"']+)["']/i
  );
  if (!m) return null;
  const abs = toAbsoluteUrl(m[1], pageUrl);
  return abs && !EXT_RE.test(abs) ? abs : null;
}

export function extractFileLinksFromHtml(html, pageUrl) {
  const links = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    const label = stripTags(match[2]);
    const abs = normalizeMoscFileUrl(toAbsoluteUrl(href, pageUrl));
    if (!abs || !EXT_RE.test(abs)) continue;
    links.push({
      url: abs,
      label: label || filenameFromUrl(abs).replace(/\.[^.]+$/, ''),
    });
  }
  return links;
}

export function extractDownloadsSubpageLinks(html, pageUrl) {
  const out = new Set();
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const abs = toAbsoluteUrl(match[1], pageUrl);
    if (!abs) continue;
    try {
      const u = new URL(abs);
      if (
        u.hostname.endsWith('mosc.in') &&
        u.pathname.startsWith('/downloads/') &&
        u.pathname.length > '/downloads/'.length &&
        !/\.(css|js|xml|json|pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|jpg|jpeg|png|gif|webp)$/i.test(u.pathname)
      ) {
        out.add(u.href.replace(/\/index\.html$/, '/').replace(/\/$/, '') + '/');
      }
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

export function hierarchyPathFromLabel(label, filename, pageContext) {
  const clean = String(label || '').trim();
  if (clean && clean.length <= 200 && !/^download$/i.test(clean)) {
    return clean;
  }
  const stem = filename.replace(/\.[^.]+$/, '');
  if (pageContext) return `${pageContext} / ${stem}`;
  return stem;
}

export async function readHtmlFile(legacyRoot, pageDir) {
  const candidates = [
    path.join(legacyRoot, pageDir, 'index.html'),
    path.join(legacyRoot, `${pageDir}.html`),
  ];
  for (const htmlPath of candidates) {
    try {
      return { html: await readFile(htmlPath, 'utf8'), htmlPath };
    } catch {
      /* try next */
    }
  }
  return null;
}

export function pageDirFromLegacyPath(legacyRoot, htmlPath) {
  const rel = path.relative(legacyRoot, htmlPath).replace(/\\/g, '/');
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}
