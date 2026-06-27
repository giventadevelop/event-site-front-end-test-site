/**
 * Normalizes Strapi Content API records for v4 (attributes wrapper) and v5 (flattened) shapes.
 */

export function unwrapStrapiRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const attrs = raw.attributes;
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return { ...raw, ...(attrs as Record<string, unknown>) };
  }
  return raw;
}

/** Unwraps a relation that may be nested under `data` (Strapi 4/5). */
export function unwrapStrapiRelation(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return unwrapStrapiRecord(data as Record<string, unknown>);
  }
  return unwrapStrapiRecord(record);
}

export function normalizeStrapiSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function findByStrapiSlug<T extends { slug?: string | null }>(
  items: T[],
  slug: string
): T | undefined {
  const target = normalizeStrapiSlug(slug);
  return items.find((item) => item.slug && normalizeStrapiSlug(item.slug) === target);
}
