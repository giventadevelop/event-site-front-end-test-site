/**
 * SalesIQ article title helpers — generic layout titles hurt Answer Bot retrieval.
 */

const SITE_TITLE_SUFFIX = /\s*\|\s*Malankara Orthodox Syrian Church\s*$/i;

const GENERIC_TITLE_EXACT = new Set([
  'Malankara Orthodox Syrian Church',
  'Untitled MOSC page',
]);

const GENERIC_TITLE_EXACT_ALSO = [
  'Official website of the Malankara Orthodox Syrian Church - Saint Thomas Christian Community',
  'Malankara Orthodox Syrian Church — redesigned experience. Subpages use the Syro site shell.',
];

export function isGenericSiteTitle(title) {
  const t = (title || '').trim();
  if (!t) return true;
  if (GENERIC_TITLE_EXACT.has(t)) return true;
  if (GENERIC_TITLE_EXACT_ALSO.includes(t)) return true;
  return false;
}

export function normalizeDocumentTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle.replace(SITE_TITLE_SUFFIX, '').trim();
}

/** First meaningful h1/h2 inside main HTML (Syro subpages). */
export function titleFromMainHtml(mainHtml) {
  if (!mainHtml) return null;
  for (const re of [
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*>([\s\S]*?)<\/h2>/i,
  ]) {
    const m = mainHtml.match(re);
    if (m?.[1]) {
      const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length >= 12 && !isGenericSiteTitle(text)) {
        return text.slice(0, 250);
      }
    }
  }
  return null;
}

/**
 * Derive a page-specific title from exported plain-text Content when CSV Title is generic.
 */
export function deriveTitleFromContent(content, sourceUrl = '') {
  if (!content) return null;
  const trimmed = content.trim();

  const beforeBreadcrumb = trimmed.match(
    /^(.{15,220}?)\s+(?:Home|Holy Synod|Catholicate|The Catholicate|Gallery|Administration|Dioceses|Saints|Directory|Photo Gallery|Faith And Teaching|Faith-Teaching)\s*\/\s*/i,
  );
  if (beforeBreadcrumb?.[1]) {
    const candidate = beforeBreadcrumb[1].trim();
    if (!isGenericSiteTitle(candidate)) return candidate.slice(0, 250);
  }

  const hhLead = trimmed.match(
    /^(H\.H\.\s+[^,]+(?:,\s*The\s+(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth)\s+[^/]+?))(?:\s+H\.H\.|\s+His Holiness|\s+Holy Synod|\s+Home|\s+The\s)/i,
  );
  if (hhLead?.[1]) return hhLead[1].trim().slice(0, 250);

  const holinessLead = trimmed.match(
    /^(His Holiness\s+[^,]+(?:,\s*The\s+[^,]+)?)(?:\s+was\s+|\s+His Holiness|\s+on\s+Friday|\s+on\s+Monday)/i,
  );
  if (holinessLead?.[1]) return holinessLead[1].trim().slice(0, 250);

  try {
    const parts = new URL(sourceUrl).pathname.split('/').filter(Boolean);
    const slug = parts[parts.length - 1] || '';
    if (parts.length === 1 && parts[0] === 'mosc-redesign') {
      return 'Malankara Orthodox Syrian Church — Home (Current Catholicos: Baselios Marthoma Mathews III)';
    }
    if (slug.includes('mathews-iii')) {
      return 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara';
    }
    if (slug.includes('paulose-ii')) {
      return 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara';
    }
  } catch {
    /* ignore */
  }

  const fromSlug = titleFromUrlSlug(sourceUrl);
  if (fromSlug && !isGenericSiteTitle(fromSlug)) return fromSlug;

  return null;
}

/** Human-readable title from the last URL path segment (fallback for generic layout titles). */
export function titleFromUrlSlug(sourceUrl) {
  try {
    const parts = new URL(sourceUrl).pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    if (parts.length === 1 && parts[0] === 'mosc-redesign') return null;
    const slug = parts[parts.length - 1];
    if (!slug || slug === 'mosc-redesign') return null;
    return slug
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .slice(0, 250);
  } catch {
    return null;
  }
}

export function resolveArticleTitle({ title, content, sourceUrl, mainHtml }) {
  let resolved = normalizeDocumentTitle(title);
  if (isGenericSiteTitle(resolved)) {
    resolved =
      titleFromMainHtml(mainHtml) ||
      deriveTitleFromContent(content, sourceUrl) ||
      titleFromUrlSlug(sourceUrl) ||
      resolved;
  }
  return (resolved || 'Untitled MOSC page').slice(0, 250);
}
