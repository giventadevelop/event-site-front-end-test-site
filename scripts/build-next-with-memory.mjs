#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nextBin = resolve(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const parsedHeapMb = Number.parseInt(process.env.NEXT_BUILD_HEAP_MB || '8192', 10);
const heapMb = Number.isFinite(parsedHeapMb) && parsedHeapMb > 0 ? parsedHeapMb : 8192;

// Keep local builds from spawning multiple memory-heavy page-data workers.
const buildWorkers = process.env.NEXT_BUILD_WORKERS || '1';

/**
 * `--use-system-ca` landed in Node 23.8.0. Amplify Hosting uses Node 20
 * (`nvm use 20`), which rejects the flag with "bad option" / exit 9.
 * Only enable it when the runtime supports it, or when forced via env.
 */
function supportsUseSystemCa() {
  const [major, minor] = process.versions.node.split('.').map((n) => Number.parseInt(n, 10));
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return false;
  return major > 23 || (major === 23 && minor >= 8);
}

const forceSystemCa = process.env.NEXT_BUILD_USE_SYSTEM_CA === 'true';
const disableSystemCa = process.env.NEXT_BUILD_USE_SYSTEM_CA === 'false';
const useSystemCa = !disableSystemCa && (forceSystemCa || supportsUseSystemCa());

console.log(
  `[build] Running next build with Node heap ${heapMb}MB, NEXT_BUILD_WORKERS=${buildWorkers}, system CA=${useSystemCa} (node ${process.versions.node})`
);

const nodeArgs = [];
if (useSystemCa) {
  nodeArgs.push('--use-system-ca');
}
nodeArgs.push(`--max-old-space-size=${heapMb}`, nextBin, 'build', '--webpack');

const result = spawnSync(
  process.execPath,
  nodeArgs,
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_BUILD_WORKERS: buildWorkers,
    },
  }
);

if (result.error) {
  console.error('[build] Failed to start next build:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
