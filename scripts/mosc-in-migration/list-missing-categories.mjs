#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ensureRepoRoot, REPO_ROOT } from './lib/repo-root.mjs';

ensureRepoRoot();
config({ path: resolve(REPO_ROOT, '.env.local') });

const tenant = process.env.NEXT_PUBLIC_TENANT_ID || 'mosc_malankara_orthodox_2';
const manifest = JSON.parse(
  await readFile('scripts/mosc-in-migration/url-list.full-remapped.json', 'utf8'),
);
const slugs = [...new Set(manifest.items.map((i) => i.categorySlug))].sort();

const client = new pg.Client({
  host: process.env.MOSC_DB_HOST || 'localhost',
  database: process.env.MOSC_DB_NAME || 'event_site_manager_db',
  user: process.env.MOSC_DB_USER || 'postgres',
  password: process.env.MOSC_DB_PASSWORD || 'postgres',
  port: 5432,
});

await client.connect();
const res = await client.query(
  'SELECT slug FROM official_document_category WHERE tenant_id = $1',
  [tenant],
);
const existing = new Set(res.rows.map((x) => x.slug));
const missing = slugs.filter((s) => !existing.has(s));
console.log('Missing categories:', missing);
await client.end();
