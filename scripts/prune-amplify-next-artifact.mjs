#!/usr/bin/env node
/**
 * Shrink .next deploy artifact for AWS Amplify SSR (~220MB cap).
 * Run after `npm run build` on Linux (Amplify CodeBuild).
 *
 * Amplify WEB_COMPUTE measures a bundled compute artifact (~55–60MB larger than raw
 * .next on disk). Use EFFECTIVE_LIMIT so build fails before the post-cache size check.
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_DIR = '.next';
const MAX_BYTES = 230_686_720; // Amplify documented limit (220 MiB)
/** Observed WEB_COMPUTE adapter overhead: bundle ≈ .next + ~58MB (job 10: 167MB → 224MB). */
const COMPUTE_OVERHEAD_BYTES = 58 * 1024 * 1024;
const EFFECTIVE_LIMIT = MAX_BYTES - COMPUTE_OVERHEAD_BYTES;

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
      if (entry.isSymbolicLink()) {
        // Count symlink target size — Amplify bundle dereferences symlinks.
        try {
          const st = statSync(full);
          if (st.isDirectory()) stack.push(full);
          else if (st.isFile()) total += st.size;
        } catch {
          // ignore broken symlinks
        }
      } else if (entry.isDirectory()) {
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

function duSizeBytes(root) {
  if (!existsSync(root)) return 0;
  try {
    const out = execSync(`du -sb ${root}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    const bytes = Number.parseInt(out.split(/\s+/)[0], 10);
    return Number.isFinite(bytes) ? bytes : dirSizeBytes(root);
  } catch {
    return dirSizeBytes(root);
  }
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

for (const dir of ['cache', 'types', 'dev', 'trace', 'diagnostics']) {
  rmrf(join(NEXT_DIR, dir));
}

runFindDelete(`-name '*.map'`);

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

const standaloneDir = join(NEXT_DIR, 'standalone');
if (existsSync(standaloneDir)) {
  const stBytes = dirSizeBytes(standaloneDir);
  console.log(
    `[prune-amplify] Removing .next/standalone (${(stBytes / 1024 / 1024).toFixed(1)} MB) — not used by Amplify Hosting SSR`,
  );
  rmrf(standaloneDir);
}

const nextNodeModules = join(NEXT_DIR, 'node_modules');
if (existsSync(nextNodeModules)) {
  const nmBytes = dirSizeBytes(nextNodeModules);
  console.log(
    `[prune-amplify] Removing .next/node_modules (${(nmBytes / 1024 / 1024).toFixed(1)} MB) — not required for Amplify webpack deploy`,
  );
  rmrf(nextNodeModules);
}

logTopLevelSizes();

const total = duSizeBytes(NEXT_DIR);
const totalMb = (total / 1024 / 1024).toFixed(1);
const limitMb = (MAX_BYTES / 1024 / 1024).toFixed(1);
const effectiveMb = (EFFECTIVE_LIMIT / 1024 / 1024).toFixed(1);
const estimatedBundle = total + COMPUTE_OVERHEAD_BYTES;
const estimatedBundleMb = (estimatedBundle / 1024 / 1024).toFixed(1);

console.log(
  `[prune-amplify] Total .next size: ${totalMb} MB (Amplify limit ~${limitMb} MB; effective .next cap ~${effectiveMb} MB with WEB_COMPUTE overhead)`,
);
console.log(`[prune-amplify] Estimated WEB_COMPUTE bundle: ~${estimatedBundleMb} MB`);

if (total > EFFECTIVE_LIMIT) {
  logDirSizes(join(NEXT_DIR, 'server', 'app'), 'Largest .next/server/app segments (deploy bloat)');
  console.error(
    `[prune-amplify] ERROR: .next (${totalMb} MB) exceeds effective cap (~${effectiveMb} MB); estimated bundle ~${estimatedBundleMb} MB > ${limitMb} MB`,
  );
  console.error(
    '[prune-amplify] Tip: set AMPLIFY_ROUTE_SET=redesign-only (default in amplify.yml) or legacy-mosc to omit unused route trees.',
  );
  process.exit(1);
}

if (estimatedBundle > MAX_BYTES) {
  console.error(
    `[prune-amplify] ERROR: Estimated WEB_COMPUTE bundle (~${estimatedBundleMb} MB) exceeds Amplify limit (~${limitMb} MB)`,
  );
  process.exit(1);
}

console.log('[prune-amplify] Prune complete — within Amplify size limit');
