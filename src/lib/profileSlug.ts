/**
 * URL-safe slug for profile writings (max 150 chars per DB).
 */
export function slugifyProfileTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base.slice(0, 150);
}

export function ensureProfileWritingSlug(
  title: string,
  existingSlug?: string | null
): string {
  const trimmed = existingSlug?.trim();
  if (trimmed) return trimmed.slice(0, 150);
  return slugifyProfileTitle(title);
}
