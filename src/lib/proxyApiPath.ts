/**
 * Same-origin paths for browser → Next.js `/api/proxy/*` calls.
 * See `.cursor/rules/nextjs_api_routes.mdc` — do not use getAppUrl() in the client for proxy routes.
 */
export function proxyApiPath(path: string): string {
  if (!path.startsWith('/api/proxy/')) {
    throw new Error(`proxyApiPath: expected path starting with /api/proxy/, got "${path}"`);
  }
  return path;
}
