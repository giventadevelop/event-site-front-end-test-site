#!/usr/bin/env node
/**
 * Shrink .next deploy artifact for AWS Amplify SSR (~220MB cap).
 * Run after `npm run build` on Linux (Amplify CodeBuild).
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_DIR = '.next';
const MAX_BYTES = 230_686_720; // Amplify documented limit

function rmrf(target) {
  try {
    rmSync(target, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

function dirSizeBytes(root) {
  if (!existsSync(root)) return 0;
  let total = 0;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        try {
          total += statSync(full).size;
        } catch {
          // ignore
        }
      }
    }
  }
  return total;
}

function logDirSizes(root, label, limit = 12) {
  if (!existsSync(root)) return;
  const rows = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    try {
      if (statSync(full).isDirectory()) {
        rows.push({ name, bytes: dirSizeBytes(full) });
      }
    } catch {
      // ignore
    }
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  console.log(`[prune-amplify] ${label}:`);
  for (const row of rows.slice(0, limit)) {
    console.log(`  ${(row.bytes / 1024 / 1024).toFixed(1)} MB\t${row.name}/`);
  }
}

function logTopLevelSizes() {
  if (!existsSync(NEXT_DIR)) {
    console.warn('[prune-amplify] .next not found');
    return;
  }
  logDirSizes(NEXT_DIR, 'Top-level .next sizes');
}

function runFindDelete(pattern) {
  try {
    execSync(`find ${NEXT_DIR} ${pattern} -delete`, { stdio: 'pipe' });
  } catch {
    // no matches
  }
}

console.log('[prune-amplify] Pruning build artifact...');

// Already removed in amplify.yml; safe to repeat
for (const dir of ['cache', 'types', 'dev', 'trace', 'diagnostics']) {
  rmrf(join(NEXT_DIR, dir));
}

// Source maps are not needed in production on Amplify compute
runFindDelete(`-name '*.map'`);

// Build-time / wrong-platform native binaries (AWS SSR troubleshooting)
const pathPatterns = [
  "*/node_modules/@swc/core-linux-x64-gnu/*",
  "*/node_modules/@swc/core-linux-x64-musl/*",
  "*/node_modules/@esbuild/linux-x64/*",
  "*/node_modules/@esbuild/linux-arm64/*",
  "*/node_modules/@swc/core-darwin-*/*",
  "*/node_modules/@swc/core-win32-*/*",
  "*/node_modules/esbuild-darwin-*/*",
  "*/node_modules/esbuild-windows-*/*",
  "*/node_modules/esbuild-freebsd-*/*",
  "*/node_modules/esbuild-netbsd-*/*",
  "*/node_modules/esbuild-openbsd-*/*",
  "*/node_modules/esbuild-sunos-*/*",
  "*/node_modules/esbuild-android-*/*",
];

for (const pattern of pathPatterns) {
  runFindDelete(`-path '${pattern}'`);
}

// Amplify Hosting SSR bundles from the default .next/server traced layout, NOT .next/standalone
// (standalone is only for `node .next/standalone/server.js` self-hosting). When a deployed branch
// still sets output: 'standalone', this tree is pure deploy bloat (often 150MB+) — strip it.
const standaloneDir = join(NEXT_DIR, 'standalone');
if (existsSync(standaloneDir)) {
  const stBytes = dirSizeBytes(standaloneDir);
  console.log(
    `[prune-amplify] Removing .next/standalone (${(stBytes / 1024 / 1024).toFixed(1)} MB) — not used by Amplify Hosting SSR (default .next/server layout)`,
  );
  rmrf(standaloneDir);
}

// Next 16 may leave hashed symlinks under .next/node_modules (Turbopack / external packages).
// Amplify bundles from traced server files; drop this tree if present (webpack SSR uses root node_modules at runtime).
const nextNodeModules = join(NEXT_DIR, 'node_modules');
if (existsSync(nextNodeModules)) {
  const nmBytes = dirSizeBytes(nextNodeModules);
  console.log(
    `[prune-amplify] Removing .next/node_modules (${(nmBytes / 1024 / 1024).toFixed(1)} MB) — not required for Amplify webpack deploy`,
  );
  rmrf(nextNodeModules);
}

logTopLevelSizes();

const total = dirSizeBytes(NEXT_DIR);
const totalMb = (total / 1024 / 1024).toFixed(1);
const limitMb = (MAX_BYTES / 1024 / 1024).toFixed(1);
console.log(`[prune-amplify] Total .next size: ${totalMb} MB (Amplify limit ~${limitMb} MB)`);

if (total > MAX_BYTES) {
  logDirSizes(join(NEXT_DIR, 'server', 'app'), 'Largest .next/server/app segments (deploy bloat)');
  console.error(
    `[prune-amplify] ERROR: .next still exceeds Amplify limit by ${((total - MAX_BYTES) / 1024 / 1024).toFixed(1)} MB`,
  );
  console.error(
    '[prune-amplify] Tip: set AMPLIFY_ROUTE_SET=redesign-only in Amplify env to omit mosc + mosc-old from the build.',
  );
  process.exit(1);
}

console.log('[prune-amplify] Prune complete — within Amplify size limit');
