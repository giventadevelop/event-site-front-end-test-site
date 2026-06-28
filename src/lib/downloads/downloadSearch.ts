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

export function buildDownloadSearchHaystack(item: DownloadSearchItem): string {
  const formattedTitle = formatDownloadCardTitle(item.title?.trim() || item.fileName);
  const subtitle = getDownloadCardSubtitle({
    pathSegments: item.pathSegments,
    fileName: item.fileName,
    title: item.title,
    categoryLabel: item.categoryLabel,
  });

  return [
    item.title,
    formattedTitle,
    item.fileName,
    item.treePath,
    ...item.pathSegments,
    subtitle,
    item.description ?? '',
    item.categoryLabel ?? '',
    item.officialDocumentYear ? String(item.officialDocumentYear) : '',
  ]
    .join(' ')
    .toLowerCase();
}

export function matchesDownloadSearchQuery(item: DownloadSearchItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return buildDownloadSearchHaystack(item).includes(q);
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
