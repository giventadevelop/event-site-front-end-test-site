/**
 * SalesIQ article text cleanup — mojibake repair, generic meta skip, content scrubbing.
 */

const GENERIC_META_PATTERNS = [
  /^Official website of the Malankara Orthodox Syrian Church/i,
  /^Malankara Orthodox Syrian Church\s*[—–-]\s*redesigned experience/i,
];

/** UTF-8 punctuation misread as Windows-1252 (â€" / â€" etc.). */
const MOJIBAKE_REPLACEMENTS = [
  ['\u00E2\u20AC\u201C', '\u2013'], // en dash (E2 80 93)
  ['\u00E2\u20AC\u201D', '\u2014'], // em dash (E2 80 94)
  ['\u00E2\u20AC\u02DC', '\u2018'], // left single quote (E2 80 98)
  ['\u00E2\u20AC\u2122', '\u2019'], // right single quote (E2 80 99)
  ['\u00E2\u20AC\u2026', '\u2026'],
  ['\u00C2\u00A0', ' '],
  ['\u00C2 ', ' '],
  ['\u00C2', ''],
];

const SITE_CHROME_TAIL_RE =
  /\s*(?:View on Map|Key Projects and Institutions)\s*(?:Kalpana Downloads|Downloads Institutions|Institutions Training).*$/i;

export function isGenericMetaDescription(description) {
  const d = (description || '').trim();
  if (!d) return true;
  return GENERIC_META_PATTERNS.some((re) => re.test(d));
}

export function decodeHtmlEntitiesExtended(text) {
  if (!text) return '';
  return String(text)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}

export function fixUtf8Mojibake(text) {
  if (text == null || text === '') return '';
  let s = String(text);
  if (!/[\u00C2\u00E2\u20AC]/.test(s)) return s;

  for (const [from, to] of MOJIBAKE_REPLACEMENTS) {
    if (s.includes(from)) s = s.split(from).join(to);
  }

  // Legacy literal sequences (copy-paste / double-encoding)
  s = s
    .replace(/â€"/g, '\u2014')
    .replace(/â€"/g, '\u2013')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â€¦/g, '\u2026');

  return s.replace(/\u00A0/g, ' ');
}

export function sanitizeTextField(text) {
  return fixUtf8Mojibake(decodeHtmlEntitiesExtended(text)).replace(/\s+/g, ' ').trim();
}

/**
 * Remove breadcrumb/title repetition and site chrome from exported plain text.
 */
export function scrubArticleContent(content, title = '') {
  let c = sanitizeTextField(content || '');
  const fixedTitle = sanitizeTextField(title || '');

  if (fixedTitle && c.toLowerCase().startsWith(fixedTitle.toLowerCase())) {
    let remainder = c.slice(fixedTitle.length).trimStart();

    const sectionSlash = remainder.match(/^(\S+(?:\s+\S+)*)\s*\/\s*/);
    if (sectionSlash) {
      remainder = remainder.slice(sectionSlash[0].length).trimStart();
    }

    if (remainder.toLowerCase().startsWith(fixedTitle.toLowerCase())) {
      remainder = remainder.slice(fixedTitle.length).trimStart();
    }

    if (remainder.toLowerCase().startsWith(fixedTitle.toLowerCase())) {
      remainder = remainder.slice(fixedTitle.length).trimStart();
    }

    c = `${fixedTitle} ${remainder}`.trim();
  }

  c = c.replace(SITE_CHROME_TAIL_RE, '').trim();
  return c.replace(/\s+/g, ' ').trim();
}

/**
 * Prefer page-specific lead text over site-wide meta description.
 */
export function deriveDescription({ description, content, title }) {
  const fixedDesc = sanitizeTextField(description || '');
  if (fixedDesc && !isGenericMetaDescription(fixedDesc)) {
    return fixedDesc.slice(0, 500);
  }

  const scrubbed = scrubArticleContent(content, title);
  let lead = scrubbed;
  if (title && lead.toLowerCase().startsWith(title.toLowerCase())) {
    lead = lead.slice(title.length).trimStart();
  }

  const sentence = lead.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  if (sentence && sentence.length >= 40 && !isGenericMetaDescription(sentence)) {
    return sentence.slice(0, 500);
  }

  const snippet = lead.slice(0, 280).trim();
  return snippet.length > 280 ? `${snippet.slice(0, 277)}…` : snippet;
}

/** Append URL path hint when the same title appears more than once in the CSV. */
export function disambiguateDuplicateTitle(title, sourceUrl, seenCounts) {
  const base = sanitizeTextField(title || '');
  if (!base) return base;

  const key = base.toLowerCase();
  const count = seenCounts.get(key) || 0;
  seenCounts.set(key, count + 1);
  if (count === 0) return base;

  try {
    const parts = new URL(sourceUrl).pathname.split('/').filter(Boolean);
    const parent = parts[parts.length - 2] || '';
    const slug = parts[parts.length - 1] || 'page';
    const label = [parent, slug]
      .filter(Boolean)
      .map((seg) =>
        seg
          .split('-')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      )
      .join(' — ');
    return `${base} (${label})`.slice(0, 250);
  } catch {
    return `${base} (${count + 1})`.slice(0, 250);
  }
}

export function sanitizeArticleRecord(record) {
  const title = sanitizeTextField(record.Title || '');
  const content = scrubArticleContent(record.Content || '', title);
  const description = deriveDescription({
    description: record.Description,
    content,
    title,
  });

  return {
    ...record,
    Title: title,
    Content: content,
    Description: description,
  };
}
