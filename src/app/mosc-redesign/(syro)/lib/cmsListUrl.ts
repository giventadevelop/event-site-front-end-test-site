/** Build list hub URL with optional `q` / `page` (and extra preserve params). */
export function buildCmsListUrl(
  basePath: string,
  page: number,
  q?: string,
  extra?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value?.trim()) params.set(key, value.trim());
    }
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function redirectQsFromSearchParams(params: {
  q?: string;
  page?: string;
  diocese?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page && params.page !== '1') qs.set('page', params.page);
  if (params.diocese?.trim()) qs.set('diocese', params.diocese.trim());
  return qs.toString();
}
