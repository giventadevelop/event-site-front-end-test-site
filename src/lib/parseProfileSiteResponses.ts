/**
 * Normalize Spring HAL / content / array responses for profile site resources.
 */
export function parseProfileSiteListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    const embedded = obj._embedded as Record<string, unknown> | undefined;
    if (embedded) {
      const firstKey = Object.keys(embedded)[0];
      if (firstKey && Array.isArray(embedded[firstKey])) {
        return embedded[firstKey] as T[];
      }
    }
  }
  return [];
}
