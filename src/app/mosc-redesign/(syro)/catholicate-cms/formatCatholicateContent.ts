/**
 * Helpers for catholicate CMS detail/sidebar display.
 * Many Strapi bodies start with two paragraphs: role title, then year range.
 */

import type { CatholicateEntry } from './types';

const YEAR_RANGE_RE = /^\d{3,4}\s*[–—-]\s*(?:\d{3,4}|present)$/i;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function takeLeadingParagraphs(
  html: string,
  count: number
): { paragraphs: { full: string; inner: string; text: string }[]; rest: string } {
  const paragraphs: { full: string; inner: string; text: string }[] = [];
  let remaining = html.trim();

  while (paragraphs.length < count) {
    const match = remaining.match(/^(\s*<p\b[^>]*>[\s\S]*?<\/p>)/i);
    if (!match) break;
    const full = match[1];
    const inner = full.replace(/^\s*<p\b[^>]*>/i, '').replace(/<\/p>\s*$/i, '');
    paragraphs.push({ full, inner, text: stripHtml(inner) });
    remaining = remaining.slice(full.length);
  }

  return { paragraphs, rest: remaining };
}

/**
 * Remove a leading h1/h2 when it duplicates a title already rendered on the page
 * (common on intro entries where Strapi body repeats `entry.name`).
 */
export function stripLeadingDuplicateHeading(
  html: string | null,
  title: string | null | undefined
): string | null {
  if (!html?.trim() || !title?.trim()) return html;

  const source = html.trim();
  const match = source.match(/^(\s*<h[12]\b[^>]*>[\s\S]*?<\/h[12]>)/i);
  if (!match) return html;

  if (normalizeTitle(stripHtml(match[1])) !== normalizeTitle(title)) {
    return html;
  }

  return source.slice(match[1].length).replace(/^\s+/, '');
}

export function extractCatholicateLeadFromBody(body: string | null | undefined): {
  title: string | null;
  years: string | null;
} {
  if (!body?.trim()) return { title: null, years: null };
  const { paragraphs } = takeLeadingParagraphs(body, 2);
  if (paragraphs.length < 2) return { title: paragraphs[0]?.text ?? null, years: null };
  const years = paragraphs[1].text;
  if (!YEAR_RANGE_RE.test(years)) return { title: paragraphs[0].text, years: null };
  return { title: paragraphs[0].text, years };
}

/**
 * Merge leading role + years paragraphs into one line with years in parentheses.
 * e.g. `<p><strong>Title</strong></p><p><em>1925–1928</em></p>`
 *   → `<p><strong>Title</strong> (1925–1928)</p>`
 */
export function formatCatholicateBodyHtml(html: string | null): string | null {
  if (!html?.trim()) return html;

  const source = html.trim();
  const { paragraphs, rest } = takeLeadingParagraphs(source, 2);
  if (paragraphs.length < 2) return html;

  const years = paragraphs[1].text;
  if (!YEAR_RANGE_RE.test(years)) return html;

  const titleText = paragraphs[0].text;
  if (/\(\d{3,4}/.test(titleText)) {
    return `<p>${paragraphs[0].inner}</p>${rest}`;
  }

  return `<p>${paragraphs[0].inner} (${years})</p>${rest}`;
}

/**
 * Sidebar label matching hub card style: "Name, Role (years)" when name is short.
 */
export function getCatholicateSidebarLabel(entry: CatholicateEntry): string {
  const name = entry.name.trim();
  if (/\(\d{3,4}/.test(name) || /catholicos of the east/i.test(name)) {
    return name;
  }

  const fromBody = extractCatholicateLeadFromBody(entry.body);
  const role = entry.subtitle?.trim() || fromBody.title;
  const years = fromBody.years;

  if (role && years) return `${name}, ${role} (${years})`;
  if (role) return `${name}, ${role}`;
  if (years) return `${name} (${years})`;
  return name;
}
