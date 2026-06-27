#!/usr/bin/env node
/**
 * Optional pre-build route slimming for AWS Amplify (~220MB .next cap).
 *
 * Set in Amplify Console → Environment variables:
 *   AMPLIFY_ROUTE_SET=redesign-only  — drop src/app/mosc + src/app/mosc-old (keep mosc-redesign)
 *   AMPLIFY_ROUTE_SET=legacy-mosc    — drop src/app/mosc-redesign (keep mosc + mosc-old)
 *   (unset or "all")                 — build every app route (default)
 */
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const mode = (process.env.AMPLIFY_ROUTE_SET || 'all').trim().toLowerCase();

const routeSets = {
  all: [],
  'redesign-only': ['src/app/mosc', 'src/app/mosc-old'],
  'legacy-mosc': ['src/app/mosc-redesign'],
};

const toRemove = routeSets[mode];
if (!toRemove) {
  console.error(
    `[amplify-prepare] Unknown AMPLIFY_ROUTE_SET="${mode}". Use: all | redesign-only | legacy-mosc`,
  );
  process.exit(1);
}

if (mode === 'all') {
  console.log('[amplify-prepare] AMPLIFY_ROUTE_SET=all — building all app routes');
  process.exit(0);
}

console.log(`[amplify-prepare] AMPLIFY_ROUTE_SET=${mode} — removing unused route trees before next build:`);
for (const rel of toRemove) {
  const abs = join(process.cwd(), rel);
  if (!existsSync(abs)) {
    console.log(`  skip (not found): ${rel}`);
    continue;
  }
  rmSync(abs, { recursive: true, force: true });
  console.log(`  removed: ${rel}`);
}
