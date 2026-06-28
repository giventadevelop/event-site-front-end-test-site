/**
 * Search matching for downloads library explorer.
 */
import { formatDownloadCardTitle, getDownloadCardSubtitle } from './formatDownloadCardTitle';

export type DownloadSearchItem = {
  title: string;
  fileName: string;
  treePath?: string;
  pathSegments: string[];
  categoryLabel?: string | null;
  description?: string | null;
  officialDocumentYear?: number | null;
};

function buildDownloadCardMetaLine(item: DownloadSearchItem): string {
  return [item.categoryLabel, item.officialDocumentYear ? `Year ${item.officialDocumentYear}` : null]
    .filter(Boolean)
    .join(' · ');
}

export function normalizeDownloadSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[·•|/\\_,\-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildDownloadSearchHaystack(item: DownloadSearchItem): string {
  const formattedTitle = formatDownloadCardTitle(item.title?.trim() || item.fileName);
  const subtitle = getDownloadCardSubtitle({
    pathSegments: item.pathSegments,
    fileName: item.fileName,
    title: item.title,
    categoryLabel: item.categoryLabel,
  });
  const displayTitle = resolveDownloadCardDisplayTitle(item);
  const metaLine = buildDownloadCardMetaLine(item);

  return normalizeDownloadSearchText(
    [
      item.title,
      formattedTitle,
      displayTitle,
      item.fileName,
      item.treePath,
      ...item.pathSegments,
      subtitle,
      item.description ?? '',
      item.categoryLabel ?? '',
      metaLine,
      item.officialDocumentYear ? String(item.officialDocumentYear) : '',
      item.officialDocumentYear ? `year ${item.officialDocumentYear}` : '',
    ].join(' ')
  );
}

export function matchesDownloadSearchQuery(item: DownloadSearchItem, query: string): boolean {
  const haystack = buildDownloadSearchHaystack(item);
  const q = normalizeDownloadSearchText(query);
  if (!q) return true;
  if (haystack.includes(q)) return true;

  const tokens = q.split(' ').filter((token) => token.length >= 2 || /^\d{4}$/.test(token));
  if (tokens.length === 0) {
    return haystack.includes(q);
  }
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Prefer leaf hierarchy segment when stored title duplicates the category label.
 */
export function resolveDownloadCardDisplayTitle(item: DownloadSearchItem): string {
  const leafSegment =
    item.pathSegments.length > 0
      ? formatDownloadCardTitle(item.pathSegments[item.pathSegments.length - 1])
      : '';
  const fromTitle = item.title?.trim();
  const category = item.categoryLabel?.trim();

  if (
    fromTitle &&
    category &&
    fromTitle.toLowerCase() === category.toLowerCase() &&
    leafSegment
  ) {
    return leafSegment;
  }

  if (fromTitle && category && fromTitle.toLowerCase().includes('malankara association') && leafSegment) {
    const formattedLeaf = leafSegment.toLowerCase();
    const formattedTitle = formatDownloadCardTitle(fromTitle).toLowerCase();
    if (formattedTitle === category.toLowerCase() || formattedTitle.startsWith('malankara association')) {
      return leafSegment;
    }
    if (!formattedTitle.includes(formattedLeaf) && formattedLeaf.length > 2) {
      return leafSegment;
    }
  }

  return formatDownloadCardTitle(fromTitle || item.fileName);
}
