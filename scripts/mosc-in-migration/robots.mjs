/**
 * Minimal robots.txt parser for User-agent: * rules (path prefix disallow).
 * Not a full RFC-compliant implementation; sufficient for migration guardrails.
 */

/**
 * @param {string} robotsText
 * @returns {{ disallowPrefixes: string[] }}
 */
export function parseRobotsForAllUserAgents(robotsText) {
  const lines = robotsText.split(/\r?\n/);
  const disallowPrefixes = [];
  let inStarBlock = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const m = /^([A-Za-z0-9._-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();

    if (key === 'user-agent') {
      inStarBlock = value === '*';
      continue;
    }

    if (inStarBlock && key === 'disallow' && value) {
      disallowPrefixes.push(value);
    }
  }

  return { disallowPrefixes };
}

/**
 * @param {string} pathname e.g. /docs/file.pdf
 * @param {string[]} disallowPrefixes
 */
export function isPathDisallowedByRobots(pathname, disallowPrefixes) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const prefix of disallowPrefixes) {
    if (!prefix || prefix === '/') continue;
    if (normalized.startsWith(prefix)) return true;
  }
  return false;
}
