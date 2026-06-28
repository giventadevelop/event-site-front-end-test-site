#!/usr/bin/env node
/** Insert manifest categories that are not yet in official_document_category. */
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ensureRepoRoot, REPO_ROOT } from './lib/repo-root.mjs';

ensureRepoRoot();
config({ path: resolve(REPO_ROOT, '.env.local') });

const tenant = process.env.MOSC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || 'mosc_malankara_orthodox_2';
const manifest = JSON.parse(
  await readFile('scripts/mosc-in-migration/url-list.full-remapped.json', 'utf8'),
);

const bySlug = new Map();
for (const item of manifest.items) {
  if (!bySlug.has(item.categorySlug)) {
    bySlug.set(item.categorySlug, item.displayName || item.categorySlug);
  }
}

const client = new pg.Client({
  host: process.env.MOSC_DB_HOST || 'localhost',
  database: process.env.MOSC_DB_NAME || 'event_site_manager_db',
  user: process.env.MOSC_DB_USER || 'postgres',
  password: process.env.MOSC_DB_PASSWORD || 'postgres',
  port: 5432,
});

await client.connect();

const existing = await client.query(
  'SELECT slug FROM official_document_category WHERE tenant_id = $1',
  [tenant],
);
const have = new Set(existing.rows.map((r) => r.slug));

let sortOrder = 900;
for (const [slug, displayName] of bySlug.entries()) {
  if (have.has(slug)) continue;
  sortOrder += 10;
  await client.query(
    `INSERT INTO public.official_document_category
      (id, tenant_id, slug, display_name, description, sort_order, is_active, created_at, updated_at)
     VALUES (nextval('public.sequence_generator'::regclass), $1, $2, $3, $4, $5, true, now(), now())
     ON CONFLICT (tenant_id, slug) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()`,
    [tenant, slug, displayName, 'Auto-seeded from full manifest', sortOrder],
  );
  console.log(`Seeded category: ${slug}`);
}

await client.end();
console.log('Done seeding manifest categories.');
