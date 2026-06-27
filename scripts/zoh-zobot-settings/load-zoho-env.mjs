#!/usr/bin/env node
/**
 * Load Zoho OAuth env vars from .env.local (mosc-temp or event-site-manager).
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Corporate proxies / SSL inspection: set ZOHO_INSECURE_TLS=1 in .env.local if fetch fails with certificate errors. */
function applyInsecureTlsIfConfigured() {
  const flag = process.env.ZOHO_INSECURE_TLS?.trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOSC_ROOT = path.resolve(__dirname, '../..');
const EVENT_SITE_MANAGER_ROOT = path.resolve(MOSC_ROOT, '../event-site-manager');

const DEFAULT_ENV_CANDIDATES = [
  path.join(MOSC_ROOT, '.env.local'),
  path.join(EVENT_SITE_MANAGER_ROOT, '.env.local'),
];

/**
 * @param {{ envFile?: string | null }} [options]
 */
export function loadZohoEnv(options = {}) {
  const explicit = options.envFile;
  if (explicit) {
    const resolved = path.resolve(explicit);
    if (!existsSync(resolved)) {
      throw new Error(`Env file not found: ${resolved}`);
    }
    config({ path: resolved, override: true });
    applyInsecureTlsIfConfigured();
    return resolved;
  }

  for (const candidate of DEFAULT_ENV_CANDIDATES) {
    if (existsSync(candidate)) {
      config({ path: candidate, override: true });
      applyInsecureTlsIfConfigured();
      return candidate;
    }
  }

  config({ path: path.join(MOSC_ROOT, '.env.local') });
  applyInsecureTlsIfConfigured();
  return null;
}

export function requireZohoCredentials() {
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Missing ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET in .env.local');
  }
  if (!refreshToken) {
    throw new Error(
      'Missing ZOHO_REFRESH_TOKEN. Visit https://www.event-site-manager.com/oauth/zoho/start to obtain one.',
    );
  }

  return { clientId, clientSecret, refreshToken };
}

export function getSalesIqConfig() {
  return {
    screenName: process.env.ZOHO_SALESIQ_SCREEN_NAME?.trim() || 'giventainc',
    apiBase: (process.env.ZOHO_SALESIQ_API_BASE || 'https://salesiq.zoho.com').replace(/\/$/, ''),
    accountsBase: (process.env.ZOHO_ACCOUNTS_BASE_URL || 'https://accounts.zoho.com').replace(/\/$/, ''),
  };
}
