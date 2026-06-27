import type { EventMediaDTO } from '@/types';

export const TREE_PATH_MARKER = '[[MOSC_TREE_PATH]]';
export const TREE_PRIORITY_MARKER = '[[MOSC_PRIORITY]]';
export const TREE_CATEGORY_LABEL_MARKER = '[[MOSC_CATEGORY_LABEL]]';

export function buildHierarchyDescription(input: {
  categoryLabel: string;
  treePath: string;
  priority?: number;
  userDescription?: string;
}): string {
  const lines: string[] = [];
  lines.push(`${TREE_CATEGORY_LABEL_MARKER} ${String(input.categoryLabel || '').trim()}`);
  lines.push(`${TREE_PATH_MARKER} ${String(input.treePath || '').trim()}`);
  if (typeof input.priority === 'number' && Number.isFinite(input.priority)) {
    lines.push(`${TREE_PRIORITY_MARKER} ${Math.max(0, Math.trunc(input.priority))}`);
  }
  const trailing = String(input.userDescription || '').trim();
  if (trailing) lines.push(trailing);
  return lines.join('\n');
}

export function parseHierarchyDescription(description?: string | null): {
  categoryLabel?: string;
  treePath?: string;
  priority?: number;
  cleanDescription: string;
} {
  const text = String(description || '');
  const rawLines = text.split(/\r?\n/);
  let categoryLabel: string | undefined;
  let treePath: string | undefined;
  let priority: number | undefined;
  const cleanLines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(TREE_CATEGORY_LABEL_MARKER)) {
      categoryLabel = trimmed.slice(TREE_CATEGORY_LABEL_MARKER.length).trim() || undefined;
      continue;
    }
    if (trimmed.startsWith(TREE_PATH_MARKER)) {
      treePath = trimmed.slice(TREE_PATH_MARKER.length).trim() || undefined;
      continue;
    }
    if (trimmed.startsWith(TREE_PRIORITY_MARKER)) {
      const n = Number(trimmed.slice(TREE_PRIORITY_MARKER.length).trim());
      if (Number.isFinite(n)) priority = Math.max(0, Math.trunc(n));
      continue;
    }
    cleanLines.push(line);
  }

  return {
    categoryLabel,
    treePath,
    priority,
    cleanDescription: cleanLines.join('\n').trim(),
  };
}

export function deriveDisplayPath(doc: EventMediaDTO): string {
  if (doc.hierarchyPath && String(doc.hierarchyPath).trim()) return String(doc.hierarchyPath).trim();
  const parsed = parseHierarchyDescription(doc.description);
  if (parsed.treePath) return parsed.treePath;
  return doc.title || 'Untitled';
}

