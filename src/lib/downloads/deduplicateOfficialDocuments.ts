export type OfficialDocumentDedupeItem = {
  id: number | null;
  fileUrl: string | null;
  treePath: string;
  fileName: string;
  officialDocumentCategoryId: number | null;
  priorityRanking: number;
};

function normalizeStoragePath(url: string | null | undefined): string {
  if (!url) return '';
  return url.split('?')[0].trim().toLowerCase();
}

function normalizeLogicalFileName(name: string | null | undefined): string {
  const base = String(name || '').trim();
  if (!base) return '';
  return base.replace(/_\d{10,}_[a-f0-9]{6,}(?=\.[^.]+$)/i, '').toLowerCase();
}

/** Stable key for collapsing duplicate uploads of the same file. */
export function getOfficialDocumentDedupeKey(item: {
  fileUrl: string | null;
  treePath: string;
  fileName: string;
  officialDocumentCategoryId: number | null;
}): string {
  const categoryId = item.officialDocumentCategoryId ?? 0;
  const tree = item.treePath.trim().toLowerCase();
  if (categoryId && tree) {
    return `logical:${categoryId}:${tree}`;
  }

  const fileUrl = normalizeStoragePath(item.fileUrl);
  if (fileUrl) return `url:${fileUrl}`;

  const logicalName = normalizeLogicalFileName(item.fileName);
  return `meta:${categoryId}:${logicalName}`;
}

function shouldPreferCandidate<T extends OfficialDocumentDedupeItem>(candidate: T, incumbent: T): boolean {
  const candidatePriority = candidate.priorityRanking ?? 999999;
  const incumbentPriority = incumbent.priorityRanking ?? 999999;
  if (candidatePriority !== incumbentPriority) {
    return candidatePriority < incumbentPriority;
  }

  const candidateId = candidate.id ?? Number.MAX_SAFE_INTEGER;
  const incumbentId = incumbent.id ?? Number.MAX_SAFE_INTEGER;
  return candidateId < incumbentId;
}

/**
 * Collapse duplicate official-document rows (e.g. repeated migration uploads).
 * Keeps the lowest priorityRanking, then lowest id.
 */
export function deduplicateOfficialDocumentTreeItems<T extends OfficialDocumentDedupeItem>(
  items: T[]
): T[] {
  const seen = new Map<string, T>();
  const result: T[] = [];

  for (const item of items) {
    const key = getOfficialDocumentDedupeKey(item);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
      result.push(item);
      continue;
    }
    if (shouldPreferCandidate(item, existing)) {
      const index = result.indexOf(existing);
      if (index >= 0) {
        result[index] = item;
      }
      seen.set(key, item);
    }
  }

  return result;
}
