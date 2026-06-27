/**
 * Resolves the app base URL for admin Playwright suites.
 *
 * Priority (first wins):
 *   1. CLI: --base-url=https://host:port  or  --port=3001  → http://localhost:3001
 *   2. Env (full URL): TEST_BASE_URL, PLAYWRIGHT_BASE_URL, ADMIN_TEST_BASE_URL
 *   3. Env (port only): TEST_PORT, then PORT  → http://localhost:<port>
 *   4. auth.json value passed in (caller)
 *
 * Examples:
 *   npm run test:admin -- --port=3001
 *   npm run test:admin:all -- --base-url=http://127.0.0.1:3001
 *   PowerShell: $env:TEST_PORT='3001'; npm run test:admin
 *   PowerShell: $env:TEST_BASE_URL='http://localhost:3001'; npm run test:admin:dynamic
 */

function stripTrailingSlash(url) {
  if (!url || typeof url !== 'string') return url;
  const t = url.trim().replace(/\/+$/, '');
  return t || url.trim();
}

function parseArgvOverride() {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--base-url=')) {
      const u = stripTrailingSlash(arg.slice('--base-url='.length));
      if (u) return u;
    }
    if (arg.startsWith('--port=')) {
      const p = arg.slice('--port='.length).trim();
      if (/^\d{1,5}$/.test(p)) return `http://localhost:${p}`;
    }
  }
  return null;
}

/**
 * @param {string | undefined} authJsonBaseUrl - baseUrl from auth.json (optional)
 * @returns {string | null} Resolved URL or null to use caller default
 */
export function resolveAdminTestBaseUrl(authJsonBaseUrl) {
  const fromArg = parseArgvOverride();
  if (fromArg) return fromArg;

  const full =
    process.env.TEST_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.ADMIN_TEST_BASE_URL?.trim();
  if (full) return stripTrailingSlash(full);

  const portRaw = process.env.TEST_PORT?.trim() || process.env.PORT?.trim();
  if (portRaw && /^\d{1,5}$/.test(portRaw)) {
    return `http://localhost:${portRaw}`;
  }

  if (authJsonBaseUrl && String(authJsonBaseUrl).trim()) {
    return stripTrailingSlash(String(authJsonBaseUrl).trim());
  }

  return null;
}
