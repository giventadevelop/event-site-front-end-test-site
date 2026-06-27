/**
 * Shared Strapi 4/5 media URL and alt extraction for directory portal.
 * Used by bishops, dioceses, parishes, priests, and directory-entries fetchers.
 *
 * Handles: url at root, data.url, data.attributes.url, attributes.url,
 * formats.thumbnail (at root or inside data.attributes).
 * Fallback: recursively find any string that looks like /uploads/... in the object.
 */

/** Recursively find first string value that looks like an upload path. */
function findUploadPathInObject(obj: unknown): string | null {
  if (obj == null) return null;
  if (typeof obj === 'string') {
    if (obj.startsWith('/uploads/') || obj.includes('/uploads/')) return obj;
    return null;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findUploadPathInObject(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      const found = findUploadPathInObject(value);
      if (found) return found;
    }
  }
  return null;
}

export function getMediaUrl(media: unknown, baseUrl: string): string | null {
  if (!media || !baseUrl) return null;
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) {
    m = media[0] as Record<string, unknown>;
  }
  let url: string | undefined = m?.url as string | undefined;
  if (!url) {
    const data = m?.data as Record<string, unknown> | undefined;
    url = data?.url as string | undefined;
  }
  if (!url) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url) {
    const attrs = m?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url && m?.formats) {
    const formats = m.formats as Record<string, { url?: string }>;
    url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
  }
  if (!url) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    const formats = attrs?.formats as Record<string, { url?: string }> | undefined;
    if (formats) {
      url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
    }
  }
  if (!url) {
    const found = findUploadPathInObject(media);
    if (found && typeof found === 'string') url = found;
  }
  if (!url || typeof url !== 'string') return null;
  return url.startsWith('http') ? url : `${baseUrl}${url}`;
}

export function getMediaAlt(media: unknown): string | undefined {
  if (!media) return undefined;
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) {
    m = media[0] as Record<string, unknown>;
  }
  let alt = m?.alternativeText as string | undefined;
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    alt = data?.alternativeText as string | undefined;
  }
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    alt = attrs?.alternativeText as string | undefined;
  }
  if (!alt) {
    const attrs = m?.attributes as Record<string, unknown> | undefined;
    alt = attrs?.alternativeText as string | undefined;
  }
  return alt;
}
