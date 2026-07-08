import type { ProfileWritingDTO } from '@/types/profileSite';

/**
 * Internal detail URL for on-site writings (not external links).
 */
export function getProfileWritingDetailPath(writing: ProfileWritingDTO): string | null {
  if (writing.slug?.trim()) {
    return `/writings/${encodeURIComponent(writing.slug.trim())}`;
  }
  if (writing.id != null && writing.writingType !== 'EXTERNAL_LINK') {
    return `/writings/id/${writing.id}`;
  }
  if (writing.id != null && writing.writingType === 'EXTERNAL_LINK') {
    return `/writings/id/${writing.id}`;
  }
  return null;
}

export function formatProfileDate(dateStr?: string | null): string | null {
  if (!dateStr?.trim()) return null;
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
