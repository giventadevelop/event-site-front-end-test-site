#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(__dirname, 'url-list.ma-2022-2027-fix.json'), 'utf8')
);
const manifestPaths = new Set(manifest.items.map((i) => i.hierarchyPath));

const sql = `SELECT id, title, hierarchy_path, split_part(file_url, '/', array_length(string_to_array(file_url, '/'), 1)) as s3file FROM event_media WHERE hierarchy_category_label = 'Malankara Association (2022 - 2027)' AND tenant_id = 'mosc_malankara_orthodox_2' ORDER BY hierarchy_path`;
const raw = execSync(
  `docker exec event_site_manager_db-postgresql-1 psql -U event_site_admin -d event_site_manager_db -t -A -F "|" -c "${sql}"`,
  { encoding: 'utf8' }
);

const rows = raw
  .trim()
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [id, title, hierarchy_path, s3file] = line.split('|');
    return { id: Number(id), title, hierarchy_path, s3file };
  });

const extra = rows.filter((r) => !manifestPaths.has(r.hierarchy_path));
const missing = [...manifestPaths].filter((p) => !rows.some((r) => r.hierarchy_path === p));

console.log('DB rows:', rows.length, 'manifest paths:', manifestPaths.size);
console.log('\nExtra in DB (not in manifest):', extra.length);
extra.forEach((r) => console.log(`  id=${r.id} path=${r.hierarchy_path} title=${r.title}`));

console.log('\nMissing from DB:', missing.length);
missing.forEach((p) => console.log(`  ${p}`));

// Verify key mappings
const checks = [
  ['Ahmedabad', 'Ahmedabad-3'],
  ['Ahmedabad (2)', 'Ahmedabad_'],
  ['Madras', 'Madras-3'],
  ['Madras (2)', 'Madras_'],
  ['Notification', 'Vinjapanam'],
];
console.log('\nSample file checks:');
for (const [title, expect] of checks) {
  const row = rows.find((r) => r.title === title);
  const ok = row?.s3file?.includes(expect);
  console.log(`  ${title}: ${row?.s3file || 'MISSING'} ${ok ? 'OK' : 'CHECK'}`);
}
