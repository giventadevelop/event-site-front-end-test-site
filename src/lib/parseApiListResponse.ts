/**
 * Normalize list responses from JHipster/Spring Data REST or plain arrays.
 */
export function parseApiListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as T[];
    const embedded = o._embedded as Record<string, unknown> | undefined;
    if (embedded) {
      const first = Object.values(embedded).find((v) => Array.isArray(v));
      if (Array.isArray(first)) return first as T[];
    }
  }
  return [];
}
