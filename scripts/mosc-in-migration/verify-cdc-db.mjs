#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(__dirname, 'url-list.cdc-fix.json'), 'utf8')
);
const manifestPaths = new Set(manifest.items.map((i) => i.hierarchyPath));

const sql = `SELECT id, title, hierarchy_path, hierarchy_category_label, official_document_year FROM event_media WHERE official_document_category_id = 71 AND tenant_id = 'mosc_malankara_orthodox_2' ORDER BY display_priority NULLS LAST, id`;
const raw = execSync(
  `docker exec event_site_manager_db-postgresql-1 psql -U event_site_admin -d event_site_manager_db -t -A -F "|" -c "${sql}"`,
  { encoding: 'utf8' }
);

const rows = raw
  .trim()
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [id, title, hierarchy_path, hierarchy_category_label, official_document_year] =
      line.split('|');
    return {
      id: Number(id),
      title,
      hierarchy_path,
      hierarchy_category_label,
      official_document_year: Number(official_document_year),
    };
  });

const extra = rows.filter((r) => !manifestPaths.has(r.hierarchy_path));
const missing = [...manifestPaths].filter((p) => !rows.some((r) => r.hierarchy_path === p));

console.log('DB rows:', rows.length, 'expected:', manifestPaths.size);
rows.forEach((r) =>
  console.log(
    `  id=${r.id} year=${r.official_document_year} label=${r.hierarchy_category_label} path=${r.hierarchy_path}`
  )
);
console.log('\nExtra rows:', extra.length);
extra.forEach((r) => console.log(`  id=${r.id} ${r.hierarchy_path}`));
console.log('\nMissing paths:', missing.length);
missing.forEach((p) => console.log(`  ${p}`));
