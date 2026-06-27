#!/usr/bin/env node
/**
 * Exchange a one-time Zoho authorization code for refresh_token (CLI fallback).
 *
 * Use when the browser callback hit production without secrets, or the code page expired.
 * Copy the full callback URL or just the code= value from the address bar.
 *
 * Usage:
 *   npm run zobot:exchange-zoho-code -- --code "1000.xxxx..."
 *   npm run zobot:exchange-zoho-code -- --redirect-uri "http://localhost:3000/oauth/zoho/callback" --code "1000...."
 */

import { loadZohoEnv } from './load-zoho-env.mjs';

function parseArgs(argv) {
  const out = { envFile: null, code: '', redirectUri: process.env.ZOHO_OAUTH_REDIRECT_URI || '', help: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env-file' && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === '--code' && argv[i + 1]) out.code = argv[++i];
    else if (arg === '--redirect-uri' && argv[i + 1]) out.redirectUri = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  if (!out.code && argv[2] && !argv[2].startsWith('-')) {
    const maybeUrl = argv[2];
    if (maybeUrl.includes('code=')) {
      try {
        out.code = new URL(maybeUrl).searchParams.get('code') || '';
      } catch {
        /* ignore */
      }
    }
  }
  return out;
}

async function exchangeCode(code, redirectUri, clientId, clientSecret, accountsBase) {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${accountsBase}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.code) {
    console.log(`Exchange Zoho OAuth code for tokens

  npm run zobot:exchange-zoho-code -- --code "1000...."
  npm run zobot:exchange-zoho-code -- --redirect-uri "http://localhost:3000/oauth/zoho/callback" --code "1000...."

The redirect-uri must match exactly what was used in /oauth/zoho/start (check Zoho API Console).
`);
    process.exit(args.help ? 0 : 1);
  }

  const envPath = loadZohoEnv({ envFile: args.envFile });
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const accountsBase = (process.env.ZOHO_ACCOUNTS_BASE_URL || 'https://accounts.zoho.com').replace(/\/$/, '');

  if (!clientId || !clientSecret) {
    console.error('Missing ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  const redirectUri =
    args.redirectUri ||
    'http://localhost:3000/oauth/zoho/callback';

  if (envPath) console.log(`Env: ${envPath}`);
  console.log(`Redirect URI: ${redirectUri}`);
  console.log('Exchanging code…');

  try {
    const data = await exchangeCode(args.code, redirectUri, clientId, clientSecret, accountsBase);
    if (!data.refresh_token) {
      console.error('No refresh_token in response. Revoke app in Zoho and re-authorize with offline access.');
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    console.log('\nAdd to .env.local:\n');
    console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`);
    if (data.access_token) {
      console.log(`\n(access_token expires in ${data.expires_in ?? '?'}s — scripts use refresh_token)`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error(
      '\nIf "invalid code", the code was already used or expired — visit http://localhost:3000/oauth/zoho/start again.',
    );
    console.error('If "redirect uri mismatch", pass --redirect-uri matching the URI used when Zoho showed the consent screen.');
    process.exit(1);
  }
}

main();
